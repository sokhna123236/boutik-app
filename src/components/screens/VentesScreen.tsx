'use client';

import React, { useState } from 'react';
import { useBoutique } from '@/context/BoutiqueContext';
import { LigneVente } from '@/types/database';
import { Search, Plus, Minus, Check, ArrowRight, UserPlus, ShoppingBag, X } from 'lucide-react';

export function VentesScreen() {
  const { produits, clients, ajouterVente, ajouterClient } = useBoutique();

  // État du panier
  const [panier, setPanier] = useState<{ [produitId: string]: number }>({});
  const [recherche, setRecherche] = useState('');

  // Modale d'encaissement
  const [modalEncaissement, setModalEncaissement] = useState(false);
  const [modePaiement, setModePaiement] = useState<'especes' | 'wave' | 'orange_money' | 'dette'>('especes');
  const [montantRecu, setMontantRecu] = useState<number>(0);
  const [clientIdSelectionne, setClientIdSelectionne] = useState<string>('');

  // Modale d'ajout rapide de client
  const [modalNouveauClient, setModalNouveauClient] = useState(false);
  const [nouveauNomClient, setNouveauNomClient] = useState('');
  const [nouveauTelClient, setNouveauTelClient] = useState('');

  // Message de succès
  const [succesMessage, setSuccesMessage] = useState<string | null>(null);

  // Calcul du total du panier
  const lignesPanier: LigneVente[] = Object.entries(panier)
    .filter(([_, qte]) => qte > 0)
    .map(([pId, qte]) => {
      const p = produits.find(prod => prod.id === pId)!;
      return {
        produit_id: p.id,
        nom_produit: p.nom,
        quantite: qte,
        prix_unitaire: p.prix_vente,
        sous_total: p.prix_vente * qte,
      };
    });

  const totalPanier = lignesPanier.reduce((sum, l) => sum + l.sous_total, 0);
  const totalArticles = lignesPanier.reduce((sum, l) => sum + l.quantite, 0);

  // Fonctions du panier
  const modifierQuantite = (produitId: string, delta: number) => {
    const qteActuelle = panier[produitId] || 0;
    const nouvelleQte = Math.max(0, qteActuelle + delta);
    setPanier(prev => ({
      ...prev,
      [produitId]: nouvelleQte,
    }));
  };

  const ouvrirEncaissement = () => {
    if (totalPanier === 0) return;
    setMontantRecu(totalPanier);
    setModePaiement('especes');
    setClientIdSelectionne('');
    setModalEncaissement(true);
  };

  const reinitialiserPanier = () => {
    setPanier({});
    setModalEncaissement(false);
    setMontantRecu(0);
  };

  const validerLaVente = async () => {
    if (totalPanier === 0) return;

    const reste = Math.max(0, totalPanier - montantRecu);

    // Si dette mais aucun client sélectionné
    if (reste > 0 && !clientIdSelectionne) {
      alert('Veuillez sélectionner le client pour enregistrer la dette.');
      return;
    }

    const clientObj = clients.find(c => c.id === clientIdSelectionne);

    await ajouterVente({
      clientId: clientIdSelectionne || null,
      nomClient: clientObj ? clientObj.nom : undefined,
      lignes: lignesPanier,
      total: totalPanier,
      montantPaye: montantRecu,
      modePaiement: reste === totalPanier ? 'dette' : modePaiement,
    });

    setSuccesMessage(
      reste > 0
        ? `Vente validée ! Reste dû : ${reste.toLocaleString('fr-FR')} FCFA au compte de ${clientObj?.nom}.`
        : `Vente de ${totalPanier.toLocaleString('fr-FR')} FCFA encaissée avec succès !`
    );

    reinitialiserPanier();

    setTimeout(() => {
      setSuccesMessage(null);
    }, 3500);
  };

  const creerEtSelectionnerClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauNomClient.trim()) return;

    const cree = await ajouterClient(nouveauNomClient.trim(), nouveauTelClient.trim());
    setClientIdSelectionne(cree.id);
    setNouveauNomClient('');
    setNouveauTelClient('');
    setModalNouveauClient(false);
  };

  // Filtrage des produits
  const produitsFiltres = produits.filter(p =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  const resteAPayer = Math.max(0, totalPanier - montantRecu);

  return (
    <div className="pb-28">
      {/* Toast de succès */}
      {succesMessage && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-sm animate-bounce">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{succesMessage}</span>
          </div>
          <button onClick={() => setSuccesMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barre de recherche rapide */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit (ex: pain, café, lait...)"
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-emerald-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Grille des produits - Cartes tactiles larges pour mobile */}
      <div className="p-4 grid grid-cols-2 gap-3 max-w-md mx-auto">
        {produitsFiltres.map(p => {
          const qteDansPanier = panier[p.id] || 0;
          const estStockFaible = p.quantite_stock <= p.seuil_alerte;
          const estEpuise = p.quantite_stock <= 0;

          return (
            <div
              key={p.id}
              onClick={() => !estEpuise && modifierQuantite(p.id, 1)}
              className={`relative bg-white rounded-2xl border p-3.5 flex flex-col justify-between transition-all active:scale-95 cursor-pointer select-none ${
                qteDansPanier > 0
                  ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-gray-200 shadow-2xs hover:border-gray-300'
              } ${estEpuise ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Badge quantité dans le panier */}
              {qteDansPanier > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-600 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-xs">
                  {qteDansPanier}
                </span>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">
                  {p.nom}
                </h3>
                <p className="text-emerald-700 font-bold text-base mt-1">
                  {p.prix_vente.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                <span
                  className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                    estEpuise
                      ? 'bg-rose-100 text-rose-700'
                      : estStockFaible
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Stock: {p.quantite_stock}
                </span>

                {/* Boutons + et - directs */}
                {qteDansPanier > 0 && (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => modifierQuantite(p.id, -1)}
                      className="w-7 h-7 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 active:scale-90"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => modifierQuantite(p.id, 1)}
                      className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-700 active:scale-90"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Barre flottante du panier en bas (au-dessus de la nav) */}
      {totalPanier > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 py-2">
          <div className="max-w-md mx-auto bg-gray-900 text-white rounded-2xl p-3 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-2 pl-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs text-gray-300 block">
                  {totalArticles} article{totalArticles > 1 ? 's' : ''}
                </span>
                <span className="font-extrabold text-base text-white">
                  {totalPanier.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={reinitialiserPanier}
                className="text-xs text-gray-400 hover:text-white px-2 py-1"
              >
                Vider
              </button>
              <button
                onClick={ouvrirEncaissement}
                className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <span>Encaisser</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'Encaissement & Gestion de dette */}
      {modalEncaissement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-900">Finaliser la vente</h2>
              <button
                onClick={() => setModalEncaissement(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total à payer */}
            <div className="my-4 bg-emerald-50 rounded-2xl p-4 text-center">
              <span className="text-xs text-emerald-800 uppercase font-semibold">Total à payer</span>
              <div className="text-3xl font-extrabold text-emerald-700">
                {totalPanier.toLocaleString('fr-FR')}{' '}
                <span className="text-sm font-semibold">FCFA</span>
              </div>
            </div>

            {/* Mode de paiement */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Moyen de paiement
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'especes', label: 'Espèces' },
                  { id: 'wave', label: 'Wave' },
                  { id: 'orange_money', label: 'OM' },
                  { id: 'dette', label: 'Dette' },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setModePaiement(m.id as any);
                      if (m.id === 'dette') setMontantRecu(0);
                    }}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                      modePaiement === m.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Montant Reçu */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-700">Montant reçu du client</label>
                <button
                  type="button"
                  onClick={() => setMontantRecu(totalPanier)}
                  className="text-xs text-emerald-600 font-bold hover:underline"
                >
                  Montant exact
                </button>
              </div>
              <input
                type="number"
                step="50"
                value={montantRecu}
                onChange={e => setMontantRecu(Number(e.target.value) || 0)}
                className="w-full text-xl font-bold p-3 rounded-xl border border-gray-300 text-center focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />

              {/* Raccourcis monnaie */}
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                {[500, 1000, 2000, 5000, 10000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMontantRecu(val)}
                    className="flex-1 py-1 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-semibold rounded-lg text-center"
                  >
                    {val.toLocaleString('fr-FR')}
                  </button>
                ))}
              </div>
            </div>

            {/* Alerte Dette si reste > 0 */}
            {resteAPayer > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between text-amber-900 font-bold text-sm">
                  <span>Reste à payer (Dette) :</span>
                  <span className="text-base text-rose-600 font-extrabold">
                    {resteAPayer.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  Ce montant sera ajouté au carnet de crédit du client.
                </p>

                {/* Sélecteur de client obligatoire en cas de dette */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">À quel client imputer cette dette ?</span>
                    <button
                      type="button"
                      onClick={() => setModalNouveauClient(true)}
                      className="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:underline"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Nouveau client
                    </button>
                  </div>
                  <select
                    value={clientIdSelectionne}
                    onChange={e => setClientIdSelectionne(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Choisir un client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nom} ({c.telephone || 'Sans tél'}) — Dette actuelle : {c.solde_dette} FCFA
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Bouton de validation finale */}
            <button
              onClick={validerLaVente}
              disabled={resteAPayer > 0 && !clientIdSelectionne}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                resteAPayer > 0 && !clientIdSelectionne
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>Valider la vente ({totalPanier.toLocaleString('fr-FR')} FCFA)</span>
            </button>
          </div>
        </div>
      )}

      {/* Modale Rapide Nouveau Client */}
      {modalNouveauClient && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl">
            <h3 className="font-bold text-gray-900 text-base mb-3">Ajouter un nouveau client</h3>
            <form onSubmit={creerEtSelectionnerClient}>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Babacar Diop"
                  value={nouveauNomClient}
                  onChange={e => setNouveauNomClient(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Numéro de téléphone (pour rappels WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 77 123 45 67"
                  value={nouveauTelClient}
                  onChange={e => setNouveauTelClient(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalNouveauClient(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
