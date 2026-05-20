import * as fs from 'fs';

const filePath = 'src/data/bt1.ts';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// 1. Remove BT1-107_PR02 duplicates
lines = lines.filter(line => !line.startsWith('BT1-107_PR02\t'));

// 2. Add BT1-005_PR03 and PR04
const bt1_005_index = lines.findIndex(line => line.startsWith('BT1-005_JP04\t'));
if (bt1_005_index !== -1) {
  lines.splice(bt1_005_index + 1, 0, 
    'BT1-005_PR03\tFurthering Destruction Champa\tPR\tBattle\tRed\tBT1',
    'BT1-005_PR04\tFurthering Destruction Champa\tPR\tBattle\tRed\tBT1'
  );
}

// 3. Add BT1-110_PR03
const bt1_110_index = lines.findIndex(line => line.startsWith('BT1-110_JP04\t'));
if (bt1_110_index !== -1) {
  lines.splice(bt1_110_index + 1, 0,
    'BT1-110_PR03\tCrusher Ball\tPR\tExtra\tYellow\tBT1'
  );
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Fixed bt1.ts');
