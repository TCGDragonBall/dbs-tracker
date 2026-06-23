const fs = require('fs');

let code = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

code = code.replace(
  /  'TB3-018': \{ id: 'TB3-018_GS', label: \{ es: 'Giant Size', en: 'Giant Size' \}, isFoil: false \},\n/g,
  ''
);
code = code.replace(
  /  'BT5-001': \{ id: 'BT5-001_GS', label: \{ es: 'Giant Size', en: 'Giant Size' \}, isFoil: false \},\n/g,
  ''
);
code = code.replace(
  /  'BT5-079': \{ id: 'BT5-079_GS', label: \{ es: 'Giant Size', en: 'Giant Size' \}, isFoil: false \},\n/g,
  ''
);
code = code.replace(
  /  'BT5-105': \{ id: 'BT5-105_GS', label: \{ es: 'Giant Size', en: 'Giant Size' \}, isFoil: false \}\n/g,
  ''
);

// We might have left a trailing comma on 'P-089'
code = code.replace(
  /'P-089': \{ id: 'P-089_OT19', label: \{ es: 'Otakon 2019', en: 'Otakon 2019' \}, isFoil: false \},/g,
  "'P-089': { id: 'P-089_OT19', label: { es: 'Otakon 2019', en: 'Otakon 2019' }, isFoil: false }"
);

fs.writeFileSync('src/TrackerApp.tsx', code);
console.log('Removed GS from variants');
