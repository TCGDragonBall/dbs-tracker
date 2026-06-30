const fs = require('fs');

let content = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');

// 1. Add CASES_MASTERS_FOLDER and SEPARATORS_MASTERS_FOLDER to the menu.
const menuInsert = `
      { id: 'COL11', label: 'Fundas', sub: 'Sleeves' },
      {
        id: 'CASES_MASTERS_FOLDER',
        label: 'Cases',
        sub: 'Accessories',
        locked: false,
        subItems: [
          { id: 'CASE_CELEBRATIONS_2019', label: 'Celebrations 2019', sub: 'Eventos' }
        ]
      },
      {
        id: 'SEPARATORS_MASTERS_FOLDER',
        label: 'Separators',
        sub: 'Accessories',
        locked: false,
        subItems: [
          { id: 'SEP_CELEBRATIONS_2019', label: 'Celebrations 2019', sub: 'Eventos' }
        ]
      },`;
content = content.replace(/      \{ id: 'COL11', label: 'Fundas', sub: 'Sleeves' \},/, menuInsert);

// Add Celebrations 2019 playmats and sleeves to existing folders.
// Wait, we have PLAYMATS_MASTERS_FOLDER and we need to add Celebrations 2019.
const playmatsMastersInsert = `
          { id: 'PM_CELEBRATIONS_2019', label: 'Celebrations 2019', sub: 'Eventos' },
          { id: 'PM_CHAMPIONSHIP_2019', label: 'Championship 2019', sub: 'Eventos' },`;
content = content.replace(/          \{ id: 'PM_CHAMPIONSHIP_2019', label: 'Championship 2019', sub: 'Eventos' \},/, playmatsMastersInsert);

const sleevesMastersInsert = `
          { id: 'SL_CELEBRATIONS_2019', label: 'Celebrations 2019', sub: 'Eventos' },
          { id: 'SL-CH-W1',`;
