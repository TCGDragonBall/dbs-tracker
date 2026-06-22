import fs from 'fs';

let promos = fs.readFileSync('src/data/promos.ts', 'utf8');
const lines = promos.split('\n');
const newLines = lines.filter(line => {
    if (line.startsWith('P-165_PR\t')) return false;
    if (line.startsWith('P-166_PR\t')) return false;
    if (line.startsWith('P-167_PR\t')) return false;
    if (line.startsWith('P-168_PR\t')) return false;
    if (line.startsWith('P-169_PR\t')) return false;
    if (line.startsWith('P-170_PR\t')) return false;
    if (line.startsWith('P-171_PR\t')) return false;
    if (line.startsWith('P-172_PR\t')) return false;
    return true;
});
fs.writeFileSync('src/data/promos.ts', newLines.join('\n'));
console.log('Fixed extra _PR versions for 165-172 in promos.ts');
