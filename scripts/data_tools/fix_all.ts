import fs from 'fs';

// 1. Remove _TP07_F from promos.ts
let promos = fs.readFileSync('src/data/promos.ts', 'utf8');
const lines = promos.split('\n');
const newLines = lines.filter(line => !line.includes('_TP07_F'));
fs.writeFileSync('src/data/promos.ts', newLines.join('\n'));
console.log('Fixed promos.ts');

// 2. Fix TrackerApp.tsx
let tracker = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Add missing SEALED_TP07 to IMAGE_OVERRIDES
if (!tracker.includes("'SEALED_TP07': 'https://dragonball.center/files/module_dbc/objetos/96/cwxq36507.jpg'")) {
  tracker = tracker.replace(
      /'SEALED_TP06': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/71\/mlxq36458\.jpg',/g,
      "$& \n  'SEALED_TP07': 'https://dragonball.center/files/module_dbc/objetos/96/cwxq36507.jpg',"
  );
}

// Fix the array
tracker = tracker.replace(
  /'MASTERS_TP07': \['SEALED_TP07', 'P-126', 'P-126_TP07_F', 'P-127', 'P-127_TP07_F', 'P-128', 'P-128_TP07_F', 'P-129', 'P-129_TP07_F', 'P-130', 'P-130_TP07_F', 'P-131', 'P-131_TP07_F', 'P-132', 'P-132_TP07_F', 'P-133', 'P-133_TP07_F'\],/g,
  "'MASTERS_TP07': ['SEALED_TP07', 'P-126', 'P-127', 'P-128', 'P-129', 'P-130', 'P-131', 'P-132', 'P-133'],"
);

// Fix the image code replace
tracker = tracker.replace(
  /\.replace\(\/\_TP07\_F\$\/, '\_PR'\)/g,
  ""
);

// Add to foil array
const matchStr = "'P-101', 'P-102']";
const replaceStr = "'P-101', 'P-102', 'P-126', 'P-127', 'P-128', 'P-129', 'P-130', 'P-131', 'P-132', 'P-133']";
if (tracker.includes(matchStr) && !tracker.includes("'P-133']")) {
  tracker = tracker.replace(matchStr, replaceStr);
}

fs.writeFileSync('src/TrackerApp.tsx', tracker);
console.log('Fixed TrackerApp.tsx');
