const fs = require('fs');

let cardsData = fs.readFileSync('src/data/bt11.ts', 'utf8');
const cardLine = cardsData.split('\n').find(l => l.includes('BT11-005_PR'));
console.log("Line starts with BT11-005_PR:", cardLine.startsWith('BT11-005_PR\t'));
