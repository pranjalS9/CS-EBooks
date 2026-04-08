module.exports = function handler(req, res) {
  const redirectUri = 'https://ebook-library-rho.vercel.app/api/callback';

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'repo,user',
    state: Math.random().toString(36).slice(2),
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};
