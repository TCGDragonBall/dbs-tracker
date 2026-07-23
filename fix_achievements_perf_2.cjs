const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const regexLeader = /check: \(cards, inventory, inventoryMap\) => {\s*const setLeaders = cards\.filter\(c => c\.expansion === set\.id && c\.type\.toLowerCase\(\)\.includes\('leader'\)\);\s*const owned = setLeaders\.filter\(l => \(inventoryMap\?\.get\(l\.id\) \|\| 0\) > 0\);/g;

content = content.replace(regexLeader, (match) => {
  return "const setLeaders = cards.filter(c => c.expansion === set.id && c.type.toLowerCase().includes('leader'));\n              check: (cards, inventory, inventoryMap) => {\n                const owned = setLeaders.filter(l => (inventoryMap?.get(l.id) || 0) > 0);";
});

const regexRarity = /check: \(cards, inventory, inventoryMap\) => {\s*const rCards = cards\.filter\(c => c\.expansion === set\.id && c\.rarity === r\);\s*const owned = rCards\.filter\(l => \(inventoryMap\?\.get\(l\.id\) \|\| 0\) > 0\);/g;

content = content.replace(regexRarity, (match) => {
  return "const rCards = cards.filter(c => c.expansion === set.id && c.rarity === r);\n              check: (cards, inventory, inventoryMap) => {\n                const owned = rCards.filter(l => (inventoryMap?.get(l.id) || 0) > 0);";
});

const regexS = /check: \(cards, inventory, inventoryMap\) => {\s*const cardTagsCheck = ([\s\S]*?const sCards = cards\.filter\(c => \{\s*let matchesExp = c\.expansion === set\.id;\s*[\s\S]*?return matchesExp && !c\.id\.includes\('_SLR'\) && !isAlternative\(c\.id\);\s*\}\);\s*const owned = sCards\.filter\(l => \(inventoryMap\?\.get\(l\.id\) \|\| 0\) > 0\);)/g;

content = content.replace(regexS, (match, p1) => {
  // It's a bit complicated for sCards. I'll just leave it or write a simpler regex.
  return match; 
});

fs.writeFileSync('src/TrackerApp.tsx', content);
