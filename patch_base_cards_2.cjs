const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

content = content.replace(/const myCard = cards\.find\(c => c\.id === match\.leaderId\);/g, "const myCard = cards.find(c => c.id === match.leaderId.split('_')[0]);");
content = content.replace(/const oppCard = cards\.find\(c => c\.id === match\.opponentLeader\);/g, "const oppCard = cards.find(c => c.id === match.opponentLeader.split('_')[0]);");

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched base cards 2");
