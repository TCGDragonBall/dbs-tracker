import fs from 'fs';

let content = fs.readFileSync('src/data/promos.ts', 'utf8');

const parts = content.split('`;');
let mainData = parts[0];
let leaked = parts.slice(1).join('`;') || '';

if (leaked.trim()) {
  mainData = mainData.trim() + '\n' + leaked.trim() + '\n`;\n';
  fs.writeFileSync('src/data/promos.ts', mainData);
  console.log('Fixed');
} else {
  console.log('No leak found');
}
