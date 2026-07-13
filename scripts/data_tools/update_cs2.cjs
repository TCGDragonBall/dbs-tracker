const fs = require('fs');

const replacements = [
  { file: 'src/data/bt9.ts', pattern: /^BT9-090	.*/m },
  { file: 'src/data/bt9.ts', pattern: /^BT9-091	.*/m },
  { file: 'src/data/bt9.ts', pattern: /^BT9-096	.*/m },
  { file: 'src/data/bt9.ts', pattern: /^BT9-099	.*/m },
  { file: 'src/data/bt9.ts', pattern: /^BT9-107	.*/m },
  { file: 'src/data/bt9.ts', pattern: /^BT9-115	.*/m },
  { file: 'src/data/bt10.ts', pattern: /^BT10-075	.*/m },
  { file: 'src/data/bt11.ts', pattern: /^BT11-030	.*/m },
  { file: 'src/data/bt12.ts', pattern: /^BT12-013	.*/m },
  { file: 'src/data/db2.ts', pattern: /^DB2-039	.*/m },
  { file: 'src/data/db3.ts', pattern: /^DB3-003	.*/m },
  { file: 'src/data/promos.ts', pattern: /^P-211	.*/m },
  { file: 'src/data/promos.ts', pattern: /^P-219	.*/m },
  { file: 'src/data/promos.ts', pattern: /^P-263	.*/m },
  { file: 'src/data/promos.ts', pattern: /^P-276	.*/m },
  { file: 'src/data/promos.ts', pattern: /^P-286	.*/m },
  { file: 'src/data/promos.ts', pattern: /^P-331	.*/m },
  { file: 'src/data/tb1.ts', pattern: /^TB1-052	.*/m },
];

for (const rep of replacements) {
  let content = fs.readFileSync(rep.file, 'utf-8');
  const match = content.match(rep.pattern);
  if (match) {
    const originalLine = match[0];
    const id = originalLine.split('\t')[0];
    const newLine = originalLine.replace(id, `${id}_CS2`);
    content = content.replace(originalLine, `${originalLine}\n${newLine}`);
    fs.writeFileSync(rep.file, content);
    console.log(`Added ${id}_CS2`);
  } else {
    console.log(`Not found: ${rep.pattern} in ${rep.file}`);
  }
}
