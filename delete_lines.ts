import * as fs from 'fs';

const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
lines.splice(223, 41);
fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log('Removed bad lines');
