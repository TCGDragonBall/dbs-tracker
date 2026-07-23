const fs = require('fs');
const content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');
const lines = content.split('\n');

let inTrackerApp = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export default function TrackerApp')) {
    inTrackerApp = true;
  }
  if (inTrackerApp && lines[i].includes('useMemo(')) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}
