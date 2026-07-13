const fs = require('fs');

let content = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');

// Replace P-232 overrides block
const oldImages = `  'P-232': 'https://dragonball.center/files/module_dbc/objetos/9/tl7m116766.jpg',`;
const newImages = `  'P-232': 'https://dragonball.center/files/module_dbc/objetos/9/tl7m116766.jpg',\n  'P-232_W': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-232.png',`;

content = content.replace(oldImages, newImages);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf-8');
console.log("Success");
