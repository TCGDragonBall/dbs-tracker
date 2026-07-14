const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `<div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <button 
                onClick={() => setIsAdding(true)}`;

const replacement = `<div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              {topLeaderCard && (
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 shadow-md">
                  <div className="relative">
                    <img src={topLeaderCard.imageUrl} alt={topLeaderCard.name} className="w-14 h-14 object-cover object-top rounded-full ring-2 ring-orange-500 shadow-lg shadow-orange-500/20" referrerPolicy="no-referrer" />
                    <div className="absolute -bottom-1 -right-1 bg-orange-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-md">MVP</div>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest">{lang === 'es' ? 'Líder Favorito' : 'Favorite Leader'}</span>
                    <span className="text-white font-bold text-sm truncate">{topLeaderCard.name}</span>
                    <span className="text-[10px] text-gray-500 font-bold">{leaderCounts[topLeaderId]} {lang === 'es' ? 'partidas jugadas' : 'matches played'}</span>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setIsAdding(true)}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched favorite leader");
