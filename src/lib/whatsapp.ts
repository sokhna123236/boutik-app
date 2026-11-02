/**
 * Utilitaire pour formater les numéros et générer les liens directs WhatsApp (wa.me)
 */

export function normaliserTelephone(telephone: string, indicatifDefaut: string = '221'): string {
  // Retire les espaces, tirets, parenthèses et plus
  const chiffres = telephone.replace(/\D/g, '');
  
  // Si le numéro commence déjà par 221 (ou autre indicatif 225, 223, etc. avec 11-12 chiffres)
  if (chiffres.length >= 11) {
    return chiffres;
  }
  
  // Format local sénégalais classique à 9 chiffres (ex: 77 123 45 67)
  if (chiffres.length === 9) {
    return `${indicatifDefaut}${chiffres}`;
  }
  
  return chiffres;
}

export function genererLienWhatsApp(params: {
  telephoneClient: string;
  nomClient: string;
  montantDette: number;
  nomBoutique: string;
  telephoneBoutique: string;
  langue?: 'fr' | 'wo';
}): string {
  const telPropre = normaliserTelephone(params.telephoneClient);
  const montantFormate = params.montantDette.toLocaleString('fr-FR');
  
  let message = '';
  
  if (params.langue === 'wo') {
    // Version Wolof bienveillante et courtoise
    message = 
`Nangadef ${params.nomClient},
Boutique *${params.nomBoutique}* mi ngi lay nuyu.
Li des ci sa compte moy *${montantFormate} FCFA*.
Man nga ñëw faye ko wala nga yónnee ko ci Wave/Orange Money ci numéro bi : *${params.telephoneBoutique}*.
Jërëjëf !`;
  } else {
    // Version Française standard
    message = 
`Bonjour ${params.nomClient},
Petit rappel cordial de la boutique *${params.nomBoutique}*.
Votre solde restant est de *${montantFormate} FCFA*.
Vous pouvez passer régler à la boutique ou nous envoyer le paiement par Wave / Orange Money au numéro : *${params.telephoneBoutique}*.
Merci pour votre fidélité et bonne journée !`;
  }

  return `https://wa.me/${telPropre}?text=${encodeURIComponent(message)}`;
}
