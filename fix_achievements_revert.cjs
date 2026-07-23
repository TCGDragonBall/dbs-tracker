const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Revert O(N^2) logic back to precomputed O(N) outside the check
const regexGeneral = /check: \(cards, inventory, inventoryMap\) => {\s*const count = Array\.from\(inventoryMap\?\.keys\(\) \|\| \[\]\)\.filter\(id => \(inventoryMap\?\.get\(id\) \|\| 0\) > 0\)\.length;/g;
content = content.replace(regexGeneral, `check: (cards, inventory, inventoryMap) => {
          const count = cards.filter(c => (inventoryMap?.get(c.id) || 0) > 0).length;`);

const regexLeader = /check: \(cards, inventory, inventoryMap\) => {\s*const count = Array\.from\(inventoryMap\?\.keys\(\) \|\| \[\]\)\.filter\(id => { const c = cards\.find\(c => c\.id === id\); return c && c\.type\.toLowerCase\(\)\.includes\('leader'\) && \(inventoryMap\?\.get\(id\) \|\| 0\) > 0; }\)\.length;/g;
content = content.replace(regexLeader, `const leaderCards = cards.filter(c => c.type.toLowerCase().includes('leader'));
        check: (cards, inventory, inventoryMap) => {
          const count = leaderCards.filter(c => (inventoryMap?.get(c.id) || 0) > 0).length;`);

const regexSCR = /check: \(cards, inventory, inventoryMap\) => {\s*const count = Array\.from\(inventoryMap\?\.keys\(\) \|\| \[\]\)\.filter\(id => { const c = cards\.find\(c => c\.id === id\); return c && c\.rarity === 'SCR' && \(inventoryMap\?\.get\(id\) \|\| 0\) > 0; }\)\.length;/g;
content = content.replace(regexSCR, `const scrCards = cards.filter(c => c.rarity === 'SCR');
        check: (cards, inventory, inventoryMap) => {
          const count = scrCards.filter(c => (inventoryMap?.get(c.id) || 0) > 0).length;`);

const regexGDR = /check: \(cards, inventory, inventoryMap\) => {\s*const count = Array\.from\(inventoryMap\?\.keys\(\) \|\| \[\]\)\.filter\(id => { const c = cards\.find\(c => c\.id === id\); return c && c\.rarity === 'GDR' && \(inventoryMap\?\.get\(id\) \|\| 0\) > 0; }\)\.length;/g;
content = content.replace(regexGDR, `const gdrCards = cards.filter(c => c.rarity === 'GDR');
        check: (cards, inventory, inventoryMap) => {
          const count = gdrCards.filter(c => (inventoryMap?.get(c.id) || 0) > 0).length;`);

const regexBattle = /check: \(cards, inventory, inventoryMap\) => {\s*const uniqueOwnedBattleCards = Array\.from\(inventoryMap\?\.keys\(\) \|\| \[\]\)\.filter\(id => { const c = cards\.find\(c => c\.id === id\); return c && c\.type\.toLowerCase\(\)\.includes\('battle'\) && \(inventoryMap\?\.get\(id\) \|\| 0\) > 0; }\);/g;
content = content.replace(regexBattle, `const battleCards = cards.filter(c => c.type.toLowerCase().includes('battle'));
        check: (cards, inventory, inventoryMap) => {
          const uniqueOwnedBattleCards = battleCards.filter(c => (inventoryMap?.get(c.id) || 0) > 0);`);

const regexSCR4 = /check: \(cards, inventory, inventoryMap\) => {\s*const item = Array\.from\(inventoryMap\?\.keys\(\) \|\| \[\]\)\.find\(id => { const c = cards\.find\(c => c\.id === id\); return c && c\.rarity === 'SCR' && \(inventoryMap\?\.get\(id\) \|\| 0\) >= 4; }\);/g;
content = content.replace(regexSCR4, `const scrCards4 = cards.filter(c => c.rarity === 'SCR');
        check: (cards, inventory, inventoryMap) => {
          const item = scrCards4.find(c => (inventoryMap?.get(c.id) || 0) >= 4);`);

const regexPromo = /check: \(cards, inventory, inventoryMap\) => {\s*const ownedPromosCount = Array\.from\(inventoryMap\?\.keys\(\) \|\| \[\]\)\.filter\(id => { const c = cards\.find\(c => c\.id === id\); return c && c\.expansion === 'FP' && \(inventoryMap\?\.get\(id\) \|\| 0\) > 0; }\)\.length;/g;
content = content.replace(regexPromo, `const fpCards = cards.filter(c => c.expansion === 'FP');
      check: (cards, inventory, inventoryMap) => {
        const ownedPromosCount = fpCards.filter(c => (inventoryMap?.get(c.id) || 0) > 0).length;`);

fs.writeFileSync('src/TrackerApp.tsx', content);
