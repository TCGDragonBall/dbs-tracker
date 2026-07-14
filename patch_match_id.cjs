const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// The type is matchId?: string, so let's allow it
const targetDelete = `const handleDelete = async (matchId: string) => {`;
const replacementDelete = `const handleDelete = async (matchId?: string) => {
    if (!matchId) return;`;

content = content.replace(targetDelete, replacementDelete);
fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched delete to handle optional id");
