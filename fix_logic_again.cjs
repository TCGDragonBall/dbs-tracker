const fs = require('fs');
let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const extraSetCards = `const EXTRA_SET_CARDS: Record<string, string[]> = {
  'EXP7': ['BT1-052_PR03', 'BT1-055_PR02', 'BT6-007_PR', 'BT6-029_PR'],
  'EXP8': ['BT1-053_PR02', 'BT1-110_PR03']
};
`;

if (!data.includes('const EXTRA_SET_CARDS')) {
    data = data.replace('const PACK_ARRAYS: Record<string, string[]> = {', extraSetCards + '\nconst PACK_ARRAYS: Record<string, string[]> = {');
}

// Ensure proper syntax since there was a paste error earlier
data = data.replaceAll("if (c.expansion === targetSetId) return true;\n          if (typeof EXTRA_SET_CARDS !== 'undefined' && EXTRA_SET_CARDS[targetSetId] && EXTRA_SET_CARDS[targetSetId].includes(c.id)) return true;\n          if (EXTRA_SET_CARDS[targetSetId] && EXTRA_SET_CARDS[targetSetId].includes(c.id)) return true;", "if (c.expansion === targetSetId) return true;\n          if (typeof EXTRA_SET_CARDS !== 'undefined' && EXTRA_SET_CARDS[targetSetId] && EXTRA_SET_CARDS[targetSetId].includes(c.id)) return true;");

fs.writeFileSync('src/TrackerApp.tsx', data);
