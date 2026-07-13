const fs = require('fs');

let code = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// 1. Add OTAKON_2019 to PLAYMATS_MASTERS_FOLDER
code = code.replace(
  /'PLAYMATS_MASTERS_FOLDER': \['ANIMENEXT_2019', 'ORIGINS_2019', 'ANIME_EXPO_2019'\],/g,
  "'PLAYMATS_MASTERS_FOLDER': ['ANIMENEXT_2019', 'ORIGINS_2019', 'ANIME_EXPO_2019', 'OTAKON_2019'],\n  'OTAKON_2019': ['PM-OT2019-01', 'PM-OT2019-02', 'PM-OT2019-03', 'PM-OT2019-04', 'PM-OT2019-05', 'PM-OT2019-06', 'PM-OT2019-07', 'PM-OT2019-08', 'PM-OT2019-09', 'PM-OT2019-10', 'PM-OT2019-11', 'PM-OT2019-12', 'PM-OT2019-13', 'PM-OT2019-14', 'PM-OT2019-15'],"
);

// 2. Add in subItems of MASTERS_PLAYMATS
code = code.replace(
  /\{ id: 'ANIME_EXPO_2019', label: 'Anime Expo 2019', sub: 'Eventos' \}/g,
  "{ id: 'ANIME_EXPO_2019', label: 'Anime Expo 2019', sub: 'Eventos' },\n          { id: 'OTAKON_2019', label: 'Otakon 2019', sub: 'Eventos' }"
);

// 3. Add to isVirtualSet
code = code.replace(
  /'ANIME_EXPO_2019', 'PREMIUM_COLLECTION_FOLDER'/g,
  "'ANIME_EXPO_2019', 'OTAKON_2019', 'PREMIUM_COLLECTION_FOLDER'"
);

// 4. Add EXTRA_VARIANTS_OTAKON
const extra_variants_otakon = `
const EXTRA_VARIANTS_OTAKON: Record<string, { id: string; label: Record<string, string>; isFoil: boolean; rarity?: string }> = {
  'P-041': { id: 'P-041_OT19', label: { es: 'Otakon 2019', en: 'Otakon 2019' }, isFoil: false },
  'BT1-055': { id: 'BT1-055_OT19', label: { es: 'Otakon 2019', en: 'Otakon 2019' }, isFoil: false },
  'BT1-079': { id: 'BT1-079_OT19', label: { es: 'Otakon 2019', en: 'Otakon 2019' }, isFoil: false },
  'P-089': { id: 'P-089_OT19', label: { es: 'Otakon 2019', en: 'Otakon 2019' }, isFoil: false },
  'TB3-018': { id: 'TB3-018_GS', label: { es: 'Giant Size', en: 'Giant Size' }, isFoil: false },
  'BT5-001': { id: 'BT5-001_GS', label: { es: 'Giant Size', en: 'Giant Size' }, isFoil: false },
  'BT5-079': { id: 'BT5-079_GS', label: { es: 'Giant Size', en: 'Giant Size' }, isFoil: false },
  'BT5-105': { id: 'BT5-105_GS', label: { es: 'Giant Size', en: 'Giant Size' }, isFoil: false }
};
`;

code = code.replace(
  /const EXTRA_VARIANTS_ORIGINS = \{[\s\S]*?\};/,
  (match) => match + "\\n" + extra_variants_otakon
);

// 5. Add IMAGE_OVERRIDES
const overrides = `
  'P-041_OT19': 'https://dragonball.center/files/module_dbc/objetos/54/lio3116383.jpg',
  'BT1-055_OT19': 'https://dragonball.center/files/module_dbc/objetos/9/jhgp116386.jpg',
  'BT1-079_OT19': 'https://dragonball.center/files/module_dbc/objetos/140/31l7116387.jpg',
  'P-089_OT19': 'https://dragonball.center/files/module_dbc/objetos/143/uvum116388.jpg',
  'TB3-018_GS': 'https://dragonball.center/files/module_dbc/objetos/141/egz0116385.jpg',
  'BT5-001_GS': 'https://dragonball.center/files/module_dbc/objetos/36/09rp116390.jpg',
  'BT5-079_GS': 'https://dragonball.center/files/module_dbc/objetos/104/ufe6116391.jpg',
  'BT5-105_GS': 'https://dragonball.center/files/module_dbc/objetos/112/oi0z116389.jpg',
  'PM-OT2019-01': 'https://dragonball.center/files/module_dbc/objetos/116/eh1k116397.jpg',
  'PM-OT2019-02': 'https://dragonball.center/files/module_dbc/objetos/68/itgu116400.jpg',
  'PM-OT2019-03': 'https://dragonball.center/files/module_dbc/objetos/108/x2wn116403.jpg',
  'PM-OT2019-04': 'https://dragonball.center/files/module_dbc/objetos/122/s1az116406.jpg',
  'PM-OT2019-05': 'https://dragonball.center/files/module_dbc/objetos/80/hxlm116409.jpg',
  'PM-OT2019-06': 'https://dragonball.center/files/module_dbc/objetos/100/d65b116398.jpg',
  'PM-OT2019-07': 'https://dragonball.center/files/module_dbc/objetos/52/uet0116401.jpg',
  'PM-OT2019-08': 'https://dragonball.center/files/module_dbc/objetos/121/hbwm116404.jpg',
  'PM-OT2019-09': 'https://dragonball.center/files/module_dbc/objetos/74/6pmj116407.jpg',
  'PM-OT2019-10': 'https://dragonball.center/files/module_dbc/objetos/56/w8ap116410.jpg',
  'PM-OT2019-11': 'https://dragonball.center/files/module_dbc/objetos/131/jd2w116399.jpg',
  'PM-OT2019-12': 'https://dragonball.center/files/module_dbc/objetos/125/7j4j116402.jpg',
  'PM-OT2019-13': 'https://dragonball.center/files/module_dbc/objetos/81/q0tn116405.jpg',
  'PM-OT2019-14': 'https://dragonball.center/files/module_dbc/objetos/145/7n77116408.jpg',
  'PM-OT2019-15': 'https://dragonball.center/files/module_dbc/objetos/18/yjgf116411.jpg',
`;

code = code.replace(
  /'PM-AX2019-02': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/130\/aivh116372\.png',/g,
  "'PM-AX2019-02': 'https://dragonball.center/files/module_dbc/objetos/130/aivh116372.png'," + overrides
);

// Add EXTRA_VARIANTS_OTAKON to the maps in line 1673
code = code.replace(
  /EXTRA_VARIANTS_ORIGINS\[card\.id\]/g,
  "EXTRA_VARIANTS_ORIGINS[card.id] || EXTRA_VARIANTS_OTAKON[card.id]"
);

fs.writeFileSync('src/TrackerApp.tsx', code);
console.log('Added Otakon updates to TrackerApp.tsx');
