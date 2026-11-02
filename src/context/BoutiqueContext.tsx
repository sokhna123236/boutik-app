'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Boutique, Produit, Client, Vente, Paiement, LigneVente } from '@/types/database';
import { BOUTIQUE_DEMO, PRODUITS_INITIAUX, CLIENTS_INITIAUX, VENTES_INITIALES } from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface BoutiqueContextType {
  boutique: Boutique;
  produits: Produit[];
  clients: Client[];
  ventes: Vente[];
  paiements: Paiement[];
  isOnline: boolean;
  isSupabaseConnected: boolean;
  ajouterVente: (vente: {
    clientId: string | null;
    nomClient?: string;
    lignes: LigneVente[];
    total: number;
    montantPaye: number;
    modePaiement: 'especes' | 'wave' | 'orange_money' | 'dette';
  }) => Promise<void>;
  enregistrerPaiementDette: (clientId: string, montant: number, modePaiement: 'especes' | 'wave' | 'orange_money') => Promise<void>;
  ajouterProduit: (nouveau: Omit<Produit, 'id'>) => Promise<void>;
  mettreAJourStock: (produitId: string, quantiteDelta: number) => Promise<void>;
  ajouterClient: (nom: string, telephone: string) => Promise<Client>;
  mettreAJourBoutique: (infos: Partial<Boutique>) => void;
  reinitialiserDonnees: () => void;
}

const BoutiqueContext = createContext<BoutiqueContextType | undefined>(undefined);

