/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Booking, Dress, PaymentStatus, BookingStatus, Jewelry } from '../types';
import { X, Calendar, User, Phone, MapPin, CreditCard, ShieldAlert, CheckCircle, HelpCircle, Sparkles } from 'lucide-react';

interface BookingFormProps {
  dresses: Dress[];
  bookings: Booking[];
  editingBooking: Booking | null;
  onClose: () => void;
  onSubmit: (booking: Omit<Booking, 'id'> & { id?: string }) => void;
  jewelry?: Jewelry[];
}

const ALGERIAN_CITIES = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif', 
  'Chlef', 'Sidi Bel Abbès', 'Biskra', 'Tlemcen', 'Béjaïa', 'Tizi Ouzou', 
  'Ghardaïa', 'Skikda', 'Mostaganem', 'M\'Sila', 'Tébessa', 'El Oued'
];

export default function BookingForm({ dresses, bookings, editingBooking, onClose, onSubmit, jewelry }: BookingFormProps) {
  // Form state
  const [dressId, setDressId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCity, setClientCity] = useState('Alger');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fittingDate, setFittingDate] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [jewelryId, setJewelryId] = useState('');
  const [totalPrice, setTotalPrice] = useState<number>(10000);
  const [depositPaid, setDepositPaid] = useState<number>(5000);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Acompte Versé');
  const [status, setStatus] = useState<BookingStatus>('Confirmé');
  const [notes, setNotes] = useState('');

  // Conflict state
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Initialize form fields when editing booking or changing selected dress
  useEffect(() => {
    if (editingBooking) {
      setDressId(editingBooking.dressId);
      setClientName(editingBooking.clientName);
      setClientPhone(editingBooking.clientPhone);
      setClientCity(editingBooking.clientCity);
      setStartDate(editingBooking.startDate);
      setEndDate(editingBooking.endDate);
      setFittingDate(editingBooking.fittingDate || '');
      setWeddingDate(editingBooking.weddingDate || '');
      setJewelryId(editingBooking.jewelryId || '');
      setTotalPrice(editingBooking.totalPrice);
      setDepositPaid(editingBooking.depositPaid);
      setPaymentStatus(editingBooking.paymentStatus);
      setStatus(editingBooking.status);
      setNotes(editingBooking.notes || '');
    } else {
      // Default dates to around July 2026 for demonstration
      setStartDate('2026-07-10');
      setEndDate('2026-07-13');
      setFittingDate('');
      setWeddingDate('');
      setJewelryId('');
      
      // Auto-select first dress if available
      if (dresses.length > 0) {
        const available = dresses.find(d => d.status === 'Disponible') || dresses[0];
        setDressId(available.id);
        setTotalPrice(available.rentalPrice);
        setDepositPaid(available.deposit);
      }
    }
  }, [editingBooking, dresses]);

  // When selected dress changes, update default price and deposit (only if not editing)
  const handleDressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setDressId(id);
    if (!editingBooking) {
      const dress = dresses.find(d => d.id === id);
      if (dress) {
        // If jewelry is already selected, sum their default prices
        const selectedJewelPrice = jewelryId ? (jewelry?.find(j => j.id === jewelryId)?.rentalPrice || 0) : 0;
        const selectedJewelDeposit = jewelryId ? (jewelry?.find(j => j.id === jewelryId)?.deposit || 0) : 0;
        setTotalPrice(dress.rentalPrice + selectedJewelPrice);
        setDepositPaid(dress.deposit + selectedJewelDeposit);
      }
    }
  };

  const handleJewelryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setJewelryId(id);
    if (!editingBooking) {
      const dress = dresses.find(d => d.id === dressId);
      const jewel = jewelry?.find(j => j.id === id);
      const dressPrice = dress ? dress.rentalPrice : 0;
      const dressDeposit = dress ? dress.deposit : 0;
      const jewelPrice = jewel ? jewel.rentalPrice : 0;
      const jewelDeposit = jewel ? jewel.deposit : 0;
      setTotalPrice(dressPrice + jewelPrice);
      setDepositPaid(dressDeposit + jewelDeposit);
    }
  };

  // Check for scheduling conflicts (double-bookings)
  useEffect(() => {
    if (!dressId || !startDate || !endDate) {
      setConflictWarning(null);
      return;
    }

    // Filter out the current booking if we are editing
    const otherBookings = bookings.filter(b => b.id !== editingBooking?.id && b.dressId === dressId && b.status !== 'Annulé');

    // Check for overlap: (StartA <= EndB) and (EndA >= StartB)
    const conflict = otherBookings.find(b => {
      return startDate <= b.endDate && endDate >= b.startDate;
    });

    if (conflict) {
      const dress = dresses.find(d => d.id === dressId);
      setConflictWarning(
        `⚠️ Attention : La robe "${dress?.name}" est déjà réservée par "${conflict.clientName}" du ${conflict.startDate} au ${conflict.endDate}.`
      );
    } else {
      setConflictWarning(null);
    }
  }, [dressId, startDate, endDate, bookings, editingBooking, dresses]);

  // Auto-calculate payment status based on total price and deposit
  useEffect(() => {
    const total = Number(totalPrice) || 0;
    const deposit = Number(depositPaid) || 0;
    if (total > 0 && deposit >= total) {
      setPaymentStatus('Payé');
    } else if (deposit === 0) {
      setPaymentStatus('Non Payé');
    } else {
      setPaymentStatus('Acompte Versé');
    }
  }, [totalPrice, depositPaid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim() || !dressId || !startDate || !endDate) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Phone format check
    const phoneRegex = /^[0-9+\s-]{9,15}$/;
    if (!phoneRegex.test(clientPhone.trim())) {
      alert('Veuillez saisir un numéro de téléphone valide pour la cliente (uniquement chiffres, espaces, tirets ou +, de 9 à 15 caractères).');
      return;
    }

    if (startDate > endDate) {
      alert('La date de départ de location (récupération) doit être antérieure ou égale à la date de fin.');
      return;
    }

    if (fittingDate && fittingDate > startDate) {
      alert("La date d'essayage ne peut pas être postérieure à la date de départ (récupération).");
      return;
    }

    if (Number(depositPaid) > Number(totalPrice)) {
      alert("Le montant versé (acompte) ne peut pas dépasser le montant total de la location.");
      return;
    }

    // 1. Logique temporelle et statuts (Maison Zeyna rules)
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

    if (status === 'Récupéré' && today < startDate) {
      alert(`Impossible d'enregistrer : le statut ne peut pas être 'Récupéré' car la date actuelle (${today}) est antérieure à la date de début de location (${startDate}).`);
      return;
    }

    if (status === 'Retourné' && today < endDate) {
      alert(`Impossible d'enregistrer : le statut ne peut pas être 'Retourné' car la date actuelle (${today}) est antérieure à la date de fin de location (${endDate}).`);
      return;
    }

    const bookingData = {
      dressId,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientCity,
      startDate,
      endDate,
      fittingDate: fittingDate || undefined,
      weddingDate: weddingDate || undefined,
      jewelryId: jewelryId || undefined,
      totalPrice: Number(totalPrice),
      depositPaid: Number(depositPaid),
      paymentStatus,
      status,
      notes: notes.trim() || undefined
    };

    onSubmit(editingBooking ? { ...bookingData, id: editingBooking.id } : bookingData);
  };

  const selectedDress = dresses.find(d => d.id === dressId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-stone-100 bg-stone-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gold-600" />
            <h3 className="font-bold text-stone-800 text-lg">
              {editingBooking ? 'Modifier le contrat de réservation' : 'Établir un nouveau contrat de location'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Dress & Jewelry Selection */}
          <div className="bg-gold-50/40 p-4 border border-gold-100/50 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-gold-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-gold-600" />
              1. Sélection de la Robe & Bijoux d'Exception
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Choisir la tenue disponible *</label>
                <select
                  value={dressId}
                  onChange={handleDressChange}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white font-medium"
                >
                  <option value="" disabled>-- Sélectionner une robe --</option>
                  {dresses.map(d => (
                    <option key={d.id} value={d.id}>
                      [N° {d.number}] {d.name} (T{d.size}) - {d.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Associer une parure ou bijou (Optionnel)</label>
                <select
                  value={jewelryId}
                  onChange={handleJewelryChange}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white font-medium"
                >
                  <option value="">-- Aucun bijou associé --</option>
                  {jewelry?.map(j => (
                    <option key={j.id} value={j.id}>
                      [N° {j.number}] {j.name} ({j.type}) - {j.status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Previews Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {selectedDress && (
                <div className="bg-white border border-stone-200 p-2.5 rounded-lg flex gap-3 items-center shadow-xs">
                  <img
                    src={selectedDress.imageUrl}
                    alt={selectedDress.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-800 truncate">{selectedDress.name}</p>
                    <p className="text-[10px] text-gold-600 font-bold font-mono">N° {selectedDress.number} • Taille {selectedDress.size}</p>
                  </div>
                </div>
              )}

              {jewelryId && jewelry && (
                (() => {
                  const selectedJewel = jewelry.find(j => j.id === jewelryId);
                  return selectedJewel ? (
                    <div className="bg-white border border-stone-200 p-2.5 rounded-lg flex gap-3 items-center shadow-xs">
                      <img
                        src={selectedJewel.imageUrl}
                        alt={selectedJewel.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-800 truncate">{selectedJewel.name}</p>
                        <p className="text-[10px] text-amber-600 font-bold font-mono">N° {selectedJewel.number} • {selectedJewel.type}</p>
                      </div>
                    </div>
                  ) : null;
                })()
              )}
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-stone-50/50 p-4 border border-stone-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-stone-500" />
              2. Informations Cliente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Nom et Prénom de la cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Yasmine Benchaoui"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">N° de Téléphone *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400 text-xs font-mono">
                    DZ
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 0550123456"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Wilaya / Ville *</label>
                <select
                  value={clientCity}
                  onChange={e => setClientCity(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                >
                  {ALGERIAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-stone-50/50 p-4 border border-stone-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-stone-500" />
              3. Dates du Contrat
            </h4>
            
            {conflictWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 items-start text-xs text-amber-800 font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>{conflictWarning}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Date de départ (Récupération) *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Date de retour prévue *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Date d'essayage (Optionnelle)</label>
                <input
                  type="date"
                  value={fittingDate}
                  onChange={e => setFittingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Date de l'événement (Mariage) *</label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={e => setWeddingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gold-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-amber-50/30 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Finances and Status */}
          <div className="bg-stone-50/50 p-4 border border-stone-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-stone-500" />
              4. Modalités Financières & Suivi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Prix de Location (DA) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={totalPrice}
                  onChange={e => setTotalPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Acompte Versé (DA) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={depositPaid}
                  onChange={e => setDepositPaid(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-stone-600">Statut Paiement *</label>
                  <span className="text-[9px] font-bold text-gold-700 bg-gold-100/50 px-1 py-0.2 rounded">Auto</span>
                </div>
                <select
                  value={paymentStatus}
                  disabled
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-500 bg-stone-100 cursor-not-allowed"
                >
                  <option value="Acompte Versé">Acompte Versé (Partiel)</option>
                  <option value="Payé">Totalement Payé</option>
                  <option value="Non Payé">Non Payé (À régler)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Statut Réservation *</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as BookingStatus)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                >
                  <option value="Confirmé">Confirmé (Réservé)</option>
                  <option value="Récupéré">Robe Récupérée</option>
                  <option value="Retourné">Robe Rendue</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>
            </div>

            {/* Live Remaining Balance Calculation */}
            <div className="flex justify-between items-center bg-gold-500/10 border border-gold-500/20 p-2.5 rounded-lg text-xs">
              <span className="text-navy-900 font-bold flex items-center gap-1">
                💰 Reste à payer calculé :
              </span>
              <strong className="text-navy-950 font-bold font-mono text-sm bg-white/80 border border-gold-500/20 px-2.5 py-0.5 rounded shadow-xs">
                {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(totalPrice - depositPaid).replace('DZD', 'DA')}
              </strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Notes, ajustements couture, accessoires inclus...</label>
            <textarea
              placeholder="Ex: Prévoir ourlet de 2cm, ceinturon or fourni, pochette assortie incluse..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
            ></textarea>
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-lg font-medium text-stone-700 text-sm transition-colors"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-900 hover:bg-navy-950 text-gold-400 border border-gold-500/20 font-medium text-sm rounded-lg transition-all shadow-sm"
            >
              {editingBooking ? 'Enregistrer les modifications' : 'Créer la réservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
