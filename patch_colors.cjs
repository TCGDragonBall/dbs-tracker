const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `{MATCH_COLORS.map(c => (`;
const replacement = `{MATCH_COLORS.filter(c => gameType === 'fusion' ? c.id !== 'White' && c.id !== 'Multi' : true).map(c => (`;

content = content.replace(target, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched colors");
