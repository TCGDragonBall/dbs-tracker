const fs = require('fs');
let data = fs.readFileSync('src/data/promos.ts', 'utf8');
console.log(data.split('\n').filter(l => l.includes('_TV_SE')).join('\n'));
