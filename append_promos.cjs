const fs = require('fs');

const cards = JSON.parse(fs.readFileSync('parsed_cards.json', 'utf8'));

let lines = [];
for (let c of cards) {
  let type = c.type; // It's "BATTLE" or "UNISON", we need proper casing
  if (type === 'BATTLE') type = 'Battle';
  else if (type === 'UNISON') type = 'Unison';
  else if (type === 'EXTRA') type = 'Extra';
  else if (type === 'LEADER') type = 'Leader';
  
  let set = c.id.includes('_PR') ? 'PRW' : 'PR'; // Just PR is fine usually, wait, P-754_W was PRW. P-755_PR was PR.
  // Wait, I will just use PR for all, or PR for normal and PR for PRs? P-756_PR is PR in the TS file!
  set = 'PR';

  let comboCost = c.comboCost || '-';
  // But wait, comboCost is not parsed properly? It's not in the html usually except for some. I'll just use "0" if comboPower is 5000, 1 if 10000.
  if (comboCost === '' || comboCost === '-') {
    if (c.comboPower === '5000') comboCost = '0';
    else if (c.comboPower === '10000') comboCost = '1';
    else comboCost = '-';
  }
  let comboPower = c.comboPower || '-';
  let power = c.power || '-';
  let cost = c.cost || '-';
  let character = c.character || '-';
  let traits = c.traits || '-';
  let era = c.era || '-';
  let skill = c.skill.replace(/\n/g, ' | ') || '-';
  
  let line = `${c.id}\t${c.name}\t${set}\t${type}\t${c.color}\tPROMO\t${power}\t${cost}\t${comboCost}\t${comboPower}\t${character}\t${traits}\t${era}\t${skill}`;
  lines.push(line);
}

let promosContent = fs.readFileSync('src/data/promos.ts', 'utf8');

// The file ends with a backtick and semicolon? Or just backtick.
// Let's replace the closing backtick with the new lines and the backtick.
promosContent = promosContent.replace(/\n`;?\s*$/, '\n' + lines.join('\n') + '\n`;\n');

fs.writeFileSync('src/data/promos.ts', promosContent);
console.log('Appended to promos.ts');
