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

async function createWalletSet() {
  console.log('--- Circle Wallet Set Management ---');

  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.ENTITY_SECRET;

  const host = 'api.circle.com';

  // 1. Check if it exists
  console.log('Checking for existing wallet sets...');
  const listRes = await makeRequest({
    hostname: host,
    path: '/v1/w3s/walletSets',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + apiKey }
  });

  if (listRes.status === 200) {
    const listData = JSON.parse(listRes.body);
    const existing = listData.data.walletSets.find(w => w.name === 'Antigravity Treasury v1');
    if (existing) {
      console.log(`Found existing Wallet Set: ${existing.name} (ID: ${existing.id})`);
      saveWalletSetId(existing.id);
      return;
    }
  }

  // 2. Not found, create it
  console.log('Not found. Fetching Public Key for creation...');
  const pkRes = await makeRequest({
    hostname: host,
    path: '/v1/w3s/config/entity/publicKey',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + apiKey }
  });

  if (pkRes.status !== 200) {
    throw new Error(`Failed to fetch Public Key. Status: ${pkRes.status}`);
  }

  const publicKey = JSON.parse(pkRes.body).data.publicKey;
  const entitySecretCiphertext = sdk.generateEntitySecretCiphertext(entitySecret, publicKey);

  const idempotencyKey = crypto.randomUUID();
  const payload = JSON.stringify({
    idempotencyKey: idempotencyKey,
    entitySecretCiphertext: entitySecretCiphertext,
    name: 'Antigravity Treasury v1'
  });

  console.log('Calling Create Wallet Set API...');
  const createRes = await makeRequest({
    hostname: host,
    path: '/v1/w3s/walletSets',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
      'Content-Length': payload.length
    }
  }, payload);

  const responseData = JSON.parse(createRes.body);

  if (responseData.data && responseData.data.walletSet && responseData.data.walletSet.id) {
    const walletSetId = responseData.data.walletSet.id;
    console.log(`Successfully created Wallet Set. ID: ${walletSetId}`);
    saveWalletSetId(walletSetId);
  } else {
    console.error('Failed to create wallet set. Response:', createRes.body);
    process.exit(1);
  }
}

function saveWalletSetId(walletSetId) {
  let envContent = fs.readFileSync('.env', 'utf8');
  if (envContent.includes('WALLET_SET_ID=')) {
    envContent = envContent.replace(/WALLET_SET_ID=.*/, `WALLET_SET_ID=${walletSetId}`);
  } else {
    envContent += `\nWALLET_SET_ID=${walletSetId}`;
  }
  fs.writeFileSync('.env', envContent);
  console.log('Saved WALLET_SET_ID to .env.');
}

createWalletSet().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
