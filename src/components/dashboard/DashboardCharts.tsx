import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  BadgePercent,
  KeyRound,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

type MetricType = 'revenue' | 'activity';
type PeriodType = 'day' | 'week' | 'month' | 'year';

export const DashboardCharts: React.FC<{
  onOpenSaleModal: () => void;
  onOpenRentalModal: () => void;
}> = ({ onOpenSaleModal, onOpenRentalModal }) => {
  const { sales, rentals, payments, settings } = useCrm();

  const [metric, setMetric] = useState<MetricType>('revenue');
  const [period, setPeriod] = useState<PeriodType>('month');

  const totalOperations = sales.length + rentals.length + payments.length;

  // Compute chart buckets based strictly on REAL data
  const chartData = useMemo(() => {
    if (totalOperations === 0) return [];

    const now = new Date();
    const buckets: { label: string; salesVal: number; rentalsVal: number; totalVal: number }[] = [];

    if (period === 'day') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

        const daySales = sales.filter((s) => (s.saleDate || s.createdAt || '').startsWith(dateStr));
        const dayRentals = rentals.filter((r) => (r.startDate || r.createdAt || '').startsWith(dateStr));

        if (metric === 'revenue') {
          const sVal = daySales.reduce((acc, s) => acc + s.totalAmount, 0);
          const rVal = dayRentals.reduce((acc, r) => acc + r.totalAmount, 0);
          buckets.push({ label: dayLabel, salesVal: sVal, rentalsVal: rVal, totalVal: sVal + rVal });
        } else {
          buckets.push({
            label: dayLabel,
            salesVal: daySales.length,
            rentalsVal: dayRentals.length,
            totalVal: daySales.length + dayRentals.length,
          });
        }
      }
    } else if (period === 'week') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekLabel = `S-${i === 0 ? 'Actuelle' : i}`;
        const endDay = new Date(now);
        endDay.setDate(now.getDate() - i * 7);
        const startDay = new Date(endDay);
        startDay.setDate(endDay.getDate() - 6);

        const startTime = startDay.getTime();
        const endTime = endDay.getTime() + 86400000;

        const wSales = sales.filter((s) => {
          const t = new Date(s.saleDate || s.createdAt).getTime();
          return t >= startTime && t <= endTime;
        });

        const wRentals = rentals.filter((r) => {
          const t = new Date(r.startDate || r.createdAt).getTime();
          return t >= startTime && t <= endTime;
        });

        if (metric === 'revenue') {
          const sVal = wSales.reduce((acc, s) => acc + s.totalAmount, 0);
          const rVal = wRentals.reduce((acc, r) => acc + r.totalAmount, 0);
          buckets.push({ label: weekLabel, salesVal: sVal, rentalsVal: rVal, totalVal: sVal + rVal });
        } else {
          buckets.push({
            label: weekLabel,
            salesVal: wSales.length,
            rentalsVal: wRentals.length,
            totalVal: wSales.length + wRentals.length,
          });
        }
      }
    } else if (period === 'month') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const m = d.getMonth();
        const y = d.getFullYear();
        const mLabel = d.toLocaleDateString('fr-FR', { month: 'short' });

        const mSales = sales.filter((s) => {
          const sd = new Date(s.saleDate || s.createdAt);
          return sd.getFullYear() === y && sd.getMonth() === m;
        });

        const mRentals = rentals.filter((r) => {
          const rd = new Date(r.startDate || r.createdAt);
          return rd.getFullYear() === y && rd.getMonth() === m;
        });

        if (metric === 'revenue') {
          const sVal = mSales.reduce((acc, s) => acc + s.totalAmount, 0);
          const rVal = mRentals.reduce((acc, r) => acc + r.totalAmount, 0);
          buckets.push({ label: mLabel, salesVal: sVal, rentalsVal: rVal, totalVal: sVal + rVal });
        } else {
          buckets.push({
            label: mLabel,
            salesVal: mSales.length,
            rentalsVal: mRentals.length,
            totalVal: mSales.length + mRentals.length,
          });
        }
      }
    } else {
      // Last 3 years
      for (let i = 2; i >= 0; i--) {
        const y = now.getFullYear() - i;
        const yLabel = `${y}`;

        const ySales = sales.filter((s) => {
          const sd = new Date(s.saleDate || s.createdAt);
          return sd.getFullYear() === y;
        });

        const yRentals = rentals.filter((r) => {
          const rd = new Date(r.startDate || r.createdAt);
          return rd.getFullYear() === y;
        });

        if (metric === 'revenue') {
          const sVal = ySales.reduce((acc, s) => acc + s.totalAmount, 0);
          const rVal = yRentals.reduce((acc, r) => acc + r.totalAmount, 0);
          buckets.push({ label: yLabel, salesVal: sVal, rentalsVal: rVal, totalVal: sVal + rVal });
        } else {
          buckets.push({
            label: yLabel,
            salesVal: ySales.length,
            rentalsVal: yRentals.length,
            totalVal: ySales.length + yRentals.length,
          });
        }
      }
    }

    return buckets;
  }, [sales, rentals, payments, metric, period, totalOperations]);

  const maxVal = Math.max(...chartData.map((b) => b.totalVal), 1);

  return (
    <div
      id="dashboard-charts-card"
      className="rounded-2xl border border-[#E5E5DF] bg-white p-5 flex flex-col shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
              Graphiques d'activité & performance
            </h3>
          </div>
          <p className="text-xs text-[#7A7A72] mt-0.5">
            Évolution comparative des flux commerciaux
          </p>
        </div>

        {/* Metric & Period Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector */}
          <div className="inline-flex rounded-lg border border-[#E5E5DF] bg-[#FAFAF8] p-0.5 text-xs">
            <button
              onClick={() => setMetric('revenue')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                metric === 'revenue'
                  ? 'bg-white text-[#1A1A18] shadow-xs'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              Revenus ({settings.currencySymbol})
            </button>
            <button
              onClick={() => setMetric('activity')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                metric === 'activity'
                  ? 'bg-white text-[#1A1A18] shadow-xs'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              Volume d'activité
            </button>
          </div>

          {/* Period Selector */}
          <div className="inline-flex rounded-lg border border-[#E5E5DF] bg-[#FAFAF8] p-0.5 text-xs">
            {(['day', 'week', 'month', 'year'] as PeriodType[]).map((p) => {
              const labels: Record<PeriodType, string> = {
                day: 'Jour',
                week: 'Semaine',
                month: 'Mois',
                year: 'Année',
              };
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    period === p
                      ? 'bg-[#1A1A18] text-white'
                      : 'text-[#7A7A72] hover:text-[#1A1A18]'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {totalOperations === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] min-h-[220px]">
          <BarChart3 className="w-10 h-10 text-[#9A9A92] mb-3" />
          <p className="text-sm font-semibold text-[#1A1A18]">
            Les statistiques apparaîtront après vos premières opérations.
          </p>
          <p className="text-xs text-[#7A7A72] mt-1 max-w-md">
            Enregistrez une première vente, un contrat de location ou un paiement pour visualiser les courbes et répartitions financières en temps réel.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={onOpenSaleModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4A7A4A] text-white text-xs font-semibold hover:bg-[#3E663E] transition-colors cursor-pointer shadow-xs"
            >
              <BadgePercent className="w-3.5 h-3.5" />
              <span>Créer une vente</span>
            </button>
            <button
              onClick={onOpenRentalModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5A5A40] text-white text-xs font-semibold hover:bg-[#484832] transition-colors cursor-pointer shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Créer une location</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Chart Legend */}
          <div className="flex items-center justify-between text-xs pb-1 border-b border-[#E5E5DF]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#4A7A4A]" />
                <span className="text-[#7A7A72]">Ventes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#5A5A40]" />
                <span className="text-[#7A7A72]">Locations</span>
              </div>
            </div>
            <span className="text-[11px] text-[#9A9A92]">Données réelles certifiées</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="grid grid-flow-col auto-cols-fr gap-3 items-end h-44 pt-4 px-2">
            {chartData.map((item, idx) => {
              const salesHeight = maxVal > 0 ? (item.salesVal / maxVal) * 100 : 0;
              const rentalsHeight = maxVal > 0 ? (item.rentalsVal / maxVal) * 100 : 0;

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  {/* Tooltip / value preview on hover */}
                  <div className="text-[10px] font-mono font-bold text-[#1A1A18] opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                    {metric === 'revenue'
                      ? `${item.totalVal.toLocaleString('fr-FR')} ${settings.currencySymbol}`
                      : `${item.totalVal} op.`}
                  </div>

                  {/* Stacked bar */}
                  <div className="w-full max-w-[36px] bg-[#EAEAE5] rounded-t-md overflow-hidden flex flex-col-reverse h-32 relative">
                    <div
                      className="bg-[#4A7A4A] transition-all duration-300 w-full"
                      style={{ height: `${salesHeight}%` }}
                      title={`Ventes: ${item.salesVal}`}
                    />
                    <div
                      className="bg-[#5A5A40] transition-all duration-300 w-full"
                      style={{ height: `${rentalsHeight}%` }}
                      title={`Locations: ${item.rentalsVal}`}
                    />
                  </div>

                  {/* X-axis Label */}
                  <span className="text-[11px] text-[#7A7A72] font-medium mt-2 truncate max-w-[50px]">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
