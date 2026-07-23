const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `        if (!matchesSearch) return false;
      }
      }
      }
      return true;
    });`;

const replacement = `        if (!matchesSearch) return false;
      }
      return true;
    });`;

content = content.replace(target, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content);
