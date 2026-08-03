const fs = require('fs');
let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// I want to see if !isVirtual && !isExplicitExtra ... is Alt hides it in BT11.
// And if anything else hides it.

console.log("For BT11, isExplicitExtra:", typeof { 'EXP19': ['BT11-005_PR'] }['BT11']);
console.log("For BT11, isVirtual:", false);
console.log("For BT11, isAlt:", "BT11-005_PR".includes('_'));
console.log("So in BT11, if !showAlternatives, it is hidden. (True)");
