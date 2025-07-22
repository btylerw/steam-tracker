import openid from 'openid';
const BASE_URL = process.env.BASE_URL;
const relyingParty = new openid.RelyingParty(
  `${BASE_URL}/api/auth/steam/return`, // return URL
  `${BASE_URL}`,                      // realm
  true,                                         // stateless
  false,                                        // strict mode
  []                                            // extensions
);

export async function GET() {
  return new Promise((resolve) => {
    relyingParty.authenticate('https://steamcommunity.com/openid', false, (err, authUrl) => {
      if (err || !authUrl) {
        resolve(new Response('Authentication failed', { status: 500 }));
      } else {
        resolve(Response.redirect(authUrl));
      }
    });
  });
}
