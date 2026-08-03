const fs = require('fs');

const path = 'src/TrackerApp.tsx';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
  "{ es: 'Eliminadas cartas duplicadas BT11-034_PR y BT11-052_PR. Restaurada BT10-098_PR y fijada la lógica para que las cartas promocionales aparezcan simultáneamente en su set especial (ej. EXP19, SD22) y en su set original (BT10, BT11).', en: 'Removed duplicate cards BT11-034_PR and BT11-052_PR. Restored BT10-098_PR and fixed logic so promo cards appear simultaneously in their special set (e.g., EXP19, SD22) and their original set (BT10, BT11).' }",
  "{ es: 'Eliminadas cartas duplicadas BT11-034_PR y BT11-052_PR. Vinculadas BT11-005_PR y BT11-005_PR02 a EXP19 y eliminada BT10-098_PR de BT10.', en: 'Removed duplicate cards BT11-034_PR and BT11-052_PR. Linked BT11-005_PR and BT11-005_PR02 to EXP19 and removed BT10-098_PR from BT10.' }"
);

fs.writeFileSync(path, data);
