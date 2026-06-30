const fs = require('fs');

let playmats = fs.readFileSync('src/data/playmats.ts', 'utf-8');
playmats += `
PM-CEL19-01	Celebrations 2019 Playmat 1	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-02	Celebrations 2019 Playmat 2	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-03	Celebrations 2019 Playmat 3	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-04	Celebrations 2019 Playmat 4	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-05	Celebrations 2019 Playmat 5	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-06	Celebrations 2019 Playmat 6	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-07	Celebrations 2019 Playmat 7	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-08	Celebrations 2019 Playmat 8	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-09	Celebrations 2019 Playmat 9	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-10	Celebrations 2019 Playmat 10	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-11	Celebrations 2019 Playmat 11	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-12	Celebrations 2019 Playmat 12	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-13	Celebrations 2019 Playmat 13	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-14	Celebrations 2019 Playmat 14	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-15	Celebrations 2019 Playmat 15	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-16	Celebrations 2019 Playmat 16	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-17	Celebrations 2019 Playmat 17	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
`;
// Need to insert inside the backtick!
playmats = playmats.replace(/\n`;$/, `\nPM-CEL19-01	Celebrations 2019 Playmat 1	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-02	Celebrations 2019 Playmat 2	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-03	Celebrations 2019 Playmat 3	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-04	Celebrations 2019 Playmat 4	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-05	Celebrations 2019 Playmat 5	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-06	Celebrations 2019 Playmat 6	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-07	Celebrations 2019 Playmat 7	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-08	Celebrations 2019 Playmat 8	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-09	Celebrations 2019 Playmat 9	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-10	Celebrations 2019 Playmat 10	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-11	Celebrations 2019 Playmat 11	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-12	Celebrations 2019 Playmat 12	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-13	Celebrations 2019 Playmat 13	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-14	Celebrations 2019 Playmat 14	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-15	Celebrations 2019 Playmat 15	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-16	Celebrations 2019 Playmat 16	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-
PM-CEL19-17	Celebrations 2019 Playmat 17	Accessories	Playmat	Neutral	PM_CELEBRATIONS_2019	-	-	-	-	-	-	-	-\n\`;`);
fs.writeFileSync('src/data/playmats.ts', playmats);

let sleeves = fs.readFileSync('src/data/sleeves.ts', 'utf-8');
sleeves = sleeves.replace(/\n`;$/, `\nSL-CEL19-01	Celebrations 2019 Sleeves	Accessories	Sleeve	Neutral	SL_CELEBRATIONS_2019	-	-	-	-	-	-	-	-\n\`;`);
fs.writeFileSync('src/data/sleeves.ts', sleeves);

let tracker = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');
tracker = tracker.replace(/import \{ playmatsData \} from '.\/data\/playmats';/, "import { playmatsData } from './data/playmats';\nimport { casesData, separatorsData } from './data/accessories';");
tracker = tracker.replace(/\$\{playmatsData\}/, "${playmatsData}\\n${casesData}\\n${separatorsData}");
fs.writeFileSync('src/TrackerApp.tsx', tracker);
console.log("Updated data files");
