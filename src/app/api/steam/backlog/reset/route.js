import { resetBacklogPlaythrough } from "@/app/lib/games";

export async function POST(req) {
    try {
        const body = await req.json();
        const { userId, gameId } = body;
        
        if (!userId || !gameId) {
            return new Response(JSON.stringify({ error: 'Invalid Input'}), { status: 400 });
        }

        await resetBacklogPlaythrough(userId, gameId);
        return new Response(JSON.stringify({ message: 'Successfully added games to backlog' }), { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err }), { status: 500 });
    }
}