const fs = require('fs');

let promosData = fs.readFileSync('src/data/promos.ts', 'utf8');

const GS_TEXT_ANIMENEXT = "Carta de tamaño gigante promocional. Es una carta coleccionable entregada en AnimeNEXT 2019.";
const GS_TEXT_OTAKON = "Carta de tamaño gigante promocional. Es una carta coleccionable entregada en OTAKON 2019.";

// Modify the old ones
promosData = promosData.replace(/Carta de tamaño gigante promocional\. No incluye texto de habilidad.*?torneo Release\./g, GS_TEXT_ANIMENEXT);

const newPromos = `
TB3-018_GS	Bardock / Bardock, Hope of the Saiyans	UC	Leader	Blue	COL02	10000 // 15000	-	-	-	Bardock // Bardock	Saiyan/Bardock's Crew // Saiyan/Bardock's Crew	Bardock Saga // Bardock Saga	${GS_TEXT_OTAKON}
BT5-001_GS	Yamcha / Yamcha, the Hungry Wolf	UC	Leader	Red	COL02	10000 // 15000	-	-	-	Yamcha // Yamcha	Earthling // Earthling	Pilaf Saga // Pilaf Saga	${GS_TEXT_OTAKON}
BT5-079_GS	Master Roshi / Max Power Master Roshi	UC	Leader	Yellow	COL02	10000 // 15000	-	-	-	Master Roshi // Master Roshi	Earthling // Earthling	Resurrection 'F' Saga // Resurrection 'F' Saga	${GS_TEXT_OTAKON}
BT5-105_GS	Black Masked Saiyan / Powerthirst Black Masked Saiyan	UC	Leader	Black	COL02	10000 // 15000	-	-	-	Black Masked Saiyan // Black Masked Saiyan	Saiyan // Saiyan	Dark Demon Realm Saga // Dark Demon Realm Saga	${GS_TEXT_OTAKON}
`;

promosData = promosData.replace(/`;\s*$/, newPromos + '`;\n');

fs.writeFileSync('src/data/promos.ts', promosData);

console.log('Fixed AnimeNEXT GS text and added Otakon GS cards.');
