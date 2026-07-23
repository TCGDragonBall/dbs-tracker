const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `        if (!cardNameMatches && !cardNumberMatches && !cardIdMatches) {
          return false;
        }
      }
          return false;
        }
      }

      if (filterExpansionActive) {`;

const replacement = `        if (!cardNameMatches && !cardNumberMatches && !cardIdMatches) {
          return false;
        }
      }

      if (filterExpansionActive) {`;

content = content.replace(target, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content);
