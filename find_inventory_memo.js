const fs = require('fs');
const content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const regex = /useMemo\([^\[]*\[([^\]]*inventory[^\]]*)\]\)/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const substr = content.substring(Math.max(0, match.index - 50), match.index + 50);
  console.log(`Match at index ${match.index}: dependencies [${match[1]}]`);
  console.log(`Context: ${substr}`);
}
