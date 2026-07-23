const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const replacement = `      // 2. Check search query (simplified version of the one used in filteredCards)
      if (searchQuery.length >= 2 && searchQuery !== 'Promo Vol.4' && searchQuery !== 'Tournament Pack 2' && searchQuery !== 'Tournament Pack 3' && searchQuery !== 'Tournament Pack 4' && searchQuery !== 'Tournament Pack 5' && searchQuery !== 'Tournament Pack 6' && searchQuery !== 'Store Tournament Vol.1' && searchQuery !== 'Store Tournament Vol.2' && searchQuery !== 'Store Tournament Vol.3' && searchQuery !== 'Store Tournament Vol.4' && searchQuery !== 'Energy Marker Pack 01' && !searchQuery.startsWith('Union Force PR') && !searchQuery.startsWith('Cross Worlds PR') && !searchQuery.startsWith('Colossal Warfare PR') && searchQuery !== 'Puzzle Hunt') {
        const q = searchQuery.toLowerCase();
        const normalize = (str: string) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, '');
        const nq = normalize(searchQuery);
        const hasHyphen = searchQuery.includes('-');
        
        let matchesSearch = false;
        if (card.name && card.name.toLowerCase().includes(q)) matchesSearch = true;
        else if (card.cardNumber && card.cardNumber.toLowerCase().includes(q)) matchesSearch = true;
        else if (!hasHyphen && card.name && normalize(card.name).includes(nq)) matchesSearch = true;
        else if (!hasHyphen && card.cardNumber && normalize(card.cardNumber).includes(nq)) matchesSearch = true;
        else {
          const specialCardInfo = CARD_METADATA[card.id];
          const sourceProduct = specialCardInfo?.sourceProduct || card.sourceProduct || '';
          const setMeta = SET_METADATA[card.expansion];
          const setName = setMeta?.sourceProduct || '';
          if (sourceProduct && sourceProduct.toLowerCase().includes(q)) matchesSearch = true;
          else if (setName && setName.toLowerCase().includes(q)) matchesSearch = true;
          else if (card.character && card.character.toLowerCase().includes(q)) matchesSearch = true;
          else if (card.specialTrait && card.specialTrait.toLowerCase().includes(q)) matchesSearch = true;
          else if (card.era && card.era.toLowerCase().includes(q)) matchesSearch = true;
          else if (card.traits && card.traits.toLowerCase().includes(q)) matchesSearch = true;
          else if (card.skill && card.skill.toLowerCase().includes(q)) matchesSearch = true;
        }
        if (!matchesSearch) return false;
      }`;

const original = content.substring(content.indexOf('      // 2. Check search query'), content.indexOf('        if (!matchesSearch) return false;') + 41);
if (original && original.includes('// 2. Check search query')) {
  content = content.replace(original, replacement);
  fs.writeFileSync('src/TrackerApp.tsx', content);
} else {
  console.log("Could not find block to replace.");
}
