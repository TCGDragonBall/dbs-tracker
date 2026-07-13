import fs from 'fs';

let tracker = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const targetStr = "'P-101', 'P-102', 'P-126', 'P-127'";
const newStr = "'P-101', 'P-102', 'P-112', 'P-113', 'P-114', 'P-115', 'P-116', 'P-119', 'P-120', 'P-121', 'P-122', 'P-123', 'P-126', 'P-127'";

if (tracker.includes(targetStr) && !tracker.includes("'P-112', 'P-113'")) {
    tracker = tracker.replace(targetStr, newStr);
}

fs.writeFileSync('src/TrackerApp.tsx', tracker);
console.log('Fixed Foil string in TrackerApp.tsx');
