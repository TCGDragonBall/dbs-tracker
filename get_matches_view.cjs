const fs = require('fs');
const content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');
const match = content.match(/const MatchesView = \(\{[\s\S]*?export default function TrackerApp\(\) \{/);
if (match) {
  console.log(match[0]);
}
