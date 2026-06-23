const fs = require('fs');
let code = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

code = code.replace(
  'src={profile?.photoURL || user?.photoURL}',
  'src={profile?.photoURL || user?.photoURL || undefined}'
);

fs.writeFileSync('src/TrackerApp.tsx', code);
console.log('Fixed src profile');
