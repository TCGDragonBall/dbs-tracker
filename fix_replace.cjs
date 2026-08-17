const fs = require('fs');
const path = 'src/TrackerApp.tsx';
let content = fs.readFileSync(path, 'utf-8');

const tTarget = `targetExpansion = selectedCard.id.replace('MASTERS_CHAMPIONSHIP_');`;
const tRepl = `targetExpansion = selectedCard.id.replace('SEALED_', 'MASTERS_');`;

if (content.includes(tTarget)) {
  content = content.replace(tTarget, tRepl);
  fs.writeFileSync(path, content, 'utf-8');
  console.log('Fixed replace bug');
} else {
  console.log('Target not found for replace bug');
}
