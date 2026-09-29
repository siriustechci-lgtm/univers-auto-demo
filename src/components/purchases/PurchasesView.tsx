import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Purchase } from '../../types';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Truck,
  Building2,
  Calculator,
  ChevronDown,
  Edit2,
  Trash2,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { PurchaseModal } from './PurchaseModal';

export const PurchasesView: React.FC = () => {
  const { purchases, vehicles, createPurchase, updatePurchase, deletePurchase, settings } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchaseToEdit, setPurchaseToEdit] = useState<Purchase | null>(null);
  const [selectedPurchaseDetail, setSelectedPurchaseDetail] = useState<Purchase | null>(null);

  // Filtered purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchSearch =
        p.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [purchases, searchQuery, statusFilter]);

  // Aggregate Metrics
  const totalPurchasesAmount = useMemo(() => {
    return purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
  }, [purchases]);

  const totalCustomsAndTransit = useMemo(() => {
    return purchases.reduce((sum, p) => sum + (p.customsFee || 0) + (p.shippingFee || 0), 0);
  }, [purchases]);

  const inTransitCount = useMemo(() => {
    return purchases.filter((p) => p.status === 'En transit' || p.status === 'En douane' || p.status === 'Commandé').length;
  }, [purchases]);

  const completedCount = useMemo(() => {
    return purchases.filter((p) => p.status === 'Arrivé / En parc' || p.status === 'Clôturé').length;
  }, [purchases]);

  const handleOpenNew = () => {
    setPurchaseToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (purchase: Purchase) => {
    setPurchaseToEdit(purchase);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, number: string) => {
    if (window.confirm(`Confirmez-vous la suppression de l'achat ${number} ?`)) {
      await deletePurchase(id);
    }
  };

  const handleSavePurchase = async (data: Partial<Purchase>) => {
    if (purchaseToEdit) {
      await updatePurchase(purchaseToEdit.id, data);
    } else {
      await createPurchase(data);
    }
  };

  const exportCsv = () => {
    if (filteredPurchases.length === 0) return;
    const headers = [
      'N° Achat',
      'Date',
      'Véhicule',
      'Fournisseur',
      'N° Facture',
      'Prix Achat (FCFA)',
      'Douane (FCFA)',
      'Transit (FCFA)',
      'Transport (FCFA)',
      'Préparation (FCFA)',
      'Autres charges (FCFA)',
      'Coût Total Revient (FCFA)',
      'Statut',
      'Règlement',
    ];

    const rows = filteredPurchases.map((p) => [
      p.purchaseNumber,
      p.date,
      `"${p.vehicleInfo.replace(/"/g, '""')}"`,
      `"${p.supplierName.replace(/"/g, '""')}"`,
      p.invoiceNumber || '',
      p.purchasePrice,
      p.customsFee,
      p.shippingFee,
      p.transportFee,
      p.preparationFee,
      p.otherCharges,
      p.totalCost,
      p.status,
      p.paymentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `achats_approvisionnements_univers_auto_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Achats & Approvisionnements
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914]">
              {purchases.length} enregistrements
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#85878A] mt-1">
            Gestion des approvisionnements, coûts d'importation, douane et coût de revient réel de chaque véhicule
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportCsv}
            disabled={filteredPurchases.length === 0}
            className="px-3.5 py-2.5 rounded-xl border border-[#2D313B] bg-[#12141A] hover:bg-[#1A1D24] text-xs font-semibold text-[#85878A] hover:text-white transition-colors flex items-center gap-2 disabled:opacity-40"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#CC0812] text-xs font-bold text-white transition-all shadow-[0_0_20px_rgba(229,9,20,0.35)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Achat</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D0E12] border border-[#22252E] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#E50914]/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between text-[#85878A] text-xs font-medium mb-2">
            <span>Volume Total d'Achats</span>
            <div className="w-7 h-7 rounded-lg bg-[#E50914]/15 text-[#E50914] flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {totalPurchasesAmount.toLocaleString('fr-FR')} FCFA
          </div>
          <p className="text-[11px] text-[#85878A] mt-1">
            Coût d'acquisition global consolidé
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0E12] border border-[#22252E] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-medium mb-2">
            <span>Frais Douane & Fret</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {totalCustomsAndTransit.toLocaleString('fr-FR')} FCFA
          </div>
          <p className="text-[11px] text-[#85878A] mt-1">
            Frais annexes d'importation
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0E12] border border-[#22252E] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-medium mb-2">
            <span>Arrivés / En Parc</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {completedCount} <span className="text-xs font-normal text-[#85878A]">véhicules</span>
          </div>
          <p className="text-[11px] text-[#85878A] mt-1">
            Prêts ou en vente dans le stock
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0E12] border border-[#22252E] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-medium mb-2">
            <span>En Cours d'Acheminement</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {inTransitCount} <span className="text-xs font-normal text-[#85878A]">dossiers</span>
          </div>
          <p className="text-[11px] text-[#85878A] mt-1">
            En transit maritime ou dédouanement
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0D0E12] border border-[#22252E] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85878A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par n° achat, véhicule, fournisseur..."
            className="w-full pl-10 pr-4 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs sm:text-sm text-white placeholder-[#555A66] focus:outline-none focus:border-[#E50914]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#85878A]">
            <Filter className="w-3.5 h-3.5" />
            <span>Statut :</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
          >
            <option value="all">Tous les statuts</option>
            <option value="Commandé">Commandé</option>
            <option value="En transit">En transit</option>
            <option value="En douane">En douane</option>
            <option value="Arrivé / En parc">Arrivé / En parc</option>
            <option value="Clôturé">Clôturé</option>
          </select>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="rounded-2xl bg-[#0D0E12] border border-[#22252E] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-[#D8D9DB]">
            <thead className="bg-[#12141A] text-[#85878A] text-[11px] uppercase tracking-wider border-b border-[#20242D]">
              <tr>
                <th className="py-3.5 px-4">Réf & Date</th>
                <th className="py-3.5 px-4">Véhicule commandé</th>
                <th className="py-3.5 px-4">Fournisseur & Facture</th>
                <th className="py-3.5 px-4 text-right">Prix d'Achat</th>
                <th className="py-3.5 px-4 text-right">Frais Import</th>
                <th className="py-3.5 px-4 text-right">Coût Réel Revient</th>
                <th className="py-3.5 px-4 text-center">Statut</th>
                <th className="py-3.5 px-4 text-center">Règlement</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2028]">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#85878A]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#14161C] border border-[#2A2E38] flex items-center justify-center text-[#555A66]">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-white">Aucun achat ou approvisionnement trouvé</p>
                      <p className="text-xs text-[#85878A] max-w-sm">
                        {purchases.length === 0
                          ? 'Enregistrez votre premier approvisionnement de véhicule pour débuter le suivi de votre parc automobile.'
                          : 'Aucun enregistrement ne correspond aux filtres appliqués.'}
                      </p>
                      {purchases.length === 0 && (
                        <button
                          onClick={handleOpenNew}
                          className="mt-2 px-4 py-2 rounded-xl bg-[#E50914] text-xs font-bold text-white hover:bg-[#CC0812] transition-colors"
                        >
                          + Enregistrer un premier achat
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => {
                  const importFees = (p.customsFee || 0) + (p.shippingFee || 0) + (p.transportFee || 0) + (p.preparationFee || 0) + (p.otherCharges || 0);

                  const statusColors: Record<string, string> = {
                    'Commandé': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                    'En transit': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                    'En douane': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
                    'Arrivé / En parc': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                    'Clôturé': 'text-[#85878A] bg-zinc-800/40 border-zinc-700/40',
                  };

                  return (
                    <tr key={p.id} className="hover:bg-[#13151D] transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-white block">{p.purchaseNumber}</span>
                        <span className="text-[11px] text-[#85878A] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {p.date}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{p.vehicleInfo}</div>
                        {p.vehicleId && (
                          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
                            Lié au stock
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#85878A]" />
                          <span>{p.supplierName}</span>
                        </div>
                        {p.invoiceNumber && (
                          <span className="text-[11px] text-[#85878A] block font-mono">
                            Fact: {p.invoiceNumber}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-white">
                        {p.purchasePrice.toLocaleString('fr-FR')} FCFA
                      </td>

                      <td className="py-3.5 px-4 text-right text-amber-400 font-medium">
                        +{importFees.toLocaleString('fr-FR')} FCFA
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-[#E50914] text-sm">
                          {p.totalCost.toLocaleString('fr-FR')} FCFA
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            statusColors[p.status] || 'text-zinc-400 bg-zinc-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            p.paymentStatus === 'Payé'
                              ? 'text-emerald-400 bg-emerald-950/40'
                              : 'text-amber-400 bg-amber-950/40'
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPurchaseDetail(p)}
                            title="Détails du coût"
                            className="p-1.5 rounded-lg text-[#85878A] hover:text-white hover:bg-[#1E222C] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(p)}
                            title="Modifier"
                            className="p-1.5 rounded-lg text-[#85878A] hover:text-white hover:bg-[#1E222C] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.purchaseNumber)}
                            title="Supprimer"
                            className="p-1.5 rounded-lg text-[#85878A] hover:text-[#E50914] hover:bg-[#1E222C] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Modal Form */}
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePurchase}
        purchaseToEdit={purchaseToEdit}
        vehicles={vehicles}
      />

      {/* Cost Detail Drawer / Modal */}
      {selectedPurchaseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0E1015] border border-[#2B303B] rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#20242D] pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#E50914]" />
                Fiche de Coût de Revient — {selectedPurchaseDetail.purchaseNumber}
              </h3>
              <button
                onClick={() => setSelectedPurchaseDetail(null)}
                className="text-[#85878A] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#85878A]">
              Véhicule : <span className="text-white font-semibold">{selectedPurchaseDetail.vehicleInfo}</span>
            </div>

            <div className="space-y-2 text-xs bg-[#13151D] p-4 rounded-xl border border-[#222631]">
              <div className="flex justify-between py-1 border-b border-[#1E222C]">
                <span className="text-[#85878A]">Prix d'achat initial :</span>
                <span className="font-semibold text-white">{selectedPurchaseDetail.purchasePrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E222C]">
                <span className="text-[#85878A]">Frais de douane :</span>
                <span className="text-amber-400 font-semibold">+{selectedPurchaseDetail.customsFee.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E222C]">
                <span className="text-[#85878A]">Fret & Transit maritime :</span>
                <span className="text-amber-400 font-semibold">+{selectedPurchaseDetail.shippingFee.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E222C]">
                <span className="text-[#85878A]">Transport local / Remorquage :</span>
                <span className="text-amber-400 font-semibold">+{selectedPurchaseDetail.transportFee.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E222C]">
                <span className="text-[#85878A]">Préparation & Réparations :</span>
                <span className="text-amber-400 font-semibold">+{selectedPurchaseDetail.preparationFee.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E222C]">
                <span className="text-[#85878A]">Autres charges / Taxes :</span>
                <span className="text-amber-400 font-semibold">+{selectedPurchaseDetail.otherCharges.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span className="text-white">Coût Total de Revient Réel :</span>
                <span className="text-[#E50914] text-base">{selectedPurchaseDetail.totalCost.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPurchaseDetail(null)}
                className="px-4 py-2 bg-[#E50914] text-white rounded-xl text-xs font-bold hover:bg-[#CC0812]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
