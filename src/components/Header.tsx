'use client';

import React from 'react';
import { useBoutique } from '@/context/BoutiqueContext';
import { Store, Wifi, WifiOff, Cloud, Database } from 'lucide-react';

export function Header() {
  const { boutique, isOnline, isSupabaseConnected } = useBoutique();
  const [dateAffichee, setDateAffichee] = React.useState('');

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

        <div className="flex items-center gap-2">
          {/* Badge Connexion Réseau */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}
            title={isOnline ? 'Connecté' : 'Mode hors-ligne'}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'En ligne' : 'Hors-ligne'}
          </span>

          {/* Badge Cloud / Supabase */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isSupabaseConnected ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
            title={isSupabaseConnected ? 'Synchronisé avec Supabase' : 'Stockage local (MVP)'}
          >
            {isSupabaseConnected ? <Cloud className="w-3 h-3" /> : <Database className="w-3 h-3" />}
            {isSupabaseConnected ? 'Cloud' : 'Local'}
          </span>
        </div>
      </div>
    </header>
  );
}
