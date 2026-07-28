const fs = require('fs');
let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const newMeta = `
  'P-219_TV_SE': { sourceProduct: 'Championship 2021 Vault Set Side Event' },
  'P-261_TV_SE': { sourceProduct: 'Championship 2021 Vault Set Side Event' },
  'P-284_TV_SE': { sourceProduct: 'Championship 2021 Vault Set Side Event' },
  'P-293_TV_SE': { sourceProduct: 'Championship 2021 Vault Set Side Event' },
  'P-302_TV_SE': { sourceProduct: 'Championship 2021 Vault Set Side Event' },
  'P-310_TV_SE': { sourceProduct: 'Championship 2021 Vault Set Side Event' },
`;

if (!data.includes("'P-219_TV_SE': { sourceProduct")) {
    data = data.replace('const CARD_METADATA: Record<string, { sourceProduct: string; releaseDate?: string }> = {', 'const CARD_METADATA: Record<string, { sourceProduct: string; releaseDate?: string }> = {' + newMeta);
    fs.writeFileSync('src/TrackerApp.tsx', data);
    console.log("Added metadata");
} else {
    console.log("Metadata already present");
}
