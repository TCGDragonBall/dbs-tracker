import fs from 'fs';

let promos = fs.readFileSync('src/data/promos.ts', 'utf8');
const lines = promos.split('\n');
const newLines = lines.filter(line => !line.includes('_PB01_F'));
fs.writeFileSync('src/data/promos.ts', newLines.join('\n'));
console.log('Fixed promos.ts for PB01');

let tracker = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Fix POWER_BOOSTER_01
tracker = tracker.replace(
  /const POWER_BOOSTER_01 = \['P-112', 'P-112_PB01_F', 'P-113', 'P-113_PB01_F', 'P-114', 'P-114_PB01_F', 'P-115', 'P-115_PB01_F', 'P-116', 'P-116_PB01_F'\];/g,
  "const POWER_BOOSTER_01 = ['P-112', 'P-113', 'P-114', 'P-115', 'P-116'];"
);

// hasFoil list
const matchStr = "'P-126', 'P-127'";
const replaceStr = "'P-112', 'P-113', 'P-114', 'P-115', 'P-116', 'P-119', 'P-120', 'P-121', 'P-122', 'P-123', 'P-126', 'P-127'";

if (tracker.includes(matchStr) && !tracker.includes("'P-119', 'P-120'")) {
    tracker = tracker.replace(matchStr, replaceStr);
}

fs.writeFileSync('src/TrackerApp.tsx', tracker);
console.log('Fixed TrackerApp.tsx fully');
