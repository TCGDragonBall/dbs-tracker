const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const replacement = `  const availableOptions = useMemo(() => {
    // Filter cards by expansion and search query first to determine valid sub-filters
    const q = searchQuery.toLowerCase();
    const normalize = (str: string) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    const nq = normalize(searchQuery);
    const hasHyphen = searchQuery.includes('-');
    const queryActive = searchQuery.length >= 2 && searchQuery !== 'Promo Vol.4' && searchQuery !== 'Tournament Pack 2' && searchQuery !== 'Tournament Pack 3' && searchQuery !== 'Tournament Pack 4' && searchQuery !== 'Tournament Pack 5' && searchQuery !== 'Tournament Pack 6' && searchQuery !== 'Store Tournament Vol.1' && searchQuery !== 'Store Tournament Vol.2' && searchQuery !== 'Store Tournament Vol.3' && searchQuery !== 'Store Tournament Vol.4' && searchQuery !== 'Energy Marker Pack 01' && !searchQuery.startsWith('Union Force PR') && !searchQuery.startsWith('Cross Worlds PR') && !searchQuery.startsWith('Colossal Warfare PR') && searchQuery !== 'Puzzle Hunt';

    const expansionCards = cards.filter(card => {
      // 1. Check expansion
      if (filters.expansion !== 'Todos') {
        const isGiant = getCardTags(card).includes('giant');
        if (filters.expansion === 'COL02' && !isGiant) return false;
        else if (filters.expansion === 'COL05' && !getCardTags(card).includes('event')) return false;
        else if (filters.expansion === 'COL06' && !getCardTags(card).includes('tournament')) return false;
        else if (filters.expansion === 'COL07' && !getCardTags(card).includes('judge')) return false;
        else if (PACK_ARRAYS[filters.expansion]) {
          if (!PACK_ARRAYS[filters.expansion].includes(card.id)) return false;
        } else {
          let matchesExp = false;
          if (card.expansion === filters.expansion) matchesExp = true;
          if (currentGroups) {
            for (const g of currentGroups) {
              const matchedItem = g.items?.find(i => i.id === filters.expansion);
              if (matchedItem && matchedItem.subItems) {
                if (matchedItem.subItems.some(sub => sub.id === card.expansion)) matchesExp = true;
              }
            }
          }
          if (!matchesExp) return false;
        }
      }
      
      // 2. Check search query
      if (queryActive) {
        let matchesSearch = false;
        if (card.name && card.name.toLowerCase().includes(q)) matchesSearch = true;
        else if (card.cardNumber && card.cardNumber.toLowerCase().includes(q)) matchesSearch = true;
        else if (!hasHyphen && card.name && normalize(card.name).includes(nq)) matchesSearch = true;
        else if (!hasHyphen && card.cardNumber && normalize(card.cardNumber).includes(nq)) matchesSearch = true;
        else if (card.character && card.character.toLowerCase().includes(q)) matchesSearch = true;
        else if (card.specialTrait && card.specialTrait.toLowerCase().includes(q)) matchesSearch = true;
        else if (card.era && card.era.toLowerCase().includes(q)) matchesSearch = true;
        
        if (!matchesSearch) return false;
      }`;

const original = content.substring(content.indexOf('  const availableOptions = useMemo(() => {'), content.indexOf('        if (!matchesSearch) return false;') + 41);
content = content.replace(original, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content);
