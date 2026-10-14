import React, { useState } from 'react';
import { TurtleEvent, TurtleMatch, TurtleRegistration, TurtleUserInfo } from './types';
import { calculateLeagueStandings, PlayerStanding, findLeaderCard, formatCardImageUrl } from './standingsEngine';
import { TurtleAdminAdjustmentModal } from './TurtleAdminAdjustmentModal';
import { exportTournamentPrizesExcel } from './turtlePrizesExcel';
import { 
  Trophy, 
  ShieldAlert, 
  Award, 
  AlertCircle, 
  Info, 
  Edit3, 
  Sparkles, 
  FileSpreadsheet, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  Copy, 
  Check, 
  X,
  User,
  AtSign,
  Eye,
  RefreshCw,
  Shield
} from 'lucide-react';

interface Props {
  event: TurtleEvent;
  matches: TurtleMatch[];
  registrations: TurtleRegistration[];
  usersInfo: Record<string, TurtleUserInfo>;
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
  const [viewingShippingPlayer, setViewingShippingPlayer] = useState<PlayerStanding | null>(null);
  const [viewingLeadersPlayer, setViewingLeadersPlayer] = useState<PlayerStanding | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [copiedShipping, setCopiedShipping] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showRulesInfo, setShowRulesInfo] = useState(!compact);

  const standings = calculateLeagueStandings(
    event,
    matches,
    registrations,
    usersInfo,
    cards
  );

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportTournamentPrizesExcel({
        event,
        standings,
        usersInfo,
        lang
      });
    } catch (err) {
      console.error('Error exporting prizes excel:', err);
      alert(lang === 'es' ? 'Error al exportar a Excel.' : 'Error exporting to Excel.');
    } finally {
      setIsExporting(false);
    }
  };

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
            <div className={`mt-4 pt-4 border-t border-white/10 grid grid-cols-1 ${event.type === 'league' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 animate-fade-in text-xs`}>
              <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                <span className="font-black text-green-400 uppercase tracking-wider block mb-1">
                  1. {lang === 'es' ? 'Partidas' : 'Matches'}
                </span>
                <p className="text-white/80">
                  <span className="text-green-400 font-bold">Victoria:</span> 3 pts • <span className="text-red-400 font-bold">Derrota:</span> 0 pts
                </p>
              </div>

              {event.type === 'league' && (
                <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                  <span className="font-black text-purple-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Sparkles size={13} /> 2. {lang === 'es' ? 'Líder Único Jugado' : 'Unique Leader'}
                  </span>
                  <p className="text-white/80">
                    <span className="text-purple-400 font-bold">+1 pt</span> por cada líder diferente jugado (<span className="text-white font-bold">máximo 4 pts</span>). Artes alternativos cuentan como el mismo líder.
                  </p>
                </div>
              )}

              <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                <span className="font-black text-orange-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <ShieldAlert size={13} /> {event.type === 'league' ? '3.' : '2.'} {lang === 'es' ? 'Ajustes Admin' : 'Admin Overrides'}
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

          <div className="flex items-center gap-3">
            {isTurtleAdmin && (
              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)] disabled:opacity-50"
                title={lang === 'es' ? 'Descargar Excel con clasificación y datos de envío de los jugadores' : 'Download Excel with standings and player shipping info'}
              >
                <FileSpreadsheet size={15} />
                <span>
                  {isExporting 
                    ? (lang === 'es' ? 'Exportando...' : 'Exporting...') 
                    : (lang === 'es' ? 'Exportar Premios (Excel)' : 'Export Prizes (Excel)')}
                </span>
              </button>
            )}

            {isTurtleAdmin && !compact && (
              <span className="text-xs text-orange-400/80 font-bold hidden sm:inline">
                {lang === 'es' ? 'Modo Administrador activo' : 'Admin mode active'}
              </span>
            )}
          </div>
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
                  <th className="py-3 px-3">{lang === 'es' ? 'Jugador (Oficial)' : 'Player (Official)'}</th>
                  <th className="py-3 px-2 text-center" title="Partidas Jugadas">PJ</th>
                  <th className="py-3 px-2 text-center" title="Victorias - Derrotas">V-D</th>
                  <th className="py-3 px-2 text-center" title={event.type === 'league' ? (lang === 'es' ? 'Líderes Únicos Jugados (máx 4 pts en Liga)' : 'Unique Leaders Played (max 4 pts in League)') : (lang === 'es' ? 'Líderes Jugados' : 'Leaders Played')}>
                    {lang === 'es' ? 'Líderes' : 'Leaders'}
                  </th>
                  {!compact && (
                    <>
                      <th className="py-3 px-2 text-center" title={event.type === 'league' ? (lang === 'es' ? 'Puntos Base (Victorias + Líderes)' : 'Base Points (Wins + Leaders)') : (lang === 'es' ? 'Puntos Base (Victorias x3)' : 'Base Points (Wins x3)')}>
                        {lang === 'es' ? 'Pts Base' : 'Base Pts'}
                      </th>
                      <th className="py-3 px-2 text-center" title={lang === 'es' ? 'Sanciones / Penalizaciones por partidas no jugadas' : 'Penalties for unplayed matches'}>
                        {lang === 'es' ? 'Sanción' : 'Penalty'}
                      </th>
                    </>
                  )}
                  <th className="py-3 px-3 text-right">{lang === 'es' ? 'TOTAL PTS' : 'TOTAL PTS'}</th>
                  {isTurtleAdmin && (
                    <th className="py-3 px-2 text-center" title="Datos de envío de premios">
                      {lang === 'es' ? 'Envío' : 'Shipping'}
                    </th>
                  )}
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

                          {p.accountName && p.accountName !== p.name && !p.isBot && (
                            <span 
                              className="text-[10px] text-white/40 truncate max-w-[120px] hidden sm:inline"
                              title={`${lang === 'es' ? 'Nombre en cuenta' : 'Account name'}: ${p.accountName}`}
                            >
                              ({p.accountName})
                            </span>
                          )}

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

                        {/* Ver líderes button */}
                        {p.uniqueLeaderCount > 0 && (
                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingLeadersPlayer(p);
                              }}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-purple-200 border border-purple-500/30 text-[10px] font-black transition-all shadow-sm group hover:scale-[1.02] active:scale-[0.98]"
                              title={lang === 'es' ? 'Ver líderes jugados' : 'View played leaders'}
                            >
                              <Eye size={12} className="text-purple-400 group-hover:text-purple-200 transition-colors" />
                              <span>{lang === 'es' ? 'Ver líderes' : 'View leaders'}</span>
                              <span className="text-[9px] px-1 py-0.2 bg-purple-500/30 rounded-md text-purple-200 font-bold">
                                {p.uniqueLeaderCount}
                              </span>
                            </button>
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
                        {p.uniqueLeaderCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => setViewingLeadersPlayer(p)}
                            className="group transition-transform hover:scale-105"
                            title={lang === 'es' ? 'Ver líderes jugados' : 'View played leaders'}
                          >
                            {event.type === 'league' ? (
                              <div className="inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-lg bg-purple-500/15 group-hover:bg-purple-500/25 text-purple-300 border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                                <span>{p.uniqueLeaderCount}/4</span>
                                <span className="text-[10px] text-purple-400">(+{p.leaderPoints})</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-lg bg-white/5 group-hover:bg-white/10 text-white/70 group-hover:text-white border border-white/10 group-hover:border-white/20 transition-colors">
                                <span>{p.uniqueLeaderCount}</span>
                              </div>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-white/30 font-medium">0</span>
                        )}
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

                      {/* Shipping status column for admin */}
                      {isTurtleAdmin && (
                        <td className="py-3.5 px-2 text-center">
                          {p.isBot ? (
                            <span className="text-[10px] text-white/30 font-bold">Bot</span>
                          ) : (() => {
                            const uInfo = usersInfo[p.userId];
                            const hasCompleteShipping = Boolean(uInfo?.fullName?.trim() && uInfo?.shippingAddress?.trim() && uInfo?.phone?.trim());
                            return (
                              <button
                                onClick={() => setViewingShippingPlayer(p)}
                                className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border transition-all active:scale-95 ${
                                  hasCompleteShipping
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                                }`}
                                title={lang === 'es' ? 'Ver dirección y datos de envío de este jugador' : 'View shipping address & details'}
                              >
                                {hasCompleteShipping ? (
                                  <>
                                    <Package size={12} />
                                    <span>{lang === 'es' ? 'Listo' : 'Ready'}</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle size={12} />
                                    <span>{lang === 'es' ? 'Faltan' : 'Pending'}</span>
                                  </>
                                )}
                              </button>
                            );
                          })()}
                        </td>
                      )}

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

      {/* Player Shipping Info Modal for Admin */}
      {viewingShippingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#181818] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Package size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase italic">
                    {lang === 'es' ? 'Datos de Envío de Premios' : 'Prize Shipping Information'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {viewingShippingPlayer.name} (Rank #{viewingShippingPlayer.rank})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setViewingShippingPlayer(null); setCopiedShipping(false); }}
                className="p-2 text-white/40 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {(() => {
              const uInfo = usersInfo[viewingShippingPlayer.userId];
              const fullName = uInfo?.fullName || '';
              const discordUsername = uInfo?.discordUsername || '';
              const address = uInfo?.shippingAddress || '';
              const phone = uInfo?.phone || '';
              const email = uInfo?.email || viewingShippingPlayer.email || '';
              const notes = uInfo?.shippingNotes || '';

              const fullLabel = `Nombre Oficial (Torneos): ${viewingShippingPlayer.name}\nNombre de Cuenta: ${viewingShippingPlayer.accountName || uInfo?.displayName || 'No especificado'}\nDestinatario: ${fullName || viewingShippingPlayer.name}\nUsuario / Discord: ${discordUsername ? `@${discordUsername.replace(/^@/, '')}` : 'No especificado'}\nDirección: ${address || 'Sin dirección'}\nTeléfono: ${phone || 'Sin teléfono'}\nEmail: ${email}\n${notes ? `Notas: ${notes}` : ''}`;

              const handleCopy = () => {
                navigator.clipboard.writeText(fullLabel);
                setCopiedShipping(true);
                setTimeout(() => setCopiedShipping(false), 3000);
              };

              return (
                <div className="space-y-4">
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-white/5">
                      <div className="flex items-start gap-2.5">
                        <Award size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-white/40 font-bold block">{lang === 'es' ? 'Nombre Oficial (Torneos)' : 'Official Tournament Name'}:</span>
                          <span className="text-yellow-400 font-black text-sm">{viewingShippingPlayer.name}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <User size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-white/40 font-bold block">{lang === 'es' ? 'Nombre de Cuenta / Registro' : 'Account / User Name'}:</span>
                          <span className="text-white/80 font-bold text-sm">{viewingShippingPlayer.accountName || uInfo?.displayName || (lang === 'es' ? 'Cuenta de Jugador' : 'Player Account')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-white/5">
                      <div className="flex items-start gap-2.5">
                        <User size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-white/40 font-bold block">{lang === 'es' ? 'Nombre Completo (Envío)' : 'Full Name (Shipping)'}:</span>
                          <span className="text-white font-bold text-sm">{fullName || (lang === 'es' ? '⚠️ No especificado' : '⚠️ Unspecified')}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <AtSign size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-white/40 font-bold block">{lang === 'es' ? 'Usuario / Discord' : 'Username / Discord'}:</span>
                          <span className="text-emerald-400 font-bold text-sm">
                            {discordUsername ? `@${discordUsername.replace(/^@/, '')}` : (lang === 'es' ? '⚠️ No especificado' : '⚠️ Unspecified')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-white/40 font-bold block">{lang === 'es' ? 'Dirección Postal de Envío' : 'Shipping Address'}:</span>
                        <span className="text-white font-medium whitespace-pre-wrap leading-relaxed">{address || (lang === 'es' ? '⚠️ Sin dirección registrada' : '⚠️ No address recorded')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                      <div className="flex items-start gap-2.5">
                        <Phone size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-white/40 font-bold block">{lang === 'es' ? 'Teléfono de Contacto' : 'Phone'}:</span>
                          <span className="text-white font-bold">{phone || (lang === 'es' ? '⚠️ Sin teléfono' : '⚠️ No phone')}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Mail size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-white/40 font-bold block">Email:</span>
                          <span className="text-white font-bold truncate max-w-[170px]">{email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {notes && (
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-white/40 font-bold block mb-1">{lang === 'es' ? 'Observaciones de Entrega' : 'Delivery Notes'}:</span>
                        <span className="text-white/80 italic">{notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                      {copiedShipping ? <Check size={15} /> : <Copy size={15} />}
                      <span>{copiedShipping ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar para Etiqueta' : 'Copy Shipping Label')}</span>
                    </button>
                    <button
                      onClick={() => setViewingShippingPlayer(null)}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition-colors"
                    >
                      {lang === 'es' ? 'Cerrar' : 'Close'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal: Ver Líderes Jugados */}
      {viewingLeadersPlayer && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#151515] border border-white/10 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-start flex-shrink-0 bg-gradient-to-r from-purple-950/20 via-[#151515] to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>{lang === 'es' ? 'Líderes Jugados' : 'Played Leaders'}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {viewingLeadersPlayer.uniqueLeaderCount} {lang === 'es' ? 'únicos' : 'unique'}
                    </span>
                  </h3>
                  <p className="text-xs text-white/50 font-medium mt-0.5">
                    {lang === 'es' ? 'Jugador' : 'Player'}: <strong className="text-white">{viewingLeadersPlayer.name}</strong>
                    {event.type === 'league' && (
                      <span className="text-purple-400 font-bold ml-2">
                        • {viewingLeadersPlayer.leaderPoints} {lang === 'es' ? 'puntos en liga' : 'league points'} (máx 4)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setViewingLeadersPlayer(null);
                  setFlippedCards({});
                }}
                className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-white/50 transition-colors"
                title={lang === 'es' ? 'Cerrar' : 'Close'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content: Leader Cards Grid */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-white/10">
              {(() => {
                const leadersList = (viewingLeadersPlayer.leaderDetails && viewingLeadersPlayer.leaderDetails.length > 0)
                  ? viewingLeadersPlayer.leaderDetails
                  : (viewingLeadersPlayer.uniqueBaseLeaders || []).map(code => {
                      const c = findLeaderCard(code, cards);
                      return {
                        key: code,
                        displayCode: code,
                        cardId: code,
                        name: c?.name,
                        imageUrl: c?.imageUrl,
                        backImageUrl: c?.backImageUrl,
                        color: c?.color,
                        rarity: c?.rarity,
                        power: c?.power,
                        card: c
                      };
                    });

                if (leadersList.length === 0) {
                  return (
                    <div className="text-center py-12 text-white/40 font-bold">
                      {lang === 'es' ? 'No hay líderes registrados para este jugador en este evento.' : 'No leaders recorded for this player in this event.'}
                    </div>
                  );
                }

                return (
                  <div className={`grid gap-4 ${
                    leadersList.length === 1 
                      ? 'grid-cols-1 max-w-xs mx-auto' 
                      : leadersList.length === 2 
                      ? 'grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto' 
                      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                  }`}>
                    {leadersList.map((leader, idx) => {
                      const isFlipped = !!flippedCards[leader.key || String(idx)];
                      const cardObj = leader.card || findLeaderCard(leader.displayCode, cards);
                      
                      let frontImg = leader.imageUrl || cardObj?.imageUrl;
                      let backImg = leader.backImageUrl || cardObj?.backImageUrl;
                      
                      if (frontImg?.startsWith('/')) frontImg = `https://dragonball.center${frontImg}`;
                      if (backImg?.startsWith('/')) backImg = `https://dragonball.center${backImg}`;
                      
                      if (!frontImg && leader.displayCode) {
                        frontImg = `https://www.dbs-cardgame.com/images/cardlist/cardimg/${leader.displayCode}.png`;
                      }

                      const currentImg = (isFlipped && backImg) ? backImg : frontImg;
                      const cardName = cardObj?.name || leader.name || leader.displayCode;
                      const cardColor = cardObj?.color || leader.color;
                      const cardPower = cardObj?.power || leader.power;
                      const cardRarity = cardObj?.rarity || leader.rarity;

                      // Color classes
                      const colorClass = (() => {
                        if (!cardColor) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                        const c = cardColor.toLowerCase();
                        if (c.includes('red') || c.includes('rojo')) return 'bg-red-500/20 text-red-300 border-red-500/30';
                        if (c.includes('blue') || c.includes('azul')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                        if (c.includes('green') || c.includes('verde')) return 'bg-green-500/20 text-green-300 border-green-500/30';
                        if (c.includes('yellow') || c.includes('amarillo')) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
                        if (c.includes('black') || c.includes('negro')) return 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40';
                        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                      })();

                      return (
                        <div
                          key={leader.key || leader.cardId || idx}
                          className="bg-black/40 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between hover:border-purple-500/40 transition-all shadow-lg group"
                        >
                          {/* Card Image Container */}
                          <div className="relative aspect-[2.5/3.5] rounded-xl overflow-hidden bg-black/60 border border-white/5 shadow-inner mb-3">
                            {currentImg ? (
                              <img
                                src={currentImg}
                                alt={cardName}
                                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                                loading="lazy"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT1-001.png';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-white/30">
                                <Shield size={36} className="mb-2 text-white/20" />
                                <span className="font-mono font-bold text-sm text-white/60">{leader.displayCode}</span>
                              </div>
                            )}

                            {/* Back / Front Tag */}
                            {backImg && (
                              <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md bg-black/80 text-white border-white/20">
                                {isFlipped ? 'Back' : 'Front'}
                              </div>
                            )}
                          </div>

                          {/* Details & Controls */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                {leader.displayCode}
                              </span>
                              {cardColor && (
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${colorClass}`}>
                                  {cardColor}
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight" title={cardName}>
                                {cardName}
                              </h4>
                              {(cardPower || cardRarity) && (
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-white/40 font-medium">
                                  {cardPower && <span>Poder: <strong className="text-white/70">{cardPower}</strong></span>}
                                  {cardRarity && <span>• {cardRarity}</span>}
                                </div>
                              )}
                            </div>

                            {/* Flip card button: Ver Back / Ver Front */}
                            {backImg && (
                              <button
                                type="button"
                                onClick={() => {
                                  const cardKey = leader.key || String(idx);
                                  setFlippedCards(prev => ({
                                    ...prev,
                                    [cardKey]: !prev[cardKey]
                                  }));
                                }}
                                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-purple-500/20 text-white/80 hover:text-purple-300 border border-white/10 hover:border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                              >
                                <RefreshCw size={13} className={isFlipped ? 'rotate-180 transition-transform' : 'transition-transform'} />
                                <span>
                                  {isFlipped 
                                    ? (lang === 'es' ? 'Ver Front' : 'View Front') 
                                    : (lang === 'es' ? 'Ver Back' : 'View Back')}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-[#121212] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setViewingLeadersPlayer(null);
                  setFlippedCards({});
                }}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
              >
                {lang === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
