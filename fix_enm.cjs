const fs = require('fs');
let content = fs.readFileSync('src/data/energy_markers.ts', 'utf8');

// The file got squashed into one line. We need to restore newlines.
// It looks like each line ends with "ENM" and the next line starts with "M-" or "BT".
content = content.replace(/ENM\\nM-/g, 'ENM\nM-');
content = content.replace(/ENM\\nBT/g, 'ENM\nBT');

content = content.replace(/ENMM-/g, 'ENM\nM-');
content = content.replace(/ENMBT/g, 'ENM\nBT');

fs.writeFileSync('src/data/energy_markers.ts', content, 'utf8');
console.log("Fixed energy markers newlines!");
