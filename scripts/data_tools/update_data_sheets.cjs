const playmatEntries = `
PM-OR2019-01	Origins 2019 Single 1st	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-02	Origins 2019 Single 2nd	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-03	Origins 2019 Single 3rd	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-04	Origins 2019 Single Top 50	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-05	Origins 2019 Single Participation	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-06	Origins 2019 Team A 1st	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-07	Origins 2019 Team A 2nd	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-08	Origins 2019 Team A 3rd	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-09	Origins 2019 Team A Top 16	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-10	Origins 2019 Team A Participation	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-11	Origins 2019 Team B 1st	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-12	Origins 2019 Team B 2nd	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-13	Origins 2019 Team B 3rd	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-14	Origins 2019 Team B Top 16	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-15	Origins 2019 Team B Participation	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-16	Origins 2019 Team C 1st	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-17	Origins 2019 Team C 2nd	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-18	Origins 2019 Team C 3rd	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-19	Origins 2019 Team C Top 16	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-20	Origins 2019 Team C Participation	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-21	Origins 2019 Draft Champion	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
PM-OR2019-22	Origins 2019 Gunslinger Participation	Accessories	Playmat	Neutral	ORIGINS_2019	-	-	-	-	-	-	-	-
`;

const fs = require('fs');
let code = fs.readFileSync('src/data/playmats.ts', 'utf8');
code = code.replace(/`;\s*$/, playmatEntries + '`;\n');
fs.writeFileSync('src/data/playmats.ts', code);

// Sleeve
let sleeveCode = fs.readFileSync('src/data/sleeves.ts', 'utf8');
const sleeveEntry = `\nSL-OR2019	Origins 2019 Sleeve	Accessories	Sleeve	Neutral	COL11	-	-	-	-	-	Origins 2019	Origins 2019`;
sleeveCode = sleeveCode.trim() + sleeveEntry + '\n';
// wait, sleeves.ts originally is using backticks!
// Let's rewrite sleeves.ts correctly:
const newSleeveCode = `export const sleevesData = \`SL-M01	Gogeta Blue	PR	Sleeve	Blue	COL11	None	None	None	None	Sleeve	Draft Box 05	Draft Box 05 Tournament
SL-OR2019	Origins 2019 Sleeve	Accessories	Sleeve	Neutral	COL11	-	-	-	-	-	-	-	-\`;\n`;
fs.writeFileSync('src/data/sleeves.ts', newSleeveCode);

console.log("Updated data files");
