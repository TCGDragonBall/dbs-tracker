const fs = require('fs');

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

if (!app.includes("id: 'EP19'")) {
  app = app.replace(
    /\{ id: 'EP18', label: 'Event Pack 18', sub: 'Eventos' \},?/g,
    "{ id: 'EP18', label: 'Event Pack 18', sub: 'Eventos' },\n          { id: 'EP19', label: 'Event Pack 19', sub: 'Eventos' }"
  );
}

if (!app.includes("id: 'MASTERS_SEALED_EP19'")) {
  app = app.replace(
    /\{ id: 'MASTERS_SEALED_EP18', label: 'Event Pack 18', sub: 'Event Pack' \},?/g,
    "{ id: 'MASTERS_SEALED_EP18', label: 'Event Pack 18', sub: 'Event Pack' },\n          { id: 'MASTERS_SEALED_EP19', label: 'Event Pack 19', sub: 'Event Pack' }"
  );
}

fs.writeFileSync('src/TrackerApp.tsx', app);
console.log('Fixed categories!');
