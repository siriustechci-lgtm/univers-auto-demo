import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  MaintenanceType,
  MaintenanceStatus,
  PaymentMethod,
  MaintenanceDocument,
} from '../../types';
import {
  X,
  Wrench,
  Calendar,
  DollarSign,
  Car,
  Building,
  Phone,
  FileText,
  Gauge,
  Upload,
  Plus,
  Trash2,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicleId?: string;
  initialType?: MaintenanceType;
  initialSupplierId?: string;
}

const MAINTENANCE_TYPES: { type: MaintenanceType; label: string; icon?: string }[] = [
  { type: 'Vidange', label: 'Vidange & Filtres' },
  { type: 'Freinage', label: 'Freinage (Plaquettes / Disques)' },
  { type: 'Pneumatiques', label: 'Pneumatiques (Pneus / Géométrie)' },
  { type: 'Révision générale', label: 'Révision générale périodique' },
  { type: 'Visite technique', label: 'Visite technique (Contrôle technique)' },
  { type: 'Assurance', label: 'Assurance véhicule' },
  { type: 'Réparation moteur', label: 'Réparation mécanique / Moteur' },
  { type: 'Réparation carrosserie', label: 'Carrosserie / Peinture / Vitrage' },
  { type: 'Climatisation', label: 'Climatisation & Chauffage' },
  { type: 'Batterie', label: 'Batterie & Circuit électrique' },
  { type: 'Autre', label: 'Autre intervention' },
];

