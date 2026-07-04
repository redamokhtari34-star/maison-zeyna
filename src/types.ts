/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DressType = 
  | 'Karakou' 
  | 'Caftan' 
  | 'Chedda' 
  | 'Robe Kabyle' 
  | 'Robe Chaouie' 
  | 'Blousa Oranaise' 
  | 'Robe de Mariée' 
  | 'Autre';

export type DressStatus = 'Disponible' | 'Louée' | 'En Nettoyage' | 'Hors Service';

export interface Dress {
  id: string;
  number: string; // Numéro unique de la robe (e.g. "01", "02", "REF-101")
  name: string;
  type: DressType;
  size: string; // e.g., "38", "40", "42", "M", "L"
  color: string;
  rentalPrice: number; // in DA (Algerian Dinar)
  deposit: number; // caution, in DA
  status: DressStatus;
  imageUrl: string;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  city: string; // e.g., "Alger", "Oran", "Constantine", "Tizi Ouzou"
  notes?: string;
  createdAt: string;
  weddingDate?: string; // Date de l'événement / Mariage
}

export type PaymentStatus = 'Payé' | 'Acompte Versé' | 'Non Payé';
export type BookingStatus = 'Confirmé' | 'Récupéré' | 'Retourné' | 'Annulé';

export interface PaymentTransaction {
  amount: number;
  date: string; // YYYY-MM-DD
  type: 'Acompte' | 'Solde' | 'Régularisation';
}

export interface Booking {
  id: string;
  dressId: string; // links to Dress
  clientName: string;
  clientPhone: string;
  clientCity: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  fittingDate?: string; // date d'essayage, optional YYYY-MM-DD
  weddingDate?: string; // Date du mariage / événement
  totalPrice: number; // DA
  depositPaid: number; // DA
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  notes?: string;
  payments?: PaymentTransaction[];
  jewelryId?: string; // Optionnel : Bijou associé à la location
}

export interface Jewelry {
  id: string;
  number: string; // Référence unique, ex: "B-01"
  name: string;
  type: 'Parure' | 'Diadème' | 'Collier' | 'Bracelet' | 'Boucles d\'oreilles' | 'Ceinture' | 'Autre';
  color: string;
  rentalPrice: number; // DA
  deposit: number; // caution, DA
  status: 'Disponible' | 'Loué' | 'En Nettoyage' | 'Hors Service';
  imageUrl: string;
  notes?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number; // DA
  category: 'Achat de stock' | 'Facture d\'électricité' | 'Fournitures' | 'Salaire' | 'Loyer' | 'Autre';
  date: string; // YYYY-MM-DD
}

export interface CashWithdrawal {
  id: string;
  amount: number; // DA
  date: string; // YYYY-MM-DD
  notes?: string;
}
