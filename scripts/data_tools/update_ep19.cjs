const fs = require('fs');
const path = require('path');

const list = [
  "BT27-025_PR",
  "BT5-044_PR",
  "BT5-112_PR03",
  "BT10-010_PR02",
  "BT21-041_PR",
  "BT24-083_PR",
  "BT27-021_PR",
  "BT27-059_PR03",
  "BT27-064_PR",
  "BT27-076_PR",
  "BT28-034_PR",
  "BT28-113_PR",
  "BT28-124_PR",
  "BT28-139_PR",
  "DB3-089_PR",
  "EX10-05_PR",
  "P-473_PR02",
  "P-680_PR02"
];

const newIds = [];
const imageMapLines = [];

for (const card of list) {
  const baseId = card.split('_')[0]; // e.g. BT27-025
  const newId = baseId + '_EP19';
  newIds.push(newId);
  imageMapLines.push(`  '${newId}': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/${card}.png',`);
  
  // Find which file contains the base card
  let prefix = baseId.split('-')[0];
  let fileName = '';
  if (prefix.startsWith('BT')) {
    fileName = prefix.toLowerCase() + '.ts';
  } else if (prefix.startsWith('DB')) {
    fileName = prefix.toLowerCase() + '.ts';
  } else if (prefix === 'P') {
    fileName = 'promos.ts';
  } else if (prefix.startsWith('EX')) {
    fileName = 'expansions.ts';
  }
  
  if (fileName) {
    const filePath = path.join('src/data', fileName);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      let baseLineIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(baseId + '\t')) {
          baseLineIdx = i;
          break;
        }
      }
      
      if (baseLineIdx !== -1) {
        // Ensure not already added
        let alreadyAdded = false;
        for (let i = baseLineIdx + 1; i < lines.length; i++) {
          if (lines[i].startsWith(newId + '\t')) {
            alreadyAdded = true;
            break;
          }
          if (!lines[i].startsWith(baseId)) {
            break; // moving past variants of this card
          }
        }
        
        if (!alreadyAdded) {
          const newLine = lines[baseLineIdx].replace(baseId, newId);
          // Insert after base line
          lines.splice(baseLineIdx + 1, 0, newLine);
          fs.writeFileSync(filePath, lines.join('\n'));
          console.log(`Added ${newId} to ${fileName}`);
        } else {
          console.log(`${newId} already in ${fileName}`);
        }
      } else {
        console.log(`Base card ${baseId} not found in ${fileName}`);
      }
    } else {
      console.log(`File ${fileName} not found for ${baseId}`);
    }
  }
}

// Now update TrackerApp.tsx
let trackerApp = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// PROMO_METADATA mapping
const metaLines = newIds.map(id => `  '${id}': { sourceProduct: 'Event Pack 19' },`).join('\n');
if (!trackerApp.includes("'BT27-025_EP19': { sourceProduct:")) {
  trackerApp = trackerApp.replace(
    /(\/\/ Event Pack 18[\s\S]*?)(\/\/)/,
    `$1// Event Pack 19\n${metaLines}\n  $2`
  );
}

// imagesMap
if (!trackerApp.includes("'BT27-025_EP19': 'https://")) {
  trackerApp = trackerApp.replace(
    /('SEALED_EVENT_PACK_18':.*?,\n)/,
    `$1${imageMapLines.join('\n')}\n  'SEALED_EVENT_PACK_19': 'https://dragonball.center/files/module_dbc/objetos/0/u0nt175101.jpg',\n  'MASTERS_SEALED_EP19': 'https://dragonball.center/files/module_dbc/objetos/0/u0nt175101.jpg',\n`
  );
}

// EVENT_PACK_19 array
const arrayStr = `const EVENT_PACK_19 = [\n  'SEALED_EVENT_PACK_19', '${newIds.join("', '")}'\n];\n`;
if (!trackerApp.includes('const EVENT_PACK_19')) {
  trackerApp = trackerApp.replace(
    /(const EVENT_PACK_18 = \[[\s\S]*?\];\n)/,
    `$1\n${arrayStr}`
  );
}

// MASTERS_SEALED_EP_FOLDER
if (!trackerApp.includes("'SEALED_EVENT_PACK_19'")) {
  trackerApp = trackerApp.replace(
    /('SEALED_EVENT_PACK_18')/g,
    `$1, 'SEALED_EVENT_PACK_19'`
  );
}

// 'MASTERS_SEALED_EP19': ['SEALED_EVENT_PACK_19']
if (!trackerApp.includes("'MASTERS_SEALED_EP19'")) {
  trackerApp = trackerApp.replace(
    /('MASTERS_SEALED_EP18': \['SEALED_EVENT_PACK_18'\],)/,
    `$1\n  'MASTERS_SEALED_EP19': ['SEALED_EVENT_PACK_19'],`
  );
}

// 'MASTERS_EP19': EVENT_PACK_19
if (!trackerApp.includes("'MASTERS_EP19': EVENT_PACK_19")) {
  trackerApp = trackerApp.replace(
    /('MASTERS_EP18': EVENT_PACK_18,)/,
    `$1\n  'MASTERS_EP19': EVENT_PACK_19,`
  );
}

// category item
const catStr = `          { id: 'MASTERS_SEALED_EP19', label: 'Event Pack 19', sub: 'Event Pack' },\n`;
if (!trackerApp.includes("id: 'MASTERS_SEALED_EP19'")) {
  trackerApp = trackerApp.replace(
    /(\{ id: 'MASTERS_SEALED_EP18'.*?\},)/,
    `$1\n${catStr}`
  );
}

// targetExpansion logic
const targetStr = `                            } else if (selectedCard.id === 'SEALED_EVENT_PACK_19') {
                              targetExpansion = 'MASTERS_EP19';\n`;
if (!trackerApp.includes("selectedCard.id === 'SEALED_EVENT_PACK_19'")) {
  trackerApp = trackerApp.replace(
    /(\} else if \(selectedCard\.id === 'SEALED_EVENT_PACK_18'\) \{\n\s*targetExpansion = 'MASTERS_EP18';\n)/,
    `$1${targetStr}`
  );
}

// bg styling
if (!trackerApp.includes("'MASTERS_EP19': 'bg-[50%_25%]'")) {
  trackerApp = trackerApp.replace(
    /('MASTERS_EP18': 'bg-\[50%_25%\]',)/,
    `$1\n  'MASTERS_EP19': 'bg-[50%_25%]',`
  );
}

if (!trackerApp.includes("'MASTERS_SEALED_EP19': 'bg-[50%_25%]'")) {
  trackerApp = trackerApp.replace(
    /('MASTERS_SEALED_EP18': 'bg-\[50%_25%\]',)/,
    `$1\n  'MASTERS_SEALED_EP19': 'bg-[50%_25%]',`
  );
}

fs.writeFileSync('src/TrackerApp.tsx', trackerApp);
console.log('TrackerApp updated successfully!');
