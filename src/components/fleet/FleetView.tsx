import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Vehicle, VehicleStatus } from '../../types';
import {
  calculateFleetGlobalStats,
  calculateVehicleExploitation,
  VehicleExploitationStats,
} from '../../utils/fleetAnalytics';
import { FleetOverviewCards } from './FleetOverviewCards';
import { FleetProfitabilityAnalytics } from './FleetProfitabilityAnalytics';
import { FleetAvailabilityBoard } from './FleetAvailabilityBoard';
import { FleetVehicleSheetModal } from './FleetVehicleSheetModal';
import { EmptyState } from '../EmptyState';
import {
  Car,
  Plus,
  Search,
  KeyRound,
  BadgePercent,
  Calendar,
  Wrench,
  CheckCircle2,
  TrendingUp,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Filter,
  DollarSign,
  Receipt,
  Download,
} from 'lucide-react';

interface FleetViewProps {
  onOpenVehicleModal: (vehicle?: Vehicle | null) => void;
  onQuickSale: (vehicleId: string) => void;
  onQuickRental: (vehicleId: string) => void;
  onQuickReservation?: (vehicleId: string) => void;
  onAddMaintenance?: (vehicleId: string) => void;
  searchQuery?: string;
}

type MainFleetTab = 'table' | 'availability' | 'analytics';
type SortOption = 'profit_desc' | 'revenue_desc' | 'expenses_desc' | 'rentals_desc' | 'make_asc';

