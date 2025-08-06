'use client'

import Image from "next/image"
import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import ScrollableWindow from "@/app/components/ScrollableWindow"
import axios from "axios"
import SteamLoginBtn from '../../../../public/steam_login_btn1.png';

function LoginSuccessInner() {
    const [steamid, setSteamid] = useState(null);
    const [profile, setProfile] = useState(null);
    const [allGames, setAllGames] = useState([]);
    const [backlog, setBacklog] = useState([]);
    const [backlogTime, setBacklogTime] = useState(null);
    const router = useRouter();

    const handleLogOut = async () => {
        await axios.get('/api/auth/logout');
        router.replace("/");
    }
    const LogOutButton = () => {
        return (
            <button onClick={handleLogOut} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition cursor-pointer">Log Out</button>
        )
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
        <div className="flex items-center justify-center flex-col gap-5 px-4 py-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl text-center">{profile.display_name}</h1>
            <Image 
                src={profile.avatar_url} 
                alt="avatar"
                width={256}
                height={256}
                className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full"
            />
            <h1 className="text-lg sm:text-xl md:text-2xl text-center">You have {backlogTime} hours worth of content in unplayed games</h1>
            <button onClick={() => getSteamData('true', profile.id)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition cursor-pointer">Sync Steam Info</button>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-10 w-full max-w-screen-xl mt-6">
                <div className="flex items-center justify-center flex-col gap-6 w-full max-w-md">
                    <div className="text-xl sm:text-2xl">Owned Games:</div>
                    <ScrollableWindow games={renderGames(allGames)}/>
                </div>
                <div className="flex items-center justify-center flex-col gap-6 w-full max-w-md">
                    <div className="text-xl sm:text-2xl">Backlog:</div>
                    <ScrollableWindow games={renderGames(backlog)}/>
                </div>
            </div>
            <LogOutButton />
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