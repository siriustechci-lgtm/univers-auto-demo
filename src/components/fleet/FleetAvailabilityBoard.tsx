import React, { useState } from 'react';
import { VehicleExploitationStats } from '../../utils/fleetAnalytics';
import { AgencySettings, Rental, Reservation, MaintenanceIntervention } from '../../types';
import {
  CheckCircle2,
  KeyRound,
  Calendar,
  Wrench,
  BadgePercent,
  Car,
  Phone,
  User,
  Clock,
  Plus,
  ArrowRight,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface FleetAvailabilityBoardProps {
  exploitationList: VehicleExploitationStats[];
  allRentals: Rental[];
  allReservations: Reservation[];
  allMaintenances: MaintenanceIntervention[];
  settings: AgencySettings;
  onSelectVehicle: (stats: VehicleExploitationStats) => void;
  onQuickRental: (vehicleId: string) => void;
  onQuickSale: (vehicleId: string) => void;
  onQuickReservation: (vehicleId: string) => void;
  onAddMaintenance: (vehicleId: string) => void;
}

type AvailabilityTab = 'all' | 'available' | 'rented' | 'reserved' | 'maintenance' | 'sold';

export const FleetAvailabilityBoard: React.FC<FleetAvailabilityBoardProps> = ({
  exploitationList,
  allRentals,
  allReservations,
  allMaintenances,
  settings,
  onSelectVehicle,
  onQuickRental,
  onQuickSale,
  onQuickReservation,
  onAddMaintenance,
}) => {
  const [activeTab, setActiveTab] = useState<AvailabilityTab>('available');
  const currency = settings.currency || 'FCFA';

  const formatAmount = (val: number) => {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(val || 0))} ${currency}`;
  };

  const availableVehicles = exploitationList.filter((e) => e.currentStatus === 'Disponible');
  const rentedVehicles = exploitationList.filter((e) => e.currentStatus === 'Loué');
  const reservedVehicles = exploitationList.filter((e) => e.currentStatus === 'Réservé');
  const maintenanceVehicles = exploitationList.filter((e) => e.currentStatus === 'En maintenance');
  const soldVehicles = exploitationList.filter((e) => e.currentStatus === 'Vendu');

  const displayedList =
    activeTab === 'all'
      ? exploitationList
      : activeTab === 'available'
      ? availableVehicles
      : activeTab === 'rented'
      ? rentedVehicles
      : activeTab === 'reserved'
      ? reservedVehicles
      : activeTab === 'maintenance'
      ? maintenanceVehicles
      : soldVehicles;

  return (
    <div className="space-y-6">
      {/* 1. Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'available'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Disponibles Immédiatement ({availableVehicles.length})
        </button>

        <button
          onClick={() => setActiveTab('rented')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'rented'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          En Location ({rentedVehicles.length})
        </button>

        <button
          onClick={() => setActiveTab('reserved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reserved'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-purple-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Réservés ({reservedVehicles.length})
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'maintenance'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          En Atelier / Maintenance ({maintenanceVehicles.length})
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Tout le Parc ({exploitationList.length})
        </button>

        {soldVehicles.length > 0 && (
          <button
            onClick={() => setActiveTab('sold')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'sold'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BadgePercent className="w-3.5 h-3.5" />
            Vendus ({soldVehicles.length})
          </button>
        )}
      </div>

      {/* 2. Grid Cards Display */}
      {displayedList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            Aucun véhicule sous ce statut actuellement
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Les véhicules changent d'état automatiquement lors de la création d'un contrat de location,
            d'une réservation ou d'une fiche d'entretien.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedList.map((item) => {
            const v = item.vehicle;

            // Find active rental context if rented
            const activeRental = allRentals.find(
              (r) => r.vehicleId === v.id && r.status === 'En cours'
            );

            // Find active reservation context if reserved
            const activeReservation = allReservations.find(
              (res) =>
                res.vehicleId === v.id &&
                (res.status === 'Réservée' || res.status === 'Confirmée')
            );

            // Find active maintenance context if in workshop
            const activeMaintenance = allMaintenances.find(
              (m) => m.vehicleId === v.id && m.status === 'En cours'
            );

            return (
              <div
                key={v.id}
                id={`card-avail-${v.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
              >
                {/* Top header & Photo */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {v.make} {v.model}
                        </h4>
                        <span className="text-xs text-slate-400 font-medium">{v.year}</span>
                      </div>
                      <span className="inline-block mt-1 font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {v.registration}
                      </span>
                    </div>

                    {/* Status Badge */}
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

                  {/* Context Info Box depending on state */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    {item.currentStatus === 'Disponible' && (
                      <div className="text-emerald-800 font-medium flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Prêt pour location ou vente
                        </span>
                        {v.dailyRate ? (
                          <span className="font-bold">{formatAmount(v.dailyRate)}/j</span>
                        ) : null}
                      </div>
                    )}

                    {item.currentStatus === 'Loué' && activeRental && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-blue-900 font-semibold">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            {activeRental.clientName}
                          </span>
                          <span className="text-2xs font-mono">{activeRental.rentalNumber}</span>
                        </div>
                        <div className="text-2xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Retour prévu : <strong>{new Date(activeRental.endDate).toLocaleDateString('fr-FR')}</strong>
                        </div>
                      </div>
                    )}

                    {item.currentStatus === 'Réservé' && activeReservation && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-purple-900 font-semibold">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-purple-600" />
                            {activeReservation.clientName}
                          </span>
                          <span className="text-2xs font-mono">{activeReservation.reservationNumber}</span>
                        </div>
                        <div className="text-2xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Période : {new Date(activeReservation.startDate).toLocaleDateString('fr-FR')} au{' '}
                          {new Date(activeReservation.endDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    )}

                    {item.currentStatus === 'En maintenance' && activeMaintenance && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-amber-900 font-semibold">
                          <span className="flex items-center gap-1">
                            <Wrench className="w-3.5 h-3.5 text-amber-600" />
                            {activeMaintenance.type}
                          </span>
                          <span className="text-2xs font-mono">{activeMaintenance.referenceNumber}</span>
                        </div>
                        <div className="text-2xs text-slate-600 truncate">
                          Garage : {activeMaintenance.supplier}
                        </div>
                      </div>
                    )}

                    {item.currentStatus === 'Vendu' && (
                      <div className="text-slate-600">
                        Véhicule cédé • {item.saleCount} vente(s) enregistrée(s)
                      </div>
                    )}
                  </div>

                  {/* Financial Micro Summary */}
                  <div className="mt-3 flex items-center justify-between text-2xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>
                      Revenus : <strong className="text-slate-800">{formatAmount(item.totalRevenue)}</strong>
                    </span>
                    <span>
                      Bénéfice :{' '}
                      <strong className={item.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {formatAmount(item.netProfit)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Bottom Quick Action Footer */}
                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectVehicle(item)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    Fiche 360°
                  </button>

                  <div className="flex items-center gap-1.5">
                    {item.currentStatus === 'Disponible' && (
                      <>
                        <button
                          onClick={() => onQuickRental(v.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-2xs font-bold transition-colors shadow-2xs"
                        >
                          Louer
                        </button>
                        <button
                          onClick={() => onQuickReservation(v.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-2xs font-bold transition-colors shadow-2xs"
                        >
                          Réserver
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onAddMaintenance(v.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-2xs font-bold transition-colors"
                      title="Planifier un entretien"
                    >
                      Atelier
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