export const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({
  isOpen,
  onClose,
  initialVehicleId,
  initialType,
  initialSupplierId,
}) => {
  const { vehicles, suppliers, addMaintenance } = useCrm();

  const [vehicleId, setVehicleId] = useState(initialVehicleId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState<MaintenanceType>(initialType || 'Vidange');
  const [status, setStatus] = useState<MaintenanceStatus>('En cours');
  const [supplierId, setSupplierId] = useState(initialSupplierId || '');
  const [supplier, setSupplier] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Virement');
  const [mileageAtIntervention, setMileageAtIntervention] = useState<number | ''>('');
  const [nextScheduledDate, setNextScheduledDate] = useState('');
  const [nextScheduledMileage, setNextScheduledMileage] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Options
  const [autoSetVehicleMaintenance, setAutoSetVehicleMaintenance] = useState(true);
  const [autoRecordExpense, setAutoRecordExpense] = useState(true);

  // Documents attachments
  const [documents, setDocuments] = useState<MaintenanceDocument[]>([]);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<'facture' | 'devis' | 'rapport_ct' | 'certificat_assurance' | 'photo' | 'autre'>('facture');
  const [docUrl, setDocUrl] = useState('');

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialVehicleId) {
      setVehicleId(initialVehicleId);
      const v = vehicles.find((item) => item.id === initialVehicleId);
      if (v) {
        setMileageAtIntervention(v.mileage || '');
      }
    } else if (vehicles.length > 0 && !vehicleId) {
      setVehicleId(vehicles[0].id);
      setMileageAtIntervention(vehicles[0].mileage || '');
    }
  }, [initialVehicleId, vehicles]);

  useEffect(() => {
    if (initialSupplierId) {
      setSupplierId(initialSupplierId);
      const s = suppliers.find((item) => item.id === initialSupplierId);
      if (s) {
        setSupplier(s.name);
        setSupplierPhone(s.phone || '');
      }
    }
  }, [initialSupplierId, suppliers]);

  const handleSupplierSelect = (nameOrId: string) => {
    const found = suppliers.find(
      (s) => s.id === nameOrId || s.name.toLowerCase() === nameOrId.toLowerCase()
    );
    if (found) {
      setSupplierId(found.id);
      setSupplier(found.name);
      if (found.phone) setSupplierPhone(found.phone);
    } else {
      setSupplier(nameOrId);
      setSupplierId('');
    }
  };

  const handleVehicleChange = (id: string) => {
    setVehicleId(id);
    const v = vehicles.find((item) => item.id === id);
    if (v) {
      setMileageAtIntervention(v.mileage || '');
    }
  };

  const handleAddDocument = () => {
    if (!docName.trim()) return;
    const newDoc: MaintenanceDocument = {
      id: 'doc_' + Date.now().toString(),
      name: docName.trim(),
      type: docType,
      url: docUrl.trim() || undefined,
      uploadedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [...prev, newDoc]);
    setDocName('');
    setDocUrl('');
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!vehicleId) errs.vehicleId = 'Veuillez sélectionner un véhicule.';
    if (!date) errs.date = 'La date de l’intervention est obligatoire.';
    if (!supplier.trim()) errs.supplier = 'Le nom du prestataire ou garage est obligatoire.';
    if (!description.trim()) errs.description = 'La description des travaux est obligatoire.';
    if (amount === '' || Number(amount) < 0) {
      errs.amount = 'Veuillez spécifier un montant valide (≥ 0 €).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = addMaintenance({
      vehicleId,
      date,
      dueDate: dueDate || undefined,
      type,
      description: description.trim(),
      supplierId: supplierId || undefined,
      supplier: supplier.trim(),
      supplierPhone: supplierPhone.trim() || undefined,
      amount: Number(amount) || 0,
      status,
      mileageAtIntervention: mileageAtIntervention !== '' ? Number(mileageAtIntervention) : undefined,
      nextScheduledDate: nextScheduledDate || undefined,
      nextScheduledMileage: nextScheduledMileage !== '' ? Number(nextScheduledMileage) : undefined,
      documents,
      notes: notes.trim() || undefined,
      autoSetVehicleMaintenance,
      autoRecordExpense,
      paymentMethod,
    });

    if (result) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  return (
    <div
      id="modal-add-maintenance-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="modal-add-maintenance-content"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Enregistrer une intervention / entretien
              </h2>
              <p className="text-xs text-slate-500">
                Suivi d’atelier, révision, contrôle ou réparation de véhicule
              </p>
            </div>
          </div>
          <button
            id="btn-close-modal-add-maintenance"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Véhicule & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                Véhicule concerné *
              </label>
              <select
                id="select-maintenance-vehicle"
                value={vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.vehicleId ? 'border-rose-400' : 'border-slate-300'
                } px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white`}
              >
                <option value="">-- Sélectionner un véhicule --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.year || 'N/A'}) • {v.registration} • {v.status}
                  </option>
                ))}
              </select>
              {errors.vehicleId && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.vehicleId}
                </p>
              )}
              {selectedVehicle && (
                <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-between">
                  <span>
                    Statut actuel : <strong className="text-slate-800">{selectedVehicle.status}</strong>
                  </span>
                  <span>
                    Kilométrage actuel : <strong className="text-slate-800">{selectedVehicle.mileage?.toLocaleString('fr-FR')} km</strong>
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
                Type d'intervention *
              </label>
              <select
                id="select-maintenance-type"
                value={type}
                onChange={(e) => setType(e.target.value as MaintenanceType)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {MAINTENANCE_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Dates, Statut & Prestataire */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date de l'intervention *
              </label>
              <input
                id="input-maintenance-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.date ? 'border-rose-400' : 'border-slate-300'
                } px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white`}
              />
              {errors.date && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Statut de l'intervention *
              </label>
              <select
                id="select-maintenance-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Planifiée">Planifiée (À venir)</option>
                <option value="En cours">En cours (Véhicule en atelier)</option>
                <option value="Terminée">Terminée (Clôturée)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date d'échéance / fin prévue
              </label>
              <input
                id="input-maintenance-duedate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          {/* Section 3: Prestataire / Garage & Téléphone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Prestataire / Garage / Fournisseur *
              </label>
              <input
                id="input-maintenance-supplier"
                type="text"
                list="suppliers-datalist"
                value={supplier}
                onChange={(e) => handleSupplierSelect(e.target.value)}
                placeholder="Ex: Garage Renault Sirius, Point S, Speedy, Allianz..."
                className={`w-full rounded-xl border ${
                  errors.supplier ? 'border-rose-400' : 'border-slate-300'
                } px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
              />
              <datalist id="suppliers-datalist">
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.category} - {s.city || s.phone})
                  </option>
                ))}
              </datalist>
              {errors.supplier && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.supplier}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Téléphone du prestataire (optionnel)
              </label>
              <input
                id="input-maintenance-supplier-phone"
                type="text"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                placeholder="Ex: 01 45 67 89 00"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 4: Description des travaux */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Description des travaux & pièces remplacées *
            </label>
            <textarea
              id="input-maintenance-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Remplacement huile moteur 5W30 + filtre à huile + filtre à air + contrôle freins..."
              className={`w-full rounded-xl border ${
                errors.description ? 'border-rose-400' : 'border-slate-300'
              } px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.description}
              </p>
            )}
          </div>

          {/* Section 5: Coût & Règlement & Kilométrage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Coût TTC (€) *
              </label>
              <input
                id="input-maintenance-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className={`w-full rounded-xl border ${
                  errors.amount ? 'border-rose-400' : 'border-slate-300'
                } px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.amount && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.amount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mode de règlement
              </label>
              <select
                id="select-maintenance-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Virement">Virement bancaire</option>
                <option value="Carte Bancaire">Carte Bancaire</option>
                <option value="Chèque">Chèque</option>
                <option value="Espèces">Espèces</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                Kilométrage actuel (km)
              </label>
              <input
                id="input-maintenance-mileage"
                type="number"
                min="0"
                value={mileageAtIntervention}
                onChange={(e) =>
                  setMileageAtIntervention(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="Ex: 85400"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 6: Prochaine échéance / rappel */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Planification de la prochaine échéance (optionnel)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Date de prochaine intervention / expiration
                </label>
                <input
                  id="input-maintenance-next-date"
                  type="date"
                  value={nextScheduledDate}
                  onChange={(e) => setNextScheduledDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Mettra à jour la date d'échéance assurance/CT/entretien sur le véhicule.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Kilométrage de la prochaine révision (km)
                </label>
                <input
                  id="input-maintenance-next-mileage"
                  type="number"
                  min="0"
                  value={nextScheduledMileage}
                  onChange={(e) =>
                    setNextScheduledMileage(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="Ex: 100000"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Documents joints / Factures */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              Documents & Justificatifs (Factures, Devis, Rapports)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Nom du document (ex: Facture N° 4589)"
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white"
              >
                <option value="facture">Facture</option>
                <option value="devis">Devis</option>
                <option value="rapport_ct">Rapport Contrôle Technique</option>
                <option value="certificat_assurance">Certificat d'assurance</option>
                <option value="photo">Photo pièce / carrosserie</option>
                <option value="autre">Autre document</option>
              </select>
              <input
                type="text"
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="Lien / Réf. fichier"
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddDocument}
                disabled={!docName.trim()}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter
              </button>
            </div>

            {/* Added documents list */}
            {documents.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-sm bg-indigo-100 text-indigo-700 text-[10px] font-semibold uppercase">
                        {doc.type}
                      </span>
                      <span className="font-medium text-slate-800">{doc.name}</span>
                      {doc.url && <span className="text-slate-400 font-mono">({doc.url})</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 8: Automations & Checkboxes */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Automatisations du système
            </h4>
            <div className="space-y-2 text-xs text-indigo-900">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSetVehicleMaintenance}
                  onChange={(e) => setAutoSetVehicleMaintenance(e.target.checked)}
                  className="rounded-sm text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>
                  Placer immédiatement le véhicule en statut <strong>"En maintenance"</strong> (si intervention en cours)
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRecordExpense}
                  onChange={(e) => setAutoRecordExpense(e.target.checked)}
                  className="rounded-sm text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>
                  Enregistrer automatiquement une dépense dans le module <strong>Comptabilité</strong> ({amount ? `${amount} €` : 'au montant saisi'})
                </span>
              </label>
            </div>
          </div>

          {/* Section 9: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes & Observations internes (optionnel)
            </label>
            <textarea
              id="input-maintenance-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions pour l'atelier, garanties, remarques particulières..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              id="btn-cancel-add-maintenance"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              id="btn-submit-add-maintenance"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              Enregistrer l'intervention
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
