import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { ArrowLeft, Trophy, Calendar, CheckCircle, Info, BookOpen, Shield, Plus, Users } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { CreateEventModal } from './CreateEventModal';
import { TurtleEventAdminView } from './TurtleEventAdminView';
import { TurtlePlayerMatchesView } from './TurtlePlayerMatchesView';
import { TurtleEvent, TurtleRegistration } from './types';

interface TurtleHubProps {
  onBack: () => void;
  lang: 'es' | 'en';
  cards: any[];
}

export const TurtleHub: React.FC<TurtleHubProps> = ({ onBack, lang, cards }) => {
  const { user } = useAuth();
  
  // Basic check for Turtle Admin
  const isTurtleAdmin = user?.email === 'anulix1983@gmail.com' || user?.email === 'sadsa.0170@gmail.com';
  
  const [activeTab, setActiveTab] = useState<'tournaments' | 'leagues' | 'matches' | 'standings' | 'rules'>('tournaments');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [adminViewEventId, setAdminViewEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<TurtleEvent[]>([]);
  const [registrations, setRegistrations] = useState<TurtleRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events
  useEffect(() => {
    if (!user || !user.uid) {
      return;
    }
    const q = query(collection(db, 'ts_tournaments'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents: TurtleEvent[] = [];
      snapshot.forEach((doc) => {
        fetchedEvents.push({ id: doc.id, ...doc.data() } as TurtleEvent);
      });
      // Sort in memory to avoid Firestore index/timestamp issues
      fetchedEvents.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setEvents(fetchedEvents);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'ts_tournaments');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch user registrations
  useEffect(() => {
    if (!user || !user.uid) return;
    const q = query(collection(db, 'ts_registrations'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRegs: TurtleRegistration[] = [];
      snapshot.forEach((doc) => {
        fetchedRegs.push({ id: doc.id, ...doc.data() } as TurtleRegistration);
      });
      setRegistrations(fetchedRegs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'ts_registrations');
    });

    return () => unsubscribe();
  }, [user]);

  const handleEnroll = async (eventId: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'ts_registrations'), {
        userId: user.uid,
        eventId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ts_registrations');
    }
  };

  const renderEventCard = (event: TurtleEvent) => {
    const isEnrolled = registrations.find(r => r.eventId === event.id);

    return (
      <div key={event.id} className="p-5 bg-black/40 border border-white/10 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group hover:border-green-500/30 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${event.status === 'open' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
              {event.status === 'open' ? (lang === 'es' ? 'Abierto' : 'Open') : (lang === 'es' ? 'Cerrado' : 'Closed')}
            </span>
            <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-1 rounded uppercase">
              {event.gameFormat === 'masters' ? 'Masters' : 'Fusion World'}
            </span>
            <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-1 rounded uppercase">
              {event.type === 'tournament' 
                ? (event.structure === 'swiss' ? 'Suizo' : 'Suizo + Top')
                : 'Grupos'}
            </span>
          </div>
          <h4 className="text-xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">{event.name}</h4>
          <p className="text-sm text-gray-400 mb-2">{event.description}</p>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> 
              {event.startDate} {event.startTime ? ` ${event.startTime}` : ''}
            </span>
            {event.entryFee > 0 && <span className="flex items-center gap-1 text-yellow-500">🏆 {event.entryFee}€</span>}
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col gap-2">
          {isEnrolled ? (
            <div className={`px-4 py-3 rounded-xl text-center font-bold text-sm border ${
              isEnrolled.status === 'paid' 
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
            }`}>
              {isEnrolled.status === 'paid' 
                ? (lang === 'es' ? '✅ Inscrito (Pagado)' : '✅ Enrolled (Paid)')
                : (lang === 'es' ? '⏳ Inscrito (Falta pago)' : '⏳ Enrolled (Pending payment)')}
            </div>
          ) : (
            event.status === 'open' && (
              <button 
                onClick={() => handleEnroll(event.id)}
                className="w-full md:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                {lang === 'es' ? 'Inscribirme' : 'Enroll'}
              </button>
            )
          )}
          
          {(isTurtleAdmin || event.status === 'ongoing' || event.status === 'completed') && (
            <button 
              onClick={() => setAdminViewEventId(event.id)}
              className="w-full md:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-2"
            >
              {(isTurtleAdmin && event.status === 'open') ? (
                <><Users size={14} /> {lang === 'es' ? 'Gestionar' : 'Manage'}</>
              ) : (
                <><Trophy size={14} /> {lang === 'es' ? 'Ver Evento' : 'View Event'}</>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const t = {
    es: {
      hubTitle: 'Turtle School Hub',
      tournaments: 'Torneos',
      leagues: 'Ligas',
      matches: 'Mis Partidas',
      standings: 'Clasificación',
      rules: 'Reglas',
      adminPanel: 'Panel de Administrador',
      comingSoon: 'Próximamente...',
      rulesContent: 'La normativa de la Turtle School se publicará aquí pronto. Respeta a los demás jugadores y diviértete.'
    },
    en: {
      hubTitle: 'Turtle School Hub',
      tournaments: 'Tournaments',
      leagues: 'Leagues',
      matches: 'My Matches',
      standings: 'Standings',
      rules: 'Rules',
      adminPanel: 'Admin Panel',
      comingSoon: 'Coming soon...',
      rulesContent: 'The Turtle School rules will be published here soon. Respect other players and have fun.'
    }
  };

  const strings = t[lang];
  
  if (adminViewEventId) {
    return (
      <TurtleEventAdminView 
        eventId={adminViewEventId}
        lang={lang}
        onBack={() => setAdminViewEventId(null)}
        currentUserUid={user?.uid || ''}
        isTurtleAdmin={isTurtleAdmin}
        onGoToMatches={() => {
          setAdminViewEventId(null);
          setActiveTab('matches');
        }}
      />
    );
  }

  return (
    <div className="w-full pb-20 animate-fade-in relative mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 relative">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 shadow-lg text-white group relative z-10"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex-1 text-center relative z-10 mr-12">
          <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] uppercase italic tracking-tight">
            {strings.hubTitle} 🐢
          </h2>
        </div>
      </div>

      {isTurtleAdmin && (
        <div className="mb-6 p-4 bg-emerald-900/40 border border-emerald-500/50 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <h3 className="text-emerald-400 font-bold">{strings.adminPanel}</h3>
              <p className="text-emerald-400/70 text-xs">Modo Administrador activado</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nuevo Evento</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('tournaments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all flex-shrink-0 ${activeTab === 'tournaments' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
        >
          <Trophy size={18} /> {strings.tournaments}
        </button>
        <button 
          onClick={() => setActiveTab('leagues')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all flex-shrink-0 ${activeTab === 'leagues' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
        >
          <Shield size={18} /> {strings.leagues}
        </button>
        <button 
          onClick={() => setActiveTab('matches')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all flex-shrink-0 ${activeTab === 'matches' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
        >
          <Calendar size={18} /> {strings.matches}
        </button>
        <button 
          onClick={() => setActiveTab('standings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all flex-shrink-0 ${activeTab === 'standings' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
        >
          <CheckCircle size={18} /> {strings.standings}
        </button>
        <button 
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all flex-shrink-0 ${activeTab === 'rules' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
        >
          <BookOpen size={18} /> {strings.rules}
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-[#151515] rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden min-h-[400px]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-20"></div>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'tournaments' && (
              <div className="space-y-4">
                {events.filter(e => e.type === 'tournament').length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy size={48} className="mx-auto text-green-500/20 mb-4" />
                    <p className="text-gray-500">{lang === 'es' ? 'No hay torneos activos' : 'No active tournaments'}</p>
                  </div>
                ) : (
                  events.filter(e => e.type === 'tournament').map(renderEventCard)
                )}
              </div>
            )}

            {activeTab === 'leagues' && (
              <div className="space-y-4">
                {events.filter(e => e.type === 'league').length === 0 ? (
                  <div className="text-center py-12">
                    <Shield size={48} className="mx-auto text-green-500/20 mb-4" />
                    <p className="text-gray-500">{lang === 'es' ? 'No hay ligas activas' : 'No active leagues'}</p>
                  </div>
                ) : (
                  events.filter(e => e.type === 'league').map(renderEventCard)
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'matches' && (
          <TurtlePlayerMatchesView userUid={user?.uid || ''} lang={lang} cards={cards} />
        )}

        {activeTab === 'standings' && (
          <div className="text-center py-12">
            <CheckCircle size={48} className="mx-auto text-green-500/50 mb-4" />
            <p className="text-gray-400">{strings.comingSoon}</p>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="text-center py-12">
            <Info size={48} className="mx-auto text-green-500/50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{strings.rules}</h3>
            <p className="text-gray-400 max-w-md mx-auto">{strings.rulesContent}</p>
          </div>
        )}
      </div>

      <CreateEventModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        lang={lang} 
      />
    </div>
  );
};
