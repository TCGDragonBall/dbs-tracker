const fs = require('fs');
const trackerCode = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// evaluate the EXTRA_SET_CARDS mapping
const extraMatch = trackerCode.match(/const EXTRA_SET_CARDS\s*:\s*Record<string, string\[\]>\s*=\s*(\{[\s\S]*?\n\});/);
if (!extraMatch) {
  console.log("Could not find EXTRA_SET_CARDS");
  process.exit(1);
}
let EXTRA_SET_CARDS;
eval(`EXTRA_SET_CARDS = ${extraMatch[1]}`);

console.log("EXTRA_SET_CARDS['EXP19']:", EXTRA_SET_CARDS['EXP19']);

const bt11Data = fs.readFileSync('src/data/bt11.ts', 'utf8');
const lines = bt11Data.split('\n').filter(l => l.trim());

const cards = lines.map(line => {
  const parts = line.split('\t').map(s => s?.trim() || '');
  return {
    cardNumber: parts[0],
    id: parts[0],
    expansion: parts[5]
  };
});

const filters = { expansion: 'EXP19' };

const filtered = cards.filter(card => {
  let matchesExpansion = false;
  if (card.expansion === filters.expansion) matchesExpansion = true;
  
  if (!matchesExpansion && filters.expansion) {
    if (EXTRA_SET_CARDS[filters.expansion] && EXTRA_SET_CARDS[filters.expansion].includes(card.id)) {
      matchesExpansion = true;
    }
  }
  return matchesExpansion;
});

console.log("Filtered length:", filtered.length);
console.log("Filtered cards:", filtered.map(c => c.id));
