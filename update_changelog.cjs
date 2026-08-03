const fs = require('fs');
let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

data = data.replace(
  "{ es: 'Añadidas las cartas BT6-007_PR y BT6-029_PR de Magnificent Collection.', en: 'Added BT6-007_PR and BT6-029_PR cards from Magnificent Collection.' }",
  "{ es: 'Añadidas las cartas BT6-007_PR y BT6-029_PR de Magnificent Collection.', en: 'Added BT6-007_PR and BT6-029_PR cards from Magnificent Collection.' },\n      { es: 'Eliminada la carta duplicada BT9-131_PR.', en: 'Removed duplicate card BT9-131_PR.' }"
);

fs.writeFileSync('src/TrackerApp.tsx', data);
