import fs from 'fs';

let promos = fs.readFileSync('src/data/promos.ts', 'utf8');
const lines = promos.split('\n');
const newLines = lines.filter(line => !line.includes('_PB02_F'));
fs.writeFileSync('src/data/promos.ts', newLines.join('\n'));
console.log('Fixed promos.ts');

let tracker = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Fix POWER_BOOSTER_02
tracker = tracker.replace(
  /const POWER_BOOSTER_02 = \['P-119', 'P-119_PB02_F', 'P-120', 'P-120_PB02_F', 'P-121', 'P-121_PB02_F', 'P-122', 'P-122_PB02_F', 'P-123', 'P-123_PB02_F'\];/g,
  "const POWER_BOOSTER_02 = ['P-119', 'P-120', 'P-121', 'P-122', 'P-123'];"
);

// Add 'P-119', 'P-120', 'P-121', 'P-122', 'P-123' to FOIL list if not there
const matchStr2 = "'P-126', 'P-127'";
const replaceStr2 = "'P-119', 'P-120', 'P-121', 'P-122', 'P-123', 'P-126', 'P-127'";
if (tracker.includes(matchStr2) && !tracker.includes("'P-119', 'P-120'")) {
    tracker = tracker.replace(matchStr2, replaceStr2);
}

fs.writeFileSync('src/TrackerApp.tsx', tracker);
console.log('Fixed TrackerApp.tsx');
