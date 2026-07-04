/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dress, Client, Booking } from './types';

export const INITIAL_DRESSES: Dress[] = [
  {
    id: 'd-1',
    number: '01',
    name: 'Karakou Algérois "Yasmine"',
    type: 'Karakou',
    size: '38',
    color: 'Rouge Velours & Or',
    rentalPrice: 15000,
    deposit: 10000,
    status: 'Disponible',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
    notes: 'Velours royal de première qualité brodé de fil d\'or Majboud. Veste cintrée avec seroual chalqa noir fluide.'
  },
  {
    id: 'd-2',
    number: '02',
    name: 'Caftan Royal "Amira"',
    type: 'Caftan',
    size: '40',
    color: 'Vert Émeraude & Or',
    rentalPrice: 12000,
    deposit: 8000,
    status: 'Louée',
    imageUrl: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=800&auto=format&fit=crop&q=80',
    notes: 'Satin de soie lourd vert émeraude avec broderie fine et sfifa dorée. Ceinture (maddama) assortie sertie de pierres.'
  },
  {
    id: 'd-3',
    number: '03',
    name: 'Chedda de Tlemcen "Sultana"',
    type: 'Chedda',
    size: '38',
    color: 'Doré & Perles Blanches',
    rentalPrice: 35000,
    deposit: 25000,
    status: 'Disponible',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
    notes: 'Robe de mariée traditionnelle tlemcenienne d\'exception. Comprend la robe en soie d\'or, la coiffe traditionnelle (tedj) et les parures de perles d\'imitation de luxe.'
  },
  {
    id: 'd-4',
    number: '04',
    name: 'Robe Kabyle "Kahina"',
    type: 'Robe Kabyle',
    size: '42',
    color: 'Jaune Flamboyant & Motifs Berbères',
    rentalPrice: 8000,
    deposit: 5000,
    status: 'Disponible',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
    notes: 'Robe kabyle moderne en tissu léger de haute quality. Motifs géométriques traditionnels et galons tissés à la main. Fournie avec sa foutha rouge.'
  },
  {
    id: 'd-5',
    number: '05',
    name: 'Blousa Oranaise "Wahrania"',
    type: 'Blousa Oranaise',
    size: '36',
    color: 'Bleu Turquoise & Dentelle',
    rentalPrice: 10000,
    deposit: 6000,
    status: 'En Nettoyage',
    imageUrl: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&auto=format&fit=crop&q=80',
    notes: 'Blousa traditionnelle de la région d\'Oran en dentelle fine perlée à l\'encolure de façon artisanale.'
  },
  {
    id: 'd-6',
    number: '06',
    name: 'Robe Chaouie "Dihya"',
    type: 'Robe Chaouie',
    size: '40',
    color: 'Noir & Broderies Multicolores',
    rentalPrice: 9000,
    deposit: 5000,
    status: 'Disponible',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
    notes: 'Robe noire traditionnelle brodée de fils multicolores (jaune, vert, rouge). Coupe fluide très confortable.'
  },
  {
    id: 'd-7',
    number: '07',
    name: 'Robe de Mariée "Blanche-Neige"',
    type: 'Robe de Mariée',
    size: '38',
    color: 'Blanc Pur & Dentelle',
    rentalPrice: 25000,
    deposit: 15000,
    status: 'Disponible',
    imageUrl: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=800&auto=format&fit=crop&q=80',
    notes: 'Robe de mariée princesse. Corset en dentelle perlée délicate avec une longue traîne en tulle.'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c-1',
    name: 'Yasmine Benchaoui',
    phone: '0550123456',
    city: 'Alger',
    notes: 'Excellente cliente, prend grand soin des robes. Mariée prévue fin juillet.',
    createdAt: '2026-04-10'
  },
  {
    id: 'c-2',
    name: 'Amel Mokhtari',
    phone: '0661987654',
    city: 'Oran',
    notes: 'Recommandée par sa sœur. S\'intéresse aux caftans modernes.',
    createdAt: '2026-05-01'
  },
  {
    id: 'c-3',
    name: 'Rania Medjkoune',
    phone: '0770246810',
    city: 'Tizi Ouzou',
    notes: 'Préfère la robe kabyle traditionnelle de luxe.',
    createdAt: '2026-05-15'
  },
  {
    id: 'c-4',
    name: 'Sonia Haddad',
    phone: '0562112233',
    city: 'Constantine',
    notes: 'Fiançailles début juillet.',
    createdAt: '2026-06-01'
  },
  {
    id: 'c-5',
    name: 'Meriem Bahloul',
    phone: '0555778899',
    city: 'Alger',
    notes: 'Mariage de sa cousine, cherche une tenue pour le henné.',
    createdAt: '2026-06-12'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    dressId: 'd-2', // Caftan Royal Amira (Louée)
    clientName: 'Yasmine Benchaoui',
    clientPhone: '0550123456',
    clientCity: 'Alger',
    startDate: '2026-07-02',
    endDate: '2026-07-05',
    fittingDate: '2026-06-28',
    totalPrice: 12000,
    depositPaid: 8000,
    paymentStatus: 'Acompte Versé',
    status: 'Récupéré',
    notes: 'Doit la rendre dimanche matin avant midi. Essayage concluant le 28 juin.',
    payments: [
      { amount: 8000, date: '2026-07-02', type: 'Acompte' }
    ]
  },
  {
    id: 'b-2',
    dressId: 'd-1', // Karakou Yasmine
    clientName: 'Amel Mokhtari',
    clientPhone: '0661987654',
    clientCity: 'Oran',
    startDate: '2026-07-09',
    endDate: '2026-07-12',
    fittingDate: '2026-07-05',
    totalPrice: 15000,
    depositPaid: 10000,
    paymentStatus: 'Payé',
    status: 'Confirmé',
    notes: 'Réservation confirmée pour un mariage familial à Alger.',
    payments: [
      { amount: 10000, date: '2026-07-03', type: 'Acompte' }
    ]
  },
  {
    id: 'b-3',
    dressId: 'd-4', // Robe Kabyle Kahina
    clientName: 'Rania Medjkoune',
    clientPhone: '0770246810',
    clientCity: 'Tizi Ouzou',
    startDate: '2026-07-16',
    endDate: '2026-07-19',
    fittingDate: '2026-07-14',
    totalPrice: 8000,
    depositPaid: 5000,
    paymentStatus: 'Acompte Versé',
    status: 'Confirmé',
    notes: 'Pour la fête du village à Larbaa Nath Irathen.',
    payments: [
      { amount: 5000, date: '2026-07-03', type: 'Acompte' }
    ]
  },
  {
    id: 'b-4',
    dressId: 'd-3', // Chedda de Tlemcen Sultana
    clientName: 'Sonia Haddad',
    clientPhone: '0562112233',
    clientCity: 'Constantine',
    startDate: '2026-07-23',
    endDate: '2026-07-27',
    fittingDate: '2026-07-18',
    totalPrice: 35000,
    depositPaid: 25000,
    paymentStatus: 'Payé',
    status: 'Confirmé',
    notes: 'Robe de mariée principale pour la cérémonie de la mariée.',
    payments: [
      { amount: 25000, date: '2026-07-01', type: 'Acompte' }
    ]
  },
  {
    id: 'b-5',
    dressId: 'd-5', // Blousa Oranaise (Retourné - Historique)
    clientName: 'Meriem Bahloul',
    clientPhone: '0555778899',
    clientCity: 'Alger',
    startDate: '2026-06-25',
    endDate: '2026-06-28',
    fittingDate: '2026-06-22',
    totalPrice: 10000,
    depositPaid: 6000,
    paymentStatus: 'Payé',
    status: 'Retourné',
    notes: 'Robe rendue propre, mais envoyée au pressing spécialisé de confiance pour nettoyage de routine.',
    payments: [
      { amount: 6000, date: '2026-06-25', type: 'Acompte' },
      { amount: 4000, date: '2026-06-28', type: 'Solde' }
    ]
  }
];

