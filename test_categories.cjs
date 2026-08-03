const fs = require('fs');

const trackerCode = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const regex = /const cachedCategoryCards = React\.useMemo\(\(\) => \{[\s\S]*?return result;[\s\S]*?\},/g;
const match = trackerCode.match(regex);
if (match) {
  console.log(match[0].substring(0, 1000));
}
