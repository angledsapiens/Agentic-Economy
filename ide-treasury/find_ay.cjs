const fs = require('fs');
const path = 'node_modules/@circle-fin/developer-controlled-wallets/dist/developer-controlled-wallets.es.js';
const content = fs.readFileSync(path, 'utf8');

// Find 'ay=({'
const ayFuncIndex = content.indexOf('ay=({');
if (ayFuncIndex !== -1) {
  console.log('Found ay=({ at index:', ayFuncIndex);
  console.log('Context for ay func:', content.substring(ayFuncIndex, ayFuncIndex + 500));
} else {
  // Try with spaces
  const ayFuncIndex2 = content.indexOf('ay = ({');
  if (ayFuncIndex2 !== -1) {
    console.log('Found ay = ({ at index:', ayFuncIndex2);
    console.log('Context for ay func 2:', content.substring(ayFuncIndex2, ayFuncIndex2 + 500));
  } else {
    console.log('ay=({ not found');
  }
}

// Find 'K0=' or 'class K0'
const k0Index = content.indexOf('K0=');
if (k0Index !== -1) {
  console.log('Found K0= at index:', k0Index);
  console.log('Context for K0:', content.substring(k0Index, k0Index + 500));
}

// Find ALL occurrences of endpoint
let pos = 0;
while (true) {
  const found = content.indexOf('/v1/w3s/developer/transactions', pos);
  if (found === -1) break;
  console.log('Found endpoint at index:', found);
  console.log('Context:', content.substring(found, found + 100));
  console.log('Context (pre):', content.substring(found - 100, found));
  console.log('---');
  pos = found + 1;
}
