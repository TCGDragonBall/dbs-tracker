import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { TurtleEvent, TurtleMatch, TurtleRegistration, TurtleUserInfo } from './types';
import { calculateLeagueStandings, getBaseLeaderCode, PlayerStanding, isOnlyLeaderCard, formatCardImageUrl } from './standingsEngine';
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

  // Player Match Report State (for participants in this event)
  const [playerReportingMatch, setPlayerReportingMatch] = useState<TurtleMatch | null>(null);
  const [playerMatchResult, setPlayerMatchResult] = useState<'win' | 'loss'>('win');
  const [playerMyLeaderId, setPlayerMyLeaderId] = useState<string | null>(null);
  const [isPlayerLeaderSearchOpen, setIsPlayerLeaderSearchOpen] = useState(false);
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [playerSearchColor, setPlayerSearchColor] = useState('Todos');
  const [isPlayerReportingSubmitting, setIsPlayerReportingSubmitting] = useState(false);

  const openPlayerReportModal = (m: TurtleMatch) => {
    setPlayerReportingMatch(m);
    const isP1 = m.player1Id === currentUserUid;
    const myW = isP1 ? m.player1Wins : m.player2Wins;
    const opW = isP1 ? m.player2Wins : m.player1Wins;
    if (opW > myW) {
      setPlayerMatchResult('loss');
    } else {
      setPlayerMatchResult('win'); // Default to win
    }

    // Default leader: check match first, then previous match in this event, then localStorage
    const existingLeader = isP1 ? m.player1LeaderId : m.player2LeaderId;
    if (existingLeader) {
      setPlayerMyLeaderId(existingLeader);
    } else {
      const prevInEvent = matches
        .filter(otherM => otherM.status === 'completed')
        .map(otherM => otherM.player1Id === currentUserUid ? otherM.player1LeaderId : (otherM.player2Id === currentUserUid ? otherM.player2LeaderId : null))
        .find(lid => Boolean(lid));

      let defaultLeader = prevInEvent;
      if (!defaultLeader && typeof window !== 'undefined') {
        try {
          defaultLeader = localStorage.getItem(`turtle_last_leader_${currentUserUid}_${event.id}`)
            || localStorage.getItem(`turtle_last_leader_${currentUserUid}`)
            || null;
        } catch (e) {
          // ignore
        }
      }
      setPlayerMyLeaderId(defaultLeader || null);
    }
  };

  const handleSavePlayerReport = async () => {
    if (!playerReportingMatch || isPlayerReportingSubmitting) return;

    if (!playerMyLeaderId) {
      alert(lang === 'es' ? 'Debes seleccionar tu líder antes de guardar.' : 'You must select your leader before saving.');
      return;
    }

    setIsPlayerReportingSubmitting(true);
    try {
      const isP1 = playerReportingMatch.player1Id === currentUserUid;
      const myW = playerMatchResult === 'win' ? 1 : 0;
      const opW = playerMatchResult === 'loss' ? 1 : 0;

      const updateData: any = {
        player1Wins: isP1 ? myW : opW,
        player2Wins: isP1 ? opW : myW,
        draws: 0,
        status: 'completed',
        updatedAt: serverTimestamp()
      };

      if (isP1) {
        updateData.player1LeaderId = playerMyLeaderId;
        if (playerReportingMatch.player2LeaderId) {
          updateData.player2LeaderId = playerReportingMatch.player2LeaderId;
        }
      } else {
        updateData.player2LeaderId = playerMyLeaderId;
        if (playerReportingMatch.player1LeaderId) {
          updateData.player1LeaderId = playerReportingMatch.player1LeaderId;
        }
      }

      await updateDoc(doc(db, 'ts_matches', playerReportingMatch.id), updateData);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`turtle_last_leader_${currentUserUid}_${event.id}`, playerMyLeaderId);
          localStorage.setItem(`turtle_last_leader_${currentUserUid}`, playerMyLeaderId);
        } catch (e) {
          // ignore
        }
      }

      setPlayerReportingMatch(null);
    } catch (error: any) {
      console.error('Error saving player report:', error);
      handleFirestoreError(error, OperationType.UPDATE, 'ts_matches');
      const errCode = (error as any)?.code || '';
      let msg = lang === 'es' ? 'Error al reportar el resultado.' : 'Error reporting result.';
      if (errCode.includes('permission-denied')) {
        msg = lang === 'es' 
          ? 'Error de permisos: comprueba que has iniciado sesión y vuelve a intentarlo.' 
          : 'Permission error: please check that you are signed in and try again.';
      } else if (errCode.includes('unavailable') || errCode.includes('network')) {
        msg = lang === 'es'
          ? 'Error de conexión: comprueba tu conexión a internet.'
          : 'Connection error: please check your network connection.';
      } else if (error?.message) {
        msg += ` (${error.message})`;
      }
      alert(msg);
    } finally {
      setIsPlayerReportingSubmitting(false);
    }
  };

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
      allUsersInfo[b.userId] = { displayName: b.displayName, officialName: b.displayName, email: 'bot' };
    });
  }

  const handleEditMatch = (m: TurtleMatch) => {
    setEditingMatch(m);
    if (!m.player2Id) {
      setP1Wins(1);
      setP2Wins(0);
    } else if (m.player1Wins > m.player2Wins) {
      setP1Wins(1);
      setP2Wins(0);
    } else if (m.player2Wins > m.player1Wins) {
      setP1Wins(0);
      setP2Wins(1);
    } else {
      setP1Wins(0);
      setP2Wins(0);
    }
    setP1LeaderId(m.player1LeaderId || null);
    setP2LeaderId(m.player2LeaderId || null);
  };

  const handleSaveMatch = async () => {
    if (!editingMatch) return;
    try {
      const isBye = !editingMatch.player2Id;
      const isWinnerChosen = p1Wins > p2Wins || p2Wins > p1Wins || isBye;
      const p1FinalWins = isBye || p1Wins > p2Wins ? 1 : 0;
      const p2FinalWins = !isBye && p2Wins > p1Wins ? 1 : 0;

      await updateDoc(doc(db, 'ts_matches', editingMatch.id), {
        player1Wins: p1FinalWins,
        player2Wins: p2FinalWins,
        draws: 0,
        player1LeaderId: p1LeaderId || null,
        player2LeaderId: p2LeaderId || null,
        status: isWinnerChosen ? 'completed' : editingMatch.status
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
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

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

  const currentRoundMatches = matches
    .filter(m => m.round === (rounds.includes(selectedRound) ? selectedRound : maxRound))
    .filter(m => selectedGroupFilter === 'all' || m.groupId === selectedGroupFilter);
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

            {event.groups && event.groups.length > 1 && (
              <div className="flex gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10 w-fit mb-4 overflow-x-auto max-w-full">
                <button
                  onClick={() => setSelectedGroupFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedGroupFilter === 'all'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {lang === 'es' ? 'Todos los Grupos' : 'All Groups'}
                </button>
                {event.groups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroupFilter(g.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      selectedGroupFilter === g.id
                        ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
            
            <div className="space-y-3">
              {currentRoundMatches.map(m => {
                const p1Info = allUsersInfo[m.player1Id];
                const p2Info = m.player2Id ? allUsersInfo[m.player2Id] : null;
                const isLeagueBye = event.type === 'league' && !m.player2Id;
                const p1Name = p1Info?.officialName || p1Info?.discordUsername || p1Info?.displayName || 'Unknown';
                const p2Name = m.player2Id 
                  ? (p2Info?.officialName || p2Info?.discordUsername || p2Info?.displayName || 'Unknown') 
                  : (event.type === 'league' ? (lang === 'es' ? 'Descanso Semanal' : 'Rest Week') : 'BYE');
                
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
                            {m.groupName ? `${m.groupName} • ` : ''}{lang === 'es' ? 'Editar Resultado y Líderes' : 'Edit Result & Leaders'}
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
                          <div className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                            p1Wins > p2Wins 
                              ? 'bg-green-500/10 border-green-500/40' 
                              : (p2Wins > p1Wins ? 'bg-red-500/5 border-red-500/20' : 'bg-[#111] border-white/5')
                          }`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-white truncate max-w-[140px]">{p1Name}</span>
                              {p1Wins > p2Wins && (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/40">
                                  {lang === 'es' ? 'Victoria' : 'Win'}
                                </span>
                              )}
                              {p2Wins > p1Wins && (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                                  {lang === 'es' ? 'Derrota' : 'Loss'}
                                </span>
                              )}
                            </div>

                            {/* Victoria / Derrota selection */}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => { setP1Wins(1); setP2Wins(0); }}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1.5 border transition-all ${
                                  p1Wins > p2Wins 
                                    ? 'bg-green-500 text-white border-green-400 shadow-[0_0_12px_rgba(34,197,94,0.3)]' 
                                    : 'bg-black/50 text-white/40 border-white/10 hover:border-green-500/50 hover:text-green-400'
                                }`}
                              >
                                <Trophy size={14} /> {lang === 'es' ? 'Victoria' : 'Win'}
                              </button>
                              {m.player2Id && (
                                <button
                                  type="button"
                                  onClick={() => { setP1Wins(0); setP2Wins(1); }}
                                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1.5 border transition-all ${
                                    p2Wins > p1Wins 
                                      ? 'bg-red-500 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]' 
                                      : 'bg-black/50 text-white/40 border-white/10 hover:border-red-500/50 hover:text-red-400'
                                  }`}
                                >
                                  <X size={14} /> {lang === 'es' ? 'Derrota' : 'Loss'}
                                </button>
                              )}
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
                          <div className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                            p2Wins > p1Wins 
                              ? 'bg-green-500/10 border-green-500/40' 
                              : (p1Wins > p2Wins ? 'bg-red-500/5 border-red-500/20' : 'bg-[#111] border-white/5')
                          }`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-white truncate max-w-[140px]">{p2Name}</span>
                              {m.player2Id && p2Wins > p1Wins && (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/40">
                                  {lang === 'es' ? 'Victoria' : 'Win'}
                                </span>
                              )}
                              {m.player2Id && p1Wins > p2Wins && (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                                  {lang === 'es' ? 'Derrota' : 'Loss'}
                                </span>
                              )}
                            </div>

                            {/* Victoria / Derrota selection */}
                            {m.player2Id ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => { setP1Wins(0); setP2Wins(1); }}
                                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1.5 border transition-all ${
                                    p2Wins > p1Wins 
                                      ? 'bg-green-500 text-white border-green-400 shadow-[0_0_12px_rgba(34,197,94,0.3)]' 
                                      : 'bg-black/50 text-white/40 border-white/10 hover:border-green-500/50 hover:text-green-400'
                                  }`}
                                >
                                  <Trophy size={14} /> {lang === 'es' ? 'Victoria' : 'Win'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setP1Wins(1); setP2Wins(0); }}
                                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1.5 border transition-all ${
                                    p1Wins > p2Wins 
                                      ? 'bg-red-500 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]' 
                                      : 'bg-black/50 text-white/40 border-white/10 hover:border-red-500/50 hover:text-red-400'
                                  }`}
                                >
                                  <X size={14} /> {lang === 'es' ? 'Derrota' : 'Loss'}
                                </button>
                              </div>
                            ) : (
                              <div className="py-2 text-center text-xs text-white/40 italic bg-black/30 rounded-lg border border-white/5">
                                {lang === 'es' ? 'BYE (Sin oponente - Victoria 1-0)' : 'BYE (No opponent - 1-0 win)'}
                              </div>
                            )}

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
                                <p className={`font-bold ${!isLeagueBye && m.player1Wins > m.player2Wins ? 'text-green-400' : 'text-white'}`}>
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
                            <div className="px-4 py-1.5 bg-[#111] rounded-xl font-black text-sm md:text-base border border-white/10 text-white min-w-[80px] text-center shadow-inner">
                              {isLeagueBye 
                                ? (lang === 'es' ? 'Descanso' : 'Rest') 
                                : (m.status === 'completed' 
                                    ? (!m.player2Id ? '1 - 0' : `${m.player1Wins > m.player2Wins ? 1 : 0} - ${m.player2Wins > m.player1Wins ? 1 : 0}`) 
                                    : 'VS')}
                            </div>
                            
                            {/* P2 */}
                            <div className="flex-1 flex items-center justify-start gap-2 text-left">
                              {p2Card?.imageUrl && (
                                <img src={p2Card.imageUrl} alt="" className="w-7 h-10 object-cover rounded shadow" />
                              )}
                              <div>
                                <p className={`font-bold ${!isLeagueBye && m.player2Wins > m.player1Wins ? 'text-green-400' : 'text-white'}`}>
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
                            {m.groupName && (
                              <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                                {m.groupName}
                              </span>
                            )}
                            {(m.status !== 'completed' && (m.player1Id === currentUserUid || m.player2Id === currentUserUid)) && (
                              <button
                                onClick={() => openPlayerReportModal(m)}
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
                  {event.type === 'league' ? (
                    <>
                      <span className="text-green-400 font-bold">{lang === 'es' ? 'Victoria:' : 'Win:'}</span> 3 pts • <span className="text-purple-400 font-bold">{lang === 'es' ? 'Líder único:' : 'Unique Leader:'}</span> +1 pt (máx 4)
                    </>
                  ) : (
                    <>
                      <span className="text-green-400 font-bold">{lang === 'es' ? 'Victoria:' : 'Win:'}</span> 3 pts • <span className="text-red-400 font-bold">{lang === 'es' ? 'Derrota:' : 'Loss:'}</span> 0 pts
                    </>
                  )}
                </p>
                {event.adminAdjustments && Object.keys(event.adminAdjustments).length > 0 && (
                  <p className="text-orange-400 font-bold">
                    {lang === 'es' ? '* Incluye ajustes y sanciones' : '* Includes adjustments and penalties'}
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
                          {p.wins}V - {p.losses}D {event.type === 'league' ? `• ${p.uniqueLeaderCount}/4 líd.` : `• ${p.uniqueLeaderCount} ${p.uniqueLeaderCount === 1 ? (lang === 'es' ? 'líd.' : 'leader') : (lang === 'es' ? 'líd.' : 'leaders')}`}
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

      {/* Player Match Report Modal */}
      {playerReportingMatch && (() => {
        const isP1 = playerReportingMatch.player1Id === currentUserUid;
        const oppId = isP1 ? playerReportingMatch.player2Id : playerReportingMatch.player1Id;
        const oppName = oppId ? allUsersInfo[oppId]?.displayName || 'Unknown' : 'BYE';
        const myCard = cards.find(c => c.id === playerMyLeaderId);

        return (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151515] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic">
                    {lang === 'es' ? 'Reportar Resultado' : 'Report Result'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {lang === 'es' ? 'Ronda' : 'Round'} {playerReportingMatch.round} • VS {oppName}
                  </p>
                </div>
                <button 
                  onClick={() => setPlayerReportingMatch(null)} 
                  className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-white/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Score Selector - Bo1 Win/Loss */}
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 text-center">
                    {lang === 'es' ? 'Resultado' : 'Result'}
                  </label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setPlayerMatchResult('win')}
                      className={`flex-1 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 border-2 transition-all ${playerMatchResult === 'win' ? 'bg-green-500/20 text-green-400 border-green-500 scale-[1.02] shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-[#111] text-white/40 border-white/5 hover:border-green-500/50 hover:text-green-500/50'}`}
                    >
                      <Trophy size={20} /> {lang === 'es' ? 'Victoria' : 'Win'}
                    </button>
                    <button 
                      onClick={() => setPlayerMatchResult('loss')}
                      className={`flex-1 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 border-2 transition-all ${playerMatchResult === 'loss' ? 'bg-red-500/20 text-red-400 border-red-500 scale-[1.02] shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-[#111] text-white/40 border-white/5 hover:border-red-500/50 hover:text-red-500/50'}`}
                    >
                      <X size={20} /> {lang === 'es' ? 'Derrota' : 'Loss'}
                    </button>
                  </div>
                </div>

                {/* Selector de Líder */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 text-center">
                    {lang === 'es' ? 'Selector de Líder' : 'Leader Selector'}
                  </label>
                  <div className="flex flex-col items-center">
                    <button 
                      type="button"
                      onClick={() => {
                        setPlayerSearchQuery('');
                        setPlayerSearchColor('Todos');
                        setIsPlayerLeaderSearchOpen(true);
                      }}
                      className="w-44 aspect-[2.5/3.5] bg-[#111] border-2 border-dashed border-white/20 hover:border-purple-500 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden group shadow-xl"
                    >
                      {playerMyLeaderId && myCard ? (
                        <>
                          <img 
                            src={formatCardImageUrl(myCard.imageUrl)} 
                            alt={myCard.name} 
                            className="absolute inset-0 w-full h-full object-cover object-top" 
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold text-xs bg-black/70 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                              {lang === 'es' ? 'Cambiar Líder' : 'Change Leader'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-all">
                            <Search size={22} />
                          </div>
                          <span className="text-xs font-bold text-white/50 group-hover:text-white transition-colors px-2 text-center">
                            {lang === 'es' ? 'Seleccionar Líder' : 'Select Leader'}
                          </span>
                        </>
                      )}
                    </button>

                    {playerMyLeaderId && (
                      <div className="mt-2 text-center">
                        <p className="text-xs font-bold text-purple-300 truncate max-w-[220px]">
                          {myCard?.name || playerMyLeaderId}
                        </p>
                        <span className="text-[10px] font-mono text-white/40">
                          {myCard?.cardNumber || ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/10 bg-black/20">
                <button 
                  onClick={handleSavePlayerReport}
                  disabled={isPlayerReportingSubmitting}
                  className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
                >
                  {isPlayerReportingSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle size={20} />
                  )}
                  {isPlayerReportingSubmitting 
                    ? (lang === 'es' ? 'Guardando...' : 'Saving...') 
                    : (lang === 'es' ? 'Guardar Resultado' : 'Save Result')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Player Leader Search Modal */}
      {isPlayerLeaderSearchOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151515] border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center flex-shrink-0 bg-black/30">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span className="text-purple-400">🛡️</span>
                  {lang === 'es' ? 'Seleccionar Mi Líder' : 'Select My Leader'}
                </h3>
                <p className="text-xs text-white/40 mt-0.5">
                  {lang === 'es' ? 'Solo líderes oficiales (sin cartas Z-Líder)' : 'Standard leaders only (excluding Z-Leaders)'}
                </p>
              </div>
              <button 
                onClick={() => setIsPlayerLeaderSearchOpen(false)} 
                className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-white/50 transition-colors"
                title={lang === 'es' ? 'Cerrar' : 'Close'}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-3 flex-shrink-0 border-b border-white/5 bg-black/20">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  placeholder={lang === 'es' ? 'Buscar por nombre o ID de carta (ej. BT1-001, Goku)...' : 'Search by name or card ID (e.g. BT1-001, Goku)...'} 
                  value={playerSearchQuery}
                  onChange={(e) => setPlayerSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-[#111] border border-white/10 rounded-2xl py-3 pl-11 pr-10 text-white text-sm font-bold placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                {playerSearchQuery && (
                  <button 
                    onClick={() => setPlayerSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['Todos', 'Red', 'Blue', 'Green', 'Yellow', 'Black'].map(color => (
                  <button
                    key={color}
                    onClick={() => setPlayerSearchColor(color)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      playerSearchColor === color 
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-thin scrollbar-thumb-white/10">
              {(() => {
                const filteredLeaders = cards.filter(c => 
                  isOnlyLeaderCard(c) && 
                  (playerSearchColor === 'Todos' || c.color === playerSearchColor || c.color?.toLowerCase()?.includes(playerSearchColor.toLowerCase())) &&
                  (c.name?.toLowerCase().includes(playerSearchQuery.toLowerCase()) || c.cardNumber?.toLowerCase().includes(playerSearchQuery.toLowerCase()) || c.id?.toLowerCase().includes(playerSearchQuery.toLowerCase()))
                );

                if (filteredLeaders.length === 0) {
                  return (
                    <div className="text-center py-20 text-white/40 font-bold flex flex-col items-center justify-center gap-2">
                      <Search size={32} className="text-white/20" />
                      <span>{lang === 'es' ? 'No se encontraron líderes que coincidan con la búsqueda.' : 'No leaders found matching the search.'}</span>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                    {filteredLeaders.map(card => {
                      const imgUrl = formatCardImageUrl(card.imageUrl);
                      return (
                        <div
                          key={card.id}
                          onClick={() => {
                            setPlayerMyLeaderId(card.id);
                            setIsPlayerLeaderSearchOpen(false);
                          }}
                          className="bg-[#121212] border border-white/10 hover:border-purple-500 rounded-2xl p-2.5 relative overflow-hidden transition-all flex flex-col group/card cursor-pointer select-none hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 active:scale-[0.98]"
                        >
                          <div className="relative pt-[140%] overflow-hidden rounded-xl bg-black/40 min-h-[160px]">
                            <img 
                              src={imgUrl} 
                              alt={card.name} 
                              className="absolute inset-0 w-full h-full object-cover object-top rounded-xl shadow transition-transform duration-500 group-hover/card:scale-105" 
                              loading="lazy" 
                              onError={(e) => {
                                if (card.cardNumber) {
                                  (e.currentTarget as HTMLImageElement).src = `https://www.dbs-cardgame.com/images/cardlist/cardimg/${card.cardNumber}.png`;
                                }
                              }}
                            />
                          </div>
                          <div className="text-left pt-2 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="text-[11px] font-black tracking-tight text-white line-clamp-1 leading-tight mb-0.5 group-hover/card:text-purple-400 transition-colors">
                                {card.name}
                              </p>
                              <p className="text-[9px] text-purple-400 font-extrabold uppercase tracking-widest flex items-center justify-between">
                                <span>{card.cardNumber}</span>
                                <span className="text-gray-400 text-[8px]">{(card.rarity || "").replace(/\*/g, '')}</span>
                              </p>
                            </div>
                            {card.color && (
                              <div className="mt-1 flex items-center justify-between">
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-white/60 border border-white/5 uppercase">
                                  {card.color}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Leader Picker Modal for Admin */}
      {isLeaderPickerOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151515] border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center flex-shrink-0 bg-black/30">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span className="text-orange-400">🛡️</span>
                  {lang === 'es' ? 'Asignar Líder' : 'Assign Leader'}
                </h3>
                <p className="text-xs text-white/40 mt-0.5">
                  {lang === 'es' ? 'Solo líderes oficiales (sin cartas Z-Líder)' : 'Standard leaders only (excluding Z-Leaders)'}
                </p>
              </div>
              <button 
                onClick={() => setIsLeaderPickerOpen(false)} 
                className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-white/50 transition-colors"
                title={lang === 'es' ? 'Cerrar' : 'Close'}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-3 flex-shrink-0 border-b border-white/5 bg-black/20">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  placeholder={lang === 'es' ? 'Buscar por nombre o ID de carta (ej. BT1-001, Goku)...' : 'Search by name or card ID (e.g. BT1-001, Goku)...'} 
                  value={leaderSearchQuery}
                  onChange={(e) => setLeaderSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-[#111] border border-white/10 rounded-2xl py-3 pl-11 pr-10 text-white text-sm font-bold placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
                {leaderSearchQuery && (
                  <button 
                    onClick={() => setLeaderSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['Todos', 'Red', 'Blue', 'Green', 'Yellow', 'Black'].map(color => (
                  <button
                    key={color}
                    onClick={() => setLeaderSearchColor(color)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      leaderSearchColor === color 
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-thin scrollbar-thumb-white/10">
              {(() => {
                const filteredLeaders = cards.filter(c => 
                  isOnlyLeaderCard(c) && 
                  (leaderSearchColor === 'Todos' || c.color === leaderSearchColor || c.color?.toLowerCase()?.includes(leaderSearchColor.toLowerCase())) &&
                  (c.name?.toLowerCase().includes(leaderSearchQuery.toLowerCase()) || c.cardNumber?.toLowerCase().includes(leaderSearchQuery.toLowerCase()) || c.id?.toLowerCase().includes(leaderSearchQuery.toLowerCase()))
                );

                if (filteredLeaders.length === 0) {
                  return (
                    <div className="text-center py-20 text-white/40 font-bold flex flex-col items-center justify-center gap-2">
                      <Search size={32} className="text-white/20" />
                      <span>{lang === 'es' ? 'No se encontraron líderes que coincidan con la búsqueda.' : 'No leaders found matching the search.'}</span>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                    {filteredLeaders.map(card => {
                      const imgUrl = formatCardImageUrl(card.imageUrl);
                      return (
                        <div
                          key={card.id}
                          onClick={() => {
                            if (leaderPickerTarget === 'p1') {
                              setP1LeaderId(card.id);
                            } else {
                              setP2LeaderId(card.id);
                            }
                            setIsLeaderPickerOpen(false);
                          }}
                          className="bg-[#121212] border border-white/10 hover:border-orange-500 rounded-2xl p-2.5 relative overflow-hidden transition-all flex flex-col group/card cursor-pointer select-none hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 active:scale-[0.98]"
                        >
                          <div className="relative pt-[140%] overflow-hidden rounded-xl bg-black/40 min-h-[160px]">
                            <img 
                              src={imgUrl} 
                              alt={card.name} 
                              className="absolute inset-0 w-full h-full object-cover object-top rounded-xl shadow transition-transform duration-500 group-hover/card:scale-105" 
                              loading="lazy" 
                              onError={(e) => {
                                if (card.cardNumber) {
                                  (e.currentTarget as HTMLImageElement).src = `https://www.dbs-cardgame.com/images/cardlist/cardimg/${card.cardNumber}.png`;
                                }
                              }}
                            />
                          </div>
                          <div className="text-left pt-2 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="text-[11px] font-black tracking-tight text-white line-clamp-1 leading-tight mb-0.5 group-hover/card:text-orange-400 transition-colors">
                                {card.name}
                              </p>
                              <p className="text-[9px] text-orange-500 font-extrabold uppercase tracking-widest flex items-center justify-between">
                                <span>{card.cardNumber}</span>
                                <span className="text-gray-400 text-[8px]">{(card.rarity || "").replace(/\*/g, '')}</span>
                              </p>
                            </div>
                            {card.color && (
                              <div className="mt-1 flex items-center justify-between">
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-white/60 border border-white/5 uppercase">
                                  {card.color}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
