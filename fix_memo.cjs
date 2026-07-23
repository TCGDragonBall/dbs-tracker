const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Change CardItem interface
content = content.replace(
  /onAdd\?: \(e: React\.MouseEvent\) => void;/,
  "onAdd?: (cardId: string, e: React.MouseEvent) => void;"
);

// Change inside CardItem
content = content.replace(
  /<button onClick={onAdd} className="bg-orange-500\/20 hover:bg-orange-500 text-orange-400 hover:text-white p-1\.5 rounded-full transition-colors">/,
  `<button onClick={(e) => onAdd?.(card.id, e)} className="bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white p-1.5 rounded-full transition-colors">`
);

// Fix invocations of CardItem
// Grid items
content = content.replace(
  /onAdd=\{\(e\) => handleAddFromGrid\(e, card\.id\)\}/g,
  "onAdd={handleAddFromGrid}"
);

// Also check globalSearchResults and wantsSearchResults
content = content.replace(
  /onAdd=\{\(e\) => handleAddFromGrid\(e, card\.id\)\}/g,
  "onAdd={handleAddFromGrid}"
);

fs.writeFileSync('src/TrackerApp.tsx', content);
