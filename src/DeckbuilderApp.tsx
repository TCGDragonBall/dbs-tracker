import React from 'react';

export default function DeckbuilderApp() {
  return (
    <div className="min-h-screen text-white p-6 bg-[#0a0a0A]">
      <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter text-orange-500">
        Deckbuilder
      </h1>
      <p className="text-gray-400 max-w-xl">
        Bienvenido a la fase Deckbuilder. Aquí podrás construir tus mazos utilizando las cartas disponibles.
        Todo lo relacionado con el tracker está seguro y separado en otra sección.
      </p>
    </div>
  );
}
