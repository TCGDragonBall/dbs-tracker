const fs = require('fs');

let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const newOverrides = `  'P-219_TV_SE': { sourceProduct: '2021 Tournament Pack Vault Set' },
  'P-219_TV_SE': 'https://dragonball.center/files/module_dbc/objetos/51/yvvb116583.jpg',
  'P-261_TV_SE': { sourceProduct: '2021 Tournament Pack Vault Set' },
  'P-261_TV_SE': 'https://dragonball.center/files/module_dbc/objetos/69/7u90116584.jpg',
  'P-284_TV_SE': { sourceProduct: '2021 Tournament Pack Vault Set' },
  'P-284_TV_SE': 'https://dragonball.center/files/module_dbc/objetos/78/bxl2116585.jpg',
  'P-293_TV_SE': { sourceProduct: '2021 Tournament Pack Vault Set' },
  'P-293_TV_SE': 'https://dragonball.center/files/module_dbc/objetos/109/jzb3116586.jpg',
  'P-302_TV_SE': { sourceProduct: '2021 Tournament Pack Vault Set' },
  'P-302_TV_SE': 'https://dragonball.center/files/module_dbc/objetos/67/bt5o116587.jpg',
  'P-310_TV_SE': { sourceProduct: '2021 Tournament Pack Vault Set' },
  'P-310_TV_SE': 'https://dragonball.center/files/module_dbc/objetos/26/i9ya116588.jpg',
`;

data = data.replace('const IMAGE_OVERRIDES: Record<string, string | { sourceProduct: string }> = {', 'const IMAGE_OVERRIDES: Record<string, string | { sourceProduct: string }> = {\n' + newOverrides);
fs.writeFileSync('src/TrackerApp.tsx', data);
