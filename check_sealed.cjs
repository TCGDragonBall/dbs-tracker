const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');
let lines = content.split('\n');
for (let i = 7000; i < 8500; i++) {
  if (lines[i] && lines[i].includes('SEALED_')) {
     if (!lines[i].includes('MASTERS_SEALED_') && !lines[i].includes('FUSION_SEALED_')) {
         console.log(i + 1, lines[i]);
     }
  }
}
