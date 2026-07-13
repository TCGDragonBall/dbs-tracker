const fs = require('fs');

let playmatsData = fs.readFileSync('src/data/playmats.ts', 'utf8');

const newPlaymats = `
PM-AX2019-01	Anime Expo 2019 Goku Playmat	Accessories	Playmat	Neutral	ANIME_EXPO_2019	-	-	-	-	-	-	-	-
PM-AX2019-02	Anime Expo 2019 Vegeta Playmat	Accessories	Playmat	Neutral	ANIME_EXPO_2019	-	-	-	-	-	-	-	-
`;

playmatsData = playmatsData.replace(/`;\s*$/, newPlaymats + '`;\n');

fs.writeFileSync('src/data/playmats.ts', playmatsData);
console.log('Added anime expo playmats');
