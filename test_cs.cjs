const fs = require('fs');
const content = fs.readFileSync('src/data/parsed_cards.json', 'utf-8');
const cards = JSON.parse(content);
const csCards = cards.filter(c => c.id.includes('_CS'));
console.log(csCards.map(c => c.id).slice(0, 10));