content = content.replace(/          \{ id: 'SL-CH-W1',/, sleevesMastersInsert);

// 2. Add isVirtualSet
content = content.replace(
  /'PM_CHAMPIONSHIP_2019',/,
  "'CASES_MASTERS_FOLDER', 'CASE_CELEBRATIONS_2019', 'SEPARATORS_MASTERS_FOLDER', 'SEP_CELEBRATIONS_2019', 'PM_CELEBRATIONS_2019', 'SL_CELEBRATIONS_2019', 'PM_CHAMPIONSHIP_2019',"
);

// 3. Add to PACK_ARRAYS
const packArraysInsert = `
  'CASES_MASTERS_FOLDER': ['CASE_CELEBRATIONS_2019'],
  'CASE_CELEBRATIONS_2019': ['CASE-CEL19-01', 'CASE-CEL19-02'],
  'SEPARATORS_MASTERS_FOLDER': ['SEP_CELEBRATIONS_2019'],
  'SEP_CELEBRATIONS_2019': ['SEP-CEL19-01', 'SEP-CEL19-02', 'SEP-CEL19-03', 'SEP-CEL19-04', 'SEP-CEL19-05'],
  'PM_CELEBRATIONS_2019': ['PM-CEL19-01', 'PM-CEL19-02', 'PM-CEL19-03', 'PM-CEL19-04', 'PM-CEL19-05', 'PM-CEL19-06', 'PM-CEL19-07', 'PM-CEL19-08', 'PM-CEL19-09', 'PM-CEL19-10', 'PM-CEL19-11', 'PM-CEL19-12', 'PM-CEL19-13', 'PM-CEL19-14', 'PM-CEL19-15'],
  'SL_CELEBRATIONS_2019': ['SL-CEL19-01'],
  'PLAYMATS_MASTERS_FOLDER': ['PM_CELEBRATIONS_2019', 'PM_CHAMPIONSHIP_2019', 'ANIMENEXT_2019', 'ORIGINS_2019', 'ANIME_EXPO_2019', 'OTAKON_2019'],`;
content = content.replace(/  'PLAYMATS_MASTERS_FOLDER': \['PM_CHAMPIONSHIP_2019', 'ANIMENEXT_2019', 'ORIGINS_2019', 'ANIME_EXPO_2019', 'OTAKON_2019'\],/, packArraysInsert);

// 4. Update getCardTags to include cases, separators, etc. (and sleeves, playmats are already handled by SL- and PM- but we added CASE- and SEP-)
const tagInsert = `
  if (id.startsWith('SL-')) tags.push('sleeve');
  if (id.startsWith('PM-')) tags.push('playmat');
  if (id.startsWith('CASE-')) tags.push('case');
  if (id.startsWith('SEP-')) tags.push('separator');`;
content = content.replace(/  if \(id\.startsWith\('SL-'\)\) tags\.push\('sleeve'\);\n  if \(id\.startsWith\('PM-'\)\) tags\.push\('playmat'\);/, tagInsert);

// 5. Add EXTRA_VARIANTS_CELEBRATIONS
const variantsInsert = `
const EXTRA_VARIANTS_CELEBRATIONS: Record<string, { id: string; label: Record<string, string>; isFoil: boolean; rarity?: string }> = {
  'BT5-027': { id: 'BT5-027_GS_T1', label: { es: 'Celebrations 2019 Team Top 1 (Giant)', en: 'Celebrations 2019 Team Top 1 (Giant)' }, isFoil: true },
  'BT5-054': { id: 'BT5-054_GS_T8', label: { es: 'Celebrations 2019 Team Top 8 (Giant)', en: 'Celebrations 2019 Team Top 8 (Giant)' }, isFoil: true },
  'BT6-001': { id: 'BT6-001_GS_S2', label: { es: 'Celebrations 2019 Single Top 2 (Giant)', en: 'Celebrations 2019 Single Top 2 (Giant)' }, isFoil: true },
  'BT6-002': { id: 'BT6-002_GS_S2', label: { es: 'Celebrations 2019 Single Top 2 (Giant)', en: 'Celebrations 2019 Single Top 2 (Giant)' }, isFoil: true },
  'BT6-080': { id: 'BT6-080_GS_T8', label: { es: 'Celebrations 2019 Team Top 8 (Giant)', en: 'Celebrations 2019 Team Top 8 (Giant)' }, isFoil: true },
  'EX3-07': { id: 'EX3-07_GS_T2', label: { es: 'Celebrations 2019 Team Top 2 (Giant)', en: 'Celebrations 2019 Team Top 2 (Giant)' }, isFoil: true },
  'EX3-13': { id: 'EX3-13_GS_T3', label: { es: 'Celebrations 2019 Team Top 3 (Giant)', en: 'Celebrations 2019 Team Top 3 (Giant)' }, isFoil: true },
  'EX3-19': { id: 'EX3-19_GS_T3', label: { es: 'Celebrations 2019 Team Top 3 (Giant)', en: 'Celebrations 2019 Team Top 3 (Giant)' }, isFoil: true },
  'P-071': { id: 'P-071_GS_T8', label: { es: 'Celebrations 2019 Team Top 8 (Giant)', en: 'Celebrations 2019 Team Top 8 (Giant)' }, isFoil: true },
  'SD6-01': { id: 'SD6-01_GS_T2', label: { es: 'Celebrations 2019 Team Top 2 (Giant)', en: 'Celebrations 2019 Team Top 2 (Giant)' }, isFoil: true },
  'SD7-01': { id: 'SD7-01_GS_T1', label: { es: 'Celebrations 2019 Team Top 1 (Giant)', en: 'Celebrations 2019 Team Top 1 (Giant)' }, isFoil: true },
  'SD8-01': { id: 'SD8-01_GS_T1', label: { es: 'Celebrations 2019 Team Top 1 (Giant)', en: 'Celebrations 2019 Team Top 1 (Giant)' }, isFoil: true },
  'TB2-001': { id: 'TB2-001_GS_T3', label: { es: 'Celebrations 2019 Team Top 3 (Giant)', en: 'Celebrations 2019 Team Top 3 (Giant)' }, isFoil: true },
  'TB2-065': { id: 'TB2-065_GS_T2', label: { es: 'Celebrations 2019 Team Top 2 (Giant)', en: 'Celebrations 2019 Team Top 2 (Giant)' }, isFoil: true },
  'TB3-001': { id: 'TB3-001_GS_S3', label: { es: 'Celebrations 2019 Single Top 3 (Giant)', en: 'Celebrations 2019 Single Top 3 (Giant)' }, isFoil: true },
  'TB3-034': { id: 'TB3-034_GS_S8', label: { es: 'Celebrations 2019 Single Top 8 (Giant)', en: 'Celebrations 2019 Single Top 8 (Giant)' }, isFoil: true }
};

const EXTRA_VARIANTS_ORIGINS`;
content = content.replace(/const EXTRA_VARIANTS_ORIGINS/, variantsInsert);

// 6. Handle EXTRA_VARIANTS_CELEBRATIONS in loadCards
const loadCardsInsert = `
          if (EXTRA_VARIANTS_ORIGINS[card.id] || EXTRA_VARIANTS_OTAKON[card.id] || EXTRA_VARIANTS_CELEBRATIONS[card.id]) {
            if (variationsList.length === 0) {
              variationsList.push({ id: card.id, label: { es: 'Normal', en: 'Normal' }, isFoil: false });
            }
            const v = EXTRA_VARIANTS_ORIGINS[card.id] || EXTRA_VARIANTS_OTAKON[card.id] || EXTRA_VARIANTS_CELEBRATIONS[card.id];`;
content = content.replace(
  /          if \(EXTRA_VARIANTS_ORIGINS\[card.id\] \|\| EXTRA_VARIANTS_OTAKON\[card.id\]\) \{\n            if \(variationsList.length === 0\) \{\n              variationsList.push\(\{ id: card.id, label: \{ es: 'Normal', en: 'Normal' \}, isFoil: false \}\);\n            \}\n            const v = EXTRA_VARIANTS_ORIGINS\[card.id\] \|\| EXTRA_VARIANTS_OTAKON\[card.id\];/,
  loadCardsInsert
);

// We need to add the extra variants to COL02
const col02Insert = `
  'COL02': ['TB3-034_GS_S8', 'TB3-001_GS_S3', 'TB2-065_GS_T2', 'TB2-001_GS_T3', 'SD8-01_GS_T1', 'SD7-01_GS_T1', 'SD6-01_GS_T2', 'P-071_GS_T8', 'EX3-19_GS_T3', 'EX3-13_GS_T3', 'EX3-07_GS_T2', 'BT6-080_GS_T8', 'BT6-002_GS_S2', 'BT6-001_GS_S2', 'BT5-054_GS_T8', 'BT5-027_GS_T1',`;
content = content.replace(/  'COL02': \[/, col02Insert);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf-8');
console.log("Updated TrackerApp.tsx");
