const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');
// Did I mess up anything else?
// The first script ran on lines with `MASTERS_` and `SEALED_`.
// The second script ran on lines with `SEALED_` and `const [A-Z0-9_]+ = \[`.
