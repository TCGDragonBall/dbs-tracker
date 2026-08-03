const fs = require('fs');

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

app = app.replace(
  "{ es: 'Eliminadas cartas duplicadas BT11-034_PR y BT11-052_PR. Vinculadas BT11-005_PR a EXP19 y BT10-098_PR, BT10-099_PR a SD22.', en: 'Removed duplicate cards BT11-034_PR and BT11-052_PR. Linked BT11-005_PR to EXP19 and BT10-098_PR, BT10-099_PR to SD22.' }",
  "{ es: 'Eliminadas cartas duplicadas BT11-034_PR y BT11-052_PR. Restaurada BT10-098_PR y fijada la lógica para que las cartas promocionales aparezcan simultáneamente en su set especial (ej. EXP19, SD22) y en su set original (BT10, BT11).', en: 'Removed duplicate cards BT11-034_PR and BT11-052_PR. Restored BT10-098_PR and fixed logic so promo cards appear simultaneously in their special set (e.g., EXP19, SD22) and their original set (BT10, BT11).' }"
);

fs.writeFileSync('src/TrackerApp.tsx', app);
