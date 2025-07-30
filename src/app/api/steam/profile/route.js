import { findUserBySteamId } from "@/app/lib/user";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const steamid = searchParams.get('steamid');
    const API_Key = process.env.STEAM_API_KEY;

    if (!steamid || !API_Key) {
        return new Response(JSON.stringify({ error: 'Missing steamid or API Key' }), {
            status: 400,
            headers: { 'Content-Type': 'applications/json' },
        });
    }

    try {
        const response = await findUserBySteamId(steamid);
        return new Response(JSON.stringify(response), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error(`Steam API Error: ${err}`);
        return new Response(JSON.stringify({ error: 'Steam API call failed' }), { status: 500 });
    }
}