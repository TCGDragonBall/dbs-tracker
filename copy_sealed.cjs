const fs = require('fs');
let code = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Find SET_BG object
const setBgMatch = code.match(/const SET_BG\s*:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};/);
if (!setBgMatch) {
  console.log("No SET_BG found");
  process.exit(1);
}

const entries = setBgMatch[1].split('\n').filter(l => l.includes('SEALED_') || l.includes('MASTERS_SEALED_') || l.includes('MASTERS_TP_FOLDER'));
let overridesToAdd = [];
for (let e of entries) {
  const match = e.match(/'(SEALED_[^']+|MASTERS_SEALED_[^']+|MASTERS_TP_FOLDER)'\s*:\s*'([^']+)'/);
  if (match) {
    overridesToAdd.push(`  '${match[1]}': '${match[2]}',`);
  }
}

console.log("Found " + overridesToAdd.length + " SEALED entries in SET_BG.");

const overMatch = code.match(/const IMAGE_OVERRIDES:\s*Record<string,\s*string>\s*=\s*{/);
if (!overMatch) {
  console.log("No IMAGE_OVERRIDES found");
  process.exit(1);
}

// Check how many are already in IMAGE_OVERRIDES
let missing = [];
for (let o of overridesToAdd) {
  let key = o.split(':')[0].trim().replace(/'/g, '');
  
  // Need to search only within IMAGE_OVERRIDES, not the whole file, but an approximation is fine
  // Let's actually extract IMAGE_OVERRIDES block
  let blockStart = overMatch.index;
  let blockStr = code.substring(blockStart, blockStart + 40000);
  let blockEnd = blockStr.indexOf('};\n');
  let overBlock = blockStr.substring(0, blockEnd);

  if (!overBlock.includes(`'${key}':`)) {
    missing.push(o);
  }
}

console.log("Missing " + missing.length + " entries.");

if (missing.length > 0) {
  let newOverrides = "const IMAGE_OVERRIDES: Record<string, string> = {\n" + missing.join('\n');
  let newCode = code.replace(/const IMAGE_OVERRIDES:\s*Record<string,\s*string>\s*=\s*{/, newOverrides);
  fs.writeFileSync('src/TrackerApp.tsx', newCode);
  console.log("Updated IMAGE_OVERRIDES inline.");
}
