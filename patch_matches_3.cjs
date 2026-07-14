const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const oldMatchesViewRegex = /const MatchesView = \(\{[\s\S]*?export default function TrackerApp\(\) \{/;

const newMatchesView = `const MATCH_COLORS = [
  { id: 'red', name: { es: 'Rojo', en: 'Red' }, bg: 'bg-red-500' },
  { id: 'blue', name: { es: 'Azul', en: 'Blue' }, bg: 'bg-blue-500' },
  { id: 'green', name: { es: 'Verde', en: 'Green' }, bg: 'bg-green-500' },
  { id: 'yellow', name: { es: 'Amarillo', en: 'Yellow' }, bg: 'bg-yellow-500' },
  { id: 'black', name: { es: 'Negro', en: 'Black' }, bg: 'bg-gray-800' }
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
  { id: 'loss', name: { es: 'Derrota', en: 'Loss' }, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
  { id: 'draw', name: { es: 'Empate', en: 'Draw' }, color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' }
];

const MatchesView = ({ matches, onBack, lang, userUid, gameType }: { matches: MatchRecord[], onBack: () => void, lang: 'es' | 'en', userUid: string, gameType: 'masters' | 'fusion' }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    leaderId: '',
    leaderColor: 'red',
    opponentLeader: '',
    opponentColor: 'red',
    tournamentType: 'local',
    result: 'win' as 'win'|'loss'|'draw',
    notes: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userUid || !formData.leaderId || !formData.opponentLeader) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'matches'), {
        ownerId: userUid,
        gameType,
        date: formData.date,
        leaderId: formData.leaderId,
        leaderColor: formData.leaderColor,
        opponentLeader: formData.opponentLeader,
        opponentColor: formData.opponentColor,
        tournamentType: formData.tournamentType,
        result: formData.result,
        notes: formData.notes,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        leaderId: '',
        leaderColor: 'red',
        opponentLeader: '',
        opponentColor: 'red',
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

  // Calculate stats
  const totalMatches = filteredMatches.length;
  const wins = filteredMatches.filter(m => m.result === 'win').length;
  const losses = filteredMatches.filter(m => m.result === 'loss').length;
  const draws = filteredMatches.filter(m => m.result === 'draw').length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Most played leader
  const leaderCounts = filteredMatches.reduce((acc, m) => {
    acc[m.leaderId] = (acc[m.leaderId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topLeader = Object.entries(leaderCounts).sort((a, b) => b[1] - a[1])[0];

  // Most faced leader
  const oppCounts = filteredMatches.reduce((acc, m) => {
    acc[m.opponentLeader] = (acc[m.opponentLeader] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topOpponent = Object.entries(oppCounts).sort((a, b) => b[1] - a[1])[0];

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
                <div className="flex-1 p-4 bg-gray-500/10 rounded-xl border border-gray-500/20 text-center">
                  <span className="block text-xs font-black text-gray-400">{draws} {lang === 'es' ? 'Empates' : 'Draws'}</span>
                </div>
                <div className="flex-1 p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-center">
                  <span className="block text-xs font-black text-red-500">{losses} {lang === 'es' ? 'Derrotas' : 'Losses'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase mb-1">{lang === 'es' ? 'Líder más jugado' : 'Most played leader'}</span>
                    <span className="font-bold text-white text-lg">{topLeader ? topLeader[0] : '-'}</span>
                  </div>
                  {topLeader && <span className="text-xl font-black text-gray-500 px-3 py-1 bg-black/40 rounded-lg">{topLeader[1]}</span>}
                </div>
                
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase mb-1">{lang === 'es' ? 'Líder más enfrentado' : 'Most faced opponent'}</span>
                    <span className="font-bold text-white text-lg">{topOpponent ? topOpponent[0] : '-'}</span>
                  </div>
                  {topOpponent && <span className="text-xl font-black text-gray-500 px-3 py-1 bg-black/40 rounded-lg">{topOpponent[1]}</span>}
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
                    const myColor = MATCH_COLORS.find(c => c.id === match.leaderColor)?.bg || 'bg-gray-500';
                    const oppColor = MATCH_COLORS.find(c => c.id === match.opponentColor)?.bg || 'bg-gray-500';
                    const tType = TOURNEY_TYPES.find(t => t.id === match.tournamentType);

                    return (
                      <div key={match.id} className={\`p-4 rounded-2xl border \${resConf?.color}\`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <span className="font-black uppercase text-sm">{resConf?.name[lang]}</span>
                            <span className="text-[10px] opacity-70">{new Date(match.date).toLocaleDateString()} • {tType?.name[lang]}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                          <div className="flex flex-col items-end text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">{lang === 'es' ? 'Tú' : 'You'}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white truncate max-w-[100px] sm:max-w-[150px]">{match.leaderId}</span>
                              <div className={\`w-3 h-3 rounded-full \${myColor}\`} />
                            </div>
                          </div>
                          
                          <div className="text-gray-500 font-black text-xs">VS</div>

                          <div className="flex flex-col items-start text-left">
                            <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">{lang === 'es' ? 'Rival' : 'Opponent'}</span>
                            <div className="flex items-center gap-2">
                              <div className={\`w-3 h-3 rounded-full \${oppColor}\`} />
                              <span className="font-bold text-white truncate max-w-[100px] sm:max-w-[150px]">{match.opponentLeader}</span>
                            </div>
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
        <form onSubmit={handleSave} className="space-y-6 bg-white/5 p-5 rounded-3xl border border-white/5 animate-in fade-in slide-in-from-bottom-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3 p-3 bg-black/20 rounded-xl border border-white/5">
                <label className="text-[10px] font-bold text-orange-500 uppercase">{lang === 'es' ? 'Tu Líder' : 'Your Leader'}</label>
                <input 
                  type="text"
                  required
                  placeholder={lang === 'es' ? 'Ej: Jiren' : 'Ex: Jiren'}
                  value={formData.leaderId}
                  onChange={e => setFormData({...formData, leaderId: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-sm text-white focus:border-orange-500 outline-none"
                />
                <div className="flex flex-wrap gap-1">
                  {MATCH_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormData({...formData, leaderColor: c.id})}
                      className={\`w-6 h-6 rounded-full border-2 \${c.bg} \${formData.leaderColor === c.id ? 'border-white scale-110' : 'border-transparent opacity-50'}\`}
                      title={c.name[lang]}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-3 bg-black/20 rounded-xl border border-white/5">
                <label className="text-[10px] font-bold text-blue-500 uppercase">{lang === 'es' ? 'Líder Rival' : 'Opponent Leader'}</label>
                <input 
                  type="text"
                  required
                  placeholder={lang === 'es' ? 'Ej: Goku' : 'Ex: Goku'}
                  value={formData.opponentLeader}
                  onChange={e => setFormData({...formData, opponentLeader: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-sm text-white focus:border-blue-500 outline-none"
                />
                <div className="flex flex-wrap gap-1">
                  {MATCH_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormData({...formData, opponentColor: c.id})}
                      className={\`w-6 h-6 rounded-full border-2 \${c.bg} \${formData.opponentColor === c.id ? 'border-white scale-110' : 'border-transparent opacity-50'}\`}
                      title={c.name[lang]}
                    />
                  ))}
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
              <div className="grid grid-cols-3 gap-2 mt-1">
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
            disabled={isSaving}
            className="w-full py-4 bg-orange-500 text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-orange-400 transition-colors disabled:opacity-50"
          >
            {isSaving ? (lang === 'es' ? 'Guardando...' : 'Saving...') : (lang === 'es' ? 'Guardar Partida' : 'Save Match')}
          </button>
        </form>
      )}
    </div>
  );
};

export default function TrackerApp() {`;

content = content.replace(oldMatchesViewRegex, newMatchesView);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Done");
