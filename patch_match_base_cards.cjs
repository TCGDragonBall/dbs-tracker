const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target1 = `                    const myCard = cards.find(c => c.id === match.leaderId);
                    const oppCard = cards.find(c => c.id === match.opponentLeader);`;

const replacement1 = `                    const myCard = cards.find(c => c.id === match.leaderId.split('_')[0]);
                    const oppCard = cards.find(c => c.id === match.opponentLeader.split('_')[0]);`;

// Need to replace all occurrences since the list exists in both tabs now
content = content.replace(new RegExp(target1.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), replacement1);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched match base cards");
