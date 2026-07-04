/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Dress, DressType, DressStatus } from '../types';
import { Search, Plus, Filter, Edit3, Trash2, Tag, Layers, CheckCircle, Clock, RotateCcw, X, Sparkles } from 'lucide-react';

interface DressCatalogProps {
  dresses: Dress[];
  onAddDress: (dress: Omit<Dress, 'id'>) => void;
  onUpdateDress: (dress: Dress) => void;
  onDeleteDress: (id: string) => void;
}

const PRESET_IMAGES = [
  { name: 'Velours Karakou Rouge/Or', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80' },
  { name: 'Satin Caftan Vert/Or', url: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=800&auto=format&fit=crop&q=80' },
  { name: 'Chedda de Tlemcen Royale', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80' },
  { name: 'Lace Blousa Turquoise', url: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&auto=format&fit=crop&q=80' },
  { name: 'Broderie Karakou Noir/Argent', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80' },
  { name: 'Robe Blanche Dentelle Princesse', url: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=800&auto=format&fit=crop&q=80' },
  { name: 'Robe Kabyle Traditionnelle', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80' }
];

export default function DressCatalog({ dresses, onAddDress, onUpdateDress, onDeleteDress }: DressCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDress, setEditingDress] = useState<Dress | null>(null);

  // Form states
  const [dressNumber, setDressNumber] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<DressType>('Caftan');
  const [size, setSize] = useState('38');
  const [color, setColor] = useState('');
  const [rentalPrice, setRentalPrice] = useState(10000);
  const [deposit, setDeposit] = useState(5000);
  const [status, setStatus] = useState<DressStatus>('Disponible');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [notes, setNotes] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const mimeType = file.type;

        const response = await fetch('/api/analyze-dress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Data,
            mimeType: mimeType,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de l\'analyse de l\'image');
        }

        const data = await response.json();

        if (data.typeRobe) setType(data.typeRobe);
        if (data.couleurs) {
          setColor(data.couleurs);
          setName(`${data.typeRobe} ${data.couleurs}`);
        }
        if (data.description) setNotes(data.description);
        if (data.size) setSize(data.size);
        if (data.rentalPrice) setRentalPrice(data.rentalPrice);
        if (data.deposit) setDeposit(data.deposit);
        
        setImageUrl(base64String);

      } catch (error: any) {
        console.error('Erreur lors du traitement de l\'image par l\'IA:', error);
        alert(`Erreur d'analyse IA : ${error.message || 'Une erreur est survenue.'}`);
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // Handle opening form for adding
  const handleOpenAdd = () => {
    setEditingDress(null);
    setName('');
    setType('Caftan');
    setSize('38');
    setColor('');
    setRentalPrice(10000);
    setDeposit(5000);
    setStatus('Disponible');
    setImageUrl(PRESET_IMAGES[0].url);
    setNotes('');

    // Suggest next dress number
    const maxNum = dresses.reduce((max, d) => {
      const num = parseInt(d.number, 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    setDressNumber((maxNum + 1).toString().padStart(2, '0'));

    setIsFormOpen(true);
  };

  // Handle opening form for editing
  const handleOpenEdit = (dress: Dress) => {
    setEditingDress(dress);
    setDressNumber(dress.number || '');
    setName(dress.name);
    setType(dress.type);
    setSize(dress.size);
    setColor(dress.color);
    setRentalPrice(dress.rentalPrice);
    setDeposit(dress.deposit);
    setStatus(dress.status);
    setImageUrl(dress.imageUrl);
    setNotes(dress.notes || '');
    setIsFormOpen(true);
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dressNumber.trim()) {
      alert('Veuillez renseigner le numéro de la robe.');
      return;
    }
    if (!name.trim() || !color.trim()) {
      alert('Veuillez remplir le nom et la couleur de la robe.');
      return;
    }

    // Validate unique dress number
    const isDuplicate = dresses.some(d => d.number.trim() === dressNumber.trim() && (!editingDress || d.id !== editingDress.id));
    if (isDuplicate) {
      alert(`Le numéro de robe "${dressNumber}" est déjà attribué à une autre robe. Veuillez saisir un numéro de robe unique.`);
      return;
    }

    const dressData = {
      number: dressNumber.trim(),
      name: name.trim(),
      type,
      size,
      color: color.trim(),
      rentalPrice: Number(rentalPrice),
      deposit: Number(deposit),
      status,
      imageUrl,
      notes: notes.trim() || undefined
    };

    if (editingDress) {
      onUpdateDress({ ...dressData, id: editingDress.id });
    } else {
      onAddDress(dressData);
    }
    setIsFormOpen(false);
  };

  // Filter dresses
  const filteredDresses = dresses.filter(dress => {
    const search = (searchTerm || '').toLowerCase();
    const nameMatch = dress.name ? dress.name.toLowerCase().includes(search) : false;
    const colorMatch = dress.color ? dress.color.toLowerCase().includes(search) : false;
    const notesMatch = dress.notes ? dress.notes.toLowerCase().includes(search) : false;
    const matchesSearch = nameMatch || colorMatch || notesMatch;
    const matchesType = selectedType === 'All' || dress.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || dress.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDA = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 })
      .format(amount)
      .replace('DZD', 'DA');
  };

  return (
    <div className="space-y-6">
      {/* Header action / Filters panel */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-navy-500">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom, couleur, mots-clés..."
              className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-navy-850 rounded-lg text-sm text-navy-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent placeholder-navy-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-sm rounded-lg transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter une Robe
          </button>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-navy-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-450 uppercase tracking-wider mr-2">
            <Filter className="w-3.5 h-3.5" />
            Filtrer par :
          </div>
          
          {/* Dress Type Filter */}
          <div className="flex gap-1.5 flex-wrap">
            {['All', 'Karakou', 'Caftan', 'Chedda', 'Robe Kabyle', 'Robe Chaouie', 'Blousa Oranaise', 'Robe de Mariée', 'Autre'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  selectedType === t
                    ? 'bg-gold-500 text-navy-950 border-gold-400 font-bold shadow-sm'
                    : 'bg-navy-850 text-navy-400 border-navy-800 hover:bg-navy-800 hover:text-navy-200'
                }`}
              >
                {t === 'All' ? 'Tous les types' : t}
              </button>
            ))}
          </div>

          {/* Divider in layout */}
          <div className="w-px h-4 bg-navy-800 mx-2 hidden lg:block"></div>

          {/* Status Filter */}
          <div className="flex gap-1.5">
            {['All', 'Disponible', 'Louée', 'En Nettoyage', 'Hors Service'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  selectedStatus === s
                    ? 'bg-gold-500 text-navy-950 border-gold-400 font-bold shadow-sm'
                    : 'bg-navy-850 text-navy-400 border-navy-800 hover:bg-navy-800 hover:text-navy-200'
                }`}
              >
                {s === 'All' ? 'Tous les statuts' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid List of Dresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDresses.map((dress) => (
          <div
            key={dress.id}
            className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
          >
            {/* Image / Status Container */}
            <div className="relative aspect-4/3 bg-navy-950 overflow-hidden">
              <img
                src={dress.imageUrl}
                alt={dress.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Type Badge */}
              <span className="absolute top-3 left-3 bg-navy-950/90 backdrop-blur-sm border border-navy-850 text-navy-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                {dress.type}
              </span>
              
              {/* Status Badge */}
              <span
                className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm border ${
                  dress.status === 'Disponible'
                    ? 'bg-green-950/30 text-green-500 border-green-900/40'
                    : dress.status === 'Louée'
                    ? 'bg-gold-950/30 text-gold-500 border-gold-900/40'
                    : dress.status === 'En Nettoyage'
                    ? 'bg-blue-950/30 text-blue-450 border-blue-900/40'
                    : 'bg-rose-950/30 text-rose-500 border-rose-900/40'
                }`}
              >
                {dress.status}
              </span>
            </div>

            {/* Dress Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold font-mono bg-gold-500/10 text-gold-400 border border-gold-500/20 px-1.5 py-0.2 rounded inline-block mb-1">
                      N° {dress.number}
                    </span>
                    <h4 className="font-bold text-white group-hover:text-gold-500 transition-colors line-clamp-1">{dress.name}</h4>
                  </div>
                  <span className="bg-navy-850 text-navy-200 border border-navy-750 font-mono text-xs font-bold px-1.5 py-0.5 rounded">
                    T{dress.size}
                  </span>
                </div>

                <div className="flex gap-2 text-xs text-navy-300 mt-1.5 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-navy-500" />
                    Couleur : {dress.color}
                  </span>
                </div>

                {dress.notes && (
                  <p className="text-navy-300 text-xs mt-3 line-clamp-2 bg-navy-950/65 p-2 rounded border border-navy-800">
                    {dress.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-500">Tarif Location</p>
                  <p className="text-base font-extrabold text-white font-mono">{formatDA(dress.rentalPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-500">Caution</p>
                  <p className="text-sm font-semibold text-navy-300 font-mono">{formatDA(dress.deposit)}</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="px-4 py-3 bg-navy-950 border-t border-navy-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {/* Micro Status Quick Toggle */}
                <span className="text-[10px] font-semibold text-navy-500">Statut:</span>
                <select
                  value={dress.status}
                  onChange={(e) => onUpdateDress({ ...dress, status: e.target.value as DressStatus })}
                  className="bg-navy-900 border border-navy-850 text-navy-300 text-xs rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-gold-500"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Louée">Louée</option>
                  <option value="En Nettoyage">Nettoyage</option>
                  <option value="Hors Service">Hors Service</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(dress)}
                  className="p-1.5 text-navy-450 hover:text-gold-500 hover:bg-navy-850 rounded transition-colors"
                  title="Modifier la robe"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Êtes-vous sûr de vouloir supprimer la robe "${dress.name}" ?`)) {
                      onDeleteDress(dress.id);
                    }
                  }}
                  className="p-1.5 text-navy-500 hover:text-rose-500 hover:bg-rose-950/40 rounded transition-colors"
                  title="Supprimer la robe"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredDresses.length === 0 && (
          <div className="col-span-full bg-navy-950 border border-navy-800 border-dashed rounded-xl p-12 text-center text-navy-500">
            <Layers className="w-12 h-12 text-navy-700 mx-auto mb-3 animate-pulse" />
            <p className="font-medium text-navy-300">Aucune robe trouvée</p>
            <p className="text-xs text-navy-500 mt-1">Essayez de modifier vos filtres ou d'ajouter une nouvelle robe.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Dress Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-stone-100 bg-stone-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-600" />
                <h3 className="font-bold text-stone-800 text-lg">
                  {editingDress ? 'Modifier la Robe' : 'Ajouter une Robe d\'Exception'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* AI Assistant Section */}
              <div className="bg-gold-50/50 border border-gold-200/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-600 animate-pulse" />
                  <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider">Remplissage Assisté par l'IA Maison Zeyna</h4>
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Chargez ou prenez une photo de la robe. L'IA analysera le vêtement pour en déterminer automatiquement la coupe, les ornements traditionnels algériens, et remplira la fiche produit, y compris les tarifs conseillés !
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    id="ai-dress-upload"
                    className="hidden"
                    onChange={handleAiImageUpload}
                    disabled={isAnalyzing}
                  />
                  <label
                    htmlFor="ai-dress-upload"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isAnalyzing
                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        : 'bg-gold-500 hover:bg-gold-600 text-navy-950 border-gold-400 shadow-sm'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Sélectionner / Photographier une Robe
                      </>
                    )}
                  </label>
                  {isAnalyzing && (
                    <span className="text-xs text-gold-700 font-semibold animate-pulse">
                      L'IA étudie les broderies et le tissu...
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Numéro Unique *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 01, 02, 15"
                    value={dressNumber}
                    onChange={e => setDressNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent font-mono font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Nom de la Robe *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Karakou Yasmine, Caftan Sofia"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Type de Robe *</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as DressType)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                  >
                    <option value="Karakou">Karakou (Alger)</option>
                    <option value="Caftan">Caftan</option>
                    <option value="Chedda">Chedda (Tlemcen)</option>
                    <option value="Robe Kabyle">Robe Kabyle</option>
                    <option value="Robe Chaouie">Robe Chaouie</option>
                    <option value="Blousa Oranaise">Blousa Oranaise (Oran)</option>
                    <option value="Robe de Mariée">Robe de Mariée</option>
                    <option value="Autre">Autre tenue traditionnelle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Taille *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 38, 40, 42, M, L"
                    value={size}
                    onChange={e => setSize(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Couleur & Tissu *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Velours Rouge Bordeaux, Soie Or"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Prix de Location (DA) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Tarif en Dinars Algériens"
                    value={rentalPrice}
                    onChange={e => setRentalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Caution / Garantie (DA) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Montant de la caution en Dinars"
                    value={deposit}
                    onChange={e => setDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Statut Initial</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as DressStatus)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                  >
                    <option value="Disponible">Disponible en boutique</option>
                    <option value="Louée">Déjà louée</option>
                    <option value="En Nettoyage">En pressing / Nettoyage</option>
                    <option value="Hors Service">Hors service temporaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Image de la Robe (URL)</label>
                  <input
                    type="text"
                    required
                    placeholder="Coller l'adresse d'une image"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-xs"
                  />
                </div>
              </div>

              {/* Preset Image Chooser */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Ou choisir une photo d'exception prédéfinie :
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {PRESET_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        imageUrl === img.url ? 'border-gold-500 ring-2 ring-gold-500/30 scale-95' : 'border-transparent hover:border-stone-300'
                      }`}
                      title={img.name}
                    >
                      <img src={img.url} alt={img.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Notes particulières, broderies, retouches...</label>
                <textarea
                  placeholder="Informations supplémentaires (accessoires fournis, état particulier, traîne, ceinture...)"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                ></textarea>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-lg font-medium text-stone-700 text-sm transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-900 hover:bg-navy-950 text-gold-400 border border-gold-500/20 font-medium text-sm rounded-lg transition-all shadow-sm"
                >
                  {editingDress ? 'Enregistrer les modifications' : 'Ajouter la Robe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
