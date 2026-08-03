const fs = require('fs');
let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

data = data.replace(
  "{ es: 'Eliminada la carta duplicada BT9-131_PR.', en: 'Removed duplicate card BT9-131_PR.' }",
  "{ es: 'Eliminadas las cartas duplicadas BT9-131_PR y BT9-133_PR.', en: 'Removed duplicate cards BT9-131_PR and BT9-133_PR.' }"
);

fs.writeFileSync('src/TrackerApp.tsx', data);
