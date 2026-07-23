const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const replacement = `  const wantsSearchResults = useMemo(() => {
    const trimmedQuery = wantsSearchQuery.trim();
    const queryActive = trimmedQuery.length > 0;
    const filterExpansionActive = wantsFilterExpansion !== 'Todos';
    const filterColorActive = wantsFilterColor !== 'Todos';
    const filterRarityActive = wantsFilterRarity !== 'Todos';

    const q = trimmedQuery.toLowerCase();
    const normalize = (str: string) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    const nq = normalize(trimmedQuery);

    return cards.filter(card => {
      if (queryActive) {
        const cardNameMatches = card.name && (card.name.toLowerCase().includes(q) || normalize(card.name).includes(nq));
        const cardNumberMatches = card.cardNumber && (card.cardNumber.toLowerCase().includes(q) || normalize(card.cardNumber).includes(nq));
        const cardIdMatches = card.id && card.id.toLowerCase().includes(q);

        if (!cardNameMatches && !cardNumberMatches && !cardIdMatches) {
          return false;
        }
      }`;

const original = content.substring(content.indexOf('  const wantsSearchResults = useMemo(() => {'), content.indexOf('        if (!cardNameMatches && !cardNumberMatches && !cardIdMatches) {') + 71);
content = content.replace(original, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content);
