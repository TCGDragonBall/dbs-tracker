const fs = require('fs');

let content = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');

// 1. Fix SL_MALICIOUS_MACHINATIONS
// Remove the menu item for SL_MALICIOUS_MACHINATIONS
content = content.replace(/,\s*\{ id: 'SL_MALICIOUS_MACHINATIONS', label: 'Malicious Machinations', sub: 'Eventos' \}/g, '');
// Move SL-MM-01 to COL11 and remove SL_MALICIOUS_MACHINATIONS from PACK_ARRAYS
content = content.replace(/'COL11': \['SL-M01', 'SL-OR2019'\],/, "'COL11': ['SL-M01', 'SL-OR2019', 'SL-MM-01'],");
content = content.replace(/,\s*'SL_MALICIOUS_MACHINATIONS'/g, '');
content = content.replace(/\n\s*'SL_MALICIOUS_MACHINATIONS': \['SL-MM-01'\],/g, '');

// 2. Fix Giant Sizes logic
// Update cardTagsCheck
content = content.replace(
  /if \(targetSetId === 'COL02'\) return tags\.includes\('giant'\);/g,
  "if (targetSetId === 'COL02') return tags.includes('giant') || (PACK_ARRAYS['COL02'] && PACK_ARRAYS['COL02'].includes(c.id));"
);

// Update displayedCards expansion check
content = content.replace(
  /if \(filters\.expansion === 'COL02'\) matchesExpansion = isGiant;/g,
  "if (filters.expansion === 'COL02') matchesExpansion = isGiant || !!(PACK_ARRAYS['COL02'] && PACK_ARRAYS['COL02'].includes(card.id));"
);

// Add COL02 array if it doesn't exist, with the base IDs of all Giant Sizes!
const col02BaseIds = [
  'TB3-034', 'TB3-001', 'TB2-065', 'TB2-001', 'SD8-01', 'SD7-01', 'SD6-01', 'P-071', 'EX3-19', 'EX3-13', 'EX3-07', 'BT6-080', 'BT6-002', 'BT6-001', 'BT5-054', 'BT5-027'
];
if (!content.includes("'COL02': [")) {
  content = content.replace(
    /'COL01': \[([^\]]+)\],/,
    `$& \n  'COL02': ${JSON.stringify(col02BaseIds)},`
  );
} else {
  // Replace existing COL02 array
  content = content.replace(
    /'COL02': \[[^\]]*\],/,
    `'COL02': ${JSON.stringify(col02BaseIds)},`
  );
}

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf-8');
console.log('Fixed stuff');
