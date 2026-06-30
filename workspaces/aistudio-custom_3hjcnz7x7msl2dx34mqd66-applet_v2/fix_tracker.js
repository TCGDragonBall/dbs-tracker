const fs = require('fs');

let content = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');

// Fix the line 1107
content = content.replace(/{ id: 'CASES_MASTERS_FOLDER', 'CASE_CELEBRATIONS_2019', 'SEPARATORS_MASTERS_FOLDER', 'SEP_CELEBRATIONS_2019', 'PM_CELEBRATIONS_2019', 'SL_CELEBRATIONS_2019', 'PM_CHAMPIONSHIP_2019', label: 'Championship 2019', sub: 'Eventos' },/g, "{ id: 'PM_CHAMPIONSHIP_2019', label: 'Championship 2019', sub: 'Eventos' },");

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf-8');
console.log("Fixed TrackerApp.tsx");
