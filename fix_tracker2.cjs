const fs = require('fs');

let content = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');

// 1. EXTRA_VARIANTS_PROMOS
const extraVariantsPromos = `
const EXTRA_VARIANTS_PROMOS: Record<string, { id: string; label: Record<string, string>; isFoil: boolean; rarity?: string }> = {
  'P-232': { id: 'P-232_W', label: { es: 'Winner', en: 'Winner' }, isFoil: true },
  'BT9-076': { id: 'BT9-076_CM', label: { es: 'Cardmarket Series Tournament', en: 'Cardmarket Series Tournament' }, isFoil: true },
  'DB1-027': { id: 'DB1-027_CM', label: { es: 'Cardmarket Series Tournament', en: 'Cardmarket Series Tournament' }, isFoil: true }
};`;

content = content.replace(/const EXTRA_VARIANTS_CELEBRATIONS/, extraVariantsPromos + '\nconst EXTRA_VARIANTS_CELEBRATIONS');

// 2. Load EXTRA_VARIANTS_PROMOS
content = content.replace(/          if \(EXTRA_VARIANTS_ORIGINS\[card\.id\] \|\| EXTRA_VARIANTS_OTAKON\[card\.id\] \|\| EXTRA_VARIANTS_CELEBRATIONS\[card\.id\]\) \{/g, "          if (EXTRA_VARIANTS_ORIGINS[card.id] || EXTRA_VARIANTS_OTAKON[card.id] || EXTRA_VARIANTS_CELEBRATIONS[card.id] || EXTRA_VARIANTS_PROMOS[card.id]) {");
content = content.replace(/            const v = EXTRA_VARIANTS_ORIGINS\[card\.id\] \|\| EXTRA_VARIANTS_OTAKON\[card\.id\] \|\| EXTRA_VARIANTS_CELEBRATIONS\[card\.id\];/g, "            const v = EXTRA_VARIANTS_ORIGINS[card.id] || EXTRA_VARIANTS_OTAKON[card.id] || EXTRA_VARIANTS_CELEBRATIONS[card.id] || EXTRA_VARIANTS_PROMOS[card.id];");

// 3. IMAGE_OVERRIDES
const images = `
  'SL-MM-01': 'https://dragonball.center/files/module_dbc/objetos/39/bimu116677.jpg',
  'CASE-S9-PRE': 'https://dragonball.center/files/module_dbc/objetos/32/2tgp116684.jpg',
  'CASE-UO-01': 'https://dragonball.center/files/module_dbc/objetos/1/tku2116758.jpg',
  'P-232': 'https://dragonball.center/files/module_dbc/objetos/9/tl7m116766.jpg',
  'BT9-076_CM': 'https://dragonball.center/files/module_dbc/objetos/3/9cn1129394.jpg',
  'DB1-027_CM': 'https://dragonball.center/files/module_dbc/objetos/96/d8ui129395.jpg',`;

content = content.replace(/const IMAGE_OVERRIDES: Record<string, string> = \{/, "const IMAGE_OVERRIDES: Record<string, string> = {\n" + images);

// 4. Menu options for the sleeves and cases
const menuCasesInsert = `
          { id: 'CASE_UNIVERSAL_ONSLAUGHT_PRE', label: 'Series 9 Pre-release', sub: 'Eventos' },
          { id: 'CASE_UNIVERSAL_ONSLAUGHT', label: 'Universal Onslaught', sub: 'Eventos' },`;
content = content.replace(/          \{ id: 'CASE_CELEBRATIONS_2019', label: 'Celebrations 2019', sub: 'Eventos' \}/, "          { id: 'CASE_CELEBRATIONS_2019', label: 'Celebrations 2019', sub: 'Eventos' }," + menuCasesInsert);

const menuSleevesInsert = `
          { id: 'SL_MALICIOUS_MACHINATIONS', label: 'Malicious Machinations', sub: 'Eventos' },`;
content = content.replace(/          \{ id: 'SL_CELEBRATIONS_2019', label: 'Celebrations 2019', sub: 'Eventos' \}/, "          { id: 'SL_CELEBRATIONS_2019', label: 'Celebrations 2019', sub: 'Eventos' }," + menuSleevesInsert);

// 5. PACK_ARRAYS
const packArraysInsert = `
  'CASE_UNIVERSAL_ONSLAUGHT_PRE': ['CASE-S9-PRE'],
  'CASE_UNIVERSAL_ONSLAUGHT': ['CASE-UO-01'],
  'SL_MALICIOUS_MACHINATIONS': ['SL-MM-01'],`;

content = content.replace(/  'CASE_CELEBRATIONS_2019': \['CASE-CEL19-01', 'CASE-CEL19-02'\],/, "  'CASE_CELEBRATIONS_2019': ['CASE-CEL19-01', 'CASE-CEL19-02']," + packArraysInsert);

// Also need to push 'CASE_UNIVERSAL_ONSLAUGHT_PRE', 'CASE_UNIVERSAL_ONSLAUGHT' to 'CASES_MASTERS_FOLDER'
content = content.replace(/  'CASES_MASTERS_FOLDER': \['CASE_CELEBRATIONS_2019'\]/, "  'CASES_MASTERS_FOLDER': ['CASE_CELEBRATIONS_2019', 'CASE_UNIVERSAL_ONSLAUGHT_PRE', 'CASE_UNIVERSAL_ONSLAUGHT']");

// 6. isVirtualSet
content = content.replace(
  /'CASE_CELEBRATIONS_2019',/,
  "'CASE_CELEBRATIONS_2019', 'CASE_UNIVERSAL_ONSLAUGHT_PRE', 'CASE_UNIVERSAL_ONSLAUGHT', 'SL_MALICIOUS_MACHINATIONS',"
);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf-8');
console.log("Success");
