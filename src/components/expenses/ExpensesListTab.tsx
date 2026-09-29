import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Calendar,
  Receipt,
  FileText,
  Paperclip,
  CheckCircle2,
  TrendingDown,
  ArrowUpDown,
  X,
  CreditCard,
  Download,
} from 'lucide-react';
import { ALL_EXPENSE_CATEGORIES } from './ExpensesCategoriesTab';

interface ExpensesListTabProps {
  onOpenAddExpense: () => void;
  onOpenExpenseDetail: (expense: Expense) => void;
  onOpenEditExpense: (expense: Expense) => void;
  initialCategoryFilter?: string;
  searchQuery?: string;
}

type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'year';

const PAYMENT_METHODS_FILTER: (PaymentMethod | 'all')[] = [
  'all',
  'Espèces',
  'Virement bancaire',
  'Chèque',
  'Orange Money',
  'MTN Mobile Money',
  'Wave',
  'Carte bancaire',
  'Mobile Money',
  'Autre',
];

export const ExpensesListTab: React.FC<ExpensesListTabProps> = ({
  onOpenAddExpense,
  onOpenExpenseDetail,
  onOpenEditExpense,
  initialCategoryFilter,
  searchQuery: externalSearch = '',
}) => {
  const { expenses, settings, deleteExpense } = useCrm();
  const sym = settings.currencySymbol || '€';

  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryFilter || 'all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category' | 'expenseNumber'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // React to initialCategoryFilter if changed externally
  React.useEffect(() => {
    if (initialCategoryFilter) {
      setSelectedCategory(initialCategoryFilter);
    }
  }, [initialCategoryFilter]);

  const effectiveSearch = (externalSearch || search).trim().toLowerCase();

  // Date boundaries
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentMonthStr = today.toISOString().slice(0, 7);
  const currentYearStr = today.getFullYear().toString();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  // Filtering Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // 1. Search filter: reference, supplier/beneficiary, category, description
      if (effectiveSearch) {
        const refMatch = exp.expenseNumber?.toLowerCase().includes(effectiveSearch);
        const supplierMatch = (exp.supplier || exp.beneficiary || '').toLowerCase().includes(effectiveSearch);
        const catMatch = exp.category?.toLowerCase().includes(effectiveSearch);
        const descMatch = exp.description?.toLowerCase().includes(effectiveSearch);
        const vehMatch = (exp.vehicleInfo || '').toLowerCase().includes(effectiveSearch);

        if (!refMatch && !supplierMatch && !catMatch && !descMatch && !vehMatch) {
          return false;
        }
      }

      // 2. Period filter: today, week, month, year, all
      if (periodFilter === 'today' && exp.date !== todayStr) {
        return false;
      }
      if (periodFilter === 'week' && (exp.date < startOfWeekStr || exp.date > todayStr)) {
        return false;
      }
      if (periodFilter === 'month' && (!exp.date || !exp.date.startsWith(currentMonthStr))) {
        return false;
      }
      if (periodFilter === 'year' && (!exp.date || !exp.date.startsWith(currentYearStr))) {
        return false;
      }

      // 3. Category filter
      if (selectedCategory !== 'all') {
        const expCat = exp.category || 'Autres';
        if (selectedCategory === 'Entretien' && (expCat === 'Entretien' || expCat === 'Maintenance')) {
          // match
        } else if (selectedCategory === 'Autres' && (expCat === 'Autres' || expCat === 'Autres dépenses')) {
          // match
        } else if (expCat !== selectedCategory) {
          return false;
        }
      }

      // 4. Payment method filter
      if (selectedPaymentMethod !== 'all' && exp.paymentMethod !== selectedPaymentMethod) {
        return false;
      }

      return true;
    });
  }, [
    expenses,
    effectiveSearch,
    periodFilter,
    selectedCategory,
    selectedPaymentMethod,
    todayStr,
    startOfWeekStr,
    currentMonthStr,
    currentYearStr,
  ]);

  // Sort
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = (a.date || '').localeCompare(b.date || '');
      } else if (sortField === 'amount') {
        comparison = (a.amount || 0) - (b.amount || 0);
      } else if (sortField === 'category') {
        comparison = (a.category || '').localeCompare(b.category || '');
      } else if (sortField === 'expenseNumber') {
        comparison = (a.expenseNumber || '').localeCompare(b.expenseNumber || '');
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredExpenses, sortField, sortDirection]);

  // Total calculated on filtered set
  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [filteredExpenses]);

  const handleSort = (field: 'date' | 'amount' | 'category' | 'expenseNumber') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setPeriodFilter('all');
    setSelectedCategory('all');
    setSelectedPaymentMethod('all');
  };

  const hasActiveFilters =
    effectiveSearch !== '' ||
    periodFilter !== 'all' ||
    selectedCategory !== 'all' ||
    selectedPaymentMethod !== 'all';

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5E5DF] shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7A7A72] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="expense-search-input"
              type="text"
              placeholder="Rechercher par référence, fournisseur, catégorie, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7A72] hover:text-[#1A1A18]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* New Expense Button */}
          <button
            id="btn-new-expense"
            onClick={onOpenAddExpense}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle dépense</span>
          </button>
        </div>

        {/* Quick Period & Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0F0EC]">
          {/* Quick Period Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#FAFAF8] rounded-xl border border-[#E5E5DF] text-xs">
            <button
              onClick={() => setPeriodFilter('today')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                periodFilter === 'today'
                  ? 'bg-[#2D2D2A] text-white shadow-xs font-semibold'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setPeriodFilter('week')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                periodFilter === 'week'
                  ? 'bg-[#2D2D2A] text-white shadow-xs font-semibold'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              Cette semaine
            </button>
            <button
              onClick={() => setPeriodFilter('month')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                periodFilter === 'month'
                  ? 'bg-[#2D2D2A] text-white shadow-xs font-semibold'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              Ce mois
            </button>
            <button
              onClick={() => setPeriodFilter('year')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                periodFilter === 'year'
                  ? 'bg-[#2D2D2A] text-white shadow-xs font-semibold'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              Cette année
            </button>
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                periodFilter === 'all'
                  ? 'bg-[#2D2D2A] text-white shadow-xs font-semibold'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              Toutes
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs text-[#1A1A18] font-medium focus:outline-hidden focus:border-[#4A7A4A]"
          >
            <option value="all">Toutes catégories</option>
            {ALL_EXPENSE_CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Payment Method Dropdown */}
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="px-3 py-1.5 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs text-[#1A1A18] font-medium focus:outline-hidden focus:border-[#4A7A4A]"
          >
            <option value="all">Tous modes de paiement</option>
            <option value="Espèces">Espèces</option>
            <option value="Virement bancaire">Virement bancaire</option>
            <option value="Chèque">Chèque</option>
            <option value="Orange Money">Orange Money</option>
            <option value="MTN Mobile Money">MTN Mobile Money</option>
            <option value="Wave">Wave</option>
            <option value="Carte bancaire">Carte bancaire</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Autre">Autre</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1 rounded-lg text-xs text-red-600 hover:bg-red-50 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>
          )}

          <div className="ml-auto text-xs text-[#7A7A72]">
            <span className="font-semibold text-[#1A1A18]">{sortedExpenses.length}</span> dépense
            {sortedExpenses.length > 1 ? 's' : ''} • Total :{' '}
            <span className="font-bold text-red-600 font-mono">
              -{filteredTotal.toLocaleString('fr-FR')} {sym}
            </span>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {sortedExpenses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E5E5DF] shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
            Aucune dépense enregistrée
          </h3>
          <p className="text-xs text-[#7A7A72] mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Aucune dépense ne correspond aux critères de recherche et filtres actuels.'
              : 'Enregistrez votre première dépense pour suivre vos charges et votre rentabilité en temps réel.'}
          </p>
          <div className="mt-4">
            <button
              id="btn-empty-add-expense"
              onClick={onOpenAddExpense}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une dépense</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5DF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5DF] bg-[#FAFAF8] text-[#7A7A72] font-semibold select-none">
                  <th
                    onClick={() => handleSort('expenseNumber')}
                    className="py-3 px-4 cursor-pointer hover:text-[#1A1A18]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Référence</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('date')}
                    className="py-3 px-4 cursor-pointer hover:text-[#1A1A18]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className="py-3 px-4 cursor-pointer hover:text-[#1A1A18]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Catégorie</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Fournisseur</th>
                  <th className="py-3 px-4">Description</th>
                  <th
                    onClick={() => handleSort('amount')}
                    className="py-3 px-4 cursor-pointer hover:text-[#1A1A18] text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Montant</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Mode de paiement</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC]">
                {sortedExpenses.map((exp) => {
                  const supplier = exp.supplier || exp.beneficiary || '-';
                  const docCount = exp.documents ? exp.documents.length : (exp.receiptUrl ? 1 : 0);

                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-[#FAFAF8] transition-colors group text-[#1A1A18]"
                    >
                      {/* Référence */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#1A1A18] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{exp.expenseNumber}</span>
                          {docCount > 0 && (
                            <span
                              className="text-[10px] p-0.5 rounded-md bg-blue-50 text-blue-700"
                              title={`${docCount} document(s) joint(s)`}
                            >
                              <Paperclip className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#7A7A72] whitespace-nowrap">
                        {new Date(exp.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Catégorie */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAFAF8] border border-[#E5E5DF] text-[#2D2D2A]">
                          {exp.category}
                        </span>
                      </td>

                      {/* Fournisseur */}
                      <td className="py-3.5 px-4 font-medium text-[#1A1A18] whitespace-nowrap">
                        {supplier}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-[#2D2D2A]">
                        <span>{exp.description}</span>
                        {exp.vehicleInfo && (
                          <span className="block text-[10px] text-[#7A7A72] truncate">
                            {exp.vehicleInfo}
                          </span>
                        )}
                      </td>

                      {/* Montant */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-red-600 text-sm">
                        -{exp.amount.toLocaleString('fr-FR')} {sym}
                      </td>

                      {/* Mode de paiement */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#7A7A72]">
                        <span className="px-2 py-0.5 rounded-md bg-[#F0F0EC] text-[11px] font-medium text-[#1A1A18]">
                          {exp.paymentMethod}
                        </span>
                      </td>

                      {/* Actions: Voir, Modifier, Supprimer, Imprimer */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Voir */}
                          <button
                            type="button"
                            onClick={() => onOpenExpenseDetail(exp)}
                            className="p-1.5 text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0F0EC] rounded-lg transition-colors cursor-pointer"
                            title="Voir le détail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Modifier */}
                          <button
                            type="button"
                            onClick={() => onOpenEditExpense(exp)}
                            className="p-1.5 text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0F0EC] rounded-lg transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Imprimer */}
                          <button
                            type="button"
                            onClick={() => onOpenExpenseDetail(exp)}
                            className="p-1.5 text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0F0EC] rounded-lg transition-colors cursor-pointer"
                            title="Imprimer le bon"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Supprimer */}
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Confirmez-vous la suppression de la dépense ${exp.expenseNumber} (${exp.amount} ${sym}) ?`
                                )
                              ) {
                                deleteExpense(exp.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
