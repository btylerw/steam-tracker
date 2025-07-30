import sql from "./db";

export async function saveUserGames(userid, games) {
    for (const game of games) {
        const { appid, name, image_url, avg_completion_minutes, playtime_minutes } = game;

        const avg_completion = avg_completion_minutes * 60;
        await sql`
            INSERT INTO games (appid, name, image_url, avg_completion_minutes)
            VALUES (${appid}, ${name}, ${image_url}, ${avg_completion})
            ON CONFLICT (appid) DO NOTHING;
        `;

        await sql`
            INSERT INTO user_library (user_id, appid, playtime_minutes)
            VALUES (${userid}, ${appid}, ${playtime_minutes})
            ON CONFLICT (user_id, appid) DO UPDATE SET playtime_minutes = EXCLUDED.playtime_minutes;
        `;

        if (playtime_minutes < avg_completion * 0.5) {
            const status = playtime_minutes === 0 ? 'not played' : 'playing';
            await sql`
                INSERT INTO backlog_entries (user_id, appid, status)
                VALUES (${userid}, ${appid}, ${status})
                ON CONFLICT (user_id, appid) DO UPDATE SET status = EXCLUDED.status;
            `;
        }
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
            b.status
        FROM user_library ul
        JOIN games g ON ul.appid = g.appid
        JOIN backlog_entries b ON ul.appid = b.appid AND ul.user_id = b.user_id
        WHERE ul.user_id = ${userid};
    `;
    return data;
}