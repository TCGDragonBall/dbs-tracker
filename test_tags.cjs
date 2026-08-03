const fs = require('fs');
let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const getCardTagsMatch = app.match(/const getCardTags \= \((.*?)\) \=\> \{([\s\S]*?)return tags;\n\}/);
if (getCardTagsMatch) {
  console.log(getCardTagsMatch[0]);
} else {
  console.log("Not found");
}
