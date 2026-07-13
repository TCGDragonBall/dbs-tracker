import fs from 'fs';

let promos = fs.readFileSync('src/data/promos.ts', 'utf8');
const lines = promos.split('\n');
const newLines = lines.filter(line => !line.includes('P-121_PR'));
fs.writeFileSync('src/data/promos.ts', newLines.join('\n'));
console.log('Fixed P-121_PR in promos.ts');
