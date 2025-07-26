import sql from '@/app/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Incorrect method' }), { status: 500 });
    }

    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
        return new Response(JSON.stringify({ error: 'Missing fields'}), { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    try {
        await sql`
            INSERT INTO users (name, email, password)
            VALUES (${username}, ${email}, ${hashed})
        `;
        return new Response(JSON.stringify({ message: 'User Created' }));
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return new Response(JSON.stringify({ error: 'User already exists' }), { status: 409 });
        }
        return new Response(JSON.stringify({ error: 'Error creating user' }), { status: 500 });
    }
}