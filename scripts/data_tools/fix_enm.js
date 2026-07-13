import fs from 'fs';
let content = fs.readFileSync('src/data/energy_markers.ts', 'utf8');

content = content.replace(/ENM\\nM-/g, 'ENM\nM-');
content = content.replace(/ENM\\nBT/g, 'ENM\nBT');
content = content.replace(/ENMM-/g, 'ENM\nM-');
content = content.replace(/ENMBT/g, 'ENM\nBT');

fs.writeFileSync('src/data/energy_markers.ts', content, 'utf8');
console.log("Fixed energy markers newlines!");
