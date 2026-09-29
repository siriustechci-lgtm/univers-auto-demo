import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  PieChart,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  BadgePercent,
  KeyRound,
  Filter,
  CheckCircle2,
  DollarSign,
  Layers,
} from 'lucide-react';

export const AccountingFinancialResultTab: React.FC = () => {
  const { sales, rentals, otherRevenues, expenses, vehicles, settings } = useCrm();
  const sym = settings.currencySymbol || '€';

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Date range evaluation
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Start of week (Monday)
  const currentDayOfWeek = now.getDay() || 7;
  const startOfWeekDate = new Date(now);
  startOfWeekDate.setDate(now.getDate() - currentDayOfWeek + 1);
  const startOfWeekStr = startOfWeekDate.toISOString().split('T')[0];

  // Start of month
  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  // Start of year
  const startOfYearStr = `${now.getFullYear()}-01-01`;

  const isDateInPeriod = (dateStr: string) => {
    if (!dateStr) return false;
    const d = dateStr.split('T')[0];

    switch (period) {
      case 'today':
        return d === todayStr;
      case 'week':
        return d >= startOfWeekStr && d <= todayStr;
      case 'month':
        return d >= startOfMonthStr && d <= todayStr;
      case 'year':
        return d >= startOfYearStr && d <= todayStr;
      case 'custom':
        if (customStartDate && d < customStartDate) return false;
        if (customEndDate && d > customEndDate) return false;
        return true;
      default:
        return true;
    }
  };

  // Filtered dataset
  const periodSales = useMemo(() => sales.filter((s) => isDateInPeriod(s.saleDate)), [sales, period, customStartDate, customEndDate]);
  const periodRentals = useMemo(() => rentals.filter((r) => isDateInPeriod(r.startDate)), [rentals, period, customStartDate, customEndDate]);
  const periodOtherRevenues = useMemo(() => otherRevenues.filter((r) => isDateInPeriod(r.date)), [otherRevenues, period, customStartDate, customEndDate]);
  const periodExpenses = useMemo(() => expenses.filter((e) => isDateInPeriod(e.date)), [expenses, period, customStartDate, customEndDate]);

  // Financial Calculations
  const salesRevenue = periodSales.reduce((acc, s) => acc + (s.salePrice || 0), 0);
  const rentalsRevenue = periodRentals.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
  const otherRevenue = periodOtherRevenues.reduce((acc, r) => acc + (r.amount || 0), 0);
  const totalRevenue = salesRevenue + rentalsRevenue + otherRevenue;

  // Cost of sold vehicles
  const soldVehiclesCost = periodSales.reduce((acc, s) => {
    const v = vehicles.find((veh) => veh.id === s.vehicleId);
    return acc + (v?.purchasePrice || 0);
  }, 0);

  // Expenses breakdown by category
  const expenseCategories = useMemo(() => {
    const map: Record<string, number> = {};
    periodExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [periodExpenses]);

  const totalExpenses = periodExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Results
  const grossProfit = totalRevenue - soldVehiclesCost;
  const netProfit = totalRevenue - soldVehiclesCost - totalExpenses;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const hasData = periodSales.length > 0 || periodRentals.length > 0 || periodOtherRevenues.length > 0 || periodExpenses.length > 0;

  return (
    <div className="space-y-6">
      {/* Header & Period Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
            Compte de Résultat Simplifié (P&L)
          </h2>
          <p className="text-xs text-[#7A7A72]">
            Synthèse comptable des produits, charges et bénéfice net d'exploitation
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#FAFAF8] border border-[#E5E5DF] rounded-2xl text-xs">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              period === 'today' ? 'bg-[#2D2D2A] text-white shadow-xs font-semibold' : 'text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            Jour
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              period === 'week' ? 'bg-[#2D2D2A] text-white shadow-xs font-semibold' : 'text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              period === 'month' ? 'bg-[#2D2D2A] text-white shadow-xs font-semibold' : 'text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            Mois
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              period === 'year' ? 'bg-[#2D2D2A] text-white shadow-xs font-semibold' : 'text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            Année
          </button>
          <button
            onClick={() => setPeriod('custom')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              period === 'custom' ? 'bg-[#2D2D2A] text-white shadow-xs font-semibold' : 'text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            Personnalisé
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {period === 'custom' && (
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-[#1A1A18]">Période d'analyse :</span>
          <div className="flex items-center gap-2">
            <span>Du</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Au</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs"
            />
          </div>
        </div>
      )}

      {/* Top 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Revenues */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
          <span className="text-xs font-semibold text-[#7A7A72] uppercase tracking-wider block mb-1">
            Revenus d'Exploitation
          </span>
          <div className="text-2xl font-black text-emerald-700 font-['Outfit']">
            +{totalRevenue.toLocaleString('fr-FR')} {sym}
          </div>
          <p className="text-xs text-[#7A7A72] mt-1.5">
            {periodSales.length} ventes, {periodRentals.length} locations, {periodOtherRevenues.length} autres
          </p>
        </div>

        {/* Total Expenses & Cost */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
          <span className="text-xs font-semibold text-[#7A7A72] uppercase tracking-wider block mb-1">
            Charges Totales & Achats
          </span>
          <div className="text-2xl font-black text-red-600 font-['Outfit']">
            -{(totalExpenses + soldVehiclesCost).toLocaleString('fr-FR')} {sym}
          </div>
          <p className="text-xs text-[#7A7A72] mt-1.5">
            Dépenses : {totalExpenses.toLocaleString('fr-FR')} {sym} | Achats stock : {soldVehiclesCost.toLocaleString('fr-FR')} {sym}
          </p>
        </div>

        {/* Net Profit */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
          <span className="text-xs font-semibold text-[#7A7A72] uppercase tracking-wider block mb-1">
            Bénéfice Net Estimé
          </span>
          <div className={`text-2xl font-black font-['Outfit'] ${netProfit >= 0 ? 'text-[#1A1A18]' : 'text-red-600'}`}>
            {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString('fr-FR')} {sym}
          </div>
          <p className="text-xs text-[#7A7A72] mt-1.5">
            Marge nette : <span className="font-bold text-[#1A1A18]">{netMargin.toFixed(1)}%</span>
          </p>
        </div>
      </div>

      {/* Detailed Financial Statement Statement Table */}
      {!hasData ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E5E5DF]">
          <PieChart className="w-10 h-10 text-[#9A9A92] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-[#1A1A18]">
            Aucune opération enregistrée pour cette période
          </h3>
          <p className="text-xs text-[#7A7A72] max-w-sm mx-auto mt-1">
            Modifiez le filtre de période ou enregistrez de nouvelles ventes, locations ou dépenses pour consulter le compte de résultat.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5DF] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E5DF] bg-[#FAFAF8] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1A1A18] font-['Outfit']">
              Bilan Détaillé des Flux d'Exploitation
            </h3>
            <span className="text-xs font-mono font-semibold text-[#7A7A72]">
              Période : {period.toUpperCase()}
            </span>
          </div>

          <div className="p-6 space-y-6 text-xs">
            {/* 1. PRODUITS D'EXPLOITATION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold text-sm text-[#1A1A18] border-b pb-2 border-[#E5E5DF]">
                <span className="text-emerald-800 uppercase tracking-wide text-xs">
                  1. PRODUITS D'EXPLOITATION (REVENUS)
                </span>
                <span className="text-emerald-700">+{totalRevenue.toLocaleString('fr-FR')} {sym}</span>
              </div>

              <div className="pl-4 space-y-1.5 text-[#2D2D2A]">
                <div className="flex justify-between py-1 border-b border-[#F5F5F0]">
                  <span className="flex items-center gap-2">
                    <BadgePercent className="w-3.5 h-3.5 text-[#4A7A4A]" />
                    <span>Chiffre d'affaires Ventes de véhicules ({periodSales.length} opérations)</span>
                  </span>
                  <span className="font-semibold">{salesRevenue.toLocaleString('fr-FR')} {sym}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#F5F5F0]">
                  <span className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Chiffre d'affaires Locations ({periodRentals.length} contrats)</span>
                  </span>
                  <span className="font-semibold">{rentalsRevenue.toLocaleString('fr-FR')} {sym}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#F5F5F0]">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    <span>Prestations annexes & Autres revenus ({periodOtherRevenues.length} opérations)</span>
                  </span>
                  <span className="font-semibold">{otherRevenue.toLocaleString('fr-FR')} {sym}</span>
                </div>
              </div>
            </div>

            {/* 2. COÛT DES VÉHICULES VENDUS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold text-sm text-[#1A1A18] border-b pb-2 border-[#E5E5DF]">
                <span className="text-stone-700 uppercase tracking-wide text-xs">
                  2. COÛT D'ACHAT DES MARCHANDISES VENDUES
                </span>
                <span className="text-stone-700">-{soldVehiclesCost.toLocaleString('fr-FR')} {sym}</span>
              </div>

              <div className="pl-4 space-y-1.5 text-[#2D2D2A]">
                <div className="flex justify-between py-1 border-b border-[#F5F5F0]">
                  <span>Prix d'achat initial des véhicules vendus dans la période</span>
                  <span className="font-semibold">-{soldVehiclesCost.toLocaleString('fr-FR')} {sym}</span>
                </div>
              </div>
            </div>

            {/* INTERMÉDIAIRE: MARGE / BÉNÉFICE BRUT */}
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex justify-between items-center text-xs font-bold">
              <span className="text-emerald-900 uppercase">
                = BÉNÉFICE BRUT (PRODUITS - ACHATS STOCKS)
              </span>
              <span className="text-sm font-black text-emerald-800">
                {grossProfit.toLocaleString('fr-FR')} {sym}
              </span>
            </div>

            {/* 3. CHARGES D'EXPLOITATION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold text-sm text-[#1A1A18] border-b pb-2 border-[#E5E5DF]">
                <span className="text-red-700 uppercase tracking-wide text-xs">
                  3. CHARGES D'EXPLOITATION (DÉPENSES)
                </span>
                <span className="text-red-600">-{totalExpenses.toLocaleString('fr-FR')} {sym}</span>
              </div>

              <div className="pl-4 space-y-1.5 text-[#2D2D2A]">
                {Object.keys(expenseCategories).length === 0 ? (
                  <div className="py-1 text-[#7A7A72] italic">Aucune dépense enregistrée sur cette période</div>
                ) : (
                  Object.entries(expenseCategories).map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between py-1 border-b border-[#F5F5F0]">
                      <span>{cat}</span>
                      <span className="font-semibold text-red-600">-{(amt as number).toLocaleString()} {sym}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RÉSULTAT FINAL: BÉNÉFICE NET */}
            <div className="p-4 bg-[#2D2D2A] text-white rounded-xl shadow-xs flex justify-between items-center text-sm font-bold">
              <div>
                <span className="uppercase tracking-wider block text-xs text-white/70">
                  RÉSULTAT NET D'EXPLOITATION (BÉNÉFICE NET)
                </span>
                <span className="text-[11px] text-emerald-400 font-normal">
                  Marge d'exploitation : {netMargin.toFixed(1)}%
                </span>
              </div>
              <span className="text-xl font-black text-white font-['Outfit']">
                {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString('fr-FR')} {sym}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
