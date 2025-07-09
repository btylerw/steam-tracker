import openid from 'openid';

const relyingParty = new openid.RelyingParty(
  'http://localhost:3000/api/auth/steam/return', // return URL
  'http://localhost:3000',                      // realm
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
