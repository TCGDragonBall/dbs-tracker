const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const replacement = `  const filteredCards = useMemo(() => {
    const isSecretFilter = searchQuery.toLowerCase() === 'faltantes';
    const isDeluxeFilter = searchQuery.toLowerCase() === 'deluxe pack 2024 vol.1';
    const isUnionForceFilter = searchQuery.toLowerCase() === 'union force release tournament';
    const isCrossWorldsFilter = searchQuery.toLowerCase() === 'cross worlds release tournament';
    const isColossalWarfareFilter = searchQuery.toLowerCase() === 'colossal warfare release tournament';
    const isPuzzleHuntFilter = searchQuery.toLowerCase() === 'anime expo 2017' || searchQuery.toLowerCase() === 'puzzle hunt';
    const normalize = (str: string) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    const q = searchQuery.toLowerCase();
    const nq = normalize(searchQuery);
    const hasHyphen = searchQuery.includes('-');
    const queryActive = q.length >= 2 && !isSecretFilter;

    // Build expansion label map
    const expansionLabels = new Map<string, string>();
    if (queryActive && currentGroups) {
      const traverse = (items: any[]) => {
        if (!items) return;
        for (const item of items) {
          const label = typeof item.label === 'string' ? item.label : (item?.label?.[lang] || '');
          expansionLabels.set(item.id, label.toLowerCase());
          if (item.subItems) traverse(item.subItems);
        }
      };
      for (const group of currentGroups) {
        if (group.items) traverse(group.items);
      }
    }

    return cards.filter(card => {
    // Hide P-005_PR by default (unless puzzle hunt searched or owned)
    if (card.id === 'P-005_PR') {
      const isOwned = (exactInventoryMap?.get('P-005_PR') || 0) > 0;
      if (!isPuzzleHuntFilter && !isOwned) return false;
    }

    if (isDeluxeFilter) {
      return card.id === 'P-593_PR' || card.id === 'P-597_PR';
    }
    if (isUnionForceFilter) {
      return ['BT1-010_PR', 'BT1-045_PR', 'BT1-069_PR', 'BT1-100_PR'].includes(card.id);
    }
    if (isCrossWorldsFilter) {
      return ['BT2-005_PR', 'BT2-045_PR', 'BT2-073_PR', 'BT2-106_PR'].includes(card.id);
    }
    if (isColossalWarfareFilter) {
      return ['BT4-013_PR', 'BT4-046_PR', 'BT4-076_PR', 'BT4-098_PR'].includes(card.id);
    }

    const specialCardInfo = CARD_METADATA[card.id];
    const sourceProduct = specialCardInfo?.sourceProduct || card.sourceProduct || '';
    const setMeta = SET_METADATA[card.expansion];
    const setName = setMeta?.sourceProduct || '';

    const matchesSearch = (() => {
      if (isSecretFilter) return true;
      if (!queryActive) return true;
      
      // Basic fields
      if (card.name && card.name.toLowerCase().includes(q)) return true;
      if (card.cardNumber && card.cardNumber.toLowerCase().includes(q)) return true;
      if (card.id && card.id.toLowerCase().includes(q)) return true;
      
      // Normalized matching
      if (!hasHyphen) {
        if (card.name && normalize(card.name).includes(nq)) return true;
        if (card.cardNumber && normalize(card.cardNumber).includes(nq)) return true;
      }
      
      // Search by source product / pack name
      if (sourceProduct && sourceProduct.toLowerCase().includes(q)) return true;
      if (setName && setName.toLowerCase().includes(q)) return true;
      if (!hasHyphen) {
        if (sourceProduct && normalize(sourceProduct).includes(nq)) return true;
        if (setName && normalize(setName).includes(nq)) return true;
      }
      
      // Deep fields
      if (card.character && card.character.toLowerCase().includes(q)) return true;
      if (card.specialTrait && card.specialTrait.toLowerCase().includes(q)) return true;
      if (card.era && card.era.toLowerCase().includes(q)) return true;
      if (card.traits && card.traits.toLowerCase().includes(q)) return true;
      if (card.skill && card.skill.toLowerCase().includes(q)) return true;
      
      // Search by expansion label
      const expLabel = expansionLabels.get(card.expansion);
      if (expLabel && expLabel.includes(q)) return true;
      
      return false;
    })();`;

const original = content.substring(content.indexOf('  const filteredCards = useMemo(() => {'), content.indexOf('    // If secret filter is active, only show cards not in inventory'));
content = content.replace(original, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content);
