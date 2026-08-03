const fs = require('fs');
let data = fs.readFileSync('src/data/bt10.ts', 'utf8');

const insertData = `BT10-098\tTechnique Chain Son Goku\tC\tBattle\tYellow\tBT10\t15000\t3(YY)\t1\t10000\tSon Goku: GT\tSaiyan\tShadow Dragon Saga\t[Unique] | [Activate Main] Y, if your Leader Card is a yellow 《Saiyan》 card and your opponent has 3 or more energy : Play this card from your hand. | [Activate Main] YY : Play up to 1 {Son Goku, Absolute Annihilation} from your deck on top of this card in Active Mode, then shuffle your deck.
BT10-098_PR\tTechnique Chain Son Goku\tPR\tBattle\tYellow\tBT10\t15000\t3(YY)\t1\t10000\tSon Goku: GT\tSaiyan\tShadow Dragon Saga\t[Unique] | [Activate Main] Y, if your Leader Card is a yellow 《Saiyan》 card and your opponent has 3 or more energy : Play this card from your hand. | [Activate Main] YY : Play up to 1 {Son Goku, Absolute Annihilation} from your deck on top of this card in Active Mode, then shuffle your deck.
BT10-099\tSon Goku, Adventure into the Unknown\tUC\tBattle\tYellow\tBT10\t5000\t1(Y)\t0\t5000\tSon Goku: GT\tSaiyan\tShadow Dragon Saga\t[Auto] Add 1 card from your life to your hand : When this card attacks, it gets +10000 power and [Critical] for the turn.
BT10-099_PR\tSon Goku, Adventure into the Unknown\tPR\tBattle\tYellow\tBT10\t5000\t1(Y)\t0\t5000\tSon Goku: GT\tSaiyan\tShadow Dragon Saga\t[Auto] Add 1 card from your life to your hand : When this card attacks, it gets +10000 power and [Critical] for the turn.`;

const targetLine = "BT10-097_PR03\tSon Goku, Absolute Annihilation\tPR\tBattle\tYellow\tBT10\t20000\t3(YYY)\t0\t5000\tSon Goku: GT\tSaiyan\tShadow Dragon Saga\t[Deflect][Barrier][Unique] | [Permanent] If your Leader Card is yellow, your opponent can't activate Extra Cards unless they switch 1 of their energy to Rest Mode.";

data = data.replace(targetLine, targetLine + "\n" + insertData);

fs.writeFileSync('src/data/bt10.ts', data);
