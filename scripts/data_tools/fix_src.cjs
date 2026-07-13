const fs = require('fs');
let code = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const patterns = [
  'src={bgImage}',
  'src={subBgImage}',
  'src={card.imageUrl}',
  'src={card.img}',
  'src={selectedCard.imageUrl}',
  'src={selectedCard.backImageUrl}'
];

for(let pattern of patterns) {
  const replacement = pattern.replace('}', ' || undefined}');
  code = code.split(pattern).join(replacement);
}

fs.writeFileSync('src/TrackerApp.tsx', code);
console.log('Fixed src attributes');
