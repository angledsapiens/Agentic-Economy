const fs = require('fs');
const path = 'd:\\Projects\\Agentic Treasury\\ide-treasury\\node_modules\\@circle-fin\\developer-controlled-wallets\\dist\\developer-controlled-wallets.es.js';

try {
  const content = fs.readFileSync(path, 'utf8');
  console.log('File read successfully. Size:', content.length);

  const keywords = ['retry', 'timeout', 'axios'];

  keywords.forEach(kw => {
    console.log(`\nSearching for "${kw}"...`);
    let count = 0;
    let idx = content.indexOf(kw);
    while (idx !== -1 && count < 5) { // Limit to 5 matches per keyword
      const start = Math.max(0, idx - 100);
      const end = Math.min(content.length, idx + 100);
      console.log(`Match #${count + 1} at ${idx}:`);
      console.log(content.substring(start, end));
      idx = content.indexOf(kw, idx + 1);
      count++;
    }
    if (count === 0) console.log('No matches found.');
  });
} catch (err) {
  console.error('Error reading file:', err);
}
