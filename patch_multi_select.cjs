const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `  const handleLongPress = (cardId: string) => {
    setIsMultiSelectMode(true);
    const newSelected = new Set(selectedCardIds);
    newSelected.add(cardId);
    setSelectedCardIds(newSelected);
  };

  const toggleCardSelection = (cardId: string) => {
    const newSelected = new Set(selectedCardIds);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
      if (newSelected.size === 0) {
        setIsMultiSelectMode(false);
      }
    } else {
      newSelected.add(cardId);
    }
    setSelectedCardIds(newSelected);
  };`;

const replacement = `  const handleLongPress = (cardId: string) => {
    setIsMultiSelectMode(true);
    setSelectedCardIds(prev => {
      const newSelected = new Set(prev);
      newSelected.add(cardId);
      return newSelected;
    });
  };

  const toggleCardSelection = (cardId: string) => {
    setSelectedCardIds(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(cardId)) {
        newSelected.delete(cardId);
        if (newSelected.size === 0) {
          setTimeout(() => setIsMultiSelectMode(false), 0);
        }
      } else {
        newSelected.add(cardId);
      }
      return newSelected;
    });
  };`;

content = content.replace(target, replacement);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched multi select functions");
