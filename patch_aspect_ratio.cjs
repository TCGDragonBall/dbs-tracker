const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// replace aspect-[3/4] with aspect-[2/3] everywhere in MatchesView
content = content.replace(/aspect-\[3\/4\]/g, 'aspect-[2/3]');

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched aspect ratios");
