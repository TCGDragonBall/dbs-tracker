const fs = require('fs');

const bt11Data = fs.readFileSync('src/data/bt11.ts', 'utf8');
const cardLine = bt11Data.split('\n').find(l => l.startsWith('BT11-005_PR\t'));
const parts = cardLine.split('\t');

const card = {
  id: parts[0],
  name: parts[1],
  rarity: parts[2],
  type: parts[3],
  color: parts[4],
  expansion: parts[5],
  character: parts[10],
  specialTrait: parts[11],
  traits: parts[11],
  era: parts[12],
  cardNumber: parts[0]
};

console.log("Card is:", card);

const filters = {
  expansion: 'EXP19',
  rarities: [],
  colors: [],
  types: [],
  legalStatus: [],
  characters: [],
  traits: [],
  eras: [],
  owned: 'all',
  alternatives: []
};

const showAlternatives = false;
const isVirtualSet = (setId) => ['COL01', 'COL02', 'COL03', 'COL05', 'COL08', 'COL06', 'COL07', 'FP'].includes(setId);
const getCardTags = (card) => {
  return []; // simplified
};

const EXTRA_SET_CARDS = {
  'EXP7': ['BT1-052_PR03', 'BT1-055_PR02', 'BT6-007_PR', 'BT6-029_PR'],
  'EXP8': ['BT1-053_PR02', 'BT1-110_PR03'],
  'EXP19': ['BT11-005_PR'],
  'SD22': ['BT10-098_PR', 'BT10-099_PR']
};

const isAlternative = (cardId) => cardId.includes('_');

const gameType = 'masters';
const isGiant = false;
const isEvent = false;
const isTournament = false;
const isJudge = false;
const isSerial = false;
const searchQuery = '';

let matchesExpansion = filters.expansion === 'Todos';
if (!matchesExpansion) {
  matchesExpansion = card.expansion === filters.expansion && !isGiant;
  if (!matchesExpansion && filters.expansion) {
    if (typeof EXTRA_SET_CARDS !== 'undefined' && EXTRA_SET_CARDS[filters.expansion] && EXTRA_SET_CARDS[filters.expansion].includes(card.id)) matchesExpansion = true;
  }
}

const isAlt = isAlternative(card.id) && card.rarity !== 'SPR' && card.rarity !== 'GDR';
const isVirtual = isVirtualSet(filters.expansion);
const isExplicitExtra = filters.expansion !== 'Todos' && typeof EXTRA_SET_CARDS !== 'undefined' && EXTRA_SET_CARDS[filters.expansion] && EXTRA_SET_CARDS[filters.expansion].includes(card.id);

console.log("matchesExpansion:", matchesExpansion);
console.log("isAlt:", isAlt);
console.log("isVirtual:", isVirtual);
console.log("isExplicitExtra:", isExplicitExtra);

if (!isVirtual && !isExplicitExtra && filters.expansion !== 'Todos' && isAlt && !showAlternatives) {
  console.log("Returned false at isAlt check");
} else {
  console.log("Passed isAlt check");
}
