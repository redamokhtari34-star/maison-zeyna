/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Expense, CashWithdrawal, Booking } from '../types';
import { CreditCard, TrendingUp, TrendingDown, ArrowUpRight, DollarSign, Plus, Trash2, ShieldAlert, BookOpen, Calendar } from 'lucide-react';

interface FinanceManagerProps {
  bookings: Booking[];
  expenses: Expense[];
  withdrawals: CashWithdrawal[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onAddWithdrawal: (withdrawal: Omit<CashWithdrawal, 'id'>) => void;
  onDeleteWithdrawal: (id: string) => void;
}

export default function FinanceManager({
  bookings,
  expenses,
  withdrawals,
  onAddExpense,
  onDeleteExpense,
  onAddWithdrawal,
  onDeleteWithdrawal
}: FinanceManagerProps) {
  // Tabs for history
  const [activeTab, setActiveTab] = useState<'expenses' | 'withdrawals' | 'revenues'>('expenses');

  // Form States - Expenses
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('Fournitures');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Form States - Withdrawals
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalNotes, setWithdrawalNotes] = useState('');
  const [withdrawalDate, setWithdrawalDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculations for current month (July 2026 or whatever the system year-month is)
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentMonthStr = `${currentYear}-${currentMonth}`; // "2026-07" or current

  // Gather all payments from active bookings
  const allPayments = bookings
    .filter(b => b.status !== 'Annulé')
    .flatMap(b => {
      const pList = b.payments || [];
      return pList.map(p => ({
        clientName: b.clientName,
        contractId: b.id,
        amount: p.amount,
        date: p.date,
        type: p.type
      }));
    });

  // Sum payments in current month
  const monthlyRevenues = allPayments
    .filter(p => p.date.startsWith(currentMonthStr))
    .reduce((sum, p) => sum + p.amount, 0);

  // Sum total revenue historically
  const totalRevenuesHistorical = allPayments.reduce((sum, p) => sum + p.amount, 0);

  // Filter current month expenses
  const monthlyExpenses = expenses
    .filter(e => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpensesHistorical = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Filter current month withdrawals
  const monthlyWithdrawals = withdrawals
    .filter(w => w.date.startsWith(currentMonthStr))
    .reduce((sum, w) => sum + w.amount, 0);

  const totalWithdrawalsHistorical = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  // Safe Cash Drawer calculation: Total Cash received historically - historical expenses - historical withdrawals
  const cashOnHand = totalRevenuesHistorical - totalExpensesHistorical - totalWithdrawalsHistorical;

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc.trim() || !expenseAmount || Number(expenseAmount) <= 0) {
      alert('Veuillez remplir des données de dépense valides.');
      return;
    }

    onAddExpense({
      description: expenseDesc.trim(),
      amount: Number(expenseAmount),
      category: expenseCategory,
      date: expenseDate
    });

    setExpenseDesc('');
    setExpenseAmount('');
    alert('Dépense enregistrée en caisse avec succès.');
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalAmount || Number(withdrawalAmount) <= 0) {
      alert('Veuillez saisir un montant de retrait valide.');
      return;
    }

    const amountNum = Number(withdrawalAmount);
    if (amountNum > cashOnHand) {
      if (!confirm(`Attention : Le montant demandé (${formatDA(amountNum)}) est supérieur aux fonds disponibles estimés en caisse (${formatDA(cashOnHand)}). Continuer tout de même ?`)) {
        return;
      }
    }

    onAddWithdrawal({
      amount: amountNum,
      date: withdrawalDate,
      notes: withdrawalNotes.trim() || undefined
    });

