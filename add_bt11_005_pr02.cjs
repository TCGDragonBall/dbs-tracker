const fs = require('fs');

const bt11Path = 'src/data/bt11.ts';
let bt11Data = fs.readFileSync(bt11Path, 'utf8');

if (!bt11Data.includes('BT11-005_PR02')) {
  const lines = bt11Data.split('\n');
  const bt11005Line = lines.find(l => l.startsWith('BT11-005\t'));
  if (bt11005Line) {
    const newLine = bt11005Line.replace('BT11-005\t', 'BT11-005_PR02\t').replace('\tR\t', '\tPR\t');
    const insertIndex = lines.findIndex(l => l.startsWith('BT11-005\t')) + 1;
    lines.splice(insertIndex, 0, newLine);
    fs.writeFileSync(bt11Path, lines.join('\n'));
    console.log("Added BT11-005_PR02 to bt11.ts");
  }
}
