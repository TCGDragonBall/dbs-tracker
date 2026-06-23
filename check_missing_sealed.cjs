const fs = require('fs');

let sealedData = fs.readFileSync('src/data/sealed.ts', 'utf8');
let trackerApp = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Get all SEALED_ ids
let ids = [];
let lines = sealedData.split('\n');
for (let line of lines) {
  if (line.trim() && !line.startsWith('export') && !line.startsWith('`')) {
    let id = line.split('\t')[0].trim();
    if (id) ids.push(id);
  }
}

console.log("Total sealed IDs:", ids.length);

// Extract IMAGE_OVERRIDES block
let overMatch = trackerApp.match(/const IMAGE_OVERRIDES:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};\n/);
let overridesBlock = overMatch ? overMatch[1] : '';

let missing = [];
for (let id of ids) {
  if (!overridesBlock.includes(`'${id}':`)) {
    missing.push(id);
  }
}

console.log("Missing from IMAGE_OVERRIDES:", missing.length);
if (missing.length > 0) {
  console.log(missing.join(', '));
}
