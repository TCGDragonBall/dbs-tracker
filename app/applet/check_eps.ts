import * as fs from 'fs';
import * as path from 'path';

const appPath = 'src/App.tsx';
const appContent = fs.readFileSync(appPath, 'utf-8');

// Find all EVENT_PACK arrays
const epArraysMatch = appContent.match(/const EVENT_PACK_\d+ = \[([\s\S]*?)\];/g);

const allEpCards = [];
if (epArraysMatch) {
  for (const match of epArraysMatch) {
    const cardsStrMatches = match.match(/'([^']+)'/g);
    if (cardsStrMatches) {
      for (const c of cardsStrMatches) {
        allEpCards.push(c.replace(/'/g, ''));
      }
    }
  }
}

console.log('Total EP cards referenced in App.tsx:', allEpCards.length);

const dataDir = path.join(process.cwd(), 'src/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'allCards.ts');

const existingCards = new Set();
for (const file of files) {
  const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('\t')) {
      const id = line.split('\t')[0].trim();
      existingCards.add(id);
    }
  }
}

const missingCards = [];
for (const card of allEpCards) {
  if (!existingCards.has(card)) {
    missingCards.push(card);
  }
}

console.log('Missing EP cards:', missingCards);
