import * as fs from 'fs';
import * as path from 'path';

const appTsxPath = path.resolve('src/App.tsx');
let appTsxContent = fs.readFileSync(appTsxPath, 'utf8');

// Find all event pack arrays
const epRegex = /const EVENT_PACK_\d+ = \[\s*([^\]]+)\s*\];/g;
let match;
let allEpCards: string[] = [];

while ((match = epRegex.exec(appTsxContent)) !== null) {
  const cardsCode = match[1];
  const cards = cardsCode.match(/'([^']+)'/g)?.map(c => c.slice(1, -1)) || [];
  allEpCards = allEpCards.concat(cards);
}

const uniqueEpCards = Array.from(new Set(allEpCards));

console.log(`Found ${uniqueEpCards.length} unique event pack cards.`);
fs.writeFileSync('ep_cards.json', JSON.stringify(uniqueEpCards, null, 2));

