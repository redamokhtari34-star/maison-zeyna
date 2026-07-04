/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dress, Booking } from '../types';
import { Sparkles, Calendar, TrendingUp, ShieldCheck, Heart } from 'lucide-react';

interface DashboardStatsProps {
  dresses: Dress[];
  bookings: Booking[];
  onCardClick?: (tab: 'calendar' | 'bookings' | 'catalog' | 'jewelry' | 'finance' | 'clients') => void;
}

export default function DashboardStats({ dresses, bookings, onCardClick }: DashboardStatsProps) {
  const totalDresses = dresses.length;
  const availableDresses = dresses.filter(d => d.status === 'Disponible').length;
  const rentedDresses = dresses.filter(d => d.status === 'Louée').length;
  const cleaningDresses = dresses.filter(d => d.status === 'En Nettoyage').length;

  // Active or upcoming bookings (not cancelled)
  const activeBookings = bookings.filter(b => b.status !== 'Annulé').length;

  // Revenue calculation
  const totalProjectedRevenue = bookings
    .filter(b => b.status !== 'Annulé')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const totalCollectedRevenue = bookings
    .filter(b => b.status !== 'Annulé')
    .reduce((sum, b) => {
      if (b.paymentStatus === 'Payé') {
        return sum + b.totalPrice;
      } else if (b.paymentStatus === 'Acompte Versé') {
        return sum + b.depositPaid;
      }
      return sum;
    }, 0);

  const pendingRevenue = totalProjectedRevenue - totalCollectedRevenue;

  // Today's Revenue Calculation (Chiffre d'Affaires du jour)
  const getTodayDateString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const localDate = `${yyyy}-${mm}-${dd}`;
    if (yyyy === 2026) {
      return localDate;
    }
    return '2026-07-03';
  };
  const today = getTodayDateString();

  const todayRevenue = bookings
    .filter(b => b.status !== 'Annulé')
    .reduce((sum, b) => {
      const bPayments = b.payments || [];
      const daySum = bPayments
        .filter(p => p.date === today)
        .reduce((s, p) => s + p.amount, 0);
      return sum + daySum;
    }, 0);

  // Formatting currency in DA
  const formatDA = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 })
      .format(amount)
      .replace('DZD', 'DA');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Dresses Card */}
      <div 
        onClick={() => onCardClick?.('catalog')}
        className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer hover:border-gold-500/50 hover:bg-navy-850/80 transition-all duration-300 group"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gold-300 uppercase tracking-wider group-hover:text-gold-400 transition-colors">Garde-Robe</p>
            <h3 className="text-2xl font-bold font-sans text-white mt-1">{totalDresses} Robes</h3>
          </div>
          <div className="p-2.5 bg-gold-950/40 rounded-lg text-gold-500 border border-gold-800/40 group-hover:border-gold-500/40 transition-colors">
            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-navy-200">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            {availableDresses} Disp.
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-500 inline-block"></span>
            {rentedDresses} Louées
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-navy-400 inline-block"></span>
            {cleaningDresses} Pressing
          </span>
        </div>
      </div>

      {/* Bookings Card */}
      <div 
        onClick={() => onCardClick?.('bookings')}
        className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer hover:border-gold-500/50 hover:bg-navy-850/80 transition-all duration-300 group"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gold-300 uppercase tracking-wider group-hover:text-gold-400 transition-colors">Réservations Actives</p>
            <h3 className="text-2xl font-bold font-sans text-white mt-1">{activeBookings} Contrats</h3>
          </div>
          <div className="p-2.5 bg-navy-800 rounded-lg text-navy-100 border border-navy-700 group-hover:border-gold-500/40 transition-colors">
            <Calendar className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <p className="text-xs text-navy-300 mt-4 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
          Toutes réservations confondues d'été 2026
        </p>
      </div>

      {/* Revenue Card */}
      <div 
        onClick={() => onCardClick?.('finance')}
        className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer hover:border-gold-500/50 hover:bg-navy-850/80 transition-all duration-300 group"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gold-300 uppercase tracking-wider group-hover:text-gold-400 transition-colors">C.A. du Jour ({today.split('-')[2]} Juil.)</p>
            <h3 className="text-2xl font-bold font-sans text-emerald-400 mt-1">{formatDA(todayRevenue)}</h3>
          </div>
          <div className="p-2.5 bg-gold-950/40 rounded-lg text-gold-500 border border-gold-800/40 group-hover:border-gold-500/40 transition-colors">
            <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div className="mt-4 pt-1 border-t border-navy-850 text-[10px] text-navy-300 space-y-1">
          <div className="flex justify-between">
            <span>Encaissé cumulé :</span>
            <span className="font-semibold text-white">{formatDA(totalCollectedRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Reste à encaisser :</span>
            <span className="font-semibold text-gold-400">{formatDA(pendingRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Security & Deposits Card */}
      <div 
        onClick={() => onCardClick?.('bookings')}
        className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer hover:border-gold-500/50 hover:bg-navy-850/80 transition-all duration-300 group"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gold-300 uppercase tracking-wider group-hover:text-gold-400 transition-colors">Cautions Garanties</p>
            <h3 className="text-2xl font-bold font-sans text-white mt-1">
              {formatDA(bookings.filter(b => b.status === 'Récupéré').reduce((sum, b) => {
                const dress = dresses.find(d => d.id === b.dressId);
                return sum + (dress?.deposit || 0);
              }, 0))}
            </h3>
          </div>
          <div className="p-2.5 bg-navy-800 rounded-lg text-navy-100 border border-navy-700 group-hover:border-gold-500/40 transition-colors">
            <ShieldCheck className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <p className="text-xs text-navy-300 mt-4">
          Cautions physiques actuellement détenues en boutique
        </p>
      </div>
    </div>
  );
}
