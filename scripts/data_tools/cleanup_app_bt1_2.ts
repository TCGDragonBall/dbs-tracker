import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

content = content.filter(line => 
  !line.includes("'BT1-053_PR02': { sourceProduct: 'EXPANSION SET Magnificent Collection -Fusion Hero-' }") &&
  !line.includes("'BT1-053_PR03': { sourceProduct: 'Mythic Booster' },") &&
  !line.includes("'BT1-053_PR05': { sourceProduct: 'Championship Alt Art Card Set 2023 Vol.3' }") &&
  !line.includes("'BT1-055_PR02': { sourceProduct: 'EXPANSION SET Magnificent Collection -Forsaken Warrior-' }")
);

fs.writeFileSync('src/App.tsx', content.join('\n'));
console.log('Duplicates removed again');
