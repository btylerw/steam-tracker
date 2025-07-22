import openid from 'openid';
const BASE_URL = process.env.BASE_URL

const relyingParty = new openid.RelyingParty(
  `${BASE_URL}/api/auth/steam/return`,
  `${BASE_URL}`,
  true,
  false,
  []
);

export async function GET(req) {
  const parsedUrl = new URL(req.url);
  const params = Object.fromEntries(parsedUrl.searchParams.entries());

  return new Promise((resolve) => {
    relyingParty.verifyAssertion(
      `${BASE_URL}/api/auth/steam/return?${parsedUrl.searchParams.toString()}`,
      (err, result) => {
        if (err || !result.authenticated) {
          console.error('OpenID verification failed:', err);
          resolve(new Response('Steam login failed', { status: 401 }));
        } else {
          const claimedId = result.claimedIdentifier;
          const steamIdMatch = claimedId.match(/\/id\/(\d+)$|\/profiles\/(\d+)$/);
          const steamid = steamIdMatch?.[1] || steamIdMatch?.[2];

          if (!steamid) {
            resolve(new Response('Invalid Steam ID', { status: 400 }));
            return;
          }

          // Redirect to frontend with Steam ID (use cookie/JWT in production)
          resolve(Response.redirect(`${BASE_URL}/login/success?steamid=${steamid}`));
        }
      }
    );
  });
}
