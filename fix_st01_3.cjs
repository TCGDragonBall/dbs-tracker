const fs = require('fs');
let data = fs.readFileSync('src/data/st01.ts', 'utf8');
let lines = data.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('_A\t') || line.includes('_AA\t')) {
        let parts = line.split('\t');
        if (parts.length >= 3) {
            // p2 (AA)
            if (parts[0].includes('_AA')) {
                // Name -> (★★)
                parts[1] = parts[1].replace(/\(.*\)/, '(★★)');
                parts[2] = '**'; // Rarity
            } 
            // p1 (A)
            else if (parts[0].includes('_A')) {
                parts[1] = parts[1].replace(/\(.*\)/, '(Alt)');
                parts[2] = 'ALT'; // Rarity
            }
            lines[i] = parts.join('\t');
        }
    }
}
fs.writeFileSync('src/data/st01.ts', lines.join('\n'));
console.log('Fixed rarities and names for ST01.');
