const React = require('react');
const fs = require('fs');

let trackerCode = fs.readFileSync('src/TrackerApp.tsx', 'utf8');
const searchFunction = trackerCode.match(/const filteredCards = React\.useMemo\(\(\) => \{[\s\S]*?return result;[\s\S]*?\},/);
if (searchFunction) {
  console.log(searchFunction[0].substring(0, 2000));
} else {
  console.log("Not found");
}
