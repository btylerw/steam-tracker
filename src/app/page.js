"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import SteamLoginBtn from '../../public/steam_login_btn1.png';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const checkSteamSession = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/auth/me");
      if (res.data?.steamid) {
        router.push("/login/success");
      } else {
        // No Steam session: start Steam login flow
        window.location.href = "/api/auth/steam";
      }
    } catch (err) {
      // Error or no session: force Steam login
      window.location.href = "/api/auth/steam";
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      {loading ? (
        <p className="text-xl text-gray-700 dark:text-gray-200">Redirecting to Steam login...</p>
      ) : (
        <div onClick={checkSteamSession}>
          <Image src={SteamLoginBtn} alt="Sign In To Steam" className="cursor-pointer"/>
        </div>
      )}
    </div>
  );
}
