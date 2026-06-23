const fs = require('fs');
let code = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

let overMatch = code.match(/(const IMAGE_OVERRIDES:\s*Record<string,\s*string>\s*=\s*{)([\s\S]*?)(\n};)/);
if (overMatch) {
  let block = overMatch[2];
  let lines = block.split('\n');
  let seenKeys = new Set();
  let newLines = [];
  
  // We want to keep the LAST appearance of a key to favor recent additions.
  // So we reverse, filter, and reverse.
  let reversed = [...lines].reverse();
  let filtered = [];
  for (let line of reversed) {
    let m = line.match(/^\s*'([^']+)'\s*:/);
    if (m) {
      let key = m[1];
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        filtered.push(line);
      }
    } else {
      filtered.push(line); // keep comments or empty lines
    }
  }
  
  let finalBlock = filtered.reverse().join('\n');
  let newCode = code.substring(0, overMatch.index) + overMatch[1] + finalBlock + overMatch[3] + code.substring(overMatch.index + overMatch[0].length);
  fs.writeFileSync('src/TrackerApp.tsx', newCode);
  console.log("Removed duplicate keys from IMAGE_OVERRIDES");
} else {
  console.log("IMAGE_OVERRIDES not found");
}

