'use client';

import React, { useState } from 'react';
import { X, Check, Copy, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';
import { useBoutique } from '@/context/BoutiqueContext';

interface AbonnementModalProps {
  ouvert: boolean;
  onFermer: () => void;
}

export function AbonnementModal({ ouvert, onFermer }: AbonnementModalProps) {
  const { boutique } = useBoutique();
  const [copie, setCopie] = useState(false);

  if (!ouvert) return null;

  const numeroWave = '777132144';
  const numeroWaveFormate = '77 713 21 44';
  const tarif = '3 000';

  const copierNumero = () => {
    navigator.clipboard.writeText(numeroWave);
    setCopie(true);
    setTimeout(() => setCopie(false), 2500);
  };

  // Lien WhatsApp direct vers VOUS (la fondatrice/fondateur) pour confirmation de paiement
  const messageConfirmation = encodeURIComponent(
    `Bonjour, je viens d'effectuer le paiement Wave de ${tarif} FCFA pour renouveler l'abonnement de ma boutique : *${boutique.nom_boutique}*. Merci d'activer mon compte !`
  );
  const lienWhatsAppAdmin = `https://wa.me/221${numeroWave}?text=${messageConfirmation}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onFermer}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Pro */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>ABONNEMENT BOUTIKAPP</span>
          </div>
          <h2 className="text-xl font-black text-gray-900">
            Passez au statut Illimité
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Gérez vos dettes, votre stock et vos rappels WhatsApp sans aucune interruption.
          </p>
        </div>

        {/* Carte Prix */}
        <div className="my-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 text-center shadow-md">
          <span className="text-xs text-emerald-100 font-semibold uppercase">Formule Mensuelle</span>
          <div className="text-3xl font-black mt-1">
            {tarif} <span className="text-sm font-semibold">FCFA / mois</span>
          </div>
          <p className="text-[11px] text-emerald-100 mt-1">
            Moins de 100 FCFA par jour pour récupérer toutes vos dettes !
          </p>
        </div>

        {/* Avantages */}
        <div className="space-y-2 mb-4 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Rappels de dettes WhatsApp <strong>en 1 clic illimités</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Sauvegarde sécurisée de vos clients et stocks</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Bilan journalier du bénéfice et chiffre d'affaires</span>
          </div>
        </div>

        {/* Instructions de paiement Wave */}
        <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sky-900">Payer par Wave au numéro :</span>
            <span className="text-[10px] bg-sky-200 text-sky-900 font-bold px-2 py-0.5 rounded-full">
              Wave Direct
            </span>
          </div>

          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-sky-200">
            <span className="text-lg font-black text-gray-900 tracking-wider">
              {numeroWaveFormate}
            </span>
            <button
              onClick={copierNumero}
              className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 active:scale-95 transition-all"
            >
              {copie ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copie ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>

          <p className="text-[11px] text-sky-800 mt-2 leading-relaxed">
            Envoyez <strong>{tarif} FCFA</strong> par Wave à ce numéro avec en note : <strong className="underline">{boutique.nom_boutique}</strong>.
          </p>
        </div>

        {/* Bouton WhatsApp de confirmation directe */}
        <a
          href={lienWhatsAppAdmin}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all text-center"
        >
          <MessageSquare className="w-4 h-4" />
          <span>J'ai envoyé le Wave (Confirmer par WhatsApp)</span>
        </a>

        <p className="text-[10px] text-center text-gray-400 mt-2">
          Validation instantanée après réception du paiement.
        </p>
      </div>
    </div>
  );
}
