const fs = require('fs');

let playmatsData = fs.readFileSync('src/data/playmats.ts', 'utf8');

const newPlaymats = `
PM-OT2019-01	Otakon 2019 Single Tournament A 1st Place Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-02	Otakon 2019 Single Tournament A 2nd Place Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-03	Otakon 2019 Single Tournament A 3rd Place Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-04	Otakon 2019 Single Tournament A Top 16 Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-05	Otakon 2019 Single Tournament A Participation Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-06	Otakon 2019 Single Tournament B 1st Place Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-07	Otakon 2019 Single Tournament B 2nd Place Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-08	Otakon 2019 Single Tournament B 3rd Place Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-09	Otakon 2019 Single Tournament B Top 16 Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-10	Otakon 2019 Single Tournament B Participation Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-11	Otakon 2019 Single Tournament C 1st Place Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-12	Otakon 2019 Single Tournament C 2nd Place Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-13	Otakon 2019 Single Tournament C 3rd Place Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-14	Otakon 2019 Single Tournament C Top 16 Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
PM-OT2019-15	Otakon 2019 Single Tournament C Participation Playmat	Accessories	Playmat	Neutral	OTAKON_2019	-	-	-	-	-	-	-	-
`;

playmatsData = playmatsData.replace(/`;\s*$/, newPlaymats + '`;\n');

fs.writeFileSync('src/data/playmats.ts', playmatsData);
console.log('Added otakon playmats');
