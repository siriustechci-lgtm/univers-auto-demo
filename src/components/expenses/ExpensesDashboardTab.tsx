import React, { useMemo, useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { ExpenseCategory } from '../../types';
import {
  TrendingDown,
  Calendar,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  Receipt,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

interface ExpensesDashboardTabProps {
  onOpenAddExpense: () => void;
  onSelectCategoryFilter?: (cat: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Carburant: '#F59E0B', // Amber
  Entretien: '#3B82F6', // Blue
  Réparation: '#EC4899', // Pink
  Assurance: '#10B981', // Emerald
  Salaires: '#8B5CF6', // Purple
  Loyer: '#6366F1', // Indigo
  Électricité: '#EAB308', // Yellow
  Eau: '#06B6D4', // Cyan
  Internet: '#14B8A6', // Teal
  Marketing: '#F43F5E', // Rose
  Fournitures: '#64748B', // Slate
  Taxes: '#D97706', // Orange
  Autres: '#78716C', // Stone
  Maintenance: '#3B82F6',
  'Autres dépenses': '#78716C',
};

const DEFAULT_COLOR = '#A8A29E';

export const ExpensesDashboardTab: React.FC<ExpensesDashboardTabProps> = ({
  onOpenAddExpense,
  onSelectCategoryFilter,
}) => {
  const { expenses, settings } = useCrm();
  const sym = settings.currencySymbol || '€';

  const [periodFilter, setPeriodFilter] = useState<'all' | 'year' | 'month' | 'week'>('month');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentMonthStr = today.toISOString().slice(0, 7);
  const currentYearStr = today.getFullYear().toString();

  // Date ranges
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  // Calculations for KPI cards
  const todayExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses, todayStr]);

  const monthExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.date && e.date.startsWith(currentMonthStr))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses, currentMonthStr]);

  const yearExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.date && e.date.startsWith(currentYearStr))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses, currentYearStr]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  // Filtered dataset for charts
  const chartExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (periodFilter === 'week') return e.date >= startOfWeekStr && e.date <= todayStr;
      if (periodFilter === 'month') return e.date.startsWith(currentMonthStr);
      if (periodFilter === 'year') return e.date.startsWith(currentYearStr);
      return true;
    });
  }, [expenses, periodFilter, startOfWeekStr, todayStr, currentMonthStr, currentYearStr]);

  // Breakdown by Category
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    chartExpenses.forEach((e) => {
      const cat = e.category || 'Autres';
      map[cat] = (map[cat] || 0) + (e.amount || 0);
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || DEFAULT_COLOR,
      }))
      .sort((a, b) => b.value - a.value);
  }, [chartExpenses]);

  // Monthly breakdown for bar chart (Past 12 months)
  const monthlyTimelineData = useMemo(() => {
    const monthsMap: Record<string, number> = {};
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    // Initialize the last 6 or 12 months
    const curYear = today.getFullYear();
    for (let m = 0; m < 12; m++) {
      const key = `${curYear}-${String(m + 1).padStart(2, '0')}`;
      monthsMap[key] = 0;
    }

    expenses.forEach((e) => {
      const monthKey = e.date ? e.date.slice(0, 7) : '';
      if (monthsMap[monthKey] !== undefined) {
        monthsMap[monthKey] += e.amount || 0;
      }
    });

    return Object.entries(monthsMap).map(([key, amount]) => {
      const [_, m] = key.split('-');
      const monthIdx = parseInt(m, 10) - 1;
      return {
        key,
        mois: monthNames[monthIdx],
        montant: amount,
      };
    });
  }, [expenses, today]);

  // Top 5 Expenses
  const topExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 5);
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Top Action & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dépenses du jour */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A7A72]">
              Dépenses du jour
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A1A18] font-['Outfit']">
            {todayExpenses.toLocaleString('fr-FR')} {sym}
          </div>
          <div className="mt-2 text-[11px] text-[#7A7A72] flex items-center gap-1.5">
            <span>Aujourd'hui ({new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })})</span>
          </div>
        </div>

        {/* Dépenses du mois */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A7A72]">
              Dépenses du mois
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 font-['Outfit']">
            {monthExpenses.toLocaleString('fr-FR')} {sym}
          </div>
          <div className="mt-2 text-[11px] text-[#7A7A72]">
            Mois en cours ({new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })})
          </div>
        </div>

        {/* Dépenses de l'année */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A7A72]">
              Dépenses de l'année
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1A1A18] font-['Outfit']">
            {yearExpenses.toLocaleString('fr-FR')} {sym}
          </div>
          <div className="mt-2 text-[11px] text-[#7A7A72]">
            Exercice {currentYearStr}
          </div>
        </div>

        {/* Total des dépenses */}
        <div className="p-5 rounded-2xl bg-[#2D2D2A] text-white border border-[#2D2D2A] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Total des dépenses
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-['Outfit']">
            {totalExpenses.toLocaleString('fr-FR')} {sym}
          </div>
          <div className="mt-2 text-[11px] text-white/70 flex items-center justify-between">
            <span>{expenses.length} dépense{expenses.length > 1 ? 's' : ''} enregistrée{expenses.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Period Filter for Analytics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5E5DF]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1A18]">
          <Filter className="w-4 h-4 text-[#7A7A72]" />
          <span>Période d'analyse des graphiques :</span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-[#FAFAF8] rounded-xl border border-[#E5E5DF] text-xs">
          <button
            onClick={() => setPeriodFilter('week')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              periodFilter === 'week' ? 'bg-[#2D2D2A] text-white shadow-xs' : 'text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            Cette semaine
          </button>
          <button
            onClick={() => setPeriodFilter('month')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              periodFilter === 'month' ? 'bg-[#2D2D2A] text-white shadow-xs' : 'text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            Ce mois
          </button>
          <button
            onClick={() => setPeriodFilter('year')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              periodFilter === 'year' ? 'bg-[#2D2D2A] text-white shadow-xs' : 'text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            Cette année
          </button>
          <button
            onClick={() => setPeriodFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              periodFilter === 'all' ? 'bg-[#2D2D2A] text-white shadow-xs' : 'text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            Toutes
          </button>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dépenses par catégorie (Pie / Donut chart) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0F0EC] mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1A1A18] font-['Outfit']">
                Dépenses par catégorie
              </h3>
              <p className="text-[11px] text-[#7A7A72]">
                Répartition des charges sur la période sélectionnée
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#FAFAF8] flex items-center justify-center text-[#7A7A72]">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <Receipt className="w-10 h-10 text-[#D0D0C8] mb-2" />
              <p className="text-xs font-semibold text-[#1A1A18]">Aucune dépense sur cette période</p>
              <p className="text-[11px] text-[#7A7A72] mt-1 max-w-xs">
                Enregistrez une charge pour visualiser la répartition de vos coûts.
              </p>
              <button
                onClick={onOpenAddExpense}
                className="mt-4 px-3.5 py-1.5 rounded-xl bg-[#2D2D2A] hover:bg-[#1A1A18] text-white text-xs font-medium transition-colors"
              >
                + Ajouter une dépense
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${Number(value).toLocaleString('fr-FR')} ${sym}`, 'Montant']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E5E5DF',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {categoryData.map((item) => {
                  const total = categoryData.reduce((acc, c) => acc + c.value, 0);
                  const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                  return (
                    <button
                      key={item.name}
                      onClick={() => onSelectCategoryFilter && onSelectCategoryFilter(item.name)}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#FAFAF8] text-xs transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-[#1A1A18] group-hover:text-[#5A5A40]">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-[#7A7A72] font-mono">{pct}%</span>
                        <span className="font-bold text-[#1A1A18] font-mono">
                          {item.value.toLocaleString('fr-FR')} {sym}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Évolution temporelle des dépenses (Bar Chart annuel) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0F0EC] mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1A1A18] font-['Outfit']">
                Dépenses par période
              </h3>
              <p className="text-[11px] text-[#7A7A72]">
                Évolution mensuelle des charges engagées ({currentYearStr})
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#FAFAF8] flex items-center justify-center text-[#7A7A72]">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" vertical={false} />
                <XAxis dataKey="mois" stroke="#7A7A72" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5E5DF' }} />
                <YAxis stroke="#7A7A72" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5E5DF' }} />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString('fr-FR')} ${sym}`, 'Total dépenses']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E5DF',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="montant" fill="#E11D48" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-[#F0F0EC] flex items-center justify-between text-xs text-[#7A7A72]">
            <span>Total exercice {currentYearStr} :</span>
            <span className="font-bold text-[#1A1A18] font-mono">
              {yearExpenses.toLocaleString('fr-FR')} {sym}
            </span>
          </div>
        </div>
      </div>

      {/* Top 5 Dépenses récentes / majeures */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0F0EC] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1A18] font-['Outfit']">
                Principales charges enregistrées
              </h3>
              <p className="text-[11px] text-[#7A7A72]">
                Dépenses les plus significatives de l'agence
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAddExpense}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvelle dépense</span>
          </button>
        </div>

        {topExpenses.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#7A7A72]">
            Aucune dépense enregistrée dans le CRM.
          </div>
        ) : (
          <div className="divide-y divide-[#F0F0EC]">
            {topExpenses.map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between text-xs hover:bg-[#FAFAF8] px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAFAF8] border border-[#E5E5DF] flex items-center justify-center text-xs font-bold text-[#2D2D2A]">
                    {exp.category ? exp.category.charAt(0) : 'D'}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A1A18]">{exp.description}</div>
                    <div className="text-[11px] text-[#7A7A72] flex items-center gap-2">
                      <span className="font-mono">{exp.expenseNumber}</span>
                      <span>•</span>
                      <span>{exp.category}</span>
                      {exp.beneficiary && (
                        <>
                          <span>•</span>
                          <span>{exp.beneficiary}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-red-600 font-mono">
                    -{exp.amount.toLocaleString('fr-FR')} {sym}
                  </div>
                  <div className="text-[10px] text-[#7A7A72]">
                    {new Date(exp.date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
