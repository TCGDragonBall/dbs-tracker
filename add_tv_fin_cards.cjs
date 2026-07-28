const fs = require('fs');

function addCard(file, baseId, newId) {
    let data = fs.readFileSync(file, 'utf8');
    let lines = data.split('\n');
    let baseLine = lines.find(l => l.startsWith(baseId + '\t'));
    if (baseLine) {
        let parts = baseLine.split('\t');
        parts[0] = newId;
        // Check if '(Alt)' is already in the name, if so replace or leave it. 
        // baseId is P-219_TV which doesn't have Alt
        parts[1] += ' (Alt)';
        parts[2] = 'ALT'; 
        let newLine = parts.join('\t');
        
        let outLines = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('`;')) {
                outLines.push(newLine);
            }
            outLines.push(lines[i]);
        }
        fs.writeFileSync(file, outLines.join('\n'));
        console.log(`Added ${newId} to ${file}`);
    } else {
        console.log(`Base card ${baseId} not found in ${file}`);
    }
}

addCard('src/data/promos.ts', 'P-219_TV', 'P-219_TV_FIN');
addCard('src/data/promos.ts', 'P-261_TV', 'P-261_TV_FIN');
addCard('src/data/promos.ts', 'P-284_TV', 'P-284_TV_FIN');
addCard('src/data/promos.ts', 'P-293_TV', 'P-293_TV_FIN');
addCard('src/data/promos.ts', 'P-302_TV', 'P-302_TV_FIN');
addCard('src/data/promos.ts', 'P-310_TV', 'P-310_TV_FIN');

