import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { TurtleEvent, TurtleMatch, TurtleRegistration, TurtleUserInfo } from './types';
import { calculateLeagueStandings, getBaseLeaderCode, PlayerStanding } from './standingsEngine';
import { TurtleStandingsTable } from './TurtleStandingsTable';
import { TurtleAdminAdjustmentModal } from './TurtleAdminAdjustmentModal';
import { exportTournamentPrizesExcel } from './turtlePrizesExcel';
import { 
  Trophy, 
  Edit2, 
  Save, 
  X, 
  Search, 
  CheckCircle, 
  Swords, 
  Award, 
  Sparkles, 
  ShieldAlert, 
  ExternalLink,
  FileSpreadsheet,
  Package
} from 'lucide-react';

import { saveMatchesToFirestore, generateSwissNextRound } from './tournamentEngine';

interface Props {
  event: TurtleEvent;
  registrations: TurtleRegistration[];
  usersInfo: Record<string, TurtleUserInfo>;
  lang: 'es' | 'en';
  isTurtleAdmin: boolean;
  currentUserUid: string;
  onGoToMatches: () => void;
  cards?: any[];
}

export const TurtleEventActiveAdmin: React.FC<Props> = ({ 
  event, 
  registrations, 
  usersInfo, 
  lang,
  isTurtleAdmin,
  currentUserUid,
  onGoToMatches,
  cards = []
}) => {
  const [matches, setMatches] = useState<TurtleMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pairings' | 'standings'>('pairings');

  // Match Editing State
  const [editingMatch, setEditingMatch] = useState<TurtleMatch | null>(null);
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);
  const [p1LeaderId, setP1LeaderId] = useState<string | null>(null);
  const [p2LeaderId, setP2LeaderId] = useState<string | null>(null);

  // Leader Picker State for Admin
  const [isLeaderPickerOpen, setIsLeaderPickerOpen] = useState(false);
  const [leaderPickerTarget, setLeaderPickerTarget] = useState<'p1' | 'p2'>('p1');
  const [leaderSearchQuery, setLeaderSearchQuery] = useState('');
  const [leaderSearchColor, setLeaderSearchColor] = useState('Todos');

  // Admin adjustment modal
  const [adjustingPlayer, setAdjustingPlayer] = useState<PlayerStanding | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'ts_matches'), where('eventId', '==', event.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMatches: TurtleMatch[] = [];
      snapshot.forEach(d => fetchedMatches.push({ id: d.id, ...d.data() } as TurtleMatch));
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
    setP1LeaderId(m.player1LeaderId || null);
    setP2LeaderId(m.player2LeaderId || null);
  };

  const handleSaveMatch = async () => {
    if (!editingMatch) return;
    try {
      await updateDoc(doc(db, 'ts_matches', editingMatch.id), {
        player1Wins: p1Wins,
        player2Wins: p2Wins,
        draws: 0,
        player1LeaderId: p1LeaderId || null,
        player2LeaderId: p2LeaderId || null,
        status: 'completed'
      });
      setEditingMatch(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'ts_matches');
    }
  };

  const [showConfirmNextRound, setShowConfirmNextRound] = useState(false);
  const [showConfirmFinishLeague, setShowConfirmFinishLeague] = useState(false);

  const handleNextRoundClick = () => {
    if (currentRoundMatches.some(m => m.status !== 'completed')) {
      alert(lang === 'es' ? 'Aún hay partidas pendientes en esta ronda.' : 'There are still pending matches in this round.');
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

  const handleFinishLeague = async () => {
    setShowConfirmFinishLeague(false);
    try {
      await updateDoc(doc(db, 'ts_tournaments', event.id), {
        status: 'completed'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'ts_tournaments');
      alert(lang === 'es' ? 'Error al finalizar la liga.' : 'Error finishing league.');
    }
  };

  const [selectedRound, setSelectedRound] = useState<number>(1);

  const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b);
  const maxRound = rounds.length > 0 ? Math.max(...rounds) : 1;

  useEffect(() => {
    if (rounds.length > 0 && !rounds.includes(selectedRound)) {
      setSelectedRound(maxRound);
    }
  }, [maxRound, rounds, selectedRound]);

  const allPlayerIds = [...registrations.map(r => r.userId), ...(event.botPlayers?.map(b => b.userId) || [])];
  const totalPlayers = allPlayerIds.length;
  const totalAllowedRounds = Math.max(2, Math.ceil(Math.log2(totalPlayers || 2)));

  // Calculate official standings
  const calculatedStandings = calculateLeagueStandings(
    event,
    matches,
    registrations,
    allUsersInfo,
    cards
  );

  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportTournamentPrizesExcel({
        event,
        standings: calculatedStandings,
        usersInfo: allUsersInfo,
        lang
      });
    } catch (err) {
      console.error('Error exporting prizes excel:', err);
      alert(lang === 'es' ? 'Error al exportar a Excel.' : 'Error exporting to Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  const currentRoundMatches = matches.filter(m => m.round === (rounds.includes(selectedRound) ? selectedRound : maxRound));
  const allMatchesCompleted = matches.length > 0 && matches.every(m => m.status === 'completed');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="w-8 h-8 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top View Selector Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#151515] p-2 rounded-2xl border border-white/5">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pairings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all ${
              activeTab === 'pairings'
                ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Swords size={18} />
            <span>{lang === 'es' ? 'Emparejamientos' : 'Pairings'}</span>
          </button>

          <button
            onClick={() => setActiveTab('standings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all ${
              activeTab === 'standings'
                ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy size={18} />
            <span>{lang === 'es' ? 'Clasificación' : 'Standings'}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-yellow-400 border border-yellow-500/30">
              Liga
            </span>
          </button>
        </div>

        {/* Status Badge & Admin Finalize */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
            event.status === 'completed'
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              : 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse'
          }`}>
            {event.status === 'completed' 
              ? (lang === 'es' ? 'Finalizado' : 'Completed') 
              : (lang === 'es' ? 'En Curso' : 'Ongoing')}
          </span>

          {isTurtleAdmin && (
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)] disabled:opacity-50"
              title={lang === 'es' ? 'Descargar Excel con clasificación y datos de envío para premios' : 'Download Excel with standings and shipping data for prizes'}
            >
              <FileSpreadsheet size={15} />
              <span>{isExporting ? (lang === 'es' ? 'Exportando...' : 'Exporting...') : (lang === 'es' ? 'Exportar Premios (Excel)' : 'Export Prizes (Excel)')}</span>
            </button>
          )}

          {isTurtleAdmin && event.status === 'ongoing' && event.type === 'league' && (
            <button
              onClick={() => setShowConfirmFinishLeague(true)}
              className="px-3.5 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 font-bold rounded-xl text-xs transition-colors"
            >
              {lang === 'es' ? 'Finalizar Liga' : 'Finish League'}
            </button>
          )}
        </div>
      </div>

      {/* Main View: Pairings vs Standings */}
      {activeTab === 'standings' ? (
        <TurtleStandingsTable
          event={event}
          matches={matches}
          registrations={registrations}
          usersInfo={allUsersInfo}
          lang={lang}
          isTurtleAdmin={isTurtleAdmin}
          cards={cards}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Match Management (2 cols) */}
          <div className="lg:col-span-2 bg-[#151515] rounded-3xl p-6 border border-white/5 shadow-2xl">
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
              {currentRoundMatches.map(m => {
                const p1Name = allUsersInfo[m.player1Id]?.displayName || 'Unknown';
                const p2Name = m.player2Id ? (allUsersInfo[m.player2Id]?.displayName || 'Unknown') : 'BYE';
                
                const p1Card = cards.find(c => c.id === m.player1LeaderId);
                const p2Card = cards.find(c => c.id === m.player2LeaderId);
                const p1BaseCode = getBaseLeaderCode(m.player1LeaderId || '', cards);
                const p2BaseCode = getBaseLeaderCode(m.player2LeaderId || '', cards);

                return (
                  <div key={m.id} className="bg-black/40 rounded-2xl p-4 flex flex-col gap-3 border border-white/5 hover:border-white/10 transition-colors">
                    {editingMatch?.id === m.id ? (
                      /* Admin Edit Form */
                      <div className="w-full flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-xs font-black uppercase text-orange-400">
                            {lang === 'es' ? 'Editar Resultado y Líderes' : 'Edit Result & Leaders'}
                          </span>
                          <div className="flex gap-2">
                            <button onClick={handleSaveMatch} className="bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1.5">
                              <Save size={14} /> {lang === 'es' ? 'Guardar' : 'Save'}
                            </button>
                            <button onClick={() => setEditingMatch(null)} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white">
                              <X size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Scores & Leader Pickers in Edit */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Player 1 */}
                          <div className="bg-[#111] p-3 rounded-xl border border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white truncate max-w-[130px]">{p1Name}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-white/50">{lang === 'es' ? 'Victorias:' : 'Wins:'}</span>
                                <input 
                                  type="number" 
                                  value={p1Wins} 
                                  onChange={e => setP1Wins(parseInt(e.target.value) || 0)} 
                                  className="w-12 bg-black border border-white/10 text-white p-1 rounded-lg text-center font-bold" 
                                  min="0" 
                                  max="2" 
                                />
                              </div>
                            </div>

                            {/* Leader picker button */}
                            <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                              <span className="text-[10px] uppercase font-bold text-white/40">{lang === 'es' ? 'Líder:' : 'Leader:'}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setLeaderPickerTarget('p1');
                                  setLeaderSearchQuery('');
                                  setLeaderSearchColor('Todos');
                                  setIsLeaderPickerOpen(true);
                                }}
                                className="flex-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-left truncate flex items-center justify-between text-purple-300"
                              >
                                <span className="truncate">
                                  {p1LeaderId ? (cards.find(c => c.id === p1LeaderId)?.name || p1LeaderId) : (lang === 'es' ? 'Seleccionar líder' : 'Select leader')}
                                </span>
                                <Edit2 size={12} className="flex-shrink-0 text-white/40" />
                              </button>
                            </div>
                          </div>

                          {/* Player 2 */}
                          <div className="bg-[#111] p-3 rounded-xl border border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white truncate max-w-[130px]">{p2Name}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-white/50">{lang === 'es' ? 'Victorias:' : 'Wins:'}</span>
                                <input 
                                  type="number" 
                                  value={p2Wins} 
                                  onChange={e => setP2Wins(parseInt(e.target.value) || 0)} 
                                  className="w-12 bg-black border border-white/10 text-white p-1 rounded-lg text-center font-bold" 
                                  min="0" 
                                  max="2" 
                                  disabled={!m.player2Id}
                                />
                              </div>
                            </div>

                            {/* Leader picker button */}
                            {m.player2Id && (
                              <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                                <span className="text-[10px] uppercase font-bold text-white/40">{lang === 'es' ? 'Líder:' : 'Leader:'}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLeaderPickerTarget('p2');
                                    setLeaderSearchQuery('');
                                    setLeaderSearchColor('Todos');
                                    setIsLeaderPickerOpen(true);
                                  }}
                                  className="flex-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-left truncate flex items-center justify-between text-purple-300"
                                >
                                  <span className="truncate">
                                    {p2LeaderId ? (cards.find(c => c.id === p2LeaderId)?.name || p2LeaderId) : (lang === 'es' ? 'Seleccionar líder' : 'Select leader')}
                                  </span>
                                  <Edit2 size={12} className="flex-shrink-0 text-white/40" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Normal Match Row */
                      <>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex-1 flex items-center justify-center gap-4 w-full">
                            {/* P1 */}
                            <div className="flex-1 flex items-center justify-end gap-2 text-right">
                              <div>
                                <p className={`font-bold ${m.player1Wins > m.player2Wins ? 'text-green-400' : 'text-white'}`}>
                                  {p1Name}
                                </p>
                                {p1BaseCode && (
                                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20" title={`Líder base: ${p1BaseCode}`}>
                                    {p1BaseCode}
                                  </span>
                                )}
                              </div>
                              {p1Card?.imageUrl && (
                                <img src={p1Card.imageUrl} alt="" className="w-7 h-10 object-cover rounded shadow" />
                              )}
                            </div>
                            
                            {/* Score */}
                            <div className="px-4 py-1.5 bg-[#111] rounded-xl font-black text-lg border border-white/10 text-white min-w-[80px] text-center shadow-inner">
                              {m.status === 'completed' ? `${m.player1Wins} - ${m.player2Wins}` : 'VS'}
                            </div>
                            
                            {/* P2 */}
                            <div className="flex-1 flex items-center justify-start gap-2 text-left">
                              {p2Card?.imageUrl && (
                                <img src={p2Card.imageUrl} alt="" className="w-7 h-10 object-cover rounded shadow" />
                              )}
                              <div>
                                <p className={`font-bold ${m.player2Wins > m.player1Wins ? 'text-green-400' : 'text-white'}`}>
                                  {p2Name}
                                </p>
                                {p2BaseCode && (
                                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20" title={`Líder base: ${p2BaseCode}`}>
                                    {p2BaseCode}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions */}
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
                                title={lang === 'es' ? 'Editar resultado y líderes' : 'Edit match and leaders'}
                              >
                                <Edit2 size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              
              {/* Next Round Button for Tournaments */}
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

          {/* Standings Side Preview (1 col) */}
          <div className="bg-[#151515] rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-500" />
                  {lang === 'es' ? 'Clasificación' : 'Standings'}
                </h3>
                <button
                  onClick={() => setActiveTab('standings')}
                  className="text-xs font-bold text-green-400 hover:text-green-300 flex items-center gap-1"
                >
                  {lang === 'es' ? 'Ver completa' : 'View all'} <ExternalLink size={12} />
                </button>
              </div>

              {/* Rules summary note */}
              <div className="mb-4 p-3 bg-black/40 rounded-xl border border-white/5 text-[11px] text-white/60 space-y-1">
                <p>
                  <span className="text-green-400 font-bold">Victoria:</span> 3 pts • <span className="text-purple-400 font-bold">Líder único:</span> +1 pt (máx 4)
                </p>
                {event.adminAdjustments && Object.keys(event.adminAdjustments).length > 0 && (
                  <p className="text-orange-400 font-bold">
                    * Incluye ajustes y sanciones de la liga
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                {calculatedStandings.slice(0, 10).map((p) => (
                  <div 
                    key={p.userId} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      p.isDisqualified 
                        ? 'bg-red-950/20 border-red-500/20 opacity-70' 
                        : 'bg-black/20 border-white/5 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`font-black text-xs w-5 text-center ${
                        p.isDisqualified 
                          ? 'text-red-400' 
                          : p.rank === 1 ? 'text-yellow-400 text-sm' : p.rank === 2 ? 'text-slate-300' : p.rank === 3 ? 'text-amber-600' : 'text-white/30'
                      }`}>
                        {p.isDisqualified ? 'DQ' : p.rank}
                      </span>
                      <div className="min-w-0">
                        <span className={`font-bold text-xs truncate block ${
                          p.isDisqualified ? 'text-red-400 line-through' : 'text-white'
                        }`}>
                          {p.name}
                        </span>
                        <span className="text-[10px] text-white/40 block">
                          {p.wins}V - {p.losses}D • {p.uniqueLeaderCount}/4 líd.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right flex-shrink-0">
                      {p.penaltyPoints > 0 && (
                        <span className="text-[10px] font-black text-red-400">-{p.penaltyPoints}</span>
                      )}
                      <span className={`font-black text-sm w-12 text-right ${
                        p.isDisqualified ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {p.finalPoints} <span className="text-[9px] text-white/40">pts</span>
                      </span>

                      {isTurtleAdmin && (
                        <button
                          onClick={() => setAdjustingPlayer(p)}
                          className="p-1 hover:text-orange-400 text-white/30 rounded"
                          title={lang === 'es' ? 'Ajustar puntos' : 'Adjust points'}
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('standings')}
              className="w-full mt-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-bold text-xs rounded-xl border border-white/10 transition-colors text-center"
            >
              {lang === 'es' ? 'Ver Tabla Completa de Standings' : 'View Full Standings Table'}
            </button>
          </div>
        </div>
      )}

      {/* Admin Adjustment Modal */}
      {adjustingPlayer && (
        <TurtleAdminAdjustmentModal
          event={event}
          standing={adjustingPlayer}
          lang={lang}
          onClose={() => setAdjustingPlayer(null)}
        />
      )}

      {/* Confirmation Modal for Next Round */}
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

      {/* Confirmation Modal for Finishing League */}
      {showConfirmFinishLeague && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151515] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
            <h3 className="text-xl font-black text-white">
              {lang === 'es' ? '¿Finalizar Liga?' : 'Finish League?'}
            </h3>
            <p className="text-white/70">
              {lang === 'es'
                ? `La liga se marcará como finalizada. Podrás seguir ajustando los puntos de los jugadores si lo necesitas.`
                : `The league will be marked as finished. You can continue modifying player points if needed.`}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirmFinishLeague(false)}
                className="px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 font-bold transition-colors"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button 
                onClick={handleFinishLeague}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl shadow-lg transition-colors"
              >
                {lang === 'es' ? 'Finalizar Liga' : 'Finish League'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leader Picker Modal for Admin */}
      {isLeaderPickerOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151515] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-black text-white">
                {lang === 'es' ? 'Asignar Líder' : 'Assign Leader'}
              </h3>
              <button onClick={() => setIsLeaderPickerOpen(false)} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-white/50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-3 flex-shrink-0 border-b border-white/5 bg-black/20">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  placeholder={lang === 'es' ? 'Buscar por nombre o ID de carta...' : 'Search by name or card ID...'} 
                  value={leaderSearchQuery}
                  onChange={(e) => setLeaderSearchQuery(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white font-bold placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['Todos', 'Red', 'Blue', 'Green', 'Yellow', 'Black'].map(color => (
                  <button
                    key={color}
                    onClick={() => setLeaderSearchColor(color)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${leaderSearchColor === color ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {cards.filter(c => 
                c.type.toLowerCase().includes('leader') && 
                (leaderSearchColor === 'Todos' || c.color === leaderSearchColor || c.color?.includes(leaderSearchColor)) &&
                (c.name.toLowerCase().includes(leaderSearchQuery.toLowerCase()) || c.cardNumber.toLowerCase().includes(leaderSearchQuery.toLowerCase()))
              ).map(card => (
                <button 
                  key={card.id}
                  onClick={() => {
                    if (leaderPickerTarget === 'p1') {
                      setP1LeaderId(card.id);
                    } else {
                      setP2LeaderId(card.id);
                    }
                    setIsLeaderPickerOpen(false);
                  }}
                  className="relative group rounded-xl overflow-hidden border-2 border-transparent hover:border-orange-500 transition-all aspect-[2.5/3.5] shadow-lg hover:shadow-orange-500/20 hover:-translate-y-1"
                >
                  <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover object-top" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-left">
                    <span className="text-[10px] font-black text-orange-400">{card.cardNumber}</span>
                    <span className="text-xs font-bold text-white truncate">{card.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
