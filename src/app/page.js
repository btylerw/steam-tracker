"use client"
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "./components/Modal";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    router.push('/login/success')
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (createPassword != confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post('/api/auth/create', {
        username: createUsername,
        email,
        password: createPassword,
      });
      setError('');
      setModalOpen(false);
      return res.data;
    } catch (err) {
      setError(err.response.data.error);
      if (err.response) {
        throw new Error(err.response.data.error || 'Server error');
      } else {
        throw new Error('Could not connect to server');
      }
    }
  }
  
  return (
    <div className="flex justify-center flex-col items-center gap-5 min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-red-600">Currently no authentication implemented. Simply click &quot;Log In&quot; to proceed.</h1>
      <form action="submit" onSubmit={handleLogin} className="bg-white dark:bg-gray-800 shadow-md rounded-lg px-8 pt-6 pb-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Log In</h2>
        <input type="text" value={username} placeholder="Username" onChange={(e) => setUsername(e.target.value)} className="mb-4 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="mb-4 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md w-full transition duration-200">Log In</button>
      </form>
      <div onClick={() => setModalOpen(true)}>
        <h3 className="text-m text-blue-600 cursor-pointer">Create Account</h3>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form action="submit" onSubmit={handleCreate}>
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Create Account</h2>
          <input type="text" required value={createUsername} placeholder="Username" onChange={(e) => setCreateUsername(e.target.value)} className="mb-4 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="email" required value={email} placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} className="mb-4 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="password" required value={createPassword} placeholder="Password" onChange={(e) => setCreatePassword(e.target.value)} className="mb-4 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="password" required value={confirmPassword} placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} className="mb-4 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {error && (
            <p className="text-red-500 text-m -mt-2 mb-2 text-center">{error}</p>
          )}
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md w-full transition duration-200">Create Account</button>
        </form>
        <button onClick={() => setModalOpen(false)} className="mt-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 cursor-pointer">
          Close
        </button>
      </Modal>
    </div>
  );
}
