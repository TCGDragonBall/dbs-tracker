const fs = require('fs');
let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

data = data.replace(
  "'BT11-005_PR03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT11-005_PR03.png',",
  "'BT11-005_PR03': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT11-005_PR03.png',\n  'BT11-005_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT11-005_PR.png',"
);

// update changelog
data = data.replace(
  "{ es: 'Añadidas las cartas BT10-098, BT10-099 y BT10-099_PR (eliminada BT10-098_PR por estar duplicada).', en: 'Added cards BT10-098, BT10-099 and BT10-099_PR (removed BT10-098_PR as it was duplicated).' }",
  "{ es: 'Añadidas las cartas BT10-098, BT10-099 y BT10-099_PR (eliminada BT10-098_PR por estar duplicada).', en: 'Added cards BT10-098, BT10-099 and BT10-099_PR (removed BT10-098_PR as it was duplicated).' },\n      { es: 'Registrada la imagen para BT11-005_PR.', en: 'Registered image for BT11-005_PR.' }"
);

fs.writeFileSync('src/TrackerApp.tsx', data);
