'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"

export default function LoginSuccess() {
    const searchParams = useSearchParams();
    const steamid = searchParams.get('steamid');
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!steamid) return;

        const fetchProfile = async () => {
            try { 
                const res = await axios.get(`/api/steam/profile?steamid=${steamid}`);
                setProfile(res.data);
            } catch (err) {
                console.error(`Error fetching profile: ${err}`);
            }
        };

        fetchProfile();
    }, [steamid]);

    if (!profile) return <p>Loading Steam Profile...</p>;

    return (
        <div>
            <h1>{profile.personaname}</h1>
            <img src={profile.avatarfull} alt="avatar" />
        </div>
    )
}