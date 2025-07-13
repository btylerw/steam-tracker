'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import axios, { all } from "axios"

export default function LoginSuccess() {
    const searchParams = useSearchParams();
    const steamid = searchParams.get('steamid');
    const [profile, setProfile] = useState(null);
    const [allGames, setAllGames] = useState([]);
    const [ownedGames, setOwnedGames] = useState([]);
    const [backlog, setBacklog] = useState([]);
    const [backlogTime, setBacklogTime] = useState(null);

    
    const renderGames = (games) => {
        return games.map(game => (
            <div key={game.appid} className="flex">
                <h3>{game.name} <p>Playtime: {(game.playtime_forever / 60).toFixed(1)} hours</p></h3>
                <img className="h-24 w-24" src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`} alt={`${game.name} icon`}/>
            </div>
        ))
    }
    
    useEffect(() => {
        if (!steamid) return;
        
        const fetchProfile = async () => {
            try { 
                const res = await axios.get(`/api/steam/profile?steamid=${steamid}`);
                setProfile(res.data);
                const result = await axios.get(`/api/steam/games?steamid=${steamid}`);
                setAllGames(result.data);
                const playedGames = result.data.filter(game => game.playtime_forever > 0);
                const sortedGames = playedGames.sort((a, b) => b.playtime_forever - a.playtime_forever);
                const unplayedGames = result.data.filter(game => game.playtime_forever <= 0);
                setOwnedGames(sortedGames);
                setBacklog(unplayedGames);
            } catch (err) {
                console.error(`Error fetching profile: ${err}`);
            }
        };
        
        fetchProfile();
    }, [steamid]);
    
    useEffect(() => {
        console.log('test');
        const searchGames = async () => {
            try {
                const gameNames = allGames.map(game => game.name);
                const response = await axios.post('/api/hltb', { gameNames });
                let timeSum = 0;
                let totalSteamContent = 0;
                response.data.map((data, i) => {
                    if (data[0]) {
                        if (allGames[i].playtime_forever / 60 < data[0].gameplayMain) {
                            timeSum += data[0].gameplayMain;
                        }
                    }
                });
                setBacklogTime(timeSum);
            } catch (err) {
                console.error(`Failed to fetch HLTB data: ${err}`);
            }
        }
        searchGames();
    }, [backlog]);

    if (!profile || !backlogTime) return <p>Loading Steam Profile...</p>;

    return (
        <div className="flex items-center justify-center flex-col">
            <h1>{profile.personaname}</h1>
            <img src={profile.avatarfull} alt="avatar" />
            <h1 className="text-2xl">You have {backlogTime} hours worth of content in unplayed games</h1>
            <div className="text-2xl">Played Games:</div>
            <div className="grid grid-cols-4 gap-4 place-items-center">
                {renderGames(ownedGames)}
            </div>
            <div className="text-2xl">Unplayed Games:</div>
            <div className="grid grid-cols-4 gap-4 place-items-center">
                {renderGames(backlog)}
            </div>
        </div>
    )
}