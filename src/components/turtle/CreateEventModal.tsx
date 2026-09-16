import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { EventType, GameFormat, EventStructure } from './types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'es' | 'en';
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, lang }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<EventType>('tournament');
  const [name, setName] = useState('');
  const [gameFormat, setGameFormat] = useState<GameFormat>('masters');
  const [structure, setStructure] = useState<EventStructure>('swiss');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [entryFee, setEntryFee] = useState<number>(5);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate) {
      setError(lang === 'es' ? 'Rellena los campos obligatorios.' : 'Fill the required fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await addDoc(collection(db, 'ts_tournaments'), {
        type,
        name,
        gameFormat,
        structure: type === 'league' ? 'groups' : structure,
        startDate,
        startTime,
        entryFee,
        description,
        status: 'open',
        createdAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'ts_tournaments');
      setError(lang === 'es' ? 'Error al crear el evento.' : 'Error creating event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#1E1E1E] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
          <h3 className="text-xl font-black text-white uppercase italic">
            {lang === 'es' ? 'Nuevo Evento' : 'New Event'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle size={20} />
              <p className="font-bold text-sm">{error}</p>
            </div>
          )}

          <form id="create-event-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">
                  {lang === 'es' ? 'Tipo' : 'Type'}
                </span>
                <select 
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value as EventType;
                    setType(newType);
                    if (newType === 'league') setStructure('groups');
                    if (newType === 'tournament') setStructure('swiss');
                  }}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-green-500/50 transition-colors"
                >
                  <option value="tournament">{lang === 'es' ? 'Torneo' : 'Tournament'}</option>
                  <option value="league">{lang === 'es' ? 'Liga' : 'League'}</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">
                  {lang === 'es' ? 'Juego' : 'Game'}
                </span>
                <select 
                  value={gameFormat}
                  onChange={(e) => setGameFormat(e.target.value as GameFormat)}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-green-500/50 transition-colors"
                >
                  <option value="masters">Masters</option>
                  <option value="fusion_world">Fusion World</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">
                {lang === 'es' ? 'Nombre del Evento *' : 'Event Name *'}
              </span>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'es' ? 'Ej. Liga Turtle Season 1' : 'E.g. Turtle League Season 1'}
                className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-green-500/50 transition-colors"
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">
                  {lang === 'es' ? 'Fecha *' : 'Date *'}
                </span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-green-500/50 transition-colors"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">
                  {lang === 'es' ? 'Hora' : 'Time'}
                </span>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-green-500/50 transition-colors"
                />
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">
                  {lang === 'es' ? 'Coste (€)' : 'Entry Fee (€)'}
                </span>
                <input 
                  type="number" 
                  min="0"
                  step="0.5"
                  value={entryFee}
                  onChange={(e) => setEntryFee(parseFloat(e.target.value))}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-green-500/50 transition-colors"
                />
              </label>
            </div>

            {type === 'tournament' && (
              <label className="block">
                <span className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">
                  {lang === 'es' ? 'Formato de Estructura' : 'Structure Format'}
                </span>
                <select 
                  value={structure}
                  onChange={(e) => setStructure(e.target.value as EventStructure)}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-green-500/50 transition-colors"
                >
                  <option value="swiss">{lang === 'es' ? 'Suizo' : 'Swiss'}</option>
                  <option value="swiss_top">{lang === 'es' ? 'Suizo + Top' : 'Swiss + Top'}</option>
                </select>
              </label>
            )}

            {type === 'league' && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-bold">
                {lang === 'es' 
                  ? 'Estructura: Grupos (Se repartirán dependiendo del número de usuarios)' 
                  : 'Structure: Groups (Distributed depending on number of users)'}
              </div>
            )}

            <label className="block">
              <span className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">
                {lang === 'es' ? 'Descripción y Reglas Breves' : 'Description & Brief Rules'}
              </span>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={lang === 'es' ? 'Información adicional, premios, reglas específicas...' : 'Additional info, prizes, specific rules...'}
                className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-green-500/50 transition-colors min-h-[100px] resize-y"
              />
            </label>
          </form>
        </div>

        <div className="p-6 border-t border-white/10 bg-black/20 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
          >
            {lang === 'es' ? 'Cancelar' : 'Cancel'}
          </button>
          <button 
            form="create-event-form"
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : (
              <>
                <Save size={20} />
                {lang === 'es' ? 'Crear Evento' : 'Create Event'}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
