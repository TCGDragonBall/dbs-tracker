const fs = require('fs');

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// targetExpansion logic
const targetStr = `                            } else if (selectedCard.id === 'SEALED_EVENT_PACK_19') {
                              targetExpansion = 'EP19';\n`;
if (!app.includes("selectedCard.id === 'SEALED_EVENT_PACK_19'")) {
  app = app.replace(
    /(\} else if \(selectedCard\.id === 'SEALED_EVENT_PACK_18'\) \{\n\s*targetExpansion = 'EP18';\n)/,
    `$1${targetStr}`
  );
}

// bg styling
if (!app.includes("'EP19': 'bg-[50%_25%]'")) {
  app = app.replace(
    /('EP18': 'bg-\[50%_25%\]',)/,
    `$1\n  'EP19': 'bg-[50%_25%]',`
  );
}

// Map dictionary
if (!app.includes("EP19: EVENT_PACK_19")) {
  app = app.replace(
    /EP18: EVENT_PACK_18,/g,
    "$& EP19: EVENT_PACK_19,"
  );
}

// Tags array
if (!app.includes("EVENT_PACK_19.includes(id)")) {
  app = app.replace(
    /EVENT_PACK_18\.includes\(id\)/g,
    "$& || EVENT_PACK_19.includes(id)"
  );
}

// Also fix the MASTERS_SEALED_EP18 array which had comma added incorrectly
app = app.replace(
  /'MASTERS_SEALED_EP18': \['SEALED_EVENT_PACK_18', 'SEALED_EVENT_PACK_19'\],/g,
  `'MASTERS_SEALED_EP18': ['SEALED_EVENT_PACK_18'],\n  'MASTERS_SEALED_EP19': ['SEALED_EVENT_PACK_19'],`
);

app = app.replace(
  /'SEALED_EVENT_PACK_18', 'SEALED_EVENT_PACK_19': 'https/g,
  `'SEALED_EVENT_PACK_18': 'https`
);

fs.writeFileSync('src/TrackerApp.tsx', app);
console.log('Fixed EP19 references');
