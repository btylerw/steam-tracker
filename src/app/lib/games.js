import sql from "./db";

export async function saveUserGames(userid, games) {
    games.forEach(g => {
    if (typeof g.appid !== 'number' || isNaN(g.appid)) {
        console.log('Invalid appid:', g.appid, typeof g.appid);
    }
    });

    const gameValues = games.map(g => [Number(g.appid), g.name, g.image_url, Number(g.avg_completion_minutes)]);
    await sql`
    INSERT INTO games (appid, name, image_url, avg_completion_minutes)
    SELECT  
        appid::int,
        name::text,
        image_url::text,
        avg_completion_minutes::int
    FROM (
        VALUES ${sql(gameValues)}
        ) AS t(appid, name, image_url, avg_completion_minutes)
        ON CONFLICT (appid) DO NOTHING;
        `;
        
    const libraryValues = games.map(g => [Number(userid), Number(g.appid), Number(g.playtime_minutes)]);
    await sql`
    INSERT INTO user_library (user_id, appid, playtime_minutes)
    SELECT
        user_id::int,
        appid::int,
        playtime_minutes::int
    FROM (
        VALUES ${sql(libraryValues)}
    ) AS t(user_id, appid, playtime_minutes)
    ON CONFLICT (user_id, appid) DO UPDATE SET playtime_minutes = EXCLUDED.playtime_minutes;
    `;

    const backlogEntries = games.filter(g => g.avg_completion_minutes != null && g.playtime_minutes < g.avg_completion_minutes * 0.75)
    .map(g => ({
        appid: g.appid,
        playtime_minutes: g.playtime_minutes,
        status: g.playtime_minutes === 0 ? 'not played' : 'playing',
    }));

    if (backlogEntries.length > 0) {
        const backlogValues = backlogEntries.map(g => [Number(userid), Number(g.appid), Number(g.playtime_minutes), g.status]);
        await sql`
        INSERT INTO backlog_entries (user_id, appid, playtime_minutes, status)
        SELECT
            t.user_id::int,
            t.appid::int,
            t.playtime_minutes::int,
            t.status::text
        FROM (
            VALUES ${sql(backlogValues)}
        ) as t(user_id, appid, playtime_minutes, status)
        JOIN user_library ul
            ON ul.user_id = t.user_id::int
            AND ul.appid = t.appid::int
        WHERE ul.removed_from_backlog = false
        ON CONFLICT (user_id, appid) DO UPDATE SET status = EXCLUDED.status, 
            playtime_minutes = CASE
                WHEN backlog_entries.reset_playthrough = false
                THEN EXCLUDED.playtime_minutes
                ELSE backlog_entries.playtime_minutes
            END
        `;
    }
}

export async function getAllUserGames(userid) {
    const data = await sql`
        SELECT
            g.appid,
            g.name,
            g.image_url,
            g.avg_completion_minutes,
            ul.playtime_minutes
        FROM user_library ul
        JOIN games g ON ul.appid = g.appid
        WHERE ul.user_id = ${userid};
    `;
    return data;
}

export async function getUserBacklog(userid) {
    const data = await sql`
        SELECT
            g.appid,
            g.name,
            g.image_url,
            g.avg_completion_minutes,
            ul.playtime_minutes,
            b.status,
            b.playtime_minutes AS time_in_backlog
        FROM user_library ul
        JOIN games g ON ul.appid = g.appid
        JOIN backlog_entries b ON ul.appid = b.appid AND ul.user_id = b.user_id
        WHERE ul.user_id = ${userid};
    `;
    return data;
}

export async function getAllGames() {
    const data = await sql`
        SELECT * FROM games;
    `;
    return data;
}

export async function removeFromBacklog(userid, gameIds) {
    if (gameIds.length === 0) {
        return;
    }
    await sql`
        DELETE FROM backlog_entries
        WHERE user_id = ${userid}
        AND appid = ANY(${gameIds});
    `;

    await sql`
        UPDATE user_library
        SET removed_from_backlog = true
        WHERE user_id = ${userid}
        AND appid = ANY(${gameIds});
    `;
}

export async function addToBacklog(userid, gameIds) {
    if (gameIds.length === 0) {
        return;
    }
    const status = 'not played';
    const backlogValues = gameIds.map(id => [Number(userid), Number(id), status]);
    await sql`
        INSERT INTO backlog_entries (user_id, appid, status, reset_playthrough)
        SELECT
            user_id::int,
            appid::int,
            status::text,
            true
        FROM (
            VALUES ${sql(backlogValues)}
        ) as t(user_id, appid, status)
        ON CONFLICT (user_id, appid) DO UPDATE SET status = EXCLUDED.status;
    `;

    await sql`
        UPDATE user_library
        SET removed_from_backlog = false
        WHERE user_id = ${userid}
        AND appid = ANY(${gameIds});
    `;
}

export async function updateBacklogProgress(userid, games) {
    if (!games?.length) return;
    const tuples = games.map(({ appid, playtimeDiff }) => [userid, appid, playtimeDiff]);

    await sql`
        UPDATE backlog_entries AS b
        SET playtime_minutes = b.playtime_minutes + v.playtimeDiff::int
        FROM (VALUES ${sql(tuples)}) AS v(user_id, appid, playtimeDiff)
        WHERE b.user_id = v.user_id::int
        AND b.appid = v.appid::int
        AND v.playtimeDiff::int <> 0;
    `;
}

export async function resetBacklogPlaythrough(userId, gameId) {
    if (!userId || !gameId) return;
    await sql`
        UPDATE backlog_entries
        SET playtime_minutes = 0, reset_playthrough = true
        WHERE user_id = ${userId}
        AND appid = ${gameId}
    `;
}