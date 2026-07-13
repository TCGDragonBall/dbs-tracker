const fs = require('fs');
let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

if (!app.includes("'SEALED_DELUXE_PACK_2026_V2', 'SEALED_ULTRA_BOUT_TP_V2'")) {
  app = app.replace(
    /'SEALED_DELUXE_PACK_2026_V1',/g,
    "$& 'SEALED_DELUXE_PACK_2026_V2',"
  );
  
  fs.writeFileSync('src/TrackerApp.tsx', app);
  console.log('Fixed array injection');
} else {
  console.log('Already there');
}
