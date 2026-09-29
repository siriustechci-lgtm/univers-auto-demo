import React, { useState, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { useAuth } from '../context/AuthContext';
import { Sale, Rental, Payment, Vehicle, Client } from '../types';
import { ClientHistoryModal } from './reports/ClientHistoryModal';
import { EmptyState } from './EmptyState';
import { UniversAutoLogo } from './common/UniversAutoLogo';
import { UNIVERS_AUTO_LOGO_DATA_URI } from '../assets/logo';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  BadgePercent,
  KeyRound,
  Users,
  Car,
  FileText,
  Printer,
  Download,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Eye,
  FileSignature,
  Receipt,
  ArrowUpRight,
  Filter,
  DollarSign,
  Plus,
} from 'lucide-react';

interface ReportsViewProps {
  onOpenSaleModal?: () => void;
  onOpenRentalModal?: () => void;
  onOpenVehicleModal?: () => void;
  onOpenClientModal?: () => void;
  onOpenPaymentModal?: () => void;
  onViewDocument: (
    type: 'payment' | 'sale' | 'sale_receipt' | 'rental' | 'rental_invoice' | 'rental_receipt',
    data: { paymentData?: Payment; saleData?: Sale; rentalData?: Rental }
  ) => void;
  searchQuery?: string;
}

type ReportSection =
  | 'overview'
  | 'sales'
  | 'rentals'
  | 'clients'
  | 'vehicles'
  | 'payments'
  | 'documents';

