import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Expense, ExpenseCategory } from '../../types';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  Calendar,
  DollarSign,
  Tag,
  Car,
  Trash2,
  Edit2,
  Eye,
  FileText,
  Building,
} from 'lucide-react';

interface AccountingExpensesTabProps {
  onOpenAddExpense: () => void;
  onViewExpense: (exp: Expense) => void;
  onEditExpense: (exp: Expense) => void;
}

const CATEGORY_LIST: ExpenseCategory[] = [
  'Carburant',
  'Maintenance',
  'Assurance',
  'Salaires',
  'Loyer',
  'Marketing',
  'Fournitures',
  'Autres dépenses',
];

export const AccountingExpensesTab: React.FC<AccountingExpensesTabProps> = ({
  onOpenAddExpense,
  onViewExpense,
  onEditExpense,
}) => {
  const { expenses, settings, deleteExpense } = useCrm();
  const sym = settings.currencySymbol || '€';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'this_month' | 'today'>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Category
      if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;

      // Period
      if (periodFilter === 'today' && e.date !== todayStr) return false;
      if (periodFilter === 'this_month' && !e.date.startsWith(currentMonthStr)) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.expenseNumber.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.beneficiary && e.beneficiary.toLowerCase().includes(q)) ||
          (e.vehicleInfo && e.vehicleInfo.toLowerCase().includes(q)) ||
          (e.receiptUrl && e.receiptUrl.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [expenses, selectedCategory, periodFilter, searchQuery, todayStr, currentMonthStr]);

  const totalFilteredAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
            Registre des Dépenses & Charges
          </h2>
          <p className="text-xs text-[#7A7A72]">
            Total filtré : <span className="font-bold text-red-600">{totalFilteredAmount.toLocaleString('fr-FR')} {sym}</span> ({filteredExpenses.length} charges réelles)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-add-expense"
            onClick={onOpenAddExpense}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Enregistrer une dépense</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#9A9A92] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher dépense, fournisseur, réf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A]"
            >
              <option value="all">Toutes les catégories de charge</option>
              {CATEGORY_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs">
            <button
              onClick={() => setPeriodFilter('all')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                periodFilter === 'all' ? 'bg-white shadow-xs text-[#1A1A18] font-bold' : 'text-[#7A7A72]'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setPeriodFilter('this_month')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                periodFilter === 'this_month' ? 'bg-white shadow-xs text-[#1A1A18] font-bold' : 'text-[#7A7A72]'
              }`}
            >
              Ce mois
            </button>
            <button
              onClick={() => setPeriodFilter('today')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                periodFilter === 'today' ? 'bg-white shadow-xs text-[#1A1A18] font-bold' : 'text-[#7A7A72]'
              }`}
            >
              Aujourd'hui
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredExpenses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E5E5DF]">
          <Receipt className="w-10 h-10 text-[#9A9A92] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-[#1A1A18]">
            Aucune donnée comptable disponible
          </h3>
          <p className="text-xs text-[#7A7A72] max-w-sm mx-auto mt-1 mb-4">
            Enregistrez les frais de carburant, entretien, assurance, salaires ou loyers pour suivre vos dépenses réelles.
          </p>
          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
          >
            Commencer à enregistrer des opérations
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5DF] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF8] border-b border-[#E5E5DF] text-[#7A7A72] uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Référence</th>
                  <th className="px-4 py-3.5">Catégorie</th>
                  <th className="px-4 py-3.5">Description & Fournisseur</th>
                  <th className="px-4 py-3.5">Véhicule</th>
                  <th className="px-4 py-3.5">Justificatif</th>
                  <th className="px-4 py-3.5">Règlement</th>
                  <th className="px-4 py-3.5 text-right">Montant</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC]">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1A1A18] whitespace-nowrap">
                      {new Date(exp.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#1A1A18] whitespace-nowrap">
                      {exp.expenseNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#1A1A18] block">{exp.description}</span>
                      {exp.beneficiary && (
                        <span className="text-[11px] text-[#7A7A72] block">
                          Fournisseur : {exp.beneficiary}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#7A7A72] whitespace-nowrap">
                      {exp.vehicleInfo ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#2D2D2A] bg-[#FAFAF8] px-2 py-0.5 rounded-md border border-[#E5E5DF]">
                          <Car className="w-3 h-3 text-[#7A7A72]" />
                          <span>{exp.vehicleInfo}</span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#7A7A72] whitespace-nowrap">
                      {exp.receiptUrl ? (
                        <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {exp.receiptUrl}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#7A7A72] whitespace-nowrap">
                      {exp.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600 whitespace-nowrap text-sm">
                      -{exp.amount.toLocaleString('fr-FR')} {sym}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewExpense(exp)}
                          title="Voir le justificatif"
                          className="p-1.5 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0F0EC] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditExpense(exp)}
                          title="Modifier"
                          className="p-1.5 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0F0EC] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer la dépense ${exp.expenseNumber} ?`)) {
                              deleteExpense(exp.id);
                            }
                          }}
                          title="Supprimer"
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
