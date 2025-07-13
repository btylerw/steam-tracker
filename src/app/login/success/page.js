'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"

export default function LoginSuccess() {
    const searchParams = useSearchParams();
    const steamid = searchParams.get('steamid');
    const [profile, setProfile] = useState(null);
    const [allGames, setAllGames] = useState([]);
    const [ownedGames, setOwnedGames] = useState([]);
    const [backlog, setBacklog] = useState([]);
    const [backlogTime, setBacklogTime] = useState(null);
    const [gamesLoaded, setGamesLoaded] = useState(false);

    
    const renderGames = (games) => {
        return games.map(game => (
            <div key={game.appid} className="flex">
                <h3>{game.name} <p>Playtime: {(game.playtime_forever / 60).toFixed(1)} hours</p></h3>
                <img className="h-36 w-auto" src={game.imageUrl} alt={`${game.name} icon`}/>
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
                const sortedGames = result.data.sort((a, b) => b.playtime_forever - a.playtime_forever);
                setAllGames(sortedGames);
                setGamesLoaded(true);
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
                const imageMap = new Map();
                response.data.map((data, i) => {
                    imageMap.set(null);
                    if (data[0]) {
                        imageMap.set(data[0].name.toLowerCase(), data[0].imageUrl);
                        if (allGames[i].playtime_forever / 60 < data[0].gameplayMain) {
                            timeSum += data[0].gameplayMain;
                        }
                    }
                });
                setAllGames(prevGames => 
                    prevGames.map(game => ({
                        ...game,
                        imageUrl: imageMap.get(game.name.toLowerCase()) || null
                    }))
                );
                setBacklogTime(timeSum);
            } catch (err) {
                console.error(`Failed to fetch HLTB data: ${err}`);
            }
        }
        searchGames();
    }, [gamesLoaded]);

    if (!profile || !backlogTime) {
        return (
            <div className="flex items-center justify-center">
                <p>Loading Steam Profile...</p>
            </div>
        )
    
    }

    return (
        <div className="flex items-center justify-center flex-col">
            <h1>{profile.personaname}</h1>
            <img src={profile.avatarfull} alt="avatar" />
            <h1 className="text-2xl">You have {backlogTime} hours worth of content in unplayed games</h1>
            <div className="text-2xl">Owned Games:</div>
            <div className="grid grid-cols-4 gap-4 place-items-center">
                {renderGames(allGames)}
            </div>
        </div>
    )
}