export const INITIAL_JEWELRY = [
  {
    id: 'j-1',
    number: 'J-01',
    name: 'Parure Impériale Tlemcenienne',
    type: 'Parure',
    color: 'Or Vieilli & Perles fines',
    rentalPrice: 7000,
    deposit: 5000,
    status: 'Disponible',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    notes: 'Khabcha traditionnelle sertie de pierres dorées d\'imitation de haute qualité et de perles de culture baroques.'
  },
  {
    id: 'j-2',
    number: 'J-02',
    name: 'Diadème Berbère "Kenza"',
    type: 'Diadème',
    color: 'Argent ciselé & Corail Rouge',
    rentalPrice: 4000,
    deposit: 3000,
    status: 'Disponible',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    notes: 'Diadème kabyle traditionnel en argent massif ciselé à la main, orné d\'émail coloré et de cabochons de corail rouge.'
  },
  {
    id: 'j-3',
    number: 'J-03',
    name: 'Ceinture de Caisse "Maddama Louiza"',
    type: 'Ceinture',
    color: 'Doré Brillant',
    rentalPrice: 6000,
    deposit: 4000,
    status: 'Loué',
    imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80',
    notes: 'Ceinture dorée à motifs de pièces de monnaie Louiza algériennes traditionnelles. Fermoir de sécurité ajustable.'
  }
];

export const INITIAL_EXPENSES = [
  {
    id: 'e-1',
    description: 'Achat de tissu Velours de Soie royal rouge',
    amount: 18000,
    category: 'Achat de stock',
    date: '2026-06-15'
  },
  {
    id: 'e-2',
    description: 'Facture d\'électricité Sonelgaz - Trimestre 2',
    amount: 9200,
    category: 'Facture d\'électricité',
    date: '2026-06-20'
  },
  {
    id: 'e-3',
    description: 'Fil d\'or Majboud pour broderie artisanale',
    amount: 5500,
    category: 'Fournitures',
    date: '2026-06-26'
  }
];

export const INITIAL_WITHDRAWALS = [
  {
    id: 'w-1',
    amount: 50000,
    date: '2026-06-28',
    notes: 'Dépôt d\'espèces au compte BDL Alger (Bordereau N° 4812)'
  },
  {
    id: 'w-2',
    amount: 30000,
    date: '2026-07-02',
    notes: 'Retrait caisse physique pour alimentation compte CPA'
  }
];
