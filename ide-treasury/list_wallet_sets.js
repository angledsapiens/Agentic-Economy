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

async function listWalletSets() {
  console.log('--- Listing Existing Wallet Sets ---');
  const apiKey = process.env.CIRCLE_API_KEY;

  const res = await makeRequest({
    hostname: 'api.circle.com',
    path: '/v1/w3s/walletSets',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + apiKey }
  });

  if (res.status === 200) {
    const data = JSON.parse(res.body);
    console.log(JSON.stringify(data.data.walletSets, null, 2));
  } else {
    console.log(`Failed. Status: ${res.status}, Body: ${res.body}`);
  }
}

listWalletSets().catch(console.error);
