/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Booking, Dress, Jewelry } from '../types';
import { 
  Search, 
  Calendar, 
  Phone, 
  Edit, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles, 
  MessageSquare, 
  Heart,
  List,
  Grid,
  Clock,
  Coins,
  Printer,
  Check,
  FileSignature,
  X,
  MapPin,
  Award,
  BookOpen,
  DollarSign,
  AlertTriangle,
  Sparkle
} from 'lucide-react';

interface BookingListProps {
  bookings: Booking[];
  dresses: Dress[];
  jewelry?: Jewelry[];
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (id: string) => void;
  onUpdateBookingStatus: (id: string, status: Booking['status']) => void;
  onUpdatePaymentStatus?: (id: string, paymentStatus: Booking['paymentStatus']) => void;
  checklists?: Record<string, Record<string, boolean>>;
  signatures?: Record<string, { signed: boolean; date: string; name: string }>;
  onUpdateChecklist?: (bookingId: string, itemKey: string) => void;
  onUpdateSignature?: (bookingId: string, clientName: string) => void;
}

export default function BookingList({ 
  bookings, 
  dresses, 
  jewelry = [], 
  onEditBooking, 
  onDeleteBooking, 
  onUpdateBookingStatus, 
  onUpdatePaymentStatus,
  checklists = {},
  signatures = {},
  onUpdateChecklist,
  onUpdateSignature
}: BookingListProps) {
  // Navigation & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'board'>('table');
  
  // Interactive Drawer and Receipt Modals
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeReceiptBooking, setActiveReceiptBooking] = useState<Booking | null>(null);
  
  // Detail Drawer Tabs
  const [drawerTab, setDrawerTab] = useState<'info' | 'payments' | 'terms' | 'reminders'>('info');
  
  // AI WhatsApp Reminder State
  const [reminderType, setReminderType] = useState<'confirmation' | 'retour' | 'essayage' | 'caution'>('confirmation');
  const [generatedText, setGeneratedText] = useState('');
  const [isGeneratingReminder, setIsGeneratingReminder] = useState(false);

  // Keep drawer booking reference updated when bookings change
  useEffect(() => {
    if (selectedBooking) {
      const updated = bookings.find(b => b.id === selectedBooking.id);
      if (updated) {
        setSelectedBooking(updated);
      } else {
        setSelectedBooking(null);
      }
    }
  }, [bookings]);

  // Helper formatting functions
  const formatDA = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 })
      .format(amount)
      .replace('DZD', 'DA');
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(dateStr);
    target.setHours(0,0,0,0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatWhatsAppUrl = (phone: string, text: string) => {
    let formattedPhone = phone.replace(/[\s.-]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '213' + formattedPhone.substring(1);
    }
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
  };

  // Filter logic
  const filteredBookings = bookings.filter(b => {
    const search = (searchTerm || '').toLowerCase();
    const dress = dresses.find(d => d.id === b.dressId);
    const dressNameMatch = dress && dress.name ? dress.name.toLowerCase().includes(search) : false;
    const dressNumberMatch = dress && dress.number ? dress.number.toLowerCase().includes(search) : false;

    const nameMatch = b.clientName ? b.clientName.toLowerCase().includes(search) : false;
    const phoneMatch = b.clientPhone ? b.clientPhone.includes(searchTerm) : false;
    const cityMatch = b.clientCity ? b.clientCity.toLowerCase().includes(search) : false;

    const matchesSearch = nameMatch || phoneMatch || cityMatch || dressNameMatch || dressNumberMatch;
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Metrics specifically for Contract Register
  const totalContracts = bookings.filter(b => b.status !== 'Annulé').length;
  const activeContracts = bookings.filter(b => b.status === 'Confirmé' || b.status === 'Récupéré').length;
  
  const remainingCash = bookings
    .filter(b => b.status !== 'Annulé')
    .reduce((sum, b) => sum + (b.totalPrice - b.depositPaid), 0);

  const pendingReturns = bookings.filter(b => b.status === 'Récupéré').length;

  const handleToggleChecklist = (bookingId: string, itemKey: string) => {
    if (onUpdateChecklist) {
      onUpdateChecklist(bookingId, itemKey);
    }
  };

  const handleSignContract = (bookingId: string, clientName: string) => {
    if (onUpdateSignature) {
      onUpdateSignature(bookingId, clientName);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Premium Hero Title Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-2xl border border-gold-500/15 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 rounded-full bg-gold-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-[10px] uppercase font-bold tracking-widest text-gold-400">
              <Sparkle className="w-3 h-3 text-gold-400 animate-spin-slow" />
              Registre Officiel
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-white tracking-tight">Gestion des Contrats de Location</h1>
            <p className="text-xs text-stone-400 max-w-2xl">
              Suivez en temps réel les essayages, livraisons de robes, retours de parures, signatures de contrats physiques, et réglements de soldes pour les mariées d'exception de la Maison Zeyna.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-stone-400 hidden sm:inline">Visualisation :</span>
            <div className="inline-flex rounded-lg p-0.5 bg-navy-950 border border-navy-850">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'table' 
                    ? 'bg-gold-500 text-navy-950 font-bold shadow-md' 
                    : 'text-stone-400 hover:text-white hover:bg-navy-900/50'
                }`}
                title="Vue en Table"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'cards' 
                    ? 'bg-gold-500 text-navy-950 font-bold shadow-md' 
                    : 'text-stone-400 hover:text-white hover:bg-navy-900/50'
                }`}
                title="Vue en Cartes"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'board' 
                    ? 'bg-gold-500 text-navy-950 font-bold shadow-md' 
                    : 'text-stone-400 hover:text-white hover:bg-navy-900/50'
                }`}
                title="Pipeline Logistique"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Luxury metrics stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-navy-850">
          <div className="bg-navy-950/40 border border-navy-850/60 rounded-xl p-4 transition-all hover:border-gold-500/20">
            <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Total Contrats</div>
            <div className="text-xl md:text-2xl font-serif text-white font-semibold mt-1 flex items-baseline gap-1.5">
              <span>{totalContracts}</span>
              <span className="text-xs text-stone-500 font-sans font-medium">validés</span>
            </div>
          </div>
          
          <div className="bg-navy-950/40 border border-navy-850/60 rounded-xl p-4 transition-all hover:border-gold-500/20">
            <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Locations Actives</div>
            <div className="text-xl md:text-2xl font-serif text-amber-400 font-semibold mt-1 flex items-baseline gap-1.5">
              <span>{activeContracts}</span>
              <span className="text-xs text-amber-500/70 font-sans font-medium">en cours</span>
            </div>
          </div>

          <div className="bg-navy-950/40 border border-navy-850/60 rounded-xl p-4 transition-all hover:border-gold-500/20">
            <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Retours à Récupérer</div>
            <div className="text-xl md:text-2xl font-serif text-rose-400 font-semibold mt-1 flex items-baseline gap-1.5">
              <span>{pendingReturns}</span>
              <span className="text-xs text-rose-500/70 font-sans font-medium">robes sorties</span>
            </div>
          </div>

          <div className="bg-navy-950/40 border border-navy-850/60 rounded-xl p-4 transition-all hover:border-gold-500/20">
            <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Reste à Encaisser</div>
            <div className="text-xl md:text-2xl font-mono text-emerald-400 font-bold mt-1">
              {formatDA(remainingCash)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Rechercher par mariée, n° de téléphone, wilaya, nom de robe..."
            className="w-full pl-9 pr-4 py-2 bg-navy-950 border border-navy-850 rounded-lg text-xs md:text-sm text-stone-200 focus:outline-none focus:ring-1 focus:ring-gold-500 placeholder-stone-500 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dynamic status pill filters */}
        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { key: 'All', label: 'Toutes les locations' },
            { key: 'Confirmé', label: 'Confirmées' },
            { key: 'Récupéré', label: 'Sorties (Récupérées)' },
            { key: 'Retourné', label: 'Rendues' },
            { key: 'Annulé', label: 'Annulées' }
          ].map((pill) => (
            <button
              key={pill.key}
              onClick={() => setStatusFilter(pill.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                statusFilter === pill.key
                  ? 'bg-gold-500 text-navy-950 border-gold-400 shadow-sm'
                  : 'bg-navy-950 text-stone-400 border-navy-850 hover:bg-navy-850 hover:text-stone-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: ELEGANT DETAILED TABLE */}
      {viewMode === 'table' && (
        <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-xl text-stone-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-navy-950 border-b border-navy-850 text-stone-400 font-semibold text-[10px] uppercase tracking-wider">
                  <th className="p-4">Contrat &amp; Mariée</th>
                  <th className="p-4">Robe &amp; Ornements</th>
                  <th className="p-4">Dates &amp; Agenda</th>
                  <th className="p-4">Soldes Financiers</th>
                  <th className="p-4 text-center">État Logistique</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-850/60">
                {filteredBookings.map((b) => {
                  const dress = dresses.find(d => d.id === b.dressId);
                  const daysLeft = getDaysUntil(b.startDate);
                  const isSigned = signatures[b.id]?.signed;
                  
                  return (
                    <tr 
                      key={b.id} 
                      className="hover:bg-navy-850/30 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedBooking(b);
                        setDrawerTab('info');
                      }}
                    >
                      {/* Customer Info */}
                      <td className="p-4 max-w-xs">
                        <div className="flex items-start gap-2.5">
                          <div className="bg-navy-950 p-2 rounded-lg border border-navy-800 text-gold-500 flex-shrink-0 group-hover:border-gold-500/30 transition-all">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-gold-400 transition-colors flex items-center gap-1.5 flex-wrap">
                              <span>{b.clientName}</span>
                              {isSigned && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-mono" title="Contrat Signé Numériquement">
                                  <Check className="w-2.5 h-2.5" /> Signé
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
                              <Phone className="w-3 h-3 text-stone-500" />
                              <span className="font-mono">{b.clientPhone}</span>
                              <span className="text-stone-600">•</span>
                              <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {b.clientCity}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Dress & Jewelry */}
                      <td className="p-4">
                        {dress ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={dress.imageUrl}
                              alt={dress.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 object-cover rounded-md border border-navy-800 shadow bg-black"
                            />
                            <div>
                              <div className="font-semibold text-stone-100 flex items-center gap-1.5">
                                <span className="text-[9px] font-bold font-mono bg-gold-500/10 text-gold-400 border border-gold-500/20 px-1 py-0.5 rounded">N° {dress.number}</span>
                                <span>{dress.name}</span>
                              </div>
                              <div className="text-[11px] text-stone-400 mt-0.5">Taille {dress.size} | {dress.color}</div>
                              {b.jewelryId && (
                                (() => {
                                  const jewel = jewelry.find(j => j.id === b.jewelryId);
                                  return jewel ? (
                                    <div className="text-[9px] text-amber-400 font-bold mt-1 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                                      ✨ Bijou : {jewel.name}
                                    </div>
                                  ) : null;
                                })()
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-stone-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Robe supprimée
                          </div>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="p-4">
                        <div className="text-stone-200 font-medium text-xs">Du {b.startDate}</div>
                        <div className="text-stone-400 text-xs mt-0.5">Au {b.endDate}</div>
                        
                        {/* Countdown indicator */}
                        {b.status === 'Confirmé' && (
                          <div className="mt-1.5">
                            {daysLeft === 0 ? (
                              <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">Aujourd'hui 🚨</span>
                            ) : daysLeft > 0 && daysLeft <= 5 ? (
                              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Dans {daysLeft} jours ⏳</span>
                            ) : daysLeft < 0 ? (
                              <span className="text-[9px] font-bold text-rose-500 bg-rose-900/10 px-1.5 py-0.5 rounded border border-rose-900/20">Date dépassée</span>
                            ) : (
                              <span className="text-[9px] text-stone-500">Dans {daysLeft} jours</span>
                            )}
                          </div>
                        )}
                        
                        {b.weddingDate && (
                          <div className="text-[9px] text-pink-400 font-bold mt-1 flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-pink-400/10" /> Mariage: {b.weddingDate}
                          </div>
                        )}
                      </td>

                      {/* Finances */}
                      <td className="p-4">
                        <div className="font-bold text-white font-mono">{formatDA(b.totalPrice)}</div>
                        <div className="text-xs text-stone-400 font-mono mt-0.5">Acompte: {formatDA(b.depositPaid)}</div>
                        
                        {b.totalPrice - b.depositPaid > 0 ? (
                          <div className="text-xs text-amber-500 font-bold font-mono mt-0.5">Reste: {formatDA(b.totalPrice - b.depositPaid)}</div>
                        ) : (
                          <div className="text-xs text-emerald-400 font-bold font-mono mt-0.5 flex items-center gap-0.5">Payé Complet ✓</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col gap-1 items-center" onClick={(e) => e.stopPropagation()}>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${
                              b.status === 'Récupéré'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : b.status === 'Retourné'
                                ? 'bg-stone-850 text-stone-500 border-stone-800'
                                : b.status === 'Annulé'
                                ? 'bg-rose-950/40 text-rose-500 border-rose-900/40'
                                : 'bg-gold-500/10 text-gold-400 border-gold-500/20'
                            }`}
                          >
                            {b.status === 'Confirmé' ? 'Confirmé' : b.status === 'Récupéré' ? 'Sortie' : b.status === 'Retourné' ? 'Rendue' : b.status}
                          </span>

                          <span
                            className={`text-[8px] font-medium px-1.5 py-0.2 rounded border ${
                              b.paymentStatus === 'Payé'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                : b.paymentStatus === 'Acompte Versé'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                                : 'bg-rose-950/40 text-rose-400 border-rose-900/30'
                            }`}
                          >
                            {b.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Quick Actions (Prevent Row click) */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1">
                          
                          {/* Quick Delivery/Return workflow toggle */}
                          {b.status === 'Confirmé' && (
                            <button
                              onClick={() => {
                                if (confirm(`Confirmer la sortie physique de la robe "${dress?.name || 'robe'}" pour la mariée ${b.clientName} ?`)) {
                                  onUpdateBookingStatus(b.id, 'Récupéré');
                                }
                              }}
                              className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-navy-850 rounded transition-all"
                              title="Remettre la robe (Marquer comme sortie)"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </button>
                          )}

                          {b.status === 'Récupéré' && (
                            <button
                              onClick={() => {
                                const remaining = b.totalPrice - b.depositPaid;
                                const confirmMsg = remaining > 0 
                                  ? `Enregistrer le retour de la robe "${dress?.name || 'robe'}" ?\n⚠️ ATTENTION : Un solde de ${formatDA(remaining)} sera automatiquement enregistré comme encaissé.`
                                  : `Enregistrer le retour de la robe "${dress?.name || 'robe'}" ?`;
                                if (confirm(confirmMsg)) {
                                  onUpdateBookingStatus(b.id, 'Retourné');
                                }
                              }}
                              className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-navy-850 rounded transition-all"
                              title="Retourner la robe (Marquer comme rendue)"
                            >
                              <ArrowDownLeft className="w-4 h-4" />
                            </button>
                          )}

                          {/* Detail Button */}
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setDrawerTab('info');
                            }}
                            className="p-1.5 text-stone-400 hover:text-gold-500 hover:bg-navy-850 rounded transition-all"
                            title="Ouvrir la fiche de suivi"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Print Receipt */}
                          <button
                            onClick={() => setActiveReceiptBooking(b)}
                            className="p-1.5 text-stone-400 hover:text-white hover:bg-navy-850 rounded transition-all"
                            title="Imprimer le Reçu d'acompte"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Quick Edit */}
                          <button
                            onClick={() => onEditBooking(b)}
                            className="p-1.5 text-stone-400 hover:text-gold-500 hover:bg-navy-850 rounded transition-all"
                            title="Modifier le contrat"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm('Voulez-vous vraiment supprimer définitivement ce contrat de location ?')) {
                                onDeleteBooking(b.id);
                              }
                            }}
                            className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-all"
                            title="Supprimer la réservation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-stone-500">
                      <Calendar className="w-12 h-12 text-stone-850 mx-auto mb-3 animate-pulse" />
                      <p className="font-semibold text-stone-400 text-sm">Aucun contrat ne correspond à ces filtres</p>
                      <p className="text-xs text-stone-500 mt-1">Essayez une autre recherche ou créez un nouveau contrat de location.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: ROYAL CONTRACT CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((b) => {
            const dress = dresses.find(d => d.id === b.dressId);
            const jewel = jewelry.find(j => j.id === b.jewelryId);
            const daysLeft = getDaysUntil(b.startDate);
            const isSigned = signatures[b.id]?.signed;

            return (
              <div 
                key={b.id} 
                className="bg-navy-900 border border-navy-850 rounded-2xl p-5 hover:border-gold-500/20 transition-all shadow-lg hover:shadow-xl relative flex flex-col justify-between cursor-pointer group"
                onClick={() => {
                  setSelectedBooking(b);
                  setDrawerTab('info');
                }}
              >
                {/* Header card details */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-navy-950 rounded-lg border border-navy-800 text-gold-500 group-hover:border-gold-500/30 transition-all">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-gold-400 transition-colors text-sm">{b.clientName}</h4>
                        <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-stone-500" /> {b.clientCity}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                        b.status === 'Récupéré'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : b.status === 'Retourné'
                          ? 'bg-stone-850 text-stone-500 border-stone-800'
                          : b.status === 'Annulé'
                          ? 'bg-rose-950/40 text-rose-500 border-rose-900/40'
                          : 'bg-gold-500/10 text-gold-400 border-gold-500/20'
                      }`}>
                        {b.status === 'Confirmé' ? 'Confirmé' : b.status === 'Récupéré' ? 'Sortie' : b.status === 'Retourné' ? 'Rendue' : b.status}
                      </span>
                    </div>
                  </div>

                  {/* Dress layout preview inside card */}
                  {dress && (
                    <div className="bg-navy-950/70 p-3 rounded-xl border border-navy-850/60 flex items-center gap-3">
                      <img
                        src={dress.imageUrl}
                        alt={dress.name}
                        className="w-12 h-12 rounded-lg object-cover border border-navy-800 shadow bg-black flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5 truncate">
                          <span className="text-[9px] font-mono font-bold bg-gold-500/10 text-gold-400 px-1 py-0.2 rounded">N° {dress.number}</span>
                          <span className="truncate">{dress.name}</span>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-0.5">Taille {dress.size} | {dress.color}</p>
                        
                        {jewel && (
                          <p className="text-[9px] text-amber-400 font-bold mt-1.5 flex items-center gap-0.5">
                            💎 {jewel.name} (N° {jewel.number})
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rental schedule timeline block */}
                  <div className="grid grid-cols-2 gap-2 bg-navy-950/30 p-2.5 rounded-xl border border-navy-850/30 text-[11px]">
                    <div>
                      <span className="text-[9px] font-bold text-stone-500 block uppercase">Départ</span>
                      <span className="font-bold text-stone-200">{b.startDate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-stone-500 block uppercase">Retour prévu</span>
                      <span className="font-bold text-stone-200">{b.endDate}</span>
                    </div>
                  </div>

                  {/* Event indicator block */}
                  {b.weddingDate && (
                    <div className="text-[10px] text-pink-400 font-bold bg-pink-500/5 px-2.5 py-1.5 rounded-lg border border-pink-500/10 flex items-center gap-1.5">
                      <Heart className="w-3 h-3 fill-pink-400/15" /> 
                      <span>Célébration le {b.weddingDate}</span>
                    </div>
                  )}

                  {/* Alert state banner */}
                  {b.status === 'Confirmé' && daysLeft >= 0 && daysLeft <= 5 && (
                    <div className="bg-amber-500/5 text-amber-400 border border-amber-500/10 p-2 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>Robe à préparer en urgence ! Sortie dans {daysLeft} jours</span>
                    </div>
                  )}
                </div>

                {/* Footer details of card */}
                <div className="mt-5 pt-3 border-t border-navy-850 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-stone-500 tracking-wider">Solde Location</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-bold font-mono text-white text-sm">{formatDA(b.totalPrice)}</span>
                      {b.totalPrice - b.depositPaid > 0 ? (
                        <span className="text-[10px] font-mono text-amber-400 font-bold">Reste {formatDA(b.totalPrice - b.depositPaid)}</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">Payé ✓</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        setDrawerTab('info');
                      }}
                      className="p-1.5 bg-navy-950 hover:bg-navy-850 text-stone-300 border border-navy-800 hover:border-gold-500/30 rounded-lg transition-all"
                      title="Ouvrir la fiche de suivi"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveReceiptBooking(b)}
                      className="p-1.5 bg-navy-950 hover:bg-navy-850 text-stone-300 border border-navy-800 hover:border-gold-500/30 rounded-lg transition-all"
                      title="Imprimer le Reçu"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditBooking(b)}
                      className="p-1.5 bg-navy-950 hover:bg-navy-850 text-stone-300 border border-navy-800 hover:border-gold-500/30 rounded-lg transition-all"
                      title="Modifier le contrat"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredBookings.length === 0 && (
            <div className="col-span-full bg-navy-900 border border-navy-800 rounded-2xl p-12 text-center text-stone-500">
              <Calendar className="w-12 h-12 text-stone-850 mx-auto mb-3" />
              <p className="font-semibold text-stone-400 text-sm">Aucun contrat trouvé</p>
              <p className="text-xs text-stone-500 mt-1">Modifiez vos filtres de recherche.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: PIPELINE LOGISTICS BOARD */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Confirmés (Réservés) */}
          <div className="bg-navy-950/60 border border-navy-850 rounded-2xl p-4 flex flex-col space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-navy-850">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gold-400" />
                <h3 className="font-serif text-sm font-semibold text-white">Contrats Confirmés ({filteredBookings.filter(b => b.status === 'Confirmé').length})</h3>
              </div>
              <span className="text-[10px] font-bold text-stone-500 bg-navy-900 px-2 py-0.5 rounded border border-navy-800">Étape 1</span>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {filteredBookings.filter(b => b.status === 'Confirmé').map((b) => {
                const dress = dresses.find(d => d.id === b.dressId);
                const daysLeft = getDaysUntil(b.startDate);
                
                return (
                  <div 
                    key={b.id}
                    onClick={() => {
                      setSelectedBooking(b);
                      setDrawerTab('info');
                    }}
                    className="bg-navy-900 border border-navy-850 p-4 rounded-xl hover:border-gold-500/20 transition-all shadow-sm hover:shadow-md cursor-pointer group relative overflow-hidden"
                  >
                    {daysLeft >= 0 && daysLeft <= 4 && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" title="Sortie imminente !" />
                    )}
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-xs truncate group-hover:text-gold-400 transition-colors">{b.clientName}</h4>
                        <p className="text-[10px] text-stone-400 mt-0.5 font-mono">{b.clientPhone}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Confirmer la livraison de la robe pour ${b.clientName} ? Le statut passera à "Sortie".`)) {
                            onUpdateBookingStatus(b.id, 'Récupéré');
                          }
                        }}
                        className="p-1.5 bg-navy-950 hover:bg-gold-500 text-amber-500 hover:text-navy-950 rounded-lg border border-navy-850 transition-all"
                        title="Livrer la robe à la mariée (Sortie)"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {dress && (
                      <div className="mt-3 flex items-center gap-2 text-[10px] text-stone-300 bg-navy-950/40 p-2 rounded-lg border border-navy-850/40">
                        <span className="font-bold font-mono text-gold-400">N° {dress.number}</span>
                        <span className="truncate">{dress.name}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-navy-850/60 text-[10px]">
                      <span className="text-stone-400 font-medium">Départ: {b.startDate}</span>
                      {daysLeft === 0 ? (
                        <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">Aujourd'hui 🚨</span>
                      ) : daysLeft > 0 && daysLeft <= 4 ? (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">J-{daysLeft} ⏳</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {filteredBookings.filter(b => b.status === 'Confirmé').length === 0 && (
                <div className="p-8 text-center text-stone-500 border border-dashed border-navy-800 rounded-xl">
                  <p className="text-xs">Aucun contrat confirmé</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Sorties (Récupérées) */}
          <div className="bg-navy-950/60 border border-navy-850 rounded-2xl p-4 flex flex-col space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-navy-850">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="font-serif text-sm font-semibold text-white">Robes Sorties ({filteredBookings.filter(b => b.status === 'Récupéré').length})</h3>
              </div>
              <span className="text-[10px] font-bold text-stone-500 bg-navy-900 px-2 py-0.5 rounded border border-navy-800">Étape 2</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {filteredBookings.filter(b => b.status === 'Récupéré').map((b) => {
                const dress = dresses.find(d => d.id === b.dressId);
                const daysUntilReturn = getDaysUntil(b.endDate);
                
                return (
                  <div 
                    key={b.id}
                    onClick={() => {
                      setSelectedBooking(b);
                      setDrawerTab('info');
                    }}
                    className="bg-navy-900 border border-navy-850 p-4 rounded-xl hover:border-gold-500/20 transition-all shadow-sm hover:shadow-md cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-xs truncate group-hover:text-gold-400 transition-colors">{b.clientName}</h4>
                        <p className="text-[10px] text-stone-400 mt-0.5 font-mono">{b.clientPhone}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Enregistrer le retour de la robe pour ${b.clientName} ? Le statut passera à "Rendue".`)) {
                            onUpdateBookingStatus(b.id, 'Retourné');
                          }
                        }}
                        className="p-1.5 bg-navy-950 hover:bg-emerald-500 text-emerald-500 hover:text-navy-950 rounded-lg border border-navy-850 transition-all"
                        title="Enregistrer le retour de la robe (Rendue)"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {dress && (
                      <div className="mt-3 flex items-center gap-2 text-[10px] text-stone-300 bg-navy-950/40 p-2 rounded-lg border border-navy-850/40">
                        <span className="font-bold font-mono text-gold-400">N° {dress.number}</span>
                        <span className="truncate">{dress.name}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-navy-850/60 text-[10px]">
                      <span className="text-stone-400 font-medium">Retour prévu: {b.endDate}</span>
                      {daysUntilReturn < 0 ? (
                        <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">Retard ! ⚠️</span>
                      ) : daysUntilReturn === 0 ? (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">Aujourd'hui</span>
                      ) : (
                        <span className="text-stone-500">J-{daysUntilReturn}</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredBookings.filter(b => b.status === 'Récupéré').length === 0 && (
                <div className="p-8 text-center text-stone-500 border border-dashed border-navy-800 rounded-xl">
                  <p className="text-xs">Aucune robe n'est actuellement sortie</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Rendus (Clôturés) */}
          <div className="bg-navy-950/60 border border-navy-850 rounded-2xl p-4 flex flex-col space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-navy-850">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="font-serif text-sm font-semibold text-white">Robes Rendues / Clôturées ({filteredBookings.filter(b => b.status === 'Retourné').length})</h3>
              </div>
              <span className="text-[10px] font-bold text-stone-500 bg-navy-900 px-2 py-0.5 rounded border border-navy-800">Étape 3</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {filteredBookings.filter(b => b.status === 'Retourné').map((b) => {
                const dress = dresses.find(d => d.id === b.dressId);
                
                return (
                  <div 
                    key={b.id}
                    onClick={() => {
                      setSelectedBooking(b);
                      setDrawerTab('info');
                    }}
                    className="bg-navy-900 border border-navy-850 p-4 rounded-xl hover:border-gold-500/10 transition-all opacity-80 hover:opacity-100 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h4 className="font-bold text-stone-300 text-xs truncate group-hover:text-gold-400 transition-colors">{b.clientName}</h4>
                        <p className="text-[10px] text-stone-500 mt-0.5 font-mono">{b.clientPhone}</p>
                      </div>
                      <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 text-[9px] font-bold font-mono">
                        Payé Complet
                      </span>
                    </div>

                    {dress && (
                      <div className="mt-3 flex items-center gap-2 text-[10px] text-stone-400 bg-navy-950/20 p-2 rounded-lg border border-navy-850/20">
                        <span className="font-bold font-mono text-stone-500">N° {dress.number}</span>
                        <span className="truncate">{dress.name}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-navy-850/60 text-[10px] text-stone-500">
                      <span>Rendue avec succès ✔</span>
                      <span>Total: {formatDA(b.totalPrice)}</span>
                    </div>
                  </div>
                );
              })}

              {filteredBookings.filter(b => b.status === 'Retourné').length === 0 && (
                <div className="p-8 text-center text-stone-500 border border-dashed border-navy-800 rounded-xl">
                  <p className="text-xs">Aucun contrat clôturé pour le moment</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* DETAILED SLIDE-OVER DRAWER MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in print:hidden">
          {/* Backdrop dismiss */}
          <div className="absolute inset-0" onClick={() => setSelectedBooking(null)} />
          
          {/* Drawer content panel */}
          <div className="relative w-full max-w-xl bg-navy-900 border-l border-navy-800 shadow-2xl h-full flex flex-col justify-between text-stone-200 animate-slide-left z-10">
            
            {/* Header of Drawer */}
            <div className="p-5 border-b border-navy-850 bg-navy-950 flex justify-between items-center">
              <div>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/25 uppercase tracking-wider">
                  Contrat #{selectedBooking.id.substring(2, 8).toUpperCase()}
                </div>
                <h3 className="text-base font-serif text-white mt-1">Détails Logistiques &amp; Finances</h3>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 hover:bg-navy-850 text-stone-500 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sticky Tab Navigation in Drawer */}
            <div className="flex border-b border-navy-850 bg-navy-950/60 px-4 text-xs font-bold text-stone-400">
              <button
                onClick={() => setDrawerTab('info')}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  drawerTab === 'info' ? 'border-gold-500 text-white' : 'border-transparent hover:text-stone-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-gold-500" />
                Fiche &amp; Préparation
              </button>
              
              <button
                onClick={() => setDrawerTab('payments')}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  drawerTab === 'payments' ? 'border-gold-500 text-white' : 'border-transparent hover:text-stone-200'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-emerald-500" />
                Finances ({formatDA(selectedBooking.totalPrice - selectedBooking.depositPaid)})
              </button>

              <button
                onClick={() => setDrawerTab('terms')}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  drawerTab === 'terms' ? 'border-gold-500 text-white' : 'border-transparent hover:text-stone-200'
                }`}
              >
                <FileSignature className="w-3.5 h-3.5 text-blue-400" />
                Signature &amp; CGV
              </button>

              <button
                onClick={() => {
                  setDrawerTab('reminders');
                  setGeneratedText('');
                }}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  drawerTab === 'reminders' ? 'border-gold-500 text-white' : 'border-transparent hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                Rappels IA
              </button>
            </div>

            {/* Scrollable Content inside Drawer */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: GENERAL INFO & HANDOVER PREP CHECKLIST */}
              {drawerTab === 'info' && (
                <div className="space-y-6">
                  
                  {/* Mariée Profil card */}
                  <div className="bg-navy-950 p-4 rounded-xl border border-navy-850 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">La Cliente / Mariée</div>
                        <h4 className="text-base font-serif text-white font-semibold mt-1">{selectedBooking.clientName}</h4>
                        <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> Ville: {selectedBooking.clientCity}</p>
                      </div>
                      
                      <div className="flex gap-1">
                        <a 
                          href={`tel:${selectedBooking.clientPhone}`}
                          className="p-2 bg-navy-900 hover:bg-navy-850 border border-navy-800 text-stone-300 hover:text-white rounded-lg transition-colors"
                          title="Appeler par téléphone"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a 
                          href={formatWhatsAppUrl(selectedBooking.clientPhone, `Bonjour ${selectedBooking.clientName}, Maison Zeyna à votre écoute...`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-emerald-950/40 hover:bg-emerald-900/30 border border-emerald-800/40 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors"
                          title="Lancer conversation WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-navy-850/60 text-xs">
                      <div>
                        <span className="text-stone-500 block font-medium">Téléphone :</span>
                        <span className="font-mono text-stone-200">{selectedBooking.clientPhone}</span>
                      </div>
                      {selectedBooking.weddingDate && (
                        <div>
                          <span className="text-stone-500 block font-medium">Date du Mariage :</span>
                          <span className="text-pink-400 font-bold flex items-center gap-1"><Heart className="w-3 h-3 fill-pink-500/10" /> {selectedBooking.weddingDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item details */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">Pièces Réservées</h4>
                    {(() => {
                      const d = dresses.find(dr => dr.id === selectedBooking.dressId);
                      const j = jewelry.find(jew => jew.id === selectedBooking.jewelryId);
                      
                      return (
                        <div className="space-y-3">
                          {/* Dress */}
                          {d ? (
                            <div className="bg-navy-950 p-3 rounded-xl border border-navy-850 flex items-center gap-4">
                              <img src={d.imageUrl} alt={d.name} className="w-14 h-14 object-cover rounded-lg border border-navy-800 bg-black flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono font-bold bg-gold-500/15 text-gold-400 px-1 py-0.2 rounded border border-gold-500/10">N° {d.number}</span>
                                  <span>{d.name}</span>
                                </div>
                                <p className="text-[11px] text-stone-400 mt-0.5">Catégorie: {d.type} | Taille: {d.size} | {d.color}</p>
                                <p className="text-xs text-gold-400 font-semibold font-mono mt-1">Tarif unique: {formatDA(d.rentalPrice)}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="italic text-stone-500 text-xs">Détails de la robe indisponibles</p>
                          )}

                          {/* Jewelry option */}
                          {selectedBooking.jewelryId && j && (
                            <div className="bg-navy-950 p-3 rounded-xl border border-navy-850 flex items-center gap-4">
                              <div className="w-14 h-14 rounded-lg bg-navy-900 border border-navy-800 flex items-center justify-center text-amber-500 flex-shrink-0 font-serif text-lg font-bold">
                                💎
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-1 py-0.2 rounded">N° {j.number}</span>
                                  <span>{j.name}</span>
                                </div>
                                <p className="text-[11px] text-stone-400 mt-0.5">Accessoire: {j.type} d'Exception</p>
                                <p className="text-xs text-amber-400 font-semibold font-mono mt-1">Tarif accessoire: {formatDA(j.rentalPrice)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* PREP & LOGISTICS CHECKLIST (INTERACTIVE) */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">Checklist Logistique Boutique</h4>
                      <span className="text-[10px] text-stone-500 font-mono">Enregistré localement</span>
                    </div>

                    <div className="bg-navy-950 rounded-xl border border-navy-850 divide-y divide-navy-850/60 p-1">
                      {[
                        { key: 'dry_cleaning', label: 'Nettoyage à sec validé & inspecté ✔' },
                        { key: 'ironing', label: 'Retouches, Défroissage & Repassage faits 👗' },
                        { key: 'accessories', label: 'Pochettes, housse de transport & accessoires regroupés 👜' },
                        { key: 'deposit_received', label: 'Dépôt physique de la caution enregistré 💵' },
                        { key: 'contract_signed', label: 'Signature physique ou numérique du contrat complétée ✍' }
                      ].map((task) => {
                        const isChecked = checklists[selectedBooking.id]?.[task.key] || false;
                        return (
                          <div 
                            key={task.key}
                            onClick={() => handleToggleChecklist(selectedBooking.id, task.key)}
                            className="flex items-center gap-3 p-3 hover:bg-navy-900/50 transition-colors cursor-pointer"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              isChecked 
                                ? 'bg-gold-500 border-gold-400 text-navy-950' 
                                : 'border-stone-700 bg-navy-950'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className={`text-xs ${isChecked ? 'text-stone-300 line-through' : 'text-stone-200 font-medium'}`}>
                              {task.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes space */}
                  {selectedBooking.notes && (
                    <div className="bg-navy-950/40 p-4 rounded-xl border border-navy-850 text-xs text-stone-400 italic">
                      <strong className="text-stone-300 block mb-1 font-bold not-italic">Notes spéciales :</strong>
                      "{selectedBooking.notes}"
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: FINANCES & RECORDING TRANSACTIONS */}
              {drawerTab === 'payments' && (
                <div className="space-y-6">
                  
                  {/* Ledger summary banner */}
                  <div className="bg-gradient-to-br from-navy-950 to-navy-900 p-5 rounded-2xl border border-navy-800 text-center space-y-1.5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Coins className="w-16 h-16 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Solde à recouvrer</span>
                    <div className="text-3xl font-serif font-extrabold text-gold-400 font-mono">
                      {formatDA(selectedBooking.totalPrice - selectedBooking.depositPaid)}
                    </div>
                    <p className="text-xs text-stone-400">
                      Prix Total : {formatDA(selectedBooking.totalPrice)} | Versé : {formatDA(selectedBooking.depositPaid)}
                    </p>
                  </div>

                  {/* Transaction History log */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">Journal des Règlements</h4>
                    <div className="space-y-2">
                      {/* Initial deposit transaction */}
                      <div className="bg-navy-950 p-3 rounded-xl border border-navy-850 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <div>
                            <span className="font-bold text-stone-200">Acompte Initial de réservation</span>
                            <span className="block text-[10px] text-stone-500 font-mono mt-0.5">Enregistré à la création</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-amber-400">+{formatDA(selectedBooking.depositPaid)}</span>
                      </div>

                      {/* Display subtransactions if any in payments array */}
                      {selectedBooking.payments && selectedBooking.payments.map((p, idx) => (
                        <div key={idx} className="bg-navy-950 p-3 rounded-xl border border-navy-850 flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <div>
                              <span className="font-bold text-stone-200">{p.type === 'Solde' ? 'Solde final réglé' : `Transaction: ${p.type}`}</span>
                              <span className="block text-[10px] text-stone-500 font-mono mt-0.5">Date : {p.date}</span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-emerald-400">+{formatDA(p.amount)}</span>
                        </div>
                      ))}

                      {/* Remaining placeholder */}
                      {selectedBooking.totalPrice - selectedBooking.depositPaid > 0 && (
                        <div className="bg-navy-950/30 p-3 rounded-xl border border-dashed border-navy-850/60 flex justify-between items-center text-xs text-stone-500">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-stone-700" />
                            <span>Solde restant à l'enlèvement</span>
                          </div>
                          <span className="font-mono font-bold">{formatDA(selectedBooking.totalPrice - selectedBooking.depositPaid)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Settle Actions */}
                  {selectedBooking.totalPrice - selectedBooking.depositPaid > 0 && onUpdatePaymentStatus && (
                    <div className="bg-navy-950 p-4 rounded-xl border border-navy-850 space-y-3">
                      <div className="flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-stone-400">
                          Solder ce contrat valide l'encaissement de la totalité du montant restant, soit <strong className="text-white font-mono">{formatDA(selectedBooking.totalPrice - selectedBooking.depositPaid)}</strong>. Le contrat passera au statut de paiement "Payé".
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Enregistrer le règlement du solde de ${formatDA(selectedBooking.totalPrice - selectedBooking.depositPaid)} et marquer comme "Payé" complet ?`)) {
                            onUpdatePaymentStatus(selectedBooking.id, 'Payé');
                          }
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Encaisser le solde restant complet
                      </button>
                    </div>
                  )}

                  {/* Printed invoice shortcut */}
                  <div className="p-4 bg-navy-950/20 border border-navy-850 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-stone-400">Besoin d'un reçu papier ou PDF ?</span>
                    <button
                      onClick={() => setActiveReceiptBooking(selectedBooking)}
                      className="px-3 py-1.5 bg-navy-800 hover:bg-navy-750 text-white font-semibold rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" /> Imprimer reçu officiel
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 3: CGV & DIGITAL SIGNATURE */}
              {drawerTab === 'terms' && (
                <div className="space-y-6">
                  
                  {/* Editorial terms and conditions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-gold-400" />
                      Conditions Générales de Location — Maison Zeyna
                    </h4>
                    
                    <div className="bg-navy-950 p-4 rounded-xl border border-navy-850 text-[11px] text-stone-400 space-y-2.5 max-h-60 overflow-y-auto leading-relaxed">
                      <p>
                        <strong className="text-stone-200">1. Durée de location :</strong> Le présent contrat est consenti pour une durée stricte de 3 jours, débutant à la date de départ et s'achevant à la date de retour indiquée. Tout retard fera l'objet d'une pénalité de 2 000 DA par jour supplémentaire entamé.
                      </p>
                      <p>
                        <strong className="text-stone-200">2. Garantie / Caution :</strong> Une caution physique (carte d'identité nationale ou passeport valide + dépôt d'une garantie financière) est exigée avant la sortie des articles. Cette caution est restituée intégralement après vérification de l'absence de détériorations majeures.
                      </p>
                      <p>
                        <strong className="text-stone-200">3. Entretien &amp; Nettoyage :</strong> La Maison Zeyna prend en charge le nettoyage à sec professionnel des robes d'exception. Il est strictement interdit à la cliente de tenter de laver, repasser ou modifier la robe par elle-même.
                      </p>
                      <p>
                        <strong className="text-stone-200">4. Dommages &amp; Détériorations :</strong> En cas de brûlures, déchirures irréparables, ou taches indélébiles, la caution sera conservée et des frais de compensation à hauteur de la valeur à neuf de la robe seront réclamés.
                      </p>
                    </div>
                  </div>

                  {/* Interactive digital signature block */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider">Fiche de Signature du Contrat</h4>
                    
                    {signatures[selectedBooking.id]?.signed ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-xl text-center space-y-2">
                        <div className="inline-flex items-center justify-center p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                          <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                        <h5 className="font-bold text-white text-xs uppercase tracking-wider">Signature Enregistrée ✔</h5>
                        <p className="text-[11px] text-stone-400">
                          Le contrat a été signé numériquement par la mariée <strong className="text-stone-200">{signatures[selectedBooking.id].name}</strong>.
                        </p>
                        <p className="text-[10px] text-stone-500 font-mono">Date d'approbation : {signatures[selectedBooking.id].date}</p>
                      </div>
                    ) : (
                      <div className="bg-navy-950 border border-navy-850 rounded-xl p-5 space-y-4">
                        <div className="border border-navy-800 rounded-lg p-6 bg-navy-900/60 h-28 flex flex-col items-center justify-center text-center text-stone-500 relative select-none">
                          <span className="font-serif italic text-stone-600 font-bold opacity-30 select-none text-xl">Signer ici</span>
                          <span className="text-[10px] text-stone-600 block mt-1 select-none">(Simulateur de pad tactile)</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSignContract(selectedBooking.id, selectedBooking.clientName)}
                            className="flex-1 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
                          >
                            <FileSignature className="w-3.5 h-3.5" /> Enregistrer la signature de la mariée
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 4: IA WHATSAPP GENERATION */}
              {drawerTab === 'reminders' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    
                    {/* Reminder template selectors */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gold-400 uppercase tracking-wider">Template de Rappel IA</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => { setReminderType('confirmation'); setGeneratedText(''); }}
                          className={`px-3 py-2 rounded-lg font-bold border transition-all text-left ${
                            reminderType === 'confirmation'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/30 font-bold'
                              : 'bg-navy-950 text-stone-400 border-navy-850 hover:bg-navy-850'
                          }`}
                        >
                          ✍ Confirmation de réservation
                        </button>
                        <button
                          onClick={() => { setReminderType('retour'); setGeneratedText(''); }}
                          className={`px-3 py-2 rounded-lg font-bold border transition-all text-left ${
                            reminderType === 'retour'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/30 font-bold'
                              : 'bg-navy-950 text-stone-400 border-navy-850 hover:bg-navy-850'
                          }`}
                        >
                          ⏳ Rappel de retour de robe
                        </button>
                        <button
                          onClick={() => { setReminderType('essayage'); setGeneratedText(''); }}
                          className={`px-3 py-2 rounded-lg font-bold border transition-all text-left ${
                            reminderType === 'essayage'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/30 font-bold'
                              : 'bg-navy-950 text-stone-400 border-navy-850 hover:bg-navy-850'
                          }`}
                        >
                          👗 Invitation aux essayages
                        </button>
                        <button
                          onClick={() => { setReminderType('caution'); setGeneratedText(''); }}
                          className={`px-3 py-2 rounded-lg font-bold border transition-all text-left ${
                            reminderType === 'caution'
                              ? 'bg-gold-500/10 text-gold-400 border-gold-500/30 font-bold'
                              : 'bg-navy-950 text-stone-400 border-navy-850 hover:bg-navy-850'
                          }`}
                        >
                          💵 Restitution de caution
                        </button>
                      </div>
                    </div>

                    {/* Trigger Generation button */}
                    {!generatedText && (
                      <button
                        onClick={async () => {
                          setIsGeneratingReminder(true);
                          try {
                            const d = dresses.find(dr => dr.id === selectedBooking.dressId);
                            const response = await fetch('/api/generate-reminder', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                client: {
                                  nom: selectedBooking.clientName,
                                  ville: selectedBooking.clientCity,
                                  robe: d ? `${d.name} (N° ${d.number})` : 'Robe Maison Zeyna',
                                  note: selectedBooking.notes || 'Événement d\'exception',
                                  dateDebut: selectedBooking.startDate,
                                  dateFin: selectedBooking.endDate,
                                  resteAPayer: selectedBooking.totalPrice - selectedBooking.depositPaid
                                },
                                typeRappel: reminderType
                              })
                            });

                            if (!response.ok) {
                              const err = await response.json();
                              throw new Error(err.error || 'Erreur lors de la génération');
                            }

                            const res = await response.json();
                            setGeneratedText(res.text);
                          } catch (e: any) {
                            console.error(e);
                            alert(`Erreur d'IA : ${e.message}`);
                          } finally {
                            setIsGeneratingReminder(false);
                          }
                        }}
                        disabled={isGeneratingReminder}
                        className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        {isGeneratingReminder ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Génération par l'IA de la Maison Zeyna...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Générer le message d'exception ✨
                          </>
                        )}
                      </button>
                    )}

                    {/* Result area */}
                    {generatedText && (
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-gold-400 uppercase tracking-wider">Message personnalisé (Modifiable)</label>
                        <textarea
                          value={generatedText}
                          onChange={(e) => setGeneratedText(e.target.value)}
                          rows={8}
                          className="w-full bg-navy-950 text-xs text-stone-200 border border-navy-850 rounded-lg p-3 focus:outline-none focus:border-gold-500 font-sans resize-none leading-relaxed"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(generatedText);
                              alert('Message copié dans le presse-papiers ! 📋');
                            }}
                            className="py-2.5 bg-navy-950 hover:bg-navy-850 border border-navy-800 text-white font-bold text-xs rounded-lg transition-all"
                          >
                            Copier le message 📋
                          </button>
                          <a
                            href={formatWhatsAppUrl(selectedBooking.clientPhone, generatedText)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg text-center flex items-center justify-center gap-1.5 transition-all shadow-sm"
                          >
                            WhatsApp Web 💬
                          </a>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

            </div>

            {/* Sticky Actions Footer of Drawer */}
            <div className="p-4 border-t border-navy-850 bg-navy-950 flex items-center justify-between">
              <span className="text-[10px] text-stone-500 font-mono">
                Statut actuel: {selectedBooking.status}
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onEditBooking(selectedBooking)}
                  className="px-4 py-2 border border-navy-800 hover:bg-navy-850 rounded-lg text-xs font-semibold text-stone-300 transition-colors"
                >
                  Modifier contrat
                </button>
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                  }}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs rounded-lg transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* LUXURIOUS PHYSICAL PRINT/RECEIPT MODAL */}
      {activeReceiptBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in print-overlay">
          <div className="bg-navy-900 rounded-2xl border border-navy-800 shadow-2xl w-full max-w-lg p-6 space-y-6 text-stone-200 print-receipt-modal">
            
            <div className="flex justify-between items-start border-b border-navy-800 pb-4">
              <div>
                <h4 className="font-serif italic text-gold-500 text-xl tracking-wide print:text-stone-950">Maison Zeyna</h4>
                <p className="text-xs text-stone-400 print:text-stone-600">Location de Robes Traditionnelles d'Exception</p>
                <p className="text-[10px] text-stone-500 font-mono print:text-stone-500">Alger, Algérie | Tél : +213 (0) 550 00 00 00</p>
              </div>
              <button
                onClick={() => setActiveReceiptBooking(null)}
                className="p-1.5 hover:bg-navy-850 text-stone-500 hover:text-white rounded-lg print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="space-y-5 text-xs text-stone-300 print:text-stone-850">
              
              <div className="flex justify-between text-[11px] font-mono border-b border-navy-850 pb-2 print:border-stone-200 print:text-stone-800">
                <span>Réf Contrat : #{activeReceiptBooking.id.toUpperCase()}</span>
                <span>Date d'édition : {new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' })}</span>
              </div>

              {/* Client detail */}
              <div className="space-y-1">
                <h5 className="font-bold text-gold-500 text-[10px] uppercase tracking-wider print:text-stone-900">La Cliente :</h5>
                <p className="font-semibold text-white text-sm print:text-stone-950">{activeReceiptBooking.clientName}</p>
                <p className="font-mono text-stone-400 print:text-stone-600">Tél : {activeReceiptBooking.clientPhone}</p>
                <p className="text-stone-400 font-medium print:text-stone-600">Ville : {activeReceiptBooking.clientCity}</p>
              </div>

              {/* Dress detail */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-gold-500 text-[10px] uppercase tracking-wider print:text-stone-900">Tenue d'Exception Réservée :</h5>
                {(() => {
                  const d = dresses.find(dr => dr.id === activeReceiptBooking.dressId);
                  return d ? (
                    <div className="bg-navy-950 p-3 rounded-lg border border-navy-800/80 flex justify-between items-center print:bg-stone-50 print:border-stone-300 print:text-stone-900">
                      <div>
                        <p className="font-bold text-stone-200 flex items-center gap-1.5 print:text-stone-950">
                          <span className="text-[10px] font-mono bg-gold-500/10 text-gold-400 border border-gold-500/20 px-1 rounded print:bg-stone-200 print:border-stone-400 print:text-stone-850">N° {d.number}</span>
                          <span>{d.name}</span>
                        </p>
                        <p className="text-[10px] text-stone-400 print:text-stone-550 mt-1">Modèle: {d.type} | Taille : {d.size} | {d.color}</p>
                      </div>
                      <div className="font-mono font-bold text-gold-500 print:text-stone-900">{formatDA(d.rentalPrice)}</div>
                    </div>
                  ) : (
                    <p className="italic text-stone-500">Détails de la robe indisponibles</p>
                  );
                })()}
              </div>

              {/* Jewelry detail if any */}
              {activeReceiptBooking.jewelryId && (
                <div className="space-y-1.5">
                  <h5 className="font-bold text-gold-500 text-[10px] uppercase tracking-wider print:text-stone-900">Bijou ou Parure Associée :</h5>
                  {(() => {
                    const j = jewelry?.find(jew => jew.id === activeReceiptBooking.jewelryId);
                    return j ? (
                      <div className="bg-navy-950 p-3 rounded-lg border border-navy-800/80 flex justify-between items-center print:bg-stone-50 print:border-stone-300 print:text-stone-900">
                        <div>
                          <p className="font-bold text-stone-200 flex items-center gap-1.5 print:text-stone-950">
                            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 rounded print:bg-stone-200 print:border-stone-400 print:text-amber-850">N° {j.number}</span>
                            <span>{j.name}</span>
                          </p>
                          <p className="text-[10px] text-stone-400 print:text-stone-550 mt-1">Type : {j.type} | Ornement d'Exception</p>
                        </div>
                        <div className="font-mono font-bold text-amber-500 print:text-stone-900">{formatDA(j.rentalPrice)}</div>
                      </div>
                    ) : (
                      <p className="italic text-stone-500">Détails du bijou indisponibles</p>
                    );
                  })()}
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-navy-950 p-3 rounded-lg border border-navy-800/80 print:bg-stone-50 print:border-stone-300 print:text-stone-900">
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-500 print:text-stone-600 block">Date Sortie</span>
                  <p className="font-bold font-mono text-stone-200 mt-0.5 print:text-stone-950">{activeReceiptBooking.startDate}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-500 print:text-stone-600 block">Date Retour</span>
                  <p className="font-bold font-mono text-stone-200 mt-0.5 print:text-stone-950">{activeReceiptBooking.endDate}</p>
                </div>
                {activeReceiptBooking.weddingDate && (
                  <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-navy-850 pl-0 md:pl-4 pt-2 md:pt-0 print:border-stone-300">
                    <span className="text-[9px] uppercase font-bold text-amber-500 print:text-stone-600 block">Mariage / Événement</span>
                    <p className="font-bold font-mono text-amber-400 mt-0.5 print:text-stone-950">{activeReceiptBooking.weddingDate}</p>
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <div className="border-t border-navy-800 pt-3.5 space-y-1.5 print:border-stone-300">
                <div className="flex justify-between">
                  <span className="text-stone-400 print:text-stone-600">Frais de location :</span>
                  <span className="font-mono font-bold text-stone-200 print:text-stone-900">{formatDA(activeReceiptBooking.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 print:text-stone-600">Acompte versé :</span>
                  <span className="font-mono font-bold text-gold-400 print:text-stone-900">{formatDA(activeReceiptBooking.depositPaid)}</span>
                </div>
                {(() => {
                  const d = dresses.find(dr => dr.id === activeReceiptBooking.dressId);
                  return d && (
                    <div className="flex justify-between text-stone-500 print:text-stone-600">
                      <span>Caution physique (Chèque ou Espèce) exigée :</span>
                      <span className="font-mono font-medium">{formatDA(d.deposit)}</span>
                    </div>
                  );
                })()}
                
                <div className="flex justify-between text-base font-bold text-white pt-2.5 border-t border-navy-850 print:border-stone-300 print:text-stone-950">
                  <span>Solde Restant à Payer :</span>
                  <span className="font-mono text-gold-400 print:text-stone-950 font-extrabold text-base">
                    {formatDA(activeReceiptBooking.totalPrice - activeReceiptBooking.depositPaid)}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-8 text-[10px] text-stone-500 text-center print:text-stone-850">
                <div className="border-t border-navy-800 pt-2 print:border-stone-400">
                  <span className="block font-bold">Cachet &amp; Signature</span>
                  <span className="text-[9px] italic text-stone-600 mt-4 block">Maison Zeyna Alger</span>
                </div>
                <div className="border-t border-navy-800 pt-2 print:border-stone-400">
                  <span className="block font-bold">Signature Cliente</span>
                  <span className="text-[9px] italic text-stone-600 mt-4 block">Bon pour accord</span>
                </div>
              </div>

            </div>

            {/* Receipt Modal Footer buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-navy-850 print:hidden">
              <button
                onClick={() => setActiveReceiptBooking(null)}
                className="px-4 py-2 border border-navy-850 hover:bg-navy-850 rounded-lg text-xs font-semibold text-stone-300 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-lg text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimer le reçu officiel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
