import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { TurtleEvent } from './types';
import { PlayerStanding } from './standingsEngine';
import { X, ShieldAlert, Check, AlertTriangle, User, Award, HelpCircle } from 'lucide-react';

interface Props {
  event: TurtleEvent;
  standing: PlayerStanding;
  lang: 'es' | 'en';
  onClose: () => void;
  onSaved?: () => void;
}

export const TurtleAdminAdjustmentModal: React.FC<Props> = ({
  event,
  standing,
  lang,
  onClose,
  onSaved
}) => {
  const [penaltyPoints, setPenaltyPoints] = useState<number>(standing.penaltyPoints || 0);
  const [notes, setNotes] = useState<string>(standing.penaltyReason || '');
  const [isDisqualified, setIsDisqualified] = useState<boolean>(standing.isDisqualified || false);
  const [saving, setSaving] = useState(false);

  const rawPoints = standing.rawPoints;
  const simulatedFinalPoints = isDisqualified ? 0 : Math.max(0, rawPoints - (penaltyPoints || 0));

  const handleSave = async () => {
    try {
      setSaving(true);
      const currentAdjustments = { ...(event.adminAdjustments || {}) };

      if (penaltyPoints === 0 && !notes.trim() && !isDisqualified) {
        // If clean/zero, remove entry to keep doc clean
        delete currentAdjustments[standing.userId];
      } else {
        currentAdjustments[standing.userId] = {
          penaltyPoints: Math.max(0, penaltyPoints),
          notes: notes.trim(),
          disqualified: isDisqualified
        };
      }

      await updateDoc(doc(db, 'ts_tournaments', event.id), {
        adminAdjustments: currentAdjustments
      });

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'ts_tournaments');
      alert(lang === 'es' ? 'Error al guardar los ajustes de puntos.' : 'Error saving point adjustments.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#151515] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-wide">
                {lang === 'es' ? 'Ajuste de Puntos y Sanciones' : 'Points Adjustment & Penalties'}
              </h3>
              <p className="text-xs text-white/50">
                {lang === 'es' ? 'Modificación de liga (partidas no jugadas / DQ)' : 'League adjustments (unplayed matches / DQ)'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/5 hover:bg-white/10 hover:text-white rounded-full text-white/40 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Player Profile & Current Breakdown */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-white font-black text-lg border border-white/10">
                <User size={20} />
              </div>
              <div>
                <h4 className="font-black text-white text-base leading-tight flex items-center gap-2">
                  {standing.name}
                  {standing.isBot && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      BOT
                    </span>
                  )}
                </h4>
                <p className="text-xs text-white/40">{standing.email || 'Jugador de liga'}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-black text-white/40 block">Posición Actual</span>
              <span className="text-xl font-black text-yellow-400">#{standing.rank}</span>
            </div>
          </div>

          {/* Current Score Breakdown */}
          <div className="grid grid-cols-3 gap-2 bg-[#111] p-3.5 rounded-2xl border border-white/5 text-center">
            <div className="p-2 rounded-xl bg-black/30">
              <span className="text-[10px] uppercase font-bold text-white/40 block">Victorias</span>
              <span className="text-base font-black text-green-400">{standing.wins}</span>
              <span className="text-[10px] text-white/30 block">+{standing.winPoints} pts</span>
            </div>
            <div className="p-2 rounded-xl bg-black/30">
              <span className="text-[10px] uppercase font-bold text-white/40 block">Líderes Únicos</span>
              <span className="text-base font-black text-purple-400">{standing.uniqueLeaderCount}/4</span>
              <span className="text-[10px] text-white/30 block">+{standing.leaderPoints} pts</span>
            </div>
            <div className="p-2 rounded-xl bg-black/30">
              <span className="text-[10px] uppercase font-bold text-white/40 block">Pts Base</span>
              <span className="text-base font-black text-white">{standing.rawPoints}</span>
              <span className="text-[10px] text-white/30 block">calculados</span>
            </div>
          </div>

          {/* Penalty Points Input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-white/80 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-400" />
                {lang === 'es' ? 'Resta de puntos (Sanción / No jugadas)' : 'Points Deduction (Penalty / Unplayed)'}
              </span>
              <span className="text-red-400 text-xs font-black">
                {penaltyPoints > 0 ? `-${penaltyPoints} pts` : '0 pts'}
              </span>
            </label>
            <div className="relative">
              <input 
                type="number" 
                min="0"
                max="50"
                value={penaltyPoints === 0 ? '' : penaltyPoints}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  setPenaltyPoints(isNaN(val) ? 0 : Math.max(0, val));
                }}
                placeholder="0"
                className="w-full bg-[#111] border border-white/10 focus:border-orange-500 rounded-2xl px-4 py-3.5 text-white font-black text-lg transition-colors placeholder:text-white/20"
              />
            </div>
            <p className="text-[11px] text-white/40">
              {lang === 'es' 
                ? 'Introduce los puntos que se restarán a este jugador por no presentarse, partidas no jugadas o penalizaciones.' 
                : 'Enter points to subtract from this player due to unplayed matches or penalties.'}
            </p>
          </div>

          {/* Reason / Notes */}
          <div className="space-y-2">
            <label className="text-xs font-black text-white/80 uppercase tracking-wider block">
              {lang === 'es' ? 'Motivo o Nota de la sanción (Opcional)' : 'Reason or Notes (Optional)'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={lang === 'es' ? 'Ej: Partida no jugada en ronda 2 vs @rival (-1 pt)' : 'e.g. Unplayed match in round 2 (-1 pt)'}
              className="w-full bg-[#111] border border-white/10 focus:border-orange-500 rounded-2xl px-4 py-2.5 text-white text-sm transition-colors placeholder:text-white/20 resize-none"
            />
          </div>

          {/* Disqualification Switch */}
          <div className="p-4 rounded-2xl border transition-all bg-red-950/20 border-red-500/20 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-sm font-black text-red-400 uppercase tracking-wide block">
                {lang === 'es' ? 'Descalificar Jugador (DQ)' : 'Disqualify Player (DQ)'}
              </span>
              <p className="text-xs text-white/50">
                {lang === 'es' 
                  ? 'Quedará al fondo de la clasificación con 0 puntos y la insignia DQ.' 
                  : 'Will be ranked at the bottom with 0 points and DQ badge.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDisqualified(!isDisqualified)}
              className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center ${
                isDisqualified ? 'bg-red-500 justify-end' : 'bg-white/10 justify-start'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-md transition-transform" />
            </button>
          </div>

          {/* Final Score Preview */}
          <div className="bg-black/60 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
            <span className="text-xs uppercase font-black text-white/60 tracking-wider">
              {lang === 'es' ? 'Puntos Finales Resultantes' : 'Resulting Final Points'}
            </span>
            <div className="flex items-center gap-2">
              {isDisqualified ? (
                <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-400 font-black text-sm rounded-xl">
                  DESCALIFICADO (0 PTS)
                </span>
              ) : (
                <span className="text-2xl font-black text-green-400">
                  {simulatedFinalPoints} <span className="text-xs text-green-500/70">PTS</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/10 bg-black/40 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 font-bold transition-colors text-sm"
          >
            {lang === 'es' ? 'Cancelar' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black uppercase tracking-wider rounded-xl shadow-lg transition-all text-sm flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Check size={18} />
            )}
            {lang === 'es' ? 'Guardar Ajuste' : 'Save Adjustment'}
          </button>
        </div>
      </div>
    </div>
  );
};
