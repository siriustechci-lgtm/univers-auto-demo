import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Expense, OtherRevenue } from '../../types';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  PieChart,
  Calendar,
  FileSpreadsheet,
  Plus,
  Sparkles,
} from 'lucide-react';
import { AccountingDashboardTab } from './AccountingDashboardTab';
import { AccountingRevenuesTab } from './AccountingRevenuesTab';
import { AccountingExpensesTab } from './AccountingExpensesTab';
import { AccountingFinancialResultTab } from './AccountingFinancialResultTab';
import { AccountingJournalTab } from './AccountingJournalTab';
import { AccountingExportTab } from './AccountingExportTab';
import { AddExpenseModal } from './AddExpenseModal';
import { AddOtherRevenueModal } from './AddOtherRevenueModal';
import { ExpenseDetailModal } from './ExpenseDetailModal';

type SubTab = 'dashboard' | 'revenues' | 'expenses' | 'financial-result' | 'journal' | 'export';

interface AccountingViewProps {
  searchQuery?: string;
}

export const AccountingView: React.FC<AccountingViewProps> = () => {
  const { expenses, otherRevenues, sales, rentals, payments, deleteExpense } = useCrm();

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('dashboard');

  // Modal States
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [isAddOtherRevenueOpen, setIsAddOtherRevenueOpen] = useState(false);
  const [revenueToEdit, setRevenueToEdit] = useState<OtherRevenue | null>(null);

  const [isExpenseDetailOpen, setIsExpenseDetailOpen] = useState(false);
  const [expenseDetailToView, setExpenseDetailToView] = useState<Expense | null>(null);

  const handleOpenAddExpense = (exp?: Expense | null) => {
    setExpenseToEdit(exp || null);
    setIsAddExpenseOpen(true);
  };

  const handleOpenAddOtherRevenue = (rev?: OtherRevenue | null) => {
    setRevenueToEdit(rev || null);
    setIsAddOtherRevenueOpen(true);
  };

  const handleViewExpense = (exp: Expense) => {
    setExpenseDetailToView(exp);
    setIsExpenseDetailOpen(true);
  };

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'revenues', label: 'Revenus', icon: TrendingUp, count: sales.length + rentals.length + otherRevenues.length },
    { id: 'expenses', label: 'Dépenses', icon: Receipt, count: expenses.length },
    { id: 'financial-result', label: 'Résultat financier', icon: PieChart },
    { id: 'journal', label: 'Journal des opérations', icon: Calendar },
    { id: 'export', label: 'Export & Impression', icon: FileSpreadsheet },
  ];

  return (
    <div id="accounting-main-view" className="space-y-6">
      {/* Top Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-[#E5E5DF] rounded-2xl shadow-xs overflow-x-auto">
        {navItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-accounting-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#2D2D2A] text-white shadow-xs'
                  : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#FAFAF8]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#7A7A72]'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F0F0EC] text-[#7A7A72]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub Views */}
      {activeSubTab === 'dashboard' && (
        <AccountingDashboardTab
          onOpenAddExpense={() => handleOpenAddExpense(null)}
          onOpenAddOtherRevenue={() => handleOpenAddOtherRevenue(null)}
          onNavigateTab={(tab) => setActiveSubTab(tab)}
        />
      )}

      {activeSubTab === 'revenues' && (
        <AccountingRevenuesTab
          onOpenAddOtherRevenue={() => handleOpenAddOtherRevenue(null)}
          onEditOtherRevenue={(rev) => handleOpenAddOtherRevenue(rev)}
        />
      )}

      {activeSubTab === 'expenses' && (
        <AccountingExpensesTab
          onOpenAddExpense={() => handleOpenAddExpense(null)}
          onViewExpense={handleViewExpense}
          onEditExpense={(exp) => handleOpenAddExpense(exp)}
        />
      )}

      {activeSubTab === 'financial-result' && <AccountingFinancialResultTab />}

      {activeSubTab === 'journal' && <AccountingJournalTab />}

      {activeSubTab === 'export' && <AccountingExportTab />}

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
      />

      <AddOtherRevenueModal
        isOpen={isAddOtherRevenueOpen}
        onClose={() => {
          setIsAddOtherRevenueOpen(false);
          setRevenueToEdit(null);
        }}
        revenueToEdit={revenueToEdit}
      />

      <ExpenseDetailModal
        isOpen={isExpenseDetailOpen}
        onClose={() => {
          setIsExpenseDetailOpen(false);
          setExpenseDetailToView(null);
        }}
        expense={expenseDetailToView}
        onEdit={(exp) => {
          setIsExpenseDetailOpen(false);
          handleOpenAddExpense(exp);
        }}
        onDelete={(id) => {
          deleteExpense(id);
          setIsExpenseDetailOpen(false);
        }}
      />
    </div>
  );
};
