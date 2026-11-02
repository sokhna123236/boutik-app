'use client';

import React, { useState } from 'react';
import { useBoutique } from '@/context/BoutiqueContext';
import { genererLienWhatsApp } from '@/lib/whatsapp';
import { MessageSquare, CreditCard, Search, UserPlus, CheckCircle, AlertCircle, Phone, X } from 'lucide-react';

export function DettesScreen() {
  const { clients, boutique, enregistrerPaiementDette, ajouterClient } = useBoutique();

  const [recherche, setRecherche] = useState('');
  const [langueRappel, setLangueRappel] = useState<'fr' | 'wo'>('fr');

  // Modale de remboursement
  const [clientEnRemboursement, setClientEnRemboursement] = useState<string | null>(null);
  const [montantRemboursement, setMontantRemboursement] = useState<number>(0);
  const [modeRemboursement, setModeRemboursement] = useState<'especes' | 'wave' | 'orange_money'>('especes');

  // Modale d'ajout nouveau client
  const [modalNouveauClient, setModalNouveauClient] = useState(false);
  const [nomClient, setNomClient] = useState('');
  const [telClient, setTelClient] = useState('');

  // Filtrer les clients ayant une dette > 0
  const clientsDebiteurs = clients
    .filter(c => c.solde_dette > 0)
    .filter(c => c.nom.toLowerCase().includes(recherche.toLowerCase()) || c.telephone.includes(recherche))
    .sort((a, b) => b.solde_dette - a.solde_dette);

  // Total des dettes
  const totalDettes = clients.reduce((acc, c) => acc + c.solde_dette, 0);

  const ouvrirRemboursement = (clientId: string, soldeActuel: number) => {
    setClientEnRemboursement(clientId);
    setMontantRemboursement(soldeActuel);
    setModeRemboursement('especes');
  };

  const validerRemboursement = async () => {
    if (!clientEnRemboursement || montantRemboursement <= 0) return;

    await enregistrerPaiementDette(clientEnRemboursement, montantRemboursement, modeRemboursement);
    setClientEnRemboursement(null);
  };

  const creerNouveauClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomClient.trim()) return;

    await ajouterClient(nomClient.trim(), telClient.trim());
    setNomClient('');
    setTelClient('');
    setModalNouveauClient(false);
  };

  const clientCible = clients.find(c => c.id === clientEnRemboursement);

  return (
    <div className="pb-24 max-w-md mx-auto">
      {/* Carte Résumé des Dettes Totales */}
      <div className="p-4 bg-gradient-to-br from-rose-600 to-amber-600 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-rose-100 font-semibold">
              Total à recouvrer (Carnet de dettes)
            </span>
            <div className="text-3xl font-black mt-1">
              {totalDettes.toLocaleString('fr-FR')} <span className="text-sm font-semibold">FCFA</span>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-xs p-3 rounded-2xl">
            <AlertCircle className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-rose-100">
          <span>{clientsDebiteurs.length} client{clientsDebiteurs.length > 1 ? 's' : ''} endetté{clientsDebiteurs.length > 1 ? 's' : ''}</span>
          
          {/* Sélecteur de langue du rappel */}
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg">
            <span className="text-[11px] pr-1">Rappels :</span>
            <button
              onClick={() => setLangueRappel('fr')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                langueRappel === 'fr' ? 'bg-white text-rose-700' : 'text-white/80'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLangueRappel('wo')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                langueRappel === 'wo' ? 'bg-white text-rose-700' : 'text-white/80'
              }`}
            >
              Wolof
            </button>
          </div>
        </div>
      </div>

      {/* Barre d'outils : Recherche et ajout */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client ou tél..."
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-emerald-600 shadow-2xs"
          />
        </div>
        <button
          onClick={() => setModalNouveauClient(true)}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white p-2.5 rounded-xl shadow-xs flex items-center justify-center"
          title="Nouveau client"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Liste des clients endettés */}
      <div className="p-4 space-y-3">
        {clientsDebiteurs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-gray-900 text-base">Aucune dette en attente !</h3>
            <p className="text-xs text-gray-500 mt-1">
              Tous vos clients sont à jour de paiement. Bravo pour la gestion de trésorerie !
            </p>
          </div>
        ) : (
          clientsDebiteurs.map(client => {
            const lienWhatsApp = genererLienWhatsApp({
              telephoneClient: client.telephone,
              nomClient: client.nom,
              montantDette: client.solde_dette,
              nomBoutique: boutique.nom_boutique,
              telephoneBoutique: boutique.telephone,
              langue: langueRappel,
            });

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{client.nom}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{client.telephone || 'Aucun numéro'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Doit</span>
                    <div className="text-lg font-black text-rose-600">
                      {client.solde_dette.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action pour le boutiquier */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  {/* Bouton WhatsApp 1-Clic */}
                  {client.telephone ? (
                    <a
                      href={lienWhatsApp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                    >
                      <MessageSquare className="w-4 h-4 fill-white" />
                      <span>Rappeler WhatsApp</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-gray-100 text-gray-400 py-2 px-3 rounded-xl text-xs font-medium cursor-not-allowed"
                    >
                      Pas de n° WhatsApp
                    </button>
                  )}

                  {/* Bouton Encaisser Remboursement */}
                  <button
                    onClick={() => ouvrirRemboursement(client.id, client.solde_dette)}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 active:scale-95 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Encaisser</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modale d'Encaissement de Remboursement */}
      {clientEnRemboursement && clientCible && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Règlement de dette</h3>
                <p className="text-xs text-gray-500">Client : {clientCible.nom}</p>
              </div>
              <button
                onClick={() => setClientEnRemboursement(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 bg-gray-50 rounded-2xl p-4 text-center">
              <span className="text-xs text-gray-500">Dette totale actuelle</span>
              <div className="text-2xl font-black text-rose-600">
                {clientCible.solde_dette.toLocaleString('fr-FR')} FCFA
              </div>
            </div>

            {/* Montant Remboursé */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Montant que le client verse aujourd'hui
              </label>
              <input
                type="number"
                step="50"
                value={montantRemboursement}
                onChange={e => setMontantRemboursement(Number(e.target.value) || 0)}
                className="w-full text-xl font-bold p-3 rounded-xl border border-gray-300 text-center focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setMontantRemboursement(clientCible.solde_dette)}
                  className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg"
                >
                  Tout solder ({clientCible.solde_dette.toLocaleString('fr-FR')} F)
                </button>
                <button
                  type="button"
                  onClick={() => setMontantRemboursement(Math.floor(clientCible.solde_dette / 2))}
                  className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg"
                >
                  Moitié (50%)
                </button>
              </div>
            </div>

            {/* Mode de paiement */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Reçu par</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'especes', label: 'Espèces' },
                  { id: 'wave', label: 'Wave' },
                  { id: 'orange_money', label: 'Orange Money' },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModeRemboursement(m.id as any)}
                    className={`py-2 text-xs font-bold rounded-xl border ${
                      modeRemboursement === m.id
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={validerRemboursement}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Valider l'encaissement ({montantRemboursement.toLocaleString('fr-FR')} FCFA)</span>
            </button>
          </div>
        </div>
      )}

      {/* Modale Nouveau Client */}
      {modalNouveauClient && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl">
            <h3 className="font-bold text-gray-900 text-base mb-3">Nouveau client débiteur</h3>
            <form onSubmit={creerNouveauClient}>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Moussa Diatta"
                  value={nomClient}
                  onChange={e => setNomClient(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Numéro de téléphone WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 77 987 65 43"
                  value={telClient}
                  onChange={e => setTelClient(e.target.value)}
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
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
