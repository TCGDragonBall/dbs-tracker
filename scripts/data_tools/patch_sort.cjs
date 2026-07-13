const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `      // Compare bases numerically
      return aBase.localeCompare(bBase, undefined, { numeric: true });`;

const replacement = `      // Compare bases numerically
      if (filters.expansion === 'ENM' || filters.expansion === 'ENM_FW') {
        const aIsBT31 = aBase.startsWith('BT31-EM');
        const bIsBT31 = bBase.startsWith('BT31-EM');
        if (aIsBT31 && !bIsBT31) return 1;
        if (!aIsBT31 && bIsBT31) return -1;
      }
      return aBase.localeCompare(bBase, undefined, { numeric: true });`;

content = content.replace(target, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched correctly");
