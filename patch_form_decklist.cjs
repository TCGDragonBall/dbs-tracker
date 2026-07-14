const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const targetForm = `                {/* Opponent Leader */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-blue-500">{lang === 'es' ? 'Rival' : 'Opponent'}</span>
                  <button 
                    type="button" 
                    onClick={() => { setLeaderSearch(''); setLeaderColorFilter(''); setLeaderModal('opp'); }}
                    className="w-24 aspect-[2/3] rounded-xl border-2 border-dashed border-white/20 bg-black/40 hover:border-blue-500 transition-colors flex flex-col items-center justify-center overflow-hidden"
                  >
                    {formData.opponentLeader ? (
                      <img src={cards.find(c => c.id === formData.opponentLeader)?.imageUrl} alt="Opponent Leader" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Plus size={24} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>`;

const replacementForm = `                {/* Opponent Leader */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-blue-500">{lang === 'es' ? 'Rival' : 'Opponent'}</span>
                  <button 
                    type="button" 
                    onClick={() => { setLeaderSearch(''); setLeaderColorFilter(''); setLeaderModal('opp'); }}
                    className="w-24 aspect-[2/3] rounded-xl border-2 border-dashed border-white/20 bg-black/40 hover:border-blue-500 transition-colors flex flex-col items-center justify-center overflow-hidden"
                  >
                    {formData.opponentLeader ? (
                      <img src={cards.find(c => c.id === formData.opponentLeader)?.imageUrl} alt="Opponent Leader" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Plus size={24} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex w-full gap-4 mt-2">
                <div className="flex-1">
                  <input
                    type="url"
                    placeholder="URL Decklist"
                    value={formData.myDecklist || ''}
                    onChange={e => setFormData({...formData, myDecklist: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-orange-500 outline-none placeholder:text-gray-600"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    placeholder="URL Decklist"
                    value={formData.oppDecklist || ''}
                    onChange={e => setFormData({...formData, oppDecklist: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-blue-500 outline-none placeholder:text-gray-600"
                  />
                </div>
              </div>
            </div>`;

content = content.replace(targetForm, replacementForm);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched form with decklist inputs");
