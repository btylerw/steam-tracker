'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import ScrollableWindow from "@/app/components/ScrollableWindow"
import axios, { all } from "axios"

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
        return games.map((game) => (
            <div key={game.appid} className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">{game.name}</h3>
                    <p>Playtime: {(game.playtime_forever / 60).toFixed(1)} hours</p>
                </div>
                <img className="h-36 w-auto" src={game.imageUrl} alt={`${game.name} icon`} />
            </div>
        ));
    };
    
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
        const searchGames = async () => {
            try {
                const gameNames = allGames.map(game => {
                    return game.name.toLowerCase().replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, ' ').trim();
                })
                const response = await axios.post('/api/hltb', { gameNames });
                let timeSum = 0;
                const imageMap = new Map();
                response.data.map((data, i) => {
                    imageMap.set(null);
                    console.log(data[0]);
                    if (data[0]) {
                        imageMap.set(allGames[i].name.toLowerCase(), data[0].imageUrl);
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
            <ScrollableWindow games={renderGames(allGames)}/>
        </div>
    )
}