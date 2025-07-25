"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push('/login/success')
  }
  
  return (
    <div className="flex justify-center flex-col items-center gap-5 min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-red-600">Currently no authentication implemented. Simply click &quot;Log In&quot; to proceed.</h1>
      <form action="submit" onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg px-8 pt-6 pb-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Log In</h2>
        <input type="text" value={username} placeholder="Username" onChange={(e) => setUsername(e.target.value)} className="mb-4 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="mb-4 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md w-full transition duration-200">Log In</button>
      </form>
    </div>
  );
}
