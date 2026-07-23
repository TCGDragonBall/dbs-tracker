const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const regexBase = /check: \(cards, inventory, inventoryMap\) => {\s*const cardTagsCheck = ([\s\S]*?)const isVirtual = isVirtualSet\(set\.id\);\s*const sCards = cards\.filter\(c => cardTagsCheck\(c, set\.id\) && \(isVirtual \|\| !c\.id\.match\(\/_PR\\d\*\$\/\) \|\| c\.rarity === 'SPR' \|\| c\.rarity === 'GDR'\)\);\s*const owned = sCards\.filter\(l => \(inventoryMap\?\.get\(l\.id\) \|\| 0\) > 0\);/g;

content = content.replace(regexBase, (match, p1) => {
  return `const cardTagsCheck = ${p1}const isVirtual = isVirtualSet(set.id);
          const sCards = cards.filter(c => cardTagsCheck(c, set.id) && (isVirtual || !c.id.match(/_PR\\d*$/) || c.rarity === 'SPR' || c.rarity === 'GDR'));
          check: (cards, inventory, inventoryMap) => {
            const owned = sCards.filter(l => (inventoryMap?.get(l.id) || 0) > 0);`;
});

const regexMaster = /check: \(cards, inventory, inventoryMap\) => {\s*const cardTagsCheck = ([\s\S]*?)const sCards = cards\.filter\(c => cardTagsCheck\(c, set\.id\)\);\s*const owned = sCards\.filter\(l => \(inventoryMap\?\.get\(l\.id\) \|\| 0\) > 0\);/g;

content = content.replace(regexMaster, (match, p1) => {
  return `const cardTagsCheck = ${p1}const sCards = cards.filter(c => cardTagsCheck(c, set.id));
          check: (cards, inventory, inventoryMap) => {
            const owned = sCards.filter(l => (inventoryMap?.get(l.id) || 0) > 0);`;
});

const regexGlobalExpansion = /check: \(cards, inventory, inventoryMap\) => {\s*const sc = cards\.filter\(c => c\.expansion === set\.id\);\s*if \(sc\.length === 0\) return \{ earned: false, progress: 0 \};\s*const owned = sc\.filter\(s => \(inventoryMap\?\.get\(s\.id\) \|\| 0\) > 0\)\.length;/g;

content = content.replace(regexGlobalExpansion, (match) => {
  return `const sc = cards.filter(c => c.expansion === set.id);
          check: (cards, inventory, inventoryMap) => {
            if (sc.length === 0) return { earned: false, progress: 0 };
            const owned = sc.filter(s => (inventoryMap?.get(s.id) || 0) > 0).length;`;
});

fs.writeFileSync('src/TrackerApp.tsx', content);
