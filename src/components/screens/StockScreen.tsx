'use client';

import React, { useState } from 'react';
import { useBoutique } from '@/context/BoutiqueContext';
import { Plus, Minus, Search, AlertTriangle, PackagePlus, X, Check } from 'lucide-react';

export function StockScreen() {
  const { produits, mettreAJourStock, ajouterProduit } = useBoutique();

  const [recherche, setRecherche] = useState('');
  const [filtreAlerte, setFiltreAlerte] = useState(false);

  // Modale d'ajout produit
  const [modalAjout, setModalAjout] = useState(false);
  const [nom, setNom] = useState('');
  const [prixAchat, setPrixAchat] = useState<number>(0);
  const [prixVente, setPrixVente] = useState<number>(0);
  const [stockInitial, setStockInitial] = useState<number>(10);
  const [seuilAlerte, setSeuilAlerte] = useState<number>(5);

  const produitsAlertes = produits.filter(p => p.quantite_stock <= p.seuil_alerte);

  const produitsAffiches = produits
    .filter(p => (filtreAlerte ? p.quantite_stock <= p.seuil_alerte : true))
    .filter(p => p.nom.toLowerCase().includes(recherche.toLowerCase()));

  const handleAjouterProduit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || prixVente <= 0) return;

    await ajouterProduit({
      nom: nom.trim(),
      prix_achat: Number(prixAchat) || 0,
      prix_vente: Number(prixVente),
      quantite_stock: Number(stockInitial) || 0,
      seuil_alerte: Number(seuilAlerte) || 5,
    });

    setNom('');
    setPrixAchat(0);
    setPrixVente(0);
    setStockInitial(10);
    setSeuilAlerte(5);
    setModalAjout(false);
  };

  return (
    <div className="pb-24 max-w-md mx-auto">
      {/* Résumé de l'inventaire */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Articles au catalogue</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{produits.length}</div>
          </div>
          <div
            onClick={() => setFiltreAlerte(!filtreAlerte)}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              filtreAlerte
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
                : 'bg-amber-50/70 border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-900 font-medium">Alertes réappro</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-rose-600 mt-0.5">
              {produitsAlertes.length}
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'action */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-emerald-600 shadow-2xs"
          />
        </div>
        <button
          onClick={() => setModalAjout(true)}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
        >
          <PackagePlus className="w-4 h-4" />
          <span>Nouveau</span>
        </button>
      </div>

      {/* Filtre actif badge */}
      {filtreAlerte && (
        <div className="px-4 py-2 bg-rose-50 border-b border-rose-100 flex items-center justify-between text-xs text-rose-800">
          <span>Affichage filtré : produits à réapprovisionner ({produitsAlertes.length})</span>
          <button onClick={() => setFiltreAlerte(false)} className="font-bold underline">
            Voir tout
          </button>
        </div>
      )}

      {/* Liste des produits avec boutons rapides + / - */}
      <div className="p-4 space-y-2.5">
        {produitsAffiches.map(p => {
          const estStockFaible = p.quantite_stock <= p.seuil_alerte;
          const marge = p.prix_vente - p.prix_achat;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border p-3.5 flex items-center justify-between shadow-2xs ${
                estStockFaible ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200'
              }`}
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-gray-900 text-sm">{p.nom}</h3>
                  {estStockFaible && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      Bas
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>
                    Vente : <strong className="text-gray-900">{p.prix_vente.toLocaleString('fr-FR')} F</strong>
                  </span>
                  <span>
                    Marge : <strong className="text-emerald-700">+{marge.toLocaleString('fr-FR')} F</strong>
                  </span>
                </div>
              </div>

              {/* Contrôleur de stock direct */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => mettreAJourStock(p.id, -1)}
                  disabled={p.quantite_stock <= 0}
                  className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 active:scale-90 disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="text-center min-w-[36px]">
                  <span
                    className={`text-base font-black ${
                      estStockFaible ? 'text-rose-600' : 'text-gray-900'
                    }`}
                  >
                    {p.quantite_stock}
                  </span>
                </div>

                <button
                  onClick={() => mettreAJourStock(p.id, 1)}
                  className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modale Nouveau Produit */}
      {modalAjout && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
              <h3 className="font-bold text-gray-900 text-base">Ajouter un produit</h3>
              <button onClick={() => setModalAjout(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAjouterProduit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nom du produit
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Savon Madar, Riz parfumé 5kg..."
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Prix de vente (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    step="25"
                    value={prixVente || ''}
                    onChange={e => setPrixVente(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Prix d'achat (FCFA)
                  </label>
                  <input
                    type="number"
                    step="25"
                    value={prixAchat || ''}
                    onChange={e => setPrixAchat(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Stock en rayon
                  </label>
                  <input
                    type="number"
                    value={stockInitial}
                    onChange={e => setStockInitial(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Alerte si moins de
                  </label>
                  <input
                    type="number"
                    value={seuilAlerte}
                    onChange={e => setSeuilAlerte(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAjout(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
