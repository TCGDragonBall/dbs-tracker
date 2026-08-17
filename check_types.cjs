const fs = require('fs');

let content = fs.readFileSync('src/data/playmats.ts', 'utf-8');
// Or just check all `card.type` values anywhere? The user specifically mentioned "tapetes" (playmats).
// Let's check for any other horizontal formats.
