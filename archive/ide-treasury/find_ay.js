const fs = require('fs');
const path = 'node_modules/@circle-fin/developer-controlled-wallets/dist/developer-controlled-wallets.es.js';
const content = fs.readFileSync(path, 'utf8');

// Find 'ay='
const ayIndex = content.indexOf('ay=');
if (ayIndex !== -1) {
  console.log('Found ay= at index:', ayIndex);
  console.log('Context:', content.substring(ayIndex, ayIndex + 500));
} else {
  console.log('ay= not found');
}

// Find 'class K0' or 'K0='
const k0Index = content.indexOf('K0=');
if (k0Index !== -1) {
  console.log('Found K0= at index:', k0Index);
  console.log('Context:', content.substring(k0Index, k0Index + 500));
}

// Find '/v1/w3s/developer/transactions'
const epIndex = content.indexOf('/v1/w3s/developer/transactions');
if (epIndex !== -1) {
  console.log('Found endpoint at index:', epIndex);
  console.log('Context:', content.substring(epIndex - 200, epIndex + 200));
}
