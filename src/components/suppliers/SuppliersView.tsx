import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Supplier, SupplierCategory, SupplierStatus } from '../../types';
import { SupplierStatsCards } from './SupplierStatsCards';
import { AddSupplierModal } from './AddSupplierModal';
import { SupplierDetailModal } from './SupplierDetailModal';
import { AddMaintenanceModal } from '../maintenance/AddMaintenanceModal';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit2,
  Trash2,
  MessageSquare,
  Wrench,
  Receipt,
  User,
  SlidersHorizontal,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES_LIST: SupplierCategory[] = [
  'Garage',
  'Mécanicien',
  'Carrossier',
  'Assureur',
  'Pièces détachées',
  'Station-service',
  'Dépannage / Remorquage',
  'Contrôle technique',
  'Lavage & Esthétique',
  'Prestataire divers',
];

export const SuppliersView: React.FC = () => {
  const {
    suppliers,
    maintenances,
    expenses,
    getSupplierStats,
    deleteSupplier,
    settings,
  } = useCrm();

  const currency = settings.currency || 'FCFA';

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'invoiced' | 'interventions'>('name');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [selectedSupplierForDetail, setSelectedSupplierForDetail] = useState<Supplier | null>(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [prefilledSupplier, setPrefilledSupplier] = useState<Supplier | null>(null);

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
          s.phone.includes(searchTerm) ||
          (s.secondaryPhone && s.secondaryPhone.includes(searchTerm)) ||
          (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (s.city && s.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
          s.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'invoiced') {
          const statsA = getSupplierStats(a.id);
          const statsB = getSupplierStats(b.id);
          return statsB.totalInvoiced - statsA.totalInvoiced;
        }
        if (sortBy === 'interventions') {
          const statsA = getSupplierStats(a.id);
          const statsB = getSupplierStats(b.id);
          return statsB.interventionsCount - statsA.interventionsCount;
        }
        return 0;
      });
  }, [suppliers, searchTerm, selectedCategory, selectedStatus, sortBy, getSupplierStats]);

  const formatAmount = (val: number) => {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(val || 0))} ${currency}`;
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

  // Export CSV
  const handleExportCSV = () => {
    if (suppliers.length === 0) return;

    const headers = [
      'Nom',
      'Catégorie',
      'Contact',
      'Téléphone',
      'Email',
      'Ville',
      'Adresse',
      'Statut',
      'Total Facturé',
      'Interventions',
    ];

    const rows = suppliers.map((s) => {
      const stats = getSupplierStats(s.id);
      return [
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.category}"`,
        `"${(s.contactPerson || '').replace(/"/g, '""')}"`,
        `"${s.phone}"`,
        `"${s.email || ''}"`,
        `"${s.city || ''}"`,
        `"${(s.address || '').replace(/"/g, '""')}"`,
        `"${s.status}"`,
        `"${stats.totalInvoiced}"`,
        `"${stats.interventionsCount}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fournisseurs_sirius_auto_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Fournisseurs & Prestataires
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralisez la gestion de vos partenaires : garages, mécaniciens, assureurs, pièces détachées et prestataires.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {suppliers.length > 0 && (
            <button
              id="btn-export-suppliers-csv"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors shadow-2xs"
              title="Exporter au format CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Exporter CSV
            </button>
          )}

          <button
            id="btn-open-add-supplier"
            onClick={() => {
              setSupplierToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau fournisseur
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <SupplierStatsCards
        suppliers={suppliers}
        maintenances={maintenances}
        expenses={expenses}
        settings={settings}
      />

      {/* Main Table / Directory Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search and Filters Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-suppliers"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, ville, téléphone, spécialité..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Category Filter */}
            <select
              id="select-filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Toutes catégories ({suppliers.length})</option>
              {CATEGORIES_LIST.map((cat) => {
                const count = suppliers.filter((s) => s.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </select>

            {/* Status Filter */}
            <select
              id="select-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tous statuts</option>
              <option value="Actif">Actifs uniquement</option>
              <option value="Inactif">Inactifs</option>
              <option value="Suspendu">Suspendus</option>
            </select>

            {/* Sort Filter */}
            <select
              id="select-filter-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="name">Trier par Nom (A-Z)</option>
              <option value="invoiced">Trier par Montant facturé</option>
              <option value="interventions">Trier par Nbre interventions</option>
            </select>
          </div>
        </div>

        {/* Suppliers Table */}
        {filteredSuppliers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-3">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {suppliers.length === 0
                ? 'Aucun fournisseur enregistré'
                : 'Aucun partenaire ne correspond à vos critères'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {suppliers.length === 0
                ? 'Ajoutez vos garages habituels, assureurs et fournisseurs de pièces pour centraliser vos entretiens et factures.'
                : 'Essayez de modifier vos termes de recherche ou de réinitialiser les filtres sélectionnés.'}
            </p>
            {suppliers.length === 0 && (
              <button
                onClick={() => {
                  setSupplierToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter un premier partenaire
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Fournisseur & Spécialité</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Téléphone & WhatsApp</th>
                  <th className="py-3 px-4">Email / Ville</th>
                  <th className="py-3 px-4 text-center">Interventions</th>
                  <th className="py-3 px-4 text-right">Total Facturé</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredSuppliers.map((s) => {
                  const stats = getSupplierStats(s.id);
                  const cleanPhone = (s.secondaryPhone || s.phone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr
                      key={s.id}
                      id={`row-supplier-${s.id}`}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedSupplierForDetail(s)}
                    >
                      {/* Name & Contact Person */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                            {s.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block group-hover:text-indigo-600 transition-colors">
                              {s.name}
                            </span>
                            {s.contactPerson ? (
                              <span className="text-2xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <User className="w-3 h-3 text-slate-400" />
                                {s.contactPerson}
                              </span>
                            ) : (
                              <span className="text-2xs text-slate-400">Sans contact assigné</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-2xs font-semibold border ${getCategoryBadgeClass(
                            s.category
                          )}`}
                        >
                          {s.category}
                        </span>
                      </td>

                      {/* Phone & WhatsApp */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${s.phone}`}
                              className="font-semibold text-slate-800 hover:text-indigo-600 flex items-center gap-1"
                              title="Appeler"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              {s.phone}
                            </a>
                          </div>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-2xs text-emerald-700 hover:underline font-medium"
                              title="Envoyer un WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Email / City */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {s.city ? (
                            <span className="font-medium text-slate-800 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {s.city}
                            </span>
                          ) : (
                            <span className="text-slate-400">Non précisée</span>
                          )}
                          {s.email && (
                            <span className="text-2xs text-slate-500 block truncate max-w-[140px]" title={s.email}>
                              {s.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Interventions Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-xs font-bold ${
                            stats.interventionsCount > 0
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {stats.interventionsCount}
                        </span>
                      </td>

                      {/* Total Invoiced / Spent */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-slate-900 text-xs block">
                          {formatAmount(stats.totalInvoiced)}
                        </span>
                        {stats.expensesCount > 0 && (
                          <span className="text-2xs text-slate-500">
                            {stats.expensesCount} paiement(s)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-2xs font-semibold border ${getStatusBadgeClass(
                            s.status
                          )}`}
                        >
                          {s.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-view-supplier-${s.id}`}
                            onClick={() => setSelectedSupplierForDetail(s)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Voir la fiche détaillée"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            id={`btn-edit-supplier-${s.id}`}
                            onClick={() => {
                              setSupplierToEdit(s);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            id={`btn-delete-supplier-${s.id}`}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Confirmez-vous la suppression du fournisseur ${s.name} ?`
                                )
                              ) {
                                deleteSupplier(s.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSupplierToEdit(null);
        }}
        supplierToEdit={supplierToEdit}
      />

      <SupplierDetailModal
        isOpen={!!selectedSupplierForDetail}
        onClose={() => setSelectedSupplierForDetail(null)}
        supplier={selectedSupplierForDetail}
        onEdit={(s) => {
          setSelectedSupplierForDetail(null);
          setSupplierToEdit(s);
          setIsAddModalOpen(true);
        }}
        onNewIntervention={(s) => {
          setSelectedSupplierForDetail(null);
          setPrefilledSupplier(s);
          setIsMaintenanceModalOpen(true);
        }}
      />

      <AddMaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => {
          setIsMaintenanceModalOpen(false);
          setPrefilledSupplier(null);
        }}
      />
    </div>
  );
};
