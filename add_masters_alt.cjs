const fs = require('fs');

function addCard(file, baseId, newId) {
    let data = fs.readFileSync(file, 'utf8');
    let lines = data.split('\n');
    let baseLine = lines.find(l => l.startsWith(baseId + '\t'));
    if (baseLine) {
        let parts = baseLine.split('\t');
        parts[0] = newId;
        // The user said: nomenclature and tipology: ALT.
        // Let's add (Alt) to name and set Rarity to ALT.
        parts[1] += ' (Alt)';
        parts[2] = 'ALT'; 
        lines.push(parts.join('\t'));
        fs.writeFileSync(file, lines.join('\n'));
        console.log(`Added ${newId} to ${file}`);
    } else {
        console.log(`Base card ${baseId} not found in ${file}`);
    }
}

addCard('src/data/bt5.ts', 'BT5-115', 'BT5-115_ALT');
addCard('src/data/bt6.ts', 'BT6-047', 'BT6-047_ALT');
addCard('src/data/promos.ts', 'P-223', 'P-223_ALT');
