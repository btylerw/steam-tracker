import 'dotenv/config';
import sql from '../lib/db.js';

async function seed() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                steam_id TEXT UNIQUE,
                display_name TEXT,
                avatar_url TEXT,
                created_at TIMESTAMP DEFAULT now(),
                last_synced TIMESTAMP
            );`

        await sql`
            CREATE TABLE IF NOT EXISTS games (
                appid INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                image_url TEXT
            );`

        await sql`
            CREATE TABLE IF NOT EXISTS user_library (
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                appid INTEGER REFERENCES games(appid) ON DELETE CASCADE,
                playtime_minutes INTEGER DEFAULT 0,
                owned BOOLEAN DEFAULT TRUE,
                PRIMARY KEY (user_id, appid)
            );`

        await sql`
            CREATE TABLE IF NOT EXISTS backlog_entries (
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                appid INTEGER REFERENCES games(appid) ON DELETE CASCADE,
                playtime_minutes INTEGER DEFAULT 0,
                avg_completion_minutes INTEGER,
                status TEXT DEFAULT 'Unplayed',
                PRIMARY KEY (user_id, appid)
            );`

        await sql`
            INSERT INTO USERS (name, email) VALUES
            ('Alice', 'alice@example.com'),
            ('Bob', 'bob@example.com')
            ON CONFLICT (email) DO NOTHING
        `
    
        console.log('Seed completed!');
    } catch (err) {
        console.error(`Seed failed with error: ${err}`);
    }
}

seed();