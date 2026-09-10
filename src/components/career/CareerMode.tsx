import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Swords, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Medal,
  Coins,
  History,
  Link as LinkIcon,
  Trash2,
  BarChart2
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Card {
  id: string;
  name: string;
  color: string;
  imageUrl: string;
  backImageUrl?: string;
  type: string;
  expansion: string;
  cardNumber: string;
  legalStatus?: string;
}

interface InventoryItem {
  cardId: string;
  quantity: number;
}

interface CareerModeProps {
  cards: Card[];
  inventory: InventoryItem[];
  lang: 'es' | 'en';
  userUid?: string;
}

interface MatchRecord {
  result: 'win' | 'loss';
  type: 'test' | 'local' | 'regional';
  date: string;
  opponentLeaderId?: string;
}

interface CareerSlot {
  gameType: 'Masters' | 'Fusion World';
  filter: 'recent' | 'legacy';
  activeLeader: string | null;
  draftedLeaders: string[];
  lockedForMulligan: string[];
  mulliganUsed: boolean;
  discardedLeaders: string[];
  coins: number;
  wins: number;
  losses: number;
  lossStreak: number;
  matches: MatchRecord[];
  graduatedLeaders: string[];
  graduatedRecords?: { id: string, matches: MatchRecord[] }[];
  deckUrl: string;
  status: 'empty' | 'draft' | 'active' | 'market' | 'graduated';
}

const INITIAL_SLOT: CareerSlot = {
  gameType: 'Fusion World',
  filter: 'legacy',
  activeLeader: null,
  draftedLeaders: [],
  lockedForMulligan: [],
  mulliganUsed: false,
  discardedLeaders: [],
  coins: 0,
  wins: 0,
  losses: 0,
  lossStreak: 0,
  matches: [],
  graduatedLeaders: [],
  deckUrl: '',
  status: 'empty'
};

const DEFAULT_DATA = {
  slot1: { ...INITIAL_SLOT },
  slot2: { ...INITIAL_SLOT },
  slot3: { ...INITIAL_SLOT }
};

