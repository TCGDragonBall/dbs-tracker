const fs = require('fs');

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target1 = `          if (filters.expansion.startsWith('FB') && filters.expansion !== 'FB10' && PACK_ARRAYS[\`FP_RELEASE_\${filters.expansion}\`]?.includes(card.id)) matchesExpansion = true;`;
const insert1 = `          if (typeof EXTRA_SET_CARDS !== 'undefined' && EXTRA_SET_CARDS[filters.expansion] && EXTRA_SET_CARDS[filters.expansion].includes(card.id)) matchesExpansion = true;`;

app = app.replace(target1, insert1 + "\n" + target1);

const target2 = `    if (!isVirtual && filters.expansion !== 'Todos' && isAlt && !showAlternatives) return false;`;
const insert2 = `    const isExplicitExtra = filters.expansion !== 'Todos' && typeof EXTRA_SET_CARDS !== 'undefined' && EXTRA_SET_CARDS[filters.expansion] && EXTRA_SET_CARDS[filters.expansion].includes(card.id);
    if (!isVirtual && !isExplicitExtra && filters.expansion !== 'Todos' && isAlt && !showAlternatives) return false;`;

app = app.replace(target2, insert2);

fs.writeFileSync('src/TrackerApp.tsx', app);
