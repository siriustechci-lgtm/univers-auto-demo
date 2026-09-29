import React, { useState } from 'react';
import { VehicleExploitationStats, VehicleHistoryItem } from '../../utils/fleetAnalytics';
import { AgencySettings } from '../../types';
import {
  X,
  Car,
  TrendingUp,
  Receipt,
  DollarSign,
  Calendar,
  KeyRound,
  Wrench,
  BadgePercent,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  User,
  Shield,
  Fuel,
  Printer,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react';

interface FleetVehicleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: VehicleExploitationStats | null;
  settings: AgencySettings;
  onQuickRental: (vehicleId: string) => void;
  onQuickSale: (vehicleId: string) => void;
  onQuickReservation: (vehicleId: string) => void;
  onAddMaintenance: (vehicleId: string) => void;
  onEditVehicle?: (vehicleId: string) => void;
}

type TabType = 'overview' | 'financials' | 'history';

export const FleetVehicleSheetModal: React.FC<FleetVehicleSheetModalProps> = ({
  isOpen,
  onClose,
  stats,
  settings,
  onQuickRental,
  onQuickSale,
  onQuickReservation,
  onAddMaintenance,
  onEditVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!isOpen || !stats) return null;

  const currency = settings.currency || 'FCFA';
  const v = stats.vehicle;

  const formatAmount = (val: number) => {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(val || 0))} ${currency}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="modal-fleet-vehicle-sheet-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="modal-fleet-vehicle-sheet"
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header with identity and quick status */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm shrink-0">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">
                    {v.make} {v.model}
                  </h2>
                  <span className="text-xs text-slate-500 font-bold bg-slate-200/80 px-2 py-0.5 rounded-md">
                    {v.year}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      stats.currentStatus === 'Disponible'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : stats.currentStatus === 'Loué'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : stats.currentStatus === 'Réservé'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : stats.currentStatus === 'En maintenance'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {stats.currentStatus}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {v.registration}
                  </span>
                  {v.category && <span>Catégorie : {v.category}</span>}
                  {v.mileage !== undefined && <span>Kilométrage : {v.mileage.toLocaleString('fr-FR')} km</span>}
                </div>
              </div>
            </div>

            {/* Quick action buttons & Print */}
            <div className="flex flex-wrap items-center gap-2 self-end sm:self-start">
              <button
                onClick={handlePrint}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Imprimer la fiche d'exploitation"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Triggers Banner */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {stats.currentStatus === 'Disponible' && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      onQuickRental(v.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Nouvelle location
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onQuickReservation(v.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Nouvelle réservation
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onQuickSale(v.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <BadgePercent className="w-3.5 h-3.5" />
                    Nouvelle vente
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  onClose();
                  onAddMaintenance(v.id);
                }}
                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                Ajouter un entretien
              </button>
            </div>

            <div className="text-2xs text-slate-500">
              ID Véhicule : <span className="font-mono">{v.id}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 flex gap-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Car className="w-4 h-4" />
            Vue d'Ensemble & Activité
          </button>

          <button
            onClick={() => setActiveTab('financials')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'financials'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Bilan Financier & Rentabilité
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            Historique Complet ({stats.history.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grow space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial KPI Trio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100">
                  <span className="text-2xs font-bold text-emerald-800 uppercase tracking-wider block">
                    Revenus Totaux Générés
                  </span>
                  <span className="text-xl font-black text-emerald-700 mt-1 block">
                    {formatAmount(stats.totalRevenue)}
                  </span>
                  <span className="text-2xs text-emerald-600 mt-0.5 block">
                    {stats.rentalCount} location(s) • {stats.saleCount} vente(s)
                  </span>
                </div>

                <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-100">
                  <span className="text-2xs font-bold text-rose-800 uppercase tracking-wider block">
                    Dépenses Totales
                  </span>
                  <span className="text-xl font-black text-rose-700 mt-1 block">
                    {formatAmount(stats.totalExpenses)}
                  </span>
                  <span className="text-2xs text-rose-600 mt-0.5 block">
                    {stats.maintenanceCount} entretien(s) & charges
                  </span>
                </div>

                <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100">
                  <span className="text-2xs font-bold text-indigo-800 uppercase tracking-wider block">
                    Bénéfice Net Estimé
                  </span>
                  <span
                    className={`text-xl font-black mt-1 block ${
                      stats.netProfit >= 0 ? 'text-indigo-700' : 'text-rose-700'
                    }`}
                  >
                    {formatAmount(stats.netProfit)}
                  </span>
                  <span className="text-2xs text-indigo-600 font-semibold mt-0.5 block">
                    Marge nette : {Math.round(stats.profitabilityPercentage)}%
                  </span>
                </div>
              </div>

              {/* General Technical Information & Rates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-200">
                    Caractéristiques du Véhicule
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Marque & Modèle :</span>
                      <span className="font-bold text-slate-800">{v.make} {v.model}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Immatriculation :</span>
                      <span className="font-mono font-bold text-slate-800">{v.registration}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Année :</span>
                      <span className="font-semibold text-slate-800">{v.year || 'Non renseignée'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Carburant :</span>
                      <span className="font-semibold text-slate-800">{v.fuel || 'Essence'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Transmission :</span>
                      <span className="font-semibold text-slate-800">{v.transmission || 'Automatique'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Kilométrage actuel :</span>
                      <span className="font-semibold text-slate-800">
                        {v.mileage !== undefined ? `${v.mileage.toLocaleString('fr-FR')} km` : '0 km'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-200">
                    Activité & Tarification Commerciale
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Tarif journalier (Location) :</span>
                      <span className="font-bold text-indigo-700">
                        {v.dailyRate ? `${formatAmount(v.dailyRate)} / jour` : 'Non configuré'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Prix de vente conseillé :</span>
                      <span className="font-bold text-slate-800">
                        {v.sellingPrice ? formatAmount(v.sellingPrice) : 'Non applicable'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Total jours loués :</span>
                      <span className="font-bold text-blue-700">{stats.totalDaysRented} jour(s)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Réservations cumulées :</span>
                      <span className="font-bold text-purple-700">{stats.reservationCount} réservation(s)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Revenu moyen / jour loué :</span>
                      <span className="font-semibold text-slate-800">
                        {formatAmount(stats.revenuePerDayRented)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Coût moyen / jour loué :</span>
                      <span className="font-semibold text-slate-800">
                        {formatAmount(stats.costPerDayRented)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIALS & EXPENSE BREAKDOWN */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              {/* Financial Structure Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Breakdown */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Revenus Générés
                      </h4>
                    </div>
                    <span className="text-sm font-black text-emerald-700">
                      {formatAmount(stats.totalRevenue)}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                        Revenus des Locations ({stats.rentalCount})
                      </span>
                      <span className="font-bold text-slate-900">{formatAmount(stats.rentalRevenue)}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        <BadgePercent className="w-3.5 h-3.5 text-indigo-600" />
                        Revenus de Vente ({stats.saleCount})
                      </span>
                      <span className="font-bold text-slate-900">{formatAmount(stats.saleRevenue)}</span>
                    </div>
                  </div>
                </div>

                {/* Expenses Breakdown */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-rose-600" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Charges & Dépenses
                      </h4>
                    </div>
                    <span className="text-sm font-black text-rose-600">
                      {formatAmount(stats.totalExpenses)}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-600" />
                        Entretien régulier & Vidanges
                      </span>
                      <span className="font-bold text-slate-900">{formatAmount(stats.maintenanceCost)}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-rose-600" />
                        Réparations & Pièces
                      </span>
                      <span className="font-bold text-slate-900">{formatAmount(stats.repairsCost)}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                        Assurance & Taxes
                      </span>
                      <span className="font-bold text-slate-900">{formatAmount(stats.insuranceCost)}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                        Carburant
                      </span>
                      <span className="font-bold text-slate-900">{formatAmount(stats.fuelCost)}</span>
                    </div>

                    {stats.otherExpensesCost > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                        <span className="font-medium text-slate-700">Autres charges</span>
                        <span className="font-bold text-slate-900">{formatAmount(stats.otherExpensesCost)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profitability Synthesis Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
                <div>
                  <span className="text-2xs font-bold text-indigo-300 uppercase tracking-wider block">
                    Synthèse de Rentabilité Nette
                  </span>
                  <h3 className="text-2xl font-black mt-1">
                    Bénéfice Net : {formatAmount(stats.netProfit)}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-md">
                    Calculé en soustrayant l'ensemble des dépenses d'atelier, révisions et assurances de tous les loyers et ventes perçus.
                  </p>
                </div>

                <div className="text-right shrink-0 bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
                  <span className="text-2xs text-slate-300 uppercase tracking-wider block">
                    Marge Opérationnelle
                  </span>
                  <span className="text-3xl font-black text-emerald-400 block mt-0.5">
                    {Math.round(stats.profitabilityPercentage)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UNIFIED HISTORY LOG */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {stats.history.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Aucun historique d'opération</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Les locations, réservations, ventes et entretiens de ce véhicule apparaîtront ici.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Type</th>
                        <th className="py-3 px-3">Opération</th>
                        <th className="py-3 px-3">Tiers / Client / Garage</th>
                        <th className="py-3 px-3 text-right">Montant</th>
                        <th className="py-3 px-3 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {stats.history.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-700">
                            {new Date(item.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-2xs font-bold ${
                                item.type === 'location'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : item.type === 'vente'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.type === 'reservation'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : item.type === 'entretien'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {item.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{item.title}</span>
                            {item.details && (
                              <span className="text-2xs text-slate-500 block truncate max-w-xs" title={item.details}>
                                {item.details}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700">
                            {item.clientOrSupplier || '—'}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-black ${
                              item.isRevenue ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {item.isRevenue ? '+' : '-'}
                            {formatAmount(item.amount)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-2xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {item.status || 'Validé'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Fiche d'exploitation Sirius Auto CRM — Immatriculation : <strong>{v.registration}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
