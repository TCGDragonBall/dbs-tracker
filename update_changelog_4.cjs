const fs = require('fs');
let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

data = data.replace(
  "{ es: 'Añadidas las cartas BT10-098 y BT10-099 junto con sus variantes PR.', en: 'Added cards BT10-098 and BT10-099 along with their PR variants.' }",
  "{ es: 'Añadidas las cartas BT10-098, BT10-099 y BT10-099_PR (eliminada BT10-098_PR por estar duplicada).', en: 'Added cards BT10-098, BT10-099 and BT10-099_PR (removed BT10-098_PR as it was duplicated).' }"
);

fs.writeFileSync('src/TrackerApp.tsx', data);
