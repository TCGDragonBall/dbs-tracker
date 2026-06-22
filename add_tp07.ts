import fs from 'fs';

const tsPath = './src/data/promos.ts';
let promosContent = fs.readFileSync(tsPath, 'utf8');
const lines = promosContent.split('\n');
const targetIds = ['P-126', 'P-127', 'P-128', 'P-129', 'P-130', 'P-131', 'P-132', 'P-133'];

let additions = '';

for (const line of lines) {
  if (!line.trim()) continue;
  const parts = line.split('\t');
  const baseId = parts[0];
  
  if (targetIds.includes(baseId)) {
    const newId = baseId + '_TP07_F';
    const hasAlready = lines.some(l => l.startsWith(newId + '\t'));
    if (!hasAlready) {
      additions += newId + '\t' + parts.slice(1).join('\t') + '\n';
    }
  }
}

if (additions) {
  fs.writeFileSync(tsPath, promosContent.trim() + '\n' + additions);
  console.log('Added foils');
} else {
  console.log('Already added or not found base cards');
}
