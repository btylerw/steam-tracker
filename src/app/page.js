"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSteamSession = async () => {
      try {
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

    checkSteamSession();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <p className="text-xl text-gray-700 dark:text-gray-200">Redirecting to Steam login...</p>
    </div>
  );
}
