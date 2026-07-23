const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

content = content.replace(
  /onClick=\{\(\) => setSelectedCard\(card\)\}/g,
  "onClick={setSelectedCard}"
);

content = content.replace(
  /onClick\?: \(\) => void;/g,
  "onClick?: (card: Card) => void;"
);

content = content.replace(
  /onClick=\{onClick\}/g,
  "onClick={() => onClick?.(card)}"
);

fs.writeFileSync('src/TrackerApp.tsx', content);
