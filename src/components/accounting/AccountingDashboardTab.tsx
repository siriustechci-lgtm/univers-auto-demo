import React from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  BadgePercent,
  KeyRound,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  PieChart,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AccountingDashboardTabProps {
  onOpenAddExpense: () => void;
  onOpenAddOtherRevenue: () => void;
  onNavigateTab: (tab: 'revenues' | 'expenses' | 'financial-result' | 'journal' | 'export') => void;
}

export const AccountingDashboardTab: React.FC<AccountingDashboardTabProps> = ({
  onOpenAddExpense,
  onOpenAddOtherRevenue,
  onNavigateTab,
}) => {
  const { sales, rentals, payments, expenses, otherRevenues, settings, vehicles } = useCrm();

  const sym = settings.currencySymbol || '€';
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  // 1. REVENUES
  const salesRevenue = sales.reduce((acc, s) => acc + (s.salePrice || 0), 0);
  const rentalsRevenue = rentals.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
  const otherRevenueTotal = otherRevenues.reduce((acc, r) => acc + (r.amount || 0), 0);
  const totalRevenue = salesRevenue + rentalsRevenue + otherRevenueTotal;

  // 2. PAYMENTS ENCAISSÉS (Cash Flow Entrées)
  const totalCashIn = payments.reduce((acc, p) => acc + (p.amount || 0), 0) + otherRevenueTotal;

  // 3. EXPENSES (Dépenses réelles)
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const expensesThisMonth = expenses
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  const expensesToday = expenses
    .filter((e) => e.date === todayStr)
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  // 4. COST OF GOODS (Achat des véhicules vendus pour calcul Bénéfice Brut)
  const soldVehiclesCost = sales.reduce((acc, s) => {
    const v = vehicles.find((veh) => veh.id === s.vehicleId);
    return acc + (v?.purchasePrice || 0);
  }, 0);

  // 5. RÉSULTATS
  // Bénéfice Brut = Revenus totaux - Prix d'achat des véhicules vendus
  const grossProfit = totalRevenue - soldVehiclesCost;
  // Bénéfice Net = Revenus totaux - Dépenses totales (ou - coûts d'achat - dépenses)
  const netProfit = totalRevenue - soldVehiclesCost - totalExpenses;
  // Solde de trésorerie disponible estimé = Entrées de trésorerie - Dépenses
  const cashBalance = totalCashIn - totalExpenses;

  // 6. EXPENSES BREAKDOWN BY CATEGORY
  const expenseCategoriesMap: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseCategoriesMap[e.category] = (expenseCategoriesMap[e.category] || 0) + e.amount;
  });
  const expenseCategoryList = Object.entries(expenseCategoriesMap)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const hasAnyData = sales.length > 0 || rentals.length > 0 || expenses.length > 0 || otherRevenues.length > 0 || payments.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Actions & KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenues Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#7A7A72] uppercase tracking-wider">
              Revenus Totaux
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A1A18] font-['Outfit']">
            {totalRevenue.toLocaleString('fr-FR')} {sym}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-[#7A7A72] border-t border-[#F0F0EC] pt-2">
            <span>Ventes: {salesRevenue.toLocaleString('fr-FR')} {sym}</span>
            <span>Loc: {rentalsRevenue.toLocaleString('fr-FR')} {sym}</span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#7A7A72] uppercase tracking-wider">
              Dépenses Totales
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 font-['Outfit']">
            {totalExpenses.toLocaleString('fr-FR')} {sym}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-[#7A7A72] border-t border-[#F0F0EC] pt-2">
            <span>Mois: {expensesThisMonth.toLocaleString('fr-FR')} {sym}</span>
            <span>Jour: {expensesToday.toLocaleString('fr-FR')} {sym}</span>
          </div>
        </div>

        {/* Bénéfice Net Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#7A7A72] uppercase tracking-wider">
              Bénéfice Net Estimé
            </span>
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              netProfit >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              {netProfit >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
          </div>
          <div className={`text-2xl font-black font-['Outfit'] ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString('fr-FR')} {sym}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-[#7A7A72] border-t border-[#F0F0EC] pt-2">
            <span>Bénéfice brut: {grossProfit.toLocaleString('fr-FR')} {sym}</span>
          </div>
        </div>

        {/* Solde Trésorerie Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#7A7A72] uppercase tracking-wider">
              Solde Trésorerie
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black font-['Outfit'] ${cashBalance >= 0 ? 'text-[#1A1A18]' : 'text-red-600'}`}>
            {cashBalance.toLocaleString('fr-FR')} {sym}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-[#7A7A72] border-t border-[#F0F0EC] pt-2">
            <span>Encaissé: {totalCashIn.toLocaleString('fr-FR')} {sym}</span>
            <span>Payé: {totalExpenses.toLocaleString('fr-FR')} {sym}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#FAFAF8] to-white border border-[#E5E5DF]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2D2D2A] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#1A1A18]">
              Comptabilité synchronisée en temps réel
            </h3>
            <p className="text-[11px] text-[#7A7A72]">
              Toutes les ventes, locations et encaissements mettent à jour automatiquement vos soldes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddOtherRevenue}
            className="px-3.5 py-2 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#F5F5F0] text-xs font-semibold text-[#2D2D2A] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Autre revenu</span>
          </button>
          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Enregistrer une dépense</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Revenue Composition & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Spans: Revenue Breakdown & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Breakdown */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1A1A18] font-['Outfit']">
                  Structure des Revenus
                </h3>
                <p className="text-xs text-[#7A7A72]">
                  Ventilation du chiffre d'affaires généré par votre activité
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('revenues')}
                className="text-xs font-semibold text-[#4A7A4A] hover:underline flex items-center gap-1"
              >
                <span>Détail revenus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Ventes */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#1A1A18]">
                    <BadgePercent className="w-3.5 h-3.5 text-[#4A7A4A]" />
                    <span>Ventes de véhicules ({sales.length})</span>
                  </span>
                  <span className="font-bold text-[#1A1A18]">
                    {salesRevenue.toLocaleString('fr-FR')} {sym}{' '}
                    <span className="text-[#7A7A72] font-normal">
                      ({totalRevenue > 0 ? Math.round((salesRevenue / totalRevenue) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F0F0EC] overflow-hidden">
                  <div
                    className="h-full bg-[#4A7A4A] rounded-full transition-all duration-500"
                    style={{ width: `${totalRevenue > 0 ? (salesRevenue / totalRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Locations */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#1A1A18]">
                    <KeyRound className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Contrats de location ({rentals.length})</span>
                  </span>
                  <span className="font-bold text-[#1A1A18]">
                    {rentalsRevenue.toLocaleString('fr-FR')} {sym}{' '}
                    <span className="text-[#7A7A72] font-normal">
                      ({totalRevenue > 0 ? Math.round((rentalsRevenue / totalRevenue) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F0F0EC] overflow-hidden">
                  <div
                    className="h-full bg-[#5A5A40] rounded-full transition-all duration-500"
                    style={{ width: `${totalRevenue > 0 ? (rentalsRevenue / totalRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Autres revenus */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#1A1A18]">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    <span>Prestations & Autres ({otherRevenues.length})</span>
                  </span>
                  <span className="font-bold text-[#1A1A18]">
                    {otherRevenueTotal.toLocaleString('fr-FR')} {sym}{' '}
                    <span className="text-[#7A7A72] font-normal">
                      ({totalRevenue > 0 ? Math.round((otherRevenueTotal / totalRevenue) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F0F0EC] overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${totalRevenue > 0 ? (otherRevenueTotal / totalRevenue) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts to Financial Statements */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigateTab('financial-result')}
              className="p-4 rounded-2xl border border-[#E5E5DF] bg-white hover:bg-[#FAFAF8] text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#4A7A4A]/10 text-[#4A7A4A] flex items-center justify-center mb-2.5">
                <PieChart className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#1A1A18] group-hover:text-[#4A7A4A] transition-colors">
                Résultat Financier (P&L)
              </h4>
              <p className="text-[11px] text-[#7A7A72] mt-0.5">
                Bilan périodique, marges d'exploitation et produits nets
              </p>
            </button>

            <button
              onClick={() => onNavigateTab('journal')}
              className="p-4 rounded-2xl border border-[#E5E5DF] bg-white hover:bg-[#FAFAF8] text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#1A1A18] group-hover:text-blue-700 transition-colors">
                Journal des Opérations
              </h4>
              <p className="text-[11px] text-[#7A7A72] mt-0.5">
                Grand livre chronologique de tous les mouvements
              </p>
            </button>

            <button
              onClick={() => onNavigateTab('export')}
              className="p-4 rounded-2xl border border-[#E5E5DF] bg-white hover:bg-[#FAFAF8] text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5">
                <Receipt className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#1A1A18] group-hover:text-purple-700 transition-colors">
                Export & Impression
              </h4>
              <p className="text-[11px] text-[#7A7A72] mt-0.5">
                Télécharger en PDF, Excel ou imprimer pour le comptable
              </p>
            </button>
          </div>
        </div>

        {/* Right 1 Span: Expenses by Category */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#1A1A18] font-['Outfit']">
                Répartition des Dépenses
              </h3>
              <p className="text-xs text-[#7A7A72]">
                Par catégorie de charges ({expenses.length} dépenses)
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {expenseCategoryList.length === 0 ? (
            <div className="py-8 text-center bg-[#FAFAF8] rounded-xl border border-dashed border-[#E5E5DF]">
              <Receipt className="w-8 h-8 text-[#9A9A92] mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium text-[#7A7A72]">Aucune dépense enregistrée</p>
              <button
                onClick={onOpenAddExpense}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une charge</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenseCategoryList.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#2D2D2A]">{item.category}</span>
                    <span className="font-bold text-[#1A1A18]">
                      {item.amount.toLocaleString('fr-FR')} {sym}{' '}
                      <span className="text-[#7A7A72] font-normal">
                        ({Math.round(item.percentage)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F0F0EC] overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
