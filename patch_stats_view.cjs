const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const statsGridEnd = `                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center flex flex-col items-center">
                  <span className="block text-[10px] text-gray-500 font-bold uppercase mb-2">{lang === 'es' ? 'Más enfrentado' : 'Most faced'}</span>
                  {topOpponentCard ? (
                    <>
                      <img src={topOpponentCard.imageUrl} alt={topOpponentCard.name} className="w-20 rounded shadow-md mb-2 object-cover object-top aspect-[2/3]" referrerPolicy="no-referrer" />
                      <span className="font-bold text-white text-xs truncate w-full">{topOpponentCard.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
              </div>`;

const newStatsContent = `              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center flex flex-col items-center mt-4">
                <span className="block text-[10px] text-gray-500 font-bold uppercase mb-2">{lang === 'es' ? 'Torneo más jugado' : 'Most played tournament'}</span>
                <span className="font-bold text-white text-lg">{topTourneyType ? topTourneyType.name[lang] : '-'}</span>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{lang === 'es' ? 'Últimos Resultados' : 'Latest Results'}</h3>
                <div className="space-y-3">
                  {filteredMatches.slice(0, 5).map(match => {
                    const resConf = MATCH_RESULTS.find(r => r.id === match.result);
                    const tType = TOURNEY_TYPES.find(t => t.id === match.tournamentType);
                    const myCard = cards.find(c => c.id === match.leaderId);
                    const oppCard = cards.find(c => c.id === match.opponentLeader);
                    return (
                      <div key={match.id} className={\`p-4 rounded-2xl border bg-black/40 \${resConf?.color}\`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <span className="font-black uppercase text-sm">{resConf?.name[lang]}</span>
                            <span className="text-[10px] opacity-70">{new Date(match.date).toLocaleDateString()} • {tType?.name[lang]}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            {myCard ? (
                              <img src={myCard.imageUrl} alt={myCard.name} className="w-12 rounded object-cover object-top aspect-[2/3] border border-white/10" referrerPolicy="no-referrer" />
                            ) : <div className="w-12 aspect-[2/3] bg-white/5 rounded border border-white/10" />}
                            <div className="flex flex-col">
                              <span className="text-[10px] text-orange-500 font-black uppercase">{lang === 'es' ? 'Tú' : 'You'}</span>
                              <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-[140px] text-white">{myCard?.name || match.leaderId}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-blue-500 font-black uppercase">{lang === 'es' ? 'Rival' : 'Opponent'}</span>
                              <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-[140px] text-white">{oppCard?.name || match.opponentLeader}</span>
                            </div>
                            {oppCard ? (
                              <img src={oppCard.imageUrl} alt={oppCard.name} className="w-12 rounded object-cover object-top aspect-[2/3] border border-white/10" referrerPolicy="no-referrer" />
                            ) : <div className="w-12 aspect-[2/3] bg-white/5 rounded border border-white/10" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>`;

content = content.replace(statsGridEnd, statsGridEnd + newStatsContent);
fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched stats view to include latest results and tournament type");
