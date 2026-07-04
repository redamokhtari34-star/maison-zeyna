/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Jewelry } from '../types';
import { Search, Plus, Filter, Edit3, Trash2, Tag, CheckCircle, Clock, X, Sparkles } from 'lucide-react';

interface JewelryCatalogProps {
  jewelry: Jewelry[];
  onAddJewelry: (item: Omit<Jewelry, 'id'>) => void;
  onUpdateJewelry: (item: Jewelry) => void;
  onDeleteJewelry: (id: string) => void;
}

const PRESET_JEWELRY_IMAGES = [
  { name: 'Parure Impériale en Perles', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80' },
  { name: 'Diadème Berbère Corail', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80' },
  { name: 'Ceinture Traditionnelle Or', url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80' },
  { name: 'Collier Perles & Rubis', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80' },
  { name: 'Boucles d\'oreilles filigrane d\'or', url: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80' }
];

export default function JewelryCatalog({ jewelry, onAddJewelry, onUpdateJewelry, onDeleteJewelry }: JewelryCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Jewelry | null>(null);

  // Form states
  const [itemNumber, setItemNumber] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<Jewelry['type']>('Parure');
  const [color, setColor] = useState('');
  const [rentalPrice, setRentalPrice] = useState(4000);
  const [deposit, setDeposit] = useState(3000);
  const [status, setStatus] = useState<Jewelry['status']>('Disponible');
  const [imageUrl, setImageUrl] = useState(PRESET_JEWELRY_IMAGES[0].url);
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

        const response = await fetch('/api/analyze-jewelry', {
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

        if (data.typeBijou) setType(data.typeBijou);
        if (data.color) {
          setColor(data.color);
          setName(`${data.typeBijou} ${data.color}`);
        }
        if (data.description) setNotes(data.description);
        if (data.rentalPrice) setRentalPrice(data.rentalPrice);
        if (data.deposit) setDeposit(data.deposit);
        
        setImageUrl(base64String);

      } catch (error: any) {
        console.error('Erreur traitement image bijoux:', error);
        alert(`Erreur d'analyse IA : ${error.message || 'Une erreur est survenue.'}`);
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setItemNumber(`BJ-${Date.now().toString().slice(-4)}`);
    setName('');
    setType('Parure');
    setColor('');
    setRentalPrice(4000);
    setDeposit(3000);
    setStatus('Disponible');
    setImageUrl(PRESET_JEWELRY_IMAGES[0].url);
    setNotes('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Jewelry) => {
    setEditingItem(item);
    setItemNumber(item.number);
    setName(item.name);
    setType(item.type);
    setColor(item.color);
    setRentalPrice(item.rentalPrice);
    setDeposit(item.deposit);
    setStatus(item.status);
    setImageUrl(item.imageUrl);
    setNotes(item.notes || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemNumber.trim() || !name.trim() || !color.trim()) {
      alert('Veuillez remplir les champs obligatoires (*)');
      return;
    }

    const itemData = {
      number: itemNumber.trim(),
      name: name.trim(),
      type,
      color: color.trim(),
      rentalPrice: Number(rentalPrice),
      deposit: Number(deposit),
      status,
      imageUrl,
      notes: notes.trim() || undefined
    };

    if (editingItem) {
      onUpdateJewelry({ ...itemData, id: editingItem.id });
    } else {
      onAddJewelry(itemData);
    }

    setIsFormOpen(false);
  };

  // Filter jewelry catalog
  const filteredJewelry = jewelry.filter(item => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(search) || 
      item.number.toLowerCase().includes(search) || 
      item.color.toLowerCase().includes(search) ||
      (item.notes && item.notes.toLowerCase().includes(search));
    const matchesType = selectedType === 'All' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDA = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(amount).replace('DZD', 'DA');
  };

  return (
    <div className="space-y-6">
      {/* Header Search & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy-900 border border-navy-800 p-5 rounded-xl shadow-sm">
        <div className="relative flex-grow max-w-lg">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-navy-500">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Rechercher un bijou, une référence, une couleur..."
            className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-navy-850 rounded-lg text-sm text-navy-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent placeholder-navy-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Item Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-navy-950 font-bold text-xs rounded-lg transition-all shadow-sm border border-gold-300/25"
          >
            <Plus className="w-4 h-4" />
            Nouveau Bijou
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 border border-stone-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-bold">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtrer par :</span>
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Parure', 'Diadème', 'Ceinture', 'Collier', 'Bracelet', 'Boucles d\'oreilles'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                selectedType === t
                  ? 'bg-navy-900 border-navy-900 text-white font-bold'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {t === 'All' ? 'Tous les types' : t}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-stone-200 hidden md:block"></div>

        {/* Status Filter */}
        <div className="flex gap-1.5">
          {['All', 'Disponible', 'Loué', 'En Nettoyage', 'Hors Service'].map(s => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                selectedStatus === s
                  ? 'bg-gold-500 border-gold-500 text-navy-950 font-bold'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {s === 'All' ? 'Tous les statuts' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredJewelry.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group duration-300 flex flex-col justify-between"
          >
            {/* Item Image with hover zoom */}
            <div className="relative h-60 w-full overflow-hidden bg-stone-100 border-b border-stone-100">
              <img
                src={item.imageUrl}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Badge Status */}
              <span className={`absolute top-3 right-3 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full shadow-md uppercase border ${
                item.status === 'Disponible' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/50' 
                  : item.status === 'Loué' 
                  ? 'bg-amber-50 text-amber-800 border-amber-200/50'
                  : 'bg-stone-100 text-stone-800 border-stone-200/50'
              }`}>
                {item.status}
              </span>

              {/* Reference number badge */}
              <span className="absolute bottom-3 left-3 bg-navy-900/90 backdrop-blur-xs text-gold-400 border border-gold-500/20 font-mono font-bold text-xs px-2 py-0.5 rounded shadow-sm">
                Réf : {item.number}
              </span>
            </div>

            {/* Item Details */}
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-stone-400" />
                  <span>{item.type}</span>
                </div>
                <h4 className="font-bold text-stone-900 leading-snug group-hover:text-navy-950 transition-colors">{item.name}</h4>
                <p className="text-xs text-stone-500 font-medium">Ornement : <span className="text-stone-800">{item.color}</span></p>
                {item.notes && (
                  <p className="text-xs text-stone-400 italic leading-relaxed pt-1 line-clamp-2">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Pricing & Actions */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-stone-400 uppercase font-bold tracking-wider leading-none">Location</p>
                  <strong className="text-navy-900 font-mono font-bold text-sm">{formatDA(item.rentalPrice)}</strong>
                  <span className="text-[9px] text-stone-400 block font-medium">Caution : {formatDA(item.deposit)}</span>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 border border-stone-200 hover:border-gold-500/30 hover:bg-gold-50 text-stone-600 hover:text-gold-800 rounded-lg transition-all"
                    title="Modifier la fiche"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Confirmer la suppression définitive du bijou "${item.name}" ?`)) {
                        onDeleteJewelry(item.id);
                      }
                    }}
                    className="p-2 border border-stone-200 hover:bg-rose-50 hover:border-rose-200 text-stone-600 hover:text-rose-700 rounded-lg transition-all"
                    title="Supprimer la fiche"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredJewelry.length === 0 && (
          <div className="col-span-full py-16 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl bg-stone-50">
            <Search className="w-12 h-12 text-stone-200 mx-auto mb-2 animate-pulse" />
            <p className="font-semibold text-stone-600">Aucun bijou ne correspond</p>
            <p className="text-xs text-stone-400 mt-1">Ajustez vos filtres de recherche ou créez un nouveau bijou.</p>
          </div>
        )}
      </div>

      {/* Catalog Add/Edit Dialog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-stone-100 bg-stone-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-600" />
                <h3 className="font-bold text-stone-800 text-lg">
                  {editingItem ? 'Modifier la fiche bijou d\'exception' : 'Ajouter une pièce d\'orfèvrerie d\'art'}
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* AI Assistant Upload */}
              <div className="bg-gold-50/50 border border-gold-200/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-600 animate-pulse" />
                  <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider">Remplissage Assisté par l\'IA Maison Zeyna</h4>
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Chargez une photo du bijou traditionnel. L'IA de prestige analysera l'image pour déterminer automatiquement son type, ses métaux/pierres d'ornementation, et rédigera une fiche poétique d'exception.
                </p>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-white border border-gold-300 hover:bg-gold-50 text-gold-800 text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-xs flex items-center gap-2">
                    {isAnalyzing ? (
                      <>
                        <Clock className="w-3.5 h-3.5 animate-spin text-gold-600" />
                        Analyse par l'IA en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                        Analyser une photo du bijou
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isAnalyzing}
                      onChange={handleAiImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Form Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Référence Unique (N° Cintre/Coffre) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: J-04"
                    value={itemNumber}
                    onChange={e => setItemNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Nom du Bijou d'Art *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Diadème Kabyle Amira"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Type d'Accessoire *</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as Jewelry['type'])}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                  >
                    <option value="Parure">Parure Complète</option>
                    <option value="Diadème">Diadème (Tedj)</option>
                    <option value="Collier">Collier (Khabcha)</option>
                    <option value="Bracelet">Bracelet (Swar)</option>
                    <option value="Boucles d'oreilles">Boucles d'oreilles</option>
                    <option value="Ceinture">Ceinture (Maddama)</option>
                    <option value="Autre">Autre Ornement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Couleur et Métaux/Pierres *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Argent ciselé & Coraux rouges"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Tarif de Location (DA / Événement) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={rentalPrice}
                    onChange={e => setRentalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Caution / Garantie exigée (DA) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={deposit}
                    onChange={e => setDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Statut Initial *</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as Jewelry['status'])}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Loué">Loué (Réservé)</option>
                    <option value="En Nettoyage">En Nettoyage / Polissage</option>
                    <option value="Hors Service">Hors Service (Entretien)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Image URL (ou prédéfinie)</label>
                  <select
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                  >
                    {PRESET_JEWELRY_IMAGES.map(img => (
                      <option key={img.url} value={img.url}>{img.name}</option>
                    ))}
                    {imageUrl.startsWith('data:image') && (
                      <option value={imageUrl}>-- Photo analysée par l'IA --</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Description & Spécificités d'Artisanat</label>
                <textarea
                  placeholder="Détails du travail filigrané, poinçons, sertissages d'exception..."
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
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-lg font-medium text-stone-700 text-sm transition-colors"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-900 hover:bg-navy-950 text-gold-400 border border-gold-500/20 font-medium text-sm rounded-lg transition-all shadow-sm"
                >
                  {editingItem ? 'Enregistrer le bijou' : 'Enregistrer la création'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
