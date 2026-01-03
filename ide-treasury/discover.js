const sdk = require('@circle-fin/developer-controlled-wallets');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
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

async function discover() {
  console.log('--- Circle Endpoint Discovery ---');

  const fullApiKey = process.env.CIRCLE_API_KEY;
  const hexApiKey = fullApiKey.startsWith('TEST_API_KEY:') ? fullApiKey.replace('TEST_API_KEY:', '') : fullApiKey;

  const hosts = ['api.circle.com', 'api-sandbox.circle.com'];
  const paths = [
    '/v1/w3s/developer/walletSets',
    '/v1/w3s/walletSets',
    '/v1/w3s/developer/publicKey',
    '/v1/w3s/config/entity/publicKey',
    '/v1/w3s/publicKey'
  ];
  const keys = [{ name: 'Full', val: fullApiKey }, { name: 'Hex', val: hexApiKey }];

  for (const host of hosts) {
    for (const path of paths) {
      for (const keyObj of keys) {
        try {
          const res = await makeRequest({
            hostname: host,
            path: path,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + keyObj.val }
          });
          console.log(`[${res.status}] ${host}${path} (${keyObj.name})`);
          if (res.status === 200) {
            console.log(`  -> SUCCESS! Body: ${res.body.substring(0, 50)}...`);
          }
        } catch (e) {
          console.log(`[ERR] ${host}${path} (${keyObj.name}): ${e.message}`);
        }
      }
    }
  }
}

discover().catch(console.error);
