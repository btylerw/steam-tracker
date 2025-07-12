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
        console.log(steamid);
        console.log(API_Key);
        const response = await axios.get(
            'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/',
            {
                params: {
                    key: API_Key,
                    steamid: steamid,
                    include_appinfo: true,
                },
            }
        );
        console.log(response.data.response.games);
        const player = response.data.response.games;
        return new Response(JSON.stringify(player), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error(`Steam API Error: ${err}`);
        return new Response(JSON.stringify({ error: 'Steam API call failed' }), { status: 500 });
    }
}