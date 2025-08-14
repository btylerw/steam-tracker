import sql from "./db";

export async function findUserBySteamId(steamId) {
    const result = await sql`
        SELECT * from users WHERE steam_id = ${steamId} LIMIT 1;
    `;
    return result[0] || null;
}

export async function createUser({ steamId, displayName, avatarUrl, profileUrl }) {
    const result = await sql`
        INSERT INTO USERS (steam_id, display_name, avatar_url, profile_url)
        VALUES (${steamId}, ${displayName}, ${avatarUrl}, ${profileUrl})
        RETURNING *;
    `;
    return result[0];
}

export async function updateSync(userid, force) {
    if (force === 'true') {
        await sql`
            UPDATE users SET last_synced = ${new Date()}, last_forced_sync = ${new Date()} WHERE id = ${userid};
        `;
    } else {
        await sql`
            UPDATE users SET last_synced = ${new Date()} WHERE id = ${userid};
        `;
    }
}