import openid from 'openid';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { findUserBySteamId, createUser } from '@/app/lib/user';
const BASE_URL = process.env.BASE_URL;
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

const relyingParty = new openid.RelyingParty(
  `${BASE_URL}/api/auth/steam/return`,
  `${BASE_URL}`,
  true,
  false,
  []
);


export async function GET(req) {
  const parsedUrl = new URL(req.url);

  return new Promise((resolve) => {
    relyingParty.verifyAssertion(
      `${BASE_URL}/api/auth/steam/return?${parsedUrl.searchParams.toString()}`,
      (err, result) => {
        if (err || !result.authenticated) {
          resolve(new Response('Steam login failed', { status: 401 }));
        } else {
          handleAuthenticatedUser(result.claimedIdentifier)
          .then(resolve)
          .catch((err) => {
            console.error('Error handling authenticated user:', err);
            resolve(new Response('Internal server errror', { status: 500 }));
          });
        }
      }
    );
  });
}

async function handleAuthenticatedUser(claimedId) {
  const steamIdMatch = claimedId.match(/\/id\/(\d+)$|\/profiles\/(\d+)$/);
  const steamid = steamIdMatch?.[1] || steamIdMatch?.[2];

  if (!steamid) {
    return new Response('Invalid Steam ID', { status: 400 });
  }

  let user = await findUserBySteamId(steamid)
  if (!user) {
    const { data } = await axios.get(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamid}`
    );
    const player = data.response.players[0];
    if (!player) {
      return new Response('Failed to retrieve Steam profile', { status: 500 });
    }

    user = await createUser({
      steamId: steamid,
      displayName: player.personaname,
      avatarUrl: player.avatarfull,
      profileUrl: player.profileUrl,
    });
  }

  const token = jwt.sign(
    { userId: user.id, steamid: user.steam_id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const redirectResponse = Response.redirect(`${BASE_URL}/login/success`);
  const response = new Response(redirectResponse.body, redirectResponse);
  response.headers.set(
    'Set-Cookie',
    `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`
  );

  return response;
}