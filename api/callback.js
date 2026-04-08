export default async function handler(req, res) {
  const code = req.query.code;
  const error = req.query.error;

  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;

  if (error || !code) {
    res.end(errorPage(error || 'missing_code'));
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
      res.end(errorPage(data.error_description || data.error || 'no_token'));
      return;
    }

    res.end(successPage(data.access_token));
  } catch (err) {
    res.end(errorPage(String(err)));
  }
}

function successPage(token) {
  // Decap CMS two-way handshake:
  // 1. Popup sends "authorizing:github" to opener
  // 2. CMS sends back a message to the popup
  // 3. Popup responds with the token using event.origin as target
  return `<!DOCTYPE html><html><body><script>
(function() {
  var token = ${JSON.stringify(token)};
  var provider = 'github';

  function sendToken(origin) {
    var msg = 'authorization:' + provider + ':success:' + JSON.stringify({ token: token, provider: provider });
    window.opener.postMessage(msg, origin);
  }

  // Step 1: wait for CMS to ping us
  window.addEventListener('message', function(e) {
    if (e.data === 'authorizing:' + provider) {
      sendToken(e.origin);
      window.close();
    }
  });

  // Step 2: signal opener we are ready
  window.opener.postMessage('authorizing:' + provider, '*');
})();
</script></body></html>`;
}

function errorPage(msg) {
  return `<!DOCTYPE html><html><body><script>
(function() {
  window.addEventListener('message', function(e) {
    window.opener.postMessage('authorization:github:error:' + JSON.stringify({ error: ${JSON.stringify(msg)} }), e.origin);
    window.close();
  });
  window.opener.postMessage('authorizing:github', '*');
})();
</script></body></html>`;
}
