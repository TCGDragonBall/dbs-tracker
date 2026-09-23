import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { TurtleEvent, TurtleMatch, TurtleRegistration } from './types';
import { TurtleStandingsTable } from './TurtleStandingsTable';
import { Trophy, Shield, ChevronRight, Calendar } from 'lucide-react';

interface Props {
  events: TurtleEvent[];
  lang: 'es' | 'en';
  isTurtleAdmin: boolean;
  cards: any[];
  onOpenEventView: (eventId: string) => void;
}

export const TurtleHubStandingsView: React.FC<Props> = ({
  events,
  lang,
  isTurtleAdmin,
  cards,
  onOpenEventView
}) => {
  // Find default event: prefer ongoing or completed leagues/tournaments
  const eligibleEvents = events.filter(e => e.status === 'ongoing' || e.status === 'completed' || e.status === 'open');
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    const ongoingLeague = events.find(e => e.status === 'ongoing' && e.type === 'league');
    if (ongoingLeague) return ongoingLeague.id;
    const ongoingEvent = events.find(e => e.status === 'ongoing');
    if (ongoingEvent) return ongoingEvent.id;
    const completedEvent = events.find(e => e.status === 'completed');
    if (completedEvent) return completedEvent.id;
    return events[0]?.id || '';
  });

  const [matches, setMatches] = useState<TurtleMatch[]>([]);
  const [registrations, setRegistrations] = useState<TurtleRegistration[]>([]);
  const [usersInfo, setUsersInfo] = useState<Record<string, { displayName: string; email?: string }>>({});
  const [loading, setLoading] = useState(false);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  useEffect(() => {
    if (!selectedEventId) return;

    setLoading(true);

    // Fetch matches for event
    const qMatches = query(collection(db, 'ts_matches'), where('eventId', '==', selectedEventId));
    const unsubMatches = onSnapshot(qMatches, (snapshot) => {
      const list: TurtleMatch[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as TurtleMatch));
      setMatches(list);
    });

    // Fetch registrations for event
    const qRegs = query(collection(db, 'ts_registrations'), where('eventId', '==', selectedEventId));
    const unsubRegs = onSnapshot(qRegs, async (snapshot) => {
      const regs: TurtleRegistration[] = [];
      const userIds = new Set<string>();

      snapshot.forEach(d => {
        const reg = { id: d.id, ...d.data() } as TurtleRegistration;
        regs.push(reg);
        userIds.add(reg.userId);
      });

      setRegistrations(regs);

      // Fetch user display names
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const uInfo: Record<string, { displayName: string; email?: string }> = {};
        usersSnap.forEach(docSnap => {
          if (userIds.has(docSnap.id)) {
            const data = docSnap.data();
            uInfo[docSnap.id] = {
              displayName: data.displayName || 'Unknown Player',
              email: data.email
            };
          }
        });
        setUsersInfo(uInfo);
      } catch (err) {
        console.error('Error fetching users info:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubMatches();
      unsubRegs();
    };
  }, [selectedEventId]);

  if (eligibleEvents.length === 0) {
    return (
      <div className="text-center py-16 bg-[#151515] rounded-3xl border border-white/5">
        <Trophy size={48} className="mx-auto text-yellow-500/30 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          {lang === 'es' ? 'No hay ligas o torneos disponibles' : 'No leagues or tournaments available'}
        </h3>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          {lang === 'es' 
            ? 'Crea un torneo o liga en el panel para ver la clasificación aquí.' 
            : 'Create a tournament or league in the panel to view standings here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Selector Header */}
      <div className="bg-[#151515] rounded-3xl p-5 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-2xl border border-yellow-500/30">
            <Trophy size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-green-400 tracking-wider">
              {lang === 'es' ? 'Clasificación de Eventos' : 'Event Standings'}
            </span>
            <h2 className="text-xl font-black text-white uppercase italic">
              {selectedEvent?.name || (lang === 'es' ? 'Selecciona un Evento' : 'Select an Event')}
            </h2>
          </div>
        </div>

        {/* Event Selector Tabs / Pills */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide">
          {eligibleEvents.map(e => (
            <button
              key={e.id}
              onClick={() => setSelectedEventId(e.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedEventId === e.id
                  ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{e.name}</span>
              <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-black ${
                e.type === 'league' ? 'bg-orange-500/30 text-orange-200' : 'bg-blue-500/30 text-blue-200'
              }`}>
                {e.type === 'league' ? 'Liga' : 'Torneo'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Standings View */}
      {selectedEvent && (
        <div className="space-y-4">
          {/* Quick Action to Event Page */}
          <div className="flex justify-end">
            <button
              onClick={() => onOpenEventView(selectedEvent.id)}
              className="text-xs font-bold text-white/70 hover:text-white flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <span>{lang === 'es' ? 'Ver partidas y gestión del evento' : 'View matches & event dashboard'}</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-8 h-8 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin" />
            </div>
          ) : (
            <TurtleStandingsTable
              event={selectedEvent}
              matches={matches}
              registrations={registrations}
              usersInfo={usersInfo}
              lang={lang}
              isTurtleAdmin={isTurtleAdmin}
              cards={cards}
            />
          )}
        </div>
      )}
    </div>
  );
};
