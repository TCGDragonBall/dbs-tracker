const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});`;

const replacement = `  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({ [new Date().getFullYear().toString()]: true });
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({ [\`\${new Date().getFullYear()}-\${new Date().getMonth()}\`]: true });`;

content = content.replace(target, replacement);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched expanded states");
