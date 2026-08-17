const fs = require('fs');
const path = 'src/TrackerApp.tsx';
let content = fs.readFileSync(path, 'utf-8');

// 1. Fix header buttons
content = content.replace(
  `              <Globe size={13} className="text-orange-500 animate-pulse" />
              {lang === 'es' ? 'English' : 'Español'}`,
  `              <Globe size={13} className="text-orange-500 animate-pulse" />
              <span className="hidden sm:inline">{lang === 'es' ? 'English' : 'Español'}</span>`
);

content = content.replace(
  `            <button
              onClick={() => {
                const targetLang = lang === 'es' ? 'en' : 'es';
                setLang(targetLang);
                safeStorage.setItem('lang', targetLang);
              }}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 active:scale-95 text-xs text-white/90 px-3 py-1.5 rounded-xl border border-white/10 transition-all font-black uppercase tracking-wider"
            >`,
  `            <button
              onClick={() => {
                const targetLang = lang === 'es' ? 'en' : 'es';
                setLang(targetLang);
                safeStorage.setItem('lang', targetLang);
              }}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 active:scale-95 text-xs text-white/90 px-2 sm:px-3 py-1.5 rounded-xl border border-white/10 transition-all font-black uppercase tracking-wider"
            >`
);

content = content.replace(
  `              <User size={13} />
              {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}`,
  `              <User size={13} />
              <span className="hidden sm:inline">{lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}</span>`
);

content = content.replace(
  `            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-xs text-white px-3.5 py-1.5 rounded-xl border border-orange-500/50 transition-all font-black uppercase tracking-wider shadow-md shadow-orange-950/40"
            >`,
  `            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-xs text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-orange-500/50 transition-all font-black uppercase tracking-wider shadow-md shadow-orange-950/40"
            >`
);

// 2. Fix bento box headers
content = content.replace(
  /<div className="flex items-center justify-between mb-2">/g,
  '<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2">'
);

// 3. Fix list switchers
content = content.replace(
  /<div className="flex gap-2 bg-black\/60 p-1 rounded-xl self-start">/g,
  '<div className="flex flex-wrap gap-2 bg-black/60 p-1 rounded-xl self-start">'
);

// 4. Fix radial progress in stats
content = content.replace(
  /<div className="grid grid-cols-2 gap-4 py-2 flex-1 items-center">/g,
  '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 flex-1 items-center">'
);

fs.writeFileSync(path, content, 'utf-8');
console.log("Responsive fixes applied");
