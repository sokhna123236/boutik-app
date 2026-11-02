'use client';

import React, { useState } from 'react';
import { BoutiqueProvider } from '@/context/BoutiqueContext';
import { Header } from '@/components/Header';
import { Navigation, Onglet } from '@/components/Navigation';
import { VentesScreen } from '@/components/screens/VentesScreen';
import { DettesScreen } from '@/components/screens/DettesScreen';
import { StockScreen } from '@/components/screens/StockScreen';
import { BilanScreen } from '@/components/screens/BilanScreen';
import { ReglagesScreen } from '@/components/screens/ReglagesScreen';

export default function Home() {
  const [ongletActif, setOngletActif] = useState<Onglet>('vente');

  return (
    <BoutiqueProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
        {/* En-tête mobile */}
        <Header />

        {/* Contenu principal de l'écran actif */}
        <main className="flex-1 w-full max-w-md mx-auto">
          {ongletActif === 'vente' && <VentesScreen />}
          {ongletActif === 'dettes' && <DettesScreen />}
          {ongletActif === 'stock' && <StockScreen />}
          {ongletActif === 'bilan' && <BilanScreen />}
          {ongletActif === 'reglages' && <ReglagesScreen />}
        </main>

        {/* Barre de navigation basse */}
        <Navigation actif={ongletActif} onChanger={setOngletActif} />
      </div>
    </BoutiqueProvider>
  );
}
