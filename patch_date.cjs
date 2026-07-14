const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');
content = content.replace(/type="date" \n                required/g, 'type="date" \n                required\n                style={{ colorScheme: "dark" }}');
fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched datepicker");
