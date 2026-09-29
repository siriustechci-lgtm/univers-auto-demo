import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Expense, ExpenseCategory } from '../../types';
import {
  Receipt,
  Plus,
  BarChart3,
  List,
  Layers,
  TrendingDown,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { ExpensesListTab } from './ExpensesListTab';
import { ExpensesDashboardTab } from './ExpensesDashboardTab';
import { ExpensesCategoriesTab } from './ExpensesCategoriesTab';
import { AddExpenseModal } from './AddExpenseModal';
import { ExpenseDetailModal } from './ExpenseDetailModal';

interface ExpensesViewProps {
  searchQuery?: string;
}

type ExpenseTab = 'list' | 'dashboard' | 'categories';

export const ExpensesView: React.FC<ExpensesViewProps> = ({ searchQuery = '' }) => {
  const { expenses, settings, deleteExpense } = useCrm();
  const sym = settings.currencySymbol || '€';

  const [activeSubTab, setActiveSubTab] = useState<ExpenseTab>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [prefilledCategory, setPrefilledCategory] = useState<ExpenseCategory | undefined>(undefined);

  const totalExpensesAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const handleOpenAddModal = (cat?: ExpenseCategory) => {
    setExpenseToEdit(null);
    setPrefilledCategory(cat);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (exp: Expense) => {
    setExpenseToEdit(exp);
    setIsAddModalOpen(true);
  };

  const handleOpenDetailModal = (exp: Expense) => {
    setSelectedExpense(exp);
    setIsDetailModalOpen(true);
  };

  const handleSelectCategoryFromCategoriesTab = (catName: string) => {
    setFilterCategory(catName);
    setActiveSubTab('list');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header View Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E5DF] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1A1A18] font-['Outfit']">
                Gestion des Dépenses & Charges
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-50 border border-red-200 text-red-700 font-mono">
                {expenses.length} dépense{expenses.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-[#7A7A72] mt-0.5">
              Enregistrement ultra-rapide des charges réelles de l'agence et contrôle de la rentabilité
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right pr-3 border-r border-[#E5E5DF]">
            <span className="text-[10px] text-[#7A7A72] uppercase font-semibold block">Total charges décaissées</span>
            <span className="text-base font-bold text-red-600 font-mono">
              -{totalExpensesAmount.toLocaleString('fr-FR')} {sym}
            </span>
          </div>

          <button
            id="btn-header-new-expense"
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle dépense</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E5DF] pb-2 overflow-x-auto">
        <button
          onClick={() => {
            setActiveSubTab('list');
            setFilterCategory('all');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'list'
              ? 'bg-[#2D2D2A] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-white'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Liste des dépenses</span>
          {expenses.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeSubTab === 'list' ? 'bg-white/20 text-white' : 'bg-[#EAEAE5] text-[#2D2D2A]'
              }`}
            >
              {expenses.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'dashboard'
              ? 'bg-[#2D2D2A] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Tableau de bord & Analyse</span>
        </button>

        <button
          onClick={() => setActiveSubTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'categories'
              ? 'bg-[#2D2D2A] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catégories de dépenses</span>
        </button>
      </div>

      {/* Sub-Tab Content */}
      {activeSubTab === 'list' && (
        <ExpensesListTab
          onOpenAddExpense={() => handleOpenAddModal()}
          onOpenExpenseDetail={handleOpenDetailModal}
          onOpenEditExpense={handleOpenEditModal}
          initialCategoryFilter={filterCategory}
          searchQuery={searchQuery}
        />
      )}

      {activeSubTab === 'dashboard' && (
        <ExpensesDashboardTab
          onOpenAddExpense={() => handleOpenAddModal()}
          onSelectCategoryFilter={(cat) => {
            setFilterCategory(cat);
            setActiveSubTab('list');
          }}
        />
      )}

      {activeSubTab === 'categories' && (
        <ExpensesCategoriesTab
          onSelectCategory={handleSelectCategoryFromCategoriesTab}
          onOpenAddExpenseWithCategory={(cat) => handleOpenAddModal(cat)}
        />
      )}

      {/* Modal: Add or Edit Expense */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setExpenseToEdit(null);
          setPrefilledCategory(undefined);
        }}
        expenseToEdit={expenseToEdit}
        initialCategory={prefilledCategory}
      />

      {/* Modal: Expense Details & Printable Receipt */}
      <ExpenseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onEdit={(exp) => {
          setIsDetailModalOpen(false);
          handleOpenEditModal(exp);
        }}
        onDelete={(id) => {
          deleteExpense(id);
          setIsDetailModalOpen(false);
        }}
      />
    </div>
  );
};
