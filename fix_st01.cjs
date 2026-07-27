const fs = require('fs');

const data = fs.readFileSync('src/data/st01.ts', 'utf8');
const lines = data.split('\n');
const newLines = lines.map(line => {
    if (!line.trim()) return line;
    if (line.startsWith('export const')) return line;
    if (line === '`;') return line;
    
    let parts = line.split('\t');
    if (parts.length < 10) return line; // fallback
    
    let id = parts[0];
    let name = parts[1];
    let rarity = parts[2];
    
    if (id.includes('_p1')) {
        id = id.replace('_p1', '_A');
        if (!name.includes('(Alt)')) {
            name += ' (Alt)';
        }
        if (!rarity.endsWith('*')) {
            rarity += '*';
        }
    } else if (id.includes('_p2')) {
        id = id.replace('_p2', '_AA');
        if (!name.includes('(Alt)')) {
            name += ' (Alt)';
        }
        if (!rarity.endsWith('**')) {
            rarity += '**';
        }
    }
    
    parts[0] = id;
    parts[1] = name;
    parts[2] = rarity;
    
    return parts.join('\t');
});

fs.writeFileSync('src/data/st01.ts', newLines.join('\n'));
console.log('Fixed st01.ts');
