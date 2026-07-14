const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');
console.log(content.match(/topLeaderId =/g));