export const FleetView: React.FC<FleetViewProps> = ({
  onOpenVehicleModal,
  onQuickSale,
  onQuickRental,
  onQuickReservation,
  onAddMaintenance,
  searchQuery = '',
}) => {
  const {
    vehicles,
    sales,
    rentals,
    reservations,
    payments,
    expenses,
    maintenances,
    settings,
    setActiveTab,
  } = useCrm();

  const [activeMainTab, setActiveMainTab] = useState<MainFleetTab>('table');
  const [selectedStatus, setSelectedStatus] = useState<string>('Tous');
  const [localSearch, setLocalSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<SortOption>('profit_desc');

  // Selected vehicle for the 360° Fiche d'Exploitation Modal
  const [selectedExploitation, setSelectedExploitation] = useState<VehicleExploitationStats | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);

  const activeSearch = searchQuery || localSearch;
  const currency = settings.currency || 'FCFA';

  const formatAmount = (val: number) => {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(val || 0))} ${currency}`;
  };

  // Compute live global fleet statistics
  const fleetGlobalStats = useMemo(() => {
    return calculateFleetGlobalStats(
      vehicles,
      sales,
      rentals,
      reservations,
      payments,
      expenses,
      maintenances
    );
  }, [vehicles, sales, rentals, reservations, payments, expenses, maintenances]);

  // Compute live exploitation metrics for each vehicle
  const allExploitationStats = useMemo(() => {
    return vehicles.map((v) =>
      calculateVehicleExploitation(v, sales, rentals, reservations, payments, expenses, maintenances)
    );
  }, [vehicles, sales, rentals, reservations, payments, expenses, maintenances]);

  // Filter and sort vehicle records
  const filteredVehicles = useMemo(() => {
    return allExploitationStats
      .filter((item) => {
        const q = activeSearch.toLowerCase().trim();
        const v = item.vehicle;
        const matchesSearch =
          q === '' ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.registration.toLowerCase().includes(q) ||
          (v.category && v.category.toLowerCase().includes(q));

        let matchesStatus = true;
        if (selectedStatus !== 'Tous') {
          if (selectedStatus === 'Maintenance' || selectedStatus === 'En maintenance') {
            matchesStatus = item.currentStatus === 'En maintenance';
          } else {
            matchesStatus = item.currentStatus === selectedStatus;
          }
        }

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'profit_desc') return b.netProfit - a.netProfit;
        if (sortBy === 'revenue_desc') return b.totalRevenue - a.totalRevenue;
        if (sortBy === 'expenses_desc') return b.totalExpenses - a.totalExpenses;
        if (sortBy === 'rentals_desc') return b.rentalCount - a.rentalCount;
        if (sortBy === 'make_asc') return a.vehicle.make.localeCompare(b.vehicle.make);
        return 0;
      });
  }, [allExploitationStats, activeSearch, selectedStatus, sortBy]);

  const handleOpenSheet = (item: VehicleExploitationStats) => {
    setSelectedExploitation(item);
    setIsSheetModalOpen(true);
  };

  const handleQuickReservationFallback = (vehicleId: string) => {
    if (onQuickReservation) {
      onQuickReservation(vehicleId);
    } else {
      setActiveTab('reservations');
    }
  };

  const handleAddMaintenanceFallback = (vehicleId: string) => {
    if (onAddMaintenance) {
      onAddMaintenance(vehicleId);
    } else {
      setActiveTab('maintenance');
    }
  };

  const handleExportCSV = () => {
    if (allExploitationStats.length === 0) return;
    const headers = [
      'Immatriculation',
      'Marque',
      'Modèle',
      'Année',
      'Statut',
      'Nb Locations',
      'Nb Ventes',
      'Revenus Loc (FCFA)',
      'Revenus Vente (FCFA)',
      'Revenus Totaux (FCFA)',
      'Dépenses Totales (FCFA)',
      'Bénéfice Net (FCFA)',
      'Marge (%)',
    ];

    const rows = allExploitationStats.map((item) => [
      item.vehicle.registration,
      item.vehicle.make,
      item.vehicle.model,
      item.vehicle.year || '',
      item.currentStatus,
      item.rentalCount,
      item.saleCount,
      item.rentalRevenue,
      item.saleRevenue,
      item.totalRevenue,
      item.totalExpenses,
      item.netProfit,
      Math.round(item.profitabilityPercentage),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `parc_automobile_sirius_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Section: Header & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Gestion du Parc Automobile
            </h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
              {vehicles.length} véhicule(s)
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Pilotez votre flotte en temps réel, analysez la rentabilité unitaire et maximisez l'exploitation commerciale.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Exporter l'audit financier du parc en CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Exporter CSV
          </button>

          <button
            id="btn-new-vehicle"
            onClick={() => onOpenVehicleModal(null)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Ajouter un véhicule
          </button>
        </div>
      </div>

      {/* 2. Global Fleet Overview KPI Cards */}
      <FleetOverviewCards
        stats={fleetGlobalStats}
        settings={settings}
        onFilterStatus={(status) => {
          setSelectedStatus(status);
          setActiveMainTab('table');
        }}
      />

      {/* 3. Main Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMainTab('table')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMainTab === 'table'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Liste & Rentabilité du Parc
          </button>

          <button
            onClick={() => setActiveMainTab('availability')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMainTab === 'availability'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Disponibilité de la Flotte
          </button>

          <button
            onClick={() => setActiveMainTab('analytics')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMainTab === 'analytics'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            Analyse d'Exploitation
          </button>
        </div>

        {activeMainTab === 'table' && (
          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Table / Cards */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vue Tableau"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vue Grille / Cartes"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. CONTENT SECTIONS */}
      {/* SECTION 1: LIST & PROFITABILITY TABLE */}
      {activeMainTab === 'table' && (
        <div className="space-y-4">
          {/* Search & Filters Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-fleet"
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Rechercher par immatriculation, marque, modèle..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Filters & Sorting */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
                  Statut :
                </span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Tous">Tous les statuts</option>
                  <option value="Disponible">Disponibles</option>
                  <option value="Loué">En Location</option>
                  <option value="Réservé">Réservés</option>
                  <option value="En maintenance">En Maintenance</option>
                  <option value="Vendu">Vendus</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
                  Trier :
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="profit_desc">Bénéfice net (Décroissant)</option>
                  <option value="revenue_desc">Revenus totaux (Décroissant)</option>
                  <option value="expenses_desc">Dépenses totales (Décroissant)</option>
                  <option value="rentals_desc">Nombre de locations (Plus loués)</option>
                  <option value="make_asc">Marque & Modèle (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Empty State when no vehicles exist at all */}
          {vehicles.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <Car className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-bounce" />
              <h3 className="text-base font-bold text-slate-800">
                Aucun véhicule enregistré dans le parc
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
                Commencez par ajouter votre premier véhicule pour suivre sa rentabilité, planifier les locations et maîtriser les dépenses d'entretien.
              </p>
              <button
                onClick={() => onOpenVehicleModal(null)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter un véhicule
              </button>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">
                Aucun véhicule ne correspond aux critères
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Modifiez vos termes de recherche ou réinitialisez les filtres.
              </p>
              <button
                onClick={() => {
                  setLocalSearch('');
                  setSelectedStatus('Tous');
                }}
                className="mt-4 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Véhicule</th>
                      <th className="py-3.5 px-4">Statut</th>
                      <th className="py-3.5 px-4 text-center">Activité</th>
                      <th className="py-3.5 px-4 text-right">Revenus</th>
                      <th className="py-3.5 px-4 text-right">Dépenses</th>
                      <th className="py-3.5 px-4 text-right">Rentabilité</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVehicles.map((item) => {
                      const v = item.vehicle;
                      return (
                        <tr
                          key={v.id}
                          id={`row-fleet-${v.id}`}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          onClick={() => handleOpenSheet(item)}
                        >
                          {/* Véhicule / Immat */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                                <Car className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                                  {v.make} {v.model}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-2xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                    {v.registration}
                                  </span>
                                  {v.year && <span className="text-2xs text-slate-400">{v.year}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Statut */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-2xs font-bold border ${
                                item.currentStatus === 'Disponible'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : item.currentStatus === 'Loué'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : item.currentStatus === 'Réservé'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : item.currentStatus === 'En maintenance'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {item.currentStatus}
                            </span>
                          </td>

                          {/* Activité */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="font-bold text-slate-800">
                                {item.rentalCount} loc. {item.saleCount > 0 && `• ${item.saleCount} vente`}
                              </span>
                              <span className="text-2xs text-slate-400">
                                {item.totalDaysRented} j en service
                              </span>
                            </div>
                          </td>

                          {/* Revenus */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-black text-slate-900 block">
                              {formatAmount(item.totalRevenue)}
                            </span>
                            <span className="text-2xs text-slate-400">
                              Loc: {formatAmount(item.rentalRevenue)}
                            </span>
                          </td>

                          {/* Dépenses */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-black text-rose-600 block">
                              {formatAmount(item.totalExpenses)}
                            </span>
                            <span className="text-2xs text-slate-400">
                              {item.maintenanceCount} atelier(s)
                            </span>
                          </td>

                          {/* Rentabilité & Marge */}
                          <td className="py-3.5 px-4 text-right">
                            <span
                              className={`font-black text-xs block ${
                                item.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {item.netProfit >= 0 ? '+' : ''}
                              {formatAmount(item.netProfit)}
                            </span>
                            <span
                              className={`text-2xs font-semibold ${
                                item.profitabilityPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {Math.round(item.profitabilityPercentage)}% marge
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenSheet(item)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors"
                                title="Voir la fiche d'exploitation 360°"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {item.currentStatus === 'Disponible' && (
                                <button
                                  onClick={() => onQuickRental(v.id)}
                                  className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-2xs font-bold transition-colors shadow-2xs"
                                  title="Nouvelle location rapide"
                                >
                                  Louer
                                </button>
                              )}

                              <button
                                onClick={() => handleAddMaintenanceFallback(v.id)}
                                className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                                title="Planifier un entretien"
                              >
                                <Wrench className="w-3.5 h-3.5" />
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
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVehicles.map((item) => {
                const v = item.vehicle;
                return (
                  <div
                    key={v.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between cursor-pointer group"
                    onClick={() => handleOpenSheet(item)}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {v.make} {v.model}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                              {v.registration}
                            </span>
                            {v.year && <span className="text-xs text-slate-400">{v.year}</span>}
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-2xs font-bold border ${
                            item.currentStatus === 'Disponible'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.currentStatus === 'Loué'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.currentStatus === 'Réservé'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : item.currentStatus === 'En maintenance'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {item.currentStatus}
                        </span>
                      </div>

                      {/* Financial KPI stats for Card */}
                      <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <div>
                          <span className="text-2xs text-slate-400 block font-medium">Revenus</span>
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            {formatAmount(item.totalRevenue)}
                          </span>
                        </div>
                        <div>
                          <span className="text-2xs text-slate-400 block font-medium">Dépenses</span>
                          <span className="text-xs font-bold text-rose-600 block truncate">
                            {formatAmount(item.totalExpenses)}
                          </span>
                        </div>
                        <div>
                          <span className="text-2xs text-slate-400 block font-medium">Bénéfice</span>
                          <span
                            className={`text-xs font-black block truncate ${
                              item.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {formatAmount(item.netProfit)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {item.rentalCount} location(s) • {item.totalDaysRented} j
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSheet(item);
                        }}
                        className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                      >
                        Fiche 360°
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: AVAILABILITY BOARD */}
      {activeMainTab === 'availability' && (
        <FleetAvailabilityBoard
          exploitationList={allExploitationStats}
          allRentals={rentals}
          allReservations={reservations}
          allMaintenances={maintenances}
          settings={settings}
          onSelectVehicle={handleOpenSheet}
          onQuickRental={onQuickRental}
          onQuickSale={onQuickSale}
          onQuickReservation={handleQuickReservationFallback}
          onAddMaintenance={handleAddMaintenanceFallback}
        />
      )}

      {/* SECTION 3: PROFITABILITY & EXPLOITATION ANALYTICS */}
      {activeMainTab === 'analytics' && (
        <FleetProfitabilityAnalytics
          stats={fleetGlobalStats}
          settings={settings}
          onSelectVehicle={handleOpenSheet}
        />
      )}

      {/* 5. 360° FLEET VEHICLE SHEET MODAL */}
      <FleetVehicleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        stats={selectedExploitation}
        settings={settings}
        onQuickRental={onQuickRental}
        onQuickSale={onQuickSale}
        onQuickReservation={handleQuickReservationFallback}
        onAddMaintenance={handleAddMaintenanceFallback}
        onEditVehicle={(vId) => {
          setIsSheetModalOpen(false);
          const vObj = vehicles.find((v) => v.id === vId);
          if (vObj) onOpenVehicleModal(vObj);
        }}
      />
    </div>
  );
};
