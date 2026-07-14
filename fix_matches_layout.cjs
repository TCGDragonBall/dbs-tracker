const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// 1. Fix MATCH_COLORS
const oldColors = /const MATCH_COLORS = \[\s*\{ id: 'Red'[\s\S]*?\];/;
const newColors = `const MATCH_COLORS = [
  { id: 'Red', name: { es: 'Rojo', en: 'Red' }, bg: 'bg-red-500' },
  { id: 'Blue', name: { es: 'Azul', en: 'Blue' }, bg: 'bg-blue-500' },
  { id: 'Green', name: { es: 'Verde', en: 'Green' }, bg: 'bg-green-500' },
  { id: 'Yellow', name: { es: 'Amarillo', en: 'Yellow' }, bg: 'bg-yellow-500' },
  { id: 'Black', name: { es: 'Negro', en: 'Black' }, bg: 'bg-gray-800' },
  { id: 'White', name: { es: 'Blanco', en: 'White' }, bg: 'bg-white text-black' },
  { id: 'Multi', name: { es: 'Multicolor', en: 'Multi' }, bg: 'bg-gradient-to-r from-red-500 via-blue-500 to-green-500' }
];`;
content = content.replace(oldColors, newColors);

// 2. Fix availableLeaders
const oldAvailableLeaders = /const availableLeaders = useMemo\(\(\) => \{[\s\S]*?return list;\n  \}, \[cards, leaderSearch, leaderColorFilter\]\);/;
const newAvailableLeaders = `const availableLeaders = useMemo(() => {
    let list = cards.filter(c => c.type === 'Leader' && !c.id.includes('_'));
    if (leaderSearch) {
      const s = leaderSearch.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(s) || c.cardNumber.toLowerCase().includes(s));
    }
    if (leaderColorFilter) {
      if (leaderColorFilter === 'Multi') {
        list = list.filter(c => c.color.includes('/') || c.color.includes('-'));
      } else {
        list = list.filter(c => c.color.includes(leaderColorFilter));
      }
    }
    return list;
  }, [cards, leaderSearch, leaderColorFilter]);`;
content = content.replace(oldAvailableLeaders, newAvailableLeaders);

// 3. Fix list layout
const oldListLayout = `<div className="flex items-center justify-center gap-4">
                          <div className="flex flex-col items-center">
                            {myCard ? (
                              <img src={myCard.imageUrl} alt={myCard.name} className="w-16 rounded shadow-md object-cover object-top aspect-[3/4]" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-16 aspect-[3/4] bg-white/5 rounded" />
                            )}
                          </div>
                          
                          <div className="text-gray-500 font-black italic text-xl">VS</div>

                          <div className="flex flex-col items-center">
                            {oppCard ? (
                              <img src={oppCard.imageUrl} alt={oppCard.name} className="w-16 rounded shadow-md object-cover object-top aspect-[3/4]" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-16 aspect-[3/4] bg-white/5 rounded" />
                            )}
                          </div>
                        </div>`;

const newListLayout = `<div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            {myCard ? (
                              <img src={myCard.imageUrl} alt={myCard.name} className="w-12 rounded object-cover object-top aspect-[3/4] border border-white/10" referrerPolicy="no-referrer" />
                            ) : <div className="w-12 aspect-[3/4] bg-white/5 rounded border border-white/10" />}
                            <div className="flex flex-col">
                              <span className="text-[10px] text-orange-500 font-black uppercase">{lang === 'es' ? 'Tú' : 'You'}</span>
                              <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-[140px] text-white">{myCard?.name || match.leaderId}</span>
                            </div>
                          </div>
                          
                          <span className="text-gray-600 font-black italic">VS</span>

                          <div className="flex items-center gap-3 text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-blue-500 font-black uppercase">{lang === 'es' ? 'Rival' : 'Opponent'}</span>
                              <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-[140px] text-white">{oppCard?.name || match.opponentLeader}</span>
                            </div>
                            {oppCard ? (
                              <img src={oppCard.imageUrl} alt={oppCard.name} className="w-12 rounded object-cover object-top aspect-[3/4] border border-white/10" referrerPolicy="no-referrer" />
                            ) : <div className="w-12 aspect-[3/4] bg-white/5 rounded border border-white/10" />}
                          </div>
                        </div>`;
content = content.replace(oldListLayout, newListLayout);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched all fixes");
