import 'dotenv/config';
import sql from '../lib/db.js';

async function seed() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE
            )
        `
    
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