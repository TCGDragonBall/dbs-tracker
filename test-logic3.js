const EXTRA_SET_CARDS = {
  'EXP19': ['BT11-054_PR']
};
const card = { id: 'BT11-054_PR', rarity: 'PR', expansion: 'BT11' };
const filters = { expansion: 'BT11' };

let matchesExp = card.expansion === filters.expansion || (typeof EXTRA_SET_CARDS !== 'undefined' && EXTRA_SET_CARDS[filters.expansion] && EXTRA_SET_CARDS[filters.expansion].includes(card.id));

if (matchesExp && typeof EXTRA_SET_CARDS !== 'undefined') {
  // Is there code that does this?
  const isExtraCard = Object.values(EXTRA_SET_CARDS).some(arr => arr.includes(card.id));
  if (isExtraCard && !(EXTRA_SET_CARDS[filters.expansion] && EXTRA_SET_CARDS[filters.expansion].includes(card.id))) {
      // maybe matchesExp = false ???
  }
}
console.log(matchesExp);
