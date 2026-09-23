import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Clock, User as UserIcon, AlertCircle, Trash2, Play } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, deleteDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { TurtleEvent, TurtleRegistration } from './types';
import { generateSwissRound1, generateRoundRobinMatches, saveMatchesToFirestore } from './tournamentEngine';
import { TurtleEventActiveAdmin } from './TurtleEventActiveAdmin';

interface TurtleEventAdminViewProps {
  eventId: string;
  onBack: () => void;
  lang: 'es' | 'en';
  currentUserUid: string;
  isTurtleAdmin: boolean;
  onGoToMatches: () => void;
  cards?: any[];
}

export const TurtleEventAdminView: React.FC<TurtleEventAdminViewProps> = ({ 
  eventId, 
  onBack, 
  lang,
  currentUserUid,
  isTurtleAdmin,
  onGoToMatches,
  cards = []
}) => {
  const [event, setEvent] = useState<TurtleEvent | null>(null);
  const [registrations, setRegistrations] = useState<TurtleRegistration[]>([]);
  const [usersInfo, setUsersInfo] = useState<Record<string, { displayName: string; email: string }>>({});
  const [loading, setLoading] = useState(true);

  // Fetch event details
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'ts_tournaments', eventId), (docSnap) => {
      if (docSnap.exists()) {
        setEvent({ id: docSnap.id, ...docSnap.data() } as TurtleEvent);
      }
    });
    return () => unsubscribe();
  }, [eventId]);

  // Fetch registrations and users
  useEffect(() => {
    const q = query(collection(db, 'ts_registrations'), where('eventId', '==', eventId));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedRegs: TurtleRegistration[] = [];
      const userIds = new Set<string>();

      snapshot.forEach((doc) => {
        const data = doc.data() as TurtleRegistration;
        fetchedRegs.push({ id: doc.id, ...data });
        userIds.add(data.userId);
      });

      setRegistrations(fetchedRegs);

      // Fetch users info for all registered users (could be optimized, but works for admin view)
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData: Record<string, { displayName: string; email: string }> = {};
        usersSnapshot.forEach(userDoc => {
          if (userIds.has(userDoc.id)) {
            const data = userDoc.data();
            usersData[userDoc.id] = {
              displayName: data.displayName || 'Unknown',
              email: data.email || 'No email'
            };
          }
        });
        setUsersInfo(usersData);
      } catch (err) {
        console.error("Error fetching users:", err);
      }

      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'ts_registrations');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  const handleTogglePayment = async (regId: string, currentStatus: string, isBot?: boolean) => {
    if (!event) return;
    try {
      if (isBot) {
        const botPlayers = [...(event.botPlayers || [])];
        const botIndex = botPlayers.findIndex(b => b.userId === regId);
        if (botIndex !== -1) {
          botPlayers[botIndex].status = currentStatus === 'paid' ? 'pending' : 'paid';
          await updateDoc(doc(db, 'ts_tournaments', event.id), { botPlayers });
        }
      } else {
        await updateDoc(doc(db, 'ts_registrations', regId), {
          status: currentStatus === 'paid' ? 'pending' : 'paid'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, isBot ? 'ts_tournaments' : 'ts_registrations');
    }
  };

  const handleRemoveRegistration = async (regId: string, isBot?: boolean) => {
    if (!event) return;
    if (window.confirm(lang === 'es' ? '¿Seguro que quieres eliminar esta inscripción?' : 'Are you sure you want to remove this registration?')) {
      try {
        if (isBot) {
          const botPlayers = (event.botPlayers || []).filter(b => b.userId !== regId);
          await updateDoc(doc(db, 'ts_tournaments', event.id), { botPlayers });
        } else {
          await deleteDoc(doc(db, 'ts_registrations', regId));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, isBot ? 'ts_tournaments' : 'ts_registrations');
      }
    }
  };

  const [isStarting, setIsStarting] = useState(false);
  const [isAddingBots, setIsAddingBots] = useState(false);
  const [showConfirmStart, setShowConfirmStart] = useState(false);

  const handleAddBots = async () => {
    if (!event) return;
    try {
      setIsAddingBots(true);
      const botNames = ['Goku (Bot)', 'Vegeta (Bot)', 'Piccolo (Bot)', 'Krillin (Bot)', 'Gohan (Bot)', 'Trunks (Bot)', 'Frieza (Bot)'];
      
      const newBots = [];
      for (let i = 0; i < 7; i++) {
        const botId = `bot_${Date.now()}_${i}`;
        newBots.push({
          userId: botId,
          displayName: botNames[i],
          status: 'paid'
        });
      }
      
      const currentBots = event.botPlayers || [];
      await updateDoc(doc(db, 'ts_tournaments', event.id), {
        botPlayers: [...currentBots, ...newBots]
      });
      
      alert(lang === 'es' ? '7 bots añadidos correctamente.' : '7 bots added successfully.');
    } catch (error) {
      console.error(error);
      alert(lang === 'es' ? 'Error al añadir bots. Comprueba las reglas de Firebase.' : 'Error adding bots. Check Firebase rules.');
    } finally {
      setIsAddingBots(false);
    }
  };

  const handleStartEventClick = () => {
    const realPaid = registrations.filter(r => r.status === 'paid').map(r => r.userId);
    const botPaid = (event?.botPlayers || []).filter(b => b.status === 'paid').map(b => b.userId);
    const paidPlayers = [...realPaid, ...botPaid];
    
    if (paidPlayers.length < 2) {
      alert(lang === 'es' ? 'Se necesitan al menos 2 jugadores pagados para comenzar.' : 'At least 2 paid players are required to start.');
      return;
    }
    
    setShowConfirmStart(true);
  };

  const handleStartEvent = async () => {
    if (!event) return;
    const realPaid = registrations.filter(r => r.status === 'paid').map(r => r.userId);
    const botPaid = (event.botPlayers || []).filter(b => b.status === 'paid').map(b => b.userId);
    const paidPlayers = [...realPaid, ...botPaid];
    
    setShowConfirmStart(false);
    
    try {
      setIsStarting(true);
      let matches = [];
      
      console.log('Generating matches for:', event.type, paidPlayers.length, 'players');
      
      if (event.type === 'league') {
        matches = await generateRoundRobinMatches(event.id, paidPlayers);
      } else {
        matches = await generateSwissRound1(event.id, paidPlayers);
      }
      
      console.log('Matches generated:', matches.length);
      
      await saveMatchesToFirestore(matches);
      console.log('Matches saved');
      
      // Update event status
      await updateDoc(doc(db, 'ts_tournaments', event.id), {
        status: 'ongoing'
      });
      console.log('Event status updated to ongoing');
      
    } catch (error) {
      console.error('Error starting event:', error);
      handleFirestoreError(error, OperationType.UPDATE, 'ts_tournaments');
      alert(lang === 'es' ? 'Error al iniciar el evento.' : 'Error starting event.');
    } finally {
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500/50 mb-4" />
        <p className="text-white">{lang === 'es' ? 'Evento no encontrado' : 'Event not found'}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-white/10 rounded-xl text-white">
          {lang === 'es' ? 'Volver' : 'Back'}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 shadow-lg text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">
              {event.name}
            </h2>
            <p className="text-gray-400 font-bold">
              {lang === 'es' ? 'Gestión de Inscritos' : 'Enrollment Management'} • {registrations.length} {lang === 'es' ? 'jugadores' : 'players'}
            </p>
          </div>
        </div>
        
        {event.status === 'open' && isTurtleAdmin && (
          <div className="flex gap-2">
            <button
              onClick={handleAddBots}
              disabled={isAddingBots}
              className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all shadow-lg ${
                isAddingBots 
                  ? 'bg-blue-500/50 text-white/50 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white active:scale-95'
              }`}
            >
              {isAddingBots ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                <UserIcon size={18} />
              )}
              {lang === 'es' ? 'Añadir 7 Bots' : 'Add 7 Bots'}
            </button>
            <button
              onClick={handleStartEventClick}
            disabled={isStarting}
            className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] ${
              isStarting 
                ? 'bg-green-500/50 text-white/50 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white active:scale-95'
            }`}
          >
            {isStarting ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              <Play size={18} className="fill-current" />
            )}
            {lang === 'es' 
              ? (event.type === 'league' ? 'Iniciar Liga' : 'Iniciar Torneo') 
              : (event.type === 'league' ? 'Start League' : 'Start Tournament')
            }
          </button>
          </div>
        )}
      </div>

      {event.status === 'open' ? (
        <div className="bg-[#151515] rounded-3xl p-6 border border-white/5 shadow-2xl">
          {(registrations.length === 0 && (!event?.botPlayers || event.botPlayers.length === 0)) ? (
            <div className="text-center py-12 text-gray-500">
              {lang === 'es' ? 'Aún no hay inscritos en este evento.' : 'No players enrolled yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pl-4">{lang === 'es' ? 'Jugador' : 'Player'}</th>
                    <th className="pb-3 text-center">{lang === 'es' ? 'Estado Pago' : 'Payment Status'}</th>
                    <th className="pb-3 text-right pr-4">{lang === 'es' ? 'Acciones' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[...registrations, ...(event?.botPlayers || []).map(b => ({ id: b.userId, userId: b.userId, status: b.status, isBot: true, displayName: b.displayName }))].map(reg => {
                    const user = (reg as any).isBot ? { displayName: (reg as any).displayName, email: 'bot@capsulecorp.com' } : usersInfo[reg.userId];
                    const isPaid = reg.status === 'paid';

                    return (
                      <tr key={reg.id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                              <UserIcon size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-white">{user?.displayName || 'Unknown User'}</p>
                              <p className="text-xs text-gray-400">{user?.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleTogglePayment(reg.id, reg.status, (reg as any).isBot)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                isPaid 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' 
                                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                              }`}
                            >
                              {isPaid ? (
                                <>
                                  <Check size={14} /> {lang === 'es' ? 'Pagado' : 'Paid'}
                                </>
                              ) : (
                                <>
                                  <Clock size={14} /> {lang === 'es' ? 'Pendiente' : 'Pending'}
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-right pr-4">
                          <button
                            onClick={() => handleRemoveRegistration(reg.id, (reg as any).isBot)}
                            className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title={lang === 'es' ? 'Eliminar inscripción' : 'Remove registration'}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <TurtleEventActiveAdmin 
          event={event} 
          registrations={registrations} 
          usersInfo={usersInfo} 
          lang={lang}
          isTurtleAdmin={isTurtleAdmin}
          currentUserUid={currentUserUid}
          onGoToMatches={onGoToMatches}
          cards={cards}
        />
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmStart && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151515] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
            <h3 className="text-xl font-black text-white">
              {lang === 'es' ? '¿Iniciar Evento?' : 'Start Event?'}
            </h3>
            <p className="text-white/70">
              {lang === 'es'
                ? `¿Seguro que quieres iniciar el evento? Se cerrarán las inscripciones y se generarán los emparejamientos.`
                : `Are you sure you want to start the event? Registrations will close and matches will be generated.`}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirmStart(false)}
                className="px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 font-bold transition-colors"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button 
                onClick={handleStartEvent}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl shadow-lg transition-colors"
              >
                {lang === 'es' ? 'Iniciar' : 'Start'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
