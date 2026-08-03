const EXTRA_SET_CARDS = {
  'BT11': ['BT11-054_PR03']
};
const card = { id: 'BT11-054_PR03', rarity: 'PR', expansion: 'BT11' };
const filters = { expansion: 'BT11' };

const isAlt = true; // _PR is alt
const isVirtual = false;
const showAlternatives = false;

const isExplicitExtraInAnySet = Object.values(EXTRA_SET_CARDS).some(arr => arr.includes(card.id));
const isExplicitExtra = isExplicitExtraInAnySet || (filters.expansion !== 'Todos' && EXTRA_SET_CARDS[filters.expansion] && EXTRA_SET_CARDS[filters.expansion].includes(card.id));

console.log("will it hide?", (!isVirtual && !isExplicitExtra && filters.expansion !== 'Todos' && isAlt && !showAlternatives));
