const fs = require('fs');
function addCard(file, baseId, newId) {
    let data = fs.readFileSync(file, 'utf8');
    let lines = data.split('\n');
    let baseLine = lines.find(l => l.startsWith(baseId + '\t'));
    if (baseLine) {
        let parts = baseLine.split('\t');
        parts[0] = newId;
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
    }
}
addCard('src/data/bt5.ts', 'BT5-115', 'BT5-115_ALT');
addCard('src/data/bt6.ts', 'BT6-047', 'BT6-047_ALT');
addCard('src/data/promos.ts', 'P-223', 'P-223_ALT');
