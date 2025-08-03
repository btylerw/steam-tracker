import axios from "axios";
import { getAllUserGames, saveUserGames, getUserBacklog, getAllGames } from "@/app/lib/games";
import { getHLTBInfo } from "@/app/lib/hltb";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const steamid = searchParams.get('steamid');
    const userid = searchParams.get('userid');
    const sync = searchParams.get('sync') === 'true';
    const API_Key = process.env.STEAM_API_KEY;
    if (!steamid || !API_Key) {
        return new Response(JSON.stringify({ error: 'Missing steamid or API Key' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        let games = await getAllUserGames(userid);
        if (games.length === 0 || sync) {
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
            const steamGames = response.data.response.games ?? [];
            const storedGames = await getAllGames();
            const dbGameMap = new Map(storedGames.map(game => [Number(game.appid), game]));

            const knownGames = [];
            const unknownGames = [];

            for (const game of steamGames) {
                const dbGame = dbGameMap.get(Number(game.appid));
                if (dbGame) {
                    knownGames.push({
                        appid: game.appid,
                        name: dbGame.name,
                        image_url: dbGame.image_url,
                        playtime_minutes: game.playtime_forever,
                        avg_completion_minutes: dbGame.avg_completion_minutes,
                    });
                } else {
                    unknownGames.push(game);
                }
            }

            const gameNames = unknownGames.map(g => g.name);
            const hltbResults = await getHLTBInfo(gameNames);

            const newGames = unknownGames.map((game, i) => {
                const hltbRaw = hltbResults[i];
                const hltb = Array.isArray(hltbRaw) && hltbRaw.length > 0 ? hltbRaw[0] : null;
                return {
                    appid: game.appid,
                    name: game.name,
                    image_url: hltb?.imageUrl || `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
                    playtime_minutes: game.playtime_forever,
                    avg_completion_minutes: hltb?.gameplayMain * 60 || null,
                };
            });
            games = [...knownGames, ...newGames];
            await saveUserGames(userid, games);
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