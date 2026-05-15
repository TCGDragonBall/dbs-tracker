import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.resolve('src/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts'));

let allEPLines = new Set<string>();

// 1. Collect all EP lines
for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
        if (line.trim().length > 0 && line.includes('_EP') && line.includes('\t')) {
            let cleanLine = line.replace(/`;\s*$/, '').trim();
            if (cleanLine) {
                allEPLines.add(cleanLine);
            }
        }
    }
}

console.log(`Collected ${allEPLines.size} unique EP card lines.`);

// 2. Remove EP lines from all files EXCEPT promos.ts
for (const file of files) {
    if (file === 'promos.ts') continue;
    
    const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
    let lines = content.split('\n');
    let initialCount = lines.length;
    lines = lines.filter(line => !line.includes('_EP') || !line.includes('\t'));
    
    if (lines.length !== initialCount) {
        let lastCardIndex = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].trim().length > 0 && lines[i].includes('\t')) {
                lastCardIndex = i;
                break;
            }
        }
        if (lastCardIndex !== -1) {
            for(let i=0; i<lines.length; i++) {
                if (i !== lastCardIndex) {
                    lines[i] = lines[i].replace(/`;\s*$/, '');
                }
            }
            if (!lines[lastCardIndex].trim().endsWith('`;')) {
                lines[lastCardIndex] = lines[lastCardIndex].trimEnd() + '`;';
            }
        }
        fs.writeFileSync(path.join(dataDir, file), lines.join('\n'), 'utf8');
        console.log(`Updated ${file}: removed EP cards.`);
    }
}

// 3. Update promos.ts
const promosPath = path.join(dataDir, 'promos.ts');
let promosContent = fs.readFileSync(promosPath, 'utf8');
let promosLines = promosContent.split('\n');
promosLines = promosLines.filter(line => !line.includes('_EP') || !line.includes('\t'));

let insertIndex = -1;
for(let i=0; i<promosLines.length; i++) {
    if(promosLines[i].includes('\t')) {
        insertIndex = i;
        break;
    }
}
if (insertIndex === -1) insertIndex = promosLines.length;
const sortedEP = Array.from(allEPLines).sort();
promosLines.splice(insertIndex, 0, ...sortedEP);

let lastCardIndex = -1;
for (let i = promosLines.length - 1; i >= 0; i--) {
    if (promosLines[i].trim().length > 0 && promosLines[i].includes('\t')) {
        lastCardIndex = i;
        break;
    }
}
if (lastCardIndex !== -1) {
    for(let i=0; i<promosLines.length; i++) {
        if (i === lastCardIndex) {
            if (!promosLines[i].trim().endsWith('`;')) {
                promosLines[i] = promosLines[i].trimEnd() + '`;';
            }
        } else {
            promosLines[i] = promosLines[i].replace(/`;\s*$/, '');
        }
    }
}
fs.writeFileSync(promosPath, promosLines.join('\n'), 'utf8');
console.log(`Updated promos.ts with all EP cards.`);
