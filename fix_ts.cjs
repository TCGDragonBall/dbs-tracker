const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

content = content.replace("result: 'win' as 'win'|'loss',", "result: 'win' as 'win'|'loss'|'draw',");
content = content.replace("  Edit2,\n  Trash2", "  Edit2");

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Fixed TS errors");
