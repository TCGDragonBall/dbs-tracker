const fs = require('fs');

let code = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

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
  /const IMAGE_OVERRIDES: Record<string, string> = \{/,
  extra_variants_otakon + '\nconst IMAGE_OVERRIDES: Record<string, string> = {'
);

fs.writeFileSync('src/TrackerApp.tsx', code);
console.log('Fixed OTAKON variants');
