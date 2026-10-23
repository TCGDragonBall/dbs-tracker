import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { TurtleMatch, TurtleEvent } from './types';
import { isOnlyLeaderCard, formatCardImageUrl } from './standingsEngine';
import { Trophy, X, Search, Calendar, User as UserIcon, CheckCircle } from 'lucide-react';

interface TurtlePlayerMatchesViewProps {
  userUid: string;
  lang: 'es' | 'en';
  cards: any[];
}

export const TurtlePlayerMatchesView: React.FC<TurtlePlayerMatchesViewProps> = ({ userUid, lang, cards }) => {
  const [matches, setMatches] = useState<TurtleMatch[]>([]);
  const [events, setEvents] = useState<Record<string, TurtleEvent>>({});
  const [usersInfo, setUsersInfo] = useState<Record<string, { displayName: string }>>({});
  const [loading, setLoading] = useState(true);

  // Match Report State
  const [reportingMatch, setReportingMatch] = useState<TurtleMatch | null>(null);
  const [matchResult, setMatchResult] = useState<'win' | 'loss'>('win');
  const [myLeaderId, setMyLeaderId] = useState<string | null>(null);

  // Leader Search State
  const [isLeaderSearchOpen, setIsLeaderSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColor, setSearchColor] = useState('Todos');

  useEffect(() => {
    if (!userUid) return;

    // Fetch matches where user is player1 or player2
    const q1 = query(collection(db, 'ts_matches'), where('player1Id', '==', userUid));
    const q2 = query(collection(db, 'ts_matches'), where('player2Id', '==', userUid));

    const fetchAllMatches = async () => {
      try {
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const fetchedMatches: TurtleMatch[] = [];
        const eventIds = new Set<string>();
        const oppIds = new Set<string>();

        snap1.forEach(doc => {
          const m = { id: doc.id, ...doc.data() } as TurtleMatch;
          fetchedMatches.push(m);
          eventIds.add(m.eventId);
          if (m.player2Id) oppIds.add(m.player2Id);
        });

        snap2.forEach(doc => {
          const m = { id: doc.id, ...doc.data() } as TurtleMatch;
          fetchedMatches.push(m);
          eventIds.add(m.eventId);
          oppIds.add(m.player1Id);
        });

        // Sort by created descending or round descending
        fetchedMatches.sort((a, b) => b.round - a.round);
        setMatches(fetchedMatches);

        // Fetch events
        const eventsData: Record<string, TurtleEvent> = {};
        for (const eId of eventIds) {
          const eDoc = await getDocs(query(collection(db, 'ts_tournaments'), where('__name__', '==', eId)));
          eDoc.forEach(d => {
            eventsData[d.id] = { id: d.id, ...d.data() } as TurtleEvent;
          });
        }
        setEvents(eventsData);

        // Fetch opponent names
        const usersData: Record<string, { displayName: string }> = {};
        Object.values(eventsData).forEach(ev => {
          if (ev.botPlayers) {
            ev.botPlayers.forEach(bot => {
              usersData[bot.userId] = { displayName: bot.displayName };
            });
          }
        });
        for (const oId of oppIds) {
          if (!usersData[oId]) {
            const uDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', oId)));
            uDoc.forEach(d => {
              const uData = d.data();
              usersData[d.id] = { displayName: uData.officialName || uData.discordUsername || uData.displayName || 'Unknown User' };
            });
          }
        }
        setUsersInfo(usersData);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchAllMatches();

    // Setup listener for real-time updates (simplified: listen to both queries)
    const unsub1 = onSnapshot(q1, () => fetchAllMatches());
    const unsub2 = onSnapshot(q2, () => fetchAllMatches());

    return () => {
      unsub1();
      unsub2();
    };
  }, [userUid]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReportMatch = async () => {
    if (!reportingMatch || isSubmitting) return;
    
    // Ensure leader is selected
    if (!myLeaderId) {
      alert(lang === 'es' ? 'Debes seleccionar tu líder antes de guardar.' : 'You must select your leader before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isPlayer1 = reportingMatch.player1Id === userUid;
      const myW = matchResult === 'win' ? 1 : 0;
      const opW = matchResult === 'loss' ? 1 : 0;
      
      const updateData: any = {
        player1Wins: isPlayer1 ? myW : opW,
        player2Wins: isPlayer1 ? opW : myW,
        draws: 0,
        status: 'completed',
        updatedAt: serverTimestamp()
      };

      if (isPlayer1) {
        updateData.player1LeaderId = myLeaderId;
        if (reportingMatch.player2LeaderId) {
          updateData.player2LeaderId = reportingMatch.player2LeaderId;
        }
      } else {
        updateData.player2LeaderId = myLeaderId;
        if (reportingMatch.player1LeaderId) {
          updateData.player1LeaderId = reportingMatch.player1LeaderId;
        }
      }

      await updateDoc(doc(db, 'ts_matches', reportingMatch.id), updateData);

      // Persist chosen leader so next reports default to it automatically
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`turtle_last_leader_${userUid}_${reportingMatch.eventId}`, myLeaderId);
          localStorage.setItem(`turtle_last_leader_${userUid}`, myLeaderId);
        } catch (e) {
          // ignore
        }
      }

      setReportingMatch(null);
    } catch (error: any) {
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
      setIsSubmitting(false);
    }
  };

  const openReportModal = (match: TurtleMatch) => {
    setReportingMatch(match);
    const isPlayer1 = match.player1Id === userUid;
    const myW = isPlayer1 ? match.player1Wins : match.player2Wins;
    const opW = isPlayer1 ? match.player2Wins : match.player1Wins;
    if (opW > myW) {
      setMatchResult('loss');
    } else {
      setMatchResult('win'); // Default to win
    }

    const existingLeader = isPlayer1 ? match.player1LeaderId : match.player2LeaderId;
    if (existingLeader) {
      setMyLeaderId(existingLeader);
    } else {
      // Find leader from previous matches of this user in the same event
      const prevInEvent = matches
        .filter(m => m.eventId === match.eventId && m.status === 'completed')
        .map(m => m.player1Id === userUid ? m.player1LeaderId : (m.player2Id === userUid ? m.player2LeaderId : null))
        .find(lid => Boolean(lid));

      let defaultLeader = prevInEvent;
      if (!defaultLeader && typeof window !== 'undefined') {
        try {
          defaultLeader = localStorage.getItem(`turtle_last_leader_${userUid}_${match.eventId}`)
            || localStorage.getItem(`turtle_last_leader_${userUid}`)
            || null;
        } catch (e) {
          // ignore
        }
      }
      setMyLeaderId(defaultLeader || null);
    }
  };

  const openLeaderSearch = () => {
    setSearchQuery('');
    setSearchColor('Todos');
    setIsLeaderSearchOpen(true);
  };

  const selectLeader = (cardId: string) => {
    setMyLeaderId(cardId);
    setIsLeaderSearchOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="w-8 h-8 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={48} className="mx-auto text-green-500/20 mb-4" />
        <p className="text-gray-500">{lang === 'es' ? 'Aún no tienes partidas programadas.' : 'You have no scheduled matches yet.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map(match => {
        const event = events[match.eventId];
        const isPlayer1 = match.player1Id === userUid;
        const oppId = isPlayer1 ? match.player2Id : match.player1Id;
        const isLeagueBye = event?.type === 'league' && !oppId;
        const oppName = oppId 
          ? usersInfo[oppId]?.displayName || 'Unknown' 
          : (isLeagueBye ? (lang === 'es' ? 'Descanso Semanal' : 'Rest Week') : 'BYE');
        const isCompleted = match.status === 'completed';
        
        let resultLabel = '';
        let resultColor = '';
        if (isCompleted && oppId) {
          const myW = isPlayer1 ? match.player1Wins : match.player2Wins;
          const opW = isPlayer1 ? match.player2Wins : match.player1Wins;
          if (myW > opW) {
            resultLabel = 'WIN';
            resultColor = 'text-green-500';
          } else if (opW > myW) {
            resultLabel = 'LOSS';
            resultColor = 'text-red-500';
          } else {
            resultLabel = 'DRAW';
            resultColor = 'text-yellow-500';
          }
        }

        return (
          <div key={match.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between hover:bg-white/10 transition-colors">
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] uppercase font-black tracking-widest text-green-500">
                  {event?.name} • {lang === 'es' ? 'Ronda' : 'Round'} {match.round}
                </span>
                {match.groupName && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                    {match.groupName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-lg md:text-xl font-bold text-white">
                <span>{lang === 'es' ? 'Tú' : 'You'}</span>
                <span className="text-white/30 text-sm">VS</span>
                <span>{oppName}</span>
              </div>
              
              {isCompleted && oppId && (
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-black px-3 py-1 rounded bg-black/50 ${resultColor}`}>
                    {resultLabel === 'WIN' ? (lang === 'es' ? 'VICTORIA' : 'WIN') : resultLabel === 'LOSS' ? (lang === 'es' ? 'DERROTA' : 'LOSS') : 'DRAW'}
                  </span>
                </div>
              )}

              {isLeagueBye && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-black px-3 py-1 rounded bg-white/10 text-white/60">
                    {lang === 'es' ? 'DESCANSO (SIN PARTIDA ESTA JORNADA)' : 'REST WEEK (NO MATCH)'}
                  </span>
                </div>
              )}
            </div>
            
            {!isCompleted && oppId && (
              <button
                onClick={() => openReportModal(match)}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 whitespace-nowrap"
              >
                {lang === 'es' ? 'Reportar' : 'Report'}
              </button>
            )}
            
            {(!oppId) && (
              <div className="px-4 py-2 bg-white/10 text-white/50 font-bold rounded-xl text-sm italic">
                {isLeagueBye ? (lang === 'es' ? 'Descanso' : 'Rest') : 'BYE'}
              </div>
            )}
          </div>
        );
      })}

      {/* Report Modal */}
      {reportingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151515] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h3 className="text-xl font-black text-white uppercase italic">
                {lang === 'es' ? 'Reportar Resultado' : 'Report Result'}
              </h3>
              <button onClick={() => setReportingMatch(null)} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-white/50 transition-colors">
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
                    onClick={() => setMatchResult('win')}
                    className={`flex-1 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 border-2 transition-all ${matchResult === 'win' ? 'bg-green-500/20 text-green-400 border-green-500 scale-[1.02] shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-[#111] text-white/40 border-white/5 hover:border-green-500/50 hover:text-green-500/50'}`}
                  >
                    <Trophy size={20} /> {lang === 'es' ? 'Victoria' : 'Win'}
                  </button>
                  <button 
                    onClick={() => setMatchResult('loss')}
                    className={`flex-1 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 border-2 transition-all ${matchResult === 'loss' ? 'bg-red-500/20 text-red-400 border-red-500 scale-[1.02] shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-[#111] text-white/40 border-white/5 hover:border-red-500/50 hover:text-red-500/50'}`}
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
                    onClick={openLeaderSearch}
                    className="w-44 aspect-[2.5/3.5] bg-[#111] border-2 border-dashed border-white/20 hover:border-purple-500 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden group shadow-xl"
                  >
                    {myLeaderId ? (
                      <>
                        <img 
                          src={formatCardImageUrl(cards.find(c => c.id === myLeaderId)?.imageUrl)} 
                          alt="Leader" 
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

                  {myLeaderId && (
                    <div className="mt-2 text-center">
                      <p className="text-xs font-bold text-purple-300 truncate max-w-[220px]">
                        {cards.find(c => c.id === myLeaderId)?.name || myLeaderId}
                      </p>
                      <span className="text-[10px] font-mono text-white/40">
                        {cards.find(c => c.id === myLeaderId)?.cardNumber || ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-white/10 bg-black/20">
              <button 
                onClick={handleReportMatch}
                disabled={isSubmitting}
                className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle size={20} />
                )}
                {isSubmitting 
                  ? (lang === 'es' ? 'Guardando...' : 'Saving...') 
                  : (lang === 'es' ? 'Guardar Resultado' : 'Save Result')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leader Search Modal - Styled like Wants list & Tracker search */}
      {isLeaderSearchOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151515] border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center flex-shrink-0 bg-black/30">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span className="text-orange-400">🛡️</span>
                  {lang === 'es' ? 'Seleccionar Líder' : 'Select Leader'}
                </h3>
                <p className="text-xs text-white/40 mt-0.5">
                  {lang === 'es' ? 'Solo líderes oficiales (sin cartas Z-Líder)' : 'Standard leaders only (excluding Z-Leaders)'}
                </p>
              </div>
              <button 
                onClick={() => setIsLeaderSearchOpen(false)} 
                className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-white/50 transition-colors"
                title={lang === 'es' ? 'Cerrar' : 'Close'}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Filters Bar */}
            <div className="p-4 flex flex-col gap-3 flex-shrink-0 border-b border-white/5 bg-black/20">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text"
                  placeholder={lang === 'es' ? 'Buscar líder por nombre o código (ej. BT1-001, Goku)...' : 'Search leader by name or code (e.g. BT1-001, Goku)...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-[#111] border border-white/10 rounded-2xl py-3 pl-11 pr-10 text-white text-sm font-bold placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
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
                    onClick={() => setSearchColor(color)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      searchColor === color 
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Card Catalog Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-thin scrollbar-thumb-white/10">
              {(() => {
                const filteredLeaders = cards.filter(c => 
                  isOnlyLeaderCard(c) && 
                  (searchColor === 'Todos' || c.color === searchColor || c.color?.toLowerCase()?.includes(searchColor.toLowerCase())) &&
                  (c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.cardNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || c.id?.toLowerCase().includes(searchQuery.toLowerCase()))
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
                          onClick={() => selectLeader(card.id)}
                          className="bg-[#121212] border border-white/10 hover:border-orange-500 rounded-2xl p-2.5 relative overflow-hidden transition-all flex flex-col group/card cursor-pointer select-none hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 active:scale-[0.98]"
                        >
                          {/* Minimum height aspect container matching wants list search */}
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

                          {/* Info below image */}
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
