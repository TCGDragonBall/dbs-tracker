const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const regexGlobalExpansion = /list\.push\(\{\s*id: achId,\s*category: group\.category,\s*subCategory: set\.label,\s*icon: 'Layers',\s*title: \{ es: `\$\{set\.id\} Master`, en: `\$\{set\.id\} Master` \},\s*description: \{ es: `Colecciona todas las cartas de la expansión \$\{set\.label\}\.`, en: `Collect all cards from the \$\{set\.label\} expansion\.` \},\s*type: 'unique',\s*const sc = cards\.filter\(c => c\.expansion === set\.id\);\s*check: \(cards, inventory, inventoryMap\) => \{/g;

content = content.replace(regexGlobalExpansion, () => {
  return `const sc = cards.filter(c => c.expansion === set.id);\n        list.push({
          id: achId,
          category: group.category,
          subCategory: set.label,
          icon: 'Layers',
          title: { es: \`\${set.id} Master\`, en: \`\${set.id} Master\` },
          description: { es: \`Colecciona todas las cartas de la expansión \${set.label}.\`, en: \`Collect all cards from the \${set.label} expansion.\` },
          type: 'unique',
          check: (cards, inventory, inventoryMap) => {`;
});

const regexLeader = /list\.push\(\{\s*id: achId,\s*category: group\.category,\s*subCategory: set\.label,\s*icon: 'Trophy',\s*title: \{ es: `Líderes de \$\{set\.id\}`, en: `\$\{set\.id\} Leaders` \},\s*description: \{ es: `Consigue todos los líderes del set \$\{set\.id\}\.`, en: `Collect all leaders from \$\{set\.id\}\.` \},\s*type: 'unique',\s*const setLeaders = cards\.filter\(c => c\.expansion === set\.id && c\.type\.toLowerCase\(\)\.includes\('leader'\)\);\s*check: \(cards, inventory, inventoryMap\) => \{/g;

content = content.replace(regexLeader, () => {
  return `const setLeaders = cards.filter(c => c.expansion === set.id && c.type.toLowerCase().includes('leader'));\n            list.push({
              id: achId,
              category: group.category,
              subCategory: set.label,
              icon: 'Trophy',
              title: { es: \`Líderes de \${set.id}\`, en: \`\${set.id} Leaders\` },
              description: { es: \`Consigue todos los líderes del set \${set.id}.\`, en: \`Collect all leaders from \${set.id}.\` },
              type: 'unique',
              check: (cards, inventory, inventoryMap) => {`;
});

const regexRarity = /list\.push\(\{\s*id: achId,\s*category: group\.category,\s*subCategory: set\.label,\s*icon: \['SPR', 'SCR', 'GDR', 'GFR', 'DR', 'DPR'\]\.includes\(r\) \? 'Star' : 'Award',\s*title: \{ es: `\$\{set\.id\}: Rareza \$\{r\}`, en: `\$\{set\.id\}: Rarity \$\{r\}` \},\s*description: \{ es: `Consigue todas las cartas \$\{r\} de \$\{set\.id\}\.`, en: `Collect all \$\{r\} cards from \$\{set\.id\}\.` \},\s*type: 'unique',\s*const rCards = cards\.filter\(c => c\.expansion === set\.id && c\.rarity === r\);\s*check: \(cards, inventory, inventoryMap\) => \{/g;

content = content.replace(regexRarity, () => {
  return `const rCards = cards.filter(c => c.expansion === set.id && c.rarity === r);\n            list.push({
              id: achId,
              category: group.category,
              subCategory: set.label,
              icon: ['SPR', 'SCR', 'GDR', 'GFR', 'DR', 'DPR'].includes(r) ? 'Star' : 'Award',
              title: { es: \`\${set.id}: Rareza \${r}\`, en: \`\${set.id}: Rarity \${r}\` },
              description: { es: \`Consigue todas las cartas \${r} de \${set.id}.\`, en: \`Collect all \${r} cards from \${set.id}.\` },
              type: 'unique',
              check: (cards, inventory, inventoryMap) => {`;
});

fs.writeFileSync('src/TrackerApp.tsx', content);
