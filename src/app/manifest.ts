import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BoutikApp — Gestion Caisse & Dettes',
    short_name: 'BoutikApp',
    description: 'Gestion des ventes, stock et carnet de dettes clients avec rappels WhatsApp',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#059669',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
