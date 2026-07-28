const fs = require('fs');

let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Undo the bad changelog addition if possible, or just add 4.1.12
// Let's just find the first "version: '4.1.9'" we added, wait, we added it right after const CHANGELOG = [
// We can just replace version: '4.1.9' with version: '4.1.12' in the very first occurrence.
data = data.replace(/version: '4\.1\.9'/, "version: '4.1.12'");
fs.writeFileSync('src/TrackerApp.tsx', data);
