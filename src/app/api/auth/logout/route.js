export async function GET() {
    return new Response(null, {
        status: 302,
        headers: {
            'Set-Cookie': `token=deleted; Path=/; Max-Age=0`,
            Location: '/',
        }
    });
}