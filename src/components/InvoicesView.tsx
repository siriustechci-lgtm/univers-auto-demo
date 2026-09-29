import React, { useState, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { Invoice, InvoiceStatus, InvoiceType, Sale, Rental, Payment } from '../types';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { InvoiceSettingsModal } from './InvoiceSettingsModal';
import { EmptyState } from './EmptyState';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Printer,
  Download,
  Share2,
  Mail,
  MessageSquare,
  Eye,
  CreditCard,
  Building2,
  Calendar,
  Car,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  BadgePercent,
  KeyRound,
  DollarSign,
  Receipt,
  Settings,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface InvoicesViewProps {
  onOpenSaleModal?: () => void;
  onOpenRentalModal?: () => void;
  onOpenPaymentModal?: (saleId?: string, rentalId?: string, clientName?: string, amount?: number) => void;
  searchQuery?: string;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  onOpenSaleModal,
  onOpenRentalModal,
  onOpenPaymentModal,
  searchQuery: initialSearch = '',
}) => {
  const { settings, sales, rentals, payments, vehicles, clients } = useCrm();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [periodFilter, setPeriodFilter] = useState<
    'all' | 'today' | 'week' | 'month' | 'year' | 'custom'
  >('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Vente' | 'Location'>('all');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'Payée' | 'Partiellement payée' | 'En attente' | 'Annulée'
  >('all');

  // Active Modals
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'totalAmount' | 'invoiceNumber'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // ================= 1. AUTOMATIC REAL INVOICES GENERATION =================
  // Generate invoice records directly from real sales and rentals without any mock data
  const realInvoices: Invoice[] = useMemo(() => {
    const list: Invoice[] = [];

    // Process real Sales
    sales.forEach((s) => {
      const client = clients.find((c) => c.id === s.clientId);
      const vehicle = vehicles.find((v) => v.id === s.vehicleId);

      const balance = s.balanceDue !== undefined ? s.balanceDue : Math.max(0, s.totalAmount - (s.amountPaid || 0));
      let status: InvoiceStatus = 'En attente';
      if (s.status === 'Annulé' || s.paymentStatus === 'Annulé') {
        status = 'Annulée';
      } else if (balance <= 0 || (s.amountPaid && s.amountPaid >= s.totalAmount)) {
        status = 'Payée';
      } else if (s.amountPaid && s.amountPaid > 0) {
        status = 'Partiellement payée';
      } else {
        status = 'En attente';
      }

      list.push({
        id: `inv_sale_${s.id}`,
        invoiceNumber: s.saleNumber || `FAC-V-${s.id.slice(-4)}`,
        type: 'Vente',
        referenceId: s.id,
        date: s.saleDate || s.createdAt.split('T')[0],
        clientId: s.clientId,
        clientName: s.clientName,
        clientPhone: s.clientPhone || client?.phone,
        clientEmail: client?.email,
        clientAddress: client?.address,
        clientCity: client?.city,
        vehicleId: s.vehicleId,
        vehicleName: s.vehicleName || (vehicle ? `${vehicle.make} ${vehicle.model}` : 'Véhicule'),
        vehicleRegistration: s.vehicleRegistration || vehicle?.registration || '',
        vehicleMake: s.vehicleMake || vehicle?.make,
        vehicleModel: s.vehicleModel || vehicle?.model,
        subtotal: s.salePrice,
        taxRate: s.taxRate,
        taxAmount: s.taxAmount,
        totalAmount: s.totalAmount,
        amountPaid: s.amountPaid || 0,
        balanceDue: balance,
        status,
        paymentMethod: s.paymentMethod,
        notes: s.notes,
        createdAt: s.createdAt,
      });
    });

    // Process real Rentals
    rentals.forEach((r) => {
      const client = clients.find((c) => c.id === r.clientId);
      const vehicle = vehicles.find((v) => v.id === r.vehicleId);

      const balance = r.balanceDue !== undefined ? r.balanceDue : Math.max(0, r.totalAmount - (r.amountPaid || 0));
      let status: InvoiceStatus = 'En attente';
      if (r.status === 'Annulée') {
        status = 'Annulée';
      } else if (balance <= 0 || (r.amountPaid && r.amountPaid >= r.totalAmount)) {
        status = 'Payée';
      } else if (r.amountPaid && r.amountPaid > 0) {
        status = 'Partiellement payée';
      } else {
        status = 'En attente';
      }

      list.push({
        id: `inv_rental_${r.id}`,
        invoiceNumber: r.rentalNumber || `FAC-L-${r.id.slice(-4)}`,
        type: 'Location',
        referenceId: r.id,
        date: r.startDate || r.createdAt.split('T')[0],
        dueDate: r.endDate,
        clientId: r.clientId,
        clientName: r.clientName,
        clientPhone: r.clientPhone || client?.phone,
        clientEmail: client?.email,
        clientAddress: client?.address,
        clientCity: client?.city,
        vehicleId: r.vehicleId,
        vehicleName: r.vehicleName || (vehicle ? `${vehicle.make} ${vehicle.model}` : 'Véhicule'),
        vehicleRegistration: r.vehicleRegistration || vehicle?.registration || '',
        vehicleMake: r.vehicleMake || vehicle?.make,
        vehicleModel: r.vehicleModel || vehicle?.model,
        subtotal: r.totalAmount,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: r.totalAmount,
        amountPaid: r.amountPaid || 0,
        balanceDue: balance,
        depositAmount: r.depositAmount,
        status,
        paymentMethod: r.paymentMethod,
        notes: r.notes,
        createdAt: r.createdAt,
      });
    });

    return list;
  }, [sales, rentals, clients, vehicles]);

  // ================= 2. FILTERING & SEARCHING =================
  const filteredInvoices = useMemo(() => {
    return realInvoices
      .filter((inv) => {
        // Text Search (Numéro facture, Client, Téléphone, Véhicule)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchNumber = inv.invoiceNumber.toLowerCase().includes(q);
          const matchClient = inv.clientName.toLowerCase().includes(q);
          const matchPhone = (inv.clientPhone || '').toLowerCase().includes(q);
          const matchVehicle = (inv.vehicleName || '').toLowerCase().includes(q) ||
            (inv.vehicleRegistration || '').toLowerCase().includes(q);
          if (!matchNumber && !matchClient && !matchPhone && !matchVehicle) return false;
        }

        // Operation Type filter
        if (typeFilter !== 'all' && inv.type !== typeFilter) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'all' && inv.status !== statusFilter) {
          return false;
        }

        // Period filter
        if (periodFilter !== 'all') {
          const invDate = new Date(inv.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (periodFilter === 'today') {
            const invDay = new Date(invDate);
            invDay.setHours(0, 0, 0, 0);
            if (invDay.getTime() !== today.getTime()) return false;
          } else if (periodFilter === 'week') {
            const startOfWeek = new Date(today);
            const day = startOfWeek.getDay() || 7;
            startOfWeek.setDate(startOfWeek.getDate() - day + 1);
            if (invDate < startOfWeek) return false;
          } else if (periodFilter === 'month') {
            if (invDate.getMonth() !== today.getMonth() || invDate.getFullYear() !== today.getFullYear()) {
              return false;
            }
          } else if (periodFilter === 'year') {
            if (invDate.getFullYear() !== today.getFullYear()) return false;
          } else if (periodFilter === 'custom') {
            if (customStartDate && new Date(inv.date) < new Date(customStartDate)) return false;
            if (customEndDate && new Date(inv.date) > new Date(customEndDate)) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sortAsc ? dateA - dateB : dateB - dateA;
        }
        if (sortField === 'totalAmount') {
          return sortAsc ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
        }
        if (sortField === 'invoiceNumber') {
          return sortAsc
            ? a.invoiceNumber.localeCompare(b.invoiceNumber)
            : b.invoiceNumber.localeCompare(a.invoiceNumber);
        }
        return 0;
      });
  }, [realInvoices, searchTerm, typeFilter, statusFilter, periodFilter, customStartDate, customEndDate, sortField, sortAsc]);

  // ================= 3. FINANCIAL KPIS =================
  const kpis = useMemo(() => {
    const totalBilled = filteredInvoices.reduce((acc, inv) => acc + (inv.status !== 'Annulée' ? inv.totalAmount : 0), 0);
    const totalPaid = filteredInvoices.reduce((acc, inv) => acc + (inv.status !== 'Annulée' ? inv.amountPaid : 0), 0);
    const totalDue = filteredInvoices.reduce((acc, inv) => acc + (inv.status !== 'Annulée' ? inv.balanceDue : 0), 0);
    const pendingCount = filteredInvoices.filter((inv) => inv.status === 'En attente' || inv.status === 'Partiellement payée').length;

    return { totalBilled, totalPaid, totalDue, pendingCount };
  }, [filteredInvoices]);

  // Open Invoice in Detail Modal
  const handleViewInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsDetailModalOpen(true);
  };

  // Direct Print
  const handleDirectPrint = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsDetailModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Direct WhatsApp
  const handleDirectWhatsApp = (inv: Invoice) => {
    const rawPhone = inv.clientPhone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const message = `Bonjour ${inv.clientName},\n\nVoici le récapitulatif de votre Facture N° *${inv.invoiceNumber}* :\n` +
      `🚗 *Véhicule :* ${inv.vehicleName} (${inv.vehicleRegistration})\n` +
      `💰 *Montant Total :* ${inv.totalAmount.toLocaleString('fr-FR')} ${settings.currencySymbol}\n` +
      `💳 *Montant Réglé :* ${inv.amountPaid.toLocaleString('fr-FR')} ${settings.currencySymbol}\n` +
      `⚠️ *Solde Dû :* ${inv.balanceDue.toLocaleString('fr-FR')} ${settings.currencySymbol}\n` +
      `📌 *Statut :* ${inv.status.toUpperCase()}\n\n` +
      `Sirius Auto vous remercie pour votre confiance !`;

    const encodedMessage = encodeURIComponent(message);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      : `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  // Direct Email
  const handleDirectEmail = (inv: Invoice) => {
    const subject = encodeURIComponent(`Facture N° ${inv.invoiceNumber} — ${settings.companyName || 'Sirius Auto'}`);
    const body = encodeURIComponent(
      `Bonjour ${inv.clientName},\n\nVeuillez trouver ci-dessous le détail de votre facture ${inv.invoiceNumber} :\n\n` +
      `- Véhicule : ${inv.vehicleName} (${inv.vehicleRegistration})\n` +
      `- Date : ${new Date(inv.date).toLocaleDateString('fr-FR')}\n` +
      `- Montant Total TTC : ${inv.totalAmount.toLocaleString('fr-FR')} ${settings.currencySymbol}\n` +
      `- Montant Réglé : ${inv.amountPaid.toLocaleString('fr-FR')} ${settings.currencySymbol}\n` +
      `- Solde restant dû : ${inv.balanceDue.toLocaleString('fr-FR')} ${settings.currencySymbol}\n` +
      `- Statut : ${inv.status}\n\n` +
      `Cordialement,\n${settings.companyName || 'Sirius Auto CRM'}`
    );
    window.location.href = `mailto:${inv.clientEmail || ''}?subject=${subject}&body=${body}`;
  };

  // Status Badge UI
  const renderStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Payée':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Payée</span>
          </span>
        );
      case 'Partiellement payée':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Partiel</span>
          </span>
        );
      case 'En attente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>En attente</span>
          </span>
        );
      case 'Annulée':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Annulée</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div id="invoices-view-container" className="space-y-6">
      {/* ================= TOP HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#1A1A18] font-['Outfit'] tracking-tight">
              Factures & Facturation
            </h1>
            <span className="px-2.5 py-0.5 rounded-md bg-[#5A5A40]/10 text-[#5A5A40] font-bold text-xs">
              {realInvoices.length} {realInvoices.length > 1 ? 'Factures réelles' : 'Facture réelle'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A7A72] mt-0.5">
            Génération automatique, impression A4, suivi des encaissements et partage PDF client
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            id="open-invoice-settings-btn"
            onClick={() => setIsSettingsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs font-bold text-[#5A5A52] hover:bg-[#F0EFEB] hover:text-[#1A1A18] shadow-xs transition-colors cursor-pointer"
            title="Paramètres de facturation"
          >
            <Settings className="w-4 h-4 text-[#5A5A40]" />
            <span>Paramètres Facturation</span>
          </button>

          {onOpenSaleModal && (
            <button
              id="inv-new-sale-btn"
              onClick={onOpenSaleModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#5A5A40]/30 text-[#5A5A40] hover:bg-[#5A5A40]/10 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <BadgePercent className="w-4 h-4" />
              <span>Nouvelle Vente</span>
            </button>
          )}

          {onOpenRentalModal && (
            <button
              id="inv-new-rental-btn"
              onClick={onOpenRentalModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Nouvelle Location</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= SUMMARY KPIS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#7A7A72] uppercase tracking-wider block">
              Total Facturé
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-[#1A1A18] mt-1 font-mono">
              {kpis.totalBilled.toLocaleString('fr-FR')} {settings.currencySymbol}
            </div>
            <span className="text-[11px] text-[#7A7A72]">
              {filteredInvoices.length} pièce(s) de facturation
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Total Encaissé */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Total Encaissé
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1 font-mono">
              {kpis.totalPaid.toLocaleString('fr-FR')} {settings.currencySymbol}
            </div>
            <span className="text-[11px] text-emerald-700">
              {kpis.totalBilled > 0
                ? `${Math.round((kpis.totalPaid / kpis.totalBilled) * 100)}% de recouvrement`
                : '100% à jour'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Reste à Encaisser */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 bg-rose-50/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
              Solde Restant Dû
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-rose-700 mt-1 font-mono">
              {kpis.totalDue.toLocaleString('fr-FR')} {settings.currencySymbol}
            </div>
            <span className="text-[11px] text-rose-700">
              {kpis.pendingCount} facture(s) avec solde
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Statut Factures */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#7A7A72] uppercase tracking-wider block">
              Factures En Attente
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-[#1A1A18] mt-1 font-mono">
              {kpis.pendingCount}
            </div>
            <span className="text-[11px] text-amber-700 font-medium">
              Nécessitent un suivi client
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ================= SEARCH & FILTERS BAR ================= */}
      <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 space-y-3.5 shadow-xs">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7A72]" />
            <input
              id="invoice-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par N° facture, nom du client, téléphone ou immatriculation..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] placeholder-[#7A7A72] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A7A72] hover:text-[#1A1A18]"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-[#5A5A40] text-white'
                  : 'bg-[#FAFAF8] text-[#5A5A52] hover:bg-[#EBEBE6]'
              }`}
            >
              Tous types
            </button>
            <button
              onClick={() => setTypeFilter('Vente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                typeFilter === 'Vente'
                  ? 'bg-[#5A5A40] text-white'
                  : 'bg-[#FAFAF8] text-[#5A5A52] hover:bg-[#EBEBE6]'
              }`}
            >
              Ventes
            </button>
            <button
              onClick={() => setTypeFilter('Location')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                typeFilter === 'Location'
                  ? 'bg-[#5A5A40] text-white'
                  : 'bg-[#FAFAF8] text-[#5A5A52] hover:bg-[#EBEBE6]'
              }`}
            >
              Locations
            </button>
          </div>
        </div>

        {/* Secondary Filter Row: Period, Status & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5E5DF] text-xs">
          {/* Period Filter */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[#7A7A72] font-semibold flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Période :</span>
            </span>
            {(['all', 'today', 'week', 'month', 'year', 'custom'] as const).map((p) => {
              const labels = {
                all: 'Toutes',
                today: "Aujourd'hui",
                week: 'Cette semaine',
                month: 'Ce mois',
                year: 'Cette année',
                custom: 'Personnalisée',
              };
              return (
                <button
                  key={p}
                  onClick={() => setPeriodFilter(p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    periodFilter === p
                      ? 'bg-[#5A5A40]/15 text-[#5A5A40] font-bold border border-[#5A5A40]/30'
                      : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0EFEB]'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[#7A7A72] font-semibold flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Statut :</span>
            </span>
            {(['all', 'Payée', 'Partiellement payée', 'En attente', 'Annulée'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#1A1A18] text-white font-bold'
                    : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0EFEB]'
                }`}
              >
                {st === 'all' ? 'Tous' : st}
              </button>
            ))}

            {(searchTerm || periodFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPeriodFilter('all');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors ml-2 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom date range picker if selected */}
        {periodFilter === 'custom' && (
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7A7A72]">Du :</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[#E5E5DF] bg-[#FAFAF8] text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7A7A72]">Au :</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[#E5E5DF] bg-[#FAFAF8] text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* ================= INVOICES LIST / TABLE ================= */}
      {filteredInvoices.length === 0 ? (
        realInvoices.length === 0 ? (
          /* Empty State: Zero real invoices */
          <div className="bg-white rounded-2xl border border-[#E5E5DF] p-10 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] flex items-center justify-center mx-auto text-[#5A5A40]">
              <FileText className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-extrabold text-[#1A1A18] font-['Outfit']">
                Aucune facture disponible
              </h3>
              <p className="text-xs text-[#7A7A72]">
                Les factures professionnelles sont générées automatiquement dès l'enregistrement d'une vente ou d'un contrat de location.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {onOpenSaleModal && (
                <button
                  onClick={onOpenSaleModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <BadgePercent className="w-4 h-4" />
                  <span>Créer une vente</span>
                </button>
              )}
              {onOpenRentalModal && (
                <button
                  onClick={onOpenRentalModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5E5DF] text-[#1A1A18] hover:bg-[#F0EFEB] text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-[#5A5A40]" />
                  <span>Créer une location</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Empty Search results */
          <div className="bg-white rounded-2xl border border-[#E5E5DF] p-8 text-center space-y-3">
            <Search className="w-8 h-8 text-[#7A7A72] mx-auto" />
            <p className="text-sm font-bold text-[#1A1A18]">
              Aucune facture ne correspond à vos filtres de recherche.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setPeriodFilter('all');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#F0EFEB] hover:bg-[#E5E5DF] text-xs font-semibold text-[#1A1A18] cursor-pointer"
            >
              Afficher toutes les factures
            </button>
          </div>
        )
      ) : (
        /* Desktop & Tablet Table */
        <div className="bg-white rounded-2xl border border-[#E5E5DF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFAF8] border-b border-[#E5E5DF] text-[#5A5A40] font-bold uppercase text-[11px] tracking-wider">
                  <th
                    className="p-3.5 cursor-pointer hover:text-[#1A1A18]"
                    onClick={() => {
                      if (sortField === 'invoiceNumber') setSortAsc(!sortAsc);
                      else {
                        setSortField('invoiceNumber');
                        setSortAsc(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>N° Facture</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-[#1A1A18]"
                    onClick={() => {
                      if (sortField === 'date') setSortAsc(!sortAsc);
                      else {
                        setSortField('date');
                        setSortAsc(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5">Client</th>
                  <th className="p-3.5">Véhicule</th>
                  <th className="p-3.5 text-center">Type</th>
                  <th
                    className="p-3.5 text-right cursor-pointer hover:text-[#1A1A18]"
                    onClick={() => {
                      if (sortField === 'totalAmount') setSortAsc(!sortAsc);
                      else {
                        setSortField('totalAmount');
                        setSortAsc(false);
                      }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Montant</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5 text-center">Statut</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {filteredInvoices.map((inv) => {
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#FAFAF8] transition-colors group cursor-default"
                    >
                      {/* N° Facture */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              inv.type === 'Vente'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {inv.type === 'Vente' ? 'V' : 'L'}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-[#1A1A18] block">
                              {inv.invoiceNumber}
                            </span>
                            <span className="text-[10px] text-[#7A7A72]">
                              {inv.type === 'Vente' ? 'Vente' : 'Location'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-3.5 whitespace-nowrap text-[#5A5A52]">
                        <span className="font-medium text-[#1A1A18] block">
                          {new Date(inv.date).toLocaleDateString('fr-FR')}
                        </span>
                        {inv.dueDate && (
                          <span className="text-[10px] text-[#7A7A72]">
                            Échéance : {new Date(inv.dueDate).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </td>

                      {/* Client */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#1A1A18] max-w-[160px] truncate">
                          {inv.clientName}
                        </div>
                        {inv.clientPhone && (
                          <div className="text-[11px] text-[#7A7A72] font-mono">
                            {inv.clientPhone}
                          </div>
                        )}
                      </td>

                      {/* Véhicule */}
                      <td className="p-3.5">
                        <div className="font-medium text-[#1A1A18] max-w-[160px] truncate">
                          {inv.vehicleName}
                        </div>
                        <div className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-md bg-[#F0EFEB] inline-block mt-0.5 text-[#5A5A52]">
                          {inv.vehicleRegistration}
                        </div>
                      </td>

                      {/* Type d'opération */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            inv.type === 'Vente'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {inv.type}
                        </span>
                      </td>

                      {/* Montant & Détails */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-sm text-[#1A1A18]">
                          {inv.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                        </div>
                        {inv.balanceDue > 0 ? (
                          <div className="text-[11px] font-mono text-rose-600 font-semibold">
                            Reste : {inv.balanceDue.toLocaleString('fr-FR')} {settings.currencySymbol}
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-700 font-semibold">
                            Intégralement réglé
                          </div>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        {renderStatusBadge(inv.status)}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Voir / Détail */}
                          <button
                            id={`view-inv-${inv.id}`}
                            onClick={() => handleViewInvoice(inv)}
                            className="p-1.5 rounded-lg text-[#5A5A52] hover:text-[#1A1A18] hover:bg-[#F0EFEB] transition-colors cursor-pointer"
                            title="Consulter la facture"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Imprimer / PDF */}
                          <button
                            id={`print-inv-${inv.id}`}
                            onClick={() => handleDirectPrint(inv)}
                            className="p-1.5 rounded-lg text-[#5A5A52] hover:text-[#1A1A18] hover:bg-[#F0EFEB] transition-colors cursor-pointer"
                            title="Imprimer / Enregistrer en PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* WhatsApp */}
                          <button
                            id={`wa-inv-${inv.id}`}
                            onClick={() => handleDirectWhatsApp(inv)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Envoyer via WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Email */}
                          <button
                            id={`mail-inv-${inv.id}`}
                            onClick={() => handleDirectEmail(inv)}
                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Envoyer par Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>

                          {/* Direct Encaisser si solde dû */}
                          {inv.balanceDue > 0 && inv.status !== 'Annulée' && onOpenPaymentModal && (
                            <button
                              id={`pay-inv-${inv.id}`}
                              onClick={() => {
                                onOpenPaymentModal(
                                  inv.type === 'Vente' ? inv.referenceId : undefined,
                                  inv.type === 'Location' ? inv.referenceId : undefined,
                                  inv.clientName,
                                  inv.balanceDue
                                );
                              }}
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer ml-1"
                              title="Encaisser le solde"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
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

      {/* ================= INVOICE DETAIL & A4 PREVIEW MODAL ================= */}
      <InvoiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onOpenPaymentModal={onOpenPaymentModal}
      />

      {/* ================= INVOICE SETTINGS MODAL ================= */}
      <InvoiceSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};
