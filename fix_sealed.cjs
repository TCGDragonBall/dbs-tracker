const fs = require('fs');

const path = 'src/TrackerApp.tsx';
let content = fs.readFileSync(path, 'utf-8');

// The groups object is MASTER_GROUPS, but we can just do a regex replace 
// in the context of the file where we see ['SEALED_..., 'P-002'...]

const regex = /'SEALED_[A-Z0-9_]+',\s*/g;
const regex2 = /,\s*'SEALED_[A-Z0-9_]+'/g;
const regex3 = /\['SEALED_[A-Z0-9_]+'\]/g; // If it's the only element, shouldn't happen but just in case.

// Let's first test what it matches.
let lines = content.split('\n');
let replaced = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('MASTERS_') && lines[i].includes('SEALED_')) {
     let original = lines[i];
     lines[i] = lines[i].replace(regex, '');
     lines[i] = lines[i].replace(regex2, '');
     if (original !== lines[i]) replaced++;
  }
}

console.log('Replaced lines:', replaced);
fs.writeFileSync(path, lines.join('\n'), 'utf-8');
