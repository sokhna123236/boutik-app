export interface Boutique {
  id: string;
  nom_boutique: string;
  nom_proprietaire?: string;
  telephone: string;
  devise: string;
  created_at?: string;
}

export interface Produit {
  id: string;
  boutique_id?: string;
  nom: string;
  prix_achat: number;
  prix_vente: number;
  quantite_stock: number;
  seuil_alerte: number;
  created_at?: string;
}

export interface Client {
  id: string;
  boutique_id?: string;
  nom: string;
  telephone: string;
  solde_dette: number;
  created_at?: string;
}

export interface LigneVente {
  id?: string;
  produit_id: string;
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
}

export interface Vente {
  id: string;
  boutique_id?: string;
  client_id?: string | null;
  nom_client?: string;
  total: number;
  montant_paye: number;
  reste_a_payer: number;
  mode_paiement: 'especes' | 'wave' | 'orange_money' | 'dette';
  statut: 'paye' | 'dette_partielle' | 'dette_totale';
  lignes: LigneVente[];
  created_at: string;
}

export interface Paiement {
  id: string;
  boutique_id?: string;
  client_id: string;
  montant: number;
  mode_paiement: 'especes' | 'wave' | 'orange_money';
  note?: string;
  created_at: string;
}
