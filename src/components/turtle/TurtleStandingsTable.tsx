import React, { useState } from 'react';
import { TurtleEvent, TurtleMatch, TurtleRegistration } from './types';
import { calculateLeagueStandings, PlayerStanding } from './standingsEngine';
import { TurtleAdminAdjustmentModal } from './TurtleAdminAdjustmentModal';
import { Trophy, ShieldAlert, Award, AlertCircle, Info, Edit3, Sparkles } from 'lucide-react';

interface Props {
  event: TurtleEvent;
  matches: TurtleMatch[];
  registrations: TurtleRegistration[];
  usersInfo: Record<string, { displayName: string; email?: string }>;
  lang: 'es' | 'en';
  isTurtleAdmin: boolean;
  cards?: any[];
  compact?: boolean;
}

export const TurtleStandingsTable: React.FC<Props> = ({
  event,
  matches,
  registrations,
  usersInfo,
  lang,
  isTurtleAdmin,
  cards,
  compact = false
}) => {
  const [selectedPlayerForAdjustment, setSelectedPlayerForAdjustment] = useState<PlayerStanding | null>(null);
  const [showRulesInfo, setShowRulesInfo] = useState(!compact);

  const standings = calculateLeagueStandings(
    event,
    matches,
    registrations,
    usersInfo,
    cards
  );

  return (
    <div className="space-y-4">
      {/* League Scoring Rules Banner */}
      {!compact && (
        <div className="bg-gradient-to-r from-green-950/30 via-[#151515] to-orange-950/20 border border-white/10 rounded-3xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                <Trophy size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase italic tracking-wide flex items-center gap-2">
                  <span>{lang === 'es' ? 'Sistema de Puntuación de Liga' : 'League Scoring System'}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    Oficial
                  </span>
                </h3>
                <p className="text-xs text-white/60">
                  {lang === 'es' 
                    ? 'Reglas oficiales de la liga con líderes únicos y ajustes de admin.' 
                    : 'Official league scoring rules with unique leaders and admin overrides.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRulesInfo(!showRulesInfo)}
              className="text-xs font-bold text-white/50 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Info size={14} />
              {showRulesInfo 
                ? (lang === 'es' ? 'Ocultar reglas' : 'Hide rules') 
                : (lang === 'es' ? 'Ver desglose' : 'View breakdown')}
            </button>
          </div>

          {showRulesInfo && (
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in text-xs">
              <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                <span className="font-black text-green-400 uppercase tracking-wider block mb-1">
                  1. {lang === 'es' ? 'Partidas' : 'Matches'}
                </span>
                <p className="text-white/80">
                  <span className="text-green-400 font-bold">Victoria:</span> 3 pts • <span className="text-red-400 font-bold">Derrota:</span> 0 pts
                </p>
              </div>

              <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                <span className="font-black text-purple-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Sparkles size={13} /> 2. {lang === 'es' ? 'Líder Único Jugado' : 'Unique Leader'}
                </span>
                <p className="text-white/80">
                  <span className="text-purple-400 font-bold">+1 pt</span> por cada líder diferente jugado (<span className="text-white font-bold">máximo 4 pts</span>). Artes alternativos cuentan como el mismo líder.
                </p>
              </div>

              <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                <span className="font-black text-orange-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <ShieldAlert size={13} /> 3. {lang === 'es' ? 'Ajustes Admin' : 'Admin Overrides'}
                </span>
                <p className="text-white/80">
                  Los admins pueden aplicar restas de puntos por partidas no jugadas o sanciones, y descalificar jugadores (DQ).
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Standings Table Card */}
      <div className="bg-[#151515] rounded-3xl p-5 border border-white/5 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" />
            <h3 className="text-xl font-black text-white uppercase italic tracking-wide">
              {lang === 'es' ? 'Clasificación General' : 'Overall Standings'}
            </h3>
            <span className="text-xs font-bold text-white/40 ml-2">
              ({standings.length} {lang === 'es' ? 'participantes' : 'participants'})
            </span>
          </div>

          {isTurtleAdmin && !compact && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-orange-400/80 font-bold hidden sm:inline">
                {lang === 'es' ? 'Modo Administrador activo' : 'Admin mode active'}
              </span>
            </div>
          )}
        </div>

        {standings.length === 0 ? (
          <div className="text-center py-12 text-white/40 font-bold">
            {lang === 'es' ? 'No hay participantes registrados.' : 'No participants registered.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-black text-white/40 uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-3">{lang === 'es' ? 'Jugador' : 'Player'}</th>
                  <th className="py-3 px-2 text-center" title="Partidas Jugadas">PJ</th>
                  <th className="py-3 px-2 text-center" title="Victorias - Derrotas">V-D</th>
                  <th className="py-3 px-2 text-center" title="Líderes Únicos Jugados (máx 4 pts)">
                    {lang === 'es' ? 'Líderes' : 'Leaders'}
                  </th>
                  {!compact && (
                    <>
                      <th className="py-3 px-2 text-center" title="Puntos Base (Victorias + Líderes)">Pts Base</th>
                      <th className="py-3 px-2 text-center" title="Sanciones / Penalizaciones por partidas no jugadas">Sanción</th>
                    </>
                  )}
                  <th className="py-3 px-3 text-right">{lang === 'es' ? 'TOTAL PTS' : 'TOTAL PTS'}</th>
                  {isTurtleAdmin && (
                    <th className="py-3 px-2 text-center w-16">{lang === 'es' ? 'Admin' : 'Admin'}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm font-medium">
                {standings.map((p) => {
                  const isTop3 = p.rank <= 3 && !p.isDisqualified;
                  const rankBadgeColor = p.isDisqualified
                    ? 'text-white/20'
                    : p.rank === 1
                    ? 'text-yellow-400 font-black text-base'
                    : p.rank === 2
                    ? 'text-slate-300 font-black'
                    : p.rank === 3
                    ? 'text-amber-600 font-black'
                    : 'text-white/40';

                  return (
                    <tr 
                      key={p.userId} 
                      className={`hover:bg-white/[0.03] transition-colors ${
                        p.isDisqualified ? 'opacity-60 bg-red-950/10' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className={`py-3.5 px-3 text-center ${rankBadgeColor}`}>
                        {p.isDisqualified ? 'DQ' : p.rank}
                      </td>

                      {/* Player Name & Badges */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold truncate max-w-[150px] sm:max-w-[200px] ${
                            p.isDisqualified ? 'text-red-400 line-through' : 'text-white'
                          }`}>
                            {p.name}
                          </span>

                          {p.isBot && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              BOT
                            </span>
                          )}

                          {p.isDisqualified && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                              DESCALIFICADO
                            </span>
                          )}
                        </div>

                        {/* Leader chips preview */}
                        {p.uniqueBaseLeaders.length > 0 && !compact && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.uniqueBaseLeaders.map(code => (
                              <span 
                                key={code} 
                                className="text-[9px] font-black bg-purple-500/10 border border-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded"
                                title={`Líder base jugado: ${code}`}
                              >
                                {code}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Matches Played */}
                      <td className="py-3.5 px-2 text-center text-white/60">
                        {p.matchesPlayed}
                      </td>

                      {/* V-D */}
                      <td className="py-3.5 px-2 text-center whitespace-nowrap text-xs font-bold">
                        <span className="text-green-400">{p.wins}V</span>
                        <span className="text-white/20 mx-1">-</span>
                        <span className="text-red-400">{p.losses}D</span>
                      </td>

                      {/* Unique Leaders */}
                      <td className="py-3.5 px-2 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/20">
                          <span>{p.uniqueLeaderCount}/4</span>
                          <span className="text-[10px] text-purple-400">(+{p.leaderPoints})</span>
                        </div>
                      </td>

                      {/* Base Points */}
                      {!compact && (
                        <td className="py-3.5 px-2 text-center text-white/50 text-xs font-bold">
                          {p.rawPoints}
                        </td>
                      )}

                      {/* Penalty Points */}
                      {!compact && (
                        <td className="py-3.5 px-2 text-center">
                          {p.penaltyPoints > 0 ? (
                            <span 
                              className="inline-flex items-center gap-1 text-xs font-black text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-lg"
                              title={p.penaltyReason || 'Sanción aplicada por admin'}
                            >
                              -{p.penaltyPoints}
                            </span>
                          ) : (
                            <span className="text-white/20 text-xs">-</span>
                          )}
                        </td>
                      )}

                      {/* Final Points */}
                      <td className="py-3.5 px-3 text-right">
                        {p.isDisqualified ? (
                          <span className="font-black text-red-500 text-sm">0 PTS</span>
                        ) : (
                          <span className="font-black text-base text-green-400">
                            {p.finalPoints} <span className="text-[10px] font-bold text-green-500/70">PTS</span>
                          </span>
                        )}
                      </td>

                      {/* Admin Actions */}
                      {isTurtleAdmin && (
                        <td className="py-3.5 px-2 text-center">
                          <button
                            onClick={() => setSelectedPlayerForAdjustment(p)}
                            className="p-1.5 bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 text-white/40 rounded-xl transition-all"
                            title={lang === 'es' ? 'Ajustar puntos / Sanciones' : 'Adjust points / Penalties'}
                          >
                            <Edit3 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Adjustment Modal */}
      {selectedPlayerForAdjustment && (
        <TurtleAdminAdjustmentModal
          event={event}
          standing={selectedPlayerForAdjustment}
          lang={lang}
          onClose={() => setSelectedPlayerForAdjustment(null)}
        />
      )}
    </div>
  );
};
