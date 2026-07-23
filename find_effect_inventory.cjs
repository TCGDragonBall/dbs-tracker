const fs = require('fs');
const content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('useEffect(')) {
    let j = i;
    while (j < lines.length && !lines[j].includes('}, [')) {
      j++;
    }
    if (j < lines.length && lines[j].includes('inventory')) {
      console.log(`useEffect around line ${i + 1} depends on inventory: ${lines[j].trim()}`);
    }
  }
}
