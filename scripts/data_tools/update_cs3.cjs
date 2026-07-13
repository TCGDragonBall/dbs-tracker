const fs = require('fs');

const replacements = [
  { file: 'src/data/bt10.ts', pattern: /^BT10-030\t.*/m },
  { file: 'src/data/bt10.ts', pattern: /^BT10-148\t.*/m },
  { file: 'src/data/bt11.ts', pattern: /^BT11-042\t.*/m },
  { file: 'src/data/bt12.ts', pattern: /^BT12-137\t.*/m },
  { file: 'src/data/bt13.ts', pattern: /^BT13-135\t.*/m },
  { file: 'src/data/bt15.ts', pattern: /^BT15-096\t.*/m },
  { file: 'src/data/bt16.ts', pattern: /^BT16-005\t.*/m },
  { file: 'src/data/bt16.ts', pattern: /^BT16-071\t.*/m },
  { file: 'src/data/bt16.ts', pattern: /^BT16-087\t.*/m },
  { file: 'src/data/bt16.ts', pattern: /^BT16-117\t.*/m },
  { file: 'src/data/bt17.ts', pattern: /^BT17-004\t.*/m },
  { file: 'src/data/bt17.ts', pattern: /^BT17-066\t.*/m },
  { file: 'src/data/eb1.ts', pattern: /^EB1-20\t.*/m },
  { file: 'src/data/expansions.ts', pattern: /^EX6-30\t.*/m },
  { file: 'src/data/expansions.ts', pattern: /^EX13-16\t.*/m },
  { file: 'src/data/promos.ts', pattern: /^P-247\t.*/m },
  { file: 'src/data/promos.ts', pattern: /^P-337\t.*/m },
  { file: 'src/data/promos.ts', pattern: /^P-351\t.*/m },
];

for (const rep of replacements) {
  let content = fs.readFileSync(rep.file, 'utf-8');
  const match = content.match(rep.pattern);
  if (match) {
    const originalLine = match[0];
    const id = originalLine.split('\t')[0];
    const newLine = originalLine.replace(id, `${id}_CS3`);
    content = content.replace(originalLine, `${originalLine}\n${newLine}`);
    fs.writeFileSync(rep.file, content);
    console.log(`Added ${id}_CS3`);
  } else {
    console.log(`Not found: ${rep.pattern} in ${rep.file}`);
  }
}
