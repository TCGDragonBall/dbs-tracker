const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const targetList = `                                              <div className="flex flex-col">
                                                <span className="text-[10px] text-orange-500 font-black uppercase">{lang === 'es' ? 'Tú' : 'You'}</span>
                                                <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-[140px] text-white">{myCard?.name || match.leaderId}</span>
                                              </div>
                                            </div>
                                            
                                            <span className="text-gray-600 font-black italic">VS</span>
                                            
                                            <div className="flex items-center gap-3 text-right">
                                              <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-blue-500 font-black uppercase">{lang === 'es' ? 'Rival' : 'Opponent'}</span>
                                                <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-[140px] text-white">{oppCard?.name || match.opponentLeader}</span>
                                              </div>`;

const replacementList = `                                              <div className="flex flex-col">
                                                <span className="text-[10px] text-orange-500 font-black uppercase">{lang === 'es' ? 'Tú' : 'You'}</span>
                                                <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-[140px] text-white mb-1">{myCard?.name || match.leaderId}</span>
                                                {match.myDecklist && (
                                                  <a href={match.myDecklist} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-gray-400 hover:text-orange-400 transition-colors bg-white/5 px-2 py-1 rounded-md w-max">
                                                    <ExternalLink size={10} />
                                                    {lang === 'es' ? 'Ver Lista' : 'View List'}
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                            
                                            <span className="text-gray-600 font-black italic">VS</span>
                                            
                                            <div className="flex items-center gap-3 text-right">
                                              <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-blue-500 font-black uppercase">{lang === 'es' ? 'Rival' : 'Opponent'}</span>
                                                <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-[140px] text-white mb-1">{oppCard?.name || match.opponentLeader}</span>
                                                {match.oppDecklist && (
                                                  <a href={match.oppDecklist} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-400 transition-colors bg-white/5 px-2 py-1 rounded-md w-max">
                                                    {lang === 'es' ? 'Ver Lista' : 'View List'}
                                                    <ExternalLink size={10} />
                                                  </a>
                                                )}
                                              </div>`;

content = content.replace(targetList, replacementList);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched list view with decklist links");
