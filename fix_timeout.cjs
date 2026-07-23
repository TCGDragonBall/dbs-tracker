const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

content = content.replace(
  /const timeout = setTimeout\(runChecks, 1500\);/g,
  "const timeout = setTimeout(runChecks, 400);"
);

fs.writeFileSync('src/TrackerApp.tsx', content);
