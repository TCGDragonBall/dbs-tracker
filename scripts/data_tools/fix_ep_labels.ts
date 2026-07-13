import fs from 'fs';

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const oldStr = `{ id: 'MASTERS_SEALED_EP02', label: 'Event Pack 2018 (Event Pack 02)', sub: 'Event Pack' }
        ]`;
const newStr = `{ id: 'MASTERS_SEALED_EP02', label: 'Event Pack 2018 (Event Pack 02)', sub: 'Event Pack' },
          { id: 'MASTERS_SEALED_EP03', label: 'Event Pack 03', sub: 'Event Pack' },
          { id: 'MASTERS_SEALED_EP04', label: 'Event Pack 04', sub: 'Event Pack' }
        ]`;

if (app.includes(oldStr)) {
    app = app.replace(oldStr, newStr);
}

fs.writeFileSync('src/TrackerApp.tsx', app);
console.log('Fixed subItems correctly');
