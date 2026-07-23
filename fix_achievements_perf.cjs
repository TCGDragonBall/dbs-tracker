const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Replace cards.filter in check functions with exactInventoryMap loops where possible
content = content.replace(
  /const count = cards\.filter\(c => \(inventoryMap\?\.get\(c\.id\) \|\| 0\) > 0\)\.length;/g,
  "const count = Array.from(inventoryMap?.keys() || []).filter(id => (inventoryMap?.get(id) || 0) > 0).length;"
);

content = content.replace(
  /const count = cards\.filter\(c => c\.type\.toLowerCase\(\)\.includes\('leader'\) && \(inventoryMap\?\.get\(c\.id\) \|\| 0\) > 0\)\.length;/g,
  "const count = Array.from(inventoryMap?.keys() || []).filter(id => { const c = cards.find(c => c.id === id); return c && c.type.toLowerCase().includes('leader') && (inventoryMap?.get(id) || 0) > 0; }).length;"
);

content = content.replace(
  /const count = cards\.filter\(c => c\.rarity === 'SCR' && \(inventoryMap\?\.get\(c\.id\) \|\| 0\) > 0\)\.length;/g,
  "const count = Array.from(inventoryMap?.keys() || []).filter(id => { const c = cards.find(c => c.id === id); return c && c.rarity === 'SCR' && (inventoryMap?.get(id) || 0) > 0; }).length;"
);

content = content.replace(
  /const count = cards\.filter\(c => c\.rarity === 'GDR' && \(inventoryMap\?\.get\(c\.id\) \|\| 0\) > 0\)\.length;/g,
  "const count = Array.from(inventoryMap?.keys() || []).filter(id => { const c = cards.find(c => c.id === id); return c && c.rarity === 'GDR' && (inventoryMap?.get(id) || 0) > 0; }).length;"
);

content = content.replace(
  /const uniqueOwnedBattleCards = cards\.filter\(c => c\.type\.toLowerCase\(\)\.includes\('battle'\) && \(inventoryMap\?\.get\(c\.id\) \|\| 0\) > 0\);/g,
  "const uniqueOwnedBattleCards = Array.from(inventoryMap?.keys() || []).filter(id => { const c = cards.find(c => c.id === id); return c && c.type.toLowerCase().includes('battle') && (inventoryMap?.get(id) || 0) > 0; });"
);

content = content.replace(
  /const item = cards\.find\(c => c\.rarity === 'SCR' && \(inventoryMap\?\.get\(c\.id\) \|\| 0\) >= 4\);/g,
  "const item = Array.from(inventoryMap?.keys() || []).find(id => { const c = cards.find(c => c.id === id); return c && c.rarity === 'SCR' && (inventoryMap?.get(id) || 0) >= 4; });"
);

content = content.replace(
  /const ownedPromosCount = cards\.filter\(c => c\.expansion === 'FP' && \(inventoryMap\?\.get\(c\.id\) \|\| 0\) > 0\)\.length;/g,
  "const ownedPromosCount = Array.from(inventoryMap?.keys() || []).filter(id => { const c = cards.find(c => c.id === id); return c && c.expansion === 'FP' && (inventoryMap?.get(id) || 0) > 0; }).length;"
);

fs.writeFileSync('src/TrackerApp.tsx', content);
