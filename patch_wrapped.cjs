const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

content = content.replace(
  `{lang === 'es' ? 'Estadísticas / Wrapped' : 'Stats / Wrapped'}`,
  `{lang === 'es' ? 'Estadísticas' : 'Stats'}`
);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched Wrapped text");
