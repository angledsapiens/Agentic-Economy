const https = require('https');
const dotenv = require('dotenv');

dotenv.config();

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (e) => reject(e));
    if (data) req.write(data);
    req.end();
  });
}

async function discoverWallets() {
  console.log('--- Circle Wallet Endpoint Discovery ---');

  const fullApiKey = process.env.CIRCLE_API_KEY;
  if (!fullApiKey) throw new Error('CIRCLE_API_KEY missing');

  const hexApiKey = fullApiKey.startsWith('TEST_API_KEY:') ? fullApiKey.replace('TEST_API_KEY:', '') : fullApiKey;
  const keys = [{ name: 'Full', val: fullApiKey }, { name: 'Hex', val: hexApiKey }];

  const hosts = ['api.circle.com', 'api-sandbox.circle.com'];
  const paths = [
    '/v1/w3s/developer/wallets',
    '/v1/w3s/wallets'
  ];

  for (const host of hosts) {
    for (const path of paths) {
      for (const keyObj of keys) {
        // Test GET
        const getRes = await makeRequest({
          hostname: host,
          path: path,
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + keyObj.val }
        });
        console.log(`[GET ${getRes.status}] ${host}${path} (${keyObj.name})`);

        // Test POST with empty body
        const postRes = await makeRequest({
          hostname: host,
          path: path,
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + keyObj.val,
            'Content-Type': 'application/json'
          }
        }, '{}');
        console.log(`[POST ${postRes.status}] ${host}${path} (${keyObj.name})`);
      }
    }
  }
}

discoverWallets().catch(err => {
  console.error('DISCOVERY FATAL:', err.message);
  process.exit(1);
});
