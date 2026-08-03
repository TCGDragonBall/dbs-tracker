const fs = require('fs');

// 1. Remove BT11-034_PR and BT11-052_PR from bt11.ts
let bt11 = fs.readFileSync('src/data/bt11.ts', 'utf8');
const lines = bt11.split('\n');
const newLines = lines.filter(line => !line.startsWith('BT11-034_PR\t') && !line.startsWith('BT11-052_PR\t'));
fs.writeFileSync('src/data/bt11.ts', newLines.join('\n'));

// 2. Add EXTRA_SET_CARDS
let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');
app = app.replace(
  "  'EXP8': ['BT1-053_PR02', 'BT1-110_PR03']",
  "  'EXP8': ['BT1-053_PR02', 'BT1-110_PR03'],\n  'EXP19': ['BT11-005_PR'],\n  'SD22': ['BT10-098_PR', 'BT10-099_PR']"
);

// update changelog
app = app.replace(
  "{ es: 'Registrada la imagen para BT11-005_PR.', en: 'Registered image for BT11-005_PR.' }",
  "{ es: 'Registrada la imagen para BT11-005_PR.', en: 'Registered image for BT11-005_PR.' },\n      { es: 'Eliminadas cartas duplicadas BT11-034_PR y BT11-052_PR. Vinculadas BT11-005_PR a EXP19 y BT10-098_PR, BT10-099_PR a SD22.', en: 'Removed duplicate cards BT11-034_PR and BT11-052_PR. Linked BT11-005_PR to EXP19 and BT10-098_PR, BT10-099_PR to SD22.' }"
);

fs.writeFileSync('src/TrackerApp.tsx', app);
