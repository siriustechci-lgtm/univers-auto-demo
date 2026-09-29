import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { MaintenanceIntervention, Vehicle } from '../../types';
import {
  X,
  Wrench,
  Car,
  Calendar,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Clock,
  CheckCircle2,
  Printer,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Building,
} from 'lucide-react';

interface VehicleMaintenanceSheetModalProps {
  vehicleId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onNewIntervention: (vehicleId: string) => void;
  onSelectIntervention: (intervention: MaintenanceIntervention) => void;
}

export const VehicleMaintenanceSheetModal: React.FC<VehicleMaintenanceSheetModalProps> = ({
  vehicleId,
  isOpen,
  onClose,
  onNewIntervention,
  onSelectIntervention,
}) => {
  const { vehicles, maintenances, getMaintenanceCostByVehicle, settings } = useCrm();

  const [typeFilter, setTypeFilter] = useState<string>('all');

  if (!isOpen || !vehicleId) return null;

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) return null;

  const vehicleMaintenances = maintenances.filter((m) => m.vehicleId === vehicle.id);
  const filteredInterventions = vehicleMaintenances.filter((m) => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    return true;
  });

  const costStats = getMaintenanceCostByVehicle(vehicle.id);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Insurance status
  const getInsuranceStatus = () => {
    if (!vehicle.insuranceExpiryDate) return { label: 'Non renseignée', color: 'text-slate-400 bg-slate-100' };
    const exp = new Date(vehicle.insuranceExpiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `Expirée le ${exp.toLocaleDateString('fr-FR')}`, color: 'text-rose-700 bg-rose-100 border-rose-200' };
    if (diffDays <= 30) return { label: `Expire sous ${diffDays} j (${exp.toLocaleDateString('fr-FR')})`, color: 'text-amber-700 bg-amber-100 border-amber-200' };
    return { label: `Valide jusqu'au ${exp.toLocaleDateString('fr-FR')}`, color: 'text-emerald-700 bg-emerald-100 border-emerald-200' };
  };

  // Technical inspection status
  const getInspectionStatus = () => {
    if (!vehicle.technicalInspectionExpiryDate) return { label: 'Non renseignée', color: 'text-slate-400 bg-slate-100' };
    const exp = new Date(vehicle.technicalInspectionExpiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `Expirée le ${exp.toLocaleDateString('fr-FR')}`, color: 'text-rose-700 bg-rose-100 border-rose-200' };
    if (diffDays <= 30) return { label: `Échéance sous ${diffDays} j (${exp.toLocaleDateString('fr-FR')})`, color: 'text-amber-700 bg-amber-100 border-amber-200' };
    return { label: `Valide jusqu'au ${exp.toLocaleDateString('fr-FR')}`, color: 'text-emerald-700 bg-emerald-100 border-emerald-200' };
  };

  const insStatus = getInsuranceStatus();
  const inspStatus = getInspectionStatus();

  return (
    <div
      id="modal-vehicle-sheet-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="modal-vehicle-sheet-content"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {vehicle.make} {vehicle.model} ({vehicle.year || 'N/A'})
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-800 font-mono">
                  {vehicle.registration}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    vehicle.status === 'En maintenance'
                      ? 'bg-amber-100 text-amber-800'
                      : vehicle.status === 'Disponible'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {vehicle.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Fiche d'entretien & Historique complet des réparations et révisions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-print-sheet"
              onClick={handlePrint}
              title="Imprimer la fiche d'entretien"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              id="btn-close-vehicle-sheet"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Identity & KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Kilométrage actuel</span>
              <p className="text-base font-bold text-slate-900 mt-1">
                {vehicle.mileage?.toLocaleString('fr-FR')} km
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Dépenses totales</span>
              <p className="text-base font-bold text-indigo-600 mt-1">
                {formatCurrency(costStats.totalCost)}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Interventions</span>
              <p className="text-base font-bold text-slate-900 mt-1">
                {costStats.interventionCount} enregistrée(s)
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Dernière révision</span>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                {costStats.lastDate
                  ? new Date(costStats.lastDate).toLocaleDateString('fr-FR')
                  : vehicle.lastMaintenanceDate
                  ? new Date(vehicle.lastMaintenanceDate).toLocaleDateString('fr-FR')
                  : 'Aucune'}
              </p>
            </div>
          </div>

          {/* Compliance & Deadlines: Assurance & Contrôle Technique */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assurance */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Assurance Véhicule
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${insStatus.color}`}>
                  {insStatus.label}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1 mt-2">
                <p>
                  Date d'échéance :{' '}
                  <strong className="text-slate-800">
                    {vehicle.insuranceExpiryDate
                      ? new Date(vehicle.insuranceExpiryDate).toLocaleDateString('fr-FR')
                      : 'Non spécifiée'}
                  </strong>
                </p>
              </div>
            </div>

            {/* Contrôle Technique */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Contrôle / Visite Technique
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${inspStatus.color}`}>
                  {inspStatus.label}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1 mt-2">
                <p>
                  Date de prochaine visite :{' '}
                  <strong className="text-slate-800">
                    {vehicle.technicalInspectionExpiryDate
                      ? new Date(vehicle.technicalInspectionExpiryDate).toLocaleDateString('fr-FR')
                      : 'Non spécifiée'}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* Interventions History Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  Historique des interventions ({vehicleMaintenances.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 bg-white"
                >
                  <option value="all">Tous les types</option>
                  <option value="Vidange">Vidange</option>
                  <option value="Freinage">Freinage</option>
                  <option value="Pneumatiques">Pneumatiques</option>
                  <option value="Révision générale">Révision générale</option>
                  <option value="Visite technique">Visite technique</option>
                  <option value="Assurance">Assurance</option>
                  <option value="Réparation moteur">Réparation moteur</option>
                  <option value="Réparation carrosserie">Réparation carrosserie</option>
                  <option value="Climatisation">Climatisation</option>
                  <option value="Batterie">Batterie</option>
                  <option value="Autre">Autre</option>
                </select>
                <button
                  id="btn-add-intervention-for-vehicle"
                  onClick={() => {
                    onNewIntervention(vehicle.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nouvelle intervention
                </button>
              </div>
            </div>

            {/* List or Table */}
            {filteredInterventions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Aucune intervention enregistrée</p>
                <p className="text-xs text-slate-500 mt-1">
                  Ce véhicule ne possède pas encore d'historique de réparation ou d'entretien.
                </p>
                <button
                  onClick={() => onNewIntervention(vehicle.id)}
                  className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  + Créer la première intervention
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Réf / Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Prestataire & Description</th>
                      <th className="py-2.5 px-3">Statut</th>
                      <th className="py-2.5 px-3 text-right">Montant</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInterventions.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => onSelectIntervention(m)}
                      >
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-slate-900 block">
                            {m.referenceNumber}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(m.date).toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {m.type}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800">{m.supplier}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{m.description}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              m.status === 'Terminée'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.status === 'En cours'
                                ? 'bg-amber-100 text-amber-800'
                                : m.status === 'Planifiée'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(m.amount)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectIntervention(m);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs"
                          >
                            Détails →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {settings?.agencyName || 'Sirius Auto CRM'} • Fiche d'entretien certifiée
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
