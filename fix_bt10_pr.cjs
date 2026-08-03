const fs = require('fs');

let bt10 = fs.readFileSync('src/data/bt10.ts', 'utf8');

const insertData = `BT10-098_PR\tTechnique Chain Son Goku\tPR\tBattle\tYellow\tBT10\t15000\t3(YY)\t1\t10000\tSon Goku: GT\tSaiyan\tShadow Dragon Saga\t[Unique] | [Activate Main] Y, if your Leader Card is a yellow 《Saiyan》 card and your opponent has 3 or more energy : Play this card from your hand. | [Activate Main] YY : Play up to 1 {Son Goku, Absolute Annihilation} from your deck on top of this card in Active Mode, then shuffle your deck.`;

const targetLine = "BT10-098\tTechnique Chain Son Goku\tC\tBattle\tYellow\tBT10\t15000\t3(YY)\t1\t10000\tSon Goku: GT\tSaiyan\tShadow Dragon Saga\t[Unique] | [Activate Main] Y, if your Leader Card is a yellow 《Saiyan》 card and your opponent has 3 or more energy : Play this card from your hand. | [Activate Main] YY : Play up to 1 {Son Goku, Absolute Annihilation} from your deck on top of this card in Active Mode, then shuffle your deck.";

bt10 = bt10.replace(targetLine, targetLine + "\n" + insertData);

fs.writeFileSync('src/data/bt10.ts', bt10);
