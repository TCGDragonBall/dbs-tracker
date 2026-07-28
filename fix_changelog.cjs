const fs = require('fs');

let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const newChangelog = `  {
    version: '4.1.9',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Añadidas las cartas de Championship 2021 Tournament Pack Vault Set Side Event en la categoría de coleccionismo y corregido el formato de rarezas ALT y (★★).', en: 'Added Championship 2021 Tournament Pack Vault Set Side Event cards in collections and fixed ALT and (★★) rarity formats.' }
    ]
  },
`;

data = data.replace('const CHANGELOG = [', 'const CHANGELOG = [\n' + newChangelog);
fs.writeFileSync('src/TrackerApp.tsx', data);
