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
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
  {loading ? (
    <p className="text-xl text-gray-700 dark:text-gray-200">
      Redirecting to Steam login...
    </p>
  ) : (
    <div className="flex flex-col items-center gap-5 text-center">
      <h1 className="text-2xl font-bold">Sign in with your Steam account</h1>

      <p className="max-w-xl text-gray-700 dark:text-gray-300">
        The purpose of this site is to estimate the total number of hours of
        content worth of unfinished games in your library.
      </p>

      <div onClick={checkSteamSession}>
        <Image
          src={SteamLoginBtn}
          alt="Sign In To Steam"
          className="cursor-pointer"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-10 mt-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">
            When you log in with Steam, we only collect:
          </h2>
          <ul className="list-disc list-inside text-left">
            <li>Your Steam ID</li>
            <li>Your Steam Display Name</li>
            <li>Your owned games and playtime data</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">We don't:</h2>
          <ul className="list-disc list-inside text-left">
            <li>Store your Steam account name</li>
            <li>Store your Steam password</li>
            <li>Sell or share your data</li>
          </ul>
        </div>
      </div>
    </div>
  )}
</div>

  );
}
