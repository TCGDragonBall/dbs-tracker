const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `<span className="text-[10px] text-gray-500 font-bold">{leaderCounts[topLeaderId]} {lang === 'es' ? 'partidas jugadas' : 'matches played'}</span>`;
const replacement = `<div className="flex gap-2 items-center text-[10px] font-bold mt-1">
                      <span className="text-gray-500">{leaderCounts[topLeaderId]} {lang === 'es' ? 'partidas' : 'matches'}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-green-400" title={lang === 'es' ? 'Win rate este mes' : 'Win rate this month'}>{topLeaderMonthWinPct}% {lang === 'es' ? 'mes' : 'month'}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-green-500" title={lang === 'es' ? 'Win rate este año' : 'Win rate this year'}>{topLeaderYearWinPct}% {lang === 'es' ? 'año' : 'year'}</span>
                    </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched favorite leader UI");
