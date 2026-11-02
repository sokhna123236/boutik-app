'use client';

import React from 'react';
import { ShoppingCart, Users, Package, BarChart3, Settings } from 'lucide-react';
import { useBoutique } from '@/context/BoutiqueContext';

export type Onglet = 'vente' | 'dettes' | 'stock' | 'bilan' | 'reglages';

interface NavigationProps {
  actif: Onglet;
  onChanger: (onglet: Onglet) => void;
}

export function Navigation({ actif, onChanger }: NavigationProps) {
  const { clients, produits } = useBoutique();

  // Nombre de clients avec dette active
  const nbDebiteurs = clients.filter(c => c.solde_dette > 0).length;
  // Nombre de produits en rupture ou sous le seuil d'alerte
  const nbAlertesStock = produits.filter(p => p.quantite_stock <= p.seuil_alerte).length;

  const items: { id: Onglet; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'vente', label: 'Vente', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'dettes', label: 'Dettes', icon: <Users className="w-5 h-5" />, badge: nbDebiteurs },
    { id: 'stock', label: 'Stock', icon: <Package className="w-5 h-5" />, badge: nbAlertesStock },
    { id: 'bilan', label: 'Bilan', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'reglages', label: 'Boutique', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map(item => {
          const estActif = actif === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChanger(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                estActif ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5">{item.label}</span>
              {estActif && (
                <span className="absolute bottom-0 w-8 h-1 bg-emerald-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