export function BoutiqueProvider({ children }: { children: React.ReactNode }) {
  const [boutique, setBoutique] = useState<Boutique>(BOUTIQUE_DEMO);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger depuis le localStorage au démarrage
  useEffect(() => {
    try {
      const storedBoutique = localStorage.getItem('boutik_boutique');
      const storedProduits = localStorage.getItem('boutik_produits');
      const storedClients = localStorage.getItem('boutik_clients');
      const storedVentes = localStorage.getItem('boutik_ventes');
      const storedPaiements = localStorage.getItem('boutik_paiements');

      if (storedBoutique) setBoutique(JSON.parse(storedBoutique));
      setProduits(storedProduits ? JSON.parse(storedProduits) : PRODUITS_INITIAUX);
      setClients(storedClients ? JSON.parse(storedClients) : CLIENTS_INITIAUX);
      setVentes(storedVentes ? JSON.parse(storedVentes) : VENTES_INITIALES);
      setPaiements(storedPaiements ? JSON.parse(storedPaiements) : []);
    } catch (e) {
      console.error('Erreur lors de la lecture du localStorage:', e);
      setProduits(PRODUITS_INITIAUX);
      setClients(CLIENTS_INITIAUX);
      setVentes(VENTES_INITIALES);
    } finally {
      setIsLoaded(true);
    }

    // Gestion état de connexion
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sauvegarder dans localStorage dès modification
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('boutik_boutique', JSON.stringify(boutique));
    localStorage.setItem('boutik_produits', JSON.stringify(produits));
    localStorage.setItem('boutik_clients', JSON.stringify(clients));
    localStorage.setItem('boutik_ventes', JSON.stringify(ventes));
    localStorage.setItem('boutik_paiements', JSON.stringify(paiements));
  }, [boutique, produits, clients, ventes, paiements, isLoaded]);

  // 1. Ajouter une vente
  const ajouterVente = async (venteData: {
    clientId: string | null;
    nomClient?: string;
    lignes: LigneVente[];
    total: number;
    montantPaye: number;
    modePaiement: 'especes' | 'wave' | 'orange_money' | 'dette';
  }) => {
    const resteAPayer = Math.max(0, venteData.total - venteData.montantPaye);
    const statut = resteAPayer === 0 ? 'paye' : (venteData.montantPaye === 0 ? 'dette_totale' : 'dette_partielle');

    const nouvelleVente: Vente = {
      id: `v_${Date.now()}`,
      client_id: venteData.clientId,
      nom_client: venteData.nomClient || (venteData.clientId ? clients.find(c => c.id === venteData.clientId)?.nom : 'Passant'),
      total: venteData.total,
      montant_paye: venteData.montantPaye,
      reste_a_payer: resteAPayer,
      mode_paiement: venteData.modePaiement,
      statut,
      lignes: venteData.lignes,
      created_at: new Date().toISOString(),
    };

    // 1. Mettre à jour la liste des ventes
    setVentes(prev => [nouvelleVente, ...prev]);

    // 2. Décrémenter les stocks
    setProduits(prev =>
      prev.map(p => {
        const ligne = venteData.lignes.find(l => l.produit_id === p.id);
        if (ligne) {
          return { ...p, quantite_stock: Math.max(0, p.quantite_stock - ligne.quantite) };
        }
        return p;
      })
    );

    // 3. Mettre à jour la dette du client si reste à payer
    if (venteData.clientId && resteAPayer > 0) {
      setClients(prev =>
        prev.map(c => {
          if (c.id === venteData.clientId) {
            return { ...c, solde_dette: c.solde_dette + resteAPayer };
          }
          return c;
        })
      );
    }
  };

  // 2. Enregistrer un remboursement de dette
  const enregistrerPaiementDette = async (
    clientId: string,
    montant: number,
    modePaiement: 'especes' | 'wave' | 'orange_money'
  ) => {
    const nouveauPaiement: Paiement = {
      id: `p_${Date.now()}`,
      client_id: clientId,
      montant,
      mode_paiement: modePaiement,
      created_at: new Date().toISOString(),
    };

    setPaiements(prev => [nouveauPaiement, ...prev]);

    setClients(prev =>
      prev.map(c => {
        if (c.id === clientId) {
          return { ...c, solde_dette: Math.max(0, c.solde_dette - montant) };
        }
        return c;
      })
    );
  };

  // 3. Ajouter un produit
  const ajouterProduit = async (nouveau: Omit<Produit, 'id'>) => {
    const produit: Produit = {
      ...nouveau,
      id: `p_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setProduits(prev => [produit, ...prev]);
  };

  // 4. Mettre à jour le stock (réapprovisionnement ou ajustement)
  const mettreAJourStock = async (produitId: string, quantiteDelta: number) => {
    setProduits(prev =>
      prev.map(p => {
        if (p.id === produitId) {
          return { ...p, quantite_stock: Math.max(0, p.quantite_stock + quantiteDelta) };
        }
        return p;
      })
    );
  };

  // 5. Ajouter un client rapidement
  const ajouterClient = async (nom: string, telephone: string): Promise<Client> => {
    const nouveauClient: Client = {
      id: `c_${Date.now()}`,
      nom,
      telephone,
      solde_dette: 0,
      created_at: new Date().toISOString(),
    };
    setClients(prev => [...prev, nouveauClient]);
    return nouveauClient;
  };

  // 6. Mettre à jour les paramètres boutique
  const mettreAJourBoutique = (infos: Partial<Boutique>) => {
    setBoutique(prev => ({ ...prev, ...infos }));
  };

  // Réinitialiser les données aux valeurs de démo
  const reinitialiserDonnees = () => {
    setBoutique(BOUTIQUE_DEMO);
    setProduits(PRODUITS_INITIAUX);
    setClients(CLIENTS_INITIAUX);
    setVentes(VENTES_INITIALES);
    setPaiements([]);
    localStorage.clear();
  };

  return (
    <BoutiqueContext.Provider
      value={{
        boutique,
        produits,
        clients,
        ventes,
        paiements,
        isOnline,
        isSupabaseConnected: isSupabaseConfigured,
        ajouterVente,
        enregistrerPaiementDette,
        ajouterProduit,
        mettreAJourStock,
        ajouterClient,
        mettreAJourBoutique,
        reinitialiserDonnees,
      }}
    >
      {children}
    </BoutiqueContext.Provider>
  );
}

export function useBoutique() {
  const context = useContext(BoutiqueContext);
  if (!context) {
    throw new Error('useBoutique doit être utilisé au sein de BoutiqueProvider');
  }
  return context;
}
