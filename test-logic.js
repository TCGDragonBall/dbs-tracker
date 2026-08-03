const EXTRA_SET_CARDS = {
  'EXP19': ['BT11-065_PR']
};
const card = { id: 'BT11-065_PR', rarity: 'PR', expansion: 'BT11' };
const filters = { expansion: 'BT11' };

const isAlt = true; // _PR is alt
const isVirtual = false;
const showAlternatives = false;

const isExplicitExtraInAnySet = Object.values(EXTRA_SET_CARDS).some(arr => arr.includes(card.id));
const isExplicitExtra = isExplicitExtraInAnySet || (filters.expansion !== 'Todos' && EXTRA_SET_CARDS[filters.expansion] && EXTRA_SET_CARDS[filters.expansion].includes(card.id));

console.log("isAlt", isAlt);
console.log("isExplicitExtraInAnySet", isExplicitExtraInAnySet);
console.log("isExplicitExtra", isExplicitExtra);
console.log("will it hide?", (!isVirtual && !isExplicitExtra && filters.expansion !== 'Todos' && isAlt && !showAlternatives));

let matchesExpansion = card.expansion === filters.expansion; // true
if (!matchesExpansion && filters.expansion) {
  if (EXTRA_SET_CARDS[filters.expansion] && EXTRA_SET_CARDS[filters.expansion].includes(card.id)) matchesExpansion = true;
}

if (matchesExpansion && isExplicitExtraInAnySet && (!EXTRA_SET_CARDS[filters.expansion] || !EXTRA_SET_CARDS[filters.expansion].includes(card.id))) {
  // Wait, does TrackerApp do this?
}
