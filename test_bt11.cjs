const fs = require('fs');

const bt11Data = fs.readFileSync('src/data/bt11.ts', 'utf8');
const cardLine = bt11Data.split('\n').find(l => l.startsWith('BT11-005_PR\t'));
if (!cardLine) { console.log("Card NOT found in bt11.ts"); process.exit(1); }

console.log("Card is in bt11.ts");

const trackerCode = fs.readFileSync('src/TrackerApp.tsx', 'utf8');
const hasImage = trackerCode.includes("'BT11-005_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT11-005_PR.png'");
console.log("Image mapped:", hasImage);

const hasExtra = trackerCode.includes("'EXP19': ['BT11-005_PR', 'BT11-005_PR02']");
console.log("EXTRA mapped:", hasExtra);
