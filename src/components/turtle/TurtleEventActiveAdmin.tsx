import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { TurtleEvent, TurtleMatch, TurtleRegistration } from './types';
import { Trophy, Edit2, CheckCircle, Save, X } from 'lucide-react';

import { saveMatchesToFirestore, generateSwissNextRound } from './tournamentEngine';

interface Props {
  event: TurtleEvent;
  registrations: TurtleRegistration[];
  usersInfo: Record<string, { displayName: string; email: string }>;
  lang: 'es' | 'en';
  isTurtleAdmin: boolean;
  currentUserUid: string;
  onGoToMatches: () => void;
}

export const TurtleEventActiveAdmin: React.FC<Props> = ({ 
  event, 
  registrations, 
  usersInfo, 
  lang,
  isTurtleAdmin,
  currentUserUid,
  onGoToMatches
}) => {
  const [matches, setMatches] = useState<TurtleMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMatch, setEditingMatch] = useState<TurtleMatch | null>(null);
  
  // Edit Form State
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);
  const [draws, setDraws] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'ts_matches'), where('eventId', '==', event.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMatches: TurtleMatch[] = [];
      snapshot.forEach(doc => fetchedMatches.push({ id: doc.id, ...doc.data() } as TurtleMatch));
      setMatches(fetchedMatches);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [event.id]);

  const allUsersInfo = { ...usersInfo };
  if (event.botPlayers) {
    event.botPlayers.forEach(b => {
      allUsersInfo[b.userId] = { displayName: b.displayName, email: 'bot' };
    });
  }

  const handleEditMatch = (m: TurtleMatch) => {
    setEditingMatch(m);
    setP1Wins(m.player1Wins || 0);
    setP2Wins(m.player2Wins || 0);
    setDraws(m.draws || 0);
  };

  const handleSaveMatch = async () => {
    if (!editingMatch) return;
    try {
      await updateDoc(doc(db, 'ts_matches', editingMatch.id), {
        player1Wins: p1Wins,
        player2Wins: p2Wins,
        draws: draws,
        status: 'completed'
      });
      setEditingMatch(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'ts_matches');
    }
  };

  const [showConfirmNextRound, setShowConfirmNextRound] = useState(false);

  const handleNextRoundClick = () => {
    if (currentRoundMatches.some(m => m.status !== 'completed')) {
      alert(lang === 'es' ? 'Aún hay partidos pendientes en esta ronda.' : 'There are still pending matches in this round.');
      return;
    }
    setShowConfirmNextRound(true);
  };

  const handleNextRound = async () => {
    setShowConfirmNextRound(false);
    try {
      const nextMatches = await generateSwissNextRound(event.id, matches, allPlayerIds, maxRound);
      await saveMatchesToFirestore(nextMatches);
    } catch (error) {
      console.error(error);
      alert(lang === 'es' ? 'Error al generar ronda.' : 'Error generating round.');
    }
  };

  const [selectedRound, setSelectedRound] = useState<number>(1);

  const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b);
  const maxRound = rounds.length > 0 ? Math.max(...rounds) : 1;

  // Sync selectedRound when maxRound changes (e.g. initial load)
  useEffect(() => {
    if (rounds.length > 0 && !rounds.includes(selectedRound)) {
      setSelectedRound(maxRound);
    }
  }, [maxRound, rounds, selectedRound]);

  if (loading) return <div className="text-white text-center py-8">Loading matches...</div>;

  // Compute standings
  // Very basic 3 points per win (match win), 1 per draw
  const playerStats: Record<string, { points: number, matches: number, gw: number, gl: number, name: string }> = {};
  
  const allPlayerIds = [...registrations.map(r => r.userId), ...(event.botPlayers?.map(b => b.userId) || [])];
  const totalPlayers = allPlayerIds.length;
  // Calculate Swiss rounds: ceil(log2(N))
  const totalAllowedRounds = Math.max(2, Math.ceil(Math.log2(totalPlayers || 2)));
  
  allPlayerIds.forEach(id => {
    playerStats[id] = { points: 0, matches: 0, gw: 0, gl: 0, name: allUsersInfo[id]?.displayName || 'Unknown' };
  });

  matches.forEach(m => {
    if (m.status !== 'completed') return;
    
    if (m.player1Id && playerStats[m.player1Id]) {
      playerStats[m.player1Id].matches++;
      playerStats[m.player1Id].gw += m.player1Wins;
      playerStats[m.player1Id].gl += m.player2Wins;
      
      if (m.player1Wins > m.player2Wins) playerStats[m.player1Id].points += 3;
      else if (m.player1Wins === m.player2Wins) playerStats[m.player1Id].points += 1;
    }
    
    if (m.player2Id && playerStats[m.player2Id]) {
      playerStats[m.player2Id].matches++;
      playerStats[m.player2Id].gw += m.player2Wins;
      playerStats[m.player2Id].gl += m.player1Wins;
      
      if (m.player2Wins > m.player1Wins) playerStats[m.player2Id].points += 3;
      else if (m.player2Wins === m.player1Wins) playerStats[m.player2Id].points += 1;
    }
  });

  const standings = Object.values(playerStats).sort((a, b) => b.points - a.points || (b.gw - b.gl) - (a.gw - a.gl));

  const currentRoundMatches = matches.filter(m => m.round === (rounds.includes(selectedRound) ? selectedRound : maxRound));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Match Management */}
        <div className="md:col-span-2 bg-[#151515] rounded-3xl p-6 border border-white/5 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span>{lang === 'es' ? 'Emparejamientos' : 'Pairings'}</span>
            </h3>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-full">
              {rounds.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRound(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedRound === r 
                      ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {lang === 'es' ? `Ronda ${r}` : `Round ${r}`}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            {currentRoundMatches.map(m => (
              <div key={m.id} className="bg-black/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/5">
                {editingMatch?.id === m.id ? (
                  <div className="w-full flex items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-24 truncate text-white">{allUsersInfo[m.player1Id]?.displayName}</span>
                        <input type="number" value={p1Wins} onChange={e => setP1Wins(parseInt(e.target.value) || 0)} className="w-12 bg-[#111] text-white p-1 rounded text-center" min="0" max="2" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-24 truncate text-white">{m.player2Id ? allUsersInfo[m.player2Id]?.displayName : 'BYE'}</span>
                        <input type="number" value={p2Wins} onChange={e => setP2Wins(parseInt(e.target.value) || 0)} className="w-12 bg-[#111] text-white p-1 rounded text-center" min="0" max="2" disabled={!m.player2Id} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={handleSaveMatch} className="bg-green-500 hover:bg-green-600 p-2 rounded-lg text-white">
                        <Save size={16} />
                      </button>
                      <button onClick={() => setEditingMatch(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 flex items-center justify-center gap-4 w-full">
                      <div className={`flex-1 text-right font-bold ${m.player1Wins > m.player2Wins ? 'text-green-400' : 'text-white'}`}>
                        {allUsersInfo[m.player1Id]?.displayName || 'Unknown'}
                      </div>
                      
                      <div className="px-4 py-1 bg-[#111] rounded-lg font-black text-lg border border-white/10 text-white min-w-[80px] text-center">
                        {m.status === 'completed' ? `${m.player1Wins} - ${m.player2Wins}` : 'VS'}
                      </div>
                      
                      <div className={`flex-1 text-left font-bold ${m.player2Wins > m.player1Wins ? 'text-green-400' : 'text-white'}`}>
                        {m.player2Id ? (allUsersInfo[m.player2Id]?.displayName || 'Unknown') : <span className="text-white/30">BYE</span>}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      {(m.status !== 'completed' && (m.player1Id === currentUserUid || m.player2Id === currentUserUid)) && (
                        <button
                          onClick={onGoToMatches}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg text-sm"
                        >
                          {lang === 'es' ? 'Reportar' : 'Report'}
                        </button>
                      )}
                      {isTurtleAdmin && (
                        <button 
                          onClick={() => handleEditMatch(m)}
                          className="p-2 bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 rounded-xl transition-colors text-white/50"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {isTurtleAdmin && event.type !== 'league' && selectedRound === maxRound && currentRoundMatches.every(m => m.status === 'completed') && currentRoundMatches.length > 0 && (
              <>
                {maxRound < totalAllowedRounds ? (
                  <button
                    onClick={handleNextRoundClick}
                    className="w-full mt-6 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                  >
                    {lang === 'es' ? `Generar Ronda ${maxRound + 1}` : `Generate Round ${maxRound + 1}`}
                  </button>
                ) : (
                  <div className="w-full mt-6 py-4 bg-green-500/20 border border-green-500/30 text-green-400 font-black uppercase tracking-widest rounded-xl text-center shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    {lang === 'es' ? '¡Torneo Finalizado!' : 'Tournament Finished!'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Standings */}
        <div className="bg-[#151515] rounded-3xl p-6 border border-white/5 shadow-2xl">
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" />
            {lang === 'es' ? 'Clasificación' : 'Standings'}
          </h3>
          
          <div className="space-y-2">
            {standings.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`font-black text-sm w-5 text-center ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-white/30'}`}>
                    {idx + 1}
                  </span>
                  <span className="text-white font-bold truncate max-w-[120px]">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400">{p.matches} {lang === 'es' ? 'PJ' : 'P'}</span>
                  <span className="font-black text-green-400 w-6 text-right">{p.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal for Next Round */}
      {showConfirmNextRound && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151515] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
            <h3 className="text-xl font-black text-white">
              {lang === 'es' ? '¿Generar Siguiente Ronda?' : 'Generate Next Round?'}
            </h3>
            <p className="text-white/70">
              {lang === 'es'
                ? `¿Seguro que quieres generar los emparejamientos para la siguiente ronda?`
                : `Are you sure you want to generate pairings for the next round?`}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirmNextRound(false)}
                className="px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 font-bold transition-colors"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button 
                onClick={handleNextRound}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl shadow-lg transition-colors"
              >
                {lang === 'es' ? 'Generar' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
