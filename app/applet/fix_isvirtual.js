const fs = require('fs');

let content = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');

// Update isVirtualSet
content = content.replace(
  /'PLAYMATS_MASTERS_FOLDER', 'ANIMENEXT_2019',/g,
  "'CASES_MASTERS_FOLDER', 'CASE_CELEBRATIONS_2019', 'SEPARATORS_MASTERS_FOLDER', 'SEP_CELEBRATIONS_2019', 'PM_CELEBRATIONS_2019', 'SL_CELEBRATIONS_2019', 'PLAYMATS_MASTERS_FOLDER', 'ANIMENEXT_2019',"
);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf-8');
console.log("Fixed isVirtualSet");
