const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const regex = /const normalize = \(str: string\) => str\.toLowerCase\(\)\.replace\(\/\[\^a-z0-9\]\/g, ''\);\s*const normalizedQuery = normalize\(searchQuery\);/g;

content = content.replace(regex, '');

content = content.replace(
  /const isPuzzleHuntFilter = searchQuery\.toLowerCase\(\) === 'anime expo 2017' \|\| searchQuery\.toLowerCase\(\) === 'puzzle hunt';/,
  `const isPuzzleHuntFilter = searchQuery.toLowerCase() === 'anime expo 2017' || searchQuery.toLowerCase() === 'puzzle hunt';
    const normalize = (str: string) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedQuery = normalize(searchQuery);`
);

fs.writeFileSync('src/TrackerApp.tsx', content);
