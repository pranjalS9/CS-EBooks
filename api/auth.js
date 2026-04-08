export default function handler(req, res) {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;

    if (!clientId) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Error: GITHUB_CLIENT_ID is not set in Vercel environment variables');
      return;
    }

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'ebook-library-rho.vercel.app';
    const redirectUri = `${protocol}://${host}/api/callback`;
    const state = Math.random().toString(36).slice(2);

    const url =
      'https://github.com/login/oauth/authorize' +
      '?client_id=' + encodeURIComponent(clientId) +
      '&redirect_uri=' + encodeURIComponent(redirectUri) +
      '&scope=' + encodeURIComponent('repo,user') +
      '&state=' + encodeURIComponent(state);

    res.writeHead(302, { Location: url });
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Error in /api/auth: ' + String(err));
  }
}