type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export const ReportsView: React.FC<ReportsViewProps> = ({
  onOpenSaleModal,
  onOpenRentalModal,
  onOpenVehicleModal,
  onOpenClientModal,
  onOpenPaymentModal,
  onViewDocument,
  searchQuery = '',
}) => {
  const { sales, rentals, payments, vehicles, clients, settings } = useCrm();
  const { companyProfile } = useAuth();

  const companyName = companyProfile?.name && companyProfile.name !== 'BANESERVICES AUTO' ? companyProfile.name : (settings.companyName || 'UNIVERS AUTO');
  const logoSrc = companyProfile?.logoUrl || settings.logoUrl || UNIVERS_AUTO_LOGO_DATA_URI;

  // Active section tab
  const [activeSection, setActiveSection] = useState<ReportSection>('overview');

  // Filter states
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [localSearch, setLocalSearch] = useState('');

  // Sub-filter states
  const [salesStatusFilter, setSalesStatusFilter] = useState<string>('all');
  const [rentalsStatusFilter, setRentalsStatusFilter] = useState<string>('all');
  const [vehiclesStatusFilter, setVehiclesStatusFilter] = useState<string>('all');
  const [vehiclesTypeFilter, setVehiclesTypeFilter] = useState<string>('all');
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | 'invoices' | 'contracts' | 'receipts'>('all');

  // 360 Client History modal state
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<Client | null>(null);

  const activeSearch = (searchQuery || localSearch).trim().toLowerCase();

  // Currency helper
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} ${settings.currencySymbol || '€'}`;
  };

  // Helper date checker
  const isDateInPeriod = (dateStr: string) => {
    if (period === 'all') return true;
    if (!dateStr) return false;

    const itemDate = new Date(dateStr);
    if (isNaN(itemDate.getTime())) return true;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (period === 'today') {
      return itemDate >= startOfDay;
    }

    if (period === 'week') {
      const dayOfWeek = now.getDay() || 7; // Monday = 1
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - (dayOfWeek - 1));
      return itemDate >= startOfWeek;
    }

    if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return itemDate >= startOfMonth;
    }

    if (period === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return itemDate >= startOfYear;
    }

    if (period === 'custom') {
      const start = customStartDate ? new Date(customStartDate) : null;
      const end = customEndDate ? new Date(customEndDate) : null;
      if (end) end.setHours(23, 59, 59, 999);

      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      return true;
    }

    return true;
  };

  // Filtered Datasets based on period and search query
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (!isDateInPeriod(s.saleDate)) return false;
      if (salesStatusFilter !== 'all') {
        const stat = s.paymentStatus || 'Payé';
        if (stat !== salesStatusFilter) return false;
      }
      if (activeSearch) {
        const q = activeSearch;
        const matchNumber = s.saleNumber.toLowerCase().includes(q);
        const matchVehicle = s.vehicleName.toLowerCase().includes(q);
        const matchClient = s.clientName.toLowerCase().includes(q);
        if (!matchNumber && !matchVehicle && !matchClient) return false;
      }
      return true;
    });
  }, [sales, period, customStartDate, customEndDate, salesStatusFilter, activeSearch]);

  const filteredRentals = useMemo(() => {
    return rentals.filter((r) => {
      if (!isDateInPeriod(r.startDate)) return false;
      if (rentalsStatusFilter !== 'all') {
        if (r.status !== rentalsStatusFilter) return false;
      }
      if (activeSearch) {
        const q = activeSearch;
        const matchNumber = r.rentalNumber.toLowerCase().includes(q);
        const matchVehicle = r.vehicleName.toLowerCase().includes(q);
        const matchClient = r.clientName.toLowerCase().includes(q);
        if (!matchNumber && !matchVehicle && !matchClient) return false;
      }
      return true;
    });
  }, [rentals, period, customStartDate, customEndDate, rentalsStatusFilter, activeSearch]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (!isDateInPeriod(p.paymentDate)) return false;
      if (activeSearch) {
        const q = activeSearch;
        const matchNumber = p.paymentNumber.toLowerCase().includes(q);
        const matchClient = p.clientName.toLowerCase().includes(q);
        const matchMethod = p.paymentMethod.toLowerCase().includes(q);
        if (!matchNumber && !matchClient && !matchMethod) return false;
      }
      return true;
    });
  }, [payments, period, customStartDate, customEndDate, activeSearch]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (vehiclesStatusFilter !== 'all' && v.status !== vehiclesStatusFilter) return false;
      if (vehiclesTypeFilter !== 'all' && v.type !== vehiclesTypeFilter) return false;
      if (activeSearch) {
        const q = activeSearch;
        const matchBrand = v.brand.toLowerCase().includes(q);
        const matchModel = v.model.toLowerCase().includes(q);
        const matchPlate = v.licensePlate.toLowerCase().includes(q);
        const matchVin = (v.vin || '').toLowerCase().includes(q);
        if (!matchBrand && !matchModel && !matchPlate && !matchVin) return false;
      }
      return true;
    });
  }, [vehicles, vehiclesStatusFilter, vehiclesTypeFilter, activeSearch]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (activeSearch) {
        const q = activeSearch;
        const matchName = c.fullName.toLowerCase().includes(q);
        const matchPhone = (c.phone || '').toLowerCase().includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        const matchCity = (c.city || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchCity) return false;
      }
      return true;
    });
  }, [clients, activeSearch]);

  // Aggregate document list from all real transactions
  const allDocuments = useMemo(() => {
    const docs: {
      id: string;
      docNumber: string;
      docType: 'Facture Vente' | 'Reçu Vente' | 'Contrat Location' | 'Facture Location' | 'Reçu Location' | 'Reçu Paiement';
      category: 'invoices' | 'contracts' | 'receipts';
      date: string;
      clientName: string;
      clientId?: string;
      vehicleName?: string;
      amount: number;
      status: string;
      rawSale?: Sale;
      rawRental?: Rental;
      rawPayment?: Payment;
    }[] = [];

    // Sales Documents: Invoices & Receipts
    sales.forEach((s) => {
      // Sale Invoice
      docs.push({
        id: `sale-inv-${s.id}`,
        docNumber: s.saleNumber,
        docType: 'Facture Vente',
        category: 'invoices',
        date: s.saleDate,
        clientName: s.clientName,
        clientId: s.clientId,
        vehicleName: s.vehicleName,
        amount: s.totalAmount || s.salePrice,
        status: s.paymentStatus || 'Payé',
        rawSale: s,
      });

      // Sale Receipt if paid
      if (s.amountPaid > 0) {
        docs.push({
          id: `sale-rec-${s.id}`,
          docNumber: `REC-${s.saleNumber.replace('FAC-', '')}`,
          docType: 'Reçu Vente',
          category: 'receipts',
          date: s.saleDate,
          clientName: s.clientName,
          clientId: s.clientId,
          vehicleName: s.vehicleName,
          amount: s.amountPaid,
          status: 'Encaissé',
          rawSale: s,
        });
      }
    });

    // Rentals Documents: Contracts, Invoices & Rental Receipts
    rentals.forEach((r) => {
      // Contract
      docs.push({
        id: `rental-ctr-${r.id}`,
        docNumber: r.rentalNumber,
        docType: 'Contrat Location',
        category: 'contracts',
        date: r.startDate,
        clientName: r.clientName,
        clientId: r.clientId,
        vehicleName: r.vehicleName,
        amount: r.totalAmount,
        status: r.status,
        rawRental: r,
      });

      // Rental Invoice
      docs.push({
        id: `rental-inv-${r.id}`,
        docNumber: `FAC-${r.rentalNumber.replace('LOC-', '')}`,
        docType: 'Facture Location',
        category: 'invoices',
        date: r.startDate,
        clientName: r.clientName,
        clientId: r.clientId,
        vehicleName: r.vehicleName,
        amount: r.totalAmount,
        status: r.status,
        rawRental: r,
      });

      // Rental payment receipt if deposit/paid
      if (r.totalPaid > 0) {
        docs.push({
          id: `rental-rec-${r.id}`,
          docNumber: `REC-${r.rentalNumber.replace('LOC-', '')}`,
          docType: 'Reçu Location',
          category: 'receipts',
          date: r.startDate,
          clientName: r.clientName,
          clientId: r.clientId,
          vehicleName: r.vehicleName,
          amount: r.totalPaid,
          status: 'Encaissé',
          rawRental: r,
        });
      }
    });

    // Direct and miscellaneous Payments
    payments.forEach((p) => {
      docs.push({
        id: `pay-${p.id}`,
        docNumber: p.paymentNumber,
        docType: 'Reçu Paiement',
        category: 'receipts',
        date: p.paymentDate,
        clientName: p.clientName,
        clientId: p.clientId,
        amount: p.amount,
        status: 'Validé',
        rawPayment: p,
      });
    });

    return docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, rentals, payments]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return allDocuments.filter((d) => {
      if (!isDateInPeriod(d.date)) return false;
      if (docTypeFilter !== 'all' && d.category !== docTypeFilter) return false;
      if (activeSearch) {
        const q = activeSearch;
        const matchNum = d.docNumber.toLowerCase().includes(q);
        const matchCli = d.clientName.toLowerCase().includes(q);
        const matchVeh = (d.vehicleName || '').toLowerCase().includes(q);
        const matchType = d.docType.toLowerCase().includes(q);
        if (!matchNum && !matchCli && !matchVeh && !matchType) return false;
      }
      return true;
    });
  }, [allDocuments, period, customStartDate, customEndDate, docTypeFilter, activeSearch]);

  // Global Financial & Activity Aggregations (Calculated dynamically on real data)
  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + (s.totalAmount || s.salePrice || 0), 0);
  const totalSalesCollected = filteredSales.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
  const totalSalesDue = Math.max(0, totalSalesRevenue - totalSalesCollected);

  const totalRentalsRevenue = filteredRentals.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
  const totalRentalsCollected = filteredRentals.reduce((acc, r) => acc + (r.totalPaid || 0), 0);
  const totalRentalsDue = Math.max(0, totalRentalsRevenue - totalRentalsCollected);

  const totalRevenue = totalSalesRevenue + totalRentalsRevenue;
  const totalCollected = filteredPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalDue = totalSalesDue + totalRentalsDue;

  // Active Rentals and Deposits
  const activeRentalsCount = rentals.filter((r) => r.status === 'En cours').length;
  const completedRentalsCount = rentals.filter((r) => r.status === 'Terminée').length;
  const totalActiveDeposits = rentals
    .filter((r) => r.status === 'En cours')
    .reduce((acc, r) => acc + (r.depositAmount || 0), 0);

  // Vehicle park metrics
  const availableVehiclesCount = vehicles.filter((v) => v.status === 'Disponible').length;
  const rentedVehiclesCount = vehicles.filter((v) => v.status === 'Loué').length;
  const soldVehiclesCount = vehicles.filter((v) => v.status === 'Vendu').length;
  const maintenanceVehiclesCount = vehicles.filter((v) => v.status === 'Maintenance').length;
  const totalParkPurchaseValue = vehicles.reduce((acc, v) => acc + (v.purchasePrice || 0), 0);

  // Client metrics
  const activeClientsCount = clients.filter((c) => {
    const hasSale = sales.some((s) => s.clientId === c.id);
    const hasRental = rentals.some((r) => r.clientId === c.id);
    return hasSale || hasRental;
  }).length;

  // Payment Breakdown by Method
  const paymentMethodsBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    filteredPayments.forEach((p) => {
      const method = p.paymentMethod || 'Autre';
      breakdown[method] = (breakdown[method] || 0) + (p.amount || 0);
    });
    return Object.entries(breakdown).map(([method, sum]) => ({
      method,
      amount: sum,
      percentage: totalCollected > 0 ? (sum / totalCollected) * 100 : 0,
    }));
  }, [filteredPayments, totalCollected]);

  // CSV Export Generator (UTF-8 BOM, safe separators, clean headers)
  const handleExportCSV = (reportName: string, rows: (string | number)[][], headers: string[]) => {
    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(';'))].join(
        '\n'
      );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `SiriusAuto_${reportName}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Specific CSV exporters
  const exportOverviewCSV = () => {
    const headers = ['Indicateur', 'Valeur', 'Détails'];
    const rows = [
      ['Chiffre d\'affaires total', `${totalRevenue} ${settings.currencySymbol}`, 'Ventes + Locations'],
      ['Revenus Ventes', `${totalSalesRevenue} ${settings.currencySymbol}`, `${filteredSales.length} ventes conclues`],
      ['Revenus Locations', `${totalRentalsRevenue} ${settings.currencySymbol}`, `${filteredRentals.length} contrats de location`],
      ['Total Paiements Reçus', `${totalCollected} ${settings.currencySymbol}`, `${filteredPayments.length} encaissements réels`],
      ['Soldes en attente (Créances)', `${totalDue} ${settings.currencySymbol}`, 'Restes à recouvrer'],
      ['Cautions actives en cours', `${totalActiveDeposits} ${settings.currencySymbol}`, `${activeRentalsCount} locations actives`],
      ['Total Véhicules Parc', `${vehicles.length}`, `${availableVehiclesCount} disponibles, ${rentedVehiclesCount} loués, ${soldVehiclesCount} vendus`],
      ['Total Clients', `${clients.length}`, `${activeClientsCount} clients actifs`],
    ];
    handleExportCSV('Synthese_Generale', rows, headers);
  };

  const exportSalesCSV = () => {
    const headers = ['N° Vente', 'Date', 'Client', 'Véhicule', 'Prix Total', 'Encaissé', 'Solde Restant', 'Statut Paiement', 'Mode'];
    const rows = filteredSales.map((s) => [
      s.saleNumber,
      new Date(s.saleDate).toLocaleDateString('fr-FR'),
      s.clientName,
      s.vehicleName,
      s.totalAmount || s.salePrice,
      s.amountPaid,
      Math.max(0, (s.totalAmount || s.salePrice) - s.amountPaid),
      s.paymentStatus || 'Payé',
      s.paymentMethod,
    ]);
    handleExportCSV('Rapport_Ventes', rows, headers);
  };

  const exportRentalsCSV = () => {
    const headers = ['N° Contrat', 'Date Début', 'Date Fin', 'Durée (j)', 'Client', 'Véhicule', 'Tarif/Jour', 'Total Facturé', 'Caution', 'Encaissé', 'Solde Dû', 'Statut'];
    const rows = filteredRentals.map((r) => [
      r.rentalNumber,
      new Date(r.startDate).toLocaleDateString('fr-FR'),
      new Date(r.endDate).toLocaleDateString('fr-FR'),
      r.durationDays,
      r.clientName,
      r.vehicleName,
      r.dailyRate,
      r.totalAmount,
      r.depositAmount,
      r.totalPaid,
      Math.max(0, r.totalAmount - r.totalPaid),
      r.status,
    ]);
    handleExportCSV('Rapport_Locations', rows, headers);
  };

  const exportClientsCSV = () => {
    const headers = ['Nom Client', 'Type', 'Téléphone', 'Email', 'Ville', 'Nb Ventes', 'Nb Locations', 'Total Facturé', 'Total Encaissé', 'Solde Dû'];
    const rows = filteredClients.map((c) => {
      const cSales = sales.filter((s) => s.clientId === c.id);
      const cRentals = rentals.filter((r) => r.clientId === c.id);
      const cPayments = payments.filter((p) => p.clientId === c.id);
      const fact =
        cSales.reduce((sum, s) => sum + (s.totalAmount || s.salePrice || 0), 0) +
        cRentals.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
      const paid = cPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      return [
        c.fullName,
        c.type || 'Particulier',
        c.phone || '',
        c.email || '',
        c.city || '',
        cSales.length,
        cRentals.length,
        fact,
        paid,
        Math.max(0, fact - paid),
      ];
    });
    handleExportCSV('Rapport_Clients', rows, headers);
  };

  const exportVehiclesCSV = () => {
    const headers = ['Marque', 'Modèle', 'Immatriculation', 'Type', 'Statut', 'Année', 'Kilométrage', 'Prix Achat', 'Prix Vente/Jour', 'Total Ventes/Locations'];
    const rows = filteredVehicles.map((v) => {
      const vSales = sales.filter((s) => s.vehicleId === v.id).length;
      const vRentals = rentals.filter((r) => r.vehicleId === v.id).length;
      return [
        v.brand,
        v.model,
        v.licensePlate,
        v.type,
        v.status,
        v.year,
        v.mileage,
        v.purchasePrice || 0,
        v.type === 'Vente' ? v.salePrice || 0 : v.dailyRate || 0,
        `${vSales} vente(s) / ${vRentals} location(s)`,
      ];
    });
    handleExportCSV('Rapport_Vehicules', rows, headers);
  };

  const exportPaymentsCSV = () => {
    const headers = ['N° Reçu', 'Date', 'Client', 'Affectation', 'Mode Paiement', 'Montant Encaissé', 'Statut', 'Notes'];
    const rows = filteredPayments.map((p) => [
      p.paymentNumber,
      new Date(p.paymentDate).toLocaleDateString('fr-FR'),
      p.clientName,
      p.referenceType ? (p.referenceType === 'sale' ? 'Vente' : p.referenceType === 'rental' ? 'Location' : 'Direct') : 'Général',
      p.paymentMethod,
      p.amount,
      p.status || 'Validé',
      p.notes || '',
    ]);
    handleExportCSV('Rapport_Paiements', rows, headers);
  };

  const exportDocumentsCSV = () => {
    const headers = ['N° Document', 'Type Pièce', 'Date', 'Client', 'Véhicule', 'Montant TTC', 'Statut'];
    const rows = filteredDocuments.map((d) => [
      d.docNumber,
      d.docType,
      new Date(d.date).toLocaleDateString('fr-FR'),
      d.clientName,
      d.vehicleName || '-',
      d.amount,
      d.status,
    ]);
    handleExportCSV('Centre_Documents', rows, headers);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="reports-view-root" className="space-y-6">
      {/* 360 Client History Detail Modal */}
      <ClientHistoryModal
        isOpen={!!selectedClientForHistory}
        onClose={() => setSelectedClientForHistory(null)}
        client={selectedClientForHistory}
        onViewDocument={onViewDocument}
      />

      {/* Header Banner */}
      <div className="rounded-2xl border border-[#E5E5DF] bg-white p-5 sm:p-6 shadow-xs relative overflow-hidden print:border-none print:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-12 sm:w-24 sm:h-13 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] p-1.5 flex items-center justify-center shrink-0">
              {logoSrc && logoSrc !== UNIVERS_AUTO_LOGO_DATA_URI ? (
                <img
                  src={logoSrc}
                  alt={companyName}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <UniversAutoLogo size="sm" showSubtitle={false} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-[#E50914]/10 text-[#E50914] text-xs font-semibold border border-[#E50914]/20">
                  {companyName}
                </span>
                <span className="text-xs text-[#9A9A92]">|</span>
                <span className="text-xs text-[#7A7A72]">
                  Rapports Financiers & Documents
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                Rapports & Documents
              </h1>
              <p className="text-xs sm:text-sm text-[#7A7A72] mt-0.5">
                Pilotage d'activité en temps réel, analyses financières et archivage documentaire certifié
              </p>
            </div>
          </div>

          {/* Export & Print Action Group */}
          <div className="flex items-center gap-2 flex-wrap print:hidden">
            <button
              onClick={handlePrint}
              id="reports-print-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E5DF] text-[#1A1A18] hover:bg-[#F5F5F0] font-semibold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#E50914]" />
              <span>Imprimer / PDF</span>
            </button>

            <button
              onClick={() => {
                if (activeSection === 'overview') exportOverviewCSV();
                else if (activeSection === 'sales') exportSalesCSV();
                else if (activeSection === 'rentals') exportRentalsCSV();
                else if (activeSection === 'clients') exportClientsCSV();
                else if (activeSection === 'vehicles') exportVehiclesCSV();
                else if (activeSection === 'payments') exportPaymentsCSV();
                else if (activeSection === 'documents') exportDocumentsCSV();
              }}
              id="reports-export-csv-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E50914] hover:bg-[#B8000A] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exporter Excel (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex border-b border-[#E5E5DF] bg-white rounded-xl p-1.5 shadow-xs overflow-x-auto gap-1 print:hidden">
        <button
          onClick={() => setActiveSection('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'overview'
              ? 'bg-[#E50914] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Synthèse Globale</span>
        </button>

        <button
          onClick={() => setActiveSection('sales')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'sales'
              ? 'bg-[#E50914] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0]'
          }`}
        >
          <BadgePercent className="w-4 h-4" />
          <span>Ventes ({sales.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('rentals')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'rentals'
              ? 'bg-[#E50914] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0]'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Locations ({rentals.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('clients')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'clients'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clients ({clients.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('vehicles')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'vehicles'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0]'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Véhicules ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('payments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'payments'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Paiements ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('documents')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'documents'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Centre de Documents ({allDocuments.length})</span>
        </button>
      </div>

      {/* Common Temporal & Search Filter Toolbar (Applied Dynamically) */}
      <div className="rounded-2xl border border-[#E5E5DF] bg-white p-4 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Quick Period Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-bold text-[#7A7A72] uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Période :</span>
            </span>

            {[
              { id: 'all', label: 'Toutes' },
              { id: 'today', label: "Aujourd'hui" },
              { id: 'week', label: 'Cette semaine' },
              { id: 'month', label: 'Ce mois' },
              { id: 'year', label: 'Cette année' },
              { id: 'custom', label: 'Personnalisée' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as PeriodFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  period === p.id
                    ? 'bg-[#5A5A40] text-white'
                    : 'bg-[#F5F5F0] text-[#5A5A40] hover:bg-[#EBEBE6]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A72]" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Rechercher (Client, Véhicule, N°)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5A5A40] placeholder:text-[#9A9A92]"
            />
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {period === 'custom' && (
          <div className="pt-2 border-t border-[#E5E5DF] flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-[#5A5A40]">Du :</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E5E5DF] bg-[#FAFAF8] text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
            />
            <span className="font-semibold text-[#5A5A40]">Au :</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E5E5DF] bg-[#FAFAF8] text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
            />
            {(customStartDate || customEndDate) && (
              <button
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="text-[11px] text-[#7A7A72] hover:text-[#1A1A18] underline cursor-pointer"
              >
                Réinitialiser dates
              </button>
            )}
          </div>
        )}
      </div>

      {/* SECTION 1: SYNTHÈSE GLOBALE (OVERVIEW) */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Chiffre d'Affaires Total */}
            <div className="p-5 rounded-2xl border border-[#E5E5DF] bg-white shadow-xs">
              <div className="flex items-center justify-between text-[#7A7A72] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Chiffre d'Affaires
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#1A1A18] font-['Outfit']">
                {formatCurrency(totalRevenue)}
              </p>
              <div className="flex items-center justify-between text-xs text-[#7A7A72] mt-2 pt-2 border-t border-[#E5E5DF]">
                <span>Ventes : {formatCurrency(totalSalesRevenue)}</span>
                <span>Locations : {formatCurrency(totalRentalsRevenue)}</span>
              </div>
            </div>

            {/* Total Paiements Encaissés */}
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Paiements Reçus
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-emerald-900 font-['Outfit']">
                {formatCurrency(totalCollected)}
              </p>
              <div className="flex items-center justify-between text-xs text-emerald-700 mt-2 pt-2 border-t border-emerald-200/60">
                <span>{filteredPayments.length} transactions</span>
                <span>
                  {totalRevenue > 0
                    ? `${Math.min(100, Math.round((totalCollected / totalRevenue) * 100))}% encaissé`
                    : '100%'}
                </span>
              </div>
            </div>

            {/* Soldes en attente (Créances) */}
            <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/40 shadow-xs">
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Soldes en Attente
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-rose-900 font-['Outfit']">
                {formatCurrency(totalDue)}
              </p>
              <div className="flex items-center justify-between text-xs text-rose-700 mt-2 pt-2 border-t border-rose-200/60">
                <span>Créances clients</span>
                <span>{totalDue > 0 ? 'À recouvrer' : 'Aucun impayé'}</span>
              </div>
            </div>

            {/* Cautions actives & garanties */}
            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-xs">
              <div className="flex items-center justify-between text-blue-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Cautions Détenues
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-blue-900 font-['Outfit']">
                {formatCurrency(totalActiveDeposits)}
              </p>
              <div className="flex items-center justify-between text-xs text-blue-700 mt-2 pt-2 border-t border-blue-200/60">
                <span>{activeRentalsCount} location(s) en cours</span>
                <span>Fonds en garantie</span>
              </div>
            </div>
          </div>

          {/* Synthèse Activité & Opérations */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#E5E5DF] bg-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <BadgePercent className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#7A7A72] font-semibold">Total Ventes</p>
                <p className="text-lg font-extrabold text-[#1A1A18] font-['Outfit']">
                  {filteredSales.length}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E5E5DF] bg-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#7A7A72] font-semibold">Total Locations</p>
                <p className="text-lg font-extrabold text-[#1A1A18] font-['Outfit']">
                  {filteredRentals.length}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E5E5DF] bg-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#7A7A72] font-semibold">Total Clients</p>
                <p className="text-lg font-extrabold text-[#1A1A18] font-['Outfit']">
                  {clients.length}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E5E5DF] bg-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-800 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#7A7A72] font-semibold">Total Véhicules</p>
                <p className="text-lg font-extrabold text-[#1A1A18] font-['Outfit']">
                  {vehicles.length}
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown & Payment Methods Real Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ventilation Réelle du CA */}
            <div className="p-5 rounded-2xl border border-[#E5E5DF] bg-white shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Répartition Réelle du Chiffre d'Affaires</span>
              </h2>

              {totalRevenue === 0 ? (
                <div className="p-8 text-center text-xs text-[#7A7A72]">
                  Aucun chiffre d'affaires enregistré sur la période sélectionnée.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sales progress bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-[#1A1A18] flex items-center gap-1.5">
                        <BadgePercent className="w-3.5 h-3.5 text-amber-600" />
                        <span>Vente de Véhicules</span>
                      </span>
                      <span className="font-mono text-[#5A5A40]">
                        {formatCurrency(totalSalesRevenue)} ({Math.round((totalSalesRevenue / totalRevenue) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#F5F5F0] overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full"
                        style={{ width: `${(totalSalesRevenue / totalRevenue) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Rentals progress bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-[#1A1A18] flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Location de Véhicules</span>
                      </span>
                      <span className="font-mono text-[#5A5A40]">
                        {formatCurrency(totalRentalsRevenue)} ({Math.round((totalRentalsRevenue / totalRevenue) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#F5F5F0] overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${(totalRentalsRevenue / totalRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Encaissements par Mode de Règlement Réel */}
            <div className="p-5 rounded-2xl border border-[#E5E5DF] bg-white shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Modes de Paiement Encaissés</span>
              </h2>

              {paymentMethodsBreakdown.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7A7A72]">
                  Aucun encaissement enregistré sur la période sélectionnée.
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethodsBreakdown.map((pm) => (
                    <div key={pm.method} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#1A1A18]">{pm.method}</span>
                        <span className="font-mono text-emerald-800">
                          {formatCurrency(pm.amount)} ({Math.round(pm.percentage)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F5F5F0] overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${pm.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Empty CRM State if no sales, rentals, payments exist */}
          {sales.length === 0 && rentals.length === 0 && payments.length === 0 && (
            <div className="p-8 rounded-2xl border border-[#E5E5DF] bg-white text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                  Aucune transaction enregistrée
                </h3>
                <p className="text-xs text-[#7A7A72] mt-1">
                  Les rapports financiers et statistiques d'activité se mettront à jour automatiquement dès l'enregistrement de votre première vente, location ou paiement.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                {onOpenSaleModal && (
                  <button
                    onClick={onOpenSaleModal}
                    className="px-4 py-2 rounded-xl bg-[#5A5A40] text-white font-semibold text-xs hover:bg-[#484833] cursor-pointer"
                  >
                    Enregistrer une Vente
                  </button>
                )}
                {onOpenRentalModal && (
                  <button
                    onClick={onOpenRentalModal}
                    className="px-4 py-2 rounded-xl bg-white border border-[#E5E5DF] text-[#1A1A18] font-semibold text-xs hover:bg-[#F5F5F0] cursor-pointer"
                  >
                    Créer une Location
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: RAPPORTS DE VENTES */}
      {activeSection === 'sales' && (
        <div className="space-y-6">
          {/* Sales KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#E5E5DF] bg-white">
              <span className="text-xs text-[#7A7A72] font-semibold uppercase">Nombre de Ventes</span>
              <p className="text-2xl font-extrabold text-[#1A1A18] font-['Outfit'] mt-1">
                {filteredSales.length}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[#E5E5DF] bg-white">
              <span className="text-xs text-[#7A7A72] font-semibold uppercase">Montant Total Vendu</span>
              <p className="text-2xl font-extrabold text-[#1A1A18] font-['Outfit'] mt-1">
                {formatCurrency(totalSalesRevenue)}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <span className="text-xs text-emerald-800 font-semibold uppercase">Montant Encaissé</span>
              <p className="text-2xl font-extrabold text-emerald-900 font-['Outfit'] mt-1">
                {formatCurrency(totalSalesCollected)}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
              <span className="text-xs text-rose-800 font-semibold uppercase">Solde Restant Dû</span>
              <p className="text-2xl font-extrabold text-rose-900 font-['Outfit'] mt-1">
                {formatCurrency(totalSalesDue)}
              </p>
            </div>
          </div>

          {/* Sub-filter by Status */}
          <div className="flex items-center gap-2 text-xs font-semibold print:hidden">
            <span className="text-[#7A7A72]">Statut Paiement :</span>
            {['all', 'Payé', 'Partiel', 'En attente'].map((stat) => (
              <button
                key={stat}
                onClick={() => setSalesStatusFilter(stat)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  salesStatusFilter === stat
                    ? 'bg-[#5A5A40] text-white'
                    : 'bg-white border border-[#E5E5DF] text-[#7A7A72] hover:text-[#1A1A18]'
                }`}
              >
                {stat === 'all' ? 'Tous' : stat}
              </button>
            ))}
          </div>

          {/* Sales Table */}
          {filteredSales.length === 0 ? (
            <div className="p-10 rounded-2xl border border-[#E5E5DF] bg-white text-center space-y-3">
              <p className="text-xs text-[#7A7A72]">
                Aucune vente enregistrée pour les filtres sélectionnés.
              </p>
              {onOpenSaleModal && (
                <button
                  onClick={onOpenSaleModal}
                  className="px-4 py-2 rounded-xl bg-[#5A5A40] text-white font-semibold text-xs cursor-pointer"
                >
                  Enregistrer une Vente
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E5E5DF] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase font-bold border-b border-[#E5E5DF]">
                    <tr>
                      <th className="px-4 py-3">N° Vente</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Véhicule</th>
                      <th className="px-4 py-3 text-right">Prix Total</th>
                      <th className="px-4 py-3 text-right">Encaissé</th>
                      <th className="px-4 py-3 text-right">Reste Dû</th>
                      <th className="px-4 py-3 text-center">Statut</th>
                      <th className="px-4 py-3 text-right">Documents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DF]">
                    {filteredSales.map((s) => {
                      const due = Math.max(0, (s.totalAmount || s.salePrice) - s.amountPaid);
                      return (
                        <tr key={s.id} className="hover:bg-[#F9F9F6] transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-[#1A1A18]">
                            {s.saleNumber}
                          </td>
                          <td className="px-4 py-3 text-[#7A7A72]">
                            {new Date(s.saleDate).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#1A1A18]">
                            {s.clientName}
                          </td>
                          <td className="px-4 py-3 font-medium text-[#1A1A18]">
                            {s.vehicleName}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-[#1A1A18]">
                            {formatCurrency(s.totalAmount || s.salePrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-700 font-semibold">
                            {formatCurrency(s.amountPaid)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-rose-700">
                            {due > 0 ? formatCurrency(due) : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                s.paymentStatus === 'Payé'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : s.paymentStatus === 'Partiel'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {s.paymentStatus || 'Payé'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => onViewDocument('sale', { saleData: s })}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5A5A40] hover:underline cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Facture</span>
                            </button>
                            {s.amountPaid > 0 && (
                              <button
                                onClick={() => onViewDocument('sale_receipt', { saleData: s })}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Reçu</span>
                              </button>
                            )}
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

      {/* SECTION 3: RAPPORTS DE LOCATIONS */}
      {activeSection === 'rentals' && (
        <div className="space-y-6">
          {/* Rentals KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#E5E5DF] bg-white">
              <span className="text-xs text-[#7A7A72] font-semibold uppercase">Total Contrats</span>
              <p className="text-2xl font-extrabold text-[#1A1A18] font-['Outfit'] mt-1">
                {filteredRentals.length}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[#E5E5DF] bg-white">
              <span className="text-xs text-[#7A7A72] font-semibold uppercase">Revenus des Locations</span>
              <p className="text-2xl font-extrabold text-[#1A1A18] font-['Outfit'] mt-1">
                {formatCurrency(totalRentalsRevenue)}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <span className="text-xs text-blue-800 font-semibold uppercase">Locations en cours</span>
              <p className="text-2xl font-extrabold text-blue-900 font-['Outfit'] mt-1">
                {activeRentalsCount}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <span className="text-xs text-emerald-800 font-semibold uppercase">Locations terminées</span>
              <p className="text-2xl font-extrabold text-emerald-900 font-['Outfit'] mt-1">
                {completedRentalsCount}
              </p>
            </div>
          </div>

          {/* Sub-filter by Status */}
          <div className="flex items-center gap-2 text-xs font-semibold print:hidden">
            <span className="text-[#7A7A72]">Statut Location :</span>
            {['all', 'En cours', 'Terminée', 'Annulée'].map((stat) => (
              <button
                key={stat}
                onClick={() => setRentalsStatusFilter(stat)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  rentalsStatusFilter === stat
                    ? 'bg-[#5A5A40] text-white'
                    : 'bg-white border border-[#E5E5DF] text-[#7A7A72] hover:text-[#1A1A18]'
                }`}
              >
                {stat === 'all' ? 'Tous' : stat}
              </button>
            ))}
          </div>

          {/* Rentals Table */}
          {filteredRentals.length === 0 ? (
            <div className="p-10 rounded-2xl border border-[#E5E5DF] bg-white text-center space-y-3">
              <p className="text-xs text-[#7A7A72]">
                Aucune location enregistrée pour les filtres sélectionnés.
              </p>
              {onOpenRentalModal && (
                <button
                  onClick={onOpenRentalModal}
                  className="px-4 py-2 rounded-xl bg-[#5A5A40] text-white font-semibold text-xs cursor-pointer"
                >
                  Créer une Location
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E5E5DF] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase font-bold border-b border-[#E5E5DF]">
                    <tr>
                      <th className="px-4 py-3">N° Contrat</th>
                      <th className="px-4 py-3">Période</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Véhicule</th>
                      <th className="px-4 py-3 text-right">Total Facturé</th>
                      <th className="px-4 py-3 text-right">Caution</th>
                      <th className="px-4 py-3 text-right">Encaissé</th>
                      <th className="px-4 py-3 text-center">Statut</th>
                      <th className="px-4 py-3 text-right">Documents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DF]">
                    {filteredRentals.map((r) => (
                      <tr key={r.id} className="hover:bg-[#F9F9F6] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#1A1A18]">
                          {r.rentalNumber}
                        </td>
                        <td className="px-4 py-3 text-[#7A7A72]">
                          {new Date(r.startDate).toLocaleDateString('fr-FR')} →{' '}
                          {new Date(r.endDate).toLocaleDateString('fr-FR')} ({r.durationDays}j)
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#1A1A18]">
                          {r.clientName}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#1A1A18]">
                          {r.vehicleName}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-[#1A1A18]">
                          {formatCurrency(r.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-blue-700">
                          {formatCurrency(r.depositAmount)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-700">
                          {formatCurrency(r.totalPaid)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'En cours'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : r.status === 'Terminée'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => onViewDocument('rental', { rentalData: r })}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5A5A40] hover:underline cursor-pointer"
                          >
                            <FileSignature className="w-3.5 h-3.5" />
                            <span>Contrat</span>
                          </button>
                          <button
                            onClick={() => onViewDocument('rental_invoice', { rentalData: r })}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:underline cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Facture</span>
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

      {/* SECTION 4: RAPPORTS CLIENTS */}
      {activeSection === 'clients' && (
        <div className="space-y-6">
          {/* Client KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#E5E5DF] bg-white">
              <span className="text-xs text-[#7A7A72] font-semibold uppercase">Total Clients</span>
              <p className="text-2xl font-extrabold text-[#1A1A18] font-['Outfit'] mt-1">
                {clients.length}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <span className="text-xs text-emerald-800 font-semibold uppercase">Clients Actifs</span>
              <p className="text-2xl font-extrabold text-emerald-900 font-['Outfit'] mt-1">
                {activeClientsCount}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[#E5E5DF] bg-white">
              <span className="text-xs text-[#7A7A72] font-semibold uppercase">Volume d'Affaires Clients</span>
              <p className="text-2xl font-extrabold text-[#1A1A18] font-['Outfit'] mt-1">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
              <span className="text-xs text-rose-800 font-semibold uppercase">Créances Clients Totales</span>
              <p className="text-2xl font-extrabold text-rose-900 font-['Outfit'] mt-1">
                {formatCurrency(totalDue)}
              </p>
            </div>
          </div>

          {/* Client Table */}
          {filteredClients.length === 0 ? (
            <div className="p-10 rounded-2xl border border-[#E5E5DF] bg-white text-center space-y-3">
              <p className="text-xs text-[#7A7A72]">Aucun client trouvé.</p>
              {onOpenClientModal && (
                <button
                  onClick={onOpenClientModal}
                  className="px-4 py-2 rounded-xl bg-[#5A5A40] text-white font-semibold text-xs cursor-pointer"
                >
                  Ajouter un Client
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E5E5DF] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase font-bold border-b border-[#E5E5DF]">
                    <tr>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Téléphone</th>
                      <th className="px-4 py-3 text-center">Ventes</th>
                      <th className="px-4 py-3 text-center">Locations</th>
                      <th className="px-4 py-3 text-right">Total Facturé</th>
                      <th className="px-4 py-3 text-right">Total Encaissé</th>
                      <th className="px-4 py-3 text-right">Solde Dû</th>
                      <th className="px-4 py-3 text-right">Historique 360°</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DF]">
                    {filteredClients.map((c) => {
                      const cSales = sales.filter((s) => s.clientId === c.id);
                      const cRentals = rentals.filter((r) => r.clientId === c.id);
                      const cPayments = payments.filter((p) => p.clientId === c.id);

                      const cInvoiced =
                        cSales.reduce((sum, s) => sum + (s.totalAmount || s.salePrice || 0), 0) +
                        cRentals.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
                      const cPaid = cPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                      const cDue = Math.max(0, cInvoiced - cPaid);

                      return (
                        <tr key={c.id} className="hover:bg-[#F9F9F6] transition-colors">
                          <td className="px-4 py-3 font-semibold text-[#1A1A18]">
                            {c.fullName}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.type === 'Entreprise'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {c.type || 'Particulier'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[#7A7A72]">
                            {c.phone || '-'}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-[#1A1A18]">
                            {cSales.length}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-[#1A1A18]">
                            {cRentals.length}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-[#1A1A18]">
                            {formatCurrency(cInvoiced)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-700">
                            {formatCurrency(cPaid)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-rose-700">
                            {cDue > 0 ? formatCurrency(cDue) : '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedClientForHistory(c)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 text-[#5A5A40] font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Consulter Historique</span>
                            </button>
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

      {/* SECTION 5: RAPPORTS VÉHICULES */}
      {activeSection === 'vehicles' && (
        <div className="space-y-6">
          {/* Vehicles KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl border border-[#E5E5DF] bg-white">
              <span className="text-xs text-[#7A7A72] font-semibold uppercase">Total Parc</span>
              <p className="text-2xl font-extrabold text-[#1A1A18] font-['Outfit'] mt-1">
                {vehicles.length}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <span className="text-xs text-emerald-800 font-semibold uppercase">Disponibles</span>
              <p className="text-2xl font-extrabold text-emerald-900 font-['Outfit'] mt-1">
                {availableVehiclesCount}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <span className="text-xs text-blue-800 font-semibold uppercase">Loués</span>
              <p className="text-2xl font-extrabold text-blue-900 font-['Outfit'] mt-1">
                {rentedVehiclesCount}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
              <span className="text-xs text-amber-800 font-semibold uppercase">Vendus</span>
              <p className="text-2xl font-extrabold text-amber-900 font-['Outfit'] mt-1">
                {soldVehiclesCount}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
              <span className="text-xs text-rose-800 font-semibold uppercase">En Maintenance</span>
              <p className="text-2xl font-extrabold text-rose-900 font-['Outfit'] mt-1">
                {maintenanceVehiclesCount}
              </p>
            </div>
          </div>

          {/* Sub-filters for Vehicles */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold print:hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-[#7A7A72]">Statut :</span>
              {['all', 'Disponible', 'Loué', 'Vendu', 'Maintenance'].map((stat) => (
                <button
                  key={stat}
                  onClick={() => setVehiclesStatusFilter(stat)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    vehiclesStatusFilter === stat
                      ? 'bg-[#5A5A40] text-white'
                      : 'bg-white border border-[#E5E5DF] text-[#7A7A72] hover:text-[#1A1A18]'
                  }`}
                >
                  {stat === 'all' ? 'Tous' : stat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[#7A7A72]">Destination :</span>
              {['all', 'Vente', 'Location'].map((typ) => (
                <button
                  key={typ}
                  onClick={() => setVehiclesTypeFilter(typ)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    vehiclesTypeFilter === typ
                      ? 'bg-[#5A5A40] text-white'
                      : 'bg-white border border-[#E5E5DF] text-[#7A7A72] hover:text-[#1A1A18]'
                  }`}
                >
                  {typ === 'all' ? 'Toutes' : typ}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicles Table */}
          {filteredVehicles.length === 0 ? (
            <div className="p-10 rounded-2xl border border-[#E5E5DF] bg-white text-center space-y-3">
              <p className="text-xs text-[#7A7A72]">Aucun véhicule trouvé pour ces critères.</p>
              {onOpenVehicleModal && (
                <button
                  onClick={onOpenVehicleModal}
                  className="px-4 py-2 rounded-xl bg-[#5A5A40] text-white font-semibold text-xs cursor-pointer"
                >
                  Ajouter un Véhicule
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E5E5DF] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase font-bold border-b border-[#E5E5DF]">
                    <tr>
                      <th className="px-4 py-3">Véhicule</th>
                      <th className="px-4 py-3">Immatriculation</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3 text-right">Prix d'Achat</th>
                      <th className="px-4 py-3 text-right">Tarif Vente/Jour</th>
                      <th className="px-4 py-3 text-center">Activité Liée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DF]">
                    {filteredVehicles.map((v) => {
                      const vSales = sales.filter((s) => s.vehicleId === v.id).length;
                      const vRentals = rentals.filter((r) => r.vehicleId === v.id).length;

                      return (
                        <tr key={v.id} className="hover:bg-[#F9F9F6] transition-colors">
                          <td className="px-4 py-3 font-semibold text-[#1A1A18]">
                            {v.brand} {v.model} {v.trim || ''}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-[#5A5A40]">
                            {v.licensePlate}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                v.type === 'Vente'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-indigo-50 text-indigo-800'
                              }`}
                            >
                              {v.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                v.status === 'Disponible'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : v.status === 'Loué'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : v.status === 'Vendu'
                                  ? 'bg-slate-100 text-slate-800 border border-slate-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {v.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#7A7A72]">
                            {v.purchasePrice ? formatCurrency(v.purchasePrice) : '-'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-[#1A1A18]">
                            {v.type === 'Vente'
                              ? v.salePrice
                                ? formatCurrency(v.salePrice)
                                : '-'
                              : v.dailyRate
                              ? `${formatCurrency(v.dailyRate)}/j`
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-center text-[#7A7A72]">
                            {vSales > 0 && `${vSales} vente `}
                            {vRentals > 0 && `${vRentals} location(s)`}
                            {vSales === 0 && vRentals === 0 && '-'}
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

      {/* SECTION 6: RAPPORTS PAIEMENTS */}
      {activeSection === 'payments' && (
        <div className="space-y-6">
          {/* Payments KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <span className="text-xs text-emerald-800 font-semibold uppercase">Paiements Reçus</span>
              <p className="text-2xl font-extrabold text-emerald-900 font-['Outfit'] mt-1">
                {formatCurrency(totalCollected)}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[#E5E5DF] bg-white">
              <span className="text-xs text-[#7A7A72] font-semibold uppercase">Nombre d'Encaissements</span>
              <p className="text-2xl font-extrabold text-[#1A1A18] font-['Outfit'] mt-1">
                {filteredPayments.length}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
              <span className="text-xs text-rose-800 font-semibold uppercase">Soldes Impayés</span>
              <p className="text-2xl font-extrabold text-rose-900 font-['Outfit'] mt-1">
                {formatCurrency(totalDue)}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <span className="text-xs text-blue-800 font-semibold uppercase">Cautions Enregistrées</span>
              <p className="text-2xl font-extrabold text-blue-900 font-['Outfit'] mt-1">
                {formatCurrency(totalActiveDeposits)}
              </p>
            </div>
          </div>

          {/* Payments Table */}
          {filteredPayments.length === 0 ? (
            <div className="p-10 rounded-2xl border border-[#E5E5DF] bg-white text-center space-y-3">
              <p className="text-xs text-[#7A7A72]">Aucun paiement enregistré pour cette période.</p>
              {onOpenPaymentModal && (
                <button
                  onClick={onOpenPaymentModal}
                  className="px-4 py-2 rounded-xl bg-[#5A5A40] text-white font-semibold text-xs cursor-pointer"
                >
                  Enregistrer un Paiement
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E5E5DF] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase font-bold border-b border-[#E5E5DF]">
                    <tr>
                      <th className="px-4 py-3">N° Reçu</th>
                      <th className="px-4 py-3">Date & Heure</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Affectation</th>
                      <th className="px-4 py-3">Mode de Paiement</th>
                      <th className="px-4 py-3 text-right">Montant Encaissé</th>
                      <th className="px-4 py-3 text-center">Statut</th>
                      <th className="px-4 py-3 text-right">Reçu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DF]">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F9F9F6] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#1A1A18]">
                          {p.paymentNumber}
                        </td>
                        <td className="px-4 py-3 text-[#7A7A72]">
                          {new Date(p.paymentDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#1A1A18]">
                          {p.clientName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-[#5A5A40] font-medium">
                            {p.referenceType === 'sale'
                              ? 'Vente'
                              : p.referenceType === 'rental'
                              ? 'Location'
                              : 'Direct'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-[#1A1A18]">
                          {p.paymentMethod}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                          +{formatCurrency(p.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                            {p.status || 'Validé'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onViewDocument('payment', { paymentData: p })}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5A5A40] hover:underline cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Voir Reçu</span>
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

      {/* SECTION 7: CENTRE DE DOCUMENTS (DOCUMENT CENTER) */}
      {activeSection === 'documents' && (
        <div className="space-y-6">
          {/* Document Center Sub-Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-[#E5E5DF] p-1 rounded-xl shadow-xs">
              <button
                onClick={() => setDocTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  docTypeFilter === 'all'
                    ? 'bg-[#5A5A40] text-white'
                    : 'text-[#7A7A72] hover:text-[#1A1A18]'
                }`}
              >
                Tous les documents ({allDocuments.length})
              </button>
              <button
                onClick={() => setDocTypeFilter('invoices')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  docTypeFilter === 'invoices'
                    ? 'bg-[#5A5A40] text-white'
                    : 'text-[#7A7A72] hover:text-[#1A1A18]'
                }`}
              >
                Factures
              </button>
              <button
                onClick={() => setDocTypeFilter('contracts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  docTypeFilter === 'contracts'
                    ? 'bg-[#5A5A40] text-white'
                    : 'text-[#7A7A72] hover:text-[#1A1A18]'
                }`}
              >
                Contrats
              </button>
              <button
                onClick={() => setDocTypeFilter('receipts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  docTypeFilter === 'receipts'
                    ? 'bg-[#5A5A40] text-white'
                    : 'text-[#7A7A72] hover:text-[#1A1A18]'
                }`}
              >
                Reçus
              </button>
            </div>

            <div className="text-xs text-[#7A7A72] font-medium">
              {filteredDocuments.length} document(s) trouvé(s)
            </div>
          </div>

          {/* Document Center Table */}
          {filteredDocuments.length === 0 ? (
            <div className="p-12 rounded-2xl border border-[#E5E5DF] bg-white text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                Aucun document disponible
              </h3>
              <p className="text-xs text-[#7A7A72] max-w-sm mx-auto">
                Les factures, contrats et reçus générés apparaîtront automatiquement ici dès l'enregistrement d'une vente ou d'une location.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                {onOpenSaleModal && (
                  <button
                    onClick={onOpenSaleModal}
                    className="px-4 py-2 rounded-xl bg-[#5A5A40] text-white font-semibold text-xs cursor-pointer"
                  >
                    Nouvelle Vente
                  </button>
                )}
                {onOpenRentalModal && (
                  <button
                    onClick={onOpenRentalModal}
                    className="px-4 py-2 rounded-xl bg-white border border-[#E5E5DF] text-[#1A1A18] font-semibold text-xs cursor-pointer"
                  >
                    Nouvelle Location
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E5E5DF] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase font-bold border-b border-[#E5E5DF]">
                    <tr>
                      <th className="px-4 py-3">N° Pièce</th>
                      <th className="px-4 py-3">Type Document</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Véhicule</th>
                      <th className="px-4 py-3 text-right">Montant TTC</th>
                      <th className="px-4 py-3 text-center">Statut</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DF]">
                    {filteredDocuments.map((doc) => {
                      const isInvoice = doc.category === 'invoices';
                      const isContract = doc.category === 'contracts';
                      const isReceipt = doc.category === 'receipts';

                      return (
                        <tr key={doc.id} className="hover:bg-[#F9F9F6] transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-[#1A1A18]">
                            {doc.docNumber}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isInvoice
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : isContract
                                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isInvoice && <FileText className="w-3 h-3" />}
                              {isContract && <FileSignature className="w-3 h-3" />}
                              {isReceipt && <Receipt className="w-3 h-3" />}
                              <span>{doc.docType}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#7A7A72]">
                            {new Date(doc.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#1A1A18]">
                            {doc.clientName}
                          </td>
                          <td className="px-4 py-3 text-[#7A7A72]">
                            {doc.vehicleName || '-'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-[#1A1A18]">
                            {formatCurrency(doc.amount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBEBE6] text-[#1A1A18]">
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => {
                                if (doc.rawSale) {
                                  if (doc.docType === 'Facture Vente') {
                                    onViewDocument('sale', { saleData: doc.rawSale });
                                  } else {
                                    onViewDocument('sale_receipt', { saleData: doc.rawSale });
                                  }
                                } else if (doc.rawRental) {
                                  if (doc.docType === 'Contrat Location') {
                                    onViewDocument('rental', { rentalData: doc.rawRental });
                                  } else if (doc.docType === 'Facture Location') {
                                    onViewDocument('rental_invoice', { rentalData: doc.rawRental });
                                  } else {
                                    onViewDocument('rental_receipt', { rentalData: doc.rawRental });
                                  }
                                } else if (doc.rawPayment) {
                                  onViewDocument('payment', { paymentData: doc.rawPayment });
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5A5A40] hover:bg-[#484833] text-white font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Consulter / Imprimer</span>
                            </button>
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
    </div>
  );
};
