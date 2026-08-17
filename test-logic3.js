const CARD_VARIATIONS = {
  "BT1-001": [
    { id: "BT1-001", label: { es: "Normal", en: "Normal" } },
    { id: "BT1-001_var_foil", label: { es: "Foil", en: "Foil" } }
  ],
  "BT1-002": [
    { id: "BT1-002", label: { es: "Normal", en: "Normal" } },
    { id: "BT1-002_var_foil", label: { es: "Foil", en: "Foil" } }
  ],
  "BT1-003": [
    { id: "BT1-003", label: { es: "Normal", en: "Normal" } }
  ]
};

const selectedCardIds = new Set(["BT1-001", "BT1-002"]);

let currentCommon = null;
for (const cardId of selectedCardIds) {
  const variations = CARD_VARIATIONS[cardId] || [{ id: cardId, label: { es: 'Normal', en: 'Normal' } }];
  
  if (currentCommon === null) {
    currentCommon = variations.map(v => v.label);
  } else {
    const variationLabels = variations.map(v => v.label.en);
    currentCommon = currentCommon.filter(c => variationLabels.includes(c.en));
  }
}
console.log(currentCommon);

const selectedCardIds2 = new Set(["BT1-001", "BT1-003"]);
currentCommon = null;
for (const cardId of selectedCardIds2) {
  const variations = CARD_VARIATIONS[cardId] || [{ id: cardId, label: { es: 'Normal', en: 'Normal' } }];
  
  if (currentCommon === null) {
    currentCommon = variations.map(v => v.label);
  } else {
    const variationLabels = variations.map(v => v.label.en);
    currentCommon = currentCommon.filter(c => variationLabels.includes(c.en));
  }
}
console.log(currentCommon);
