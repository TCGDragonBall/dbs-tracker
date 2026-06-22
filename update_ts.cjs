const fs = require('fs');

const ts01 = [
  { file: 'src/data/bt9.ts', pattern: /^BT9-131\t.*/m, suffix: '_TS01' },
  { file: 'src/data/bt10.ts', pattern: /^BT10-060\t.*/m, suffix: '_TS01' },
  { file: 'src/data/bt10.ts', pattern: /^BT10-065\t.*/m, suffix: '_TS01' },
  { file: 'src/data/bt10.ts', pattern: /^BT10-066\t.*/m, suffix: '_TS01' },
  { file: 'src/data/bt11.ts', pattern: /^BT11-034\t.*/m, suffix: '_TS01' },
  { file: 'src/data/bt11.ts', pattern: /^BT11-074\t.*/m, suffix: '_TS01' },
  { file: 'src/data/bt11.ts', pattern: /^BT11-093\t.*/m, suffix: '_TS01' },
  { file: 'src/data/bt13.ts', pattern: /^BT13-012\t.*/m, suffix: '_TS01' },
  { file: 'src/data/bt13.ts', pattern: /^BT13-071\t.*/m, suffix: '_TS01' },
  { file: 'src/data/bt14.ts', pattern: /^BT14-029\t.*/m, suffix: '_TS01' },
  { file: 'src/data/db1.ts', pattern: /^DB1-021\t.*/m, suffix: '_TS01' },
  { file: 'src/data/db1.ts', pattern: /^DB1-040\t.*/m, suffix: '_TS01' },
  { file: 'src/data/db3.ts', pattern: /^DB3-022\t.*/m, suffix: '_TS01' },
  { file: 'src/data/db3.ts', pattern: /^DB3-116\t.*/m, suffix: '_TS01' },
  { file: 'src/data/db3.ts', pattern: /^DB3-127\t.*/m, suffix: '_TS01' }
];

const ts02 = [
  { file: 'src/data/bt9.ts', pattern: /^BT9-133\t.*/m, suffix: '_TS02' },
  { file: 'src/data/bt10.ts', pattern: /^BT10-041\t.*/m, suffix: '_TS02' },
  { file: 'src/data/bt10.ts', pattern: /^BT10-068\t.*/m, suffix: '_TS02' },
  { file: 'src/data/bt10.ts', pattern: /^BT10-088\t.*/m, suffix: '_TS02' },
  { file: 'src/data/bt10.ts', pattern: /^BT10-105\t.*/m, suffix: '_TS02' },
  { file: 'src/data/bt11.ts', pattern: /^BT11-032\t.*/m, suffix: '_TS02' },
  { file: 'src/data/bt11.ts', pattern: /^BT11-052\t.*/m, suffix: '_TS02' },
  { file: 'src/data/bt11.ts', pattern: /^BT11-053\t.*/m, suffix: '_TS02' },
  { file: 'src/data/bt11.ts', pattern: /^BT11-066\t.*/m, suffix: '_TS02' },
  { file: 'src/data/db1.ts', pattern: /^DB1-002\t.*/m, suffix: '_TS02' },
  { file: 'src/data/db2.ts', pattern: /^DB2-133\t.*/m, suffix: '_TS02' },
  { file: 'src/data/db2.ts', pattern: /^DB2-159\t.*/m, suffix: '_TS02' },
  { file: 'src/data/db3.ts', pattern: /^DB3-126\t.*/m, suffix: '_TS02' },
  { file: 'src/data/eb1.ts', pattern: /^EB1-07\t.*/m, suffix: '_TS02' },
  { file: 'src/data/expansions.ts', pattern: /^EX12-02\t.*/m, suffix: '_TS02' }
];

const replacements = [...ts01, ...ts02];

for (const rep of replacements) {
  let content = fs.readFileSync(rep.file, 'utf-8');
  const match = content.match(rep.pattern);
  if (match) {
    const originalLine = match[0];
    const id = originalLine.split('\t')[0];
    const newLine = originalLine.replace(id, `${id}${rep.suffix}`);
    content = content.replace(originalLine, `${originalLine}\n${newLine}`);
    fs.writeFileSync(rep.file, content);
    console.log(`Added ${id}${rep.suffix}`);
  } else {
    console.log(`Not found: ${rep.pattern} in ${rep.file}`);
  }
}
