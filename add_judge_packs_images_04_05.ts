import * as fs from 'fs';
import * as path from 'path';

const file = path.join(process.cwd(), 'src', 'App.tsx');
let content = fs.readFileSync(file, 'utf8');

const imageAdditions = `
  'FB05-011_JEP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-011_p1.webp',
  'FB05-018_JEP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-018_p1.webp',
  'FB05-041_JEP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-041_p1.webp',
  'FB05-062_JEP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-062_p1.webp',
  'FB05-083_JEP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-083_p1.webp',
  'FB05-114_JEP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-114_p1.webp',
  'FB06-026_JEP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-026_p2.webp',
  'FB06-061_JEP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-061_p1.webp',
  'FB06-085_JEP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-085_p2.webp',
  'FB06-108_JEP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-108_p2.webp',
  'FB05-011_JSP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-011_p2.webp',
  'FB05-018_JSP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-018_p2.webp',
  'FB05-041_JSP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-041_p2.webp',
  'FB05-062_JSP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-062_p2.webp',
  'FB05-083_JSP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-083_p2.webp',
  'FB05-114_JSP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB05-114_p2.webp',
  'FB06-026_JSP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-026_p3.webp',
  'FB06-061_JSP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-061_p2.webp',
  'FB06-085_JSP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-085_p3.webp',
  'FB06-108_JSP04': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB06-108_p3.webp',
  'FB07-007_JEP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-007_p2.webp',
  'FB07-011_JEP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-011_p1.webp',
  'FB07-027_JEP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-027_p1.webp',
  'FB07-043_JEP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-043_p2.webp',
  'FB07-063_JEP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-063_p1.webp',
  'FB07-069_JEP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-069_p1.webp',
  'FB07-080_JEP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-080_p1.webp',
  'FB07-085_JEP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-085_p2.webp',
  'FB07-103_JEP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-103_p2.webp',
  'FB07-116_JEP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-116_p4.webp',
  'FB07-007_JSP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-007_p3.webp',
  'FB07-011_JSP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-011_p2.webp',
  'FB07-027_JSP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-027_p2.webp',
  'FB07-043_JSP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-043_p3.webp',
  'FB07-063_JSP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-063_p2.webp',
  'FB07-069_JSP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-069_p2.webp',
  'FB07-080_JSP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-080_p2.webp',
  'FB07-085_JSP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-085_p3.webp',
  'FB07-103_JSP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-103_p3.webp',
  'FB07-116_JSP05': 'https://www.dbs-cardgame.com/fw/images/cards/card/en/FB07-116_p5.webp',
`;

// Insert right before 'FB06-036_P1': in IMAGE_OVERRIDES
content = content.replace(/  'FB06-036_P1':/g, (match, offset) => {
  return offset > 1000 ? imageAdditions + match : match;
});
fs.writeFileSync(file, content);
console.log('Added images to App.tsx');
