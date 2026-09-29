import React from 'react';
import { FleetGlobalStats } from '../../utils/fleetAnalytics';
import { AgencySettings } from '../../types';
import {
  Car,
  CheckCircle2,
  KeyRound,
  Calendar,
  Wrench,
  BadgePercent,
  TrendingUp,
  Receipt,
  DollarSign,
  AlertCircle,
  Percent,
} from 'lucide-react';

interface FleetOverviewCardsProps {
  stats: FleetGlobalStats;
  settings: AgencySettings;
  onFilterStatus?: (status: string) => void;
}

export const FleetOverviewCards: React.FC<FleetOverviewCardsProps> = ({
  stats,
  settings,
  onFilterStatus,
}) => {
  const currency = settings.currency || 'FCFA';

  const formatAmount = (val: number) => {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(val || 0))} ${currency}`;
  };

  return (
    <div className="space-y-4">
      {/* 1. Status KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Parc */}
        <div
          id="card-fleet-total"
          onClick={() => onFilterStatus && onFilterStatus('Tous')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
              Total Parc
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{stats.totalVehicles}</span>
            <span className="text-2xs text-slate-400 font-medium">unités</span>
          </div>
          <div className="mt-1 text-2xs text-slate-500 font-medium">
            Flotte enregistrée
          </div>
        </div>

        {/* Disponibles */}
        <div
          id="card-fleet-available"
          onClick={() => onFilterStatus && onFilterStatus('Disponible')}
          className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-emerald-700 uppercase tracking-wider">
              Disponibles
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600">{stats.availableCount}</span>
            <span className="text-2xs text-emerald-600/70 font-semibold">
              ({Math.round(stats.availabilityRate)}%)
            </span>
          </div>
          <div className="mt-1 text-2xs text-slate-500 font-medium">
            Prêts immédiatement
          </div>
        </div>

        {/* Loués */}
        <div
          id="card-fleet-rented"
          onClick={() => onFilterStatus && onFilterStatus('Loué')}
          className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-blue-700 uppercase tracking-wider">
              En Location
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-blue-600">{stats.rentedCount}</span>
            <span className="text-2xs text-slate-400 font-medium">en cours</span>
          </div>
          <div className="mt-1 text-2xs text-slate-500 font-medium">
            Sous contrat actif
          </div>
        </div>

        {/* Réservés */}
        <div
          id="card-fleet-reserved"
          onClick={() => onFilterStatus && onFilterStatus('Réservé')}
          className="bg-white rounded-2xl p-4 border border-purple-200/80 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-purple-700 uppercase tracking-wider">
              Réservés
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-purple-600">{stats.reservedCount}</span>
            <span className="text-2xs text-slate-400 font-medium">bloqués</span>
          </div>
          <div className="mt-1 text-2xs text-slate-500 font-medium">
            Réservations validées
          </div>
        </div>

        {/* Maintenance */}
        <div
          id="card-fleet-maintenance"
          onClick={() => onFilterStatus && onFilterStatus('En maintenance')}
          className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-amber-700 uppercase tracking-wider">
              En Atelier
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-600">{stats.maintenanceCount}</span>
            <span className="text-2xs text-slate-400 font-medium">en cours</span>
          </div>
          <div className="mt-1 text-2xs text-slate-500 font-medium">
            Maintenance active
          </div>
        </div>

        {/* Vendus */}
        <div
          id="card-fleet-sold"
          onClick={() => onFilterStatus && onFilterStatus('Vendu')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
              Vendus
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <BadgePercent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-800">{stats.soldCount}</span>
            <span className="text-2xs text-slate-400 font-medium">sortis</span>
          </div>
          <div className="mt-1 text-2xs text-slate-500 font-medium">
            Cédés / Sortis du parc
          </div>
        </div>
      </div>

      {/* 2. Financial Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenus du Parc */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Revenus Générés par la Flotte
            </span>
            <span className="text-2xl font-black text-slate-900 block">
              {formatAmount(stats.totalFleetRevenue)}
            </span>
            <div className="flex items-center gap-2 text-2xs text-slate-500">
              <span className="text-blue-600 font-semibold">
                Loc: {formatAmount(stats.totalFleetRentalRevenue)}
              </span>
              {stats.totalFleetSaleRevenue > 0 && (
                <span>• Ventes: {formatAmount(stats.totalFleetSaleRevenue)}</span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Dépenses Totales de la Flotte */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Dépenses & Entretien de Flotte
            </span>
            <span className="text-2xl font-black text-rose-600 block">
              {formatAmount(stats.totalFleetExpenses)}
            </span>
            <div className="text-2xs text-slate-500">
              <span>Atelier & Pièces : {formatAmount(stats.totalFleetMaintenanceExpenses)}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Rentabilité Nette Globale */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Bénéfice Net d'Exploitation
            </span>
            <span
              className={`text-2xl font-black block ${
                stats.totalFleetNetProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'
              }`}
            >
              {formatAmount(stats.totalFleetNetProfit)}
            </span>
            <div className="text-2xs font-semibold flex items-center gap-1.5">
              <span
                className={`px-2 py-0.5 rounded-md ${
                  stats.globalProfitabilityRate >= 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                Marge : {Math.round(stats.globalProfitabilityRate)}%
              </span>
              <span className="text-slate-400">sur les opérations</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
