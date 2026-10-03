import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldCheck, FileText, Cookie, X } from 'lucide-react';

interface LegalPolicyModalProps {
  activeDoc: 'privacy' | 'terms' | 'cookies' | null;
  onClose: () => void;
  onChangeDoc?: (doc: 'privacy' | 'terms' | 'cookies') => void;
  lang: 'es' | 'en';
}

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  activeDoc,
  onClose,
  onChangeDoc,
  lang
}) => {
  return (
    <AnimatePresence>
      {activeDoc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] max-h-[85vh] flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/5 transition-all outline-none"
            >
              <X size={15} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
              <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
                {activeDoc === 'privacy' && <ShieldCheck size={22} />}
                {activeDoc === 'terms' && <FileText size={22} />}
                {activeDoc === 'cookies' && <Cookie size={22} />}
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  {activeDoc === 'privacy' && (lang === 'es' ? 'Política de Privacidad' : 'Privacy Policy')}
                  {activeDoc === 'terms' && (lang === 'es' ? 'Aviso Legal y Condiciones' : 'Legal Notice & Conditions')}
                  {activeDoc === 'cookies' && (lang === 'es' ? 'Política de Cookies' : 'Cookie Policy')}
                </h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  {lang === 'es' ? 'DBSCG Tracker - Documentación Oficial RGPD' : 'DBSCG Tracker - Official Policy Documentation'}
                </p>
              </div>
            </div>

            {/* Quick Switch Tabs */}
            {onChangeDoc && (
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 mb-4 text-xs font-bold">
                <button
                  onClick={() => onChangeDoc('terms')}
                  className={`py-2 px-2 rounded-lg text-center transition-all truncate flex items-center justify-center gap-1.5 ${
                    activeDoc === 'terms'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText size={13} />
                  <span>{lang === 'es' ? 'Aviso Legal' : 'Legal Notice'}</span>
                </button>
                <button
                  onClick={() => onChangeDoc('privacy')}
                  className={`py-2 px-2 rounded-lg text-center transition-all truncate flex items-center justify-center gap-1.5 ${
                    activeDoc === 'privacy'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ShieldCheck size={13} />
                  <span>{lang === 'es' ? 'Privacidad' : 'Privacy'}</span>
                </button>
                <button
                  onClick={() => onChangeDoc('cookies')}
                  className={`py-2 px-2 rounded-lg text-center transition-all truncate flex items-center justify-center gap-1.5 ${
                    activeDoc === 'cookies'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Cookie size={13} />
                  <span>{lang === 'es' ? 'Cookies' : 'Cookies'}</span>
                </button>
              </div>
            )}

            {/* Content Body */}
            <div className="overflow-y-auto pr-2 flex-1 space-y-5 text-gray-300 text-xs sm:text-sm leading-relaxed custom-scrollbar bg-black/30 border border-white/5 p-4 sm:p-6 rounded-2xl text-left">
              {activeDoc === 'privacy' && (
                <>
                  <section>
                    <h4 className="text-white font-bold mb-1">{lang === 'es' ? '1. Información sobre el Responsable' : '1. Information About the Controller'}</h4>
                    <p>
                      {lang === 'es' 
                        ? 'DBSCG Tracker es una plataforma web de código abierto creada por y para fans del juego de cartas coleccionables Dragon Ball Super Card Game. El tratamiento de los datos personales recopilados se realiza conforme al Reglamento General de Protección de Datos (RGPD) de la UE.'
                        : 'DBSCG Tracker is an open-source web platform created by and for fans of the Dragon Ball Super Card Game. The processing of any collected personal data is carried out in accordance with the EU General Data Protection Regulation (GDPR).'}
                    </p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-1">{lang === 'es' ? '2. Datos que Recopilamos' : '2. Data We Collect'}</h4>
                    <p>
                      {lang === 'es'
                        ? 'Para habilitar las funciones de seguimiento, sincronización e inicio de sesión guardamos: Dirección de correo electrónico, nombre para mostrar, medallas virtuales conseguidas, listas de deseos (Wants) e inventario de cartas guardadas en el binder. En caso de participar en ligas/torneos de Turtle School con premios físicos, se puede almacenar de forma opcional y voluntaria el usuario de Discord o datos de envío proporcionados por el usuario. No recopilamos datos financieros directos ni información sensible.'
                        : 'To enable tracking, synchronization, and authentication features, we store: Email address, display name, virtual achievement medals, wants list configuration, and saved cards inventory inside your binder. If participating in Turtle School leagues/tournaments with physical rewards, optional Discord username and shipping details may be stored voluntarily. We do not collect financial accounts or sensitive personal details.'}
                    </p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-1">{lang === 'es' ? '3. Finalidad del Tratamiento' : '3. Purpose of Processing'}</h4>
                    <p>
                      {lang === 'es'
                        ? 'Los datos se utilizan exclusivamente para permitir el funcionamiento de tus binders virtuales y listas de deseos, asegurar la persistencia entre dispositivos del usuario, coordinar la entrega de reconocimientos en torneos y proteger el servicio técnico contra abusos o ataques.'
                        : 'Your data is processed exclusively to manage virtual card binders and wants lists, guarantee reliable persistent storage across your devices, coordinate tournament reward delivery, and protect our servers from abuse or attacks.'}
                    </p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-1">{lang === 'es' ? '4. Conservación y Derechos ARCO' : '4. Data Retention and ARCO Rights'}</h4>
                    <p>
                      {lang === 'es'
                        ? 'Los datos se conservan de forma indefinida mientras la cuenta se mantenga activa. Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO), así como la eliminación definitiva de tu usuario e inventario completo eliminando tu cuenta directamente en el perfil o contactando con el administrador.'
                        : 'Data is retained indefinitely while your account remains active. You can exercise your GDPR rights of Access, Rectification, Erasure, and Objection (ARCO rights), including permanently deleting your complete profile and collection record, directly from your profile settings or by contacting the admin.'}
                    </p>
                  </section>
                </>
              )}

              {activeDoc === 'terms' && (
                <>
                  <section>
                    <h4 className="text-white font-bold mb-1">{lang === 'es' ? '1. Propiedad Intelectual y Cláusula de Limitación' : '1. Intellectual Property & Disclaimer'}</h4>
                    <p>
                      {lang === 'es'
                        ? 'DBSCG Tracker es una herramienta web completamente NO OFICIAL y gratuita creada con fines recreativos y educativos para la comunidad de Dragon Ball Super Card Game (incluyendo formatos Fusion World y Masters). Las marcas, nombres de productos, personajes y archivos gráficos de las cartas son propiedad de Bandai Co., Ltd., Bird Studio/Shueisha y Toei Animation.'
                        : 'DBSCG Tracker is a completely UNOFFICIAL and free web tracker built for recreational and educational community purposes for the Dragon Ball Super Card Game (including Fusion World & Masters formats). Product names, trademarks, characters, and card graphic depictions belong to Bandai Co., Ltd., Bird Studio/Shueisha, and Toei Animation.'}
                    </p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-1">{lang === 'es' ? '2. Condiciones Generales de Uso' : '2. General Terms of Use'}</h4>
                    <p>
                      {lang === 'es'
                        ? 'El acceso y uso de esta plataforma implica la aceptación íntegra de estas condiciones. Queda prohibido el uso de robots, scrapers automáticos o cualquier software de saturación de peticiones para sustraer información del catálogo o inundar los servidores de base de datos.'
                        : 'Accessing and using this platform constitutes full acceptance of these terms. Using automated scripts, bots, scrapers, or crash-inducing tools to crawl the catalog page or flood the cloud database servers is strictly prohibited.'}
                    </p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-1">{lang === 'es' ? '3. Exclusión de Responsabilidades' : '3. Limitation of Liability'}</h4>
                    <p>
                      {lang === 'es'
                        ? 'Esta herramienta gratuita se ofrece "tal cual", sin garantías sobre su disponibilidad continua, exactitud absoluta de precios/cartas o permanencia de base de datos. No nos responsabilizamos de ningún daño derivado del uso o inaccesibilidad temporal de la web.'
                        : 'This free tool is offered on an "as-is" basis, with no guarantees of uninterrupted uptime, absolute catalog accuracy, or permanent database stability. We assume no liability for any potential data discrepancy or temporary system downtime.'}
                    </p>
                  </section>
                </>
              )}

              {activeDoc === 'cookies' && (
                <>
                  <section>
                    <h4 className="text-white font-bold mb-1">{lang === 'es' ? '1. ¿Qué son las Cookies?' : '1. What Are Cookies?'}</h4>
                    <p>
                      {lang === 'es'
                        ? 'Las cookies son pequeños fragmentos de texto que los sitios web envían al navegador y que se almacenan en el dispositivo del usuario. También empleamos tecnologías similares de almacenamiento local de HTML5 (localStorage) para proporcionarte una carga óptima y sin retrasos.'
                        : 'Cookies are short snippets of text sent to your browser by visited websites and stored on your device. We also deploy HTML5 Local Storage (localStorage) capabilities to deliver high performance and lag-free application loads.'}
                    </p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-1">{lang === 'es' ? '2. Cookies Técnicas que Empleamos' : '2. Technical Cookies We Use'}</h4>
                    <p>
                      {lang === 'es'
                        ? 'Este sitio web ÚNICAMENTE utiliza cookies de naturaleza estrictamente técnica y de almacenamiento funcional necesario para: persistencia de tus credenciales de inicio sesión de Firebase (evitar tener que registrarte cada vez), idioma preferente elegido, filtro dinámico de juego (Masters / Fusion) y el registro del propio consentimiento de aceptación de este aviso de cookies.'
                        : 'This platform EXCLUSIVELY uses cookies and local identifiers of a strictly technical and functional nature to: secure Firebase user active log-in tokens, persist your active language preferences, store selected default game filters (Masters or Fusion World), and record your confirmation parameter for this cookie consent banner.'}
                    </p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-1">{lang === 'es' ? '3. Terceros y Rastreo' : '3. Third-party & Profiling'}</h4>
                    <p>
                      {lang === 'es'
                        ? 'Totalmente comprometidos con tu privacidad: no integramos cookies de segmentación comercial, píxeles de Facebook, cookies analíticas de rastreo invasivo, ni compartimos identificadores con anunciantes de ningún tipo. Es una navegación limpia.'
                        : 'Committed to ultimate privacy: we do not integrate any tracking cookies, Facebook marketing pixels, Google Analytics invasive profiling, or advertising trackers. Your data stays localized and your navigation clean.'}
                    </p>
                  </section>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={onClose}
                className="bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl border border-white/10 transition-all active:scale-95 cursor-pointer"
              >
                {lang === 'es' ? 'Cerrar Documento' : 'Close Document'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
