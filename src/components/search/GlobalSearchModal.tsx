import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCrm } from '../../context/CrmContext';
import { useAuth } from '../../context/AuthContext';
import {
  Vehicle,
  Client,
  Sale,
  Rental,
  Payment,
  Reservation,
  Prospect,
  Invoice,
} from '../../types';
import {
  Search,
  X,
  Clock,
  Trash2,
  Users,
  Car,
  BadgePercent,
  KeyRound,
  CalendarClock,
  CreditCard,
  FileText,
  FileCheck2,
  Target,
  ChevronRight,
  CornerDownLeft,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

export type SearchCategory =
  | 'all'
  | 'clients'
  | 'vehicles'
  | 'sales'
  | 'rentals'
  | 'reservations'
  | 'payments'
  | 'invoices'
  | 'contracts'
  | 'prospects';

export interface SearchResultItem {
  id: string;
  category: SearchCategory;
  categoryLabel: string;
  icon: React.FC<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  metaInfo?: string;
  statusText?: string;
  statusBg?: string;
  statusTextClass?: string;
  statusBorder?: string;
  rawItem: any;
  onOpen: () => void;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient?: (client: Client) => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onSelectSale?: (sale: Sale) => void;
  onSelectRental?: (rental: Rental) => void;
  onSelectReservation?: (reservation: Reservation) => void;
  onSelectPayment?: (payment: Payment) => void;
  onSelectInvoice?: (invoice: Invoice) => void;
  onSelectContract?: (rental: Rental) => void;
  onSelectProspect?: (prospect: Prospect) => void;
}

const SEARCH_HISTORY_STORAGE_KEY = 'sirius_crm_search_history_v2';

// Helper: Normalize string for accent-insensitive and case-insensitive matching
export const normalizeSearchStr = (str?: string | number | null): string => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

// Helper: Alphanumeric only string for phone number & license plate matches
export const normalizeAlphaNum = (str?: string | number | null): string => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
};

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectClient,
  onSelectVehicle,
  onSelectSale,
  onSelectRental,
  onSelectReservation,
  onSelectPayment,
  onSelectInvoice,
  onSelectContract,
  onSelectProspect,
}) => {
  const {
    vehicles,
    clients,
    sales,
    rentals,
    reservations,
    payments,
    prospects,
    settings,
    setActiveTab,
  } = useCrm();
  const { hasPermission } = useAuth();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      setHighlightedIndex(0);
    } else {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Save history helper
  const saveSearchToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save search history', e);
      }
      return updated;
    });
  };

  const removeHistoryItem = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item !== termToRemove);
      try {
        localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update search history', err);
      }
      return updated;
    });
  };

  const clearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear search history', err);
    }
  };

  // Derive real invoices list from actual sales and rentals (strictly no mock data)
  const realInvoices: Invoice[] = useMemo(() => {
    const list: Invoice[] = [];

    // Real Sales
    sales.forEach((s) => {
      const client = clients.find((c) => c.id === s.clientId);
      const vehicle = vehicles.find((v) => v.id === s.vehicleId);
      const balance = s.balanceDue !== undefined ? s.balanceDue : Math.max(0, s.totalAmount - (s.amountPaid || 0));
      let status: Invoice['status'] = 'En attente';
      if (s.status === 'Annulé' || s.paymentStatus === 'Annulé') {
        status = 'Annulée';
      } else if (balance <= 0 || (s.amountPaid && s.amountPaid >= s.totalAmount)) {
        status = 'Payée';
      } else if (s.amountPaid && s.amountPaid > 0) {
        status = 'Partiellement payée';
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
        vehicleId: s.vehicleId,
        vehicleName: s.vehicleName || (vehicle ? `${vehicle.make} ${vehicle.model}` : 'Véhicule'),
        vehicleRegistration: s.vehicleRegistration || vehicle?.registration || '',
        subtotal: s.salePrice,
        taxRate: s.taxRate,
        taxAmount: s.taxAmount,
        totalAmount: s.totalAmount,
        amountPaid: s.amountPaid || 0,
        balanceDue: balance,
        status,
        paymentMethod: s.paymentMethod,
        createdAt: s.createdAt,
      });
    });

    // Real Rentals
    rentals.forEach((r) => {
      const client = clients.find((c) => c.id === r.clientId);
      const vehicle = vehicles.find((v) => v.id === r.vehicleId);
      const balance = r.balanceDue !== undefined ? r.balanceDue : Math.max(0, r.totalAmount - (r.amountPaid || 0));
      let status: Invoice['status'] = 'En attente';
      if (r.status === 'Annulée') {
        status = 'Annulée';
      } else if (balance <= 0 || (r.amountPaid && r.amountPaid >= r.totalAmount)) {
        status = 'Payée';
      } else if (r.amountPaid && r.amountPaid > 0) {
        status = 'Partiellement payée';
      }

      list.push({
        id: `inv_rental_${r.id}`,
        invoiceNumber: r.rentalNumber || `FAC-L-${r.id.slice(-4)}`,
        type: 'Location',
        referenceId: r.id,
        date: r.startDate || r.createdAt.split('T')[0],
        clientId: r.clientId,
        clientName: r.clientName,
        clientPhone: r.clientPhone || client?.phone,
        clientEmail: client?.email,
        vehicleId: r.vehicleId,
        vehicleName: r.vehicleName || (vehicle ? `${vehicle.make} ${vehicle.model}` : 'Véhicule'),
        vehicleRegistration: r.vehicleRegistration || vehicle?.registration || '',
        subtotal: r.totalAmount,
        taxRate: settings.defaultVatRate || 20,
        taxAmount: 0,
        totalAmount: r.totalAmount,
        amountPaid: r.amountPaid || 0,
        balanceDue: balance,
        status,
        paymentMethod: r.paymentMethod,
        createdAt: r.createdAt,
      });
    });

    return list;
  }, [sales, rentals, clients, vehicles, settings.defaultVatRate]);

  // Format currency helper
  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null) return '0 €';
    return (
      new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount) + ` ${settings.currencySymbol || '€'}`
    );
  };

  // ================= SMART SEARCH & INDEXING =================
  const allResults = useMemo<SearchResultItem[]>(() => {
    const rawQ = query.trim();
    if (!rawQ) return [];

    const normQ = normalizeSearchStr(rawQ);
    const alphaNumQ = normalizeAlphaNum(rawQ);
    const tokens = normQ.split(/\s+/).filter(Boolean);

    const matchTerms = (fields: (string | number | undefined | null)[]): boolean => {
      const combinedNorm = fields.map((f) => normalizeSearchStr(f)).join(' ');
      const combinedAlphaNum = fields.map((f) => normalizeAlphaNum(f)).join(' ');

      // Direct full alpha-num check (great for plates like 'ab-123-cd' & phone numbers like '06 12 34')
      if (alphaNumQ.length >= 2 && combinedAlphaNum.includes(alphaNumQ)) {
        return true;
      }

      // Check all individual word tokens
      return tokens.every((token) => combinedNorm.includes(token) || combinedAlphaNum.includes(token));
    };

    const results: SearchResultItem[] = [];

    // 1. CLIENTS (Nom, Téléphone, WhatsApp, Email, Ville, Permis)
    if (hasPermission('clients')) {
      clients.forEach((client) => {
        if (
          matchTerms([
            client.name,
            client.phone,
            client.whatsapp,
            client.email,
            client.city,
            client.drivingLicenseNumber,
            client.id,
          ])
        ) {
          results.push({
            id: `client_${client.id}`,
            category: 'clients',
            categoryLabel: 'Clients',
            icon: Users,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            title: client.name,
            subtitle: [client.phone, client.email, client.city].filter(Boolean).join(' • ') || 'Fiche client',
            metaInfo: client.clientType === 'Entreprise' ? 'Entreprise' : 'Particulier',
            statusText: client.whatsapp ? 'WhatsApp dispo' : undefined,
            statusBg: client.whatsapp ? 'bg-emerald-50' : undefined,
            statusTextClass: client.whatsapp ? 'text-emerald-700' : undefined,
            statusBorder: client.whatsapp ? 'border-emerald-200' : undefined,
            rawItem: client,
            onOpen: () => {
              saveSearchToHistory(rawQ);
              onClose();
              if (onSelectClient) {
                onSelectClient(client);
              } else {
                setActiveTab('clients');
              }
            },
          });
        }
      });
    }

    // 2. VÉHICULES (Marque, Modèle, Immatriculation, VIN, Finition, Catégorie, Année)
    if (hasPermission('vehicles')) {
      vehicles.forEach((vehicle) => {
        if (
          matchTerms([
            vehicle.make,
            vehicle.model,
            vehicle.registration,
            vehicle.vin,
            vehicle.category,
            vehicle.year,
            vehicle.fuelType,
            vehicle.status,
            vehicle.id,
          ])
        ) {
          let statusBg = 'bg-slate-100';
          let statusTextClass = 'text-slate-700';
          let statusBorder = 'border-slate-200';

          if (vehicle.status === 'Disponible') {
            statusBg = 'bg-emerald-50';
            statusTextClass = 'text-emerald-700';
            statusBorder = 'border-emerald-200';
          } else if (vehicle.status === 'Loué') {
            statusBg = 'bg-blue-50';
            statusTextClass = 'text-blue-700';
            statusBorder = 'border-blue-200';
          } else if (vehicle.status === 'Vendu') {
            statusBg = 'bg-purple-50';
            statusTextClass = 'text-purple-700';
            statusBorder = 'border-purple-200';
          } else if (vehicle.status === 'En maintenance') {
            statusBg = 'bg-amber-50';
            statusTextClass = 'text-amber-700';
            statusBorder = 'border-amber-200';
          } else if (vehicle.status === 'Réservé') {
            statusBg = 'bg-cyan-50';
            statusTextClass = 'text-cyan-700';
            statusBorder = 'border-cyan-200';
          }

          results.push({
            id: `vehicle_${vehicle.id}`,
            category: 'vehicles',
            categoryLabel: 'Véhicules',
            icon: Car,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            title: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
            subtitle: [
              vehicle.registration ? `Plaque : ${vehicle.registration}` : null,
              vehicle.mileage ? `${vehicle.mileage.toLocaleString('fr-FR')} km` : null,
              vehicle.fuelType,
              vehicle.dailyRate ? `${vehicle.dailyRate} €/j` : null,
              vehicle.salePrice ? `${formatMoney(vehicle.salePrice)}` : null,
            ]
              .filter(Boolean)
              .join(' • '),
            metaInfo: vehicle.category || vehicle.transmission,
            statusText: vehicle.status,
            statusBg,
            statusTextClass,
            statusBorder,
            rawItem: vehicle,
            onOpen: () => {
              saveSearchToHistory(rawQ);
              onClose();
              if (onSelectVehicle) {
                onSelectVehicle(vehicle);
              } else {
                setActiveTab('vehicles');
              }
            },
          });
        }
      });
    }

    // 3. VENTES (N° Vente, Client, Véhicule, Montant, Notes)
    if (hasPermission('quick-sale') || hasPermission('invoices')) {
      sales.forEach((sale) => {
        if (
          matchTerms([
            sale.saleNumber,
            sale.clientName,
            sale.vehicleName,
            sale.vehicleRegistration,
            sale.paymentStatus,
            sale.notes,
            sale.totalAmount,
            sale.id,
          ])
        ) {
          let statusBg = 'bg-amber-50';
          let statusTextClass = 'text-amber-700';
          let statusBorder = 'border-amber-200';

          if (sale.paymentStatus === 'Payé' || sale.status === 'Payé') {
            statusBg = 'bg-emerald-50';
            statusTextClass = 'text-emerald-700';
            statusBorder = 'border-emerald-200';
          } else if (sale.paymentStatus === 'Partiellement payé') {
            statusBg = 'bg-amber-50';
            statusTextClass = 'text-amber-700';
            statusBorder = 'border-amber-200';
          } else if (sale.status === 'Annulé') {
            statusBg = 'bg-rose-50';
            statusTextClass = 'text-rose-700';
            statusBorder = 'border-rose-200';
          }

          results.push({
            id: `sale_${sale.id}`,
            category: 'sales',
            categoryLabel: 'Ventes',
            icon: BadgePercent,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            title: `Vente ${sale.saleNumber || 'N° ' + sale.id.slice(-4)}`,
            subtitle: [
              `Client : ${sale.clientName}`,
              `Véhicule : ${sale.vehicleName}`,
              sale.vehicleRegistration ? `(${sale.vehicleRegistration})` : null,
              `Total : ${formatMoney(sale.totalAmount)}`,
            ]
              .filter(Boolean)
              .join(' • '),
            metaInfo: sale.saleDate || sale.createdAt?.split('T')[0],
            statusText: sale.paymentStatus || 'Validée',
            statusBg,
            statusTextClass,
            statusBorder,
            rawItem: sale,
            onOpen: () => {
              saveSearchToHistory(rawQ);
              onClose();
              if (onSelectSale) {
                onSelectSale(sale);
              } else {
                setActiveTab('quick-sale');
              }
            },
          });
        }
      });
    }

    // 4. LOCATIONS (N° Contrat, Client, Véhicule, Plaque, Dates, Statut)
    if (hasPermission('quick-rental') || hasPermission('invoices')) {
      rentals.forEach((rental) => {
        if (
          matchTerms([
            rental.rentalNumber,
            rental.clientName,
            rental.clientPhone,
            rental.vehicleName,
            rental.vehicleRegistration,
            rental.status,
            rental.startDate,
            rental.endDate,
            rental.notes,
            rental.id,
          ])
        ) {
          let statusBg = 'bg-amber-50';
          let statusTextClass = 'text-amber-700';
          let statusBorder = 'border-amber-200';

          if (rental.status === 'En cours') {
            statusBg = 'bg-blue-50';
            statusTextClass = 'text-blue-700';
            statusBorder = 'border-blue-200';
          } else if (rental.status === 'Clôturée' || rental.status === 'Terminée') {
            statusBg = 'bg-emerald-50';
            statusTextClass = 'text-emerald-700';
            statusBorder = 'border-emerald-200';
          } else if (rental.status === 'Annulée') {
            statusBg = 'bg-rose-50';
            statusTextClass = 'text-rose-700';
            statusBorder = 'border-rose-200';
          }

          results.push({
            id: `rental_${rental.id}`,
            category: 'rentals',
            categoryLabel: 'Locations',
            icon: KeyRound,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
            title: `Location ${rental.rentalNumber || 'N° ' + rental.id.slice(-4)}`,
            subtitle: [
              `Client : ${rental.clientName}`,
              `Véhicule : ${rental.vehicleName}`,
              `Du ${rental.startDate} au ${rental.endDate}`,
              `${formatMoney(rental.totalAmount)}`,
            ]
              .filter(Boolean)
              .join(' • '),
            metaInfo: `${rental.durationDays || 1} jour(s)`,
            statusText: rental.status,
            statusBg,
            statusTextClass,
            statusBorder,
            rawItem: rental,
            onOpen: () => {
              saveSearchToHistory(rawQ);
              onClose();
              if (onSelectRental) {
                onSelectRental(rental);
              } else {
                setActiveTab('quick-rental');
              }
            },
          });
        }
      });
    }

    // 5. RÉSERVATIONS (Référence, Client, Véhicule, Dates)
    if (hasPermission('reservations')) {
      reservations.forEach((res) => {
        if (
          matchTerms([
            res.referenceNumber,
            res.clientName,
            res.clientPhone,
            res.vehicleName,
            res.vehicleRegistration,
            res.status,
            res.startDate,
            res.endDate,
            res.notes,
            res.id,
          ])
        ) {
          let statusBg = 'bg-amber-50';
          let statusTextClass = 'text-amber-700';
          let statusBorder = 'border-amber-200';

          if (res.status === 'Confirmée') {
            statusBg = 'bg-emerald-50';
            statusTextClass = 'text-emerald-700';
            statusBorder = 'border-emerald-200';
          } else if (res.status === 'Convertie') {
            statusBg = 'bg-purple-50';
            statusTextClass = 'text-purple-700';
            statusBorder = 'border-purple-200';
          } else if (res.status === 'Annulée') {
            statusBg = 'bg-rose-50';
            statusTextClass = 'text-rose-700';
            statusBorder = 'border-rose-200';
          }

          results.push({
            id: `res_${res.id}`,
            category: 'reservations',
            categoryLabel: 'Réservations',
            icon: CalendarClock,
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
            title: `Réservation ${res.referenceNumber || res.id.slice(-4)}`,
            subtitle: [
              `Client : ${res.clientName}`,
              `Véhicule : ${res.vehicleName}`,
              `Du ${res.startDate} au ${res.endDate}`,
              res.estimatedAmount ? formatMoney(res.estimatedAmount) : null,
            ]
              .filter(Boolean)
              .join(' • '),
            metaInfo: res.startDate,
            statusText: res.status,
            statusBg,
            statusTextClass,
            statusBorder,
            rawItem: res,
            onOpen: () => {
              saveSearchToHistory(rawQ);
              onClose();
              if (onSelectReservation) {
                onSelectReservation(res);
              } else {
                setActiveTab('reservations');
              }
            },
          });
        }
      });
    }

    // 6. PAIEMENTS (Référence, Client, Méthode, Montant, N° Reçu)
    if (hasPermission('payments')) {
      payments.forEach((payment) => {
        if (
          matchTerms([
            payment.paymentNumber,
            payment.clientName,
            payment.paymentMethod,
            payment.referenceTitle,
            payment.notes,
            payment.amount,
            payment.status,
            payment.id,
          ])
        ) {
          let statusBg = 'bg-emerald-50';
          let statusTextClass = 'text-emerald-700';
          let statusBorder = 'border-emerald-200';

          if (payment.status === 'Remboursé') {
            statusBg = 'bg-indigo-50';
            statusTextClass = 'text-indigo-700';
            statusBorder = 'border-indigo-200';
          } else if (payment.status === 'Annulé') {
            statusBg = 'bg-rose-50';
            statusTextClass = 'text-rose-700';
            statusBorder = 'border-rose-200';
          }

          results.push({
            id: `pay_${payment.id}`,
            category: 'payments',
            categoryLabel: 'Paiements',
            icon: CreditCard,
            iconBg: 'bg-teal-50',
            iconColor: 'text-teal-600',
            title: `Paiement ${payment.paymentNumber || 'N° ' + payment.id.slice(-4)}`,
            subtitle: [
              `Client : ${payment.clientName}`,
              `Montant : ${formatMoney(payment.amount)}`,
              `Mode : ${payment.paymentMethod}`,
              payment.referenceTitle ? `Dossier : ${payment.referenceTitle}` : null,
            ]
              .filter(Boolean)
              .join(' • '),
            metaInfo: payment.date || payment.createdAt?.split('T')[0],
            statusText: payment.status || 'Encaissé',
            statusBg,
            statusTextClass,
            statusBorder,
            rawItem: payment,
            onOpen: () => {
              saveSearchToHistory(rawQ);
              onClose();
              if (onSelectPayment) {
                onSelectPayment(payment);
              } else {
                setActiveTab('payments');
              }
            },
          });
        }
      });
    }

    // 7. FACTURES (Numéro de facture, Client, Véhicule, Montant, Type)
    if (hasPermission('invoices') || hasPermission('quick-sale') || hasPermission('quick-rental')) {
      realInvoices.forEach((inv) => {
        if (
          matchTerms([
            inv.invoiceNumber,
            inv.clientName,
            inv.clientPhone,
            inv.vehicleName,
            inv.vehicleRegistration,
            inv.type,
            inv.status,
            inv.totalAmount,
            inv.id,
          ])
        ) {
          let statusBg = 'bg-amber-50';
          let statusTextClass = 'text-amber-700';
          let statusBorder = 'border-amber-200';

          if (inv.status === 'Payée') {
            statusBg = 'bg-emerald-50';
            statusTextClass = 'text-emerald-700';
            statusBorder = 'border-emerald-200';
          } else if (inv.status === 'Annulée') {
            statusBg = 'bg-rose-50';
            statusTextClass = 'text-rose-700';
            statusBorder = 'border-rose-200';
          }

          results.push({
            id: `inv_${inv.id}`,
            category: 'invoices',
            categoryLabel: 'Factures',
            icon: FileText,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            title: `Facture ${inv.invoiceNumber}`,
            subtitle: [
              `Type : ${inv.type}`,
              `Client : ${inv.clientName}`,
              `Véhicule : ${inv.vehicleName}`,
              `Montant : ${formatMoney(inv.totalAmount)}`,
            ]
              .filter(Boolean)
              .join(' • '),
            metaInfo: inv.date,
            statusText: inv.status,
            statusBg,
            statusTextClass,
            statusBorder,
            rawItem: inv,
            onOpen: () => {
              saveSearchToHistory(rawQ);
              onClose();
              if (onSelectInvoice) {
                onSelectInvoice(inv);
              } else {
                setActiveTab('invoices');
              }
            },
          });
        }
      });
    }

    // 8. CONTRATS (Numéro de contrat, Client, Véhicule, Caution)
    if (hasPermission('quick-rental') || hasPermission('invoices')) {
      rentals.forEach((r) => {
        if (
          matchTerms([
            r.rentalNumber,
            'contrat',
            r.clientName,
            r.vehicleName,
            r.vehicleRegistration,
            r.startDate,
            r.endDate,
            r.id,
          ])
        ) {
          results.push({
            id: `contract_${r.id}`,
            category: 'contracts',
            categoryLabel: 'Contrats',
            icon: FileCheck2,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-700',
            title: `Contrat N° ${r.rentalNumber || r.id.slice(-4)}`,
            subtitle: [
              `Locataire : ${r.clientName}`,
              `Véhicule : ${r.vehicleName}`,
              `Caution : ${formatMoney(r.depositAmount)}`,
              `Période : ${r.startDate} au ${r.endDate}`,
            ]
              .filter(Boolean)
              .join(' • '),
            metaInfo: 'Document officiel',
            statusText: r.status,
            statusBg: r.status === 'En cours' ? 'bg-blue-50' : 'bg-slate-100',
            statusTextClass: r.status === 'En cours' ? 'text-blue-700' : 'text-slate-700',
            statusBorder: r.status === 'En cours' ? 'border-blue-200' : 'border-slate-200',
            rawItem: r,
            onOpen: () => {
              saveSearchToHistory(rawQ);
              onClose();
              if (onSelectContract) {
                onSelectContract(r);
              } else {
                setActiveTab('quick-rental');
              }
            },
          });
        }
      });
    }

    // 9. PROSPECTS (Nom, Téléphone, Email, Projet/Besoin, Véhicule recherché)
    if (hasPermission('prospects')) {
      prospects.forEach((prospect) => {
        if (
          matchTerms([
            prospect.name,
            prospect.phone,
            prospect.whatsapp,
            prospect.email,
            prospect.searchedVehicle,
            prospect.needType,
            prospect.status,
            prospect.notes,
            prospect.id,
          ])
        ) {
          let statusBg = 'bg-slate-100';
          let statusTextClass = 'text-slate-700';
          let statusBorder = 'border-slate-200';

          if (prospect.status === 'Nouveau') {
            statusBg = 'bg-blue-50';
            statusTextClass = 'text-blue-700';
            statusBorder = 'border-blue-200';
          } else if (prospect.status === 'En discussion' || prospect.status === 'Intéressé') {
            statusBg = 'bg-amber-50';
            statusTextClass = 'text-amber-700';
            statusBorder = 'border-amber-200';
          } else if (prospect.status === 'Gagné') {
            statusBg = 'bg-emerald-50';
            statusTextClass = 'text-emerald-700';
            statusBorder = 'border-emerald-200';
          } else if (prospect.status === 'Perdu') {
            statusBg = 'bg-rose-50';
            statusTextClass = 'text-rose-700';
            statusBorder = 'border-rose-200';
          }

          results.push({
            id: `prospect_${prospect.id}`,
            category: 'prospects',
            categoryLabel: 'Prospects',
            icon: Target,
            iconBg: 'bg-violet-50',
            iconColor: 'text-violet-600',
            title: prospect.name,
            subtitle: [
              prospect.phone,
              prospect.needType ? `Projet : ${prospect.needType}` : null,
              prospect.searchedVehicle ? `Recherche : ${prospect.searchedVehicle}` : null,
              prospect.budget ? `Budget : ${formatMoney(prospect.budget)}` : null,
            ]
              .filter(Boolean)
              .join(' • '),
            metaInfo: 'Opportunité CRM',
            statusText: prospect.status,
            statusBg,
            statusTextClass,
            statusBorder,
            rawItem: prospect,
            onOpen: () => {
              saveSearchToHistory(rawQ);
              onClose();
              if (onSelectProspect) {
                onSelectProspect(prospect);
              } else {
                setActiveTab('prospects');
              }
            },
          });
        }
      });
    }

    return results;
  }, [
    query,
    clients,
    vehicles,
    sales,
    rentals,
    reservations,
    payments,
    realInvoices,
    prospects,
    hasPermission,
    settings.currencySymbol,
    onSelectClient,
    onSelectVehicle,
    onSelectSale,
    onSelectRental,
    onSelectReservation,
    onSelectPayment,
    onSelectInvoice,
    onSelectContract,
    onSelectProspect,
    setActiveTab,
    onClose,
  ]);

  // Filtered by selected category tab
  const filteredResults = useMemo(() => {
    if (selectedCategory === 'all') return allResults;
    return allResults.filter((r) => r.category === selectedCategory);
  }, [allResults, selectedCategory]);

  // Counts per category for the filter tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<SearchCategory, number> = {
      all: allResults.length,
      clients: 0,
      vehicles: 0,
      sales: 0,
      rentals: 0,
      reservations: 0,
      payments: 0,
      invoices: 0,
      contracts: 0,
      prospects: 0,
    };
    allResults.forEach((r) => {
      if (counts[r.category] !== undefined) {
        counts[r.category]++;
      }
    });
    return counts;
  }, [allResults]);

  // Grouped results for the 'all' view
  const groupedResults = useMemo(() => {
    const groups: { category: SearchCategory; label: string; items: SearchResultItem[] }[] = [];
    const categoryOrder: { cat: SearchCategory; label: string }[] = [
      { cat: 'clients', label: 'Clients' },
      { cat: 'vehicles', label: 'Véhicules' },
      { cat: 'sales', label: 'Ventes' },
      { cat: 'rentals', label: 'Locations' },
      { cat: 'reservations', label: 'Réservations' },
      { cat: 'payments', label: 'Paiements' },
      { cat: 'invoices', label: 'Factures' },
      { cat: 'contracts', label: 'Contrats' },
      { cat: 'prospects', label: 'Prospects' },
    ];

    categoryOrder.forEach(({ cat, label }) => {
      const items = allResults.filter((r) => r.category === cat);
      if (items.length > 0) {
        groups.push({ category: cat, label, items });
      }
    });

    return groups;
  }, [allResults]);

  // Flat list of currently rendered items to support smooth ArrowUp / ArrowDown navigation
  const flatVisibleItems = useMemo(() => {
    if (selectedCategory !== 'all') {
      return filteredResults;
    }
    const flat: SearchResultItem[] = [];
    groupedResults.forEach((g) => {
      flat.push(...g.items);
    });
    return flat;
  }, [selectedCategory, filteredResults, groupedResults]);

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (flatVisibleItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % flatVisibleItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + flatVisibleItems.length) % flatVisibleItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = flatVisibleItems[highlightedIndex];
        if (target) {
          target.onOpen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatVisibleItems, highlightedIndex, onClose]);

  if (!isOpen) return null;

  const filterTabs: { id: SearchCategory; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'clients', label: 'Clients' },
    { id: 'vehicles', label: 'Véhicules' },
    { id: 'sales', label: 'Ventes' },
    { id: 'rentals', label: 'Locations' },
    { id: 'reservations', label: 'Réservations' },
    { id: 'payments', label: 'Paiements' },
    { id: 'invoices', label: 'Factures' },
    { id: 'contracts', label: 'Contrats' },
    { id: 'prospects', label: 'Prospects' },
  ];

  return (
    <div
      id="global-search-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 md:pt-14 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="global-search-modal-container"
        className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl border border-[#E5E5DF] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-98 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#E5E5DF] bg-[#FAFAF8] flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              id="global-search-palette-input"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              placeholder="Rechercher par client, plaque, N° vente, contrat, facture, paiement, prospect..."
              className="w-full bg-transparent text-sm sm:text-base text-[#1A1A18] placeholder-[#9A9A92] focus:outline-hidden font-medium"
            />
          </div>

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 text-[#9A9A92] hover:text-[#1A1A18] hover:bg-[#E5E5DF]/60 rounded-lg transition-colors cursor-pointer"
              title="Effacer la saisie"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#E5E5DF]/60 rounded-xl transition-colors cursor-pointer"
            title="Fermer (Échap)"
          >
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#E5E5DF]/60 text-[#5A5A50] mr-1">
              Échap
            </span>
            <X className="w-5 h-5 inline-block sm:hidden" />
          </button>
        </div>

        {/* Filter Category Pills */}
        {query.trim().length > 0 && (
          <div className="px-3.5 sm:px-4 py-2 border-b border-[#E5E5DF] bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#9A9A92] shrink-0 mr-1 hidden sm:block" />
            {filterTabs.map((tab) => {
              const count = categoryCounts[tab.id];
              const isSelected = selectedCategory === tab.id;

              // Hide tab if not 'all' and has 0 results
              if (tab.id !== 'all' && count === 0) return null;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(tab.id);
                    setHighlightedIndex(0);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#5A5A40] text-white shadow-xs'
                      : 'bg-[#F5F5F3] text-[#5A5A50] hover:bg-[#EAEAE6] hover:text-[#1A1A18]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#E5E5DF] text-[#5A5A50]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content Area */}
        <div ref={listContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* CASE 1: Query is empty -> Display Search History & Quick Guidance */}
          {!query.trim() && (
            <div className="space-y-5">
              {/* Search History */}
              {searchHistory.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7A7A72]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Recherches récentes</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllHistory}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                      Effacer l'historique
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {searchHistory.map((item) => (
                      <div
                        key={item}
                        onClick={() => {
                          setQuery(item);
                          inputRef.current?.focus();
                        }}
                        className="group flex items-center justify-between p-2.5 rounded-xl bg-[#F9F9F8] hover:bg-[#F0EFEB] border border-[#E5E5DF] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Search className="w-3.5 h-3.5 text-[#9A9A92] group-hover:text-[#5A5A40] shrink-0" />
                          <span className="text-xs font-medium text-[#1A1A18] truncate">{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => removeHistoryItem(item, e)}
                          className="p-1 rounded-md text-[#9A9A92] hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Supprimer cette recherche"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Quick Search Hints / Categories available */}
              <div className="space-y-2 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A72]">
                  Recherche globale instantanée
                </span>
                <p className="text-xs text-[#7A7A72] leading-relaxed">
                  Tapez le moindre élément pour retrouver instantanément vos données réelles sans avoir à naviguer dans chaque module.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs">
                    <div className="font-bold text-[#1A1A18] flex items-center gap-1.5 mb-1">
                      <Users className="w-3.5 h-3.5 text-indigo-600" /> Clients & Prospects
                    </div>
                    <span className="text-[11px] text-[#7A7A72]">Nom, téléphone, email, WhatsApp</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs">
                    <div className="font-bold text-[#1A1A18] flex items-center gap-1.5 mb-1">
                      <Car className="w-3.5 h-3.5 text-blue-600" /> Véhicules
                    </div>
                    <span className="text-[11px] text-[#7A7A72]">Plaque, marque, modèle, VIN</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs">
                    <div className="font-bold text-[#1A1A18] flex items-center gap-1.5 mb-1">
                      <BadgePercent className="w-3.5 h-3.5 text-emerald-600" /> Ventes & Factures
                    </div>
                    <span className="text-[11px] text-[#7A7A72]">N° de vente, N° de facture</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs">
                    <div className="font-bold text-[#1A1A18] flex items-center gap-1.5 mb-1">
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Locations & Contrats
                    </div>
                    <span className="text-[11px] text-[#7A7A72]">N° de contrat, locataire</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs">
                    <div className="font-bold text-[#1A1A18] flex items-center gap-1.5 mb-1">
                      <CreditCard className="w-3.5 h-3.5 text-teal-600" /> Paiements & Reçus
                    </div>
                    <span className="text-[11px] text-[#7A7A72]">Réf paiement, mode, client</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs">
                    <div className="font-bold text-[#1A1A18] flex items-center gap-1.5 mb-1">
                      <CalendarClock className="w-3.5 h-3.5 text-purple-600" /> Réservations
                    </div>
                    <span className="text-[11px] text-[#7A7A72]">Réf réservation, dates</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CASE 2: Query non-empty & Results found */}
          {query.trim() && allResults.length > 0 && (
            <div className="space-y-4">
              {selectedCategory === 'all' ? (
                // Grouped by Category View
                groupedResults.map((group) => (
                  <div key={group.category} className="space-y-1.5">
                    <div className="flex items-center justify-between px-1.5 py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40]">
                          {group.label}
                        </span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#5A5A40]/10 text-[#5A5A40]">
                          {group.items.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const currentIndex = flatVisibleItems.findIndex((fi) => fi.id === item.id);
                        const isHighlighted = currentIndex === highlightedIndex;
                        const ItemIcon = item.icon;

                        return (
                          <div
                            key={item.id}
                            id={`search-result-${item.id}`}
                            onClick={item.onOpen}
                            onMouseEnter={() => setHighlightedIndex(currentIndex)}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                              isHighlighted
                                ? 'bg-[#5A5A40]/10 border-[#5A5A40] shadow-xs'
                                : 'bg-white hover:bg-[#F9F9F8] border-[#E5E5DF]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-3">
                              <div
                                className={`w-9 h-9 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 border border-black/5`}
                              >
                                <ItemIcon className="w-4.5 h-4.5" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs sm:text-sm font-bold text-[#1A1A18] truncate font-['Outfit']">
                                    {item.title}
                                  </h4>
                                  {item.metaInfo && (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#F0EFEB] text-[#5A5A50] shrink-0">
                                      {item.metaInfo}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] sm:text-xs text-[#7A7A72] truncate mt-0.5">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {item.statusText && (
                                <span
                                  className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                    item.statusBg || 'bg-slate-100'
                                  } ${item.statusTextClass || 'text-slate-700'} ${
                                    item.statusBorder || 'border-slate-200'
                                  }`}
                                >
                                  {item.statusText}
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-[#9A9A92] group-hover:text-[#1A1A18]" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                // Filtered List View
                <div className="space-y-1.5">
                  {filteredResults.map((item, idx) => {
                    const isHighlighted = idx === highlightedIndex;
                    const ItemIcon = item.icon;

                    return (
                      <div
                        key={item.id}
                        id={`search-result-${item.id}`}
                        onClick={item.onOpen}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                          isHighlighted
                            ? 'bg-[#5A5A40]/10 border-[#5A5A40] shadow-xs'
                            : 'bg-white hover:bg-[#F9F9F8] border-[#E5E5DF]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-3">
                          <div
                            className={`w-9 h-9 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 border border-black/5`}
                          >
                            <ItemIcon className="w-4.5 h-4.5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-[#1A1A18] truncate font-['Outfit']">
                                {item.title}
                              </h4>
                              {item.metaInfo && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#F0EFEB] text-[#5A5A50] shrink-0">
                                  {item.metaInfo}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] sm:text-xs text-[#7A7A72] truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.statusText && (
                            <span
                              className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                item.statusBg || 'bg-slate-100'
                              } ${item.statusTextClass || 'text-slate-700'} ${
                                item.statusBorder || 'border-slate-200'
                              }`}
                            >
                              {item.statusText}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-[#9A9A92]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CASE 3: Query non-empty & 0 Results -> Professional Empty State (Strictly NO fake data) */}
          {query.trim() && allResults.length === 0 && (
            <div className="py-12 px-4 text-center max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#F5F5F3] text-[#7A7A72] flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                Aucun résultat trouvé pour « {query} »
              </h3>
              <p className="text-xs sm:text-sm text-[#7A7A72] leading-relaxed">
                Vérifiez l'orthographe ou essayez un autre terme (nom de client, numéro de contrat, plaque d'immatriculation ou téléphone).
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Effacer la recherche
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-3 border-t border-[#E5E5DF] bg-[#FAFAF8] flex items-center justify-between text-[11px] text-[#7A7A72]">
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E5E5DF] font-mono text-[10px] font-semibold text-[#1A1A18]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E5E5DF] font-mono text-[10px] font-semibold text-[#1A1A18]">
                ↓
              </kbd>
              <span>Naviguer</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E5E5DF] font-mono text-[10px] font-semibold text-[#1A1A18]">
                Entrée
              </kbd>
              <span>Ouvrir la fiche</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E5E5DF] font-mono text-[10px] font-semibold text-[#1A1A18]">
                Échap
              </kbd>
              <span>Fermer</span>
            </span>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto">
            <span>
              {query.trim()
                ? `${allResults.length} résultat${allResults.length > 1 ? 's' : ''} trouvé${
                    allResults.length > 1 ? 's' : ''
                  }`
                : 'Tapez votre recherche'}
            </span>
            <span className="text-[10px] text-[#9A9A92] sm:ml-3">Sirius Auto CRM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
