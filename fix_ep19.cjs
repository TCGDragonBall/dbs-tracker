const fs = require('fs');

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

if (!app.includes("'SEALED_EVENT_PACK_18', 'SEALED_EVENT_PACK_19'")) {
  app = app.replace(
    /'SEALED_EVENT_PACK_18'/g,
    "$&, 'SEALED_EVENT_PACK_19'"
  );
}

if (!app.includes("'MASTERS_SEALED_EP19': ['SEALED_EVENT_PACK_19']")) {
  app = app.replace(
    /'MASTERS_SEALED_EP18': \['SEALED_EVENT_PACK_18'\],/g,
    "$& \n  'MASTERS_SEALED_EP19': ['SEALED_EVENT_PACK_19'],"
  );
}

if (!app.includes("'MASTERS_EP19': EVENT_PACK_19")) {
  app = app.replace(
    /'MASTERS_EP18': EVENT_PACK_18,/g,
    "$& \n  'MASTERS_EP19': EVENT_PACK_19,"
  );
}

fs.writeFileSync('src/TrackerApp.tsx', app);
console.log('Fixed array issues');
