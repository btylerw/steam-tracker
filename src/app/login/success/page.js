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
    const [cooldown, setCooldown] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
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
        //A sync cooldown override for testing purposes
        //setCooldown(0);
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
            await getSteamData('false', profile.id, 'false');
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
            await getSteamData('false', profile.id, 'false');
        } catch (err) {
            console.error("Error removing from backlog: ", err);
        }
    }

    const renderGames = (games) => {
        return games.map((game) => (
            <div key={game.appid} className="flex flex-col items-center border rounded-lg p-3 bg-gray-100 dark:bg-gray-700 shadow hover:shadow-lg transition">
                <img
                    className="h-40 w-full object-cover rounded-md mb-2"
                    src={game.image_url}
                    alt={`${game.name} icon`}
                />
                <div className="text-center w-full">
                    <h3
                        className="text-base font-semibold truncate w-full"
                        title={game.name}
                    >
                        {game.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Playtime: {(game.playtime_minutes / 60).toFixed(1)} hours
                    </p>
                </div>
                <input
                    type="checkbox"
                    checked={selectedGames.includes(game.appid)}
                    onChange={() => toggleSelect(game.appid)}
                    className="mt-2 w-5 h-5 cursor-pointer accent-green-500 rounded"
                />
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
                await getSteamData(sync, res.data.id, 'false');
            } catch (err) {
                console.error(`Error fetching profile: ${err}`);
            }
        };
        
        fetchProfile();
    }, [steamid]);

    const handleForceSync = async () => {
        if (cooldown > 0) return;
        await getSteamData('true', profile.id, 'true');
        alert("Steam info synced successfully!");
        startCooldown(3600);
    }

    const startCooldown = (seconds) => {
        setCooldown(seconds);
        const id = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setIntervalId(id);
    }

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    useEffect(() => {
        if (!profile?.last_forced_sync) return;

        const lastSyncTime = new Date(profile.last_forced_sync).getTime();
        const now = Date.now();
        const elapsed = (now - lastSyncTime) / 1000;
        const remaining = Math.max(0, 3600 - elapsed);
        setCooldown(remaining);

        if (remaining > 0) {
            startCooldown(remaining);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        }
    }, [profile?.last_forced_sync]);

    const getSteamData = async (sync, id, force) => {
        try {
            if (sync === 'true') {
                const setSync = await axios.get(`/api/steam/sync?userid=${id}&force=${force}`);
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
            {currentView === "home" && (
                <h2 className="text-lg">
                    You have {backlogTime} hours worth of content in unplayed games
                </h2>
            )}
            <button
                onClick={handleForceSync}
                disabled={cooldown > 0}
                className={`px-4 py-2 rounded-md cursor-pointer ${
                    cooldown > 0 ? "bg-gray-500 text-white cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
            >
                {cooldown > 0 ? `Try again in ${formatTime(cooldown)}` : "Sync Steam Info"}
            </button>

            {currentView === "owned" && (
                <div className="w-full max-w-4xl grid grid-rows-[auto_auto_auto_1fr] gap-4 h-[90vh] items-center">
                    {selectedGames.length > 0 && (
                        <div className="flex gap-3 justify-center">
                            <button onClick={handleAddToBacklog} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
                                Add To Backlog
                            </button>
                        </div>
                    )}
                    <input type="text" placeholder="Search Games" value={searchOwned} onChange={(e) => setSearchOwned(e.target.value)} className="p-2 border rounded text-center" />
                    <div className="text-xl mb-2 text-center">Owned Games: {allGames.length}</div>
                    <ScrollableWindow games={renderGames(filterGames(allGames, searchOwned))} />
                </div>
            )}

            {currentView === "backlog" && (
                <div className="w-full max-w-4xl grid grid-rows-[auto_auto_auto_1fr] gap-4 h-[90vh] items-center">
                    {selectedGames.length > 0 && (
                        <div className="flex gap-3 justify-center">
                            <button onClick={handleRemoveFromBacklog} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
                                Remove From Backlog
                            </button>
                        </div>
                    )}
                    <input type="text" placeholder="Search Games" value={searchBacklog} onChange={(e) => setSearchBacklog(e.target.value)} className="p-2 border rounded text-center" />
                    <div className="text-xl mb-2 text-center">Backlog: {backlog.length}</div>
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