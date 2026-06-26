const fs = require('fs');

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

if (!app.includes("'MASTERS_SEALED_DELUXE_PACK_2026_V2': 'bg-")) {
  app = app.replace(
    /'MASTERS_SEALED_DELUXE_PACK_2026_V1': 'bg-\[50%_25%\]',/g,
    "$& \n  'MASTERS_SEALED_DELUXE_PACK_2026_V2': 'bg-[50%_25%]',"
  );
  
  app = app.replace(
    /'MASTERS_DELUXE_PACK_2026_V1': 'bg-\[50%_25%\]',/g,
    "$& \n  'MASTERS_DELUXE_PACK_2026_V2': 'bg-[50%_25%]',"
  );
  
  fs.writeFileSync('src/TrackerApp.tsx', app);
  console.log('Fixed bg positions');
} else {
  console.log('Already there');
}
