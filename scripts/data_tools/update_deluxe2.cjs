const fs = require('fs');

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const missing1 = `  'MASTERS_SEALED_DELUXE_PACK_2026_V2': ['SEALED_DELUXE_PACK_2026_V2'],\n`;
if (!app.includes("'MASTERS_SEALED_DELUXE_PACK_2026_V2': ['SEALED")) {
  app = app.replace(
    /'MASTERS_SEALED_DELUXE_PACK_2026_V1': \['SEALED_DELUXE_PACK_2026_V1'\],/g,
    "$& \n" + missing1
  );
}

// Add a placeholder image for the sealed box
const missing2 = `  'SEALED_DELUXE_PACK_2026_V2': 'https://dragonball.center/files/module_dbc/objetos/0/u0nt175101.jpg',\n`;
if (!app.includes("'SEALED_DELUXE_PACK_2026_V2': 'https")) {
  app = app.replace(
    /'SEALED_DELUXE_PACK_2026_V1': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/0\/u0nt175101\.jpg',/g,
    "$& \n" + missing2
  );
}

const missing3 = `  'MASTERS_SEALED_DELUXE_PACK_2026_V2': 'https://dragonball.center/files/module_dbc/objetos/0/u0nt175101.jpg',\n`;
if (!app.includes("'MASTERS_SEALED_DELUXE_PACK_2026_V2': 'https")) {
  app = app.replace(
    /'MASTERS_SEALED_DELUXE_PACK_2026_V1': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/0\/u0nt175101\.jpg',/g,
    "$& \n" + missing3
  );
}

fs.writeFileSync('src/TrackerApp.tsx', app);
console.log('TrackerApp updated successfully 2!');
