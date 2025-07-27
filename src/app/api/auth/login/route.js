import sql from '@/app/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Incorrect method' }), { status: 500 });
    }

    const body = await request.json();
    const { username, password } = body;
    if (!username, !password) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    try {
        const invalidLoginInfo = new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        const user = await sql`
            SELECT password FROM users WHERE name = ${username}
        `;

        if (user.length === 0) {
            return invalidLoginInfo;
        }
        
        const hashedPassword = user[0].password;
        const match = await bcrypt.compare(password, hashedPassword);
        if (!match) {
            return invalidLoginInfo;
        }
        return new Response(JSON.stringify({ message: 'Login successful' }), { status: 200 });
    } catch (err) {
        console.error('Login error:', err);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
}
