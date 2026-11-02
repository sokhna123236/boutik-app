import { Produit, Client, Boutique, Vente } from '@/types/database';

export const BOUTIQUE_DEMO: Boutique = {
  id: 'boutique-demo-1',
  nom_boutique: 'Boutique Chez Diallo',
  nom_proprietaire: 'Mamadou Diallo',
  telephone: '775123456',
  devise: 'FCFA',
};

export const PRODUITS_INITIAUX: Produit[] = [
  { id: 'p1', nom: 'Café Touba (Sachet)', prix_achat: 100, prix_vente: 150, quantite_stock: 45, seuil_alerte: 10 },
  { id: 'p2', nom: 'Pain Baguette', prix_achat: 150, prix_vente: 200, quantite_stock: 12, seuil_alerte: 15 },
  { id: 'p3', nom: 'Lait Bonnet Rouge', prix_achat: 350, prix_vente: 450, quantite_stock: 4, seuil_alerte: 5 },
  { id: 'p4', nom: 'Sucre en morceaux (Kg)', prix_achat: 700, prix_vente: 850, quantite_stock: 22, seuil_alerte: 5 },
  { id: 'p5', nom: 'Savon Diabel', prix_achat: 200, prix_vente: 250, quantite_stock: 30, seuil_alerte: 8 },
  { id: 'p6', nom: 'Eau Kirène (1.5L)', prix_achat: 350, prix_vente: 450, quantite_stock: 18, seuil_alerte: 6 },
  { id: 'p7', nom: 'Spaghetti Madar (500g)', prix_achat: 350, prix_vente: 450, quantite_stock: 2, seuil_alerte: 5 },
  { id: 'p8', nom: 'Huile Dinor (1L)', prix_achat: 1100, prix_vente: 1300, quantite_stock: 14, seuil_alerte: 4 },
  { id: 'p9', nom: 'Sardine Titus', prix_achat: 450, prix_vente: 550, quantite_stock: 8, seuil_alerte: 5 },
  { id: 'p10', nom: 'Mayonnaise Calvé', prix_achat: 600, prix_vente: 750, quantite_stock: 11, seuil_alerte: 3 },
];

export const CLIENTS_INITIAUX: Client[] = [
  { id: 'c1', nom: 'Fatou Sow', telephone: '776543210', solde_dette: 4500 },
  { id: 'c2', nom: 'Ibrahima Ndiaye', telephone: '781234567', solde_dette: 12000 },
  { id: 'c3', nom: 'Aminata Ba', telephone: '769876543', solde_dette: 2500 },
  { id: 'c4', nom: 'Ousmane Fall', telephone: '703456789', solde_dette: 0 },
];

export const VENTES_INITIALES: Vente[] = [
  {
    id: 'v1',
    client_id: 'c2',
    nom_client: 'Ibrahima Ndiaye',
    total: 3500,
    montant_paye: 1500,
    reste_a_payer: 2000,
    mode_paiement: 'dette',
    statut: 'dette_partielle',
    created_at: '2026-11-01T14:30:00.000Z',
    lignes: [
      { produit_id: 'p8', nom_produit: 'Huile Dinor (1L)', quantite: 2, prix_unitaire: 1300, sous_total: 2600 },
      { produit_id: 'p4', nom_produit: 'Sucre en morceaux (Kg)', quantite: 1, prix_unitaire: 850, sous_total: 850 },
    ],
  },
  {
    id: 'v2',
    client_id: null,
    nom_client: 'Client Passant',
    total: 850,
    montant_paye: 850,
    reste_a_payer: 0,
    mode_paiement: 'especes',
    statut: 'paye',
    created_at: '2026-11-01T12:15:00.000Z',
    lignes: [
      { produit_id: 'p2', nom_produit: 'Pain Baguette', quantite: 2, prix_unitaire: 200, sous_total: 400 },
      { produit_id: 'p3', nom_produit: 'Lait Bonnet Rouge', quantite: 1, prix_unitaire: 450, sous_total: 450 },
    ],
  },
];
