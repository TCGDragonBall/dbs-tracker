const fs = require('fs');
let content = fs.readFileSync('src/data/promos.ts', 'utf8');

const regex = /P-223_PR\tZarbon, Cosmic Elite\tPR\tBattle\tGreen\tPROMO\t5000\t2\(G\)\t0\t5000\tZarbon\tFrieza's Army\tFrieza Saga\t\[Blocker\] \| \[Activate Main\]G, choose 1 green card in your hand and discard it : Play this card from your Drop Area\. \| \[Auto\] If your opponent has 5 or more cards in their hand : When this card is removed from a Battle Area by a skill or KO'd, your opponent chooses 1 card in their hand and discards it\./;

const replace = `P-223_PR\tZarbon, Cosmic Elite\tPR\tBattle\tGreen\tPROMO\t5000\t2(G)\t0\t5000\tZarbon\tFrieza's Army\tFrieza Saga\t[Blocker] | [Activate Main]G, choose 1 green card in your hand and discard it : Play this card from your Drop Area. | [Auto] If your opponent has 5 or more cards in their hand : When this card is removed from a Battle Area by a skill or KO'd, your opponent chooses 1 card in their hand and discards it.
P-223_TP\tZarbon, Cosmic Elite\tPR\tBattle\tGreen\tPROMO\t5000\t2(G)\t0\t5000\tZarbon\tFrieza's Army\tFrieza Saga\t[Blocker] | [Activate Main]G, choose 1 green card in your hand and discard it : Play this card from your Drop Area. | [Auto] If your opponent has 5 or more cards in their hand : When this card is removed from a Battle Area by a skill or KO'd, your opponent chooses 1 card in their hand and discards it.
P-223_PCC\tZarbon, Cosmic Elite\tPR\tBattle\tGreen\tPROMO\t5000\t2(G)\t0\t5000\tZarbon\tFrieza's Army\tFrieza Saga\t[Blocker] | [Activate Main]G, choose 1 green card in your hand and discard it : Play this card from your Drop Area. | [Auto] If your opponent has 5 or more cards in their hand : When this card is removed from a Battle Area by a skill or KO'd, your opponent chooses 1 card in their hand and discards it.`;

if (content.match(regex)) {
  content = content.replace(regex, replace);
  fs.writeFileSync('src/data/promos.ts', content, 'utf8');
  console.log("Updated promos.ts");
} else {
  console.log("P-223_PR not found");
}
