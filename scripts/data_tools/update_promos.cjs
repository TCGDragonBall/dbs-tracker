const fs = require('fs');
const content = fs.readFileSync('src/data/promos.ts', 'utf-8');

const replacements = [
  { id: 'P-036', line: `P-036	Scientist Fu	PR	Battle	Black	PROMO	25000	7(-)	1	10000	Fu	Scientist	Unknown	[Over Realm 7][one] (If you have at least ７ cards in your Drop Area, you can play this card by sending all cards in your Drop Area to your Warp. At the end of that turn, send this card from the Battle Area to your Warp. [Over Realm] can be activated once per turn) | [Double Strike] | [Auto] When you play this card using [Over Realm], draw 2 cards.` },
  { id: 'P-086', line: `P-086	Janemba / Relentless Speed Janemba	PR	Leader	Blue	PROMO	10000 // 15000	-	-	-	Janemba // Janemba	Evil Incarnate // Evil Incarnate	Janemba Saga // Janemba Saga	[Permanent] You can't include cards with energy costs of 5 or more in your deck. | [Auto] When this card attacks, draw 1 card, and place 2 cards from the top of your opponent's deck in their Drop Area. | [Awaken] When your life is at 4 or less : You may choose up to 2 of your energy, switch them to Active Mode, and flip this card over. // [Auto] When this card attacks, draw 1 card, and place 2 cards from the top of your opponent's deck in their Drop Area. | [Auto] When this card is attacked, you may place 1 blue card from your hand in your Drop Area. If you do, negate the attack, and negate this skill for the duration of the game.` },
  { id: 'P-112', line: `P-112	Super Baby 1, Parasitic Menace	PR	Battle	Red	PROMO	25000	5(RR)	0	5000	Baby/Vegeta : GT	Machine Mutant/Saiyan	Baby Saga	[EX-Evolve] Red 〈Baby〉 card with an energy cost of 4. (Play this card on top of the specified card.) | [Double Strike] | [Auto] When a card evolves into this card, draw 1 card, then choose up to 1 of your opponent's Battle Cards, it gets -5000 power for the duration of the turn, and you can't play {Super Baby 1, Parasitic Menace} for the duration of the turn. | [Activate Main] R : Choose 1 〈Baby〉 card with an energy cost of 6 from your hand and play it on top of this card.` },
  { id: 'P-124', line: `P-124	Goku Black, Unforeseen Darkness	PR	Battle	Blue	PROMO	15000	2(BB)	0	5000	Goku Black	God/Saiyan	Future Trunks Saga	[Auto] When you play this card from your hand, activate this skill. At the end of this turn, if there is a card that is both blue and yellow in your energy, draw 2 cards, choose 1 card in your hand and place it in your Drop Area, then choose up to 1 of your blue or yellow energy and switch it to Active Mode.` },
  { id: 'P-181', line: `P-181	Broly / Broly, Surge of Brutality	PR	Leader	Multi	PROMO	10000 // 15000	-	-	-	Broly // Broly	Saiyan // Saiyan	Broly Saga // Broly Saga	[Auto][Once per turn] When you combo with a red or green card, draw 1 card. | [Awaken: Surge] Choose 1 red card and 1 green card in your hand and place them under this card : You may draw 2 cards, then choose up to 2 of your energy, switch them to Active Mode, and flip this card over. // [Activate Battle][Once per turn] If your life is at 3 or less and you choose 1 card under this card and place it in your Drop Area : Choose one- | ・ Choose up to 1 Battle Card in your Drop Area, combo with it, then this card gains [Double Strike] for the duration of the turn. | ・ Choose 1 of your opponent's Battle Cards, ignoring [Barrier], and KO it.` }
];

let newContent = content;
for (const {id, line} of replacements) {
    const cs1Line = line.replace(id, `${id}_CS1`);
    newContent = newContent.replace(line, `${line}\n${cs1Line}`);
}

fs.writeFileSync('src/data/promos.ts', newContent);
console.log('done');
