/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Client, Booking, Dress } from '../types';
import { Search, Plus, User, Phone, MapPin, Copy, ExternalLink, Calendar, Heart, MessageSquare, Edit3, Trash2, X, Sparkles } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  bookings: Booking[];
  dresses: Dress[];
  onAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export default function ClientList({ clients, bookings, dresses, onAddClient, onUpdateClient, onDeleteClient }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Alger');
  const [notes, setNotes] = useState('');
  const [weddingDate, setWeddingDate] = useState('');

  // Editing state
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('Alger');
  const [editNotes, setEditNotes] = useState('');
  const [editWeddingDate, setEditWeddingDate] = useState('');
  
  // Message template simulation state
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  const validateClient = (clientName: string, clientPhone: string, skipId?: string) => {
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Veuillez remplir le nom et le téléphone.');
      return false;
    }

    // Phone format check: numbers, spaces, plus, dashes, length 9-15.
    const phoneRegex = /^[0-9+\s-]{9,15}$/;
    if (!phoneRegex.test(clientPhone.trim())) {
      alert('Veuillez saisir un numéro de téléphone valide (uniquement chiffres, espaces, tirets ou +, de 9 à 15 caractères).');
      return false;
    }

    // Check duplicates by phone
    const normalizedNewPhone = clientPhone.trim().replace(/[\s-]/g, '');
    const isDuplicate = clients.some(c => 
      c.phone.trim().replace(/[\s-]/g, '') === normalizedNewPhone && 
      (!skipId || c.id !== skipId)
    );
    if (isDuplicate) {
      alert(`Une cliente avec le numéro de téléphone "${clientPhone}" existe déjà dans le répertoire.`);
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClient(name, phone)) {
      return;
    }
    onAddClient({
      name: name.trim(),
      phone: phone.trim(),
      city,
      notes: notes.trim() || undefined,
      weddingDate: weddingDate || undefined
    });
    setName('');
    setPhone('');
    setCity('Alger');
    setNotes('');
    setWeddingDate('');
    setIsAdding(false);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setEditName(client.name);
    setEditPhone(client.phone);
    setEditCity(client.city);
    setEditNotes(client.notes || '');
    setEditWeddingDate(client.weddingDate || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    if (!validateClient(editName, editPhone, editingClient.id)) {
      return;
    }

    onUpdateClient({
      ...editingClient,
      name: editName.trim(),
      phone: editPhone.trim(),
      city: editCity,
      notes: editNotes.trim() || undefined,
      weddingDate: editWeddingDate || undefined
    });

    setEditingClient(null);
  };

  // Filtered client list
  const filteredClients = clients.filter(c => {
    const search = (searchTerm || '').toLowerCase();
    const nameMatch = c.name ? c.name.toLowerCase().includes(search) : false;
    const phoneMatch = c.phone ? c.phone.includes(searchTerm) : false;
    const cityMatch = c.city ? c.city.toLowerCase().includes(search) : false;
    return nameMatch || phoneMatch || cityMatch;
  });

  // Helper to calculate statistics per client
  const getClientStats = (clientPhone: string) => {
    const clientBookings = bookings.filter(b => b.clientPhone === clientPhone && b.status !== 'Annulé');
    const totalSpent = clientBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    return {
      bookingCount: clientBookings.length,
      totalSpent,
      lastBooking: clientBookings[0] // list is usually cron-ordered
    };
  };

  const formatDA = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 })
      .format(amount)
      .replace('DZD', 'DA');
  };

  // Generate WhatsApp confirmation template
  const copyTemplate = (client: Client, templateType: 'confirm' | 'return') => {
    const stats = getClientStats(client.phone);
    const lastBooking = bookings.find(b => b.clientPhone === client.phone && b.status !== 'Annulé');
    const dress = lastBooking ? dresses.find(d => d.id === lastBooking.dressId) : null;
    
    let text = '';
    if (templateType === 'confirm') {
      text = `Bonjour ${client.name}, Maison Zeyna vous informe que votre réservation de la robe "${dress?.name || 'robe choisie'}" pour la période du ${lastBooking?.startDate || 'prévue'} au ${lastBooking?.endDate || 'prévue'} est bien confirmée. L'acompte a été enregistré. Un essayage est prévu le ${lastBooking?.fittingDate || 'à convenir'}. Merci de votre confiance ! ✨`;
    } else {
      text = `Bonjour ${client.name}, nous vous rappelons que le retour de la robe "${dress?.name || 'robe louée'}" est prévu pour le ${lastBooking?.endDate || 'bientôt'}. Merci de nous la ramener propre à la boutique comme convenu. Excellente journée ! Maison Zeyna 🌸`;
    }

    navigator.clipboard.writeText(text);
    setCopiedTemplateId(`${client.id}-${templateType}`);
    setTimeout(() => setCopiedTemplateId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top action block */}
      <div className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom de cliente, wilaya, téléphone..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-850 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-950 text-gold-400 border border-gold-500/20 font-semibold text-sm rounded-lg transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? 'Fermer le formulaire' : 'Nouvelle Fiche Cliente'}
          </button>
        </div>

        {/* Inline client creation form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Créer une fiche cliente</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Nom Complet *</label>
                    <input
                      type="text"
                      required
                      placeholder="Yasmine Benchaoui"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Téléphone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0550123456"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Wilaya *</label>
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      {['Alger', 'Oran', 'Constantine', 'Tizi Ouzou', 'Béjaïa', 'Blida', 'Sétif', 'Tlemcen', 'Annaba'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Date du Mariage (Optionnelle)</label>
                    <input
                      type="date"
                      value={weddingDate}
                      onChange={e => setWeddingDate(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                    />
                  </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Notes ou Préférences de style</label>
              <textarea
                placeholder="Ex: Préfère le vert émeraude, porte de la taille 38, réservations régulières..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3.5 py-1.5 border border-stone-200 hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-navy-900 hover:bg-navy-950 text-gold-400 border border-gold-500/20 rounded-lg text-xs font-semibold shadow-sm"
              >
                Créer la Fiche
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Clients Listing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const stats = getClientStats(client.phone);
          const hasLastBooking = bookings.some(b => b.clientPhone === client.phone && b.status !== 'Annulé');

          return (
            <div
              key={client.id}
              className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header Profile Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-50 text-navy-800 flex items-center justify-center font-bold text-sm border border-navy-100">
                      {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 leading-tight">{client.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-stone-400 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>Wilaya : {client.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="bg-gold-100/50 text-gold-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gold-200/60">
                      {stats.bookingCount} Locations
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(client)}
                        className="p-1 text-stone-400 hover:text-gold-600 hover:bg-stone-100 rounded transition-colors"
                        title="Modifier la fiche cliente"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteClient(client.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Supprimer la fiche cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contacts & Notes */}
                <div className="mt-4 space-y-2 text-xs text-stone-600 bg-stone-50/50 p-3 rounded-lg border border-stone-150">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <a href={`tel:${client.phone}`} className="font-mono text-navy-700 hover:underline font-semibold">
                      {client.phone}
                    </a>
                  </div>

                  {client.weddingDate && (
                    <div className="flex items-center gap-2 text-amber-800 bg-amber-50/80 border border-amber-200/50 px-2 py-1 rounded font-semibold text-[11px] font-mono">
                      <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
                      <span>Mariage : {client.weddingDate}</span>
                    </div>
                  )}
                  
                  {client.notes && (
                    <p className="text-stone-500 italic border-t border-stone-100 pt-1.5 mt-1.5">
                      " {client.notes} "
                    </p>
                  )}
                </div>
              </div>

              {/* Loyalty Statistics and Templates Generator */}
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400">Total dépensé :</span>
                  <strong className="text-stone-800 font-mono font-bold text-sm">
                    {formatDA(stats.totalSpent)}
                  </strong>
                </div>

                {hasLastBooking && (
                  <div className="bg-gold-50/40 border border-gold-100/50 p-2.5 rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-gold-800 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-gold-600" />
                      Générer des rappels cliente :
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => copyTemplate(client, 'confirm')}
                        className={`text-[10px] py-1 px-2 rounded font-medium border text-center transition-all ${
                          copiedTemplateId === `${client.id}-confirm`
                            ? 'bg-navy-900 text-gold-400 border-gold-500/30'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {copiedTemplateId === `${client.id}-confirm` ? 'Copié ✓' : 'Contrat Confirmé'}
                      </button>
                      <button
                        onClick={() => copyTemplate(client, 'return')}
                        className={`text-[10px] py-1 px-2 rounded font-medium border text-center transition-all ${
                          copiedTemplateId === `${client.id}-return`
                            ? 'bg-navy-900 text-gold-400 border-gold-500/30'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {copiedTemplateId === `${client.id}-return` ? 'Copié ✓' : 'Rappel de Retour'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-16 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl bg-stone-50">
            <User className="w-12 h-12 text-stone-200 mx-auto mb-2 animate-pulse" />
            <p className="font-semibold text-stone-600">Aucun résultat</p>
            <p className="text-xs text-stone-400 mt-1">Ajoutez une nouvelle fiche cliente pour commencer.</p>
          </div>
        )}
      </div>

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xl w-full max-w-lg overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-stone-100 bg-stone-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-600" />
                <h3 className="font-bold text-stone-800 text-lg">
                  Modifier la fiche cliente
                </h3>
              </div>
              <button
                onClick={() => setEditingClient(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Nom Complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Yasmine Benchaoui"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Téléphone *</label>
                <input
                  type="tel"
                  required
                  placeholder="0550123456"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Wilaya *</label>
                <select
                  value={editCity}
                  onChange={e => setEditCity(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                >
                  {['Alger', 'Oran', 'Constantine', 'Tizi Ouzou', 'Béjaïa', 'Blida', 'Sétif', 'Tlemcen', 'Annaba'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Date du Mariage / Événement</label>
                <input
                  type="date"
                  value={editWeddingDate}
                  onChange={e => setEditWeddingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Notes ou Préférences de style</label>
                <textarea
                  placeholder="Notes..."
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                ></textarea>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-lg font-medium text-stone-700 text-sm transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-900 hover:bg-navy-950 text-gold-400 border border-gold-500/20 font-medium text-sm rounded-lg transition-all shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
