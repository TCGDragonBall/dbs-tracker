const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const replacement = `  const varToCardId = useMemo(() => {
    const map = new Map<string, string>();
    cards.forEach(c => {
      const vars = CARD_VARIATIONS[c.id];
      if (vars) {
        vars.forEach(v => map.set(v.id, c.id));
      }
    });
    return map;
  }, [cards]);

  const ownedCardQuantities = useMemo(() => {
    const quantities = new Map<string, number>();
    if (!cards || !inventory) return quantities;
    
    inventory.forEach(i => {
      if (i.quantity > 0) {
        const cardId = varToCardId.get(i.cardId) || i.cardId;
        quantities.set(cardId, (quantities.get(cardId) || 0) + i.quantity);
      }
    });
    return quantities;
  }, [inventory, varToCardId]);`;

content = content.replace(/  const ownedCardQuantities = useMemo\(\(\) => \{[\s\S]*?\}, \[cards, inventory\]\);/g, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content);
