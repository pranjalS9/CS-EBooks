module.exports = async function handler(req, res) {
  const { code, error, error_description } = req.query;

  if (error) {
    res.setHeader('Content-Type', 'text/html');
    res.send(makeScript('error', error_description || error));
    return;
  }

  if (!code) {
    res.setHeader('Content-Type', 'text/html');
    res.send(makeScript('error', 'Missing code parameter'));
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
      res.setHeader('Content-Type', 'text/html');
      res.send(makeScript('error', data.error_description || data.error));
      return;
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(makeScript('success', data.access_token));
  } catch (err) {
    res.setHeader('Content-Type', 'text/html');
    res.send(makeScript('error', 'OAuth exchange failed'));
  }
};

function makeScript(status, content) {
  const payload =
    status === 'success'
      ? JSON.stringify({ token: content, provider: 'github' })
      : JSON.stringify({ error: content });

  const message = `authorization:github:${status}:${payload}`;

  return `<!DOCTYPE html>
<html>
  <head><title>Authenticating...</title></head>
  <body>
    <p>Authenticating, please wait...</p>
    <script>
      (function() {
        const message = ${JSON.stringify(message)};
        function send() {
          if (window.opener) {
            window.opener.postMessage(message, '*');
            setTimeout(function() { window.close(); }, 500);
          } else {
            setTimeout(send, 200);
          }
        }
        send();
      })();
    </script>
  </body>
</html>`;
}
