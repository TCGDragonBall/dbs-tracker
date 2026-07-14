const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `if (leaderColorFilter === 'Multi') {
        list = list.filter(c => c.color.includes('/') || c.color.includes('-'));
      } else {`;

const replacement = `if (leaderColorFilter === 'Multi') {
        list = list.filter(c => c.color.includes('/') || c.color.includes('-') || c.color.toLowerCase().includes('multi'));
      } else {`;

content = content.replace(target, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched multi filter");
