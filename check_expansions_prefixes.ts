import * as fs from 'fs';

const filePath = './src/data/expansions.ts';
const fileContent = fs.readFileSync(filePath, 'utf8');

const regexLiteral = /export const expansionsData = `([\s\S]*?)`;/;
const matches = fileContent.match(regexLiteral);
if (matches) {
  const lines = matches[1].split('\n').filter(line => line.trim());
  const prefixes = new Set<string>();
  for (const line of lines) {
    const parts = line.split('\t');
    const cardNum = parts[0];
    const match = cardNum.match(/^(EX\d+)/i);
    if (match) {
      prefixes.add(match[1].toUpperCase());
    } else {
      const match2 = cardNum.match(/^([A-Za-z]+)/);
      if (match2) {
        prefixes.add(match2[1].toUpperCase());
      } else {
        prefixes.add(cardNum);
      }
    }
  }
  console.log("Found card prefixes in expansions.ts:", Array.from(prefixes).sort());
} else {
  console.log("Could not find expansionsData");
}
