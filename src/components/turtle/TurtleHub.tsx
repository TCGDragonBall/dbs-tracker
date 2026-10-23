import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { ArrowLeft, Trophy, Calendar, CheckCircle, Info, BookOpen, Shield, Plus, Users, Package, Trash2, ExternalLink, X } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { CreateEventModal } from './CreateEventModal';
import { TurtleEventAdminView } from './TurtleEventAdminView';
import { TurtlePlayerMatchesView } from './TurtlePlayerMatchesView';
import { TurtleHubStandingsView } from './TurtleHubStandingsView';
import { TurtlePlayerProfileView } from './TurtlePlayerProfileView';
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
  
  const [activeTab, setActiveTab] = useState<'tournaments' | 'leagues' | 'matches' | 'standings' | 'rules' | 'profile'>('tournaments');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [adminViewEventId, setAdminViewEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<TurtleEvent[]>([]);
  const [registrations, setRegistrations] = useState<TurtleRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventToDelete, setEventToDelete] = useState<TurtleEvent | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [paypalModalEvent, setPaypalModalEvent] = useState<TurtleEvent | null>(null);

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

  const handleEnroll = async (event: TurtleEvent) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'ts_registrations'), {
        userId: user.uid,
        eventId: event.id,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      // Open PayPal payment dialog immediately upon enrolling
      setPaypalModalEvent(event);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ts_registrations');
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete || isDeletingEvent) return;
    setIsDeletingEvent(true);
    try {
      // 1. Delete all matches of this event
      const matchesSnap = await getDocs(query(collection(db, 'ts_matches'), where('eventId', '==', eventToDelete.id)));
      const matchDeletes = matchesSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(matchDeletes);

      // 2. Delete all registrations of this event
      const regsSnap = await getDocs(query(collection(db, 'ts_registrations'), where('eventId', '==', eventToDelete.id)));
      const regDeletes = regsSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(regDeletes);

      // 3. Delete event document
      await deleteDoc(doc(db, 'ts_tournaments', eventToDelete.id));

      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      handleFirestoreError(error, OperationType.DELETE, 'ts_tournaments');
      alert(lang === 'es' ? 'Error al eliminar el evento.' : 'Error deleting event.');
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const renderEventCard = (event: TurtleEvent) => {
    const isEnrolled = registrations.find(r => r.eventId === event.id);

    return (
      <div key={event.id} className="p-5 bg-black/40 border border-white/10 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group hover:border-green-500/30 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${event.status === 'open' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
              {event.status === 'open' ? (lang === 'es' ? 'Abierto' : 'Open') : (lang === 'es' ? 'Cerrado' : 'Closed')}
            </span>
            <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-1 rounded uppercase">
              {event.gameFormat === 'masters' ? 'Masters' : 'Fusion World'}
            </span>
            <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-1 rounded uppercase">
              {event.type === 'tournament' 
                ? (event.structure === 'swiss' ? 'Suizo' : 'Suizo + Top')
                : (event.groups && event.groups.length > 0
                    ? `${event.groups.length} ${lang === 'es' ? 'Grupos' : 'Groups'}`
                    : 'Grupos')}
            </span>
          </div>
          <h4 className="text-xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">{event.name}</h4>
          <p className="text-sm text-gray-400 mb-2">{event.description}</p>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> 
              {event.startDate} {event.startTime ? ` ${event.startTime}` : ''}
            </span>
            {event.entryFee > 0 && (
              <span className="flex items-center gap-1.5 text-yellow-500">
                <span>🏆 {event.entryFee}€</span>
                <a
                  href="https://www.paypal.biz/montalfan"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-[#3b82f6] hover:text-[#60a5fa] underline flex items-center gap-0.5 ml-0.5 font-normal"
                  title="PayPal: https://www.paypal.biz/montalfan"
                >
                  <span>PayPal</span>
                  <ExternalLink size={10} />
                </a>
              </span>
            )}
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-2">
          {isEnrolled ? (
            <div className="flex flex-col gap-2 w-full md:w-auto">
              {(() => {
                const userGroupName = isEnrolled.groupName || event.groups?.find(g => g.playerIds.includes(isEnrolled.userId))?.name;
                return (
                  <div className={`px-4 py-2.5 rounded-xl text-center font-bold text-sm border ${
                    isEnrolled.status === 'paid' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                  }`}>
                    <div>
                      {isEnrolled.status === 'paid' 
                        ? (lang === 'es' ? '✅ Inscrito (Pagado)' : '✅ Enrolled (Paid)')
                        : (lang === 'es' ? '⏳ Inscrito (Falta pago)' : '⏳ Enrolled (Pending payment)')}
                    </div>
                    {userGroupName && (
                      <div className="text-xs text-emerald-300 font-extrabold mt-1">
                        {userGroupName}
                      </div>
                    )}
                  </div>
                );
              })()}

              {isEnrolled.status !== 'paid' && (
                <div className="flex flex-col gap-1 w-full md:w-auto">
                  <a 
                    href="https://www.paypal.biz/montalfan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2.5 bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(0,112,186,0.35)] active:scale-95 flex items-center justify-center gap-2"
                    title="PayPal: https://www.paypal.biz/montalfan"
                  >
                    <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.78.78 0 0 1 .77-.642h7.054c3.42 0 5.86 1.442 5.568 5.166-.254 3.238-2.298 5.093-5.26 5.093h-2.18l-1.04 6.643a.643.643 0 0 1-.634.544l-2.146.813z" />
                    </svg>
                    <span>{lang === 'es' ? 'Pagar con PayPal' : 'Pay with PayPal'}</span>
                    <ExternalLink size={13} className="shrink-0" />
                  </a>
                  <button
                    onClick={() => setPaypalModalEvent(event)}
                    className="text-[11px] text-gray-400 hover:text-white underline text-center py-0.5"
                  >
                    {lang === 'es' ? 'Ver detalles del pago' : 'View payment info'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            event.status === 'open' && (
              <button 
                onClick={() => handleEnroll(event)}
                className="w-full md:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
              >
                <span>{lang === 'es' ? 'Inscribirme' : 'Enroll'}</span>
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

          {isTurtleAdmin && (
            <button 
              onClick={() => setEventToDelete(event)}
              className="w-full md:w-auto px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold text-xs rounded-xl transition-colors border border-red-500/20 flex items-center justify-center gap-1.5"
              title={lang === 'es' ? 'Eliminar evento' : 'Delete event'}
            >
              <Trash2 size={13} />
              <span>{lang === 'es' ? 'Eliminar' : 'Delete'}</span>
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
      shippingProfile: 'Mis Datos de Envío',
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
      shippingProfile: 'Shipping Profile',
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
        cards={cards}
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
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all flex-shrink-0 ${activeTab === 'profile' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
        >
          <Package size={18} /> {strings.shippingProfile}
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
          <TurtleHubStandingsView
            events={events}
            lang={lang}
            isTurtleAdmin={isTurtleAdmin}
            cards={cards}
            onOpenEventView={(eId) => setAdminViewEventId(eId)}
          />
        )}

        {activeTab === 'profile' && (
          <TurtlePlayerProfileView user={user} lang={lang} />
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

      {/* Delete Event Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151515] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {lang === 'es' ? (eventToDelete.type === 'league' ? '¿Eliminar Liga?' : '¿Eliminar Torneo?') : 'Delete Event?'}
                </h3>
                <p className="text-xs text-white/50">{eventToDelete.name}</p>
              </div>
            </div>

            <p className="text-sm text-white/70 leading-relaxed">
              {lang === 'es' 
                ? `¿Estás seguro de que deseas eliminar permanentemente "${eventToDelete.name}" (${eventToDelete.type === 'league' ? 'Liga' : 'Torneo'})? Esta acción borrará todas sus partidas e inscripciones y no se puede deshacer.` 
                : `Are you sure you want to permanently delete "${eventToDelete.name}" (${eventToDelete.type === 'league' ? 'League' : 'Tournament'})? All its matches and registrations will also be deleted. This action cannot be undone.`}
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
              <button
                onClick={() => setEventToDelete(null)}
                disabled={isDeletingEvent}
                className="px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 font-bold transition-colors text-sm"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={isDeletingEvent}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all text-sm flex items-center gap-2"
              >
                {isDeletingEvent ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {isDeletingEvent 
                  ? (lang === 'es' ? 'Eliminando...' : 'Deleting...') 
                  : (lang === 'es' ? 'Eliminar Definitivamente' : 'Delete Permanently')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Registration Payment Modal */}
      {paypalModalEvent && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#161618] border border-[#0070BA]/40 w-full max-w-md rounded-3xl p-6 shadow-[0_0_50px_rgba(0,112,186,0.3)] flex flex-col gap-4 relative">
            <button
              onClick={() => setPaypalModalEvent(null)}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title={lang === 'es' ? 'Cerrar' : 'Close'}
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-[#0070BA]/20 border border-[#0070BA]/40 flex items-center justify-center text-[#0070BA] shadow-[0_0_15px_rgba(0,112,186,0.3)] shrink-0">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.78.78 0 0 1 .77-.642h7.054c3.42 0 5.86 1.442 5.568 5.166-.254 3.238-2.298 5.093-5.26 5.093h-2.18l-1.04 6.643a.643.643 0 0 1-.634.544l-2.146.813z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                  {lang === 'es' ? '¡Inscripción Registrada!' : 'Enrollment Registered!'}
                </span>
                <h3 className="text-lg font-black text-white mt-1 leading-tight">
                  {paypalModalEvent.name}
                </h3>
              </div>
            </div>

            {paypalModalEvent.entryFee > 0 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/25 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-bold text-yellow-300/80 uppercase">
                  {lang === 'es' ? 'Cuota de inscripción' : 'Entry Fee'}
                </span>
                <span className="text-xl font-black text-yellow-400">
                  {paypalModalEvent.entryFee} €
                </span>
              </div>
            )}

            <p className="text-sm text-gray-300 leading-relaxed">
              {lang === 'es'
                ? 'Para formalizar tu plaza y completar la inscripción, accede al siguiente enlace directo a nuestro perfil de PayPal y realiza el pago de la cuota:'
                : 'To confirm your spot and complete your registration, access the direct link below to our PayPal profile and submit the fee payment:'}
            </p>

            <a
              href="https://www.paypal.biz/montalfan"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[#0070BA] to-[#003087] hover:from-[#005ea6] hover:to-[#00266e] text-white font-black text-base rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,112,186,0.45)] transition-all transform hover:scale-[1.02] active:scale-95 border border-blue-400/30"
            >
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.78.78 0 0 1 .77-.642h7.054c3.42 0 5.86 1.442 5.568 5.166-.254 3.238-2.298 5.093-5.26 5.093h-2.18l-1.04 6.643a.643.643 0 0 1-.634.544l-2.146.813z" />
              </svg>
              <span>{lang === 'es' ? 'Pagar con PayPal (@montalfan)' : 'Pay with PayPal (@montalfan)'}</span>
              <ExternalLink size={18} className="shrink-0" />
            </a>

            <div className="text-[11px] text-gray-400 bg-black/40 border border-white/5 rounded-2xl p-3.5 flex flex-col gap-1.5">
              <p className="font-semibold text-gray-200">
                💡 {lang === 'es' ? 'Instrucciones del pago:' : 'Payment instructions:'}
              </p>
              <p>
                {lang === 'es'
                  ? 'Recuerda indicar tu nombre de jugador o usuario en el concepto de PayPal. Una vez recibido el importe, la administración marcará tu plaza como Pagada.'
                  : 'Please include your player name or app account in the PayPal note. Once received, the admins will mark your registration as Paid.'}
              </p>
              <div className="pt-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">
                  {lang === 'es' ? 'Enlace directo de PayPal' : 'Direct PayPal link'}:
                </span>
                <a
                  href="https://www.paypal.biz/montalfan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline font-mono text-xs break-all"
                >
                  https://www.paypal.biz/montalfan
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setPaypalModalEvent(null)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-colors text-sm"
              >
                {lang === 'es' ? 'Entendido / Continuar' : 'Got it / Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
