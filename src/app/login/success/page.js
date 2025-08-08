'use client'

import Image from "next/image"
import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import ScrollableWindow from "@/app/components/ScrollableWindow"
import axios from "axios"
import Sidebar from "@/app/components/Sidebar"

function LoginSuccessInner() {
    const [steamid, setSteamid] = useState(null);
    const [profile, setProfile] = useState(null);
    const [allGames, setAllGames] = useState([]);
    const [backlog, setBacklog] = useState([]);
    const [backlogTime, setBacklogTime] = useState(null);
    const [currentView, setCurrentView] = useState("owned");
    const [sideBarOpen, setSideBarOpen] = useState(false);
    const router = useRouter();

    const handleLogOut = async () => {
        await axios.get('/api/auth/logout');
        router.replace("/");
    }

    const renderGames = (games) => {
        return games.map((game) => (
            <div key={game.appid} className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">{game.name}</h3>
                    <p>Playtime: {(game.playtime_minutes / 60).toFixed(1)} hours</p>
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
            setAllGames(sortedGames);
            setBacklog(backlogList);
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
        <div className="flex min-h-screen">
            <button className="lg:hidden p-2 text-white bg-gray-700 rounded-md fixed top-4 left-4 z-50" onClick={() => setSideBarOpen(!sideBarOpen)}>
                ☰
            </button>
            {sideBarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setSideBarOpen(false)}
                />
            )}
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} handleLogOut={handleLogOut} sideBarOpen={sideBarOpen} setSideBarOpen={setSideBarOpen} />
            <div className="flex-1 p-6 flex flex-col items-center gap-6">
                <h1 className="text-2xl text-center">{profile.display_name}</h1>
                <Image 
                    src={profile.avatar_url} 
                    alt="avatar"
                    width={128}
                    height={128}
                    className="rounded-full"
                />
                <h2 className="text-lg">
                    You have {backlogTime} hours worth of content in unplayed games
                </h2>
                <button 
                    onClick={() => getSteamData('true', profile.id)} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Sync Steam Info
                </button>
                {currentView === "owned" && (
                    <div className="w-full max-w-2xl flex justify-center items-center flex-col">
                        <div className="text-xl mb-2">Owned Games: {allGames.length}</div>
                        <ScrollableWindow games={renderGames(allGames)} />
                    </div>
                )}
                {currentView === "backlog" && (
                    <div className="w-full max-w-2xl flex justify-center items-center flex-col">
                        <div className="text-xl mb-2">Backlog: {backlog.length}</div>
                        <ScrollableWindow games={renderGames(backlog)} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default function LoginSuccess() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginSuccessInner />
        </Suspense>
    )
}