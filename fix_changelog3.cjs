const fs = require('fs');

let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const newChangelog = `  {
    version: '4.1.13',
    date: '8 de mayo de 2026',
    changes: [
      { es: 'Añadidas las cartas de Championship 2021 Tournament Pack Vault Set Finalist en la categoría de coleccionismo.', en: 'Added Championship 2021 Tournament Pack Vault Set Finalist cards in collections.' }
    ]
  },
`;

data = data.replace('const CHANGELOG = [', 'const CHANGELOG = [\n' + newChangelog);
fs.writeFileSync('src/TrackerApp.tsx', data);
