import { removeFromBacklog } from "@/app/lib/games";

export async function POST(req) {
    try {
        const body = await req.json();
        const { userId, gameIds } = body;

        if (!userId || !Array.isArray(gameIds) || gameIds.length === 0) {
            return new Response(JSON.stringify({ error: 'Invalid Input'}), { status: 400 });
        }

        await removeFromBacklog(userId, gameIds);
        return new Response(JSON.stringify({ message: 'Successfully removed games from backlog' }), { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err }), { status: 500 });
    }
}