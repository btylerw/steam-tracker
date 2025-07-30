import axios from "axios";
import { getAllUserGames, saveUserGames, getUserBacklog } from "@/app/lib/games";
import { getHLTBInfo } from "@/app/lib/hltb";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const steamid = searchParams.get('steamid');
    const userid = searchParams.get('userid');
    const API_Key = process.env.STEAM_API_KEY;
    if (!steamid || !API_Key) {
        return new Promise(JSON.stringify({ error: 'Missing steamid or API Key' }), {
            status: 400,
            headers: { 'Content-Type': 'applications/json' },
        });
    }

    try {
        let games = await getAllUserGames(userid);
        if (!games) {
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
            const steamGames = response.data.response.games;
            const gameNames = steamGames.map(g => g.name);
            const hltbResults = await getHLTBInfo(gameNames);
            games = steamGames.map((game, i) => {
                const hltbRaw = hltbResults[i];
                const hltb = Array.isArray(hltbRaw) && hltbRaw.length > 0 ? hltbRaw[0] : null;
                return {
                    appid: game.appid,
                    name: game.name,
                    image_url: hltb?.imageUrl || `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
                    playtime_minutes: game.playtime_forever,
                    avg_completion_minutes: hltb?.gameplayMain || null,
                };
            });
            await saveUserGames(userid, games);
            return new Response(JSON.stringify(games), {
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const backlogList = await getUserBacklog(userid);
        const backlogListTime = backlogList.reduce((sum, game) => {
            return sum + (game.avg_completion_minutes / 60 || 0);
        }, 0);
        if (!backlogList) {
            return new Response(JSON.stringify({ error: 'Internal server error'}), { status: 500 });
        }
        return new Response(JSON.stringify({ games, backlogList, backlogListTime }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error(`Steam API Error: ${err}`);
        return new Response(JSON.stringify({ error: 'Steam API call failed' }), { status: 500 });
    }
}