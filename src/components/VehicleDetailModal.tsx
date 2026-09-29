import React from 'react';
import { useCrm } from '../context/CrmContext';
import { Vehicle, VehicleStatus } from '../types';
import {
  X,
  Car,
  Tag,
  DollarSign,
  KeyRound,
  BadgePercent,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  FileText,
  ArrowUpRight,
  Shield,
  Palette,
  Hash,
} from 'lucide-react';

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onEdit: (vehicle: Vehicle) => void;
  onQuickSale: (vehicleId: string) => void;
  onQuickRental: (vehicleId: string) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onEdit,
  onQuickSale,
  onQuickRental,
}) => {
  const { sales, rentals, maintenances, deleteVehicle, settings } = useCrm();

  if (!isOpen || !vehicle) return null;

  // Filter real sales, rentals & maintenance associated with this specific vehicle
  const vehicleSales = sales.filter((s) => s.vehicleId === vehicle.id);
  const vehicleRentals = rentals.filter((r) => r.vehicleId === vehicle.id);
  const vehicleMaintenances = maintenances.filter((m) => m.vehicleId === vehicle.id);
  const totalMaintenanceCost = vehicleMaintenances.reduce((acc, m) => acc + (m.amount || 0), 0);

  const statusConfig: Record<
    VehicleStatus,
    { label: string; bg: string; text: string; border: string; icon: React.FC<{ className?: string }> }
  > = {
    Disponible: {
      label: 'Disponible',
      bg: 'bg-[#4A7A4A]/10',
      text: 'text-[#4A7A4A]',
      border: 'border-[#4A7A4A]/30',
      icon: CheckCircle2,
    },
    Loué: {
      label: 'En Location',
      bg: 'bg-[#5A5A40]/10',
      text: 'text-[#5A5A40]',
      border: 'border-[#5A5A40]/30',
      icon: KeyRound,
    },
    Vendu: {
      label: 'Vendu',
      bg: 'bg-[#7A7A72]/10',
      text: 'text-[#2D2D2A]',
      border: 'border-[#7A7A72]/30',
      icon: BadgePercent,
    },
    'En maintenance': {
      label: 'En Maintenance',
      bg: 'bg-[#B87320]/10',
      text: 'text-[#B87320]',
      border: 'border-[#B87320]/30',
      icon: Wrench,
    },
    Réservé: {
      label: 'Réservé',
      bg: 'bg-[#4A6B82]/10',
      text: 'text-[#4A6B82]',
      border: 'border-[#4A6B82]/30',
      icon: Clock,
    },
    'En préparation': {
      label: 'En préparation',
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
      border: 'border-amber-500/30',
      icon: Clock,
    },
  };

  const statusStyle = statusConfig[vehicle.status] || statusConfig['Disponible'];
  const StatusIcon = statusStyle.icon;

  const handleDelete = () => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement le véhicule ${vehicle.make} ${vehicle.model} (${vehicle.registration}) ?`
      )
    ) {
      deleteVehicle(vehicle.id);
      onClose();
    }
  };

  return (
    <div
      id="vehicle-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A18]/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="vehicle-detail-modal-dialog"
        className="w-full max-w-3xl rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 text-[#2D2D2A]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5DF] bg-[#F5F5F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                  {vehicle.make} {vehicle.model}
                </h2>
                <span className="text-xs text-[#7A7A72] font-semibold">({vehicle.year})</span>
              </div>
              <p className="text-xs text-[#7A7A72]">
                Fiche technique, historique et tarification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusStyle.label}</span>
            </span>

            <button
              id="vehicle-detail-modal-close"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EBEBE6] transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
          {/* Main Showcase (Photo & Essential Specs) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Photo / Visual */}
            <div className="md:col-span-5">
              {vehicle.photoUrl ? (
                <div className="w-full h-48 rounded-xl border border-[#E5E5DF] overflow-hidden bg-[#FAFAF8] relative shadow-xs">
                  <img
                    src={vehicle.photoUrl}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#1A1A18]/80 text-white font-mono text-[11px] font-bold tracking-wider backdrop-blur-xs">
                    {vehicle.registration}
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 rounded-xl border border-dashed border-[#D5D5CD] bg-[#FAFAF8] flex flex-col items-center justify-center text-center p-4">
                  <Car className="w-12 h-12 text-[#9A9A92] mb-2" />
                  <span className="text-xs font-semibold text-[#1A1A18]">
                    {vehicle.make} {vehicle.model}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#5A5A40] mt-1 px-2 py-0.5 rounded bg-white border border-[#E5E5DF]">
                    {vehicle.registration}
                  </span>
                  <span className="text-[11px] text-[#9A9A92] mt-1">Aucune photo enregistrée</span>
                </div>
              )}
            </div>

            {/* Quick Specs Matrix */}
            <div className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                  <span className="text-[11px] text-[#7A7A72] block font-medium">Immatriculation</span>
                  <span className="font-mono text-sm font-bold text-[#1A1A18] tracking-wider mt-0.5 block">
                    {vehicle.registration}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                  <span className="text-[11px] text-[#7A7A72] block font-medium">Couleur</span>
                  <span className="text-sm font-semibold text-[#1A1A18] mt-0.5 block flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#7A7A72]" />
                    <span>{vehicle.color || 'Non spécifiée'}</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                  <span className="text-[11px] text-[#7A7A72] block font-medium">Kilométrage</span>
                  <span className="text-sm font-semibold text-[#1A1A18] mt-0.5 block">
                    {vehicle.mileage ? `${vehicle.mileage.toLocaleString('fr-FR')} km` : '0 km'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                  <span className="text-[11px] text-[#7A7A72] block font-medium">Carburant & Boîte</span>
                  <span className="text-sm font-semibold text-[#1A1A18] mt-0.5 block truncate">
                    {vehicle.fuelType} • {vehicle.transmission}
                  </span>
                </div>
              </div>

              {/* Tarification Box */}
              <div className="p-3.5 rounded-xl bg-[#F6F6F2] border border-[#5A5A40]/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-[#7A7A72] block">Prix de vente</span>
                  <span className="text-lg font-bold text-[#4A7A4A] font-['Outfit']">
                    {vehicle.sellingPrice
                      ? `${vehicle.sellingPrice.toLocaleString('fr-FR')} ${settings.currencySymbol}`
                      : 'Non à vendre'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-medium text-[#7A7A72] block">Prix location / jour</span>
                  <span className="text-lg font-bold text-[#5A5A40] font-['Outfit']">
                    {vehicle.dailyRate
                      ? `${vehicle.dailyRate.toLocaleString('fr-FR')} ${settings.currencySymbol} / jour`
                      : 'Non à la location'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional details (VIN, Notes) */}
          {(vehicle.vin || vehicle.notes) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {vehicle.vin && (
                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                  <span className="text-[#7A7A72] block font-medium text-[11px]">Numéro de châssis (VIN)</span>
                  <span className="font-mono text-[#1A1A18] font-medium mt-0.5 block">{vehicle.vin}</span>
                </div>
              )}
              {vehicle.notes && (
                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                  <span className="text-[#7A7A72] block font-medium text-[11px]">Notes & Observations</span>
                  <span className="text-[#1A1A18] mt-0.5 block">{vehicle.notes}</span>
                </div>
              )}
            </div>
          )}

          {/* HISTORIQUE : VENTES & LOCATIONS ASSOCIÉES */}
          <div className="space-y-4 pt-2 border-t border-[#E5E5DF]">
            <h3 className="text-sm font-bold text-[#1A1A18] tracking-tight font-['Outfit'] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5A5A40]" />
              <span>Historique commercial du véhicule</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ventes associées */}
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1A18] flex items-center gap-1.5">
                    <BadgePercent className="w-3.5 h-3.5 text-[#4A7A4A]" />
                    <span>Ventes associées</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#7A7A72]">
                    {vehicleSales.length}
                  </span>
                </div>

                {vehicleSales.length === 0 ? (
                  <p className="text-[11px] text-[#9A9A92] italic py-2">
                    Aucune vente enregistrée pour ce véhicule.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {vehicleSales.map((s) => (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-lg bg-white border border-[#E5E5DF] text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-[#1A1A18] block">
                            Vente {s.saleNumber}
                          </span>
                          <span className="text-[11px] text-[#7A7A72]">Client : {s.clientName}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-[#4A7A4A] block">
                            {s.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                          </span>
                          <span className="text-[10px] text-[#7A7A72]">
                            {new Date(s.saleDate || s.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Locations associées */}
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1A18] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Locations associées</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#7A7A72]">
                    {vehicleRentals.length}
                  </span>
                </div>

                {vehicleRentals.length === 0 ? (
                  <p className="text-[11px] text-[#9A9A92] italic py-2">
                    Aucune location enregistrée pour ce véhicule.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {vehicleRentals.map((r) => (
                      <div
                        key={r.id}
                        className="p-2.5 rounded-lg bg-white border border-[#E5E5DF] text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-[#1A1A18] block">
                            Location {r.rentalNumber}
                          </span>
                          <span className="text-[11px] text-[#7A7A72]">
                            Client : {r.clientName} ({r.durationDays} j)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-[#5A5A40] block">
                            {r.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                          </span>
                          <span className="text-[10px] text-[#7A7A72]">
                            Statut : {r.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Maintenance & Entretien */}
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1A18] flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#B87320]" />
                    <span>Entretien & Réparations</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#B87320]">
                      {totalMaintenanceCost.toLocaleString('fr-FR')} {settings.currencySymbol}
                    </span>
                    <span className="text-[11px] font-semibold text-[#7A7A72]">
                      ({vehicleMaintenances.length})
                    </span>
                  </div>
                </div>

                {vehicleMaintenances.length === 0 ? (
                  <p className="text-[11px] text-[#9A9A92] italic py-2">
                    Aucune intervention enregistrée pour ce véhicule.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {vehicleMaintenances.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-lg bg-white border border-[#E5E5DF] text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-[#1A1A18] block">
                            {m.type} — {m.supplier}
                          </span>
                          <span className="text-[11px] text-[#7A7A72]">
                            {new Date(m.date).toLocaleDateString('fr-FR')} {m.mileageAtIntervention ? `• ${m.mileageAtIntervention.toLocaleString('fr-FR')} km` : ''}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-[#B87320] block">
                            {m.amount.toLocaleString('fr-FR')} {settings.currencySymbol}
                          </span>
                          <span className="text-[10px] text-[#7A7A72]">
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: Quick Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E5E5DF] bg-[#F5F5F0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Operation Shortcuts */}
          <div className="flex items-center gap-2">
            {vehicle.status === 'Disponible' && (
              <>
                <button
                  id="vehicle-detail-sale-btn"
                  onClick={() => {
                    onClose();
                    onQuickSale(vehicle.id);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#4A7A4A] hover:bg-[#3E663E] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <BadgePercent className="w-3.5 h-3.5" />
                  <span>Nouvelle vente</span>
                </button>

                <button
                  id="vehicle-detail-rental-btn"
                  onClick={() => {
                    onClose();
                    onQuickRental(vehicle.id);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Nouvelle location</span>
                </button>
              </>
            )}
          </div>

          {/* Manage Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              id="vehicle-detail-edit-btn"
              onClick={() => {
                onClose();
                onEdit(vehicle);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E5DF] hover:bg-[#EBEBE6] text-[#2D2D2A] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Modifier</span>
            </button>

            <button
              id="vehicle-detail-delete-btn"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
