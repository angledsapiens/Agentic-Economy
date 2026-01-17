const sdk = require('@circle-fin/developer-controlled-wallets');
const { createConsoleClient, generateEntitySecretCiphertext } = sdk;
const crypto = require('crypto');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

async function initialize() {
  console.log('--- Initializing Circle Treasury Account (CJS) ---');

  // 1. Generate 32-byte hex string
  const entitySecret = crypto.randomBytes(32).toString('hex');
  console.log('Generated new ENTITY_SECRET.');

  // 2. Save secret to .env
  let envContent = '';
  if (fs.existsSync('.env')) {
    envContent = fs.readFileSync('.env', 'utf8');
  }

  if (envContent.includes('ENTITY_SECRET=')) {
    envContent = envContent.replace(/ENTITY_SECRET=.*/, `ENTITY_SECRET=${entitySecret}`);
  } else {
    envContent += `\nENTITY_SECRET=${entitySecret}`;
  }
  fs.writeFileSync('.env', envContent);
  console.log('Saved ENTITY_SECRET to .env.');

  // 3. Register Entity Secret Ciphertext
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    throw new Error('CIRCLE_API_KEY not found in .env');
  }

  console.log('Registering entity secret with Circle (using static method)...');
  try {
    const response = await sdk.registerEntitySecretCiphertext({
      entitySecret: entitySecret,
      apiKey: apiKey
    });

    // 4. Save recovery data to recovery.json
    fs.writeFileSync('recovery.json', JSON.stringify(response.data, null, 2));
    console.log('Recovery data saved to recovery.json.');
    console.log('Initialization successful!');
  } catch (error) {
    console.error('Registration failed:', error.message);
    if (error.response) {
      console.error('Error detail:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

initialize();
