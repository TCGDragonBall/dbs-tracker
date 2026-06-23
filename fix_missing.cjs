const fs = require('fs');

let trackerApp = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const missingIds = [
  'SEALED_CHAMPIONSHIP_2022_CEL', 'SEALED_CHAMPIONSHIP_2022_FP', 'SEALED_CHAMPIONSHIP_2022_ZS', 'SEALED_ZENKAI_TP_V2', 'SEALED_Z03_DASH_PACK', 'SEALED_ZENKAI_TP_V3', 'SEALED_EVENT_PACK_11', 'SEALED_ZENKAI_TP_V4', 'SEALED_EVENT_PACK_12', 'SEALED_ZENKAI_TP_V5', 'SEALED_EVENT_PACK_13', 'SEALED_ZENKAI_TP_V6', 'SEALED_CHAMPIONSHIP_2023_CEL', 'SEALED_CHAMPIONSHIP_2023_ZENKAI', 'SEALED_ZENKAI_TP_V7', 'SEALED_DELUXE_PACK_2024_V1', 'SEALED_EVENT_PACK_14', 'SEALED_ZENKAI_TP_V8', 'SEALED_DELUXE_PACK_2024_V2', 'SEALED_EVENT_PACK_15', 'SEALED_ZENKAI_TP_V9', 'SEALED_CHAMPIONSHIP_2024_FINALS', 'SEALED_CHAMPIONSHIP_2024_ZENKAI', 'SEALED_ZENKAI_TP_V10', 'SEALED_DELUXE_PACK_2025_V1', 'SEALED_ZENKAI_TP_V11', 'SEALED_EVENT_PACK_16', 'SEALED_ZENKAI_TP_V12', 'SEALED_DELUXE_PACK_2025_V2', 'SEALED_EVENT_PACK_17', 'SEALED_ULTRA_BOUT_TP_V13', 'SEALED_ULTRA_BOUT_TP_V1', 'SEALED_DELUXE_PACK_2026_V1', 'SEALED_ULTRA_BOUT_TP_V2', 'SEALED_EVENT_PACK_18', 'SEALED_ULTRA_BOUT_TP_V3'
];

let overMatch = trackerApp.match(/const IMAGE_OVERRIDES:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};\n/);
let overridesBlock = overMatch[1];
let additions = [];

for (let id of missingIds) {
  let lookupKey = 'MASTERS_' + id;
  if (id.includes('_EVENT_PACK_')) {
    let num = id.split('_EVENT_PACK_')[1];
    lookupKey = 'MASTERS_SEALED_EP' + num;
  }

  let regex = new RegExp(`'${lookupKey}':\\s*'([^']+)'`);
  let match = overridesBlock.match(regex);
  if (match) {
    let url = match[1];
    additions.push(`  '${id}': '${url}',`);
  } else {
    console.log("Could not find fallback for", id, lookupKey);
  }
}

if (additions.length > 0) {
  let newOverrides = "const IMAGE_OVERRIDES: Record<string, string> = {\n" + additions.join('\n');
  let newCode = trackerApp.replace(/const IMAGE_OVERRIDES:\s*Record<string,\s*string>\s*=\s*{/, newOverrides);
  fs.writeFileSync('src/TrackerApp.tsx', newCode);
  console.log("Added " + additions.length + " missing IDs to IMAGE_OVERRIDES");
}
