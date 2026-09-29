import React from 'react';
import { FleetGlobalStats, VehicleExploitationStats } from '../../utils/fleetAnalytics';
import { AgencySettings } from '../../types';
import {
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Car,
  KeyRound,
  Wrench,
  DollarSign,
  ChevronRight,
  Shield,
  Fuel,
  Receipt,
  Percent,
} from 'lucide-react';

interface FleetProfitabilityAnalyticsProps {
  stats: FleetGlobalStats;
  settings: AgencySettings;
  onSelectVehicle: (vehicleStats: VehicleExploitationStats) => void;
}

export const FleetProfitabilityAnalytics: React.FC<FleetProfitabilityAnalyticsProps> = ({
  stats,
  settings,
  onSelectVehicle,
}) => {
  const currency = settings.currency || 'FCFA';

  const formatAmount = (val: number) => {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(val || 0))} ${currency}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Overview */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
            <TrendingUp className="w-3.5 h-3.5" />
            Audit de Rentabilité & Optimisation de la Flotte
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Analyse d'Exploitation du Parc Automobile
          </h2>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Identifiez instantanément les unités les plus profitables de votre flotte, les véhicules à charges excessives
            et les voitures dormantes à remettre en rotation commerciale.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <Car className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* 2. Top & Least Profitable Vehicles (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rentables */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Véhicules les Plus Rentables
                  </h3>
                  <p className="text-2xs text-slate-500">
                    Top générateurs de marge nette (Revenus - Dépenses)
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Bénéfices élevés
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {stats.topProfitableVehicles.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Aucun revenu d'exploitation enregistré sur les véhicules pour le moment.
                </div>
              ) : (
                stats.topProfitableVehicles.map((item, idx) => (
                  <div
                    key={item.vehicle.id}
                    onClick={() => onSelectVehicle(item)}
                    className="p-3 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/20 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-emerald-700">
                          {item.vehicle.make} {item.vehicle.model}
                        </span>
                        <span className="text-2xs font-mono text-slate-500">
                          {item.vehicle.registration} • {item.rentalCount} location(s)
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-emerald-600 block">
                        +{formatAmount(item.netProfit)}
                      </span>
                      <span className="text-2xs text-slate-400">
                        {Math.round(item.profitabilityPercentage)}% marge
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Véhicules les Moins Rentables / Coûteux */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Véhicules les Plus Coûteux / Moins Rentables
                  </h3>
                  <p className="text-2xs text-slate-500">
                    Véhicules générant des charges d'entretien ou un faible rendement
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                À surveiller
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {stats.leastProfitableVehicles.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Aucun véhicule déficitaire ou avec charges excessives détecté.
                </div>
              ) : (
                stats.leastProfitableVehicles.map((item, idx) => (
                  <div
                    key={item.vehicle.id}
                    onClick={() => onSelectVehicle(item)}
                    className="p-3 rounded-xl border border-slate-100 hover:border-rose-200 bg-slate-50/50 hover:bg-rose-50/20 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-rose-700">
                          {item.vehicle.make} {item.vehicle.model}
                        </span>
                        <span className="text-2xs font-mono text-slate-500">
                          {item.vehicle.registration} • Charges : {formatAmount(item.totalExpenses)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-black block ${
                          item.netProfit < 0 ? 'text-rose-600' : 'text-slate-700'
                        }`}
                      >
                        {formatAmount(item.netProfit)}
                      </span>
                      <span className="text-2xs text-slate-400">
                        Revenus : {formatAmount(item.totalRevenue)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Most Rented vs Underutilized Vehicles (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Véhicules les Plus Loués (Rotation Élevée) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Véhicules les Plus Sollicités (Stars du Parc)
                </h3>
                <p className="text-2xs text-slate-500">
                  Unités à fort volume de locations et rotation continue
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Forte demande
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {stats.mostRentedVehicles.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Aucune location clôturée ou en cours enregistrée.
              </div>
            ) : (
              stats.mostRentedVehicles.map((item, idx) => (
                <div
                  key={item.vehicle.id}
                  onClick={() => onSelectVehicle(item)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-blue-700">
                        {item.vehicle.make} {item.vehicle.model}
                      </span>
                      <span className="text-2xs text-slate-500 font-mono">
                        {item.vehicle.registration} • {item.totalDaysRented} jour(s) cumulés
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-blue-700 block">
                      {item.rentalCount} contrat(s)
                    </span>
                    <span className="text-2xs text-slate-500">
                      {formatAmount(item.rentalRevenue)} générés
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Véhicules Sous-exploités / Dormants */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Véhicules Sous-Exploités (Parc Dormant)
                </h3>
                <p className="text-2xs text-slate-500">
                  Unités disponibles avec peu de rotations à proposer aux clients
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              À dynamiser
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {stats.underutilizedVehicles.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Tous les véhicules du parc sont activement sollicités.
              </div>
            ) : (
              stats.underutilizedVehicles.map((item, idx) => (
                <div
                  key={item.vehicle.id}
                  onClick={() => onSelectVehicle(item)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-amber-200 bg-slate-50/50 hover:bg-amber-50/20 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-amber-800">
                        {item.vehicle.make} {item.vehicle.model}
                      </span>
                      <span className="text-2xs text-slate-500 font-mono">
                        {item.vehicle.registration} • Statut : {item.currentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-amber-700 block">
                      {item.rentalCount} location(s)
                    </span>
                    <span className="text-2xs text-slate-400">
                      {item.totalDaysRented} jour(s) en service
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
