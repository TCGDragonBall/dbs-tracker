const fs = require('fs');

let content = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');

// Fix the menu
content = content.replace(
  /\{ id: 'CASE_CELEBRATIONS_2019', 'CASE_UNIVERSAL_ONSLAUGHT_PRE', 'CASE_UNIVERSAL_ONSLAUGHT', 'SL_MALICIOUS_MACHINATIONS', label: 'Celebrations 2019', sub: 'Eventos' \},/,
  "{ id: 'CASE_CELEBRATIONS_2019', label: 'Celebrations 2019', sub: 'Eventos' },"
);

// Fix isVirtualSet
content = content.replace(
  /  return \['COL01', 'COL02'[\s\S]*?\]\.includes\(setId\)/,
  match => {
     return match.replace(
       /'CASE_CELEBRATIONS_2019',/,
       "'CASE_CELEBRATIONS_2019', 'CASE_UNIVERSAL_ONSLAUGHT_PRE', 'CASE_UNIVERSAL_ONSLAUGHT', 'SL_MALICIOUS_MACHINATIONS',"
     );
  }
);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf-8');
console.log("Success");
