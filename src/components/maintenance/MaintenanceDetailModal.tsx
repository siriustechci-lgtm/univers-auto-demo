import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { MaintenanceIntervention } from '../../types';
import {
  X,
  Wrench,
  Calendar,
  DollarSign,
  Car,
  Building,
  Phone,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Trash2,
  XCircle,
  FileCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface MaintenanceDetailModalProps {
  intervention: MaintenanceIntervention | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenVehicleSheet?: (vehicleId: string) => void;
}

export const MaintenanceDetailModal: React.FC<MaintenanceDetailModalProps> = ({
  intervention,
  isOpen,
  onClose,
  onOpenVehicleSheet,
}) => {
  const { completeMaintenance, cancelMaintenance, deleteMaintenance, vehicles, expenses, settings } = useCrm();

  const [isCompleting, setIsCompleting] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [actualDate, setActualDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen || !intervention) return null;

  const vehicle = vehicles.find((v) => v.id === intervention.vehicleId);
  const linkedExpense = intervention.expenseId
    ? expenses.find((e) => e.id === intervention.expenseId)
    : undefined;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleComplete = () => {
    completeMaintenance(intervention.id, {
      actualDate,
      notes: completionNotes.trim() || undefined,
      autoRevertVehicleAvailable: true,
    });
    setIsCompleting(false);
    onClose();
  };

  const handleCancel = () => {
    if (window.confirm('Voulez-vous vraiment annuler cette intervention ?')) {
      cancelMaintenance(intervention.id, 'Annulé par l’utilisateur');
      onClose();
    }
  };

  const handleDelete = () => {
    if (window.confirm('Voulez-vous vraiment supprimer définitivement cette intervention ?')) {
      deleteMaintenance(intervention.id);
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (st: MaintenanceIntervention['status']) => {
    switch (st) {
      case 'Terminée':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Terminée
          </span>
        );
      case 'En cours':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            En cours (Atelier)
          </span>
        );
      case 'Planifiée':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Calendar className="w-3.5 h-3.5" />
            Planifiée
          </span>
        );
      case 'Annulée':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3.5 h-3.5" />
            Annulée
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id="modal-maintenance-detail-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="modal-maintenance-detail-content"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Printable / Viewable Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-slate-200 px-2 py-0.5 rounded-sm text-slate-800">
                  {intervention.referenceNumber}
                </span>
                {getStatusBadge(intervention.status)}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {intervention.type} — {intervention.vehicleName}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-print-maintenance"
              onClick={handlePrint}
              title="Imprimer la fiche d'intervention"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              id="btn-close-maintenance-detail"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Completion Form popup inside modal if toggled */}
          {isCompleting && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Clôturer l'intervention & libérer le véhicule
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCompleting(false)}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-medium"
                >
                  Annuler
                </button>
              </div>
              <p className="text-xs text-emerald-800">
                Le véhicule <strong>{intervention.vehicleName}</strong> sera automatiquement replacé en statut <strong>Disponible</strong> s'il n'a pas d'autre intervention en cours.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-emerald-900 mb-1">
                    Date effective d'achèvement
                  </label>
                  <input
                    type="date"
                    value={actualDate}
                    onChange={(e) => setActualDate(e.target.value)}
                    className="w-full rounded-lg border border-emerald-300 px-3 py-1.5 text-xs text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-900 mb-1">
                    Commentaire de sortie / PV d'atelier (optionnel)
                  </label>
                  <input
                    type="text"
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Ex: Travaux vérifiés, véhicule propre et prêt"
                    className="w-full rounded-lg border border-emerald-300 px-3 py-1.5 text-xs text-slate-900 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleComplete}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Confirmer la clôture
                </button>
              </div>
            </div>
          )}

          {/* Grid Information Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  Véhicule
                </span>
                {vehicle && onOpenVehicleSheet && (
                  <button
                    onClick={() => {
                      onOpenVehicleSheet(vehicle.id);
                      onClose();
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                  >
                    Fiche d'entretien <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-sm font-bold text-slate-900">{intervention.vehicleName}</p>
              <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5">
                Immatriculation : {intervention.vehicleRegistration}
              </p>
              {vehicle && (
                <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                  <span>Statut : <strong>{vehicle.status}</strong></span>
                  <span>Compteur : <strong>{intervention.mileageAtIntervention || vehicle.mileage} km</strong></span>
                </div>
              )}
            </div>

            {/* Supplier / Garage Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Prestataire / Garage
              </span>
              <p className="text-sm font-bold text-slate-900">{intervention.supplier}</p>
              {intervention.supplierPhone ? (
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={`tel:${intervention.supplierPhone}`}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    {intervention.supplierPhone}
                  </a>
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic mt-1">Numéro non renseigné</p>
              )}
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                <span>Date d'entrée : <strong>{new Date(intervention.date).toLocaleDateString('fr-FR')}</strong></span>
                {intervention.dueDate && (
                  <span>Échéance : <strong>{new Date(intervention.dueDate).toLocaleDateString('fr-FR')}</strong></span>
                )}
              </div>
            </div>
          </div>

          {/* Description of works */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Détail des travaux & pièces
            </span>
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {intervention.description}
            </div>
          </div>

          {/* Financial & Accounting Link */}
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                Montant total des travaux (TTC)
              </span>
              <p className="text-2xl font-black text-indigo-950 mt-0.5">
                {formatCurrency(intervention.amount)}
              </p>
            </div>
            {linkedExpense ? (
              <div className="text-xs text-indigo-900 bg-white/80 p-2.5 rounded-lg border border-indigo-200">
                <span className="font-semibold flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Dépense liée : {linkedExpense.expenseNumber}
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Comptabilisée dans Dépenses ({linkedExpense.category})
                </p>
              </div>
            ) : (
              <span className="text-xs text-slate-500 bg-white/60 px-3 py-1.5 rounded-lg border border-slate-200">
                Non rattaché à une écriture comptable
              </span>
            )}
          </div>

          {/* Next scheduled info if defined */}
          {(intervention.nextScheduledDate || intervention.nextScheduledMileage) && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Prochaine révision / échéance programmée
              </span>
              <div className="flex flex-wrap gap-4 text-xs text-amber-950 pt-1">
                {intervention.nextScheduledDate && (
                  <span>
                    Prochaine date : <strong>{new Date(intervention.nextScheduledDate).toLocaleDateString('fr-FR')}</strong>
                  </span>
                )}
                {intervention.nextScheduledMileage && (
                  <span>
                    Prochain kilométrage : <strong>{intervention.nextScheduledMileage.toLocaleString('fr-FR')} km</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Attached documents */}
          {intervention.documents && intervention.documents.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Documents & Pièces jointes ({intervention.documents.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {intervention.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{doc.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-200 px-1.5 py-0.5 rounded-xs">
                        {doc.type}
                      </span>
                    </div>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal Notes */}
          {intervention.notes && (
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Notes & Remarques
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {intervention.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="btn-delete-maintenance"
              type="button"
              onClick={handleDelete}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer
            </button>
            {intervention.status === 'En cours' && (
              <button
                id="btn-cancel-maintenance"
                type="button"
                onClick={handleCancel}
                className="text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Annuler intervention
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {intervention.status === 'En cours' && !isCompleting && (
              <button
                id="btn-complete-maintenance-open"
                type="button"
                onClick={() => setIsCompleting(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marquer comme Terminée
              </button>
            )}
            <button
              id="btn-close-modal-footer"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