    setWithdrawalAmount('');
    setWithdrawalNotes('');
    alert('Retrait d\'espèces pour versement en banque enregistré.');
  };

  const formatDA = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 })
      .format(amount)
      .replace('DZD', 'DA');
  };

  const getCategoryColor = (category: Expense['category']) => {
    switch (category) {
      case 'Achat de stock': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Loyer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Salaire': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Facture d\'électricité': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Fournitures': return 'bg-stone-100 text-stone-800 border-stone-200';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Monthly Revenues */}
        <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-sm text-white relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-stone-400 text-xs uppercase tracking-wider font-semibold">Recettes du mois ({currentMonthStr})</span>
          <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-2">{formatDA(monthlyRevenues)}</h3>
          <p className="text-[10px] text-stone-500 mt-1">Cumul total historique : {formatDA(totalRevenuesHistorical)}</p>
        </div>

        {/* Metric 2: Monthly Expenses */}
        <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-sm text-white relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <span className="text-stone-400 text-xs uppercase tracking-wider font-semibold">Dépenses du mois ({currentMonthStr})</span>
          <h3 className="text-2xl font-bold font-mono text-rose-400 mt-2">{formatDA(monthlyExpenses)}</h3>
          <p className="text-[10px] text-stone-500 mt-1">Dépenses totales historiques : {formatDA(totalExpensesHistorical)}</p>
        </div>

        {/* Metric 3: Cash Withdrawals for Bank */}
        <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-sm text-white relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="text-stone-400 text-xs uppercase tracking-wider font-semibold">Retraits Banque du mois</span>
          <h3 className="text-2xl font-bold font-mono text-amber-400 mt-2">{formatDA(monthlyWithdrawals)}</h3>
          <p className="text-[10px] text-stone-500 mt-1">Total versé en banque : {formatDA(totalWithdrawalsHistorical)}</p>
        </div>

        {/* Metric 4: Drawer Cash Balance */}
        <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-sm text-white relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/20 text-gold-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-stone-400 text-xs uppercase tracking-wider font-semibold">Solde estimé en Caisse</span>
          <h3 className="text-2xl font-bold font-mono text-gold-400 mt-2">{formatDA(cashOnHand)}</h3>
          <p className="text-[10px] text-stone-500 mt-1">Fonds physiques à date en boutique</p>
        </div>
      </div>

      {/* Main Core Layout: Forms Left, History List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left forms side */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Add Expense Form */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-100">
              <TrendingDown className="w-5 h-5 text-rose-500" />
              <h4 className="font-bold text-stone-800 text-sm uppercase tracking-wider">Enregistrer une Dépense</h4>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Désignation / Motif *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Facture teinturier 12 robes"
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Montant (DA) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="5000"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Catégorie de Dépense *</label>
                <select
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value as Expense['category'])}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                >
                  <option value="Achat de stock">Achat de stock / Tissus</option>
                  <option value="Facture d'électricité">Électricité / Eau (Sonelgaz)</option>
                  <option value="Fournitures">Fournitures de couture / Papeterie</option>
                  <option value="Salaire">Salaires / Prestations</option>
                  <option value="Loyer">Loyer Boutique</option>
                  <option value="Autre">Autre Dépense boutique</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-650 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Valider la Dépense en Caisse
              </button>
            </form>
          </div>

          {/* Card 2: Cash Withdrawal for Bank Deposit */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-xs text-white">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-navy-800">
              <CreditCard className="w-5 h-5 text-gold-400" />
              <h4 className="font-bold text-gold-400 text-sm uppercase tracking-wider">Versement en Banque (Retrait Caisse)</h4>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Utilisez ce formulaire pour enregistrer les sorties d'espèces physiques de la caisse pour les déposer sur les comptes bancaires (BDL, CPA, CCP) de Maison Zeyna.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Montant à Retirer (DA) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="50000"
                    value={withdrawalAmount}
                    onChange={e => setWithdrawalAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Date du Versement *</label>
                  <input
                    type="date"
                    required
                    value={withdrawalDate}
                    onChange={e => setWithdrawalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Bordereau / Notes d'Opération</label>
                <input
                  type="text"
                  placeholder="Ex: Versement d'espèces BDL Bordereau N° 451"
                  value={withdrawalNotes}
                  onChange={e => setWithdrawalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500 placeholder-navy-700"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-navy-950 font-bold text-xs rounded-lg transition-all shadow-sm"
              >
                <ArrowUpRight className="w-4 h-4" />
                Enregistrer le Versement Banque
              </button>
            </form>
          </div>
        </div>

        {/* Right side history tabs & logs */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          {/* Tabs header */}
          <div className="flex border-b border-stone-100 bg-stone-50 p-2.5 gap-1.5">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 py-2 px-3 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                activeTab === 'expenses'
                  ? 'bg-white border-stone-200 text-rose-700 shadow-xs'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Dépenses ({expenses.length})
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`flex-1 py-2 px-3 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                activeTab === 'withdrawals'
                  ? 'bg-white border-stone-200 text-amber-700 shadow-xs'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Retraits Banque ({withdrawals.length})
            </button>
            <button
              onClick={() => setActiveTab('revenues')}
              className={`flex-1 py-2 px-3 text-center rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                activeTab === 'revenues'
                  ? 'bg-white border-stone-200 text-emerald-700 shadow-xs'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Recettes Caisse ({allPayments.length})
            </button>
          </div>

          {/* List panel */}
          <div className="p-5 flex-grow overflow-y-auto max-h-[500px]">
            {activeTab === 'expenses' && (
              <div className="space-y-3.5">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-3.5 bg-stone-50/50 border border-stone-200/60 rounded-xl hover:bg-stone-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryColor(exp.category)}`}>
                          {exp.category}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {exp.date}
                        </span>
                      </div>
                      <h5 className="font-bold text-stone-800 text-sm">{exp.description}</h5>
                    </div>
                    <div className="flex items-center gap-3">
                      <strong className="text-rose-600 font-mono font-bold text-sm">
                        -{formatDA(exp.amount)}
                      </strong>
                      <button
                        onClick={() => {
                          if (confirm(`Confirmer la suppression définitive de cette écriture de dépense ?`)) {
                            onDeleteExpense(exp.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Supprimer la dépense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {expenses.length === 0 && (
                  <div className="py-12 text-center text-stone-400">
                    <TrendingDown className="w-10 h-10 text-stone-200 mx-auto mb-2" />
                    <p className="font-semibold text-stone-600">Aucune dépense enregistrée</p>
                    <p className="text-xs text-stone-400 mt-1">Saisissez les frais ou achats de stock sur le panneau de gauche.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div className="space-y-3.5">
                {withdrawals.map((wit) => (
                  <div key={wit.id} className="flex items-center justify-between p-3.5 bg-stone-50/50 border border-stone-200/60 rounded-xl hover:bg-stone-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-50 text-amber-800 border border-amber-100 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          Dépôt Banque
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {wit.date}
                        </span>
                      </div>
                      <h5 className="font-bold text-stone-800 text-sm">{wit.notes || 'Versement d\'espèces régulier'}</h5>
                    </div>
                    <div className="flex items-center gap-3">
                      <strong className="text-amber-600 font-mono font-bold text-sm">
                        -{formatDA(wit.amount)}
                      </strong>
                      <button
                        onClick={() => {
                          if (confirm(`Confirmer la suppression définitive de cette écriture de retrait pour banque ?`)) {
                            onDeleteWithdrawal(wit.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Supprimer l'écriture"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {withdrawals.length === 0 && (
                  <div className="py-12 text-center text-stone-400">
                    <CreditCard className="w-10 h-10 text-stone-200 mx-auto mb-2" />
                    <p className="font-semibold text-stone-600">Aucun dépôt banque répertorié</p>
                    <p className="text-xs text-stone-400 mt-1">Saisissez vos versements de caisse en banque pour suivre le solde physique disponible.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'revenues' && (
              <div className="space-y-3.5">
                {allPayments
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((p, idx) => (
                    <div key={`${p.contractId}-${p.date}-${idx}`} className="flex items-center justify-between p-3.5 bg-stone-50/50 border border-stone-200/60 rounded-xl hover:bg-stone-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {p.type}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {p.date}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            Contrat : {p.contractId.toUpperCase()}
                          </span>
                        </div>
                        <h5 className="font-bold text-stone-800 text-sm">Cliente : {p.clientName}</h5>
                      </div>
                      <div className="flex items-center gap-3">
                        <strong className="text-emerald-600 font-mono font-bold text-sm">
                          +{formatDA(p.amount)}
                        </strong>
                      </div>
                    </div>
                  ))}

                {allPayments.length === 0 && (
                  <div className="py-12 text-center text-stone-400">
                    <TrendingUp className="w-10 h-10 text-stone-200 mx-auto mb-2" />
                    <p className="font-semibold text-stone-600">Aucune entrée d'espèces</p>
                    <p className="text-xs text-stone-400 mt-1">Les acomptes et soldes de contrats validés s'ajouteront automatiquement ici.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
