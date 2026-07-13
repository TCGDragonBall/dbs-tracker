import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const indexesToRemove = [1867, 1868];
// Wait, I'll just rely on JS object overwriting because it's safer than guessing line numbers which shift around.
// But I will remove line 1867 and 1868 just by filtering out strings.

content = content.filter(line => 
  !line.includes("'BT1-005_PR03': { sourceProduct: 'EXPANSION SET Magnificent Collection -Forsaken Warrior-' }") &&
  !line.includes("'BT1-005_PR04': { sourceProduct: 'Special Anniversary Box 2021' }")
);

fs.writeFileSync('src/App.tsx', content.join('\n'));
console.log('Duplicates removed');
