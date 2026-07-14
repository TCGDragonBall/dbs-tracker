const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const regexModal = /<img src=\{c\.imageUrl\} alt=\{c\.name\} className="absolute inset-0 w-full h-full object-cover object-top" referrerPolicy="no-referrer" \/>/g;
content = content.replace(regexModal, '<img src={c.imageUrl} alt={c.name} className="absolute inset-0 w-full h-full object-contain" referrerPolicy="no-referrer" />');

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched images");
