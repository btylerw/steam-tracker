import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
    const token = req.cookies.get('token')?.value;
    if (!token) {
        return new Response(JSON.stringify({ error: 'No token' }), {
            status: 401
        });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        return new Response(JSON.stringify({ steamid: payload.steamid }), { status: 200 });
    } catch(err) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }
}