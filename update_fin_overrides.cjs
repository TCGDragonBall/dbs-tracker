const fs = require('fs');
let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const newOverrides = `
  'P-219_TV_FIN': 'https://dragonball.center/files/module_dbc/objetos/130/kivv116571.jpg',
  'P-261_TV_FIN': 'https://dragonball.center/files/module_dbc/objetos/75/jn0t116572.jpg',
  'P-284_TV_FIN': 'https://dragonball.center/files/module_dbc/objetos/102/go4p116573.jpg',
  'P-293_TV_FIN': 'https://dragonball.center/files/module_dbc/objetos/16/eyr1116574.jpg',
  'P-302_TV_FIN': 'https://dragonball.center/files/module_dbc/objetos/70/nj16116575.jpg',
  'P-310_TV_FIN': 'https://dragonball.center/files/module_dbc/objetos/15/9pz5116576.jpg',
`;

const newMeta = `
  'P-219_TV_FIN': { sourceProduct: 'Championship 2021 Vault Set Finalist' },
  'P-261_TV_FIN': { sourceProduct: 'Championship 2021 Vault Set Finalist' },
  'P-284_TV_FIN': { sourceProduct: 'Championship 2021 Vault Set Finalist' },
  'P-293_TV_FIN': { sourceProduct: 'Championship 2021 Vault Set Finalist' },
  'P-302_TV_FIN': { sourceProduct: 'Championship 2021 Vault Set Finalist' },
  'P-310_TV_FIN': { sourceProduct: 'Championship 2021 Vault Set Finalist' },
`;

if (!data.includes("'P-219_TV_FIN': 'https://dragonball.center")) {
    data = data.replace('const IMAGE_OVERRIDES: Record<string, string> = {', 'const IMAGE_OVERRIDES: Record<string, string> = {' + newOverrides);
}
if (!data.includes("'P-219_TV_FIN': { sourceProduct")) {
    data = data.replace('const CARD_METADATA: Record<string, { sourceProduct: string; releaseDate?: string }> = {', 'const CARD_METADATA: Record<string, { sourceProduct: string; releaseDate?: string }> = {' + newMeta);
}

fs.writeFileSync('src/TrackerApp.tsx', data);
