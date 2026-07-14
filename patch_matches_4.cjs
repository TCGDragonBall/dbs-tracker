const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const matchesViewRegex = /const MatchesView = \(\{[\s\S]*?export default function TrackerApp\(\) \{/;

const newMatchesView = `const MATCH_COLORS = [
  { id: 'Red', name: { es: 'Rojo', en: 'Red' }, bg: 'bg-red-500' },
  { id: 'Blue', name: { es: 'Azul', en: 'Blue' }, bg: 'bg-blue-500' },
  { id: 'Green', name: { es: 'Verde', en: 'Green' }, bg: 'bg-green-500' },
  { id: 'Yellow', name: { es: 'Amarillo', en: 'Yellow' }, bg: 'bg-yellow-500' },
  { id: 'Black', name: { es: 'Negro', en: 'Black' }, bg: 'bg-gray-800' }
];

const TOURNEY_TYPES = [
  { id: 'local', name: { es: 'Local', en: 'Local' } },
  { id: 'regional', name: { es: 'Regional', en: 'Regional' } },
  { id: 'online', name: { es: 'Online', en: 'Online' } },
  { id: 'finals', name: { es: 'Finales', en: 'Finals' } },
  { id: 'test', name: { es: 'Test/Amistoso', en: 'Test/Friendly' } }
];

const MATCH_RESULTS = [
  { id: 'win', name: { es: 'Victoria', en: 'Win' }, color: 'text-green-500 bg-green-500/10 border-green-500/20' },
  { id: 'loss', name: { es: 'Derrota', en: 'Loss' }, color: 'text-red-500 bg-red-500/10 border-red-500/20' }
];

const MatchesView = ({ matches, onBack, lang, userUid, gameType, cards }: { matches: MatchRecord[], onBack: () => void, lang: 'es' | 'en', userUid: string, gameType: 'masters' | 'fusion', cards: Card[] }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');
  const [leaderModal, setLeaderModal] = useState<'my' | 'opp' | null>(null);
  const [leaderSearch, setLeaderSearch] = useState('');
  const [leaderColorFilter, setLeaderColorFilter] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    leaderId: '',
    opponentLeader: '',
    tournamentType: 'local',
    result: 'win' as 'win'|'loss',
    notes: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userUid || !formData.leaderId || !formData.opponentLeader) return;
    setIsSaving(true);
    
    const myLeaderCard = cards.find(c => c.id === formData.leaderId);
    const oppLeaderCard = cards.find(c => c.id === formData.opponentLeader);

    try {
      await addDoc(collection(db, 'matches'), {
        ownerId: userUid,
        gameType,
        date: formData.date,
        leaderId: formData.leaderId,
        leaderColor: myLeaderCard?.color || 'Red',
        opponentLeader: formData.opponentLeader,
        opponentColor: oppLeaderCard?.color || 'Red',
        tournamentType: formData.tournamentType,
        result: formData.result,
        notes: formData.notes,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        leaderId: '',
        opponentLeader: '',
        tournamentType: 'local',
        result: 'win',
        notes: ''
      });
    } catch (error) {
      console.error(error);
    }
    setIsSaving(false);
  };

  const filteredMatches = matches.filter(m => m.gameType === gameType);

  // Stats
  const totalMatches = filteredMatches.length;
  const wins = filteredMatches.filter(m => m.result === 'win').length;
  const losses = filteredMatches.filter(m => m.result === 'loss').length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const leaderCounts = filteredMatches.reduce((acc, m) => {
    acc[m.leaderId] = (acc[m.leaderId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topLeaderId = Object.entries(leaderCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topLeaderCard = cards.find(c => c.id === topLeaderId);

  const oppCounts = filteredMatches.reduce((acc, m) => {
    acc[m.opponentLeader] = (acc[m.opponentLeader] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topOpponentId = Object.entries(oppCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topOpponentCard = cards.find(c => c.id === topOpponentId);

  const availableLeaders = useMemo(() => {
    let list = cards.filter(c => c.type === 'Leader');
    if (leaderSearch) {
      const s = leaderSearch.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(s) || c.cardNumber.toLowerCase().includes(s));
    }
    if (leaderColorFilter) {
      list = list.filter(c => c.color.includes(leaderColorFilter));
    }
    return list;
  }, [cards, leaderSearch, leaderColorFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            {lang === 'es' ? 'Tracker de Partidas' : 'Match Tracker'}
          </h2>
        </div>
      </div>

      {!isAdding ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('list')}
              className={\`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all \${viewMode === 'list' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'}\`}
            >
              {lang === 'es' ? 'Historial' : 'History'}
            </button>
            <button 
              onClick={() => setViewMode('stats')}
              className={\`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all \${viewMode === 'stats' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-500 hover:bg-white/10'}\`}
            >
              {lang === 'es' ? 'Estadísticas / Wrapped' : 'Stats / Wrapped'}
            </button>
          </div>

          {viewMode === 'stats' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <span className="block text-[10px] text-gray-500 font-bold uppercase mb-1">{lang === 'es' ? 'Total Partidas' : 'Total Matches'}</span>
                  <span className="text-4xl font-black text-white">{totalMatches}</span>
                </div>
                <div className="p-5 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-center">
                  <span className="block text-[10px] text-orange-500 font-bold uppercase mb-1">Win Rate</span>
                  <span className="text-4xl font-black text-orange-500">{winRate}%</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 p-4 bg-green-500/10 rounded-xl border border-green-500/20 text-center">
                  <span className="block text-xs font-black text-green-500">{wins} {lang === 'es' ? 'Victorias' : 'Wins'}</span>
                </div>
                <div className="flex-1 p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-center">
                  <span className="block text-xs font-black text-red-500">{losses} {lang === 'es' ? 'Derrotas' : 'Losses'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center flex flex-col items-center">
                  <span className="block text-[10px] text-gray-500 font-bold uppercase mb-2">{lang === 'es' ? 'Líder más jugado' : 'Most played leader'}</span>
                  {topLeaderCard ? (
                    <>
                      <img src={topLeaderCard.imageUrl} alt={topLeaderCard.name} className="w-20 rounded shadow-md mb-2 object-cover object-top aspect-[3/4]" referrerPolicy="no-referrer" />
                      <span className="font-bold text-white text-xs truncate w-full">{topLeaderCard.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
                
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center flex flex-col items-center">
                  <span className="block text-[10px] text-gray-500 font-bold uppercase mb-2">{lang === 'es' ? 'Más enfrentado' : 'Most faced'}</span>
                  {topOpponentCard ? (
                    <>
                      <img src={topOpponentCard.imageUrl} alt={topOpponentCard.name} className="w-20 rounded shadow-md mb-2 object-cover object-top aspect-[3/4]" referrerPolicy="no-referrer" />
                      <span className="font-bold text-white text-xs truncate w-full">{topOpponentCard.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full py-4 bg-orange-500 text-black font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                {lang === 'es' ? 'Registrar Partida' : 'Log Match'}
              </button>

              {filteredMatches.length === 0 ? (
                <div className="p-8 bg-white/5 rounded-2xl text-center border border-white/5">
                  <Sword size={32} className="mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">
                    {lang === 'es' ? 'No hay partidas registradas en este modo.' : 'No matches logged in this mode.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMatches.map(match => {
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
                        
                        <div className="flex items-center justify-center gap-4">
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 bg-white/5 p-5 rounded-3xl border border-white/5 animate-in fade-in slide-in-from-bottom-4 relative">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-black text-white">{lang === 'es' ? 'Nueva Partida' : 'New Match'}</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'es' ? 'Fecha' : 'Date'}</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none"
              />
            </div>

            <div className="flex flex-col items-center gap-4">
              <label className="text-[10px] font-bold text-gray-500 uppercase w-full">{lang === 'es' ? 'Líderes' : 'Leaders'}</label>
              <div className="flex w-full items-center justify-center gap-4">
                {/* My Leader */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-orange-500">{lang === 'es' ? 'Tú' : 'You'}</span>
                  <button 
                    type="button" 
                    onClick={() => { setLeaderSearch(''); setLeaderColorFilter(''); setLeaderModal('my'); }}
                    className="w-24 aspect-[3/4] rounded-xl border-2 border-dashed border-white/20 bg-black/40 hover:border-orange-500 transition-colors flex flex-col items-center justify-center overflow-hidden"
                  >
                    {formData.leaderId ? (
                      <img src={cards.find(c => c.id === formData.leaderId)?.imageUrl} alt="My Leader" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Plus size={24} className="text-gray-500" />
                    )}
                  </button>
                </div>

                <div className="text-gray-600 font-black text-2xl italic">VS</div>

                {/* Opponent Leader */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-blue-500">{lang === 'es' ? 'Rival' : 'Opponent'}</span>
                  <button 
                    type="button" 
                    onClick={() => { setLeaderSearch(''); setLeaderColorFilter(''); setLeaderModal('opp'); }}
                    className="w-24 aspect-[3/4] rounded-xl border-2 border-dashed border-white/20 bg-black/40 hover:border-blue-500 transition-colors flex flex-col items-center justify-center overflow-hidden"
                  >
                    {formData.opponentLeader ? (
                      <img src={cards.find(c => c.id === formData.opponentLeader)?.imageUrl} alt="Opponent Leader" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Plus size={24} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'es' ? 'Tipo de Torneo' : 'Tournament Type'}</label>
              <select 
                value={formData.tournamentType}
                onChange={e => setFormData({...formData, tournamentType: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none"
              >
                {TOURNEY_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.name[lang]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'es' ? 'Resultado' : 'Result'}</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {MATCH_RESULTS.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormData({...formData, result: r.id as any})}
                    className={\`py-3 rounded-xl font-black text-sm uppercase transition-all border \${formData.result === r.id ? r.color + ' shadow-lg' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}\`}
                  >
                    {r.name[lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving || !formData.leaderId || !formData.opponentLeader}
            className="w-full py-4 bg-orange-500 text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-orange-400 transition-colors disabled:opacity-50"
          >
            {isSaving ? (lang === 'es' ? 'Guardando...' : 'Saving...') : (lang === 'es' ? 'Guardar Partida' : 'Save Match')}
          </button>
        </form>
      )}

      {/* Leader Selection Modal */}
      <AnimatePresence>
        {leaderModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] p-4 flex flex-col"
          >
            <div className="flex items-center gap-4 mb-4 pt-10">
              <button 
                onClick={() => setLeaderModal(null)}
                className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {lang === 'es' ? 'Selecciona un Líder' : 'Select a Leader'}
              </h2>
            </div>
            
            <div className="space-y-4 mb-4">
              <input 
                type="text" 
                placeholder={lang === 'es' ? 'Buscar líder...' : 'Search leader...'}
                value={leaderSearch}
                onChange={e => setLeaderSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setLeaderColorFilter('')}
                  className={\`px-3 py-1.5 rounded-lg text-xs font-bold \${leaderColorFilter === '' ? 'bg-white text-black' : 'bg-white/10 text-white'}\`}
                >
                  All
                </button>
                {MATCH_COLORS.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => setLeaderColorFilter(c.id)}
                    className={\`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 \${leaderColorFilter === c.id ? 'bg-white text-black' : 'bg-white/10 text-white'}\`}
                  >
                    <div className={\`w-2 h-2 rounded-full \${c.bg}\`} />
                    {c.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3 pb-24">
              {availableLeaders.map(c => (
                <button 
                  key={c.id}
                  onClick={() => {
                    if (leaderModal === 'my') setFormData({...formData, leaderId: c.id});
                    else setFormData({...formData, opponentLeader: c.id});
                    setLeaderModal(null);
                  }}
                  className="rounded-xl overflow-hidden border border-white/10 hover:border-orange-500 transition-colors relative"
                >
                  <img src={c.imageUrl} alt={c.name} className="w-full h-auto" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur p-1 text-[8px] sm:text-[10px] text-center font-bold text-white truncate">
                    {c.name}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function TrackerApp() {`;

content = content.replace(matchesViewRegex, newMatchesView);

const oldInvokeRegex = /<MatchesView matches=\{matches\} onBack=\{\(\) => setProfileView\('main'\)\} lang=\{lang\} userUid=\{user\?\.uid \|\| ''\} gameType=\{gameType\} \/>/;
const newInvoke = `<MatchesView matches={matches} onBack={() => setProfileView('main')} lang={lang} userUid={user?.uid || ''} gameType={gameType} cards={cards} />`;

content = content.replace(oldInvokeRegex, newInvoke);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Done");
