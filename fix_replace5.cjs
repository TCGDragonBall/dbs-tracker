const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');
const before = content.match(/inventory\.filter/g)?.length || 0;
console.log("Found " + before + " instances of inventory.filter");
