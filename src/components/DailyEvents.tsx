/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Booking, Dress } from '../types';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles, 
  Check, 
  Clock, 
  AlertCircle
} from 'lucide-react';

interface DailyEventsProps {
  bookings: Booking[];
  dresses: Dress[];
  onUpdateBookingStatus: (id: string, status: 'Confirmé' | 'Récupéré' | 'Retourné' | 'Annulé') => void;
}

export default function DailyEvents({ bookings, dresses, onUpdateBookingStatus }: DailyEventsProps) {
  // Default to July 3rd, 2026 (matching the mock data and current context time)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // If real today is in 2026, we can use it, else default to '2026-07-02' or '2026-07-03'
    const today = new Date();
    const year = today.getFullYear();
    if (year === 2026) {
      return today.toISOString().split('T')[0];
    }
    return '2026-07-03'; // Elegant mock starting date where bookings are active
  });

  // Navigation helpers for dates
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const setToday = () => {
    setSelectedDate('2026-07-03');
  };

  // Helper to format date in french
  const formatDateFrench = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Filters for events
  // 1. Departures (Sorties / Début de location)
  const departures = bookings.filter(b => b.startDate === selectedDate && b.status !== 'Annulé');
  
  // 2. Returns (Retours / Fin de location)
  const returns = bookings.filter(b => b.endDate === selectedDate && b.status !== 'Annulé');

  const totalEventsCount = departures.length + returns.length;

  // Currency Formatter
  const formatDA = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 })
      .format(amount)
      .replace('DZD', 'DA');
  };

  return (
    <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-sm space-y-5">
      {/* Header section with Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gold-600" />
            Événements du Jour
          </h3>
          <p className="text-xs text-stone-400">Sorties et retours programmés</p>
        </div>

        {/* Date Selector controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors border border-stone-200"
            title="Jour précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={e => e.target.value && setSelectedDate(e.target.value)}
              className="px-3 py-1 text-xs font-bold font-mono text-stone-800 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors border border-stone-200"
            title="Jour suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={setToday}
            className="px-2.5 py-1 text-[10px] font-bold uppercase bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
            title="Aller au 3 Juillet 2026 (Simulé)"
          >
            Simuler "Aujourd'hui"
          </button>
        </div>
      </div>

      {/* Selected Date Title Display */}
      <div className="bg-stone-50 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs border border-stone-150">
        <span className="font-semibold text-stone-700 capitalize">
          {formatDateFrench(selectedDate)}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
          totalEventsCount > 0 ? 'bg-gold-500/15 text-gold-700 border border-gold-500/20' : 'bg-stone-200 text-stone-500'
        }`}>
          {totalEventsCount} {totalEventsCount > 1 ? 'événements' : 'événement'}
        </span>
      </div>

      {/* Detailed listings */}
      {totalEventsCount > 0 ? (
        <div className="space-y-5 max-h-[500px] overflow-y-auto pr-1">
          {/* Section 1: Departures */}
          {departures.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-amber-600" />
                📤 Sorties de Robes (Locations de début)
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {departures.map(b => {
                  const dress = dresses.find(d => d.id === b.dressId);
                  const isDelivered = b.status === 'Récupéré';
                  return (
                    <div key={b.id} className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-500/15 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div className="flex gap-3">
                        {dress && (
                          <img
                            src={dress.imageUrl}
                            alt={dress.name}
                            className="w-12 h-12 object-cover rounded-lg border border-amber-500/20 shadow-xs"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 px-1 rounded">
                              N° {dress?.number || '--'}
                            </span>
                            <span className="font-bold text-stone-850 text-xs sm:text-sm">{dress?.name || 'Robe inconnue'}</span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Cliente : <strong className="text-stone-800">{b.clientName}</strong> | <Phone className="w-3 h-3 inline text-stone-400 mb-0.5" /> {b.clientPhone}
                          </p>
                          <div className="text-[11px] text-amber-800 font-medium mt-1 flex items-center gap-2">
                            <span>Fin : {b.endDate}</span>
                            <span>•</span>
                            <span className="font-mono bg-white border border-amber-500/10 px-1.5 py-0.2 rounded shadow-2xs">
                              Reste : {formatDA(b.totalPrice - b.depositPaid)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action trigger */}
                      <div className="flex items-center gap-2 sm:self-center">
                        {isDelivered ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Récupéré
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              if (confirm(`Confirmer la remise de la robe "${dress?.name}" à ${b.clientName} ?\nLe statut passera à "Récupéré" et la robe à "Louée".`)) {
                                onUpdateBookingStatus(b.id, 'Récupéré');
                              }
                            }}
                            className="w-full sm:w-auto px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1"
                          >
                            Marquer comme Récupéré
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Returns */}
          {returns.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                📥 Retours de Robes (Fin de location)
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {returns.map(b => {
                  const dress = dresses.find(d => d.id === b.dressId);
                  const isReturned = b.status === 'Retourné';
                  const remaining = b.totalPrice - b.depositPaid;
                  return (
                    <div key={b.id} className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/15 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div className="flex gap-3">
                        {dress && (
                          <img
                            src={dress.imageUrl}
                            alt={dress.name}
                            className="w-12 h-12 object-cover rounded-lg border border-emerald-500/20 shadow-xs"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-1 rounded">
                              N° {dress?.number || '--'}
                            </span>
                            <span className="font-bold text-stone-850 text-xs sm:text-sm">{dress?.name || 'Robe inconnue'}</span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Cliente : <strong className="text-stone-800">{b.clientName}</strong> | <Phone className="w-3 h-3 inline text-stone-400 mb-0.5" /> {b.clientPhone}
                          </p>
                          <div className="text-[11px] text-emerald-800 font-medium mt-1 flex items-center gap-2">
                            <span>Statut : {b.status}</span>
                            {remaining > 0 && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-rose-600 font-mono bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                  Solde dû : {formatDA(remaining)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action trigger */}
                      <div className="flex items-center gap-2 sm:self-center">
                        {isReturned ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Retourné & Réglé
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              const alertMsg = remaining > 0 
                                ? `Confirmer le retour de la robe "${dress?.name}" ?\n⚠️ Attention : Il reste un solde de ${formatDA(remaining)} à encaisser chez ${b.clientName}.`
                                : `Confirmer le retour de la robe "${dress?.name}" ?`;
                              if (confirm(alertMsg)) {
                                onUpdateBookingStatus(b.id, 'Retourné');
                              }
                            }}
                            className="w-full sm:w-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1"
                          >
                            Enregistrer le retour
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-200">
          <AlertCircle className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-stone-500">Aucun événement programmé</p>
          <p className="text-[10px] text-stone-400 mt-1 max-w-xs mx-auto">
            Pas de sortie de robe ou de retour pour cette journée spécifique.
          </p>
        </div>
      )}
    </div>
  );
}
