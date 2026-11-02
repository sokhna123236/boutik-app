'use client';

import React from 'react';
import { useBoutique } from '@/context/BoutiqueContext';
import { TrendingUp, DollarSign, AlertCircle, ShoppingCart, Clock } from 'lucide-react';

export function BilanScreen() {
  const { ventes, produits } = useBoutique();
  const [estMonte, setEstMonte] = React.useState(false);
  const [debutDuJour, setDebutDuJour] = React.useState<number>(0);

  React.useEffect(() => {
    const maintenant = new Date();
    setDebutDuJour(new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate()).getTime());
    setEstMonte(true);
  }, []);

  // Filtrer les ventes du jour une fois monté côté client
  const ventesDuJour = estMonte && debutDuJour > 0
    ? ventes.filter(v => new Date(v.created_at).getTime() >= debutDuJour)
    : [];

  const caDuJour = ventesDuJour.reduce((acc, v) => acc + v.total, 0);
  const encaisseDuJour = ventesDuJour.reduce((acc, v) => acc + v.montant_paye, 0);
  const dettesAccordeesDuJour = ventesDuJour.reduce((acc, v) => acc + v.reste_a_payer, 0);

  // Estimation du bénéfice / marge brute
  const beneficeEstime = ventesDuJour.reduce((totalBenef, vente) => {
    const benefVente = vente.lignes.reduce((bLigne, l) => {
      const prod = produits.find(p => p.id === l.produit_id);
      const coutAchat = prod ? prod.prix_achat * l.quantite : 0;
      return bLigne + (l.sous_total - coutAchat);
    }, 0);
    return totalBenef + benefVente;
  }, 0);

  const produitsAlertes = produits.filter(p => p.quantite_stock <= p.seuil_alerte);

  return (
    <div className="pb-24 max-w-md mx-auto">
      {/* En-tête Bilan */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Bilan d'activité du jour</h2>
        <p className="text-xs text-gray-500">
          Statistiques calculées depuis 00h00
        </p>

        {/* 4 cartes KPI */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* CA */}
          <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Chiffre d'affaires</span>
            </div>
            <div className="text-xl font-black text-emerald-700">
              {caDuJour.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
            </div>
            <span className="text-[10px] text-emerald-600 block mt-0.5">
              {ventesDuJour.length} vente{ventesDuJour.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Bénéfice estimé */}
          <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-1.5 text-xs text-blue-800 font-semibold mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Bénéfice net estimé</span>
            </div>
            <div className="text-xl font-black text-blue-700">
              {beneficeEstime.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
            </div>
            <span className="text-[10px] text-blue-600 block mt-0.5">
              Marge brute marchande
            </span>
          </div>

          {/* Cash Encaissé */}
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            <span className="text-xs text-gray-600 font-medium block mb-1">Reçu en caisse</span>
            <div className="text-lg font-black text-gray-900">
              {encaisseDuJour.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
            </div>
            <span className="text-[10px] text-gray-500 block mt-0.5">Espèces, Wave & OM</span>
          </div>

          {/* Dettes accordées aujourd'hui */}
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
            <span className="text-xs text-amber-800 font-medium block mb-1">Crédit accordé</span>
            <div className="text-lg font-black text-rose-600">
              {dettesAccordeesDuJour.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
            </div>
            <span className="text-[10px] text-amber-700 block mt-0.5">À encaisser plus tard</span>
          </div>
        </div>
      </div>

      {/* Alerte stock faible */}
      {produitsAlertes.length > 0 && (
        <div className="p-4 bg-amber-50/80 border-b border-amber-200">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>{produitsAlertes.length} produit(s) bientôt épuisé(s) :</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {produitsAlertes.map(p => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg text-xs font-medium border border-amber-200 text-gray-800 shadow-2xs"
              >
                <span>{p.nom}</span>
                <strong className="text-rose-600">({p.quantite_stock} restants)</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Historique des ventes de la journée */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
          <ShoppingCart className="w-4 h-4 text-gray-500" />
          <span>Ventes récentes ({ventesDuJour.length})</span>
        </h3>

        {ventesDuJour.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-xs">
            Aucune vente enregistrée pour le moment aujourd'hui.
          </div>
        ) : (
          <div className="space-y-2.5">
            {ventesDuJour.map(v => (
              <div key={v.id} className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">
                        {v.nom_client || 'Passant'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          v.statut === 'paye'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {v.statut === 'paye' ? 'Payé' : 'Dette'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(v.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span className="capitalize">{v.mode_paiement}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-sm text-gray-900">
                      {v.total.toLocaleString('fr-FR')} FCFA
                    </span>
                    {v.reste_a_payer > 0 && (
                      <span className="block text-[11px] font-bold text-rose-600">
                        Dette: {v.reste_a_payer.toLocaleString('fr-FR')} F
                      </span>
                    )}
                  </div>
                </div>

                {/* Articles vendus */}
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-0.5">
                  {v.lignes.map((l, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>
                        {l.quantite}x {l.nom_produit}
                      </span>
                      <span className="text-gray-400">{l.sous_total.toLocaleString('fr-FR')} F</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
