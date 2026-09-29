import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { MaintenanceIntervention, MaintenanceType, MaintenanceStatus } from '../../types';
import { MaintenanceDashboardCards } from './MaintenanceDashboardCards';
import { AddMaintenanceModal } from './AddMaintenanceModal';
import { MaintenanceDetailModal } from './MaintenanceDetailModal';
import { VehicleMaintenanceSheetModal } from './VehicleMaintenanceSheetModal';
import { MaintenanceCalendarView } from './MaintenanceCalendarView';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Calendar,
  Car,
  AlertTriangle,
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  Printer,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  Download,
} from 'lucide-react';

type MaintenanceTab = 'dashboard' | 'list' | 'fleet' | 'calendar' | 'alerts';

export const MaintenanceView: React.FC = () => {
  const {
    vehicles,
    maintenances,
    getMaintenanceAlerts,
    getMaintenanceCostByVehicle,
    completeMaintenance,
  } = useCrm();

  const [currentTab, setCurrentTab] = useState<MaintenanceTab>('dashboard');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalVehicleId, setAddModalVehicleId] = useState<string | undefined>(undefined);
  const [addModalType, setAddModalType] = useState<MaintenanceType | undefined>(undefined);

  const [selectedIntervention, setSelectedIntervention] = useState<MaintenanceIntervention | null>(
    null
  );
  const [selectedVehicleSheetId, setSelectedVehicleSheetId] = useState<string | null>(null);

  // Filters for Interventions list
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>(
    'date_desc'
  );

  const alerts = getMaintenanceAlerts();

  // Open add modal helper
  const handleOpenAddModal = (vehicleId?: string, type?: MaintenanceType) => {
    setAddModalVehicleId(vehicleId);
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  // Open vehicle sheet helper
  const handleOpenVehicleSheet = (vehicleId: string) => {
    setSelectedVehicleSheetId(vehicleId);
  };

  // Filtered interventions
  const filteredInterventions = maintenances
    .filter((m) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesRef = m.referenceNumber.toLowerCase().includes(query);
        const matchesVehicle = m.vehicleName.toLowerCase().includes(query);
        const matchesPlate = m.vehicleRegistration.toLowerCase().includes(query);
        const matchesSupplier = m.supplier.toLowerCase().includes(query);
        const matchesDesc = m.description.toLowerCase().includes(query);
        if (!matchesRef && !matchesVehicle && !matchesPlate && !matchesSupplier && !matchesDesc) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && m.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && m.type !== typeFilter) {
        return false;
      }

      // Vehicle filter
      if (vehicleFilter !== 'all' && m.vehicleId !== vehicleFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount_desc') return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      if (sortBy === 'amount_asc') return (Number(a.amount) || 0) - (Number(b.amount) || 0);
      return 0;
    });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div id="maintenance-view-root" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Maintenance & Entretien
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Suivi des révisions, réparations, contrôle technique et disponibilité du parc
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-new-intervention-top"
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle intervention
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none pb-px">
        <button
          id="tab-btn-dashboard"
          onClick={() => setCurrentTab('dashboard')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            currentTab === 'dashboard'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Tableau de bord
        </button>

        <button
          id="tab-btn-list"
          onClick={() => setCurrentTab('list')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            currentTab === 'list'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Interventions ({maintenances.length})
        </button>

        <button
          id="tab-btn-fleet"
          onClick={() => setCurrentTab('fleet')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            currentTab === 'fleet'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4" />
          Fiches Entretien Parc ({vehicles.length})
        </button>

        <button
          id="tab-btn-calendar"
          onClick={() => setCurrentTab('calendar')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            currentTab === 'calendar'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Calendrier des échéances
        </button>

        <button
          id="tab-btn-alerts"
          onClick={() => setCurrentTab('alerts')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            currentTab === 'alerts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Alertes & Rappels
          {alerts.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
              {alerts.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: DASHBOARD */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          <MaintenanceDashboardCards
            onNewIntervention={() => handleOpenAddModal()}
            onViewAlerts={() => setCurrentTab('alerts')}
            onViewCalendar={() => setCurrentTab('calendar')}
          />

          {/* Quick status split: Vehicles in workshop vs Recent interventions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1 & 2: Recent Interventions */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Dernières interventions d'atelier
                  </h3>
                  <p className="text-xs text-slate-500">
                    Opérations et réparations enregistrées récemment
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('list')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Voir tout ({maintenances.length}) →
                </button>
              </div>

              {maintenances.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">
                    Aucune intervention enregistrée
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Enregistrez votre première révision ou réparation pour alimenter le suivi.
                  </p>
                  <button
                    onClick={() => handleOpenAddModal()}
                    className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                  >
                    + Créer une intervention
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  {maintenances.slice(0, 5).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedIntervention(m)}
                      className="py-3 px-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            m.status === 'Terminée'
                              ? 'bg-emerald-100 text-emerald-700'
                              : m.status === 'En cours'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900">
                              {m.vehicleName}
                            </span>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-sm">
                              {m.vehicleRegistration}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {m.type} • {m.supplier} • {new Date(m.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 block">
                          {formatCurrency(m.amount)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            m.status === 'Terminée'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'En cours'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 3: Véhicules immobilisés / En maintenance */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Véhicules en atelier
                  </h3>
                  <p className="text-xs text-slate-500">
                    Véhicules actuellement indisponibles
                  </p>
                </div>
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                  {vehicles.filter((v) => v.status === 'En maintenance').length}
                </span>
              </div>

              {vehicles.filter((v) => v.status === 'En maintenance').length === 0 ? (
                <div className="text-center py-8 bg-emerald-50/50 rounded-xl border border-emerald-100 p-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-emerald-900">
                    Tous les véhicules sont opérationnels !
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Aucun véhicule n'est actuellement immobilisé en atelier.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {vehicles
                    .filter((v) => v.status === 'En maintenance')
                    .map((v) => {
                      const activeM = maintenances.find(
                        (m) => m.vehicleId === v.id && m.status === 'En cours'
                      );
                      return (
                        <div
                          key={v.id}
                          className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950">
                              {v.make} {v.model}
                            </span>
                            <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded-sm border border-amber-200">
                              {v.registration}
                            </span>
                          </div>
                          {activeM ? (
                            <p className="text-[11px] text-amber-900">
                              <strong>{activeM.type}</strong> chez {activeM.supplier} (depuis le{' '}
                              {new Date(activeM.date).toLocaleDateString('fr-FR')})
                            </p>
                          ) : (
                            <p className="text-[11px] text-amber-900 italic">
                              Statut marqué En maintenance
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                            {activeM ? (
                              <button
                                onClick={() => setSelectedIntervention(activeM)}
                                className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline"
                              >
                                Clôturer intervention →
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenAddModal(v.id)}
                                className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline"
                              >
                                Déclarer intervention →
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenVehicleSheet(v.id)}
                              className="text-[11px] font-medium text-slate-600 hover:text-slate-900"
                            >
                              Fiche véhicule
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIST OF INTERVENTIONS */}
      {currentTab === 'list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par véhicule, immatriculation, garage..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="En cours">En cours (Atelier)</option>
                  <option value="Planifiée">Planifiée</option>
                  <option value="Terminée">Terminée</option>
                  <option value="Annulée">Annulée</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white"
                >
                  <option value="all">Tous les types</option>
                  <option value="Vidange">Vidange</option>
                  <option value="Freinage">Freinage</option>
                  <option value="Pneumatiques">Pneumatiques</option>
                  <option value="Révision générale">Révision générale</option>
                  <option value="Visite technique">Visite technique</option>
                  <option value="Assurance">Assurance</option>
                  <option value="Réparation moteur">Réparation mécanique</option>
                  <option value="Réparation carrosserie">Carrosserie</option>
                  <option value="Climatisation">Climatisation</option>
                  <option value="Batterie">Batterie</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Vehicle Filter */}
              <div>
                <select
                  value={vehicleFilter}
                  onChange={(e) => setVehicleFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white"
                >
                  <option value="all">Tous les véhicules</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.registration})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>{filteredInterventions.length} intervention(s) trouvée(s)</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Trier par :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 bg-white"
                >
                  <option value="date_desc">Date (Récent → Ancien)</option>
                  <option value="date_asc">Date (Ancien → Récent)</option>
                  <option value="amount_desc">Montant (Décroissant)</option>
                  <option value="amount_asc">Montant (Croissant)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table of Interventions */}
          {filteredInterventions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-xs">
              <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">
                Aucune intervention trouvée
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Aucun enregistrement ne correspond aux filtres actuels ou aucune intervention n'a
                encore été saisie.
              </p>
              <button
                onClick={() => handleOpenAddModal()}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
              >
                + Enregistrer une intervention
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Réf & Date</th>
                      <th className="py-3 px-4">Véhicule</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Prestataire & Description</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Montant TTC</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInterventions.map((m) => (
                      <tr
                        key={m.id}
                        onClick={() => setSelectedIntervention(m)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900 block">
                            {m.referenceNumber}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(m.date).toLocaleDateString('fr-FR')}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{m.vehicleName}</p>
                          <span className="text-[11px] font-mono text-slate-500">
                            {m.vehicleRegistration}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {m.type}
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-semibold text-slate-800 truncate">{m.supplier}</p>
                          <p className="text-[11px] text-slate-500 truncate">{m.description}</p>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              m.status === 'Terminée'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.status === 'En cours'
                                ? 'bg-amber-100 text-amber-800'
                                : m.status === 'Planifiée'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {m.status === 'En cours' && <Clock className="w-3 h-3 animate-pulse" />}
                            {m.status === 'Terminée' && <CheckCircle2 className="w-3 h-3" />}
                            {m.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(m.amount)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIntervention(m);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              Détails
                            </button>
                            {m.status === 'En cours' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  completeMaintenance(m.id);
                                }}
                                title="Marquer comme Terminée"
                                className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                              >
                                Clôturer
                              </button>
                            )}
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
      )}

      {/* TAB 3: FLEET MAINTENANCE SHEETS */}
      {currentTab === 'fleet' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => {
              const vCost = getMaintenanceCostByVehicle(v.id);
              const vActiveInterventions = maintenances.filter(
                (m) => m.vehicleId === v.id && m.status === 'En cours'
              );

              return (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {v.make} {v.model} ({v.year || 'N/A'})
                        </h3>
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm inline-block mt-1">
                          {v.registration}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          v.status === 'En maintenance'
                            ? 'bg-amber-100 text-amber-800'
                            : v.status === 'Disponible'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Dépenses totales</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(vCost.totalCost)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Interventions</span>
                        <span className="font-bold text-slate-900">
                          {vCost.interventionCount} enregistrée(s)
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Assurance</span>
                        <span
                          className={`font-medium ${
                            v.insuranceExpiryDate ? 'text-slate-800' : 'text-slate-400 italic'
                          }`}
                        >
                          {v.insuranceExpiryDate
                            ? new Date(v.insuranceExpiryDate).toLocaleDateString('fr-FR')
                            : 'Non renseignée'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Visite technique</span>
                        <span
                          className={`font-medium ${
                            v.technicalInspectionExpiryDate
                              ? 'text-slate-800'
                              : 'text-slate-400 italic'
                          }`}
                        >
                          {v.technicalInspectionExpiryDate
                            ? new Date(v.technicalInspectionExpiryDate).toLocaleDateString('fr-FR')
                            : 'Non renseignée'}
                        </span>
                      </div>
                    </div>

                    {vActiveInterventions.length > 0 && (
                      <div className="p-2 bg-amber-50 rounded-lg text-[11px] text-amber-900 border border-amber-200">
                        ⚠️ <strong>{vActiveInterventions.length} intervention(s) en cours</strong>{' '}
                        en atelier
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenVehicleSheet(v.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Fiche d'entretien
                    </button>
                    <button
                      onClick={() => handleOpenAddModal(v.id)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Intervention
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CALENDAR */}
      {currentTab === 'calendar' && (
        <MaintenanceCalendarView
          onSelectIntervention={(m) => setSelectedIntervention(m)}
          onOpenVehicleSheet={(vId) => handleOpenVehicleSheet(vId)}
          onNewIntervention={() => handleOpenAddModal()}
        />
      )}

      {/* TAB 5: ALERTS & REMINDERS */}
      {currentTab === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">
              Centre des alertes & échéances
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rappels automatisés basés sur les dates réelles d'assurance, de contrôle technique et
              d'atelier
            </p>
          </div>

          {alerts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-emerald-950">Aucune alerte active</h3>
              <p className="text-xs text-slate-500 mt-1">
                Toutes les assurances et visites techniques sont à jour, aucun véhicule n'est en retard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between shadow-xs transition-all ${
                    al.severity === 'error'
                      ? 'bg-rose-50/70 border-rose-200'
                      : al.severity === 'warning'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-blue-50/70 border-blue-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          al.severity === 'error'
                            ? 'text-rose-700'
                            : al.severity === 'warning'
                            ? 'text-amber-800'
                            : 'text-blue-700'
                        }`}
                      >
                        {al.severity === 'error' ? (
                          <ShieldAlert className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                        {al.title}
                      </span>
                      {al.daysRemaining !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            al.daysRemaining < 0
                              ? 'bg-rose-200 text-rose-900'
                              : al.daysRemaining <= 7
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-blue-200 text-blue-900'
                          }`}
                        >
                          {al.daysRemaining < 0
                            ? `Dépassé de ${Math.abs(al.daysRemaining)} j`
                            : `Sous ${al.daysRemaining} j`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-800">{al.message}</p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center justify-between">
                    {al.vehicleId ? (
                      <button
                        onClick={() => handleOpenVehicleSheet(al.vehicleId!)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Voir la fiche véhicule →
                      </button>
                    ) : (
                      <div />
                    )}

                    {al.vehicleId && (
                      <button
                        onClick={() =>
                          handleOpenAddModal(
                            al.vehicleId,
                            al.type === 'insurance_expiry'
                              ? 'Assurance'
                              : al.type === 'inspection_expiry'
                              ? 'Visite technique'
                              : undefined
                          )
                        }
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
                      >
                        + Créer intervention
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <AddMaintenanceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          initialVehicleId={addModalVehicleId}
          initialType={addModalType}
        />
      )}

      {selectedIntervention && (
        <MaintenanceDetailModal
          isOpen={!!selectedIntervention}
          intervention={selectedIntervention}
          onClose={() => setSelectedIntervention(null)}
          onOpenVehicleSheet={(vId) => handleOpenVehicleSheet(vId)}
        />
      )}

      {selectedVehicleSheetId && (
        <VehicleMaintenanceSheetModal
          isOpen={!!selectedVehicleSheetId}
          vehicleId={selectedVehicleSheetId}
          onClose={() => setSelectedVehicleSheetId(null)}
          onNewIntervention={(vId) => handleOpenAddModal(vId)}
          onSelectIntervention={(m) => setSelectedIntervention(m)}
        />
      )}
    </div>
  );
};
