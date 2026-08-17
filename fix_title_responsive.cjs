const fs = require('fs');
const path = 'src/TrackerApp.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace(
  `className="inline-flex items-center gap-1.5 text-xs font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest mb-3"`,
  `className="inline-flex items-center gap-1.5 text-[9px] sm:text-xs font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest mb-3 text-center flex-wrap justify-center"`
);

fs.writeFileSync(path, content, 'utf-8');
console.log("Title subtitle responsive fix applied");
