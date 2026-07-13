import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.resolve('src/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts'));

let allJPLines = new Set<string>();

// 1. Collect all JP lines
for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
        if (line.trim().length > 0 && line.includes('_JP') && line.includes('\t')) {
            // Clean up backticks if they are at the end of the line
            let cleanLine = line.replace(/`;\s*$/, '').trim();
            if (cleanLine) {
                allJPLines.add(cleanLine);
            }
        }
    }
}

console.log(`Collected ${allJPLines.size} unique JP card lines.`);

// 2. Remove JP lines from all files EXCEPT promos.ts
for (const file of files) {
    if (file === 'promos.ts') continue;
    
    const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
    let lines = content.split('\n');
    let initialCount = lines.length;
    lines = lines.filter(line => !line.includes('_JP') || !line.includes('\t'));
    
    if (lines.length !== initialCount) {
        // Fix backticks for the new last line
        let lastCardIndex = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].trim().length > 0 && lines[i].includes('\t')) {
                lastCardIndex = i;
                break;
            }
        }
        if (lastCardIndex !== -1) {
            // Remove backticks from previous lines in this file just in case
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
        console.log(`Updated ${file}: removed JP cards.`);
    }
}

// 3. Update promos.ts with all collected JP lines
const promosPath = path.join(dataDir, 'promos.ts');
let promosContent = fs.readFileSync(promosPath, 'utf8');
let promosLines = promosContent.split('\n');

// Remove existing JP lines from promosLines temporarily to re-sort and avoid duplicates
promosLines = promosLines.filter(line => !line.includes('_JP') || !line.includes('\t'));

// Find the position after the exports started (usually line 2 or 3)
let insertIndex = -1;
for(let i=0; i<promosLines.length; i++) {
    if(promosLines[i].includes('\t')) {
        insertIndex = i;
        break;
    }
}

if (insertIndex === -1) insertIndex = promosLines.length;

// Sort JP lines for consistency
const sortedJP = Array.from(allJPLines).sort();

// Insert all collected JP lines
promosLines.splice(insertIndex, 0, ...sortedJP);

// Final pass to fix backticks and ensure only the LAST card line has it
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
console.log(`Updated promos.ts with all JP cards.`);
