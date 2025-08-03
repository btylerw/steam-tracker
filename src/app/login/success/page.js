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
            <button onClick={handleLogOut} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 cursor-pointer">Log Out</button>
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
        <div className="flex items-center justify-center flex-col gap-5">
            <h1>{profile.display_name}</h1>
            <Image 
                src={profile.avatar_url} 
                alt="avatar"
                width={256}
                height={256}
            />
            <h1 className="text-2xl">You have {backlogTime} hours worth of content in unplayed games</h1>
            <button onClick={() => getSteamData('true', profile.id)} className="cursor-pointer">Sync Steam Info</button>
            <div className="flex items-center justify-center gap-20">
                <div className="flex items-center justify-center flex-col gap-10">
                    <div className="text-2xl">Owned Games:</div>
                    <ScrollableWindow games={renderGames(allGames)}/>
                </div>
                <div className="flex items-center justify-center flex-col gap-10">
                    <div className="text-2xl">Backlog:</div>
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