"use client"
import Image from "next/image";
import * as client from 'openid-client'
import SteamLoginBtn from '../../public/steam_login_btn1.png';
import axios from "axios";

export default function Home() {

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div onClick={() => window.location.href = '/api/auth/steam'} >
        <Image src={SteamLoginBtn} alt="Sign In To Steam"/>
      </div>
    </div>
  );
}
