const fs = require('fs');

let code = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Add Anime Expo to PLAYMATS_MASTERS_FOLDER array
code = code.replace(
  /'PLAYMATS_MASTERS_FOLDER': \['ANIMENEXT_2019', 'ORIGINS_2019'\],/g,
  "'PLAYMATS_MASTERS_FOLDER': ['ANIMENEXT_2019', 'ORIGINS_2019', 'ANIME_EXPO_2019'],\n  'ANIME_EXPO_2019': ['PM-AX2019-01', 'PM-AX2019-02'],"
);

// Add Anime Expo mapping in the menus
code = code.replace(
  /\{ id: 'ORIGINS_2019', label: 'Origins 2019', sub: 'Eventos' \}/g,
  "{ id: 'ORIGINS_2019', label: 'Origins 2019', sub: 'Eventos' },\n          { id: 'ANIME_EXPO_2019', label: 'Anime Expo 2019', sub: 'Eventos' }"
);

// Add ANIMENEXT_2019 etc to isVirtualSet
code = code.replace(
  /'ORIGINS_2019', 'PREMIUM_COLLECTION_FOLDER'/g,
  "'ORIGINS_2019', 'ANIME_EXPO_2019', 'PREMIUM_COLLECTION_FOLDER'"
);

// We need to inject the EXTRA_VARIANTS_ORIGINS and IMAGE_OVERRIDES.
const extra_variants_add = `,
  'BT1-109': { id: 'BT1-109_OR19', label: { es: 'Origins 2019', en: 'Origins 2019' }, isFoil: false },
  'BT3-120': { id: 'BT3-120_OR19', label: { es: 'Origins 2019', en: 'Origins 2019' }, isFoil: false },
  'BT4-012': { id: 'BT4-012_OR19', label: { es: 'Origins 2019', en: 'Origins 2019' }, isFoil: false },
  'BT4-048': { id: 'BT4-048_OR19', label: { es: 'Origins 2019', en: 'Origins 2019' }, isFoil: false },
  'BT4-093': { id: 'BT4-093_OR19', label: { es: 'Origins 2019', en: 'Origins 2019' }, isFoil: false },
  'BT4-118': { id: 'BT4-118_OR19', label: { es: 'Origins 2019', en: 'Origins 2019' }, isFoil: false },
  'BT5-112': { id: 'BT5-112_OR19', label: { es: 'Origins 2019', en: 'Origins 2019' }, isFoil: false },
  'BT5-117': { id: 'BT5-117_OR19', label: { es: 'Origins 2019', en: 'Origins 2019' }, isFoil: false }`;

code = code.replace(
  /'BT3-104': \{ id: 'BT3-104_OR19', label: \{ es: 'Origins 2019', en: 'Origins 2019' \}, isFoil: false \}/g,
  "'BT3-104': { id: 'BT3-104_OR19', label: { es: 'Origins 2019', en: 'Origins 2019' }, isFoil: false }" + extra_variants_add
);

const replacements_overrides = `
  'BT1-109_OR19': 'https://dragonball.center/files/module_dbc/objetos/24/p40o116337.jpg',
  'BT3-120_OR19': 'https://dragonball.center/files/module_dbc/objetos/82/2nb3116338.jpg',
  'BT4-012_OR19': 'https://dragonball.center/files/module_dbc/objetos/7/2rnt116339.jpg',
  'BT4-048_OR19': 'https://dragonball.center/files/module_dbc/objetos/67/5yv6116340.jpg',
  'BT4-093_OR19': 'https://dragonball.center/files/module_dbc/objetos/100/06w3116341.jpg',
  'BT4-118_OR19': 'https://dragonball.center/files/module_dbc/objetos/107/mfw1116342.jpg',
  'BT5-112_OR19': 'https://dragonball.center/files/module_dbc/objetos/86/h42o116343.jpg',
  'BT5-117_OR19': 'https://dragonball.center/files/module_dbc/objetos/94/gdw8116344.jpg',
  'PM-AX2019-01': 'https://dragonball.center/files/module_dbc/objetos/128/eifa116371.png',
  'PM-AX2019-02': 'https://dragonball.center/files/module_dbc/objetos/130/aivh116372.png',
`;
code = code.replace(
  /'BT1-052_OR19': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/9\/dtpt116274\.jpg',/g,
  "'BT1-052_OR19': 'https://dragonball.center/files/module_dbc/objetos/104/jvzh116336.jpg',"
);
code = code.replace(
  /'BT3-104_OR19': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/20\/c1sf116275\.jpg',/g,
  "'BT3-104_OR19': 'https://dragonball.center/files/module_dbc/objetos/20/c1sf116275.jpg'," + replacements_overrides
);

fs.writeFileSync('src/TrackerApp.tsx', code);
console.log('Appended to TrackerApp.tsx');
