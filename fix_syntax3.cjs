const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const regexFusion = /fusionList\.push\(\{\s*id: `fw_set_completion_\$\{set\.id\}`,[\s\S]*?type: 'unique',\s*const sc = cards\.filter\(c => c\.expansion === set\.id\);\s*check: \(cards, inventory, inventoryMap\) => \{/g;

content = content.replace(regexFusion, (match) => {
  return match.replace("const sc = cards.filter(c => c.expansion === set.id);", "").replace("type: 'unique',", "type: 'unique',").replace("fusionList.push({", "const sc = cards.filter(c => c.expansion === set.id);\n        fusionList.push({");
});

fs.writeFileSync('src/TrackerApp.tsx', content);
