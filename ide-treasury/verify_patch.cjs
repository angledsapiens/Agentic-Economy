const fs = require('fs');
const path = 'node_modules/@circle-fin/developer-controlled-wallets/dist/developer-controlled-wallets.es.js';
const content = fs.readFileSync(path, 'utf8');

const target = 'const n="/v1/w3s/developer/transactions/transfer",s=new URL(n,Se);let i;e&&(i=e.baseOptions);const o={method:"POST"';
const count = content.split(target).length - 1;

console.log('Target string count:', count);
if (count === 1) {
  console.log('Target is unique. Safe to replace.');
} else {
  console.log('Target NOT unique or not found.');
  // Debug: print similar strings
  const index = content.indexOf('/v1/w3s/developer/transactions');
  if (index !== -1) {
    console.log('Actual content around endpoint:');
    console.log(content.substring(index, index + 300));
  }
}
