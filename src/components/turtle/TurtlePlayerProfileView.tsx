import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Package, 
  Sparkles 
} from 'lucide-react';

interface Props {
  user: any;
  lang: 'es' | 'en';
}

export const TurtlePlayerProfileView: React.FC<Props> = ({ user, lang }) => {
  const isEs = lang === 'es';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        setLoading(true);
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          setFullName(data.fullName || data.displayName || user.displayName || '');
          setShippingAddress(data.shippingAddress || '');
          setPhone(data.phone || '');
          setEmail(data.email || user.email || '');
          setShippingNotes(data.shippingNotes || '');
        } else {
          // Defaults from auth
          setFullName(user.displayName || '');
          setEmail(user.email || '');
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const isComplete = Boolean(
    fullName.trim() && 
    shippingAddress.trim() && 
    phone.trim() && 
    email.trim()
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    try {
      setSaving(true);
      setSavedSuccess(false);

      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          fullName: fullName.trim(),
          shippingAddress: shippingAddress.trim(),
          phone: phone.trim(),
          email: email.trim(),
          shippingNotes: shippingNotes.trim(),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 5000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
      alert(isEs ? 'Error al guardar tus datos de envío.' : 'Error saving shipping details.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-16 bg-[#151515] rounded-3xl border border-white/5">
        <Package size={48} className="mx-auto text-emerald-500/40 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          {isEs ? 'Inicia sesión para gestionar tus datos de envío' : 'Log in to manage your shipping details'}
        </h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          {isEs 
            ? 'Debes estar autenticado para registrar tu dirección postal y teléfono para la entrega de premios.' 
            : 'You must be logged in to register your postal address and phone for prize delivery.'}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-52">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#151515] to-[#121212] border border-emerald-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Package size={140} className="text-emerald-400" />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Package size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                  {isEs ? 'Datos de Envío y Premios' : 'Shipping & Prize Profile'}
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Turtle School
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1 max-w-xl">
                {isEs 
                  ? 'Guarda tu dirección postal y teléfono para que los organizadores puedan enviarte tus premios físicos tras finalizar los torneos o ligas.' 
                  : 'Save your postal address and phone so organizers can deliver physical prizes to you once events conclude.'}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            {isComplete ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                <CheckCircle size={15} />
                <span>{isEs ? 'Datos Completos' : 'Details Complete'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black">
                <AlertCircle size={15} />
                <span>{isEs ? 'Datos Incompletos' : 'Pending Details'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
          <span>
            {isEs 
              ? '¡Tus datos de envío se han guardado con éxito! Se incluirán en la recopilación de premios de los administradores.' 
              : 'Your shipping details have been saved successfully! They will be included in the admin prize exports.'}
          </span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-[#151515] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-white/80 flex items-center gap-2">
              <User size={15} className="text-emerald-400" />
              <span>{isEs ? 'Nombre y Apellidos' : 'Full Name'}</span>
              <span className="text-emerald-400 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isEs ? 'Ej: Son Goku Pérez' : 'e.g. John Doe'}
              className="w-full bg-[#111] border border-white/10 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-white font-bold text-sm transition-colors placeholder:text-white/20 outline-none"
            />
            <p className="text-[11px] text-white/40">
              {isEs ? 'Nombre completo necesario para la etiqueta del envío postal.' : 'Full legal name required for the postal shipping label.'}
            </p>
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-white/80 flex items-center gap-2">
              <Mail size={15} className="text-emerald-400" />
              <span>{isEs ? 'Email de Contacto' : 'Contact Email'}</span>
              <span className="text-emerald-400 font-bold">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-[#111] border border-white/10 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-white font-bold text-sm transition-colors placeholder:text-white/20 outline-none"
            />
            <p className="text-[11px] text-white/40">
              {isEs ? 'Para avisos de seguimiento de envío o incidencias.' : 'For shipping tracking notices or inquiries.'}
            </p>
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-white/80 flex items-center gap-2">
              <Phone size={15} className="text-emerald-400" />
              <span>{isEs ? 'Teléfono de Contacto' : 'Phone Number'}</span>
              <span className="text-emerald-400 font-bold">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={isEs ? 'Ej: +34 612 345 678' : 'e.g. +1 555 123 4567'}
              className="w-full bg-[#111] border border-white/10 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-white font-bold text-sm transition-colors placeholder:text-white/20 outline-none"
            />
            <p className="text-[11px] text-white/40">
              {isEs ? 'Requerido por las agencias de transporte para avisos por SMS o llamada del repartidor.' : 'Required by courier services for delivery alerts and driver calls.'}
            </p>
          </div>

          {/* Shipping Address */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black uppercase tracking-wider text-white/80 flex items-center gap-2">
              <MapPin size={15} className="text-emerald-400" />
              <span>{isEs ? 'Dirección Completa de Envío' : 'Complete Shipping Address'}</span>
              <span className="text-emerald-400 font-bold">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder={isEs 
                ? 'Calle, número, piso/puerta, código postal, localidad, provincia y país (ej: C/ Kame House 7, 2ºB, 28001 Madrid, España)' 
                : 'Street, apt/suite, postal code, city, state/province and country'}
              className="w-full bg-[#111] border border-white/10 focus:border-emerald-500 rounded-2xl p-4 text-white text-sm font-medium transition-colors placeholder:text-white/20 outline-none resize-none leading-relaxed"
            />
            <p className="text-[11px] text-white/40">
              {isEs 
                ? 'Indica con claridad todos los detalles (calle, número, piso, puerta, código postal y población).' 
                : 'Include all delivery details (street, number, apartment, postal code, city, and country).'}
            </p>
          </div>

          {/* Delivery Notes / Observations */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black uppercase tracking-wider text-white/80 flex items-center gap-2">
              <FileText size={15} className="text-emerald-400" />
              <span>{isEs ? 'Observaciones de Entrega (Opcional)' : 'Delivery Notes (Optional)'}</span>
            </label>
            <textarea
              rows={2}
              value={shippingNotes}
              onChange={(e) => setShippingNotes(e.target.value)}
              placeholder={isEs 
                ? 'Ej: DNI para envíos a Canarias/Baleares, dejar en portería, código de acceso, etc.' 
                : 'e.g. Leave at front desk, gate code, ID for customs if applicable.'}
              className="w-full bg-[#111] border border-white/10 focus:border-emerald-500 rounded-2xl p-4 text-white text-sm font-medium transition-colors placeholder:text-white/20 outline-none resize-none"
            />
          </div>
        </div>

        {/* Security & Privacy Notice */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3 text-xs text-white/60">
          <ShieldCheck size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <p>
            {isEs
              ? 'Tus datos se almacenan de forma segura y privada. Solo se comparten con los administradores de Turtle School para gestionar el envío de los premios que ganes en torneos o ligas.'
              : 'Your information is stored securely. It is exclusively accessed by Turtle School administrators to fulfill and ship your tournament and league prizes.'}
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3 text-sm disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>{isEs ? 'Guardar Datos de Envío' : 'Save Shipping Details'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
