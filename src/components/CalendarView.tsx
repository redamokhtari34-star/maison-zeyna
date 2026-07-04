/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Booking, Dress, BookingStatus, PaymentStatus } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Phone, 
  MapPin, 
  User, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles
} from 'lucide-react';

interface CalendarViewProps {
  bookings: Booking[];
  dresses: Dress[];
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void;
  onUpdatePaymentStatus: (id: string, status: PaymentStatus) => void;
}

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function CalendarView({ 
  bookings, 
  dresses, 
  onUpdateBookingStatus, 
  onUpdatePaymentStatus 
}: CalendarViewProps) {
  // Default calendar focus to July 2026 (matching mockup data and simulation)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed is 6)
  
  // Selected day to view details
  const [selectedDay, setSelectedDay] = useState<number | null>(3); // Default to July 3rd, 2026
  
  // Detail card filters: 'all' | 'departures' | 'returns'
  const [agendaFilter, setAgendaFilter] = useState<'all' | 'departures' | 'returns'>('all');

  // Helper: Get number of days in the month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get starting day index of the month (Monday = 0, Sunday = 6)
  const getStartDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1...
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  const handleGoToToday = () => {
    // simulated today is July 3rd, 2026
    setCurrentYear(2026);
    setCurrentMonth(6);
    setSelectedDay(3);
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const startDayIndex = getStartDayOfMonth(currentYear, currentMonth);

  // Helper: Convert year, month, day to string (YYYY-MM-DD)
  const toDateStr = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Helper: Get bookings active or touching a specific date
  const getBookingsForDate = (year: number, month: number, day: number) => {
    const dateStr = toDateStr(year, month, day);
    return bookings.filter(booking => {
      if (booking.status === 'Annulé') return false;
      return dateStr >= booking.startDate && dateStr <= booking.endDate;
    });
  };

  // Get list of active bookings on the selected day
  const bookingsOnSelectedDay = selectedDay 
    ? getBookingsForDate(currentYear, currentMonth, selectedDay) 
    : [];

  const selectedDateStr = selectedDay 
    ? toDateStr(currentYear, currentMonth, selectedDay)
    : '';

  // Filtered agenda bookings based on selected filter
  const getFilteredAgenda = () => {
    if (agendaFilter === 'all') {
      return bookingsOnSelectedDay;
    }
    
    if (agendaFilter === 'departures') {
      return bookingsOnSelectedDay.filter(b => b.startDate === selectedDateStr);
    }

    if (agendaFilter === 'returns') {
      return bookingsOnSelectedDay.filter(b => b.endDate === selectedDateStr);
    }

    return [];
  };

  const filteredBookings = getFilteredAgenda();

  // Financial Stats of Selected Day Bookings
  const getDayFinancials = () => {
    let expected = 0;
    let paid = 0;
    bookingsOnSelectedDay.forEach(b => {
      expected += b.totalPrice;
      paid += b.depositPaid;
    });
    return { expected, paid, balance: expected - paid };
  };

  const financials = getDayFinancials();

  // Algerian Dinar formatter
  const formatDA = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 })
      .format(amount)
      .replace('DZD', 'DA');
  };

  // Helper to check if a booking is starting/ending today
  const getBookingRoleOnDay = (booking: Booking, dayStr: string) => {
    if (booking.startDate === dayStr) return 'départ';
    if (booking.endDate === dayStr) return 'retour';
    return 'location';
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Premium Calendar Grid */}
      <div className="xl:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        
        {/* Calendar Header */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gold-500/10 text-gold-600 rounded-xl border border-gold-500/20">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-stone-900 text-lg leading-tight">
                  {MONTHS_FR[currentMonth]} {currentYear}
                </h3>
                <p className="text-xs text-stone-400">Cliquez sur un jour pour piloter l'agenda</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 self-start sm:self-center">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-stone-50 text-stone-600 rounded-lg border border-stone-200 transition-colors"
                title="Mois précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleGoToToday}
                className="px-3 py-1.5 text-xs font-bold text-navy-900 hover:text-white hover:bg-navy-900 bg-stone-50 border border-stone-200 rounded-lg transition-all"
              >
                Simuler Aujourd'hui (Juillet 3)
              </button>

              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-stone-50 text-stone-600 rounded-lg border border-stone-200 transition-colors"
                title="Mois suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Legend of Markers */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-4 mb-4 border-b border-stone-100 text-[10px] uppercase font-bold tracking-wider text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Sorties attendues
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Retours attendus
            </span>
            <span className="flex items-center gap-1.5 ml-auto text-gold-600">
              🌾 Week-ends de Mariage (Jeu - Ven - Sam)
            </span>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
            {DAYS_SHORT.map((day, idx) => {
              // Thursday, Friday, Saturday (indexes 3, 4, 5 in Monday=0) are golden wedding days
              const isPeakWeddingDay = idx === 3 || idx === 4 || idx === 5;
              return (
                <div
                  key={day}
                  className={`text-xs font-bold py-1.5 rounded ${
                    isPeakWeddingDay ? 'text-gold-600 bg-gold-50/20' : 'text-stone-400'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Main Grid of Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank cells for padding start of month */}
            {Array.from({ length: startDayIndex }).map((_, idx) => (
              <div 
                key={`empty-${idx}`} 
                className="aspect-square bg-stone-50/40 rounded-xl border border-dashed border-stone-150"
              />
            ))}

            {/* Active Days */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateBookings = getBookingsForDate(currentYear, currentMonth, dayNum);
              
              const isSelected = selectedDay === dayNum;
              const isSimulatedToday = currentYear === 2026 && currentMonth === 6 && dayNum === 3;
              
              const dayOfWeek = (startDayIndex + idx) % 7;
              const isAlgerianWeddingWeekend = dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5; // Jeudi, Vendredi, Samedi

              // Calculate indicators
              const strDate = toDateStr(currentYear, currentMonth, dayNum);
              const hasDepartures = dateBookings.some(b => b.startDate === strDate);
              const hasReturns = dateBookings.some(b => b.endDate === strDate);

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`aspect-square p-2 rounded-xl border flex flex-col justify-between transition-all group relative ${
                    isSelected
                      ? 'bg-navy-950 text-white border-navy-950 shadow-md scale-102 z-10'
                      : isSimulatedToday
                      ? 'bg-gold-50/50 border-2 border-gold-500 text-stone-900 shadow-xs'
                      : isAlgerianWeddingWeekend
                      ? 'bg-gradient-to-tr from-gold-50/20 to-gold-50/40 border-stone-200 hover:border-gold-300 hover:bg-gold-50/40 text-stone-800'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50 text-stone-850'
                  }`}
                >
                  {/* Day Label */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold font-mono ${
                      isSelected ? 'text-white' : isSimulatedToday ? 'text-gold-700 font-extrabold' : 'text-stone-800'
                    }`}>
                      {dayNum}
                    </span>

                    {/* Today simulated tag icon */}
                    {isSimulatedToday && !isSelected && (
                      <span className="w-1.5 h-1.5 bg-gold-600 rounded-full animate-pulse" title="Aujourd'hui" />
                    )}
                  </div>

                  {/* Visual Markers */}
                  <div className="w-full mt-auto flex flex-col gap-1">
                    
                    {/* Compact layout of indicators on hover or screen */}
                    <div className="flex gap-1 justify-start">
                      {hasDepartures && (
                        <span className="w-2 h-2 rounded-full bg-amber-500" title="Départ prévu" />
                      )}
                      {hasReturns && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Retour attendu" />
                      )}
                    </div>

                    {/* Mini booking names if space allows (displays on XL and hides on smaller screens) */}
                    <div className="hidden lg:block space-y-0.5 max-h-[22px] overflow-hidden">
                      {dateBookings.slice(0, 1).map(b => {
                        const dress = dresses.find(d => d.id === b.dressId);
                        const role = getBookingRoleOnDay(b, strDate);
                        return (
                          <p 
                            key={b.id} 
                            className={`text-[8px] font-bold tracking-tight truncate rounded-sm px-1 py-0.2 ${
                              isSelected 
                                ? 'bg-white/10 text-gold-300' 
                                : role === 'départ' 
                                ? 'bg-amber-100 text-amber-800' 
                                : role === 'retour' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            N° {dress?.number || '--'} - {b.clientName.split(' ')[0]}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wedding day explanation banner */}
        <div className="mt-6 p-3 bg-gold-50/40 rounded-xl border border-gold-500/10 text-[11px] text-stone-600 leading-relaxed flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold-500 flex-shrink-0 animate-pulse" />
          <span>
            Les jours surlignés en <strong>or pâle (Jeudi, Vendredi, Samedi)</strong> correspondent aux week-ends de cérémonies de mariage en Algérie. Les demandes de sortie de robes sont d'autant plus denses à ces dates.
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Day Details & Agenda Panel */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        
        {/* If a day is selected */}
        {selectedDay ? (
          <div className="space-y-5 h-full flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="border-b border-stone-100 pb-4 mb-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Détail du planning</span>
                <h4 className="font-serif font-extrabold text-stone-900 text-lg mt-0.5">
                  {selectedDay} {MONTHS_FR[currentMonth]} {currentYear}
                </h4>
                
                {/* Financial overview of this active day */}
                {bookingsOnSelectedDay.length > 0 && (
                  <div className="mt-3.5 bg-stone-50 border border-stone-150 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-stone-400 block font-medium">Chiffre d'Affaires du Jour</span>
                      <strong className="text-stone-800 text-sm font-mono">{formatDA(financials.expected)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-400 block font-medium">Restant à encaisser</span>
                      <strong className={`text-sm font-mono font-bold ${financials.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {formatDA(financials.balance)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Switcher for Today's Bookings */}
              <div className="flex gap-1 bg-stone-100 p-1 rounded-lg text-[11px] font-bold mb-4">
                <button
                  onClick={() => setAgendaFilter('all')}
                  className={`flex-1 text-center py-1 rounded transition-all ${
                    agendaFilter === 'all' ? 'bg-white text-navy-950 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Tout ({bookingsOnSelectedDay.length})
                </button>
                <button
                  onClick={() => setAgendaFilter('departures')}
                  className={`flex-1 text-center py-1 rounded transition-all ${
                    agendaFilter === 'departures' ? 'bg-amber-500 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Sorties ({bookingsOnSelectedDay.filter(b => b.startDate === selectedDateStr).length})
                </button>
                <button
                  onClick={() => setAgendaFilter('returns')}
                  className={`flex-1 text-center py-1 rounded transition-all ${
                    agendaFilter === 'returns' ? 'bg-emerald-500 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Retours ({bookingsOnSelectedDay.filter(b => b.endDate === selectedDateStr).length})
                </button>
              </div>

              {/* Listed Agenda Items */}
              <div className="space-y-4.5 max-h-[380px] overflow-y-auto pr-1">
                
                {/* Bookings mapped */}
                {filteredBookings.length > 0 && (
                  <div className="space-y-3">
                    {filteredBookings.map((b) => {
                      const dress = dresses.find(d => d.id === b.dressId);
                      const isDeparture = b.startDate === selectedDateStr;
                      const isReturn = b.endDate === selectedDateStr;
                      const outstandingBalance = b.totalPrice - b.depositPaid;

                      return (
                        <div 
                          key={b.id} 
                          className={`p-3.5 rounded-xl border transition-all ${
                            isDeparture 
                              ? 'bg-amber-500/5 border-amber-500/20' 
                              : isReturn 
                              ? 'bg-emerald-500/5 border-emerald-500/20' 
                              : 'bg-stone-50 border-stone-200'
                          }`}
                        >
                          {/* Top strip */}
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider border ${
                                isDeparture 
                                  ? 'bg-amber-500/15 text-amber-800 border-amber-500/25' 
                                  : isReturn 
                                  ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/25' 
                                  : 'bg-stone-200/60 text-stone-700 border-stone-250'
                              }`}>
                                {isDeparture ? '📤 Sortie / Départ' : isReturn ? '📥 Retour Prévu' : '🗓️ En Location'}
                              </span>
                              
                              <h5 className="font-serif font-bold text-stone-900 text-sm mt-1.5 leading-tight">
                                {dress?.name || 'Robe inconnue'}
                              </h5>
                              <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                                Ref: N° {dress?.number || '--'} | T{dress?.size} | {dress?.color}
                              </p>
                            </div>

                            {/* Booking main status tag */}
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                              b.status === 'Récupéré'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : b.status === 'Retourné'
                                ? 'bg-stone-100 text-stone-500 border-stone-200'
                                : b.status === 'Confirmé'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-rose-100 text-rose-800 border-rose-200'
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          {/* Client Detail Block */}
                          <div className="bg-white/80 border border-stone-150 rounded-lg p-2.5 text-xs space-y-1 mb-2.5">
                            <div className="flex items-center gap-1.5 text-stone-700">
                              <User className="w-3.5 h-3.5 text-stone-400" />
                              <strong className="font-semibold text-stone-850">{b.clientName}</strong>
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-500">
                              <Phone className="w-3.5 h-3.5 text-stone-400" />
                              <a href={`tel:${b.clientPhone}`} className="text-gold-600 font-bold hover:underline">
                                {b.clientPhone}
                              </a>
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-500">
                              <MapPin className="w-3.5 h-3.5 text-stone-400" />
                              <span>{b.clientCity}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-500 pt-1.5 mt-1 border-t border-stone-100">
                              <Clock className="w-3.5 h-3.5 text-stone-400 animate-pulse" />
                              <span className="font-medium text-stone-600">
                                Du {b.startDate} au {b.endDate}
                              </span>
                            </div>
                          </div>

                          {/* Financial Detail & Solde alert */}
                          <div className="flex items-center justify-between text-[11px] p-2 bg-stone-100/60 rounded-lg border border-stone-150 mb-3">
                            <div>
                              <span className="text-stone-400 font-medium">Prix total : </span>
                              <span className="font-mono font-bold text-stone-800">{formatDA(b.totalPrice)}</span>
                            </div>
                            <div className="text-right">
                              {outstandingBalance > 0 ? (
                                <>
                                  <span className="text-amber-700 font-bold">Reste à payer : </span>
                                  <span className="font-mono font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{formatDA(outstandingBalance)}</span>
                                </>
                              ) : (
                                <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                                  ✓ Intégralement Payé
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Workflow Action Panel */}
                          <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
                            {/* Update Status Buttons */}
                            {b.status === 'Confirmé' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Enregistrer la sortie de la robe "${dress?.name}" pour ${b.clientName} ?`)) {
                                    onUpdateBookingStatus(b.id, 'Récupéré');
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-lg shadow-2xs transition-all flex items-center gap-1"
                              >
                                <ArrowUpRight className="w-3 h-3" /> Remettre la robe
                              </button>
                            )}

                            {b.status === 'Récupéré' && (
                              <button
                                onClick={() => {
                                  const confirmMsg = outstandingBalance > 0 
                                    ? `Confirmer le retour de la robe ?\n⚠️ Attention : Il reste un solde de ${formatDA(outstandingBalance)} à encaisser chez ${b.clientName}.`
                                    : `Enregistrer le retour de la robe ?`;
                                  if (confirm(confirmMsg)) {
                                    onUpdateBookingStatus(b.id, 'Retourné');
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-lg shadow-2xs transition-all flex items-center gap-1"
                              >
                                <ArrowDownLeft className="w-3 h-3" /> Enregistrer le retour
                              </button>
                            )}

                            {/* Direct Payment Action */}
                            {b.paymentStatus !== 'Payé' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Marquer la réservation de ${b.clientName} comme entièrement PAYÉE ?\nLe versement du solde restant de ${formatDA(outstandingBalance)} sera validé.`)) {
                                    onUpdatePaymentStatus(b.id, 'Payé');
                                  }
                                }}
                                className="px-2 py-1.5 border border-gold-500 hover:bg-gold-50 text-gold-700 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all"
                              >
                                💰 Régler le solde
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Empty State for selection with no items */}
                {filteredBookings.length === 0 && (
                  <div className="text-center py-12 text-stone-400 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                    <AlertCircle className="w-7 h-7 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs font-bold">Aucun événement ne correspond au filtre</p>
                    <p className="text-[10px] text-stone-400 mt-1 max-w-[180px] mx-auto">
                      Essayez de changer de filtre ou de sélectionner un autre jour.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Total count of events in selection */}
            <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-400 flex justify-between items-center">
              <span>Réservations totales ce jour-là :</span>
              <strong className="text-stone-700">{bookingsOnSelectedDay.length} engagées</strong>
            </div>
          </div>
        ) : (
          /* Empty selection state */
          <div className="text-center py-16 text-stone-400 flex flex-col items-center justify-center h-full space-y-3">
            <div className="p-3 bg-gold-50 rounded-full border border-gold-100 text-gold-600 animate-bounce">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h5 className="font-serif font-bold text-stone-800 text-sm">Organisez votre planning</h5>
            <p className="text-xs leading-relaxed max-w-[210px] mx-auto">
              Sélectionnez un jour sur le calendrier pour visualiser ses sorties, retours ou régler les acomptes.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
