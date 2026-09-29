import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Supplier, MaintenanceIntervention, Expense } from '../../types';
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  User,
  Wrench,
  Receipt,
  Calendar,
  DollarSign,
  ExternalLink,
  Edit2,
  Trash2,
  MessageSquare,
  Clock,
  Car,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface SupplierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onEdit: (supplier: Supplier) => void;
  onNewIntervention?: (supplier: Supplier) => void;
}

type TabType = 'interventions' | 'expenses' | 'details' | 'documents';

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onEdit,
  onNewIntervention,
}) => {
  const {
    getSupplierStats,
    getSupplierInterventions,
    getSupplierExpenses,
    deleteSupplier,
    settings,
  } = useCrm();

  const [activeTab, setActiveTab] = useState<TabType>('interventions');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !supplier) return null;

  const currency = settings.currency || 'FCFA';
  const stats = getSupplierStats(supplier.id);
  const interventions = getSupplierInterventions(supplier.id);
  const expenses = getSupplierExpenses(supplier.id);

  const formatAmount = (val: number) => {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(val || 0))} ${currency}`;
  };

  const cleanPhone = (supplier.secondaryPhone || supplier.phone || '').replace(/[^0-9]/g, '');

  const handleDelete = () => {
    deleteSupplier(supplier.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'Garage':
      case 'Mécanicien':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Carrossier':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Assureur':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Pièces détachées':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Station-service':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Dépannage / Remorquage':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Contrôle technique':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeClass = (st: string) => {
    switch (st) {
      case 'Actif':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Inactif':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Suspendu':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="modal-supplier-detail"
        className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header with quick identity and actions */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm shrink-0">
                {supplier.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{supplier.name}</h2>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getCategoryBadgeClass(
                      supplier.category
                    )}`}
                  >
                    {supplier.category}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadgeClass(
                      supplier.status
                    )}`}
                  >
                    {supplier.status}
                  </span>
                </div>
                {supplier.contactPerson && (
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Contact : <span className="font-semibold text-slate-800">{supplier.contactPerson}</span>
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                  {supplier.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {supplier.city}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {supplier.phone}
                  </span>
                  {supplier.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {supplier.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Contact & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 self-end sm:self-start">
              {supplier.phone && (
                <a
                  id="btn-call-supplier"
                  href={`tel:${supplier.phone}`}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Appeler par téléphone"
                >
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  Appeler
                </a>
              )}

              {cleanPhone && (
                <a
                  id="btn-whatsapp-supplier"
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Envoyer un message WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp
                </a>
              )}

              {supplier.email && (
                <a
                  id="btn-email-supplier"
                  href={`mailto:${supplier.email}`}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Envoyer un email"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  Email
                </a>
              )}

              {onNewIntervention && (
                <button
                  id="btn-new-intervention-supplier"
                  onClick={() => onNewIntervention(supplier)}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Intervention
                </button>
              )}

              <button
                id="btn-edit-supplier"
                onClick={() => onEdit(supplier)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                id="btn-delete-supplier"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delete confirmation banner */}
          {showDeleteConfirm && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-medium text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Êtes-vous certain de vouloir supprimer le fournisseur <strong>{supplier.name}</strong> ?
                  L'historique des interventions passées sera conservé.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
              <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">
                Total Facturé
              </span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {formatAmount(stats.totalInvoiced)}
              </span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
              <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">
                Interventions
              </span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {stats.interventionsCount} réalisation(s)
              </span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
              <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">
                Dépenses liées
              </span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {stats.expensesCount} paiement(s)
              </span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
              <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">
                Dernière activité
              </span>
              <span className="text-xs font-bold text-slate-800 mt-1 block">
                {stats.lastInterventionDate
                  ? new Date(stats.lastInterventionDate).toLocaleDateString('fr-FR')
                  : 'Aucune'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 flex gap-6 bg-white shrink-0">
          <button
            id="tab-supplier-interventions"
            onClick={() => setActiveTab('interventions')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'interventions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Interventions Atelier ({interventions.length})
          </button>

          <button
            id="tab-supplier-expenses"
            onClick={() => setActiveTab('expenses')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'expenses'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Historique Comptable ({expenses.length})
          </button>

          <button
            id="tab-supplier-details"
            onClick={() => setActiveTab('details')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Coordonnées & Facturation
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto grow">
          {/* 1. Tab Interventions */}
          {activeTab === 'interventions' && (
            <div className="space-y-4">
              {interventions.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                  <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Aucune intervention enregistrée</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Ce prestataire n'a pas encore été sollicité pour une intervention sur votre parc automobile.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Réf / Date</th>
                        <th className="py-2.5 px-3">Véhicule</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-right">Montant</th>
                        <th className="py-2.5 px-3 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {interventions.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-900 block">{m.referenceNumber}</span>
                            <span className="text-2xs text-slate-500">
                              {new Date(m.date).toLocaleDateString('fr-FR')}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-800 block">{m.vehicleName}</span>
                            <span className="text-2xs font-mono text-indigo-600">{m.vehicleRegistration}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                              {m.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 max-w-xs truncate text-slate-600" title={m.description}>
                            {m.description}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">
                            {formatAmount(m.amount)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${
                                m.status === 'Terminée'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : m.status === 'En cours'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : m.status === 'Planifiée'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {m.status}
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

          {/* 2. Tab Expenses */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                  <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Aucune dépense comptable enregistrée</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Les dépenses liées aux interventions ou factures de ce partenaire apparaîtront ici.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">N° Pièce / Date</th>
                        <th className="py-2.5 px-3">Catégorie</th>
                        <th className="py-2.5 px-3">Libellé</th>
                        <th className="py-2.5 px-3">Paiement</th>
                        <th className="py-2.5 px-3 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {expenses.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-900 block">{e.expenseNumber}</span>
                            <span className="text-2xs text-slate-500">
                              {new Date(e.date).toLocaleDateString('fr-FR')}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                              {e.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 max-w-xs truncate text-slate-700" title={e.description}>
                            {e.description}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-medium">
                            {e.paymentMethod}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">
                            {formatAmount(e.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. Tab Coordonnées & Facturation */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coordonnées */}
              <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                  <Phone className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Contacts & Localisation
                  </h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Téléphone principal :</span>
                    <span className="font-semibold text-slate-800 text-sm">{supplier.phone}</span>
                  </div>

                  {supplier.secondaryPhone && (
                    <div>
                      <span className="text-slate-400 block font-medium">Téléphone 2 / Mobile / WhatsApp :</span>
                      <span className="font-semibold text-slate-800">{supplier.secondaryPhone}</span>
                    </div>
                  )}

                  {supplier.email && (
                    <div>
                      <span className="text-slate-400 block font-medium">Email professionnel :</span>
                      <span className="font-semibold text-slate-800">{supplier.email}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 block font-medium">Adresse physique :</span>
                    <span className="font-semibold text-slate-800">
                      {supplier.address || 'Non spécifiée'}
                      {supplier.city ? `, ${supplier.city}` : ''}
                      {supplier.postalCode ? ` (${supplier.postalCode})` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informations Bancaires & Commerciales */}
              <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Facturation & Règlement
                  </h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">N° Fiscal / NIF / RCCM :</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {supplier.taxNumber || 'Non renseigné'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Modalités de règlement :</span>
                    <span className="font-semibold text-slate-800">
                      {supplier.paymentTerms || 'Comptant'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">RIB / IBAN / Mobile Money :</span>
                    <p className="font-mono text-slate-800 mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                      {supplier.bankDetails || 'Aucune coordonnée bancaire enregistrée'}
                    </p>
                  </div>

                  {supplier.notes && (
                    <div>
                      <span className="text-slate-400 block font-medium">Notes & Accords tarifaires :</span>
                      <p className="text-slate-700 mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                        {supplier.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Fournisseur ID : <span className="font-mono">{supplier.id}</span>
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
