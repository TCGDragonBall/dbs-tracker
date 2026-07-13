import fs from 'fs';

let tracker = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const targetRegex = /'P-101', 'P-102', 'P-126'/g;
const newStr = "'P-101', 'P-102', 'P-112', 'P-113', 'P-114', 'P-115', 'P-116', 'P-119', 'P-120', 'P-121', 'P-122', 'P-123', 'P-124', 'P-125', 'P-126'";

if (!tracker.includes(newStr)) {
    tracker = tracker.replace(targetRegex, newStr);
    fs.writeFileSync('src/TrackerApp.tsx', tracker);
    console.log('Fixed Foil array properly');
}
