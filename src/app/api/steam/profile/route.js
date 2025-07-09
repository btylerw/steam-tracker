import axios from "axios";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const steamid = searchParams.get('steamid');
    const API_Key = process.env.STEAM_API_KEY;

    if (!steamid || !API_Key) {
        return new Promise(JSON.stringify({ error: 'Missing steamid or API Key' }), {
            status: 400,
            headers: { 'Content-Type': 'applications/json' },
        });
    }

    try {
        const response = await axios.get(
            'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/',
            {
                params: {
                    key: API_Key,
                    steamids: steamid,
                },
            }
        );

        const player = response.data.response.players[0];
        return new Response(JSON.stringify(player), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error(`Steam API Error: ${err}`);
        return new Response(JSON.stringify({ error: 'Steam API call failed' }), { status: 500 });
    }
}