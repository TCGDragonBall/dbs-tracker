const fs = require('fs');

let code = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Remove the GS from EXTRA_VARIANTS_ORIGINS
code = code.replace(
  /'BT6-105': \{ id: 'BT6-105_GS', label: \{ es: 'Giant Size', en: 'Giant Size' \}, isFoil: false \},\n/,
  ''
);
code = code.replace(
  /'BT6-027': \{ id: 'BT6-027_GS', label: \{ es: 'Giant Size', en: 'Giant Size' \}, isFoil: false \},\n/,
  ''
);
code = code.replace(
  /'BT6-028': \{ id: 'BT6-028_GS', label: \{ es: 'Giant Size', en: 'Giant Size' \}, isFoil: false \},\n/,
  ''
);
code = code.replace(
  /'BT6-079': \{ id: 'BT6-079_GS', label: \{ es: 'Giant Size', en: 'Giant Size' \}, isFoil: false \}\n/,
  ''
);
// Also remove dangling comma if BT3-104 is the last one now
code = code.replace(
  /'BT3-104_OR19', label: \{ es: 'Origins 2019', en: 'Origins 2019' \}, isFoil: false \},\n/,
  "'BT3-104_OR19', label: { es: 'Origins 2019', en: 'Origins 2019' }, isFoil: false }\n"
);

// We keep the IMAGE_OVERRIDES for them exactly as they are because the app respects IMAGE_OVERRIDES for any card ID.
fs.writeFileSync('src/TrackerApp.tsx', code);


// Now append them to promos.ts
const giantCards = `
BT6-105_GS	Son Goku / Bonds of Friendship Son Goku	UC	Leader	Black	COL02	10000 // 15000	-	-	-	Son Goku : Childhood // Son Goku : Childhood	Saiyan // Saiyan	The Path to Power Saga // The Path to Power Saga	[Permanent] If there is a skill-less Battle Card in your Drop Area, you can activate this card's [Awaken] skill when your life is at 6 or less. | [Activate Main] [Once per turn] Choose 1 {Four-Star Ball} from your hand and reveal it : Draw 1 card and this card gets +5000 power for the duration of the turn. | [Awaken] When your life is at 4 or less : You may draw 1 card, then choose up to 1 of your energy, switch it to Active Mode, and flip this card over. // [Activate Main] [Once per turn] Choose 1 {Four-Star Ball} from your hand and reveal it : Draw 2 cards, then choose 1 card from your hand and place it in your Drop Area. | [Auto] [Once per turn] When you combo with a skill-less card, that card gets +5000 combo power for the duration of the turn.
BT6-027_GS	Dende / Son Goku, Energy Restored	UC	Leader	Blue	COL02	10000 // 15000	-	-	-	Dende // Son Goku	Namekian/God/Shenron // Saiyan/Shenron	Majin Buu Saga // Majin Buu Saga	[Permanent] You can't include Extra Cards with energy costs of 4 or more in your deck, and this card can't attack. | [Activate Main] [Burst 2] (You must place the top 2 cards of your deck in your Drop Area to activate this skill.) Switch this card to Rest Mode : Choose up to 2 [Dragon Ball] cards from your deck or life and add them to your hand, then shuffle any areas you looked through. | [Wish] When there are 7 [Dragon Ball] cards in your Drop Area : Choose up to 1 《Desire》 card from your Drop Area, add it to your hand, and flip this card over. // [Activate Main][Once per turn] Choose one? | ・Draw 1 card. | ・Choose 1 blue or black 《Desire》 card in your hand with an energy cost less than or equal to your current energy and activate its [Activate Main] skill. | ・Remove 7 [Dragon Ball] cards in your Drop Area from the game. If you do, draw 2 cards, choose up to 2 of your blue energy, switch them to Active Mode, then flip this card over at the end of the turn.
BT6-028_GS	Majin Buu / Majin Buu, Ability Absorber	UC	Leader	Blue	COL02	10000 // 15000	-	-	-	Majin Buu // Majin Buu	Majin // Majin	Majin Buu Saga // Majin Buu Saga	[Permanent] You can't send cards from Drop Areas to Warps. | [Auto] When this card attacks, draw 1 card. | [Activate Main][Once per turn][Burst 3] (You must place the top 3 cards of your deck in your Drop Area to activate this skill.) Choose 1 of your energy : You may place the chosen energy in your Drop Area. If you do, choose up to 1 〈Majin Buu〉 card in your Drop Area and add it to your energy in Rest Mode. | [Awaken] When your life is at 4 or less : You may draw 1 card, then choose up to 1 of your energy, switch it to Active Mode, and flip this card over. // [Permanent] You can't send cards from Drop Areas to Warps. | [Auto][Sparking 7] (This skill takes effect when you have 7 or more cards in your Drop Area.) When this card attacks, draw 1 card, and this card gets +5000 power for the duration of the turn. | [Activate Main][Once per turn] Choose 1 of your energy : You may place the chosen energy in your Drop Area. If you do, choose up to 1 〈Majin Buu〉 card in your Drop Area, and add it to your energy in Rest Mode.
BT6-079_GS	Son Gohan / Untapped Power SS2 Son Gohan	UC	Leader	Yellow	COL02	10000 // 15000	-	-	-	Son Gohan : Childhood // Son Gohan : Childhood	Saiyan/Earthling // Saiyan/Earthling	Boujack Saga // Boujack Saga	[Auto] [Burst 2] (You must place the top 2 cards of your deck in your Drop Area to activate this skill.) When this card attacks, you may choose 1 yellow card from your hand and place it in your Drop Area. If you do, draw 2 cards. | [Awaken] When your life is at 4 or less : You may choose up to 2 of your energy, switch them to Active Mode, and flip this card over. // [Auto] [Sparking 5] (This skill takes effect when you have 5 or more cards in your Drop Area.) When this card attacks, draw 1 card. | [Activate Main] Choose up to 1 yellow 《Saiyan》 card in your Drop Area with an energy cost of 3 or more, add it to your hand, and negate this skill for the duration of the game.
`;

let promosData = fs.readFileSync('src/data/promos.ts', 'utf8');
promosData = promosData.replace(/`;\s*$/, giantCards + '`;\n');
fs.writeFileSync('src/data/promos.ts', promosData);

console.log("Fixed GS cards");
