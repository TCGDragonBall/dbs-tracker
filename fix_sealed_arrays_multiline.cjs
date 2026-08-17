const fs = require('fs');
const path = 'src/TrackerApp.tsx';
let content = fs.readFileSync(path, 'utf-8');

const regex1 = /'SEALED_[A-Z0-9_]+',\s*/g;
const regex2 = /,\s*'SEALED_[A-Z0-9_]+'/g;
const regex3 = /'SEALED_[A-Z0-9_]+'/g; // as fallback

// Find any block from `const NAME = [` to `];` and remove SEALED strings
// It's safer to just run replace over the whole block of arrays (lines 7000 to 8000)
let lines = content.split('\n');
let insideArray = false;
let replaced = 0;

for (let i = 7000; i < 8000; i++) {
  // If line contains SEALED_ but it is NOT one of the `MASTERS_SEALED_...` mappings
  if (lines[i].includes('SEALED_') && !lines[i].includes('MASTERS_SEALED_')) {
     let original = lines[i];
     lines[i] = lines[i].replace(regex1, '');
     lines[i] = lines[i].replace(regex2, '');
     // Only if they are elements of array, not property keys. Property keys are like `'MASTERS_SEALED_TP01':`
     // Oh, wait, in MASTERS_GROUPS we have `'MASTERS_TP01': [...]` and `'MASTERS_SEALED_TP01': ['SEALED_TP01']`
     if (original !== lines[i]) replaced++;
  }
}

console.log('Replaced lines:', replaced);
fs.writeFileSync(path, lines.join('\n'), 'utf-8');
