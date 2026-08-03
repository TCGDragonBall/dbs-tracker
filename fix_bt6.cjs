const fs = require('fs');

let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const newMeta = `  'BT6-007_PR': { sourceProduct: 'Magnificent Collection' },\n`;
if (!data.includes("'BT6-007_PR': { sourceProduct:")) {
    data = data.replace('const CARD_METADATA: Record<string, { sourceProduct: string; releaseDate?: string }> = {', 'const CARD_METADATA: Record<string, { sourceProduct: string; releaseDate?: string }> = {\n' + newMeta);
}

const newOverride = `  'BT6-007_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT6-007_PR.png',\n`;
if (!data.includes("'BT6-007_PR': 'https://www.dbs-cardgame")) {
    data = data.replace('const IMAGE_OVERRIDES: Record<string, string> = {', 'const IMAGE_OVERRIDES: Record<string, string> = {\n' + newOverride);
}

const newChangelog = `  {
    version: '4.1.15',
    date: '1 de agosto de 2026',
    changes: [
      { es: 'Añadida la carta BT6-007_PR de Magnificent Collection.', en: 'Added BT6-007_PR card from Magnificent Collection.' }
    ]
  },
`;
data = data.replace('const CHANGELOG = [', 'const CHANGELOG = [\n' + newChangelog);

fs.writeFileSync('src/TrackerApp.tsx', data);
console.log("Updated BT6-007_PR successfully.");
