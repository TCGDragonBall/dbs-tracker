const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const target = `<div className="space-y-3">
                  {filteredMatches.map(match => {
                    const resConf = MATCH_RESULTS.find(r => r.id === match.result);
                    const tType = TOURNEY_TYPES.find(t => t.id === match.tournamentType);
                    const myCard = cards.find(c => c.id === match.leaderId.split('_')[0]);
                    const oppCard = cards.find(c => c.id === match.opponentLeader.split('_')[0]);

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
                          
                          <span className="text-gray-600 font-black italic">VS</span>
                          
                          <div className="flex items-center gap-3 text-right">
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
                </div>`;

const replacement = `<div className="space-y-6">
                  {Object.entries(groupedMatches).sort((a,b) => Number(b[0]) - Number(a[0])).map(([year, months]) => (
                    <div key={year} className="space-y-3">
                      <button 
                        onClick={() => setExpandedYears(prev => ({...prev, [year]: !prev[year]}))}
                        className="w-full flex items-center justify-between bg-white/5 p-4 rounded-2xl font-black text-xl hover:bg-white/10 transition-colors"
                      >
                        <span>{year}</span>
                        <ChevronDown className={\`transition-transform \${expandedYears[year] ? 'rotate-180' : ''}\`} />
                      </button>
                      
                      {expandedYears[year] && (
                        <div className="pl-4 space-y-4 border-l-2 border-white/10 ml-2">
                          {Object.entries(months).sort((a,b) => Number(b[0]) - Number(a[0])).map(([month, monthMatches]) => {
                            const monthKey = \`\${year}-\${month}\`;
                            return (
                              <div key={monthKey} className="space-y-3">
                                <button
                                  onClick={() => setExpandedMonths(prev => ({...prev, [monthKey]: !prev[monthKey]}))}
                                  className="w-full flex items-center justify-between bg-black/40 p-3 rounded-xl font-bold text-gray-300 hover:bg-white/5 transition-colors"
                                >
                                  <span>{monthNames[Number(month)]} <span className="text-gray-500 text-sm font-normal">({monthMatches.length})</span></span>
                                  <ChevronDown size={16} className={\`transition-transform \${expandedMonths[monthKey] ? 'rotate-180' : ''}\`} />
                                </button>
                                
                                {expandedMonths[monthKey] && (
                                  <div className="space-y-3">
                                    {monthMatches.map(match => {
                                      const resConf = MATCH_RESULTS.find(r => r.id === match.result);
                                      const tType = TOURNEY_TYPES.find(t => t.id === match.tournamentType);
                                      const myCard = cards.find(c => c.id === match.leaderId.split('_')[0]);
                                      const oppCard = cards.find(c => c.id === match.opponentLeader.split('_')[0]);

                                      return (
                                        <div key={match.id} className={\`p-4 rounded-2xl border bg-black/40 relative group \${resConf?.color}\`}>
                                          <div className="absolute top-3 right-3 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(match)} className="p-1.5 bg-black/50 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Edit">
                                              <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(match.id)} className="p-1.5 bg-black/50 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                          <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col pr-16">
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
                                            
                                            <span className="text-gray-600 font-black italic">VS</span>
                                            
                                            <div className="flex items-center gap-3 text-right">
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
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched grouping in list view");
