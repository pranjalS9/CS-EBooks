// OAuth callback — exchanges GitHub code for access token, returns it to Decap CMS
export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    res.status(400).send('Missing code parameter');
    return;
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      res.status(400).send(`GitHub OAuth error: ${data.error_description}`);
      return;
    }

    // Send the token back to Decap CMS via postMessage
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            (function() {
              const token = ${JSON.stringify(data.access_token)};
              const provider = 'github';
              const message = JSON.stringify({ token, provider });
              // Post to opener (the CMS window)
              if (window.opener) {
                window.opener.postMessage(
                  'authorization:github:success:' + message,
                  '*'
                );
              }
              window.close();
            })();
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('OAuth exchange failed');
  }
}
