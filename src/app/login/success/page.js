'use client'

import Image from "next/image"
import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import ScrollableWindow from "@/app/components/ScrollableWindow"
import axios from "axios"
import Dashboard from "@/app/components/Dashboard"

function LoginSuccessInner() {
    const [steamid, setSteamid] = useState(null);
    const [profile, setProfile] = useState(null);
    const [allGames, setAllGames] = useState([]);
    const [backlog, setBacklog] = useState([]);
    const [backlogTime, setBacklogTime] = useState(null);
    const [currentView, setCurrentView] = useState("owned");
    const [selectedGames, setSelectedGames] = useState([]);
    const [searchOwned, setSearchOwned] = useState("");
    const [searchBacklog, setSearchBacklog] = useState("");
    const router = useRouter();

    const handleLogOut = async () => {
        await axios.get('/api/auth/logout');
        router.replace("/");
    }

    const filterGames = (games, search) => {
        return games.filter(game =>
            game.name.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    const toggleSelect = (appid) => {
        setSelectedGames((prev) =>
            prev.includes(appid) ? prev.filter(id => id !== appid) : [...prev, appid]
        );
    };

    const handleAddToBacklog = async () => {
        try {
            const backlogIds = backlog.map(g => g.appid);
            const toAdd = selectedGames.filter(id => !backlogIds.includes(id));
            if (toAdd.length === 0) {
                return;
            }
            await axios.post('/api/steam/backlog/add', { gameIds: toAdd, userId: profile.id });
            setSelectedGames([]);
            await getSteamData("false", profile.id);
        } catch (err) {
            console.error("Error adding to backlog: ", err);
        }
    }

    const handleRemoveFromBacklog = async () => {
        try {
            const backlogIds = backlog.map(g => g.appid);
            const toRemove = selectedGames.filter(id => backlogIds.includes(id));
            if (toRemove.length === 0) {
                return;
            }
            await axios.post('/api/steam/backlog/remove', { gameIds: toRemove, userId: profile.id });
            setSelectedGames([]);
            await getSteamData("false", profile.id);
        } catch (err) {
            console.error("Error removing from backlog: ", err);
        }
    }

    const renderGames = (games) => {
        return games.map((game) => (
            <div key={game.appid} className="flex justify-between items-center mb-4 border p-2 rounded">
                <div className="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        checked={selectedGames.includes(game.appid)}
                        onChange={() => toggleSelect(game.appid)}
                        className="w-5 h-5 cursor-pointer accent-green-500 rounded-full"
                    />
                    <div>
                        <h3 className="text-lg font-semibold">{game.name}</h3>
                        <p>Playtime: {(game.playtime_minutes / 60).toFixed(1)} hours</p>
                    </div>
                </div>
                <img className="h-48 w-auto" src={game.image_url} alt={`${game.name} icon`} />
            </div>
        ));
    };

    useEffect(() => {
        const getSteamId = async () => {
            try {
                const res = await axios.get('/api/auth/me');
                setSteamid(res.data.steamid);
            } catch(err) {
                console.error('User not authenticated', err);
                router.replace('/');
            }
        };
        getSteamId();
    }, []);
    
    useEffect(() => {
        if (!steamid) return;
        
        const fetchProfile = async () => {
            try { 
                const res = await axios.get(`/api/steam/profile?steamid=${steamid}`);
                setProfile(res.data);
                // Syncs with Steam library automatically if current login time is more than 24 hours past last sync time
                let sync = !res.data.last_synced || (Date.now() - new Date(res.data.last_synced).getTime() > 24 * 3600 * 1000);
                sync = sync.toString();
                await getSteamData(sync, res.data.id);
            } catch (err) {
                console.error(`Error fetching profile: ${err}`);
            }
        };
        
        fetchProfile();
    }, [steamid]);

    const getSteamData = async (sync, id) => {
        try {
            if (sync === 'true') {
                const setSync = await axios.get(`/api/steam/sync?userid=${id}`);
            }
            const result = await axios.get(`/api/steam/games?steamid=${steamid}&userid=${id}&sync=${sync}`);
            const { games, backlogList, backlogListTime } = result.data;
            const sortedGames = games.sort((a, b) => b.playtime_minutes - a.playtime_minutes);
            const sortedBacklog = backlogList.sort((a, b) => b.playtime_minutes - a.playtime_minutes);
            setAllGames(sortedGames);
            setBacklog(sortedBacklog);
            setBacklogTime(backlogListTime);
        } catch (err) {
            console.error(`Error syncing steam data: ${err}`);
        }
    }

    if (!profile || !backlogTime) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading Steam Profile...</p>
            </div>
        )
    }

    return (
        <Dashboard
            profile={profile}
            currentView={currentView}
            setCurrentView={setCurrentView}
            handleLogOut={handleLogOut}
        >  
            <h2 className="text-lg">
                You have {backlogTime} hours worth of content in unplayed games
            </h2>
            <button
                onClick={() => getSteamData("true", profile.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
                Sync Steam Info
            </button>

            {currentView === "owned" && (
                <div className="w-full max-w-2xl flex flex-col items-center">
                    {selectedGames.length > 0 && (
                        <div className="flex gap-3 my-3">
                            <button onClick={handleAddToBacklog} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
                                Add To Backlog
                            </button>
                        </div>
                    )}
                    <input type="text" placeholder="Search Games" value={searchOwned} onChange={(e) => setSearchOwned(e.target.value)} className="mb-4 p-2 border rounded text-center" />
                    <div className="text-xl mb-2">Owned Games: {allGames.length}</div>
                    <ScrollableWindow games={renderGames(filterGames(allGames, searchOwned))} />
                </div>
            )}

            {currentView === "backlog" && (
                <div className="w-full max-w-2xl flex flex-col items-center">
                    {selectedGames.length > 0 && (
                        <div className="flex gap-3 my-3">
                            <button onClick={handleRemoveFromBacklog} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
                                Remove From Backlog
                            </button>
                        </div>
                    )}
                    <input type="text" placeholder="Search Games" value={searchBacklog} onChange={(e) => setSearchBacklog(e.target.value)} className="mb-4 p-2 border rounded text-center" />
                    <div className="text-xl mb-2">Backlog: {backlog.length}</div>
                    <ScrollableWindow games={renderGames(filterGames(backlog, searchBacklog))} />
                </div>
            )}
        </Dashboard>
    )
}

export default function LoginSuccess() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginSuccessInner />
        </Suspense>
    )
}