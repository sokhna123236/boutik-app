'use client';

import React, { useState, useEffect } from 'react';
import { BoutiqueProvider } from '@/context/BoutiqueContext';
import { Header } from '@/components/Header';
import { Navigation, Onglet } from '@/components/Navigation';
import { VentesScreen } from '@/components/screens/VentesScreen';
import { DettesScreen } from '@/components/screens/DettesScreen';
import { StockScreen } from '@/components/screens/StockScreen';
import { BilanScreen } from '@/components/screens/BilanScreen';
import { ReglagesScreen } from '@/components/screens/ReglagesScreen';
import { LoginPage } from '@/components/LoginPage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function Home() {
  const [ongletActif, setOngletActif] = useState<Onglet>('vente');
  const [estConnecte, setEstConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    // Si Supabase n'est pas configuré, on passe en mode démo directement
    if (!isSupabaseConfigured || !supabase) {
      setEstConnecte(false);
      setChargement(false);
      return;
    }

    // Vérifier si l'utilisateur est déjà connecté
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEstConnecte(!!session);
      setChargement(false);
    });

    // Écouter les changements de session (connexion/déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEstConnecte(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setEstConnecte(false);
  };

  // Écran de chargement pendant la vérification de session
  if (chargement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-xl">🛒</span>
          </div>
          <p className="text-sm text-gray-500">Chargement de BoutikApp...</p>
        </div>
      </div>
    );
  }

  // Page de connexion si non connecté
  if (!estConnecte) {
    return <LoginPage onLoginSuccess={() => setEstConnecte(true)} />;
  }

  // Application principale
  return (
    <BoutiqueProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
        <Header onLogout={handleLogout} />
        <main className="flex-1 w-full max-w-md mx-auto">
          {ongletActif === 'vente' && <VentesScreen />}
          {ongletActif === 'dettes' && <DettesScreen />}
          {ongletActif === 'stock' && <StockScreen />}
          {ongletActif === 'bilan' && <BilanScreen />}
          {ongletActif === 'reglages' && <ReglagesScreen />}
        </main>
        <Navigation actif={ongletActif} onChanger={setOngletActif} />
      </div>
    </BoutiqueProvider>
  );
}
