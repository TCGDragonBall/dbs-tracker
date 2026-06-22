import fs from 'fs';

const tsPath = './src/TrackerApp.tsx';
let content = fs.readFileSync(tsPath, 'utf8');

// 1. Add 'MASTERS_SEALED_TP07' image
if (!content.includes("'MASTERS_SEALED_TP07': 'https://dragonball.center/files/module_dbc/objetos/96/cwxq36507.jpg'")) {
  content = content.replace(
    /'MASTERS_TP06': 'https:\/\/dragonball\.center\/[^']+',/g,
    "$& \n  'MASTERS_TP07': 'https://dragonball.center/files/module_dbc/objetos/96/cwxq36507.jpg',"
  );
  content = content.replace(
    /'MASTERS_SEALED_TP06': 'https:\/\/dragonball\.center\/[^']+',/g,
    "$& \n  'MASTERS_SEALED_TP07': 'https://dragonball.center/files/module_dbc/objetos/96/cwxq36507.jpg',"
  );
}

// 2. Add 'bg-[50%_25%]'
if (!content.includes("'MASTERS_SEALED_TP07': 'bg-[50%_25%]'")) {
  content = content.replace(
    /'MASTERS_TP06': 'bg-\[50%_25%\]',/g,
    "$& \n  'MASTERS_TP07': 'bg-[50%_25%]',"
  );
  content = content.replace(
    /'MASTERS_SEALED_TP06': 'bg-\[50%_25%\]',/g,
    "$& \n  'MASTERS_SEALED_TP07': 'bg-[50%_25%]',"
  );
}

// 3. Add to MASTERS_SEALED_TP_FOLDER
// subItems: [ ... { id: 'MASTERS_SEALED_TP06', ... } ]
if (!content.includes("{ id: 'MASTERS_SEALED_TP07', label: 'Tournament Pack 07', sub: 'Tournament' }")) {
  content = content.replace(
    /\{ id: 'MASTERS_SEALED_TP06', label: 'Tournament Pack 06', sub: 'Tournament' \}/g,
    "$&,\n          { id: 'MASTERS_SEALED_TP07', label: 'Tournament Pack 07', sub: 'Tournament' }"
  );
}

// 4. Add to MASTERS_TP_FOLDER subItems
if (!content.includes("{ id: 'MASTERS_TP07', label: 'Tournament Pack 07', sub: 'Tournament' }")) {
  content = content.replace(
    /\{ id: 'MASTERS_TP06', label: 'Tournament Pack 06', sub: 'Tournament' \}/g,
    "$&,\n          { id: 'MASTERS_TP07', label: 'Tournament Pack 07', sub: 'Tournament' }"
  );
}

// 5. Add object to MASTER_TP07 sourceProduct
if (!content.includes("'MASTERS_TP07': { sourceProduct: 'Tournament Pack 07' }")) {
  content = content.replace(
    /'MASTERS_TP06': \{ sourceProduct: 'Tournament Pack 06' \},/g,
    "$& \n  'MASTERS_TP07': { sourceProduct: 'Tournament Pack 07' },"
  );
}

// 6. Add ID string to includes array
if (!content.includes("'MASTERS_TP07'")) {
    // Actually handled by setId.startsWith('MASTERS_TP') but to be sure we can leave it.
}

// 7. Add PACK_ARRAYS structure
if (!content.includes("'MASTERS_SEALED_TP07': ['SEALED_TP07']")) {
  content = content.replace(
    /'MASTERS_SEALED_TP_FOLDER': \['SEALED_TP01', 'SEALED_TP02', 'SEALED_TP03', 'SEALED_TP04', 'SEALED_TP05_2018', 'SEALED_TP05_2019', 'SEALED_TP06'\]/g,
    "'MASTERS_SEALED_TP_FOLDER': ['SEALED_TP01', 'SEALED_TP02', 'SEALED_TP03', 'SEALED_TP04', 'SEALED_TP05_2018', 'SEALED_TP05_2019', 'SEALED_TP06', 'SEALED_TP07']"
  );
  content = content.replace(
    /'MASTERS_SEALED_TP06': \['SEALED_TP06'\],/g,
    "$& \n  'MASTERS_SEALED_TP07': ['SEALED_TP07'],"
  );
}

if (!content.includes("'MASTERS_TP07': ['SEALED_TP07', 'P-126'")) {
  const masterTP07Arr = "['SEALED_TP07', 'P-126', 'P-126_TP07_F', 'P-127', 'P-127_TP07_F', 'P-128', 'P-128_TP07_F', 'P-129', 'P-129_TP07_F', 'P-130', 'P-130_TP07_F', 'P-131', 'P-131_TP07_F', 'P-132', 'P-132_TP07_F', 'P-133', 'P-133_TP07_F']";
  content = content.replace(
    /'MASTERS_TP06': \['SEALED_TP06', 'P-095', 'P-096', 'P-097', 'P-098', 'P-099', 'P-100', 'P-101', 'P-102'\],/,
    "$& \n  'MASTERS_TP07': " + masterTP07Arr + ","
  );
}

fs.writeFileSync(tsPath, content);
console.log('Update complete');
