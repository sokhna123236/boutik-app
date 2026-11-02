'use client';

import React, { useState } from 'react';
import { useBoutique } from '@/context/BoutiqueContext';
import { Store, Phone, Cloud, RotateCcw, Check, Sparkles } from 'lucide-react';

export function ReglagesScreen() {
  const { boutique, mettreAJourBoutique, reinitialiserDonnees, viderDonneesBoutique, isSupabaseConnected } = useBoutique();

  const [nomBoutique, setNomBoutique] = useState(boutique.nom_boutique);
  const [telephone, setTelephone] = useState(boutique.telephone);
  const [nomProprio, setNomProprio] = useState(boutique.nom_proprietaire || '');
  const [sauvegardeOk, setSauvegardeOk] = useState(false);

  const handleEnregistrer = (e: React.FormEvent) => {
    e.preventDefault();
    mettreAJourBoutique({
      nom_boutique: nomBoutique,
      telephone: telephone,
      nom_proprietaire: nomProprio,
    });
    setSauvegardeOk(true);
    setTimeout(() => setSauvegardeOk(false), 3000);
  };

  const handleVider = () => {
    if (confirm('Voulez-vous vider tous les produits et clients de test pour démarrer votre vraie boutique à zéro ?')) {
      viderDonneesBoutique();
      alert('Boutique remise à zéro ! Vous pouvez maintenant ajouter vos vrais produits et clients.');
    }
  };

  const handleReset = () => {
    if (confirm('Voulez-vous recharger les données d\'exemple (pain, café, lait...) ?')) {
      reinitialiserDonnees();
      alert('Données d\'exemple rechargées !');
      window.location.reload();
    }
  };

  return (
    <div className="pb-24 max-w-md mx-auto p-4 space-y-4">
      {/* Profil de la boutique */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
          <Store className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-gray-900 text-base">Informations de la Boutique</h2>
        </div>

        <form onSubmit={handleEnregistrer} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nom de la Boutique
            </label>
            <input
              type="text"
              required
              value={nomBoutique}
              onChange={e => setNomBoutique(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nom du propriétaire / gérant
            </label>
            <input
              type="text"
              value={nomProprio}
              onChange={e => setNomProprio(e.target.value)}
              placeholder="Ex: Mamadou Diallo"
              className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Numéro Wave / Orange Money (utilisé pour les relances)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                required
                value={telephone}
                onChange={e => setTelephone(e.target.value)}
                placeholder="77 123 45 67"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Ce numéro sera automatiquement inséré dans les messages WhatsApp envoyés aux clients débiteurs.
            </p>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl text-sm shadow-xs flex items-center justify-center gap-1.5"
          >
            {sauvegardeOk ? <Check className="w-4 h-4" /> : null}
            <span>{sauvegardeOk ? 'Enregistré avec succès !' : 'Enregistrer les modifications'}</span>
          </button>
        </form>
      </div>

      {/* État de connexion Supabase */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-3">
          <Cloud className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900 text-base">Synchronisation Cloud Supabase</h2>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <div>
            <span className="text-xs font-semibold text-gray-800 block">État de la base de données</span>
            <span className="text-[11px] text-gray-500">
              {isSupabaseConnected ? 'Connecté à Supabase' : 'Stockage local actif (Mode Hors-ligne / Démo)'}
            </span>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-[10px] font-bold ${
              isSupabaseConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isSupabaseConnected ? 'Synchronisé' : 'Local'}
          </span>
        </div>

        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Pour lier votre base PostgreSQL Supabase, ajoutez <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">NEXT_PUBLIC_SUPABASE_URL</code> et <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans votre fichier <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">.env.local</code>.
        </p>
      </div>

      {/* Guide Business & Pitch MVP */}
      <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Conseil terrain (Mbour, Dakar, banlieues)</span>
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Installez cette application sur le téléphone du boutiquier (via « Ajouter à l'écran d'accueil » de Chrome). Montrez-lui comment faire une vente en 3 clics et envoyer un rappel WhatsApp à un client qui lui doit 5 000 FCFA. C'est le « Aha moment » qui convertira vos premiers abonnés à 3 000 - 5 000 FCFA/mois.
        </p>
      </div>

      {/* Réinitialisation & Vider */}
      <div className="pt-2 space-y-2 text-center">
        <button
          onClick={handleVider}
          className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <span>Démarrer ma vraie boutique à zéro (Effacer les tests)</span>
        </button>

        <button
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center justify-center gap-1 mx-auto pt-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Recharger les exemples de démonstration</span>
        </button>
      </div>
    </div>
  );
}
