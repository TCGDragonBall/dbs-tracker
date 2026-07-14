const cards = [
  { id: 'FB01-001', rarity: 'L', cardNumber: 'FB01-001' },
  { id: 'FB01-001_A', rarity: 'L*', cardNumber: 'FB01-001_A' },
  { id: 'BT1-001', rarity: 'R', cardNumber: 'BT1-001' },
  { id: 'BT1-001_PR', rarity: 'PR', cardNumber: 'BT1-001_PR' },
  { id: 'BT1-011_SPR', rarity: 'SPR', cardNumber: 'BT1-011_SPR' },
  { id: 'P-008', rarity: 'PR', cardNumber: 'P-008' },
  { id: 'P-008_PR', rarity: 'PR', cardNumber: 'P-008_PR' },
];

const getVersionId = (card) => {
  if (card.rarity && card.rarity.includes('*')) return card.id;
  if (['SPR', 'GDR', 'SCR', 'SLR', 'SGR', 'DPR', 'TR'].includes(card.rarity)) return card.id;
  return card.cardNumber ? card.cardNumber.split('_')[0] : card.id.split('_')[0];
};

cards.forEach(c => console.log(c.id, '->', getVersionId(c)));
