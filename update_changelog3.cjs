const fs = require('fs');
let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

data = data.replace(
  "{ es: 'Eliminadas las cartas duplicadas BT9-131_PR y BT9-133_PR.', en: 'Removed duplicate cards BT9-131_PR and BT9-133_PR.' }",
  "{ es: 'Eliminadas las cartas duplicadas BT9-131_PR y BT9-133_PR.', en: 'Removed duplicate cards BT9-131_PR and BT9-133_PR.' },\n      { es: 'Añadidas las cartas BT10-098 y BT10-099 junto con sus variantes PR.', en: 'Added cards BT10-098 and BT10-099 along with their PR variants.' }"
);

fs.writeFileSync('src/TrackerApp.tsx', data);
