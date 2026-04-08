export default async function handler(req, res) {
  const qs = (req.url || '').split('?')[1] || '';
  const params = new URLSearchParams(qs);
  const code = params.get('code');
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  if (error) {
    res.writeHead(302, { Location: `/admin/relay.html#error=${encodeURIComponent(errorDescription || error)}` });
    res.end();
    return;
  }

  if (!code) {
    res.writeHead(302, { Location: `/admin/relay.html#error=missing_code` });
    res.end();
    return;
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error || !data.access_token) {
      const msg = data.error_description || data.error || 'no_token';
      res.writeHead(302, { Location: `/admin/relay.html#error=${encodeURIComponent(msg)}` });
      res.end();
      return;
    }

    // Redirect to relay page with token in hash (never hits server logs)
    res.writeHead(302, { Location: `/admin/relay.html#token=${encodeURIComponent(data.access_token)}` });
    res.end();
  } catch (err) {
    res.writeHead(302, { Location: `/admin/relay.html#error=${encodeURIComponent(String(err))}` });
    res.end();
  }
}
