'use client';

import React from 'react';
import { useBoutique } from '@/context/BoutiqueContext';
import { Store, Wifi, WifiOff, Cloud, Database, Sparkles } from 'lucide-react';
import { AbonnementModal } from '@/components/AbonnementModal';

export function Header() {
  const { boutique, isOnline, isSupabaseConnected } = useBoutique();
  const [dateAffichee, setDateAffichee] = React.useState('');
  const [modalAbonnement, setModalAbonnement] = React.useState(false);

  React.useEffect(() => {
    setDateAffichee(
      new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    );
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-xs">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight text-base truncate max-w-[180px]">
              {boutique.nom_boutique}
            </h1>
            <p className="text-xs text-gray-500">
              {dateAffichee || 'Aujourd\'hui'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Badge Abonnement / Essai */}
          <button
            onClick={() => setModalAbonnement(true)}
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors shadow-2xs"
            title="Gérer l'abonnement Wave"
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Essai : 14j</span>
          </button>

          {/* Badge Connexion Réseau */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
              isOnline ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-800'
            }`}
            title={isOnline ? 'En ligne' : 'Hors-ligne'}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3" />}
          </span>
        </div>
      </div>

      <AbonnementModal
        ouvert={modalAbonnement}
        onFermer={() => setModalAbonnement(false)}
      />
    </header>
  );
}
