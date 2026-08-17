const fs = require('fs');

const path = 'src/TrackerApp.tsx';
let content = fs.readFileSync(path, 'utf-8');

// Also removing SEALED items inside any array variable declaration
const regex = /'SEALED_[A-Z0-9_]+',\s*/g;
const regex2 = /,\s*'SEALED_[A-Z0-9_]+'/g;

let lines = content.split('\n');
let replaced = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('SEALED_') && lines[i].match(/const [A-Z0-9_]+ = \[/)) {
     let original = lines[i];
     lines[i] = lines[i].replace(regex, '');
     lines[i] = lines[i].replace(regex2, '');
     if (original !== lines[i]) replaced++;
  }
}

console.log('Replaced array declarations lines:', replaced);
fs.writeFileSync(path, lines.join('\n'), 'utf-8');
