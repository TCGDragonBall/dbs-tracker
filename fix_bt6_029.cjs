const fs = require('fs');
let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const newMeta = `  'BT6-029_PR': { sourceProduct: 'Magnificent Collection' },\n`;
if (!data.includes("'BT6-029_PR': { sourceProduct:")) {
    data = data.replace('const CARD_METADATA: Record<string, { sourceProduct: string; releaseDate?: string }> = {', 'const CARD_METADATA: Record<string, { sourceProduct: string; releaseDate?: string }> = {\n' + newMeta);
}

const newOverride = `  'BT6-029_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT6-029_PR.png',\n`;
if (!data.includes("'BT6-029_PR': 'https://www.dbs-cardgame")) {
    data = data.replace('const IMAGE_OVERRIDES: Record<string, string> = {', 'const IMAGE_OVERRIDES: Record<string, string> = {\n' + newOverride);
}

// Update changelog 4.1.15 to include it
data = data.replace(
  "es: 'Añadida la carta BT6-007_PR de Magnificent Collection.', en: 'Added BT6-007_PR card from Magnificent Collection.'",
  "es: 'Añadidas las cartas BT6-007_PR y BT6-029_PR de Magnificent Collection.', en: 'Added BT6-007_PR and BT6-029_PR cards from Magnificent Collection.'"
);

fs.writeFileSync('src/TrackerApp.tsx', data);
console.log("Updated BT6-029_PR successfully.");
