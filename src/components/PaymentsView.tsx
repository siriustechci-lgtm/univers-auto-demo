import React, { useState, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { Payment, PaymentMethod, PaymentStatus, Rental, Sale } from '../types';
import { EmptyState } from './EmptyState';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  Trash2,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Filter,
  FileText,
  Printer,
  Eye,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  ChevronRight,
  User,
} from 'lucide-react';

interface PaymentsViewProps {
  onOpenPaymentModal: (clientId?: string, refType?: 'sale' | 'rental' | 'direct', refId?: string) => void;
  onOpenPaymentDetail: (payment: Payment) => void;
  onOpenRefundDeposit: (rental: Rental) => void;
  onViewDocument: (
    type: 'payment' | 'sale' | 'sale_receipt' | 'rental' | 'rental_invoice' | 'rental_receipt',
    data: { paymentData?: Payment; saleData?: Sale; rentalData?: Rental }
  ) => void;
  searchQuery: string;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onOpenPaymentModal,
  onOpenPaymentDetail,
  onOpenRefundDeposit,
  onViewDocument,
  searchQuery,
}) => {
  const { payments, sales, rentals, deletePayment, settings } = useCrm();

  // Active section tab inside Payments module
  const [activeSection, setActiveSection] = useState<'journal' | 'deposits' | 'due'>('journal');

  // Filters
  const [localSearch, setLocalSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'rental' | 'deposit' | 'deposit_refund' | 'direct'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const activeSearch = (searchQuery || localSearch).trim().toLowerCase();

  // Date calculation helpers
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  // Financial Aggregations
  const totalPaid = useMemo(() => {
    return payments
      .filter((p) => (p.status === 'Payé' || p.status === 'Validé') && p.referenceType !== 'deposit_refund')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const totalRefunded = useMemo(() => {
    return payments
      .filter((p) => p.referenceType === 'deposit_refund' || p.status === 'Remboursé')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  // Balance due calculation across all sales & rentals
  const totalBalanceDueSales = useMemo(() => {
    return sales.reduce((sum, s) => sum + (s.balanceDue ?? Math.max(0, s.totalAmount - (s.amountPaid || 0))), 0);
  }, [sales]);

  const totalBalanceDueRentals = useMemo(() => {
    return rentals.reduce((sum, r) => sum + (r.balanceDue ?? Math.max(0, r.totalAmount - (r.amountPaid || 0))), 0);
  }, [rentals]);

  const totalRemainingDue = totalBalanceDueSales + totalBalanceDueRentals;

  // Deposits in vault (cautions en caisse)
  const depositsInVault = useMemo(() => {
    return rentals
      .filter((r) => !r.depositReturned && (r.depositAmount || 0) > 0 && r.status !== 'Annulé')
      .reduce((sum, r) => sum + (r.depositAmount || 0) - (r.depositRefundedAmount || 0), 0);
  }, [rentals]);

  const depositsRefundedTotal = useMemo(() => {
    return rentals.reduce((sum, r) => sum + (r.depositRefundedAmount || 0), 0);
  }, [rentals]);

  // Filtered Payments list
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // 1. Search Query
      if (activeSearch) {
        const matchesRef = p.paymentNumber.toLowerCase().includes(activeSearch);
        const matchesClient = p.clientName.toLowerCase().includes(activeSearch);
        const matchesPhone = (p.clientPhone || '').toLowerCase().includes(activeSearch);
        const matchesTitle = p.referenceTitle.toLowerCase().includes(activeSearch);
        if (!matchesRef && !matchesClient && !matchesPhone && !matchesTitle) {
          return false;
        }
      }

      // 2. Period
      if (periodFilter === 'today') {
        if (p.paymentDate < todayStr) return false;
      } else if (periodFilter === 'week') {
        if (p.paymentDate < startOfWeekStr) return false;
      } else if (periodFilter === 'month') {
        if (p.paymentDate < startOfMonthStr) return false;
      }

      // 3. Type
      if (typeFilter !== 'all') {
        if (typeFilter === 'deposit') {
          if (p.referenceType !== 'deposit' && !p.referenceTitle.toLowerCase().includes('caution')) return false;
        } else if (p.referenceType !== typeFilter) {
          return false;
        }
      }

      // 4. Method
      if (methodFilter !== 'all' && p.paymentMethod !== methodFilter) {
        return false;
      }

      // 5. Status
      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [payments, activeSearch, periodFilter, typeFilter, methodFilter, statusFilter, todayStr, startOfWeekStr, startOfMonthStr]);

  // Rentals with deposits list
  const rentalsWithDeposits = useMemo(() => {
    return rentals.filter((r) => (r.depositAmount || 0) > 0);
  }, [rentals]);

  // Sales & Rentals with pending balance
  const dueItems = useMemo(() => {
    const dueSales = sales
      .filter((s) => (s.balanceDue ?? Math.max(0, s.totalAmount - (s.amountPaid || 0))) > 0)
      .map((s) => ({
        type: 'sale' as const,
        id: s.id,
        referenceNumber: s.saleNumber,
        date: s.saleDate,
        clientId: s.clientId,
        clientName: s.clientName,
        vehicleName: s.vehicleName,
        totalAmount: s.totalAmount,
        amountPaid: s.amountPaid || 0,
        balanceDue: s.balanceDue ?? Math.max(0, s.totalAmount - (s.amountPaid || 0)),
      }));

    const dueRentals = rentals
      .filter((r) => (r.balanceDue ?? Math.max(0, r.totalAmount - (r.amountPaid || 0))) > 0)
      .map((r) => ({
        type: 'rental' as const,
        id: r.id,
        referenceNumber: r.rentalNumber,
        date: r.startDate,
        clientId: r.clientId,
        clientName: r.clientName,
        vehicleName: r.vehicleName,
        totalAmount: r.totalAmount,
        amountPaid: r.amountPaid || 0,
        balanceDue: r.balanceDue ?? Math.max(0, r.totalAmount - (r.amountPaid || 0)),
      }));

    return [...dueSales, ...dueRentals].sort((a, b) => b.balanceDue - a.balanceDue);
  }, [sales, rentals]);

  return (
    <div id="payments-view" className="space-y-6">
      {/* Header & Global Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A18] tracking-tight font-['Outfit']">
            Paiements & Cautions
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7A72]">
            Gestion intégrale des encaissements, dépôts de garantie et soldes restants
          </p>
        </div>

        <button
          id="payments-add-btn"
          onClick={() => onOpenPaymentModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nouveau paiement</span>
        </button>
      </div>

      {/* 4 Key Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Encaissé */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#7A7A72] uppercase tracking-wider">
              Total Encaissé
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#4A7A4A]/10 text-[#4A7A4A] flex items-center justify-center">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#4A7A4A] font-['Outfit'] font-mono">
            +{totalPaid.toLocaleString('fr-FR')} {settings.currencySymbol}
          </div>
          <span className="text-[10px] text-[#7A7A72]">Règlements validés</span>
        </div>

        {/* Reste à Payer */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#7A7A72] uppercase tracking-wider">
              Reste à Payer
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#B87320]/10 text-[#B87320] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#B87320] font-['Outfit'] font-mono">
            {totalRemainingDue.toLocaleString('fr-FR')} {settings.currencySymbol}
          </div>
          <span className="text-[10px] text-[#7A7A72]">
            {dueItems.length} dossier{dueItems.length > 1 ? 's' : ''} en attente de solde
          </span>
        </div>

        {/* Cautions en Caisse */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#7A7A72] uppercase tracking-wider">
              Cautions en Caisse
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#1A1A18] font-['Outfit'] font-mono">
            {depositsInVault.toLocaleString('fr-FR')} {settings.currencySymbol}
          </div>
          <span className="text-[10px] text-[#7A7A72]">Garanties actives non restituées</span>
        </div>

        {/* Cautions Restituées */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#7A7A72] uppercase tracking-wider">
              Cautions Restituées
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-blue-700 font-['Outfit'] font-mono">
            {depositsRefundedTotal.toLocaleString('fr-FR')} {settings.currencySymbol}
          </div>
          <span className="text-[10px] text-[#7A7A72]">Total remboursé aux clients</span>
        </div>
      </div>

      {/* Module Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E5DF] pb-2 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveSection('journal')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'journal'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Journal des Paiements ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('deposits')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'deposits'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Gestion des Cautions ({rentalsWithDeposits.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('due')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'due'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Soldes Dûs & Échéances ({dueItems.length})</span>
        </button>
      </div>

      {/* ---------------- SECTION 1: JOURNAL DES PAIEMENTS ---------------- */}
      {activeSection === 'journal' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Period Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-[#7A7A72] font-semibold mr-1 shrink-0">Période :</span>
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'today', label: "Aujourd'hui" },
                  { id: 'week', label: 'Cette semaine' },
                  { id: 'month', label: 'Ce mois' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPeriodFilter(p.id as any)}
                    className={`px-2.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      periodFilter === p.id
                        ? 'bg-[#5A5A40] text-white font-semibold shadow-xs'
                        : 'bg-[#FAFAF8] text-[#5A5A52] hover:text-[#1A1A18] border border-[#E5E5DF]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                <input
                  type="text"
                  placeholder="Réf, client, téléphone..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Sub Filters: Type, Method & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E5E5DF] text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-[#7A7A72] mb-1">
                  Type d'opération
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:outline-hidden font-medium"
                >
                  <option value="all">Tous les types</option>
                  <option value="sale">Vente</option>
                  <option value="rental">Location</option>
                  <option value="deposit_refund">Restitution caution</option>
                  <option value="direct">Direct / Libre</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#7A7A72] mb-1">
                  Mode de règlement
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:outline-hidden font-medium"
                >
                  <option value="all">Tous les modes</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Virement bancaire">Virement bancaire</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Carte bancaire">Carte bancaire</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Wave">Wave</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#7A7A72] mb-1">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:outline-hidden font-medium"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="Payé">Payé / Validé</option>
                  <option value="Partiellement payé">Partiellement payé</option>
                  <option value="En attente">En attente</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payments Table or Empty State */}
          {payments.length === 0 ? (
            <EmptyState
              id="empty-state-payments"
              icon={<CreditCard className="w-8 h-8 text-[#5A5A40]" />}
              title="Aucun paiement enregistré"
              description="Votre journal financier est vierge. Enregistrez un premier encaissement ou associez un paiement à une vente ou un contrat de location."
              actionText="Ajouter un paiement"
              onAction={() => onOpenPaymentModal()}
            />
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E5DF] text-[#7A7A72] text-xs sm:text-sm">
              Aucun paiement ne correspond aux filtres sélectionnés.
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E5E5DF] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase tracking-wider font-semibold border-b border-[#E5E5DF]">
                    <tr>
                      <th className="px-4 py-3">Référence</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Type & Motif</th>
                      <th className="px-4 py-3">Mode</th>
                      <th className="px-4 py-3 text-right">Montant</th>
                      <th className="px-4 py-3 text-center">Statut</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DF]">
                    {filteredPayments.map((p) => {
                      const isRefund = p.referenceType === 'deposit_refund';
                      return (
                        <tr key={p.id} className="hover:bg-[#F9F9F6] transition-colors">
                          {/* Reference */}
                          <td className="px-4 py-3 font-mono font-bold text-[#5A5A40]">
                            {p.paymentNumber}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3 text-[#7A7A72] whitespace-nowrap">
                            {new Date(p.paymentDate).toLocaleDateString('fr-FR')}
                          </td>

                          {/* Client */}
                          <td className="px-4 py-3">
                            <span className="font-bold text-[#1A1A18] block">{p.clientName}</span>
                            {p.clientPhone && (
                              <span className="text-[10px] text-[#7A7A72] font-mono">{p.clientPhone}</span>
                            )}
                          </td>

                          {/* Type / Reference Title */}
                          <td className="px-4 py-3">
                            <span className="font-medium text-[#1A1A18] block">{p.referenceTitle}</span>
                            <span className="text-[10px] text-[#5A5A40] font-semibold uppercase">
                              {p.referenceType === 'sale'
                                ? 'Vente'
                                : p.referenceType === 'rental'
                                ? 'Location'
                                : isRefund
                                ? 'Restitution Caution'
                                : 'Direct'}
                            </span>
                          </td>

                          {/* Payment Method */}
                          <td className="px-4 py-3 text-[#2D2D2A] font-medium whitespace-nowrap">
                            {p.paymentMethod}
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-3 text-right font-mono font-extrabold text-sm whitespace-nowrap">
                            <span className={isRefund ? 'text-blue-700' : 'text-[#4A7A4A]'}>
                              {isRefund ? '-' : '+'}
                              {p.amount.toLocaleString('fr-FR')} {settings.currencySymbol}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] uppercase tracking-wider ${
                                p.status === 'Payé' || p.status === 'Validé'
                                  ? 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/30'
                                  : p.status === 'Partiellement payé'
                                  ? 'bg-[#B87320]/10 text-[#B87320] border-[#B87320]/30'
                                  : p.status === 'En attente'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Voir détail */}
                              <button
                                onClick={() => onOpenPaymentDetail(p)}
                                className="p-1.5 rounded-lg text-[#5A5A40] hover:bg-[#5A5A40]/10 transition-colors cursor-pointer"
                                title="Voir le détail de l'encaissement"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Imprimer reçu */}
                              <button
                                onClick={() => onViewDocument('payment', { paymentData: p })}
                                className="p-1.5 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
                                title="Imprimer le reçu PDF"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {/* Supprimer */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`Supprimer définitivement l'écriture ${p.paymentNumber} ?`)) {
                                    deletePayment(p.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-[#7A7A72] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Supprimer le paiement"
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
            </div>
          )}
        </div>
      )}

      {/* ---------------- SECTION 2: GESTION DES CAUTIONS ---------------- */}
      {activeSection === 'deposits' && (
        <div className="space-y-4">
          {rentalsWithDeposits.length === 0 ? (
            <EmptyState
              id="empty-state-deposits"
              icon={<ShieldCheck className="w-8 h-8 text-[#5A5A40]" />}
              title="Aucune caution enregistrée"
              description="Les cautions associées aux contrats de location de véhicules s'afficheront ici automatiquement."
              actionText="Nouveau contrat de location"
              onAction={() => onOpenPaymentModal(undefined, 'rental')}
            />
          ) : (
            <div className="rounded-2xl border border-[#E5E5DF] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase tracking-wider font-semibold border-b border-[#E5E5DF]">
                    <tr>
                      <th className="px-4 py-3">Réf. Contrat</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Véhicule</th>
                      <th className="px-4 py-3 text-right">Montant Caution</th>
                      <th className="px-4 py-3 text-center">Statut Caution</th>
                      <th className="px-4 py-3">Détails Restitution</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DF]">
                    {rentalsWithDeposits.map((r) => {
                      const depositStatus = r.depositStatus || (r.depositReturned ? 'Remboursée' : 'En caisse');
                      return (
                        <tr key={r.id} className="hover:bg-[#F9F9F6] transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-[#5A5A40]">
                            {r.rentalNumber}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-[#1A1A18] block">{r.clientName}</span>
                            {r.clientPhone && <span className="text-[10px] text-[#7A7A72]">{r.clientPhone}</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-[#1A1A18] block">{r.vehicleName}</span>
                            <span className="text-[10px] text-[#5A5A40] font-mono">{r.vehicleRegistration}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-extrabold text-sm text-[#1A1A18]">
                            {(r.depositAmount || 0).toLocaleString('fr-FR')} {settings.currencySymbol}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] uppercase tracking-wider ${
                                depositStatus === 'En caisse'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : depositStatus === 'Remboursée'
                                  ? 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/30'
                                  : 'bg-blue-100 text-blue-800 border-blue-300'
                              }`}
                            >
                              {depositStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#7A7A72]">
                            {r.depositRefundDate ? (
                              <div>
                                <span>Restitué le {new Date(r.depositRefundDate).toLocaleDateString('fr-FR')}</span>
                                {r.depositDeductionAmount && r.depositDeductionAmount > 0 && (
                                  <span className="block text-rose-600 text-[10px] font-semibold">
                                    Retenue : {r.depositDeductionAmount} {settings.currencySymbol} ({r.depositDeductionReason || 'dommages'})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="italic text-[#9A9A92]">En attente du retour véhicule</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!r.depositReturned && (
                                <button
                                  onClick={() => onOpenRefundDeposit(r)}
                                  className="px-3 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                                >
                                  Rembourser
                                </button>
                              )}

                              <button
                                onClick={() => onViewDocument('rental', { rentalData: r })}
                                className="p-1.5 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
                                title="Voir le contrat de location"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- SECTION 3: SOLDES DÛS & ÉCHÉANCES ---------------- */}
      {activeSection === 'due' && (
        <div className="space-y-4">
          {dueItems.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E5DF] text-xs sm:text-sm space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#4A7A4A] mx-auto" />
              <h3 className="font-bold text-[#1A1A18]">Tous les dossiers sont intégralement soldés !</h3>
              <p className="text-[#7A7A72]">
                Aucune vente ni location ne présente d'impayé ou de reste à recouvrer.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E5E5DF] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase tracking-wider font-semibold border-b border-[#E5E5DF]">
                    <tr>
                      <th className="px-4 py-3">Dossier</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Véhicule</th>
                      <th className="px-4 py-3 text-right">Total Dossier</th>
                      <th className="px-4 py-3 text-right">Déjà Réglé</th>
                      <th className="px-4 py-3 text-right">Solde Restant Dû</th>
                      <th className="px-4 py-3 text-right">Action Rapide</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DF]">
                    {dueItems.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F9F9F6] transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-[#5A5A40] block">{item.referenceNumber}</span>
                          <span className="text-[10px] text-[#7A7A72] uppercase font-semibold">
                            {item.type === 'sale' ? 'Vente' : 'Location'} — {new Date(item.date).toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#1A1A18]">
                          {item.clientName}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#2D2D2A]">
                          {item.vehicleName}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[#7A7A72]">
                          {item.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[#4A7A4A] font-semibold">
                          {item.amountPaid.toLocaleString('fr-FR')} {settings.currencySymbol}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-extrabold text-sm text-[#B87320]">
                          {item.balanceDue.toLocaleString('fr-FR')} {settings.currencySymbol}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onOpenPaymentModal(item.clientId, item.type, item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Encaisser le solde</span>
                          </button>
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
    </div>
  );
};