export const CareerMode: React.FC<CareerModeProps> = ({ cards, inventory, lang, userUid }) => {
  const [careerData, setCareerData] = useState<Record<string, CareerSlot>>(DEFAULT_DATA);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStarMarket, setShowStarMarket] = useState(false);
  const [showReserveMarket, setShowReserveMarket] = useState(false);
  const [confirmReset, setConfirmReset] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [matchType, setMatchType] = useState<'test' | 'local' | 'regional'>('test');
  const [selectedHofRecord, setSelectedHofRecord] = useState<{leader: any, matches: MatchRecord[]} | null>(null);
  const [viewingHofForSlot, setViewingHofForSlot] = useState<string | null>(null);
  const [selectedMatchDetail, setSelectedMatchDetail] = useState<MatchRecord | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsTab, setStatsTab] = useState<'career' | 'current'>('current');

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerResult, setRegisterResult] = useState<'win' | 'loss' | null>(null);
  const [registerMatchType, setRegisterMatchType] = useState<'test' | 'local' | 'regional'>('test');
  const [registerOpponentId, setRegisterOpponentId] = useState<string | null>(null);
  const [isOpponentSearchOpen, setIsOpponentSearchOpen] = useState(false);
  const [opponentSearchQuery, setOpponentSearchQuery] = useState('');
  const [opponentSearchColor, setOpponentSearchColor] = useState('Todos');

  // Load from Firebase
  useEffect(() => {
    if (!userUid) return;
    
    let isMounted = true;
    
    const fetchCareerData = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'users', userUid, 'career', 'data'));
        
        if (!isMounted) return;
        
        if (snapshot.exists()) {
          const data = snapshot.data();
          setCareerData({
            slot1: data.slot1 || { ...INITIAL_SLOT },
            slot2: data.slot2 || { ...INITIAL_SLOT },
            slot3: data.slot3 || { ...INITIAL_SLOT }
          });
        } else {
          // Initialize
          await setDoc(doc(db, 'users', userUid, 'career', 'data'), DEFAULT_DATA, { merge: true });
        }
      } catch (error) {
        console.error("Career getDoc error:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchCareerData();
    
    return () => {
      isMounted = false;
    };
  }, [userUid]);

  const saveSlot = async (slotId: string, data: CareerSlot) => {
    if (!userUid) return;
    setCareerData(prev => ({ ...prev, [slotId]: data }));
    await setDoc(doc(db, 'users', userUid, 'career', 'data'), {
      [slotId]: data
    }, { merge: true });
  };

  const resetSlot = async (slotId: string) => {
    await saveSlot(slotId, { ...INITIAL_SLOT });
    setConfirmReset(null);
  };

  const getOwnedLeaders = (gameType: 'Masters' | 'Fusion World', filter: 'recent' | 'legacy') => {
    return cards.filter(c => {
      const isLeader = c.type === 'Leader' || c.type === 'Leader Card';
      if (!isLeader) return false;
      if (c.legalStatus && c.legalStatus.includes('Banned')) return false;
      
      const isFW = c.cardNumber.startsWith('FS') || c.cardNumber.startsWith('FB') || c.cardNumber.startsWith('FP');
      if (gameType === 'Fusion World' && !isFW) return false;
      if (gameType === 'Masters' && isFW) return false;
      
      if (gameType === 'Masters' && filter === 'recent') {
        const cn = c.cardNumber || '';
        const match = cn.match(/^BT(\d+)-/);
        if (match) {
          if (parseInt(match[1]) < 28) return false;
        } else {
          return false;
        }
      }

      const isOwned = inventory.some(i => i.cardId === c.id && i.quantity > 0);
      if (!isOwned) return false;

      return true;
    });
  };

  const startDraft = async (slotId: string, gameType: 'Masters' | 'Fusion World', filter: 'recent' | 'legacy', costToDeduct = 0) => {
    const existingSlot = careerData[slotId] || INITIAL_SLOT;
    const owned = getOwnedLeaders(gameType, filter).filter(c => !existingSlot.graduatedLeaders.includes(c.id));
    const drafted: string[] = [];
    
    const colors = gameType === 'Fusion World' 
      ? ['Red', 'Blue', 'Green', 'Yellow', 'Black']
      : ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'Multi', 'White']; // Approx for Masters

    colors.forEach(col => {
      const pool = owned.filter(c => c.color === col);
      if (pool.length > 0) {
        const randomCard = pool[Math.floor(Math.random() * pool.length)];
        drafted.push(randomCard.id);
      }
    });

    const newSlot: CareerSlot = {
      ...INITIAL_SLOT,
      coins: existingSlot.coins - costToDeduct,
      graduatedLeaders: existingSlot.graduatedLeaders,
      gameType,
      filter,
      draftedLeaders: drafted,
      status: 'draft'
    };
    await saveSlot(slotId, newSlot);
    setActiveSlotId(slotId);
  };

  const handleMulligan = async () => {
    if (!activeSlotId) return;
    const slot = careerData[activeSlotId];
    if (slot.mulliganUsed) return;

    const owned = getOwnedLeaders(slot.gameType, slot.filter);
    const newDrafted = [...slot.draftedLeaders];

    slot.draftedLeaders.forEach((leaderId, index) => {
      if (!slot.lockedForMulligan.includes(leaderId)) {
        const card = cards.find(c => c.id === leaderId);
        if (card) {
          const pool = owned.filter(c => c.color === card.color);
          if (pool.length > 0) {
            newDrafted[index] = pool[Math.floor(Math.random() * pool.length)].id;
          }
        }
      }
    });

    await saveSlot(activeSlotId, {
      ...slot,
      draftedLeaders: newDrafted,
      mulliganUsed: true,
      lockedForMulligan: []
    });
  };

  const toggleLock = (leaderId: string) => {
    if (!activeSlotId) return;
    const slot = careerData[activeSlotId];
    const locked = slot.lockedForMulligan.includes(leaderId)
      ? slot.lockedForMulligan.filter(id => id !== leaderId)
      : [...slot.lockedForMulligan, leaderId];
    
    setCareerData(prev => ({
      ...prev,
      [activeSlotId]: { ...slot, lockedForMulligan: locked }
    }));
  };

  const selectLeader = async (leaderId: string) => {
    if (!activeSlotId) return;
    const slot = careerData[activeSlotId];
    const discarded = slot.draftedLeaders.filter(id => id !== leaderId);
    
    await saveSlot(activeSlotId, {
      ...slot,
      activeLeader: leaderId,
      discardedLeaders: discarded,
      status: 'active'
    });
  };

  const registerMatch = async (result: 'win' | 'loss', type: 'test' | 'local' | 'regional', opponentId?: string) => {
    if (!activeSlotId) return;
    const slot = careerData[activeSlotId];
    
    let newWins = slot.wins;
    let newLosses = slot.losses;
    let newCoins = slot.coins;
    let newStreak = slot.lossStreak;
    let status = slot.status;

    if (result === 'win') {
      newWins += 1;
      newStreak = 0;
      // Milestones
      if ([1, 3, 5, 7].includes(newWins)) {
        newCoins += 1;
      }
      if (newWins >= 10) {
        newCoins += 3;
        status = 'graduated';
      }
    } else {
      newLosses += 1;
      newStreak += 1;
      if (newStreak >= 5) {
        newCoins += 1; // Pity coin
        newStreak = 0; // Reset streak after pity
      }
    }

    const match: MatchRecord = { result, type, date: new Date().toISOString(), opponentLeaderId: opponentId };
    const nextMatches = [...slot.matches, match];
    
    const nextSlot: CareerSlot = {
      ...slot,
      wins: newWins,
      losses: newLosses,
      lossStreak: newStreak,
      coins: newCoins,
      matches: nextMatches,
      status: newWins >= 10 ? 'graduated' : 'active'
    };
    
    if (newWins >= 10 && slot.activeLeader) {
        nextSlot.graduatedLeaders = [...slot.graduatedLeaders, slot.activeLeader];
        nextSlot.graduatedRecords = [...(slot.graduatedRecords || []), { id: slot.activeLeader, matches: nextMatches }];
    }

    await saveSlot(activeSlotId, nextSlot);
  };

  const buyFromMarket = async (type: 'reserve' | 'scout' | 'star' | 'new_draft', leaderId?: string) => {
    if (!activeSlotId) return;
    const slot = careerData[activeSlotId];
    
    if (type === 'new_draft') {
      if (slot.coins < 5) return;
      await startDraft(activeSlotId, slot.gameType, slot.filter, 5);
      return;
    }

    let cost = 0;
    let selectedId = leaderId;

    if (type === 'reserve') {
      cost = 2;
      if (!selectedId && slot.discardedLeaders.length > 0) {
        selectedId = slot.discardedLeaders[Math.floor(Math.random() * slot.discardedLeaders.length)];
      }
    }
    if (type === 'scout') {
      cost = 3;
      let referenceLeaderId = slot.activeLeader;
      if (!referenceLeaderId && slot.graduatedLeaders.length > 0) {
          referenceLeaderId = slot.graduatedLeaders[slot.graduatedLeaders.length - 1];
      }
      const currentLeaderCard = cards.find(c => c.id === referenceLeaderId);
      const currentColor = currentLeaderCard?.color;
      let owned = getOwnedLeaders(slot.gameType, slot.filter).filter(c => !slot.graduatedLeaders.includes(c.id));
      if (currentColor) {
         const sameColorOwned = owned.filter(c => c.color === currentColor);
         if (sameColorOwned.length > 0) owned = sameColorOwned;
      }
      if (owned.length > 0) {
        selectedId = owned[Math.floor(Math.random() * owned.length)].id;
      }
    }
    if (type === 'star') {
      cost = 5;
    }

    if (slot.coins < cost || !selectedId) return; // Not enough coins or no leader

    const newDiscarded = type === 'reserve' ? slot.discardedLeaders.filter(id => id !== selectedId) : slot.discardedLeaders;

    await saveSlot(activeSlotId, {
      ...slot,
      coins: slot.coins - cost,
      activeLeader: selectedId,
      discardedLeaders: newDiscarded,
      status: 'active',
      wins: 0,
      losses: 0,
      lossStreak: 0,
      matches: []
    });
    setShowStarMarket(false);
  };

  const renderContent = () => {
    if (isLoading) return <div className="text-white">Cargando...</div>;

    if (activeSlotId && careerData[activeSlotId]) {
    const slot = careerData[activeSlotId];
    
    if (slot.status === 'draft') {
      return (
        <div className="space-y-6">
          <button onClick={() => setActiveSlotId(null)} className="text-white/60 hover:text-white flex items-center gap-2">
            <X size={20} /> Cancelar Draft
          </button>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">El Gran Draft</h2>
            <p className="text-white/60">Selecciona tu Líder inicial o haz un Mulligan.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {slot.draftedLeaders.map((id, i) => {
              const card = cards.find(c => c.id === id);
              const isLocked = slot.lockedForMulligan.includes(id);
              if (!card) return <div key={i} className="aspect-[2.5/3.5] bg-white/5 rounded-xl animate-pulse" />;
              
              return (
                <div key={card.id + i} className="relative group">
                  <img src={card.imageUrl} alt={card.name} className="w-full rounded-xl shadow-lg" />
                  
                  {/* Lock button always visible in the corner */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(card.id);
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-full text-white shadow-lg z-10 transition-colors ${
                      isLocked 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-black/60 hover:bg-black/80 border border-white/20'
                    }`}
                  >
                    {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 rounded-xl pointer-events-none sm:pointer-events-auto">
                    <button 
                      onClick={() => selectLeader(card.id)}
                      className="px-4 py-2 rounded-lg bg-orange-600 font-bold text-white shadow-xl hover:bg-orange-500 pointer-events-auto"
                    >
                      Elegir
                    </button>
                  </div>
                  
                  {/* Mobile tap support for Elegir since hover is tricky */}
                  <div 
                    className="absolute inset-0 z-0 sm:hidden"
                    onClick={() => selectLeader(card.id)}
                  />
                </div>
              );
            })}
          </div>

          {!slot.mulliganUsed && (
            <div className="flex justify-center pt-8">
              <button 
                onClick={handleMulligan}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <RefreshCw /> Mulligan Selectivo
              </button>
            </div>
          )}
        </div>
      );
    }

    if (slot.status === 'active' || slot.status === 'market' || slot.status === 'graduated') {
      const activeCard = cards.find(c => c.id === slot.activeLeader);
      
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#1a1a1a] p-4 rounded-2xl border border-white/10">
            <button onClick={() => { setActiveSlotId(null); setIsFlipped(false); }} className="text-white/60 hover:text-white flex items-center gap-2">
               Volver a Inicio
            </button>
            <div className="flex items-center gap-4 text-orange-400 font-black text-xl">
              <Coins /> {slot.coins}
            </div>
          </div>

          {slot.status === 'graduated' ? (
            <div className="bg-[#1a1a1a] p-12 rounded-3xl border-4 border-yellow-500/50 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(234,179,8,0.2)]">
              <Trophy className="w-24 h-24 text-yellow-400 mb-6 animate-bounce" />
              <h2 className="text-5xl font-black text-white mb-4">¡Líder Graduado!</h2>
              <p className="text-xl text-white/60 mb-8 max-w-xl mx-auto">
                Has alcanzado las 10 victorias con {activeCard?.name || 'tu líder'}. 
                ¡Pasa al Salón de la Fama! Tus monedas se han conservado (incluyendo las 3 monedas de bonificación).
              </p>
              
              {activeCard && (
                <div className="w-48 mb-8 rounded-xl overflow-hidden shadow-2xl border-2 border-yellow-500/50">
                   <img src={activeCard.imageUrl} alt={activeCard.name} className="w-full h-auto" />
                </div>
              )}

              <button 
                onClick={() => {
                  saveSlot(activeSlotId, { 
                    ...slot, 
                    activeLeader: null, 
                    wins: 0, 
                    losses: 0, 
                    lossStreak: 0, 
                    matches: [], 
                    status: 'market' 
                  });
                }} 
                className="px-8 py-4 bg-yellow-500 text-black font-black text-xl rounded-2xl hover:bg-yellow-400 transition-colors shadow-lg"
              >
                Ir al Mercado
              </button>
            </div>
          ) : slot.status === 'market' ? (
            <div className="space-y-6">
               <h2 className="text-2xl font-black text-white">Mercado de Líderes</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Mercado UI */}
                  <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 space-y-4 text-center flex flex-col justify-between">
                    <div>
                      <History className="w-12 h-12 mx-auto text-blue-400 mb-4" />
                      <h3 className="text-lg font-bold text-white">Banquillo</h3>
                      <p className="text-sm text-white/60">Recupera un líder descartado en tu último draft.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setShowReserveMarket(!showReserveMarket);
                        setShowStarMarket(false);
                      }}
                      disabled={slot.coins < 2 || slot.discardedLeaders.length === 0}
                      className={`w-full py-2 mt-4 ${slot.coins >= 2 && slot.discardedLeaders.length > 0 ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-white/10 text-white/50 cursor-not-allowed'} rounded-lg font-bold transition-colors`}
                    >
                      2 Monedas
                    </button>
                  </div>
                  <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 space-y-4 text-center flex flex-col justify-between">
                    <div>
                      <Search className="w-12 h-12 mx-auto text-green-400 mb-4" />
                      <h3 className="text-lg font-bold text-white">Ojeador Ciego</h3>
                      <p className="text-sm text-white/60">Un líder al azar de tu mismo color de la colección.</p>
                    </div>
                    <button 
                      onClick={() => buyFromMarket('scout')} 
                      disabled={slot.coins < 3}
                      className={`w-full py-2 mt-4 ${slot.coins >= 3 ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' : 'bg-white/10 text-white/50 cursor-not-allowed'} rounded-lg font-bold transition-colors`}
                    >
                      3 Monedas
                    </button>
                  </div>
                  <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-yellow-500/30 space-y-4 text-center shadow-[0_0_15px_rgba(234,179,8,0.1)] flex flex-col justify-between">
                    <div>
                      <Trophy className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                      <h3 className="text-lg font-bold text-white">Fichaje Estrella</h3>
                      <p className="text-sm text-white/60">Elige a dedo cualquier líder de tu colección.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setShowStarMarket(!showStarMarket);
                        setShowReserveMarket(false);
                      }}
                      disabled={slot.coins < 5}
                      className={`w-full py-2 mt-4 ${slot.coins >= 5 ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-white/10 text-white/50 cursor-not-allowed'} rounded-lg font-black transition-colors`}
                    >
                      5 Monedas
                    </button>
                  </div>
                  <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-purple-500/30 space-y-4 text-center shadow-[0_0_15px_rgba(168,85,247,0.1)] flex flex-col justify-between">
                    <div>
                      <RefreshCw className="w-12 h-12 mx-auto text-purple-400 mb-4" />
                      <h3 className="text-lg font-bold text-white">Nuevo Draft</h3>
                      <p className="text-sm text-white/60">Descarta a tu líder actual y genera un nuevo Draft.</p>
                    </div>
                    <button 
                      onClick={() => buyFromMarket('new_draft')}
                      disabled={slot.coins < 5}
                      className={`w-full py-2 mt-4 ${slot.coins >= 5 ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-white/10 text-white/50 cursor-not-allowed'} rounded-lg font-black transition-colors`}
                    >
                      5 Monedas
                    </button>
                  </div>
               </div>
               
               {showStarMarket && (
                 <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-yellow-500/30 mt-6">
                   <h3 className="text-lg font-bold text-white mb-4">Selecciona tu nuevo Líder</h3>
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-h-[400px] overflow-y-auto pr-2">
                     {getOwnedLeaders(slot.gameType, slot.filter).filter(c => !slot.graduatedLeaders.includes(c.id)).map(leader => (
                       <button 
                         key={leader.id} 
                         onClick={() => buyFromMarket('star', leader.id)}
                         className="relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-yellow-500 transition-colors"
                       >
                         <img src={leader.imageUrl} alt={leader.name} className="w-full h-auto" />
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <span className="text-yellow-400 font-bold text-sm">Fichar</span>
                         </div>
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               {showReserveMarket && (
                 <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-blue-500/30 mt-6">
                   <h3 className="text-lg font-bold text-white mb-4">Selecciona un Líder del Banquillo</h3>
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-h-[400px] overflow-y-auto pr-2">
                     {slot.discardedLeaders.map(leaderId => {
                       const leader = cards.find(c => c.id === leaderId);
                       if (!leader) return null;
                       return (
                         <button 
                           key={leader.id} 
                           onClick={() => {
                             buyFromMarket('reserve', leader.id);
                             setShowReserveMarket(false);
                           }}
                           className="relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
                         >
                           <img src={leader.imageUrl} alt={leader.name} className="w-full h-auto" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <span className="text-blue-400 font-bold text-sm">Fichar</span>
                           </div>
                         </button>
                       );
                     })}
                   </div>
                 </div>
               )}

               {slot.activeLeader && (
                 <button onClick={() => { setShowStarMarket(false); setShowReserveMarket(false); saveSlot(activeSlotId, { ...slot, status: 'active' }); }} className="mx-auto block text-white/50 hover:text-white mt-8">Cerrar Mercado</button>
               )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 space-y-4">
                {activeCard ? (
                  <div className="relative group">
                    <img 
                      src={isFlipped && activeCard.backImageUrl ? activeCard.backImageUrl : activeCard.imageUrl} 
                      alt="Leader" 
                      className="w-full rounded-2xl shadow-2xl border-4 border-orange-500/20" 
                    />
                    {activeCard.backImageUrl && (
                      <button 
                        onClick={() => setIsFlipped(prev => !prev)}
                        className="absolute top-2 right-2 bg-black/80 text-white p-3 rounded-full hover:bg-black transition-colors border border-white/20 shadow-lg"
                        title="Dar la vuelta al Líder"
                      >
                        <RefreshCw size={20} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[2.5/3.5] bg-white/5 rounded-2xl animate-pulse" />
                )}
                
                <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
                  <label className="text-xs text-white/40 font-bold uppercase tracking-wider mb-2 block">Deckplanet URL</label>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="text-white/40" size={16} />
                    <input 
                      type="url"
                      value={slot.deckUrl}
                      onChange={(e) => saveSlot(activeSlotId, { ...slot, deckUrl: e.target.value })}
                      placeholder="Pega tu enlace aquí..."
                      className="bg-transparent text-sm text-white flex-1 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-6">
                <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 flex flex-col justify-center items-center">
                   <h2 className="text-3xl font-black text-white mb-2">Progreso del Líder</h2>
                   <div className="flex items-end gap-2 mb-4">
                     <span className="text-7xl font-black text-orange-500 leading-none">{slot.wins}</span>
                     <span className="text-2xl text-white/40 font-bold pb-1">/ 10 VICTORIAS</span>
                   </div>
                   
                   <div className="flex gap-1 w-full max-w-md mx-auto mb-4">
                     {Array.from({length: 10}).map((_, i) => (
                       <div key={i} className={`h-2 flex-1 rounded-sm ${i < slot.wins ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-white/10'}`} />
                     ))}
                   </div>

                   <p className="text-sm text-yellow-500/80 mb-8 font-bold text-center">
                     Al llegar a 10 victorias tu líder se gradúa y consigues 3 Monedas de bonificación.
                   </p>
                   
                   <div className="w-full max-w-md">
                     <button
                       onClick={() => setIsRegisterModalOpen(true)}
                       className="w-full py-4 bg-orange-600 text-white border border-orange-500/50 rounded-2xl font-black text-lg hover:bg-orange-500 transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95"
                     >
                       <Swords /> Registrar Resultado
                     </button>
                   </div>
                </div>

                {slot.matches.length > 0 && (
                  <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <History size={18} className="text-white/50" />
                        Últimos resultados
                      </h3>
                      <button onClick={() => setIsStatsModalOpen(true)} className="flex items-center gap-2 text-xs font-bold text-orange-500 hover:text-orange-400 uppercase tracking-widest transition-colors bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20 shadow-sm">
                        <BarChart2 size={14} /> Estadísticas
                      </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                      {slot.matches.slice(-10).reverse().map((m, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setSelectedMatchDetail(m)}
                          className={`hover:scale-105 transition-transform flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${m.result === 'win' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                        >
                          {m.opponentLeaderId && cards.find(c => c.id === m.opponentLeaderId) && (
                            <div className="w-5 h-5 rounded-full overflow-hidden border border-current opacity-80 shrink-0">
                              <img src={cards.find(c => c.id === m.opponentLeaderId)?.imageUrl} alt="Rival" className="w-full h-full object-cover object-top" />
                            </div>
                          )}
                          <span>
                            {m.result === 'win' ? 'V' : 'D'} <span className="opacity-50 mx-1">•</span> <span className="uppercase text-[10px]">{m.type === 'test' ? 'Test' : m.type}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {slot.graduatedLeaders && slot.graduatedLeaders.length > 0 && (
                  <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.05)]">
                    <h3 className="font-bold text-yellow-500 mb-4 flex items-center gap-2">
                      <Trophy size={18} />
                      Salón de la Fama
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {slot.graduatedLeaders.slice(0, 10).map((lid, idx) => {
                        const c = cards.find(x => x.id === lid);
                        if (!c) return null;
                        const record = slot.graduatedRecords?.find(r => r.id === lid);
                        const historicalMatches = record ? record.matches : [];
                        return (
                          <button 
                            key={idx} 
                            onClick={() => setSelectedHofRecord({ leader: c, matches: historicalMatches })}
                            className="relative group w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-500/50 hover:border-yellow-400 transition-colors shadow-lg cursor-pointer"
                          >
                            <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover object-top" title={c.name} />
                          </button>
                        );
                      })}
                      {slot.graduatedLeaders.length > 10 && (
                        <button 
                          onClick={() => setViewingHofForSlot(activeSlotId)}
                          className="h-12 px-4 rounded-full border-2 border-yellow-500/30 text-yellow-500 font-bold text-sm hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-colors"
                        >
                          +{slot.graduatedLeaders.length - 10}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => saveSlot(activeSlotId, { ...slot, status: 'market' })} className="p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl hover:bg-white/5 transition-colors flex items-center gap-4 group">
                     <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 group-hover:scale-110 transition-transform"><ShoppingCart /></div>
                     <div className="text-left">
                       <h3 className="font-bold text-white">Mercado</h3>
                       <p className="text-xs text-white/50">Gasta tus monedas</p>
                     </div>
                   </button>
                   <div className="p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl flex items-center gap-4">
                     <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400"><History /></div>
                     <div className="text-left">
                       <h3 className="font-bold text-white">Derrotas: {slot.losses}</h3>
                       <p className="text-xs text-white/50">Racha actual: {slot.lossStreak}</p>
                     </div>
                   </div>
                </div>

              </div>
            </div>
          )}
        </div>
      );
    }
  }

  // Slot Selection
  return (
    <div className="space-y-6 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Trophy className="text-orange-500" size={36} /> 
          Road to Glory
        </h1>
        <p className="text-white/60 mt-2">El juego dentro del juego. Supera retos con tu colección real.</p>
      </div>

      <div className="space-y-4">
        {Object.entries(careerData).map(([slotId, slot]) => (
          <div key={slotId} className="bg-[#1a1a1a] p-1 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-blue-500/5" />
            <div className="relative p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                {slot.activeLeader ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                    <img src={cards.find(c => c.id === slot.activeLeader)?.imageUrl} className="w-full h-full object-cover" alt="Leader" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-white/20 border border-white/10">
                    <Swords />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">Carrera {slotId.replace('slot', '')}</h3>
                  {slot.status === 'empty' ? (
                    <p className="text-sm text-white/40">Ranura Vacía</p>
                  ) : (
                    <p className="text-sm text-orange-400 font-bold">{slot.gameType} • Nvl. {slot.wins}</p>
                  )}
                </div>
              </div>
              
              {slot.status === 'empty' ? (
                <div className="flex gap-2 w-full flex-wrap sm:w-auto">
                  <button onClick={() => startDraft(slotId, 'Fusion World', 'legacy')} className="flex-1 sm:flex-none px-4 py-2 bg-blue-600/20 text-blue-400 font-bold rounded-xl hover:bg-blue-600/30">
                    FW (Todos)
                  </button>
                  <button onClick={() => startDraft(slotId, 'Masters', 'recent')} className="flex-1 sm:flex-none px-4 py-2 bg-red-600/20 text-red-400 font-bold rounded-xl hover:bg-red-600/30 whitespace-nowrap">
                    Masters (BT28+)
                  </button>
                  <button onClick={() => startDraft(slotId, 'Masters', 'legacy')} className="flex-1 sm:flex-none px-4 py-2 bg-purple-600/20 text-purple-400 font-bold rounded-xl hover:bg-purple-600/30 whitespace-nowrap">
                    Masters (Legacy)
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => { setActiveSlotId(slotId); setIsFlipped(false); }} className="flex-1 sm:flex-none px-6 py-2 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20">
                    Continuar
                  </button>
                  <button 
                    onClick={() => {
                      if (confirmReset === slotId) {
                        resetSlot(slotId);
                      } else {
                        setConfirmReset(slotId);
                        setTimeout(() => setConfirmReset(null), 3000);
                      }
                    }} 
                    className={`px-4 py-2 font-bold rounded-xl transition-colors flex items-center justify-center ${confirmReset === slotId ? 'bg-red-600 text-white' : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'}`}
                    title="Borrar Carrera"
                  >
                    {confirmReset === slotId ? "Confirmar" : <Trash2 size={20} />}
                  </button>
                </div>
              )}
            </div>
            
            {slot.graduatedLeaders && slot.graduatedLeaders.length > 0 && (
              <div className="px-6 pb-6 pt-2 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={16} className="text-yellow-500" />
                  <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-wider">Salón de la Fama</h4>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {slot.graduatedLeaders.slice(0, 10).map((lid, idx) => {
                    const c = cards.find(x => x.id === lid);
                    if (!c) return null;
                    const record = slot.graduatedRecords?.find(r => r.id === lid);
                    const historicalMatches = record ? record.matches : [];
                    return (
                      <button 
                        key={idx} 
                        onClick={() => setSelectedHofRecord({ leader: c, matches: historicalMatches })}
                        className="relative group w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-500/50 hover:border-yellow-400 transition-colors shadow-lg cursor-pointer"
                      >
                        <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover object-top" title={c.name} />
                      </button>
                    );
                  })}
                  {slot.graduatedLeaders.length > 10 && (
                    <button 
                      onClick={() => setViewingHofForSlot(slotId)}
                      className="h-12 px-4 rounded-full border-2 border-yellow-500/30 text-yellow-500 font-bold text-sm hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-colors"
                    >
                      +{slot.graduatedLeaders.length - 10}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  };

  return (
    <>
      {renderContent()}

      {viewingHofForSlot && careerData[viewingHofForSlot] && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto py-12" onClick={() => setViewingHofForSlot(null)}>
          <div className="bg-[#1a1a1a] border border-yellow-500/30 rounded-3xl p-8 max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <Trophy size={40} className="text-yellow-500" />
                <div>
                  <h3 className="text-3xl font-black text-white">Salón de la Fama</h3>
                  <p className="text-yellow-500 font-bold">Carrera {viewingHofForSlot.replace('slot', '')} • {careerData[viewingHofForSlot].graduatedLeaders.length} Líderes</p>
                </div>
              </div>
              <button onClick={() => setViewingHofForSlot(null)} className="text-white/50 hover:text-white bg-white/5 p-2 rounded-full"><X size={24} /></button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
              {careerData[viewingHofForSlot].graduatedLeaders.map((lid, idx) => {
                const c = cards.find(x => x.id === lid);
                if (!c) return null;
                const record = careerData[viewingHofForSlot].graduatedRecords?.find(r => r.id === lid);
                const historicalMatches = record ? record.matches : [];
                return (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedHofRecord({ leader: c, matches: historicalMatches })}
                    className="group bg-[#111] p-4 rounded-2xl border border-white/5 hover:border-yellow-500/50 transition-colors flex flex-col items-center gap-4 text-center cursor-pointer shadow-lg"
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-500/20 group-hover:border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all">
                      <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-2">{c.name}</h4>
                      <p className="text-xs text-yellow-500/80 mt-1 font-semibold uppercase">{c.color}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedHofRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedHofRecord(null)}>
          <div className="bg-[#1a1a1a] border border-yellow-500/30 rounded-3xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-500">
                  <img src={selectedHofRecord.leader.imageUrl} alt={selectedHofRecord.leader.name} className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedHofRecord.leader.name}</h3>
                  <p className="text-yellow-500 text-sm font-bold flex items-center gap-1"><Trophy size={14} /> Salón de la Fama</p>
                </div>
              </div>
              <button onClick={() => setSelectedHofRecord(null)} className="text-white/50 hover:text-white"><X size={24} /></button>
            </div>
            
            {selectedHofRecord.matches.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-white/80 font-bold mb-2">Historial de partidas</h4>
                <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                  {selectedHofRecord.matches.map((m, i) => (
                    <div key={i} className={`relative flex flex-col items-center justify-center p-2 rounded-lg border overflow-hidden ${m.result === 'win' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {m.opponentLeaderId && cards.find(c => c.id === m.opponentLeaderId) && (
                        <div className="absolute inset-0 opacity-20 grayscale pointer-events-none">
                          <img src={cards.find(c => c.id === m.opponentLeaderId)?.imageUrl} alt="Rival" className="w-full h-full object-cover object-top" />
                        </div>
                      )}
                      <span className="font-black text-lg leading-none mb-1 relative z-10">{m.result === 'win' ? 'V' : 'D'}</span>
                      <span className="text-[9px] uppercase font-bold opacity-70 tracking-tighter truncate w-full text-center relative z-10">{m.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-white/50 py-8 text-sm">
                No hay historial detallado guardado para este líder.
              </div>
            )}
          </div>
        </div>
      )}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setIsRegisterModalOpen(false)}>
          <div className="bg-[#1E1E1E] border border-orange-500/30 rounded-3xl p-6 max-w-lg w-full flex flex-col gap-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Registrar Resultado</h3>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-white/50 hover:text-white"><X size={24} /></button>
            </div>

            {!isOpponentSearchOpen ? (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Tipo de Torneo</label>
                  <div className="flex gap-2 bg-[#111] p-1.5 rounded-2xl border border-white/5">
                    {(['test', 'local', 'regional'] as const).map(type => (
                      <button 
                        key={type}
                        onClick={() => setRegisterMatchType(type)}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase transition-all ${registerMatchType === type ? 'bg-orange-500 text-white shadow-lg' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
                      >
                        {type === 'test' ? 'Testeo' : type === 'local' ? 'Local' : 'Regional'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Resultado</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setRegisterResult('win')}
                      className={`flex-1 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 border-2 transition-all ${registerResult === 'win' ? 'bg-green-500/20 text-green-400 border-green-500 scale-[1.02] shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-[#111] text-white/40 border-white/5 hover:border-green-500/50 hover:text-green-500/50'}`}
                    >
                      <Trophy size={20} /> Victoria
                    </button>
                    <button 
                      onClick={() => setRegisterResult('loss')}
                      className={`flex-1 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 border-2 transition-all ${registerResult === 'loss' ? 'bg-red-500/20 text-red-400 border-red-500 scale-[1.02] shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-[#111] text-white/40 border-white/5 hover:border-red-500/50 hover:text-red-500/50'}`}
                    >
                      <X size={20} /> Derrota
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 flex justify-between items-center">
                    <span>Líder Rival</span>
                    {registerOpponentId && <button onClick={() => setRegisterOpponentId(null)} className="text-red-400 hover:text-red-300">Borrar</button>}
                  </label>
                  <button 
                    onClick={() => setIsOpponentSearchOpen(true)}
                    className="w-full bg-[#111] border border-white/10 hover:border-orange-500/50 p-4 rounded-2xl flex items-center justify-between transition-colors group"
                  >
                    {registerOpponentId ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded-md overflow-hidden border border-white/20 shrink-0">
                          <img src={cards.find(c => c.id === registerOpponentId)?.imageUrl} alt="Rival" className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="text-left">
                          <p className="text-white font-bold">{cards.find(c => c.id === registerOpponentId)?.name}</p>
                          <p className="text-xs text-white/50">{cards.find(c => c.id === registerOpponentId)?.cardNumber}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-white/50 group-hover:text-white/80">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <Search size={18} />
                        </div>
                        <span className="font-bold">Buscar líder rival...</span>
                      </div>
                    )}
                    <span className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">Buscar</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button 
                    disabled={!registerResult || !registerOpponentId}
                    onClick={() => {
                      if (registerResult && registerOpponentId) {
                        registerMatch(registerResult, registerMatchType, registerOpponentId);
                        setIsRegisterModalOpen(false);
                        setRegisterResult(null);
                        setRegisterOpponentId(null);
                        setOpponentSearchQuery('');
                        setOpponentSearchColor('Todos');
                      }
                    }}
                    className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-xl hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col h-[60vh]">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre o número..."
                      value={opponentSearchQuery}
                      onChange={e => setOpponentSearchQuery(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {[
                    { id: 'Todos', label: 'Todos' },
                    { id: 'Red', label: 'Rojo' },
                    { id: 'Blue', label: 'Azul' },
                    { id: 'Green', label: 'Verde' },
                    { id: 'Yellow', label: 'Amarillo' },
                    { id: 'Black', label: 'Negro' }
                  ].map(col => (
                    <button 
                      key={col.id}
                      onClick={() => setOpponentSearchColor(col.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${opponentSearchColor === col.id ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {cards.filter(c => 
                    c.type.toLowerCase().includes('leader') && 
                    (opponentSearchColor === 'Todos' || c.color === opponentSearchColor || c.color?.includes(opponentSearchColor)) &&
                    (c.name.toLowerCase().includes(opponentSearchQuery.toLowerCase()) || c.cardNumber.toLowerCase().includes(opponentSearchQuery.toLowerCase())) &&
                    (!activeSlotId || !careerData[activeSlotId] || careerData[activeSlotId].gameType !== 'Fusion World' || (c.id.startsWith('FS') || c.id.startsWith('FB') || c.id.startsWith('SB') || c.id.startsWith('FP')))
                  ).slice(0, 50).map(card => (
                    <button 
                      key={card.id}
                      onClick={() => {
                        setRegisterOpponentId(card.id);
                        setIsOpponentSearchOpen(false);
                      }}
                      className="relative group rounded-xl overflow-hidden shadow-lg border-2 border-transparent hover:border-orange-500 transition-colors"
                    >
                      <img src={card.imageUrl} alt={card.name} className="w-full h-auto" />
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setIsOpponentSearchOpen(false)}
                    className="w-full py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors"
                  >
                    Volver
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedMatchDetail && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setSelectedMatchDetail(null)}>
          <div className="bg-[#1a1a1a] border border-orange-500/30 rounded-3xl p-6 max-w-sm w-full flex flex-col items-center gap-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedMatchDetail(null)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={24} /></button>
            
            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${selectedMatchDetail.result === 'win' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {selectedMatchDetail.result === 'win' ? 'Victoria' : 'Derrota'} • {selectedMatchDetail.type === 'test' ? 'Testeo' : selectedMatchDetail.type === 'local' ? 'Local' : 'Regional'}
            </div>

            {selectedMatchDetail.opponentLeaderId && cards.find(c => c.id === selectedMatchDetail.opponentLeaderId) ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <span className="text-white/50 font-bold uppercase text-xs tracking-widest">Líder Rival</span>
                <img 
                  src={cards.find(c => c.id === selectedMatchDetail.opponentLeaderId)?.imageUrl} 
                  alt="Líder Rival" 
                  className="w-48 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10"
                />
                <h3 className="font-bold text-white text-center text-lg leading-tight mt-2">{cards.find(c => c.id === selectedMatchDetail.opponentLeaderId)?.name}</h3>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full py-8">
                <span className="text-white/50 font-bold uppercase text-xs tracking-widest">Líder Rival</span>
                <div className="text-white/30 text-sm font-semibold">No registrado</div>
              </div>
            )}
          </div>
        </div>
      )}
      {isStatsModalOpen && activeSlotId && careerData[activeSlotId] && (
        <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setIsStatsModalOpen(false)}>
          <div className="bg-[#1E1E1E] border border-orange-500/30 rounded-3xl p-6 max-w-lg w-full flex flex-col gap-6 relative" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500">
                  <BarChart2 size={24} />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Estadísticas</h3>
              </div>
              <button onClick={() => setIsStatsModalOpen(false)} className="text-white/50 hover:text-white"><X size={24} /></button>
            </div>

            <div className="flex gap-2 bg-[#111] p-1.5 rounded-2xl border border-white/5">
              <button 
                onClick={() => setStatsTab('current')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${statsTab === 'current' ? 'bg-orange-500 text-white shadow-lg' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
              >
                Líder Actual
              </button>
              <button 
                onClick={() => setStatsTab('career')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${statsTab === 'career' ? 'bg-orange-500 text-white shadow-lg' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
              >
                Toda la Carrera
              </button>
            </div>
            
            {(() => {
              const slot = careerData[activeSlotId];
              
              const targetMatches = statsTab === 'current' 
                ? slot.matches 
                : [
                    ...slot.matches, 
                    ...(slot.graduatedRecords?.flatMap(r => r.matches) || [])
                  ];
              
              const totalMatches = targetMatches.length;
              const wins = targetMatches.filter(m => m.result === 'win').length;
              const losses = totalMatches - wins;
              const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
              
              const colorStats: Record<string, { win: number, loss: number, name: string }> = {
                'Red': { win: 0, loss: 0, name: 'Rojo' },
                'Blue': { win: 0, loss: 0, name: 'Azul' },
                'Green': { win: 0, loss: 0, name: 'Verde' },
                'Yellow': { win: 0, loss: 0, name: 'Amarillo' },
                'Black': { win: 0, loss: 0, name: 'Negro' },
                'Unknown': { win: 0, loss: 0, name: 'No Reg.' }
              };

              targetMatches.forEach(m => {
                let col = 'Unknown';
                if (m.opponentLeaderId) {
                  const oppCard = cards.find(c => c.id === m.opponentLeaderId);
                  if (oppCard && oppCard.color) {
                    if (oppCard.color.includes('Red')) col = 'Red';
                    else if (oppCard.color.includes('Blue')) col = 'Blue';
                    else if (oppCard.color.includes('Green')) col = 'Green';
                    else if (oppCard.color.includes('Yellow')) col = 'Yellow';
                    else if (oppCard.color.includes('Black')) col = 'Black';
                  }
                }
                if (colorStats[col]) {
                  if (m.result === 'win') colorStats[col].win++;
                  else colorStats[col].loss++;
                }
              });

              // Matchup calculation
              const leaderStats: Record<string, { win: number, loss: number }> = {};
              targetMatches.forEach(m => {
                if (m.opponentLeaderId) {
                  if (!leaderStats[m.opponentLeaderId]) {
                    leaderStats[m.opponentLeaderId] = { win: 0, loss: 0 };
                  }
                  if (m.result === 'win') leaderStats[m.opponentLeaderId].win++;
                  else leaderStats[m.opponentLeaderId].loss++;
                }
              });

              let bestMatchups: string[] = [];
              let worstMatchups: string[] = [];
              let maxDiff = 0;
              let minDiff = 0;

              Object.entries(leaderStats).forEach(([id, stats]) => {
                // Minimum 1 match required
                if (stats.win + stats.loss >= 1) {
                  const diff = stats.win - stats.loss;
                  
                  if (diff > 0) {
                    if (diff > maxDiff) {
                      maxDiff = diff;
                      bestMatchups = [id];
                    } else if (diff === maxDiff) {
                      bestMatchups.push(id);
                    }
                  }

                  if (diff < 0) {
                    if (diff < minDiff) {
                      minDiff = diff;
                      worstMatchups = [id];
                    } else if (diff === minDiff) {
                      worstMatchups.push(id);
                    }
                  }
                }
              });

              const chartData = Object.values(colorStats).filter(d => d.win > 0 || d.loss > 0);

              return (
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2 scrollbar-thin scrollbar-thumb-white/10 pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                    <div className="bg-[#111] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Partidas</span>
                      <span className="text-2xl font-black text-white">{totalMatches}</span>
                    </div>
                    <div className="bg-[#111] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Victorias</span>
                      <span className="text-2xl font-black text-green-500">{wins}</span>
                    </div>
                    <div className="bg-[#111] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Derrotas</span>
                      <span className="text-2xl font-black text-red-500">{losses}</span>
                    </div>
                    <div className="bg-[#111] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Win Rate</span>
                      <span className="text-2xl font-black text-orange-500">{winRate}%</span>
                    </div>
                  </div>

                  {(bestMatchups.length > 0 || worstMatchups.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
                      {bestMatchups.length > 0 && (
                        <div className="bg-[#111] border border-green-500/20 p-4 rounded-2xl flex flex-col">
                          <span className="text-green-500/80 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5"><Trophy size={12}/> Mejor Matchup</span>
                          <div className="flex flex-wrap gap-2">
                            {bestMatchups.map(id => {
                              const c = cards.find(card => card.id === id);
                              if (!c) return null;
                              return (
                                <div key={id} className="relative group w-12 h-16 rounded-md overflow-hidden border border-green-500/30">
                                  <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover object-top" />
                                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-tl-md">
                                    {leaderStats[id].win}-{leaderStats[id].loss}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {worstMatchups.length > 0 && (
                        <div className="bg-[#111] border border-red-500/20 p-4 rounded-2xl flex flex-col">
                          <span className="text-red-500/80 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5"><X size={12}/> Peor Matchup</span>
                          <div className="flex flex-wrap gap-2">
                            {worstMatchups.map(id => {
                              const c = cards.find(card => card.id === id);
                              if (!c) return null;
                              return (
                                <div key={id} className="relative group w-12 h-16 rounded-md overflow-hidden border border-red-500/30">
                                  <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover object-top" />
                                  <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-tl-md">
                                    {leaderStats[id].win}-{leaderStats[id].loss}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-[#111] border border-white/5 p-4 rounded-2xl h-64 flex flex-col shrink-0">
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-4">Resultados por Color Rival</span>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                          <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#1E1E1E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ fontWeight: 'bold' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          <Bar dataKey="win" name="Victorias" fill="#22c55e" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="loss" name="Derrotas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-white/30 text-sm font-bold">
                        No hay datos suficientes
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
};
