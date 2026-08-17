const fs = require('fs');
const path = 'src/TrackerApp.tsx';
let content = fs.readFileSync(path, 'utf-8');

const tTarget = `      <div className={\`\${isHorizontalFormat(selectedCard) ? 'w-full max-w-[400px]' : 'w-[88px] sm:w-24 shrink-0'} shadow-xl rounded-xl\`} >`;
const tRepl = `      <div className={\`\${isHorizontalFormat(selectedCard) ? 'w-full max-w-[600px]' : 'w-[88px] sm:w-24 shrink-0'} shadow-xl rounded-xl\`} >`;

if (content.includes(tTarget)) {
  content = content.replace(tTarget, tRepl);
  fs.writeFileSync(path, content, 'utf-8');
  console.log('Fixed Modal parent container size');
} else {
  console.log('Target not found for Modal parent container size');
}
