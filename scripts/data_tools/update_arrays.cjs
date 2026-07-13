const fs = require('fs');
let code = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

code = code.replace(/'ANIMENEXT_2019', 'PREMIUM_COLLECTION_FOLDER'/, "'ANIMENEXT_2019', 'ORIGINS_2019', 'PREMIUM_COLLECTION_FOLDER'");

code = code.replace(
  /'PLAYMATS_MASTERS_FOLDER': \['ANIMENEXT_2019'\]/,
  "'PLAYMATS_MASTERS_FOLDER': ['ANIMENEXT_2019', 'ORIGINS_2019']"
);

code = code.replace(
  /'ANIMENEXT_2019': \['PM-AN2019-01', 'PM-AN2019-02', 'PM-AN2019-03', 'PM-AN2019-04', 'PM-AN2019-05'\],/,
  "'ANIMENEXT_2019': ['PM-AN2019-01', 'PM-AN2019-02', 'PM-AN2019-03', 'PM-AN2019-04', 'PM-AN2019-05'],\n  'ORIGINS_2019': ['PM-OR2019-01', 'PM-OR2019-02', 'PM-OR2019-03', 'PM-OR2019-04', 'PM-OR2019-05', 'PM-OR2019-06', 'PM-OR2019-07', 'PM-OR2019-08', 'PM-OR2019-09', 'PM-OR2019-10', 'PM-OR2019-11', 'PM-OR2019-12', 'PM-OR2019-13', 'PM-OR2019-14', 'PM-OR2019-15', 'PM-OR2019-16', 'PM-OR2019-17', 'PM-OR2019-18', 'PM-OR2019-19', 'PM-OR2019-20', 'PM-OR2019-21', 'PM-OR2019-22'],"
);

// Add sleeve to SLEEVES_FOLDER
code = code.replace(
  /('SLEEVES_FOLDER': \[.*?)(],)/,
  "$1, 'SL-OR2019'$2"
);

// Finally, enable COL02
code = code.replace(
  /\{ id: 'COL02', label: 'Giant Size Cards', sub: 'Próximamente', locked: true \},/,
  "{ id: 'COL02', label: 'Giant Size Cards', sub: 'Cartas Especiales', locked: false },"
);


fs.writeFileSync('src/TrackerApp.tsx', code);
console.log('Appended ORIGINS_2019 items.');
