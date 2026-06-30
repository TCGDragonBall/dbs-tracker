const fs = require('fs');

let content = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');

// Remove the entries from SLEEVES_FOLDER in FUSION_CATEGORIES
content = content.replace(
  "{ id: 'SL_CELEBRATIONS_2019', label: 'Celebrations 2019', sub: 'Eventos' },",
  ""
);
content = content.replace(
  "{ id: 'SL_MALICIOUS_MACHINATIONS', label: 'Malicious Machinations', sub: 'Eventos' },",
  ""
);

// Replace COL11 definition
content = content.replace(
  "{ id: 'COL11', label: 'Fundas', sub: 'Sleeves' },",
  `{
        id: 'SLEEVES_MASTERS_FOLDER',
        label: 'Fundas',
        sub: 'Accessories',
        locked: false,
        subItems: [
          { id: 'COL11', label: 'Fundas Generales', sub: 'Sleeves' },
          { id: 'SL_CELEBRATIONS_2019', label: 'Celebrations 2019', sub: 'Eventos' },
          { id: 'SL_MALICIOUS_MACHINATIONS', label: 'Malicious Machinations', sub: 'Eventos' }
        ]
      },`
);

// Add SLEEVES_MASTERS_FOLDER and COL11 to PACK_ARRAYS
if (!content.includes("'SLEEVES_MASTERS_FOLDER':")) {
  content = content.replace(
    "'SLEEVES_FOLDER': [",
    `'SLEEVES_MASTERS_FOLDER': ['COL11', 'SL_MALICIOUS_MACHINATIONS', 'SL_CELEBRATIONS_2019'],\n  'COL11': ['SL-M01', 'SL-OR2019'],\n  'SLEEVES_FOLDER': [`
  );
}

// Ensure SLEEVES_MASTERS_FOLDER is in isVirtualSet
if (!content.includes("'SLEEVES_MASTERS_FOLDER'")) {
  content = content.replace(
    "'SLEEVES_FOLDER'",
    "'SLEEVES_FOLDER', 'SLEEVES_MASTERS_FOLDER'"
  );
}

fs.writeFileSync('src/TrackerApp.tsx', content);
console.log("Done");
