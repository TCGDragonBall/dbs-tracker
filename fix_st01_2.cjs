const fs = require('fs');

let data = fs.readFileSync('src/data/st01.ts', 'utf8');
let lines = data.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('_A\t') || line.includes('_AA\t')) {
        let parts = line.split('\t');
        if (parts.length >= 3) {
            // "las P1 que has marcado serían las que tienen una estrella (ALT lo has llamado en otras ocasiones)"
            // "y si es P2, son 2 estrellas"
            // Wait! If they mean the name?
            if (parts[0].includes('_AA')) {
                // p2
                parts[1] = parts[1].replace('(Alt)', '(★★)');
                parts[2] = parts[2].replace('**', '★★').replace('SCR**', 'SCR★★');
            } else if (parts[0].includes('_A')) {
                // p1
                parts[1] = parts[1].replace('(Alt)', '(ALT)');
                parts[2] = parts[2].replace('*', 'ALT');
            }
            lines[i] = parts.join('\t');
        }
    }
}
fs.writeFileSync('src/data/st01.ts', lines.join('\n'));
