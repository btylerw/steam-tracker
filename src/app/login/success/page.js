// src/app/login/success/page.js
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginSuccess() {
  const searchParams = useSearchParams();
  const steamid = searchParams.get('steamid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (steamid) {
      console.log('SteamID:', steamid);
      // Optionally store in localStorage, context, etc.
      setLoading(false);
    }
  }, [steamid]);

  if (loading) return <p>Verifying Steam login...</p>;

  return (
    <div>
      <h1>Steam login successful!</h1>
      <p>Your Steam ID: {steamid}</p>
    </div>
  );
}
