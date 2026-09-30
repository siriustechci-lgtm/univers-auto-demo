import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Vehicle,
  Client,
  Sale,
  Purchase,
  Rental,
  Payment,
  SaleStatus,
  AgencySettings,
  ToastMessage,
  NavigationTab,
  WhatsAppMessage,
  MessageTemplate,
  CrmNotification,
  WhatsAppSettings,
  AiMessage,
  AiConversation,
  AiSettings,
  AiSmartInsight,
  Expense,
  ExpenseCategory,
  OtherRevenue,
  AccountingEntry,
  AccountingPeriodFilter,
  Reservation,
  ReservationStatus,
  PaymentMethod,
  MaintenanceIntervention,
  MaintenanceType,
  MaintenanceStatus,
  MaintenanceDocument,
  Supplier,
  SupplierCategory,
  SupplierStatus,
  Prospect,
  ProspectStatus,
  ProspectNeedType,
  ProspectFollowUp,
  ProspectReminder,
  ProspectFollowUpType,
} from '../types';
import { processAiQuery, generateLiveSmartInsights } from '../utils/aiEngine';
import { useAuth } from './AuthContext';

const STORAGE_MIGRATION_KEY = 'sirius_crm_storage_migration_version';
const CURRENT_STORAGE_VERSION = 'v3_production_clean_ready';
const STORAGE_KEY = 'sirius_auto_crm_data_v3';

// One-time automatic migration for production: purges all previous demo/test keys and legacy versions
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const installedVersion = localStorage.getItem(STORAGE_MIGRATION_KEY);
    if (installedVersion !== CURRENT_STORAGE_VERSION) {
      // 1. Identify and purge all old CRM demo keys from v1 and v2
      const keysToPurge: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          if (
            key.startsWith('sirius_auto_crm_data_v1') ||
            key.startsWith('sirius_auto_crm_data_v2') ||
            key.startsWith('sirius_auto_crm_v1') ||
            key.startsWith('sirius_auto_crm_v2') ||
            key.startsWith('sirius_auto_crm_data_') ||
            key === 'sirius_crm_storage_version' ||
            key === 'sirius_crm_search_history_v1' ||
            key === 'sirius_crm_data_v1_notifications' ||
            key === 'sirius_auto_crm_notifications'
          ) {
            keysToPurge.push(key);
          }
        }
      }
      keysToPurge.forEach((k) => localStorage.removeItem(k));

      // 2. Also check and clean any demo keys from sessionStorage
      if (window.sessionStorage) {
        const sessionKeysToPurge: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const sKey = sessionStorage.key(i);
          if (
            sKey &&
            (sKey.startsWith('sirius_auto_crm_data_v1') ||
              sKey.startsWith('sirius_auto_crm_data_v2') ||
              sKey.startsWith('sirius_auto_crm_'))
          ) {
            sessionKeysToPurge.push(sKey);
          }
        }
        sessionKeysToPurge.forEach((sk) => sessionStorage.removeItem(sk));
      }

      // 3. Mark migration as completed for this browser
      localStorage.setItem(STORAGE_MIGRATION_KEY, CURRENT_STORAGE_VERSION);
    }
  } catch (e) {
    console.error('Storage migration error:', e);
  }
}

export const defaultMessageTemplates: MessageTemplate[] = [
  {
    id: 'tpl_conf_vente',
    code: 'confirmation_vente',
    title: 'Confirmation de Vente & Facture',
    category: 'vente',
    description: "Récapitulatif officiel envoyé après la signature d'une vente de véhicule.",
    template: `Bonjour {client_name},\n\nNous vous confirmons la vente de votre véhicule *{vehicle_name}* (Immatriculation : *{vehicle_registration}*) chez *{company_name}*.\n\n📋 Facture N° : *{invoice_number}*\n💰 Prix Total TTC : *{amount}*\n💳 Montant Réglé : *{amount_paid}*\n⚠️ Solde Restant : *{balance}*\n\nPour toute information, notre équipe reste à votre disposition au {company_phone}.\nMerci pour votre confiance !`,
    variables: ['{client_name}', '{vehicle_name}', '{vehicle_registration}', '{company_name}', '{invoice_number}', '{amount}', '{amount_paid}', '{balance}', '{company_phone}'],
    isDefault: true,
  },
  {
    id: 'tpl_conf_location',
    code: 'confirmation_location',
    title: 'Confirmation de Location & Contrat',
    category: 'location',
    description: 'Détails du contrat de location remis lors du départ du véhicule.',
    template: `Bonjour {client_name},\n\nVotre contrat de location N° *{rental_number}* pour le véhicule *{vehicle_name}* (*{vehicle_registration}*) est confirmé chez *{company_name}*.\n\n📅 Période : du *{start_date}* au *{end_date}* ({duration} jours)\n💰 Montant Total : *{amount}*\n🔒 Caution déposée : *{deposit_amount}*\n⚠️ Solde Restant : *{balance}*\n\nKilométrage de départ : {mileage_departure} km.\nBonne route et restez prudent !`,
    variables: ['{client_name}', '{rental_number}', '{vehicle_name}', '{vehicle_registration}', '{company_name}', '{start_date}', '{end_date}', '{duration}', '{amount}', '{deposit_amount}', '{balance}', '{mileage_departure}'],
    isDefault: true,
  },
  {
    id: 'tpl_rappel_retour',
    code: 'rappel_retour',
    title: 'Rappel de Restitution Véhicule',
    category: 'location',
    description: 'Rappel courtois envoyé avant la date de fin du contrat de location.',
    template: `Bonjour {client_name},\n\nRappel amical : votre contrat de location pour le véhicule *{vehicle_name}* (*{vehicle_registration}*) se termine le *{end_date}*.\n\nLieu de restitution : {company_address}.\nMerci de prévoir le niveau de carburant initial et les documents du véhicule.\n\nBesoin d'une prolongation ? Contactez-nous sans attendre au {company_phone}.`,
    variables: ['{client_name}', '{vehicle_name}', '{vehicle_registration}', '{end_date}', '{company_address}', '{company_phone}'],
    isDefault: true,
  },
  {
    id: 'tpl_retour_retard',
    code: 'retour_retard',
    title: 'Alerte Retard de Restitution',
    category: 'location',
    description: 'Alerte urgente transmise au locataire lorsque la date de retour est dépassée.',
    template: `Bonjour {client_name},\n\nVotre contrat de location pour le véhicule *{vehicle_name}* (*{vehicle_registration}*) est arrivé à échéance le *{end_date}*.\n\nLe véhicule n'a pas encore été restitué à notre agence. Merci de nous contacter de toute urgence au {company_phone} pour régulariser votre situation.\n\nDirection {company_name}`,
    variables: ['{client_name}', '{vehicle_name}', '{vehicle_registration}', '{end_date}', '{company_phone}', '{company_name}'],
    isDefault: true,
  },
  {
    id: 'tpl_conf_paiement',
    code: 'confirmation_paiement',
    title: 'Confirmation de Paiement & Reçu',
    category: 'paiement',
    description: "Accusé de réception officiel d'un versement effectué par le client.",
    template: `Bonjour {client_name},\n\nNous accusons bonne réception de votre versement de *{payment_amount}* par *{payment_method}* concernant *{reference_title}*.\n\n🧾 Reçu N° : *{receipt_number}*\n📅 Date : *{payment_date}*\n⚠️ Solde restant dû : *{balance}*\n\n*{company_name}* vous remercie pour votre règlement !`,
    variables: ['{client_name}', '{payment_amount}', '{payment_method}', '{reference_title}', '{receipt_number}', '{payment_date}', '{balance}', '{company_name}'],
    isDefault: true,
  },
  {
    id: 'tpl_rappel_paiement',
    code: 'rappel_paiement',
    title: 'Rappel de Solde Restant Dû',
    category: 'paiement',
    description: 'Invitation bienveillante à régulariser un solde en attente.',
    template: `Bonjour {client_name},\n\nSauf erreur de notre part, votre dossier concernant le véhicule *{vehicle_name}* présente un solde restant dû de *{balance}*.\n\nModes acceptés : Virement, Chèque, Espèces ou Mobile Money.\nPour toute question ou justificatif, contactez notre équipe au {company_phone}.\n\nMerci de votre collaboration,\n*{company_name}*`,
    variables: ['{client_name}', '{vehicle_name}', '{balance}', '{company_phone}', '{company_name}'],
    isDefault: true,
  },
  {
    id: 'tpl_bienvenue',
    code: 'bienvenue',
    title: 'Bienvenue Nouveau Client',
    category: 'general',
    description: "Message d'accueil chaleureux après la création d'une fiche client.",
    template: `Bonjour {client_name},\n\nToute l'équipe de *{company_name}* est ravie de vous compter parmi ses clients !\n\nNous restons à votre entière disposition pour toutes vos exigences de mobilité, location et achat de véhicules.\n\n📞 Téléphone : {company_phone}\n📍 Adresse : {company_address}\n🌐 Site web : {company_website}`,
    variables: ['{client_name}', '{company_name}', '{company_phone}', '{company_address}', '{company_website}'],
    isDefault: true,
  },
  {
    id: 'tpl_remerciement',
    code: 'remerciement',
    title: 'Remerciement & Fin de Contrat',
    category: 'general',
    description: 'Remerciements et fidélisation suite à une vente ou restitution conforme.',
    template: `Bonjour {client_name},\n\n*{company_name}* vous remercie chaleureusement pour votre confiance pour le véhicule *{vehicle_name}*.\n\nNous espérons que nos services vous ont donné entière satisfaction. À très bientôt pour votre prochaine aventure automobile !`,
    variables: ['{client_name}', '{company_name}', '{vehicle_name}'],
    isDefault: true,
  },
];

export const defaultWhatsAppConfig: WhatsAppSettings = {
  whatsappEnabled: true,
  agencyWhatsAppNumber: '',
  defaultCountryCode: '+33',
  autoSendSaleInvoice: true,
  autoSendRentalContract: true,
  autoSendPaymentReceipt: true,
  autoSendReturnReminder: true,
  returnReminderHoursBefore: 24,
  emailNotifications: true,
  internalNotifications: true,
};

const defaultSettings: AgencySettings = {
  companyName: 'UNIVERS AUTO',
  legalStatus: 'Concession Automobile · Vente & Achat',
  siretOrTaxId: '',
  rccm: 'SN.DKR.2024.B.1234',
  taxNumber: '0098765432Y',
  legalInfo: 'Achat & Vente de Véhicules Neufs et d’Occasion',
  address: 'Boulevard du Centenaire de la Commune de Dakar',
  city: 'Dakar',
  country: 'Sénégal',
  postalCode: '10000',
  phone: '+221 33 800 00 00',
  whatsapp: '+221 77 000 00 00',
  email: 'contact@universauto.sn',
  website: 'https://universauto.sn',
  currency: 'FCFA',
  currencySymbol: 'FCFA',
  language: 'Français',
  timeZone: 'Africa/Dakar (GMT)',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  defaultVatRate: 0,
  rentalTerms: 'Véhicules révisés et certifiés. La propriété du véhicule n’est transférée à l’acquéreur qu’après règlement intégral du prix de vente.',
  invoiceFooter: 'UNIVERS AUTO — Votre partenaire de confiance pour l’automobile neuve et d’occasion certifiée.',
  invoicePrefix: 'FAC-',
  receiptPrefix: 'REC-',
  autoNumbering: true,
  taxEnabled: false,
  notifications: {
    systemNotifications: true,
    paymentNotifications: true,
    rentalNotifications: true,
    saleNotifications: true,
    channelApp: true,
    channelWhatsapp: false,
    channelEmail: true,
  },
  whatsAppConfig: defaultWhatsAppConfig,
  backupHistory: [],
};

export const defaultAiSettings: AiSettings = {
  language: 'fr',
  tone: 'professionnel',
  detailLevel: 'standard',
  autoSuggestions: true,
  includeAlertsInSummaries: true,
};

interface CrmContextType {
  // State (Initialized strictly empty)
  vehicles: Vehicle[];
  clients: Client[];
  purchases: Purchase[];
  sales: Sale[];
  rentals: Rental[];
  payments: Payment[];
  expenses: Expense[];
  otherRevenues: OtherRevenue[];
  reservations: Reservation[];
  maintenances: MaintenanceIntervention[];
  suppliers: Supplier[];
  prospects: Prospect[];
  messages: WhatsAppMessage[];
  templates: MessageTemplate[];
  notifications: CrmNotification[];
  whatsAppConfig: WhatsAppSettings;
  settings: AgencySettings;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  toasts: ToastMessage[];

  // Accounting Actions
  addExpense: (expense: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt'>) => Expense;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addOtherRevenue: (revenue: Omit<OtherRevenue, 'id' | 'revenueNumber' | 'createdAt'>) => OtherRevenue;
  updateOtherRevenue: (id: string, data: Partial<OtherRevenue>) => void;
  deleteOtherRevenue: (id: string) => void;
  getAccountingJournal: () => AccountingEntry[];

  // AI Assistant State & Actions
  aiConversations: AiConversation[];
  currentConversationId: string | null;
  aiSettings: AiSettings;
  isAiDrawerOpen: boolean;
  aiInitialPrompt: string | null;
  openAiDrawer: (initialPrompt?: string) => void;
  closeAiDrawer: () => void;
  toggleAiDrawer: () => void;
  setAiInitialPrompt: (prompt: string | null) => void;
  sendAiMessage: (content: string, conversationId?: string) => AiMessage;
  createNewAiConversation: (title?: string) => string;
  selectAiConversation: (id: string) => void;
  deleteAiConversation: (id: string) => void;
  archiveAiConversation: (id: string) => void;
  clearAiHistory: () => void;
  updateAiSettings: (newSettings: Partial<AiSettings>) => void;
  getLiveSmartInsights: () => AiSmartInsight[];

  // Purchases
  createPurchase: (purchase: Partial<Purchase>) => Promise<void>;
  updatePurchase: (id: string, purchase: Partial<Purchase>) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;

  // Vehicles
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => Vehicle;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Reservations
  addReservation: (reservationData: {
    vehicleId: string;
    clientId: string;
    startDate: string;
    endDate: string;
    depositAmount?: number;
    depositPaymentMethod?: PaymentMethod | string;
    notes?: string;
    status?: ReservationStatus;
  }) => Reservation | null;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
  cancelReservation: (id: string, reason?: string) => void;
  deleteReservation: (id: string) => void;
  convertReservationToRental: (
    id: string,
    extraData?: {
      dailyRate?: number;
      depositAmount?: number;
      mileageDeparture?: number;
      paymentMethod?: PaymentMethod | string;
      amountPaid?: number;
      notes?: string;
    }
  ) => Rental | null;
  convertReservationToSale: (
    id: string,
    extraData?: {
      salePrice?: number;
      taxRate?: number;
      paymentMethod?: PaymentMethod | string;
      amountPaid?: number;
      notes?: string;
    }
  ) => Sale | null;

  // Maintenance & Entretien
  addMaintenance: (maintenanceData: {
    vehicleId: string;
    date: string;
    dueDate?: string;
    type: MaintenanceType;
    description: string;
    supplierId?: string;
    supplier: string;
    supplierPhone?: string;
    amount: number;
    status?: MaintenanceStatus;
    mileageAtIntervention?: number;
    nextScheduledDate?: string;
    nextScheduledMileage?: number;
    documents?: MaintenanceDocument[];
    invoiceUrl?: string;
    quoteUrl?: string;
    photos?: string[];
    notes?: string;
    autoSetVehicleMaintenance?: boolean;
    autoRecordExpense?: boolean;
    paymentMethod?: PaymentMethod | string;
  }) => MaintenanceIntervention | null;
  updateMaintenance: (id: string, data: Partial<MaintenanceIntervention>) => void;
  completeMaintenance: (
    id: string,
    completionData?: {
      actualDate?: string;
      notes?: string;
      autoRevertVehicleAvailable?: boolean;
    }
  ) => void;
  cancelMaintenance: (id: string, reason?: string) => void;
  deleteMaintenance: (id: string) => void;
  getMaintenanceCostByVehicle: (vehicleId: string) => {
    totalCost: number;
    interventionCount: number;
    lastDate?: string;
  };
  getMaintenanceAlerts: () => {
    id: string;
    type: 'insurance_expiry' | 'inspection_expiry' | 'maintenance_scheduled' | 'vehicle_immobilized';
    severity: 'error' | 'warning' | 'info';
    title: string;
    message: string;
    vehicleId?: string;
    vehicleName?: string;
    dueDate?: string;
    daysRemaining?: number;
  }[];

  // Fournisseurs & Prestataires
  addSupplier: (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Supplier;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  getSupplierStats: (supplierIdOrName: string) => {
    totalInvoiced: number;
    totalPaid: number;
    balanceDue: number;
    interventionsCount: number;
    expensesCount: number;
    lastInterventionDate?: string;
  };
  getSupplierInterventions: (supplierIdOrName: string) => MaintenanceIntervention[];
  getSupplierExpenses: (supplierIdOrName: string) => Expense[];

  // Prospects & CRM Commercial
  addProspect: (prospectData: {
    name: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    needType: ProspectNeedType;
    searchedVehicle?: string;
    budget?: number;
    expectedDate?: string;
    status?: ProspectStatus;
    notes?: string;
    initialReminderDate?: string;
    initialReminderTime?: string;
    initialReminderReason?: string;
  }) => Prospect;
  updateProspect: (id: string, data: Partial<Prospect>) => void;
  deleteProspect: (id: string) => void;
  addProspectFollowUp: (
    prospectId: string,
    followUp: {
      type: ProspectFollowUpType;
      title: string;
      notes?: string;
      date?: string;
      time?: string;
    }
  ) => void;
  addProspectReminder: (
    prospectId: string,
    reminder: {
      date: string;
      time?: string;
      reason: string;
      notes?: string;
    }
  ) => void;
  completeProspectReminder: (prospectId: string, reminderId: string) => void;
  convertProspectToClient: (prospectId: string) => Client | null;
  getCommercialDashboardStats: () => {
    totalProspects: number;
    newProspects: number;
    inDiscussionProspects: number;
    interestedProspects: number;
    wonProspects: number;
    lostProspects: number;
    convertedClientsCount: number;
    totalSalesCount: number;
    totalRentalsCount: number;
    conversionRate: number;
    upcomingRemindersCount: number;
    overdueRemindersCount: number;
  };

  // Sales
  addSale: (saleData: {
    vehicleId: string;
    clientId: string;
    salePrice: number;
    taxRate: number;
    paymentMethod: Sale['paymentMethod'];
    paymentStatus: Sale['paymentStatus'];
    amountPaid: number;
    saleDate: string;
    notes?: string;
  }) => Sale | null;
  deleteSale: (id: string) => void;

  // Rentals
  addRental: (rentalData: {
    vehicleId: string;
    clientId: string;
    startDate: string;
    endDate: string;
    dailyRate: number;
    depositAmount: number;
    mileageDeparture: number;
    status: Rental['status'];
    paymentStatus: Rental['paymentStatus'];
    amountPaid: number;
    paymentMethod: Rental['paymentMethod'];
    notes?: string;
  }) => Rental | null;
  updateRental: (id: string, data: Partial<Rental>) => void;
  updateRentalStatus: (id: string, status: Rental['status'], returnMileage?: number, depositReturned?: boolean) => void;
  closeRentalVehicle: (
    id: string,
    returnData: {
      actualReturnDate: string;
      returnMileage: number;
      conditionOnReturn: 'Conforme' | 'Dommages constatés';
      damageNotes?: string;
      damageFee?: number;
      depositReturned: boolean;
      notes?: string;
    }
  ) => void;
  deleteRental: (id: string) => void;

  // Payments
  addPayment: (payment: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt'>) => Payment;
  updatePayment: (id: string, data: Partial<Payment>) => void;
  updatePaymentStatus: (id: string, status: Payment['status']) => void;
  deletePayment: (id: string) => void;
  refundDeposit: (
    rentalId: string,
    refundData: {
      amount: number;
      deductionAmount?: number;
      deductionReason?: string;
      refundDate: string;
      paymentMethod: Payment['paymentMethod'];
      notes?: string;
    }
  ) => void;

  // WhatsApp & Messages
  sendWhatsAppMessage: (params: {
    clientId: string;
    clientName: string;
    clientPhone: string;
    content: string;
    messageCategory?: WhatsAppMessage['messageCategory'];
    messageType?: string;
    referenceType?: WhatsAppMessage['referenceType'];
    referenceId?: string;
    referenceNumber?: string;
    documentType?: WhatsAppMessage['documentType'];
    openUrl?: boolean;
  }) => WhatsAppMessage;
  deleteWhatsAppMessage: (id: string) => void;
  resendWhatsAppMessage: (id: string) => void;
  updateMessageTemplate: (id: string, updated: Partial<MessageTemplate>) => void;
  resetMessageTemplates: () => void;
  updateWhatsAppSettings: (newConfig: Partial<WhatsAppSettings>) => void;

  // Notifications & Alerts
  addNotification: (notif: Omit<CrmNotification, 'id' | 'timestamp' | 'isRead'>) => CrmNotification;
  markNotificationAsRead: (id: string) => void;
  markNotificationAsUnread: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearReadNotifications: () => void;
  clearAllNotifications: () => void;

  // Settings & Management
  updateSettings: (newSettings: Partial<AgencySettings>) => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
  resetAllData: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, hasPermission, hasModulePermission } = useAuth();

  // AI Drawer state & initial prompt
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);

  const openAiDrawer = (initialPrompt?: string) => {
    if (initialPrompt) {
      setAiInitialPrompt(initialPrompt);
    }
    setIsAiDrawerOpen(true);
  };

  const closeAiDrawer = () => {
    setIsAiDrawerOpen(false);
  };

  const toggleAiDrawer = () => {
    setIsAiDrawerOpen((prev) => !prev);
  };

  // CRITICAL: Strictly empty initial state without any mock data
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_vehicles`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_clients`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sales`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_purchases`);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [rentals, setRentals] = useState<Rental[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_rentals`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [otherRevenues, setOtherRevenues] = useState<OtherRevenue[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_other_revenues`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_reservations`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [maintenances, setMaintenances] = useState<MaintenanceIntervention[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_maintenances`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_suppliers`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [prospects, setProspects] = useState<Prospect[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_prospects`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState<WhatsAppMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_messages`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_templates`);
      return saved ? JSON.parse(saved) : defaultMessageTemplates;
    } catch {
      return defaultMessageTemplates;
    }
  });

  // Helper to strictly sanitize notifications: only authentic user records are allowed
  const sanitizeNotifications = (
    rawNotifs: CrmNotification[],
    vList: Vehicle[],
    cList: Client[],
    sList: Sale[],
    rList: Rental[],
    pList: Payment[],
    eList: Expense[],
    oList: OtherRevenue[],
    resList: Reservation[],
    mList: MaintenanceIntervention[],
    prospList: Prospect[],
    msgList: WhatsAppMessage[]
  ): CrmNotification[] => {
    if (!Array.isArray(rawNotifs)) return [];

    // If CRM collections are empty, absolutely 0 notifications must exist
    if (
      vList.length === 0 &&
      cList.length === 0 &&
      sList.length === 0 &&
      rList.length === 0 &&
      pList.length === 0 &&
      eList.length === 0 &&
      oList.length === 0 &&
      resList.length === 0 &&
      mList.length === 0 &&
      prospList.length === 0 &&
      msgList.length === 0
    ) {
      return [];
    }

    const validSaleIds = new Set(sList.map((s) => s.id));
    const validSaleNumbers = new Set(sList.map((s) => s.saleNumber).filter(Boolean));
    const validRentalIds = new Set(rList.map((r) => r.id));
    const validRentalNumbers = new Set(rList.map((r) => r.rentalNumber).filter(Boolean));
    const validExpenseIds = new Set(eList.map((e) => e.id));
    const validOtherRevenueIds = new Set(oList.map((o) => o.id));
    const validPaymentIds = new Set(pList.map((p) => p.id));
    const validPaymentNumbers = new Set(pList.map((p) => p.paymentNumber).filter(Boolean));
    const validClientIds = new Set(cList.map((c) => c.id));
    const validProspectIds = new Set(prospList.map((pr) => pr.id));
    const validProspectNumbers = new Set(prospList.map((pr) => pr.prospectNumber).filter(Boolean));
    const validVehicleIds = new Set(vList.map((v) => v.id));
    const validVehicleRegs = new Set(vList.map((v) => v.registration).filter(Boolean));
    const validReservationIds = new Set(resList.map((res) => res.id));
    const validReservationNumbers = new Set(resList.map((res) => res.reservationNumber).filter(Boolean));
    const validMaintenanceIds = new Set(mList.map((m) => m.id));
    const validMaintenanceNumbers = new Set(mList.map((m) => m.referenceNumber).filter(Boolean));
    const validMessageIds = new Set(msgList.map((msg) => msg.id));

    return rawNotifs.filter((notif) => {
      if (!notif || typeof notif !== 'object' || !notif.id) return false;
      // Operational notifications (op_*) are dynamically regenerated
      if (notif.id.startsWith('op_')) return false;

      const fullText = `${notif.title || ''} ${notif.message || ''} ${notif.type || ''}`.toLowerCase();
      const notifCat = (notif.category || '') as string;

      // Discard any residual demo currency or markers
      if (fullText.includes('fcfa')) return false;

      // Check by referenceId if provided
      if (notif.referenceId) {
        const exists =
          validSaleIds.has(notif.referenceId) ||
          validRentalIds.has(notif.referenceId) ||
          validExpenseIds.has(notif.referenceId) ||
          validOtherRevenueIds.has(notif.referenceId) ||
          validPaymentIds.has(notif.referenceId) ||
          validClientIds.has(notif.referenceId) ||
          validProspectIds.has(notif.referenceId) ||
          validVehicleIds.has(notif.referenceId) ||
          validReservationIds.has(notif.referenceId) ||
          validMaintenanceIds.has(notif.referenceId) ||
          validMessageIds.has(notif.referenceId);
        if (!exists) return false;
      }

      // Check by referenceNumber if provided
      if (notif.referenceNumber) {
        const existsNumber =
          validSaleNumbers.has(notif.referenceNumber) ||
          validRentalNumbers.has(notif.referenceNumber) ||
          validPaymentNumbers.has(notif.referenceNumber) ||
          validProspectNumbers.has(notif.referenceNumber) ||
          validVehicleRegs.has(notif.referenceNumber) ||
          validReservationNumbers.has(notif.referenceNumber) ||
          validMaintenanceNumbers.has(notif.referenceNumber);
        if (!existsNumber && !notif.referenceId) return false;
      }

      // Consistency check against zero-item collections
      if ((notif.type === 'sale' || notifCat === 'Ventes' || fullText.includes('vente')) && sList.length === 0) return false;
      if ((notif.type === 'rental' || notifCat === 'Locations' || fullText.includes('location')) && rList.length === 0) return false;
      if ((notifCat === 'Dépenses' || fullText.includes('dépense') || fullText.includes('charge')) && eList.length === 0) return false;
      if ((notifCat === 'Revenus' || fullText.includes('autre revenu') || fullText.includes('revenu')) && oList.length === 0 && sList.length === 0 && rList.length === 0) return false;
      if ((notif.type === 'payment' || notifCat === 'Paiements' || fullText.includes('paiement')) && pList.length === 0) return false;
      if ((notif.type === 'client' || notifCat === 'Clients' || fullText.includes('client')) && cList.length === 0) return false;
      if ((notifCat === 'Prospects' || fullText.includes('prospect')) && prospList.length === 0) return false;
      if ((notifCat === 'Réservations' || fullText.includes('réservation')) && resList.length === 0) return false;
      if ((notifCat === 'Véhicules' || fullText.includes('maintenance')) && mList.length === 0 && vList.length === 0) return false;

      return true;
    });
  };

  const [notifications, setNotifications] = useState<CrmNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
      const parsed = saved ? JSON.parse(saved) : [];
      return sanitizeNotifications(
        parsed,
        vehicles,
        clients,
        sales,
        rentals,
        payments,
        expenses,
        otherRevenues,
        reservations,
        maintenances,
        prospects,
        messages
      );
    } catch {
      return [];
    }
  });

  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_whatsapp_config`);
      return saved ? { ...defaultWhatsAppConfig, ...JSON.parse(saved) } : defaultWhatsAppConfig;
    } catch {
      return defaultWhatsAppConfig;
    }
  });

  const [settings, setSettings] = useState<AgencySettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // AI Assistant State
  const [aiSettings, setAiSettings] = useState<AiSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ai_settings`);
      return saved ? { ...defaultAiSettings, ...JSON.parse(saved) } : defaultAiSettings;
    } catch {
      return defaultAiSettings;
    }
  });

  const [aiConversations, setAiConversations] = useState<AiConversation[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ai_conversations`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load AI conversations', e);
    }
    // Default initial conversation
    return [
      {
        id: `conv_${Date.now()}`,
        title: 'Conversation principale',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg_welcome',
            role: 'assistant',
            content: 'Comment puis-je vous aider ?',
            timestamp: new Date().toISOString(),
            category: 'general',
          },
        ],
      },
    ];
  });

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(() => {
    return aiConversations[0]?.id || null;
  });

  // Persistent storage synchronizers
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_ai_settings`, JSON.stringify(aiSettings));
    } catch (e) {
      console.error('Failed to persist AI settings', e);
    }
  }, [aiSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_ai_conversations`, JSON.stringify(aiConversations));
    } catch (e) {
      console.error('Failed to persist AI conversations', e);
    }
  }, [aiConversations]);
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_vehicles`, JSON.stringify(vehicles));
    } catch (e) {
      console.error('Failed to persist vehicles', e);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_clients`, JSON.stringify(clients));
    } catch (e) {
      console.error('Failed to persist clients', e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_sales`, JSON.stringify(sales));
    } catch (e) {
      console.error('Failed to persist sales', e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_purchases`, JSON.stringify(purchases));
    } catch (e) {
      console.error('Failed to persist purchases', e);
    }
  }, [purchases]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_rentals`, JSON.stringify(rentals));
    } catch (e) {
      console.error('Failed to persist rentals', e);
    }
  }, [rentals]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
    } catch (e) {
      console.error('Failed to persist payments', e);
    }
  }, [payments]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to persist expenses', e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_other_revenues`, JSON.stringify(otherRevenues));
    } catch (e) {
      console.error('Failed to persist other revenues', e);
    }
  }, [otherRevenues]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_reservations`, JSON.stringify(reservations));
    } catch (e) {
      console.error('Failed to persist reservations', e);
    }
  }, [reservations]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_maintenances`, JSON.stringify(maintenances));
    } catch (e) {
      console.error('Failed to persist maintenances', e);
    }
  }, [maintenances]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
    } catch (e) {
      console.error('Failed to persist suppliers', e);
    }
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_prospects`, JSON.stringify(prospects));
    } catch (e) {
      console.error('Failed to persist prospects', e);
    }
  }, [prospects]);

  // Automatic verification of expired reservations
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let hasChanges = false;

    const updated = reservations.map((res) => {
      // If end date is strictly in the past and still marked active
      if (res.endDate < todayStr && (res.status === 'Réservée' || res.status === 'Confirmée')) {
        hasChanges = true;
        // Release vehicle if still reserved
        setVehicles((prevVehs) =>
          prevVehs.map((v) => (v.id === res.vehicleId && v.status === 'Réservé' ? { ...v, status: 'Disponible' } : v))
        );
        return { ...res, status: 'Expirée' as ReservationStatus, updatedAt: new Date().toISOString() };
      }
      return res;
    });

    if (hasChanges) {
      setReservations(updated);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to persist messages', e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_templates`, JSON.stringify(templates));
    } catch (e) {
      console.error('Failed to persist templates', e);
    }
  }, [templates]);

  useEffect(() => {
    try {
      const sanitized = sanitizeNotifications(
        notifications,
        vehicles,
        clients,
        sales,
        rentals,
        payments,
        expenses,
        otherRevenues,
        reservations,
        maintenances,
        prospects,
        messages
      );
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(sanitized));
    } catch (e) {
      console.error('Failed to persist notifications', e);
    }
  }, [
    notifications,
    vehicles,
    clients,
    sales,
    rentals,
    payments,
    expenses,
    otherRevenues,
    reservations,
    maintenances,
    prospects,
    messages,
  ]);

  // Immediate startup sweep to remove any stale or legacy demo notification in localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_notifications`);
      if (raw) {
        const parsed = JSON.parse(raw);
        const cleaned = sanitizeNotifications(
          parsed,
          vehicles,
          clients,
          sales,
          rentals,
          payments,
          expenses,
          otherRevenues,
          reservations,
          maintenances,
          prospects,
          messages
        );
        if (cleaned.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
          localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(cleaned));
          setNotifications(cleaned);
        }
      }
    } catch {
      localStorage.removeItem(`${STORAGE_KEY}_notifications`);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_whatsapp_config`, JSON.stringify(whatsAppConfig));
    } catch (e) {
      console.error('Failed to persist whatsapp config', e);
    }
  }, [whatsAppConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to persist settings', e);
    }
  }, [settings]);

  // Toast Helpers
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Notification Helpers
  const addNotification = (notif: Omit<CrmNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: CrmNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    return newNotif;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markNotificationAsUnread = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast({
      title: 'Notifications lues',
      message: 'Toutes les notifications ont été marquées comme lues.',
      type: 'info',
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearReadNotifications = () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    addToast({
      title: 'Notifications nettoyées',
      message: 'Les notifications lues ont été supprimées.',
      type: 'info',
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    addToast({
      title: 'Notifications vidées',
      message: 'Le centre de notifications a été purgé.',
      type: 'info',
    });
  };

  // Operational Notification Synchronizer — strictly computed from active real CRM events
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const generatedOpNotifs: CrmNotification[] = [];

    // 1. Locations : Retours prévus aujourd'hui & Retards
    rentals.forEach((r) => {
      if (r.status === 'En cours') {
        if (r.endDate === todayStr) {
          generatedOpNotifs.push({
            id: `op_ret_today_${r.id}_${todayStr}`,
            category: 'Locations',
            type: "Retour prévu aujourd'hui",
            title: `Retour prévu aujourd'hui — ${r.rentalNumber}`,
            message: `Restitution attendue du véhicule ${r.vehicleName} (${r.vehicleRegistration}) par ${r.clientName}.`,
            priority: 'Important',
            severity: 'warning',
            timestamp: new Date().toISOString(),
            isRead: false,
            linkTab: 'quick-rental',
            referenceType: 'rental',
            referenceId: r.id,
            referenceNumber: r.rentalNumber,
            actionLabel: 'Clôturer la restitution',
          });
        } else if (r.endDate < todayStr) {
          generatedOpNotifs.push({
            id: `op_ret_late_${r.id}`,
            category: 'Locations',
            type: 'Location en retard',
            title: `Location en retard — ${r.rentalNumber}`,
            message: `Contrat échu le ${new Date(r.endDate).toLocaleDateString('fr-FR')}. Le véhicule ${r.vehicleName} n'a pas encore été restitué (${r.clientName}).`,
            priority: 'Urgent',
            severity: 'error',
            timestamp: new Date().toISOString(),
            isRead: false,
            linkTab: 'quick-rental',
            referenceType: 'rental',
            referenceId: r.id,
            referenceNumber: r.rentalNumber,
            actionLabel: 'Régulariser le retour',
          });
        }
      }
    });

    // 2. Paiements : Paiements en attente & Soldes impayés
    payments.forEach((p) => {
      if (p.status === 'En attente') {
        generatedOpNotifs.push({
          id: `op_pay_pending_${p.id}`,
          category: 'Paiements',
          type: 'Paiement en attente',
          title: `Paiement en attente — ${p.paymentNumber}`,
          message: `Règlement de ${p.amount.toLocaleString('fr-FR')} ${settings.currencySymbol} via ${p.paymentMethod} pour ${p.clientName} (${p.referenceTitle}).`,
          priority: 'Important',
          severity: 'warning',
          timestamp: p.createdAt || new Date().toISOString(),
          isRead: false,
          linkTab: 'payments',
          referenceType: 'payment',
          referenceId: p.id,
          referenceNumber: p.paymentNumber,
          actionLabel: 'Valider le paiement',
        });
      }
    });

    // 3. Prospects : Relances prévues aujourd'hui & Relances en retard
    prospects.forEach((p) => {
      (p.reminders || []).forEach((rem) => {
        if (rem.status === 'À faire') {
          if (rem.date === todayStr) {
            generatedOpNotifs.push({
              id: `op_prosp_today_${p.id}_${rem.id}_${todayStr}`,
              category: 'Prospects',
              type: 'Relance prévue',
              title: `Relance commerciale aujourd'hui — ${p.name}`,
              message: `Motif : ${rem.reason} (${rem.time || '10:00'}) • Tél : ${p.phone || 'Non renseigné'}`,
              priority: 'Important',
              severity: 'warning',
              timestamp: new Date().toISOString(),
              isRead: false,
              linkTab: 'prospects',
              referenceType: 'prospect',
              referenceId: p.id,
              referenceNumber: p.prospectNumber,
              actionLabel: 'Effectuer la relance',
            });
          } else if (rem.date < todayStr) {
            generatedOpNotifs.push({
              id: `op_prosp_late_${p.id}_${rem.id}`,
              category: 'Prospects',
              type: 'Relance en retard',
              title: `Relance prospect en retard — ${p.name}`,
              message: `Échéance dépassée depuis le ${new Date(rem.date).toLocaleDateString('fr-FR')} : ${rem.reason}`,
              priority: 'Urgent',
              severity: 'error',
              timestamp: new Date().toISOString(),
              isRead: false,
              linkTab: 'prospects',
              referenceType: 'prospect',
              referenceId: p.id,
              referenceNumber: p.prospectNumber,
              actionLabel: 'Relancer le prospect',
            });
          }
        }
      });
    });

    // 4. Réservations : Réservation proche (départ aujourd'hui) & Réservation expirée
    reservations.forEach((res) => {
      if (res.status === 'Réservée' || res.status === 'Confirmée') {
        if (res.startDate === todayStr) {
          generatedOpNotifs.push({
            id: `op_res_today_${res.id}_${todayStr}`,
            category: 'Réservations',
            type: 'Réservation proche',
            title: `Réservation à honorer aujourd'hui — ${res.reservationNumber}`,
            message: `Départ prévu aujourd'hui pour ${res.clientName} avec le véhicule ${res.vehicleName}.`,
            priority: 'Important',
            severity: 'warning',
            timestamp: new Date().toISOString(),
            isRead: false,
            linkTab: 'reservations',
            referenceType: 'reservation',
            referenceId: res.id,
            referenceNumber: res.reservationNumber,
            actionLabel: 'Convertir en contrat',
          });
        }
      } else if (res.status === 'Expirée') {
        generatedOpNotifs.push({
          id: `op_res_expired_${res.id}`,
          category: 'Réservations',
          type: 'Réservation expirée',
          title: `Réservation expirée — ${res.reservationNumber}`,
          message: `La réservation de ${res.clientName} (${res.vehicleName}) a expiré.`,
          priority: 'Important',
          severity: 'warning',
          timestamp: res.updatedAt || new Date().toISOString(),
          isRead: false,
          linkTab: 'reservations',
          referenceType: 'reservation',
          referenceId: res.id,
          referenceNumber: res.reservationNumber,
          actionLabel: 'Consulter la réservation',
        });
      }
    });

    // 5. Véhicules & Maintenance
    vehicles.forEach((v) => {
      if (v.status === 'En maintenance') {
        generatedOpNotifs.push({
          id: `op_veh_maint_${v.id}`,
          category: 'Véhicules',
          type: 'Véhicule en maintenance',
          title: `Véhicule immobilisé — ${v.make} ${v.model}`,
          message: `Le véhicule (${v.registration}) est actuellement indisponible pour cause de maintenance.`,
          priority: 'Normal',
          severity: 'info',
          timestamp: new Date().toISOString(),
          isRead: false,
          linkTab: 'maintenance',
          referenceType: 'vehicle',
          referenceId: v.id,
          referenceNumber: v.registration,
          actionLabel: 'Gérer la maintenance',
        });
      }
      if (v.technicalInspectionExpiryDate && v.technicalInspectionExpiryDate < todayStr) {
        generatedOpNotifs.push({
          id: `op_veh_insp_exp_${v.id}`,
          category: 'Véhicules',
          type: 'Maintenance nécessaire',
          title: `Contrôle technique expiré — ${v.make} ${v.model}`,
          message: `La visite technique (${v.registration}) est arrivée à échéance le ${new Date(v.technicalInspectionExpiryDate).toLocaleDateString('fr-FR')}.`,
          priority: 'Urgent',
          severity: 'error',
          timestamp: new Date().toISOString(),
          isRead: false,
          linkTab: 'maintenance',
          referenceType: 'vehicle',
          referenceId: v.id,
          referenceNumber: v.registration,
          actionLabel: 'Planifier le contrôle',
        });
      }
    });

    setNotifications((prev) => {
      const sanitizedNonOpNotifs = sanitizeNotifications(
        prev.filter((n) => !n.id.startsWith('op_')),
        vehicles,
        clients,
        sales,
        rentals,
        payments,
        expenses,
        otherRevenues,
        reservations,
        maintenances,
        prospects,
        messages
      );
      const existingOpMap = new Map<string, CrmNotification>(
        prev.filter((n) => n.id.startsWith('op_')).map((n) => [n.id, n])
      );

      const finalOpNotifs = generatedOpNotifs.map((newOp) => {
        const existing = existingOpMap.get(newOp.id);
        if (existing) {
          return {
            ...newOp,
            isRead: existing.isRead,
            timestamp: existing.timestamp || newOp.timestamp,
          };
        }
        return newOp;
      });

      return [...finalOpNotifs, ...sanitizedNonOpNotifs];
    });
  }, [
    vehicles,
    clients,
    sales,
    rentals,
    payments,
    expenses,
    otherRevenues,
    reservations,
    maintenances,
    prospects,
    messages,
    settings.currencySymbol,
  ]);

  // WhatsApp helper
  const sendWhatsAppMessage = ({
    clientId,
    clientName,
    clientPhone,
    content,
    messageCategory = 'general',
    messageType = 'message_libre',
    referenceType,
    referenceId,
    referenceNumber,
    documentType,
    openUrl = true,
  }: {
    clientId: string;
    clientName: string;
    clientPhone: string;
    content: string;
    messageCategory?: WhatsAppMessage['messageCategory'];
    messageType?: string;
    referenceType?: WhatsAppMessage['referenceType'];
    referenceId?: string;
    referenceNumber?: string;
    documentType?: WhatsAppMessage['documentType'];
    openUrl?: boolean;
  }): WhatsAppMessage => {
    const cleanPhone = (clientPhone || '').replace(/[^0-9+]/g, '');
    let finalPhone = cleanPhone;
    if (finalPhone && !finalPhone.startsWith('+') && whatsAppConfig.defaultCountryCode) {
      const codeWithoutPlus = whatsAppConfig.defaultCountryCode.replace('+', '');
      if (!finalPhone.startsWith(codeWithoutPlus)) {
        finalPhone = `${codeWithoutPlus}${finalPhone.startsWith('0') ? finalPhone.substring(1) : finalPhone}`;
      }
    } else {
      finalPhone = finalPhone.replace('+', '');
    }

    if (openUrl && finalPhone) {
      const encodedMsg = encodeURIComponent(content);
      const url = `https://wa.me/${finalPhone}?text=${encodedMsg}`;
      window.open(url, '_blank');
    }

    const newMsg: WhatsAppMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      clientId,
      clientName,
      clientPhone: clientPhone || finalPhone,
      messageCategory,
      messageType,
      content,
      referenceType,
      referenceId,
      referenceNumber,
      documentType,
      status: 'Envoyé',
      sentBy: 'Sirius Auto CRM',
    };

    setMessages((prev) => [newMsg, ...prev]);

    // Record internal notification
    addNotification({
      type: 'system',
      title: `Message WhatsApp envoyé à ${clientName}`,
      message: `Type: ${messageType} (${referenceNumber || 'Direct'})`,
      severity: 'success',
      linkTab: 'whatsapp-notifications',
    });

    addToast({
      title: 'Message WhatsApp envoyé',
      message: `Communication enregistrée pour ${clientName}.`,
      type: 'success',
    });

    return newMsg;
  };

  const deleteWhatsAppMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setNotifications((prev) => prev.filter((n) => n.referenceId !== id));
    addToast({
      title: 'Message supprimé',
      message: "L'entrée a été retirée de l'historique.",
      type: 'info',
    });
  };

  const resendWhatsAppMessage = (id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (!msg) return;

    const cleanPhone = (msg.clientPhone || '').replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(msg.content);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
      : `https://api.whatsapp.com/send?text=${encodedMsg}`;
    window.open(url, '_blank');

    addToast({
      title: 'Message renvoyé',
      message: `Ouverture de WhatsApp pour ${msg.clientName}.`,
      type: 'success',
    });
  };

  const updateMessageTemplate = (id: string, updated: Partial<MessageTemplate>) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    addToast({
      title: 'Modèle mis à jour',
      message: 'Le template de message a été enregistré.',
      type: 'success',
    });
  };

  const resetMessageTemplates = () => {
    setTemplates(defaultMessageTemplates);
    addToast({
      title: 'Modèles réinitialisés',
      message: 'Tous les templates ont été restaurés avec les textes par défaut.',
      type: 'info',
    });
  };

  const updateWhatsAppSettings = (newConfig: Partial<WhatsAppSettings>) => {
    setWhatsAppConfig((prev) => ({ ...prev, ...newConfig }));
    addToast({
      title: 'Paramètres WhatsApp enregistrés',
      message: 'Vos préférences de messagerie ont été mises à jour.',
      type: 'success',
    });
  };

  // AI Assistant Actions
  const getLiveSmartInsights = (): AiSmartInsight[] => {
    return generateLiveSmartInsights({
      vehicles,
      clients,
      sales,
      rentals,
      payments,
      expenses,
      otherRevenues,
      reservations,
      maintenances,
      suppliers,
      prospects,
      settings,
      aiSettings,
      currentUser,
      hasPermission,
      hasModulePermission,
    });
  };

  const createNewAiConversation = (title?: string): string => {
    const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newConv: AiConversation = {
      id: newId,
      title: title || `Conversation du ${new Date().toLocaleDateString('fr-FR')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: 'Comment puis-je vous aider ?',
          timestamp: new Date().toISOString(),
          category: 'general',
        },
      ],
    };

    setAiConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newId);
    return newId;
  };

  const selectAiConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const deleteAiConversation = (id: string) => {
    setAiConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (currentConversationId === id) {
        setCurrentConversationId(filtered[0]?.id || null);
      }
      return filtered;
    });
    addToast({
      title: 'Conversation supprimée',
      message: "L'échange a été retiré de l'historique.",
      type: 'info',
    });
  };

  const archiveAiConversation = (id: string) => {
    setAiConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: !c.isArchived, updatedAt: new Date().toISOString() } : c))
    );
    addToast({
      title: 'Statut de la conversation mis à jour',
      message: 'L\'archivage a été modifié avec succès.',
      type: 'info',
    });
  };

  const clearAiHistory = () => {
    const freshId = `conv_${Date.now()}`;
    const freshConv: AiConversation = {
      id: freshId,
      title: 'Nouvelle conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg_welcome_fresh',
          role: 'assistant',
          content: "Historique réinitialisé. Comment puis-je vous aider sur vos données CRM ?",
          timestamp: new Date().toISOString(),
          category: 'general',
        },
      ],
    };
    setAiConversations([freshConv]);
    setCurrentConversationId(freshId);
    addToast({
      title: 'Historique IA effacé',
      message: 'Les anciennes conversations ont été purgées.',
      type: 'info',
    });
  };

  const updateAiSettings = (newSettings: Partial<AiSettings>) => {
    setAiSettings((prev) => ({ ...prev, ...newSettings }));
    addToast({
      title: 'Paramètres IA enregistrés',
      message: 'Vos préférences de l\'assistant ont été mises à jour.',
      type: 'success',
    });
  };

  const sendAiMessage = (content: string, targetConvId?: string): AiMessage => {
    let convId = targetConvId || currentConversationId;
    if (!convId || !aiConversations.some((c) => c.id === convId)) {
      convId = createNewAiConversation(content.length > 30 ? content.substring(0, 30) + '...' : content);
    }

    const userMessage: AiMessage = {
      id: `msg_user_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const initialAiMsgId = `msg_ai_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

    // Evaluate live query deterministically against live CRM snapshot
    const localFallbackResponse = processAiQuery(content, {
      vehicles,
      clients,
      sales,
      rentals,
      payments,
      expenses,
      otherRevenues,
      reservations,
      maintenances,
      suppliers,
      prospects,
      settings,
      aiSettings,
      currentUser,
      hasPermission,
      hasModulePermission,
    });

    const assistantMessage: AiMessage = {
      id: initialAiMsgId,
      ...localFallbackResponse,
      timestamp: new Date().toISOString(),
    };

    setAiConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === convId) {
          // If title was default, name it intelligently after user query
          const updatedTitle =
            conv.messages.length <= 1
              ? content.length > 35
                ? content.substring(0, 35) + '...'
                : content
              : conv.title;

          return {
            ...conv,
            title: updatedTitle,
            updatedAt: new Date().toISOString(),
            messages: [...conv.messages, userMessage, assistantMessage],
          };
        }
        return conv;
      })
    );

    // Call server endpoint in background to enrich response if server-side AI model is configured
    (async () => {
      try {
        const conversation = aiConversations.find((c) => c.id === convId);
        const history = (conversation?.messages || []).slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch('/api/ai/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: content,
            conversationHistory: history,
            crmData: {
              currentUser,
              settings,
              aiSettings,
              vehicles,
              clients,
              sales,
              rentals,
              payments,
              expenses,
              otherRevenues,
              reservations,
              maintenances,
              suppliers,
              prospects,
            },
          }),
        });

        if (res.ok) {
          const serverData = await res.json();
          if (serverData && !serverData.fallback && serverData.content) {
            setAiConversations((prev) =>
              prev.map((conv) => {
                if (conv.id === convId) {
                  return {
                    ...conv,
                    updatedAt: new Date().toISOString(),
                    messages: conv.messages.map((m) =>
                      m.id === initialAiMsgId
                        ? {
                            ...m,
                            content: serverData.content,
                            category: serverData.category || m.category,
                            statsCards: serverData.statsCards || m.statsCards,
                            tableData: serverData.tableData || m.tableData,
                            actionLinks: serverData.actionLinks || m.actionLinks,
                          }
                        : m
                    ),
                  };
                }
                return conv;
              })
            );
          }
        }
      } catch (err) {
        // Fallback already in place, silent catch
      }
    })();

    return assistantMessage;
  };

  // Purchases Actions
  const createPurchase = async (purchaseData: Partial<Purchase>): Promise<void> => {
    const timestamp = new Date();
    const purchasePrice = Number(purchaseData.purchasePrice) || 0;
    const customsFee = Number(purchaseData.customsFee) || 0;
    const shippingFee = Number(purchaseData.shippingFee) || 0;
    const transportFee = Number(purchaseData.transportFee) || 0;
    const preparationFee = Number(purchaseData.preparationFee) || 0;
    const otherCharges = Number(purchaseData.otherCharges) || 0;
    const purchase: Purchase = {
      id: `purchase_${timestamp.getTime()}_${Math.random().toString(36).slice(2, 7)}`,
      purchaseNumber: purchaseData.purchaseNumber?.trim() || `ACH-${timestamp.getFullYear()}-${String(timestamp.getTime()).slice(-4)}`,
      date: purchaseData.date || timestamp.toISOString().slice(0, 10),
      vehicleId: purchaseData.vehicleId,
      vehicleInfo: purchaseData.vehicleInfo?.trim() || '',
      supplierName: purchaseData.supplierName?.trim() || '',
      invoiceNumber: purchaseData.invoiceNumber?.trim() || undefined,
      purchasePrice,
      customsFee,
      shippingFee,
      transportFee,
      preparationFee,
      otherCharges,
      totalCost: Number(purchaseData.totalCost) || purchasePrice + customsFee + shippingFee + transportFee + preparationFee + otherCharges,
      status: purchaseData.status || 'Arrivé / En parc',
      paymentStatus: purchaseData.paymentStatus || 'En attente',
      amountPaid: Number(purchaseData.amountPaid) || 0,
      notes: purchaseData.notes?.trim() || undefined,
      createdAt: timestamp.toISOString(),
    };

    setPurchases((previous) => [purchase, ...previous]);
    addToast({
      title: 'Achat enregistré',
      message: `${purchase.purchaseNumber} a été ajouté aux approvisionnements.`,
      type: 'success',
    });
  };

  const updatePurchase = async (id: string, purchaseData: Partial<Purchase>): Promise<void> => {
    setPurchases((previous) => previous.map((purchase) =>
      purchase.id === id ? { ...purchase, ...purchaseData } : purchase
    ));
    addToast({
      title: 'Achat mis à jour',
      message: 'Les modifications ont été enregistrées avec succès.',
      type: 'info',
    });
  };

  const deletePurchase = async (id: string): Promise<void> => {
    setPurchases((previous) => previous.filter((purchase) => purchase.id !== id));
    addToast({
      title: 'Achat supprimé',
      message: 'L’approvisionnement a été supprimé.',
      type: 'info',
    });
  };

  // Vehicles Actions
  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'createdAt'>): Vehicle => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: 'veh_' + Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    addToast({
      title: 'Véhicule enregistré',
      message: `${newVehicle.make} ${newVehicle.model} (${newVehicle.registration}) ajouté à la flotte.`,
      type: 'success',
    });
    return newVehicle;
  };

  const updateVehicle = (id: string, data: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...data } : v))
    );
    addToast({
      title: 'Véhicule mis à jour',
      message: 'Les modifications ont été enregistrées avec succès.',
      type: 'info',
    });
  };

  const deleteVehicle = (id: string) => {
    const vehicle = vehicles.find((v) => v.id === id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    setNotifications((prev) => prev.filter((n) => n.referenceId !== id && (!vehicle?.registration || n.referenceNumber !== vehicle.registration)));
    addToast({
      title: 'Véhicule supprimé',
      message: vehicle ? `${vehicle.make} ${vehicle.model} a été retiré.` : 'Véhicule supprimé.',
      type: 'info',
    });
  };

  // Clients Actions
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      status: clientData.status || 'Actif',
      whatsapp: clientData.whatsapp || clientData.phone,
      id: 'cli_' + Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [newClient, ...prev]);
    const name = newClient.type === 'entreprise' && newClient.companyName 
      ? newClient.companyName 
      : `${newClient.firstName} ${newClient.lastName}`;

    // Internal notification
    addNotification({
      type: 'client',
      title: 'Nouveau client enregistré',
      message: `${name} (${newClient.phone || 'Sans tél.'})`,
      severity: 'info',
      linkTab: 'clients',
      referenceId: newClient.id,
    });

    addToast({
      title: 'Client enregistré',
      message: `Fiche de ${name} créée avec succès.`,
      type: 'success',
    });
    return newClient;
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    addToast({
      title: 'Client mis à jour',
      message: 'Informations du client mises à jour.',
      type: 'info',
    });
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setNotifications((prev) => prev.filter((n) => n.referenceId !== id));
    addToast({
      title: 'Client supprimé',
      type: 'info',
    });
  };

  // Reservations Actions
  const addReservation = ({
    vehicleId,
    clientId,
    startDate,
    endDate,
    depositAmount = 0,
    depositPaymentMethod,
    notes,
    status = 'Réservée',
  }: {
    vehicleId: string;
    clientId: string;
    startDate: string;
    endDate: string;
    depositAmount?: number;
    depositPaymentMethod?: PaymentMethod | string;
    notes?: string;
    status?: ReservationStatus;
  }): Reservation | null => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const client = clients.find((c) => c.id === clientId);

    if (!vehicle || !client) {
      addToast({
        title: 'Erreur de réservation',
        message: 'Véhicule ou client introuvable.',
        type: 'error',
      });
      return null;
    }

    const clientDisplayName =
      client.type === 'entreprise' && client.companyName
        ? client.companyName
        : `${client.firstName} ${client.lastName}`;

    const count = reservations.length + 1;
    const reservationNumber = `RES-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newReservation: Reservation = {
      id: 'res_' + Date.now().toString(),
      reservationNumber,
      date: new Date().toISOString().split('T')[0],
      clientId,
      clientName: clientDisplayName,
      clientPhone: client.phone,
      clientEmail: client.email,
      vehicleId,
      vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
      vehicleRegistration: vehicle.registration,
      startDate,
      endDate,
      depositAmount: Number(depositAmount) || 0,
      depositPaymentMethod,
      notes,
      status,
      createdAt: new Date().toISOString(),
    };

    // Auto-lock vehicle status to 'Réservé'
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, status: 'Réservé' } : v))
    );

    // If a deposit is paid, register a payment record
    if (depositAmount > 0 && depositPaymentMethod) {
      const payCount = payments.length + 1;
      const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payCount).padStart(4, '0')}`;
      const newPayment: Payment = {
        id: 'pay_' + Date.now().toString(),
        paymentNumber,
        referenceType: 'reservation',
        referenceId: newReservation.id,
        referenceTitle: `Acompte Réservation ${reservationNumber} — ${newReservation.vehicleName}`,
        clientId: client.id,
        clientName: clientDisplayName,
        amount: Number(depositAmount),
        paymentDate: newReservation.date,
        paymentMethod: depositPaymentMethod as PaymentMethod,
        status: 'Validé',
        notes: `Acompte reçu pour la réservation ${reservationNumber}`,
        createdAt: new Date().toISOString(),
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    setReservations((prev) => [newReservation, ...prev]);

    // System notification
    addNotification({
      category: 'Réservations',
      type: 'Nouvelle réservation',
      title: `Nouvelle réservation ${reservationNumber}`,
      message: `${newReservation.vehicleName} réservé pour ${clientDisplayName} du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`,
      priority: 'Normal',
      severity: 'info',
      linkTab: 'reservations',
      referenceType: 'reservation',
      referenceId: newReservation.id,
      referenceNumber: reservationNumber,
      actionLabel: 'Voir la réservation',
    });

    addToast({
      title: 'Véhicule réservé avec succès',
      message: `Réservation ${reservationNumber} enregistrée. Le véhicule est désormais bloqué.`,
      type: 'success',
    });

    return newReservation;
  };

  const updateReservation = (id: string, data: Partial<Reservation>) => {
    const existing = reservations.find((r) => r.id === id);
    if (!existing) return;

    // Handle vehicle change
    if (data.vehicleId && data.vehicleId !== existing.vehicleId) {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === existing.vehicleId && v.status === 'Réservé') {
            return { ...v, status: 'Disponible' };
          }
          if (v.id === data.vehicleId) {
            return { ...v, status: 'Réservé' };
          }
          return v;
        })
      );
    }

    // Handle status change
    if (data.status && data.status !== existing.status) {
      if (data.status === 'Annulée' || data.status === 'Expirée') {
        const vId = data.vehicleId || existing.vehicleId;
        setVehicles((prev) =>
          prev.map((v) => (v.id === vId && v.status === 'Réservé' ? { ...v, status: 'Disponible' } : v))
        );
      } else if (data.status === 'Réservée' || data.status === 'Confirmée') {
        const vId = data.vehicleId || existing.vehicleId;
        setVehicles((prev) =>
          prev.map((v) => (v.id === vId ? { ...v, status: 'Réservé' } : v))
        );
      }
    }

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r))
    );

    addToast({
      title: 'Réservation mise à jour',
      message: 'Les modifications de la réservation ont été enregistrées.',
      type: 'info',
    });
  };

  const cancelReservation = (id: string, reason?: string) => {
    const target = reservations.find((r) => r.id === id);
    if (!target) return;

    // Free up vehicle
    setVehicles((prev) =>
      prev.map((v) => (v.id === target.vehicleId && v.status === 'Réservé' ? { ...v, status: 'Disponible' } : v))
    );

    setReservations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Annulée',
              notes: reason ? `${r.notes ? r.notes + ' | ' : ''}Annulée: ${reason}` : r.notes,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    addNotification({
      category: 'Réservations',
      type: 'Réservation annulée',
      title: `Réservation annulée ${target.reservationNumber}`,
      message: `La réservation pour ${target.clientName} a été annulée. Le véhicule ${target.vehicleName} est de nouveau disponible.`,
      priority: 'Normal',
      severity: 'info',
      linkTab: 'reservations',
      referenceType: 'reservation',
      referenceId: target.id,
      referenceNumber: target.reservationNumber,
      actionLabel: 'Voir la réservation',
    });

    addToast({
      title: 'Réservation annulée',
      message: `La réservation ${target.reservationNumber} a été annulée. Le véhicule est disponible.`,
      type: 'warning',
    });
  };

  const deleteReservation = (id: string) => {
    const target = reservations.find((r) => r.id === id);
    if (target) {
      if (target.status === 'Réservée' || target.status === 'Confirmée') {
        setVehicles((prev) =>
          prev.map((v) => (v.id === target.vehicleId && v.status === 'Réservé' ? { ...v, status: 'Disponible' } : v))
        );
      }
    }

    setReservations((prev) => prev.filter((r) => r.id !== id));
    setNotifications((prev) => prev.filter((n) => n.referenceId !== id && (!target?.reservationNumber || n.referenceNumber !== target.reservationNumber)));
    addToast({
      title: 'Réservation supprimée',
      type: 'info',
    });
  };

  const convertReservationToRental = (
    id: string,
    extraData?: {
      dailyRate?: number;
      depositAmount?: number;
      mileageDeparture?: number;
      paymentMethod?: PaymentMethod | string;
      amountPaid?: number;
      notes?: string;
    }
  ): Rental | null => {
    const reservation = reservations.find((r) => r.id === id);
    if (!reservation) {
      addToast({
        title: 'Erreur',
        message: 'Réservation introuvable.',
        type: 'error',
      });
      return null;
    }

    const vehicle = vehicles.find((v) => v.id === reservation.vehicleId);
    const client = clients.find((c) => c.id === reservation.clientId);

    if (!vehicle || !client) {
      addToast({
        title: 'Erreur de conversion',
        message: 'Véhicule ou client introuvable.',
        type: 'error',
      });
      return null;
    }

    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const dailyRate = extraData?.dailyRate || vehicle.dailyRate || 50;
    const totalAmount = durationDays * dailyRate;
    const depositAmount = extraData?.depositAmount !== undefined ? extraData.depositAmount : (reservation.depositAmount || vehicle.securityDeposit || 500);
    const amountPaid = extraData?.amountPaid !== undefined ? extraData.amountPaid : (reservation.depositAmount || 0);
    const paymentMethod = (extraData?.paymentMethod || reservation.depositPaymentMethod || 'Espèces') as PaymentMethod;

    const count = rentals.length + 1;
    const rentalNumber = `LOC-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const clientDisplayName =
      client.type === 'entreprise' && client.companyName
        ? client.companyName
        : `${client.firstName} ${client.lastName}`;

    const balanceDue = Math.max(0, totalAmount - amountPaid);
    const paymentStatus = amountPaid >= totalAmount ? 'Payé' : amountPaid > 0 ? 'Partiellement payé' : 'En attente';

    const newRental: Rental = {
      id: 'rec_' + Date.now().toString(),
      rentalNumber,
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.make} ${vehicle.model}`,
      vehicleRegistration: vehicle.registration,
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      clientId: client.id,
      clientName: clientDisplayName,
      clientPhone: client.phone,
      clientDrivingLicense: client.drivingLicenseNumber,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      durationDays,
      dailyRate,
      totalAmount,
      depositAmount,
      depositReturned: false,
      mileageDeparture: extraData?.mileageDeparture || vehicle.mileage || 0,
      status: 'En cours',
      paymentStatus,
      amountPaid,
      balanceDue,
      paymentMethod,
      notes: extraData?.notes || reservation.notes ? `Réservation ${reservation.reservationNumber}. ${extraData?.notes || reservation.notes || ''}` : `Issu de la réservation ${reservation.reservationNumber}`,
      createdAt: new Date().toISOString(),
    };

    // Update vehicle to 'Loué'
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicle.id ? { ...v, status: 'Loué' } : v))
    );

    // Update reservation to 'Convertie en location'
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Convertie en location',
              convertedToType: 'location',
              convertedId: newRental.id,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    setRentals((prev) => [newRental, ...prev]);

    // If payment/acompte is recorded, create payment entry
    if (amountPaid > 0) {
      const payCount = payments.length + 1;
      const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payCount).padStart(4, '0')}`;
      const newPayment: Payment = {
        id: 'pay_' + Date.now().toString(),
        paymentNumber,
        referenceType: 'rental',
        referenceId: newRental.id,
        referenceTitle: `Location ${rentalNumber} — ${newRental.vehicleName}`,
        clientId: client.id,
        clientName: clientDisplayName,
        amount: amountPaid,
        paymentDate: reservation.startDate || new Date().toISOString().split('T')[0],
        paymentMethod,
        status: 'Validé',
        notes: `Règlement/acompte lié à la réservation ${reservation.reservationNumber}`,
        createdAt: new Date().toISOString(),
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    addNotification({
      type: 'rental',
      title: 'Réservation convertie en location',
      message: `${reservation.reservationNumber} → ${rentalNumber} (${newRental.vehicleName})`,
      severity: 'success',
      linkTab: 'quick-rental',
      referenceId: newRental.id,
    });

    addToast({
      title: 'Réservation convertie en location',
      message: `Contrat ${rentalNumber} généré avec succès. Le véhicule est marqué Loué.`,
      type: 'success',
    });

    return newRental;
  };

  const convertReservationToSale = (
    id: string,
    extraData?: {
      salePrice?: number;
      taxRate?: number;
      paymentMethod?: PaymentMethod | string;
      amountPaid?: number;
      notes?: string;
    }
  ): Sale | null => {
    const reservation = reservations.find((r) => r.id === id);
    if (!reservation) {
      addToast({
        title: 'Erreur',
        message: 'Réservation introuvable.',
        type: 'error',
      });
      return null;
    }

    const vehicle = vehicles.find((v) => v.id === reservation.vehicleId);
    const client = clients.find((c) => c.id === reservation.clientId);

    if (!vehicle || !client) {
      addToast({
        title: 'Erreur de conversion',
        message: 'Véhicule ou client introuvable.',
        type: 'error',
      });
      return null;
    }

    const salePrice = extraData?.salePrice || vehicle.sellingPrice || 10000;
    const taxRate = extraData?.taxRate !== undefined ? extraData.taxRate : (settings.taxEnabled ? settings.defaultVatRate : 0);
    const taxAmount = (salePrice * taxRate) / 100;
    const totalAmount = salePrice + taxAmount;
    const amountPaid = extraData?.amountPaid !== undefined ? extraData.amountPaid : (reservation.depositAmount || 0);
    const paymentMethod = (extraData?.paymentMethod || reservation.depositPaymentMethod || 'Virement bancaire') as PaymentMethod;

    const count = sales.length + 1;
    const saleNumber = `VNT-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const clientDisplayName =
      client.type === 'entreprise' && client.companyName
        ? client.companyName
        : `${client.firstName} ${client.lastName}`;

    const balanceDue = Math.max(0, totalAmount - amountPaid);
    const paymentStatus = amountPaid >= totalAmount ? 'Payé' : amountPaid > 0 ? 'Partiellement payé' : 'En attente';

    const newSale: Sale = {
      id: 'sal_' + Date.now().toString(),
      saleNumber,
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
      vehicleRegistration: vehicle.registration,
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      clientId: client.id,
      clientName: clientDisplayName,
      clientPhone: client.phone,
      saleDate: new Date().toISOString().split('T')[0],
      salePrice,
      taxRate,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentStatus,
      status: paymentStatus === 'Payé' ? 'Payé' : 'Partiellement payé',
      amountPaid,
      balanceDue,
      notes: extraData?.notes || reservation.notes ? `Réservation ${reservation.reservationNumber}. ${extraData?.notes || reservation.notes || ''}` : `Issu de la réservation ${reservation.reservationNumber}`,
      createdAt: new Date().toISOString(),
    };

    // Update vehicle to 'Vendu'
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicle.id ? { ...v, status: 'Vendu' } : v))
    );

    // Update reservation to 'Convertie en vente'
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Convertie en vente',
              convertedToType: 'vente',
              convertedId: newSale.id,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    setSales((prev) => [newSale, ...prev]);

    // If payment/acompte is recorded, create payment entry
    if (amountPaid > 0) {
      const payCount = payments.length + 1;
      const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payCount).padStart(4, '0')}`;
      const newPayment: Payment = {
        id: 'pay_' + Date.now().toString(),
        paymentNumber,
        referenceType: 'sale',
        referenceId: newSale.id,
        referenceTitle: `Vente ${saleNumber} — ${newSale.vehicleName}`,
        clientId: client.id,
        clientName: clientDisplayName,
        amount: amountPaid,
        paymentDate: newSale.saleDate,
        paymentMethod,
        status: 'Validé',
        notes: `Acompte/Règlement issu de la réservation ${reservation.reservationNumber}`,
        createdAt: new Date().toISOString(),
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    addNotification({
      type: 'sale',
      title: 'Réservation convertie en vente',
      message: `${reservation.reservationNumber} → ${saleNumber} (${newSale.vehicleName})`,
      severity: 'success',
      linkTab: 'quick-sale',
      referenceId: newSale.id,
    });

    addToast({
      title: 'Réservation convertie en vente',
      message: `Vente ${saleNumber} générée avec succès. Le véhicule est marqué Vendu.`,
      type: 'success',
    });

    return newSale;
  };

  // ----------------------------------------------------
  // MAINTENANCE & ENTRETIEN DES VÉHICULES
  // ----------------------------------------------------

  const addMaintenance = (maintenanceData: {
    vehicleId: string;
    date: string;
    dueDate?: string;
    type: MaintenanceType;
    description: string;
    supplierId?: string;
    supplier: string;
    supplierPhone?: string;
    amount: number;
    status?: MaintenanceStatus;
    mileageAtIntervention?: number;
    nextScheduledDate?: string;
    nextScheduledMileage?: number;
    documents?: MaintenanceDocument[];
    invoiceUrl?: string;
    quoteUrl?: string;
    photos?: string[];
    notes?: string;
    autoSetVehicleMaintenance?: boolean;
    autoRecordExpense?: boolean;
    paymentMethod?: PaymentMethod | string;
  }): MaintenanceIntervention | null => {
    const vehicle = vehicles.find((v) => v.id === maintenanceData.vehicleId);
    if (!vehicle) {
      addToast({
        title: 'Erreur',
        message: 'Véhicule sélectionné introuvable.',
        type: 'error',
      });
      return null;
    }

    const count = maintenances.length + 1;
    const year = new Date().getFullYear();
    const referenceNumber = `MAINT-${year}-${String(count).padStart(4, '0')}`;
    const vehicleName = `${vehicle.make} ${vehicle.model} (${vehicle.year || ''})`.trim();
    const status: MaintenanceStatus = maintenanceData.status || 'En cours';
    const amount = Number(maintenanceData.amount) || 0;

    let linkedExpenseId: string | undefined = undefined;

    // Auto-record in Expense module (Comptabilité)
    if (maintenanceData.autoRecordExpense !== false && amount > 0) {
      const expCount = expenses.length + 1;
      const expenseNumber = `EXP-${year}-${String(expCount).padStart(4, '0')}`;

      let expCategory: ExpenseCategory = 'Entretien';
      if (maintenanceData.type === 'Assurance') {
        expCategory = 'Assurance';
      } else if (
        maintenanceData.type === 'Réparation moteur' ||
        maintenanceData.type === 'Réparation carrosserie'
      ) {
        expCategory = 'Réparation';
      } else {
        expCategory = 'Entretien';
      }

      const newExpense: Expense = {
        id: 'exp_' + Date.now().toString(),
        expenseNumber,
        date: maintenanceData.date,
        category: expCategory,
        amount,
        description: `Maintenance ${referenceNumber} [${maintenanceData.type}] — ${vehicleName} (${vehicle.registration}) : ${maintenanceData.description}`,
        paymentMethod: (maintenanceData.paymentMethod as PaymentMethod) || 'Virement',
        supplierId: maintenanceData.supplierId,
        supplier: maintenanceData.supplier,
        beneficiary: maintenanceData.supplier,
        vehicleId: vehicle.id,
        vehicleInfo: `${vehicle.make} ${vehicle.model} - ${vehicle.registration}`,
        notes: `Généré automatiquement par le module Maintenance (${referenceNumber})`,
        createdAt: new Date().toISOString(),
      };

      setExpenses((prev) => [newExpense, ...prev]);
      linkedExpenseId = newExpense.id;
    }

    const newIntervention: MaintenanceIntervention = {
      id: 'maint_' + Date.now().toString(),
      referenceNumber,
      date: maintenanceData.date,
      dueDate: maintenanceData.dueDate,
      vehicleId: vehicle.id,
      vehicleName,
      vehicleRegistration: vehicle.registration,
      type: maintenanceData.type,
      description: maintenanceData.description,
      supplierId: maintenanceData.supplierId,
      supplier: maintenanceData.supplier,
      supplierPhone: maintenanceData.supplierPhone,
      amount,
      status,
      mileageAtIntervention: maintenanceData.mileageAtIntervention || vehicle.mileage,
      nextScheduledDate: maintenanceData.nextScheduledDate,
      nextScheduledMileage: maintenanceData.nextScheduledMileage,
      documents: maintenanceData.documents || [],
      invoiceUrl: maintenanceData.invoiceUrl,
      quoteUrl: maintenanceData.quoteUrl,
      photos: maintenanceData.photos || [],
      notes: maintenanceData.notes,
      expenseId: linkedExpenseId,
      createdAt: new Date().toISOString(),
    };

    // Update vehicle status to 'En maintenance' if requested or if status is 'En cours'
    const shouldImmobilize =
      maintenanceData.autoSetVehicleMaintenance === true ||
      (status === 'En cours' && maintenanceData.autoSetVehicleMaintenance !== false);

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== vehicle.id) return v;
        const updates: Partial<Vehicle> = {};
        if (shouldImmobilize) {
          updates.status = 'En maintenance';
        }
        if (
          maintenanceData.mileageAtIntervention &&
          maintenanceData.mileageAtIntervention > v.mileage
        ) {
          updates.mileage = maintenanceData.mileageAtIntervention;
        }
        if (maintenanceData.nextScheduledDate) {
          updates.nextMaintenanceDate = maintenanceData.nextScheduledDate;
          if (maintenanceData.type === 'Visite technique') {
            updates.technicalInspectionExpiryDate = maintenanceData.nextScheduledDate;
          }
          if (maintenanceData.type === 'Assurance') {
            updates.insuranceExpiryDate = maintenanceData.nextScheduledDate;
          }
        }
        return { ...v, ...updates };
      })
    );

    setMaintenances((prev) => [newIntervention, ...prev]);

    addNotification({
      category: 'Véhicules',
      type: 'Véhicule en maintenance',
      title: `Intervention enregistrée ${referenceNumber}`,
      message: `${maintenanceData.type} sur ${vehicleName} (${vehicle.registration})${newIntervention.supplier ? ` • Fournisseur : ${newIntervention.supplier}` : ''}`,
      priority: shouldImmobilize ? 'Important' : 'Normal',
      severity: 'info',
      linkTab: 'maintenance',
      referenceType: 'maintenance',
      referenceId: newIntervention.id,
      referenceNumber,
      actionLabel: "Voir l'intervention",
    });

    addToast({
      title: 'Intervention enregistrée',
      message: `${referenceNumber} créé avec succès.${
        shouldImmobilize ? ' Véhicule placé en maintenance.' : ''
      }`,
      type: 'success',
    });

    return newIntervention;
  };

  const updateMaintenance = (id: string, data: Partial<MaintenanceIntervention>) => {
    const existing = maintenances.find((m) => m.id === id);
    if (!existing) return;

    // If status changed to 'Terminée'
    if (data.status === 'Terminée' && existing.status !== 'Terminée') {
      completeMaintenance(id, { actualDate: data.date });
      return;
    }

    // If status changed to 'Annulée'
    if (data.status === 'Annulée' && existing.status !== 'Annulée') {
      cancelMaintenance(id);
      return;
    }

    setMaintenances((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m))
    );

    addToast({
      title: 'Intervention mise à jour',
      message: `L'intervention ${existing.referenceNumber} a été modifiée.`,
      type: 'info',
    });
  };

  const completeMaintenance = (
    id: string,
    completionData?: {
      actualDate?: string;
      notes?: string;
      autoRevertVehicleAvailable?: boolean;
    }
  ) => {
    const target = maintenances.find((m) => m.id === id);
    if (!target) return;

    const completedAtDate = completionData?.actualDate || new Date().toISOString().split('T')[0];

    // Check if other active interventions exist on this vehicle
    const otherActive = maintenances.filter(
      (m) => m.id !== id && m.vehicleId === target.vehicleId && m.status === 'En cours'
    );

    const shouldRevertToAvailable =
      completionData?.autoRevertVehicleAvailable !== false && otherActive.length === 0;

    // Update vehicle
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== target.vehicleId) return v;
        const updates: Partial<Vehicle> = {
          lastMaintenanceDate: completedAtDate,
        };
        if (shouldRevertToAvailable && v.status === 'En maintenance') {
          updates.status = 'Disponible';
        }
        if (target.nextScheduledDate) {
          updates.nextMaintenanceDate = target.nextScheduledDate;
          if (target.type === 'Visite technique') {
            updates.technicalInspectionExpiryDate = target.nextScheduledDate;
          }
          if (target.type === 'Assurance') {
            updates.insuranceExpiryDate = target.nextScheduledDate;
          }
        }
        return { ...v, ...updates };
      })
    );

    setMaintenances((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: 'Terminée',
              completedAt: new Date().toISOString(),
              notes: completionData?.notes
                ? `${m.notes ? m.notes + ' | ' : ''}${completionData.notes}`
                : m.notes,
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );

    addNotification({
      category: 'Véhicules',
      type: shouldRevertToAvailable ? 'Véhicule disponible' : 'Maintenance terminée',
      title: `Maintenance terminée — ${target.referenceNumber}`,
      message: `Intervention ${target.type} sur ${target.vehicleName} clôturée.${
        shouldRevertToAvailable
          ? ` Le véhicule est de nouveau disponible dans le parc.`
          : ''
      }`,
      priority: 'Normal',
      severity: 'success',
      linkTab: 'maintenance',
      referenceType: 'maintenance',
      referenceId: target.id,
      referenceNumber: target.referenceNumber,
      actionLabel: "Voir l'intervention",
    });

    addToast({
      title: 'Intervention clôturée',
      message: `L'intervention ${target.referenceNumber} est marquée comme terminée.${
        shouldRevertToAvailable ? ' Le véhicule est de nouveau disponible.' : ''
      }`,
      type: 'success',
    });
  };

  const cancelMaintenance = (id: string, reason?: string) => {
    const target = maintenances.find((m) => m.id === id);
    if (!target) return;

    // Check if other active interventions exist
    const otherActive = maintenances.filter(
      (m) => m.id !== id && m.vehicleId === target.vehicleId && m.status === 'En cours'
    );

    if (otherActive.length === 0) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === target.vehicleId && v.status === 'En maintenance'
            ? { ...v, status: 'Disponible' }
            : v
        )
      );
    }

    setMaintenances((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: 'Annulée',
              notes: reason ? `${m.notes ? m.notes + ' | ' : ''}Annulée: ${reason}` : m.notes,
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );

    addToast({
      title: 'Intervention annulée',
      message: `L'intervention ${target.referenceNumber} a été annulée.`,
      type: 'warning',
    });
  };

  const deleteMaintenance = (id: string) => {
    const target = maintenances.find((m) => m.id === id);
    if (target) {
      const otherActive = maintenances.filter(
        (m) => m.id !== id && m.vehicleId === target.vehicleId && m.status === 'En cours'
      );
      if (otherActive.length === 0) {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === target.vehicleId && v.status === 'En maintenance'
              ? { ...v, status: 'Disponible' }
              : v
          )
        );
      }
    }

    setMaintenances((prev) => prev.filter((m) => m.id !== id));
    setNotifications((prev) => prev.filter((n) => n.referenceId !== id && (!target?.referenceNumber || n.referenceNumber !== target.referenceNumber)));

    addToast({
      title: 'Intervention supprimée',
      type: 'info',
    });
  };

  const getMaintenanceCostByVehicle = (vehicleId: string) => {
    const vehicleMaints = maintenances.filter(
      (m) => m.vehicleId === vehicleId && m.status !== 'Annulée'
    );
    const totalCost = vehicleMaints.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
    const lastMaint = [...vehicleMaints].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    return {
      totalCost,
      interventionCount: vehicleMaints.length,
      lastDate: lastMaint?.date,
    };
  };

  const getMaintenanceAlerts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alerts: {
      id: string;
      type: 'insurance_expiry' | 'inspection_expiry' | 'maintenance_scheduled' | 'vehicle_immobilized';
      severity: 'error' | 'warning' | 'info';
      title: string;
      message: string;
      vehicleId?: string;
      vehicleName?: string;
      dueDate?: string;
      daysRemaining?: number;
    }[] = [];

    // 1. Véhicules immobilisés en maintenance
    vehicles.forEach((v) => {
      if (v.status === 'En maintenance') {
        const activeMaint = maintenances.find(
          (m) => m.vehicleId === v.id && m.status === 'En cours'
        );
        alerts.push({
          id: `alert_immob_${v.id}`,
          type: 'vehicle_immobilized',
          severity: 'warning',
          title: `Véhicule immobilisé en maintenance`,
          message: `${v.make} ${v.model} (${v.registration}) est actuellement en atelier${
            activeMaint ? ` (${activeMaint.type} — ${activeMaint.supplier})` : ''
          }.`,
          vehicleId: v.id,
          vehicleName: `${v.make} ${v.model}`,
          dueDate: activeMaint?.dueDate || activeMaint?.date,
        });
      }
    });

    // 2. Alertes Assurance
    vehicles.forEach((v) => {
      if (v.insuranceExpiryDate) {
        const expDate = new Date(v.insuranceExpiryDate);
        expDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil(
          (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays < 0) {
          alerts.push({
            id: `alert_ins_exp_${v.id}`,
            type: 'insurance_expiry',
            severity: 'error',
            title: `Assurance expirée`,
            message: `L'assurance du véhicule ${v.make} ${v.model} (${v.registration}) a expiré le ${new Date(
              v.insuranceExpiryDate
            ).toLocaleDateString('fr-FR')}.`,
            vehicleId: v.id,
            vehicleName: `${v.make} ${v.model}`,
            dueDate: v.insuranceExpiryDate,
            daysRemaining: diffDays,
          });
        } else if (diffDays <= 30) {
          alerts.push({
            id: `alert_ins_soon_${v.id}`,
            type: 'insurance_expiry',
            severity: diffDays <= 7 ? 'error' : 'warning',
            title: `Assurance à renouveler sous ${diffDays} jour(s)`,
            message: `L'assurance de ${v.make} ${v.model} (${v.registration}) expire le ${new Date(
              v.insuranceExpiryDate
            ).toLocaleDateString('fr-FR')}.`,
            vehicleId: v.id,
            vehicleName: `${v.make} ${v.model}`,
            dueDate: v.insuranceExpiryDate,
            daysRemaining: diffDays,
          });
        }
      }
    });

    // 3. Alertes Visite technique
    vehicles.forEach((v) => {
      if (v.technicalInspectionExpiryDate) {
        const expDate = new Date(v.technicalInspectionExpiryDate);
        expDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil(
          (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays < 0) {
          alerts.push({
            id: `alert_insp_exp_${v.id}`,
            type: 'inspection_expiry',
            severity: 'error',
            title: `Visite technique expirée`,
            message: `Le contrôle technique de ${v.make} ${v.model} (${v.registration}) a expiré le ${new Date(
              v.technicalInspectionExpiryDate
            ).toLocaleDateString('fr-FR')}.`,
            vehicleId: v.id,
            vehicleName: `${v.make} ${v.model}`,
            dueDate: v.technicalInspectionExpiryDate,
            daysRemaining: diffDays,
          });
        } else if (diffDays <= 30) {
          alerts.push({
            id: `alert_insp_soon_${v.id}`,
            type: 'inspection_expiry',
            severity: diffDays <= 7 ? 'error' : 'warning',
            title: `Visite technique sous ${diffDays} jour(s)`,
            message: `La visite technique de ${v.make} ${v.model} (${v.registration}) arrive à échéance le ${new Date(
              v.technicalInspectionExpiryDate
            ).toLocaleDateString('fr-FR')}.`,
            vehicleId: v.id,
            vehicleName: `${v.make} ${v.model}`,
            dueDate: v.technicalInspectionExpiryDate,
            daysRemaining: diffDays,
          });
        }
      }
    });

    // 4. Entretiens programmés / planifiés
    maintenances.forEach((m) => {
      if (m.status === 'Planifiée') {
        const schedDate = new Date(m.date);
        schedDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil(
          (schedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        alerts.push({
          id: `alert_maint_sched_${m.id}`,
          type: 'maintenance_scheduled',
          severity: diffDays < 0 ? 'error' : diffDays <= 3 ? 'warning' : 'info',
          title: `Entretien planifié : ${m.type}`,
          message: `${m.type} sur ${m.vehicleName} (${m.vehicleRegistration}) prévu le ${new Date(
            m.date
          ).toLocaleDateString('fr-FR')} chez ${m.supplier}.`,
          vehicleId: m.vehicleId,
          vehicleName: m.vehicleName,
          dueDate: m.date,
          daysRemaining: diffDays,
        });
      }
    });

    return alerts;
  };

  // Fournisseurs & Prestataires Actions
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Supplier => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: 'sup_' + Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    addToast({
      title: 'Fournisseur enregistré',
      message: `${newSupplier.name} (${newSupplier.category}) a été ajouté aux partenaires.`,
      type: 'success',
    });
    return newSupplier;
  };

  const updateSupplier = (id: string, data: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s))
    );
    addToast({
      title: 'Fournisseur mis à jour',
      message: 'Les informations du partenaire ont été modifiées.',
      type: 'info',
    });
  };

  const deleteSupplier = (id: string) => {
    const target = suppliers.find((s) => s.id === id);
    if (target) {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      setNotifications((prev) => prev.filter((n) => n.referenceId !== id));
      addToast({
        title: 'Fournisseur supprimé',
        message: `${target.name} a été retiré des partenaires.`,
        type: 'info',
      });
    }
  };

  const getSupplierInterventions = (supplierIdOrName: string): MaintenanceIntervention[] => {
    const supplier = suppliers.find(
      (s) => s.id === supplierIdOrName || (s.name && s.name.toLowerCase().trim() === supplierIdOrName.toLowerCase().trim())
    );
    const supplierId = supplier?.id || supplierIdOrName;
    const supplierName = supplier?.name || supplierIdOrName;

    return maintenances.filter((m) => {
      if (m.supplierId && m.supplierId === supplierId) return true;
      if (m.supplier && supplierName && m.supplier.trim().toLowerCase() === supplierName.trim().toLowerCase()) return true;
      return false;
    });
  };

  const getSupplierExpenses = (supplierIdOrName: string): Expense[] => {
    const supplier = suppliers.find(
      (s) => s.id === supplierIdOrName || (s.name && s.name.toLowerCase().trim() === supplierIdOrName.toLowerCase().trim())
    );
    const supplierId = supplier?.id || supplierIdOrName;
    const supplierName = supplier?.name || supplierIdOrName;

    return expenses.filter((e) => {
      if (e.supplierId && e.supplierId === supplierId) return true;
      if (e.supplier && supplierName && e.supplier.trim().toLowerCase() === supplierName.trim().toLowerCase()) return true;
      if (e.beneficiary && supplierName && e.beneficiary.trim().toLowerCase() === supplierName.trim().toLowerCase()) return true;
      return false;
    });
  };

  const getSupplierStats = (supplierIdOrName: string) => {
    const matchingInterventions = getSupplierInterventions(supplierIdOrName);
    const matchingExpenses = getSupplierExpenses(supplierIdOrName);

    // Total invoiced and paid calculation
    const totalExpensesAmount = matchingExpenses.reduce(
      (sum, e) => sum + (Number(e.amount) || 0),
      0
    );

    const standaloneInterventionsAmount = matchingInterventions
      .filter((m) => !m.expenseId && m.status !== 'Annulée')
      .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

    const totalInvoiced = totalExpensesAmount + standaloneInterventionsAmount;
    const totalPaid = totalExpensesAmount;
    const balanceDue = Math.max(0, totalInvoiced - totalPaid);

    const allDates = [
      ...matchingInterventions.map((m) => m.date),
      ...matchingExpenses.map((e) => e.date),
    ]
      .filter(Boolean)
      .sort()
      .reverse();

    return {
      totalInvoiced,
      totalPaid,
      balanceDue,
      interventionsCount: matchingInterventions.length,
      expensesCount: matchingExpenses.length,
      lastInterventionDate: allDates[0],
    };
  };

  // Prospects & CRM Commercial Actions
  const addProspect = ({
    name,
    phone,
    whatsapp,
    email,
    needType,
    searchedVehicle,
    budget,
    expectedDate,
    status = 'Nouveau',
    notes,
    initialReminderDate,
    initialReminderTime,
    initialReminderReason,
  }: {
    name: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    needType: ProspectNeedType;
    searchedVehicle?: string;
    budget?: number;
    expectedDate?: string;
    status?: ProspectStatus;
    notes?: string;
    initialReminderDate?: string;
    initialReminderTime?: string;
    initialReminderReason?: string;
  }): Prospect => {
    const count = prospects.length + 1;
    const prospectNumber = `PROSP-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const reminders: ProspectReminder[] = [];
    if (initialReminderDate && initialReminderReason) {
      reminders.push({
        id: `rem_${Date.now()}`,
        date: initialReminderDate,
        time: initialReminderTime || '10:00',
        reason: initialReminderReason,
        notes: notes || undefined,
        status: 'À faire',
        createdAt: new Date().toISOString(),
      });
    }

    const initialFollowUps: ProspectFollowUp[] = [
      {
        id: `fu_${Date.now()}`,
        type: 'Note',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        title: 'Création de la fiche prospect',
        notes: notes || `Besoin : ${needType}${searchedVehicle ? ` pour ${searchedVehicle}` : ''}${budget ? ` (Budget : ${budget})` : ''}`,
        createdAt: new Date().toISOString(),
      },
    ];

    const newProspect: Prospect = {
      id: 'prosp_' + Date.now().toString(),
      prospectNumber,
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp?.trim() || (phone.trim() ? phone.trim() : undefined),
      email: email?.trim() || undefined,
      needType,
      searchedVehicle: searchedVehicle?.trim() || undefined,
      budget: budget ? Number(budget) : undefined,
      expectedDate: expectedDate || undefined,
      status,
      notes: notes?.trim() || undefined,
      lastContactDate: new Date().toISOString().split('T')[0],
      lastContactType: 'Note',
      nextReminderDate: initialReminderDate || undefined,
      nextReminderTime: initialReminderTime || (initialReminderDate ? '10:00' : undefined),
      nextReminderReason: initialReminderReason || undefined,
      followUps: initialFollowUps,
      reminders,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProspects((prev) => [newProspect, ...prev]);

    addNotification({
      category: 'Prospects',
      type: 'Nouveau prospect',
      title: `Nouveau prospect enregistré`,
      message: `${newProspect.name} (${newProspect.needType}${newProspect.searchedVehicle ? ` - ${newProspect.searchedVehicle}` : ''}) • Tél : ${newProspect.phone || 'Non renseigné'}`,
      priority: 'Normal',
      severity: 'info',
      linkTab: 'prospects',
      referenceType: 'prospect',
      referenceId: newProspect.id,
      referenceNumber: newProspect.prospectNumber,
      actionLabel: 'Consulter le prospect',
    });

    addToast({
      title: 'Prospect enregistré',
      message: `${newProspect.name} a été ajouté au CRM commercial.`,
      type: 'success',
    });

    return newProspect;
  };

  const updateProspect = (id: string, data: Partial<Prospect>) => {
    setProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
    );
    addToast({
      title: 'Prospect mis à jour',
      message: 'Les modifications ont été enregistrées.',
      type: 'info',
    });
  };

  const deleteProspect = (id: string) => {
    const target = prospects.find((p) => p.id === id);
    if (target) {
      setProspects((prev) => prev.filter((p) => p.id !== id));
      setNotifications((prev) => prev.filter((n) => n.referenceId !== id && (!target.prospectNumber || n.referenceNumber !== target.prospectNumber)));
      addToast({
        title: 'Prospect supprimé',
        message: `${target.name} a été retiré.`,
        type: 'info',
      });
    }
  };

  const addProspectFollowUp = (
    prospectId: string,
    followUp: {
      type: ProspectFollowUpType;
      title: string;
      notes?: string;
      date?: string;
      time?: string;
    }
  ) => {
    const followUpDate = followUp.date || new Date().toISOString().split('T')[0];
    const followUpTime =
      followUp.time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const newFollowUp: ProspectFollowUp = {
      id: `fu_${Date.now()}`,
      type: followUp.type,
      title: followUp.title,
      notes: followUp.notes,
      date: followUpDate,
      time: followUpTime,
      createdAt: new Date().toISOString(),
    };

    setProspects((prev) =>
      prev.map((p) => {
        if (p.id !== prospectId) return p;
        return {
          ...p,
          lastContactDate: followUpDate,
          lastContactType: followUp.type,
          followUps: [newFollowUp, ...(p.followUps || [])],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    addToast({
      title: 'Interaction enregistrée',
      message: `${followUp.type} ajouté à l'historique du prospect.`,
      type: 'success',
    });
  };

  const addProspectReminder = (
    prospectId: string,
    reminder: {
      date: string;
      time?: string;
      reason: string;
      notes?: string;
    }
  ) => {
    const newReminder: ProspectReminder = {
      id: `rem_${Date.now()}`,
      date: reminder.date,
      time: reminder.time || '10:00',
      reason: reminder.reason,
      notes: reminder.notes,
      status: 'À faire',
      createdAt: new Date().toISOString(),
    };

    const followUpLog: ProspectFollowUp = {
      id: `fu_rem_${Date.now()}`,
      type: 'Relance',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      title: `Relance programmée pour le ${new Date(reminder.date).toLocaleDateString('fr-FR')}`,
      notes: `Motif : ${reminder.reason}${reminder.notes ? ` | Notes : ${reminder.notes}` : ''}`,
      createdAt: new Date().toISOString(),
    };

    setProspects((prev) =>
      prev.map((p) => {
        if (p.id !== prospectId) return p;
        return {
          ...p,
          nextReminderDate: reminder.date,
          nextReminderTime: reminder.time || '10:00',
          nextReminderReason: reminder.reason,
          reminders: [newReminder, ...(p.reminders || [])],
          followUps: [followUpLog, ...(p.followUps || [])],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    addToast({
      title: 'Relance programmée',
      message: `Rappel prévu le ${new Date(reminder.date).toLocaleDateString('fr-FR')} (${reminder.reason}).`,
      type: 'success',
    });
  };

  const completeProspectReminder = (prospectId: string, reminderId: string) => {
    setProspects((prev) =>
      prev.map((p) => {
        if (p.id !== prospectId) return p;
        const updatedReminders = (p.reminders || []).map((r) => {
          if (r.id !== reminderId) return r;
          return {
            ...r,
            status: 'Terminée' as const,
            completedAt: new Date().toISOString(),
          };
        });

        const nextPending = updatedReminders
          .filter((r) => r.status === 'À faire')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

        return {
          ...p,
          nextReminderDate: nextPending?.date,
          nextReminderTime: nextPending?.time,
          nextReminderReason: nextPending?.reason,
          reminders: updatedReminders,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    addToast({
      title: 'Relance terminée',
      message: 'La relance a été marquée comme effectuée.',
      type: 'info',
    });
  };

  const convertProspectToClient = (prospectId: string): Client | null => {
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) {
      addToast({
        title: 'Erreur de conversion',
        message: 'Prospect introuvable.',
        type: 'error',
      });
      return null;
    }

    if (prospect.convertedToClientId) {
      const existing = clients.find((c) => c.id === prospect.convertedToClientId);
      if (existing) {
        addToast({
          title: 'Prospect déjà converti',
          message: `${prospect.name} est déjà lié au client ${existing.firstName} ${existing.lastName}.`,
          type: 'info',
        });
        return existing;
      }
    }

    const nameParts = prospect.name.trim().split(' ');
    const firstName = nameParts[0] || prospect.name;
    const lastName = nameParts.slice(1).join(' ') || '';

    const newClientData: Omit<Client, 'id' | 'createdAt'> = {
      type: 'particulier',
      firstName,
      lastName,
      fullName: prospect.name,
      phone: prospect.phone,
      whatsapp: prospect.whatsapp || prospect.phone,
      email: prospect.email || '',
      notes: `Converti depuis le prospect ${prospect.prospectNumber}.${
        prospect.searchedVehicle ? ` Véhicule recherché : ${prospect.searchedVehicle}.` : ''
      }${prospect.notes ? ` Notes : ${prospect.notes}` : ''}`,
      status: 'Actif',
    };

    const newClient = addClient(newClientData);

    const conversionFollowUp: ProspectFollowUp = {
      id: `fu_${Date.now()}`,
      type: 'Rendez-vous',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      title: 'Conversion en client officiel',
      notes: `Prospect converti en fiche client (${newClient.firstName} ${newClient.lastName}).`,
      createdAt: new Date().toISOString(),
    };

    setProspects((prev) =>
      prev.map((p) => {
        if (p.id !== prospectId) return p;
        return {
          ...p,
          status: 'Gagné',
          convertedToClientId: newClient.id,
          lastContactDate: new Date().toISOString().split('T')[0],
          lastContactType: 'Rendez-vous',
          followUps: [conversionFollowUp, ...(p.followUps || [])],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    addNotification({
      type: 'system',
      title: 'Prospect converti en client ! 🎉',
      message: `${prospect.name} a été transformé avec succès en client.`,
      severity: 'success',
      linkTab: 'clients',
      referenceId: newClient.id,
    });

    addToast({
      title: 'Conversion réussie !',
      message: `${prospect.name} est désormais enregistré comme client.`,
      type: 'success',
    });

    return newClient;
  };

  const getCommercialDashboardStats = () => {
    const totalProspects = prospects.length;
    const newProspects = prospects.filter((p) => p.status === 'Nouveau').length;
    const inDiscussionProspects = prospects.filter((p) => p.status === 'En discussion').length;
    const interestedProspects = prospects.filter((p) => p.status === 'Intéressé').length;
    const wonProspects = prospects.filter((p) => p.status === 'Gagné').length;
    const lostProspects = prospects.filter((p) => p.status === 'Perdu').length;

    const convertedClientsCount = prospects.filter((p) => !!p.convertedToClientId).length;
    const totalSalesCount = sales.filter((s) =>
      prospects.some((p) => p.convertedToSaleId === s.id || p.convertedToClientId === s.clientId)
    ).length;
    const totalRentalsCount = rentals.filter((r) =>
      prospects.some((p) => p.convertedToRentalId === r.id || p.convertedToClientId === r.clientId)
    ).length;

    const conversionRate =
      totalProspects > 0 ? Math.round((wonProspects / totalProspects) * 100) : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    let upcomingRemindersCount = 0;
    let overdueRemindersCount = 0;

    prospects.forEach((p) => {
      (p.reminders || []).forEach((r) => {
        if (r.status === 'À faire') {
          if (r.date < todayStr) {
            overdueRemindersCount++;
          } else if (r.date === todayStr) {
            upcomingRemindersCount++;
          }
        }
      });
    });

    return {
      totalProspects,
      newProspects,
      inDiscussionProspects,
      interestedProspects,
      wonProspects,
      lostProspects,
      convertedClientsCount,
      totalSalesCount,
      totalRentalsCount,
      conversionRate,
      upcomingRemindersCount,
      overdueRemindersCount,
    };
  };

  // Sales Actions
  const addSale = ({
    vehicleId,
    clientId,
    salePrice,
    taxRate,
    paymentMethod,
    paymentStatus,
    amountPaid,
    saleDate,
    notes,
  }: {
    vehicleId: string;
    clientId: string;
    salePrice: number;
    taxRate: number;
    paymentMethod: Sale['paymentMethod'];
    paymentStatus: Sale['paymentStatus'];
    amountPaid: number;
    saleDate: string;
    notes?: string;
  }): Sale | null => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const client = clients.find((c) => c.id === clientId);

    if (!vehicle || !client) {
      addToast({
        title: 'Erreur lors de la vente',
        message: 'Véhicule ou client introuvable.',
        type: 'error',
      });
      return null;
    }

    const taxAmount = (salePrice * taxRate) / 100;
    const totalAmount = salePrice + taxAmount;
    const count = sales.length + 1;
    const saleNumber = `VNT-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const clientDisplayName = client.type === 'entreprise' && client.companyName
      ? client.companyName
      : `${client.firstName} ${client.lastName}`;

    const balanceDue = Math.max(0, totalAmount - amountPaid);
    const saleStatus: SaleStatus =
      paymentStatus === 'Payé' || amountPaid >= totalAmount
        ? 'Payé'
        : paymentStatus === 'Brouillon'
        ? 'Brouillon'
        : paymentStatus === 'Annulé'
        ? 'Annulé'
        : 'Partiellement payé';

    const newSale: Sale = {
      id: 'sal_' + Date.now().toString(),
      saleNumber,
      vehicleId,
      vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
      vehicleRegistration: vehicle.registration,
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      clientId,
      clientName: clientDisplayName,
      clientPhone: client.phone,
      saleDate: saleDate || new Date().toISOString().split('T')[0],
      salePrice,
      taxRate,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentStatus,
      status: saleStatus,
      amountPaid,
      balanceDue,
      notes,
      createdAt: new Date().toISOString(),
    };

    // Update vehicle status to 'Vendu'
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, status: 'Vendu' } : v))
    );

    // If amount was paid, register payment transaction
    if (amountPaid > 0) {
      const payCount = payments.length + 1;
      const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payCount).padStart(4, '0')}`;
      const newPayment: Payment = {
        id: 'pay_' + Date.now().toString(),
        paymentNumber,
        referenceType: 'sale',
        referenceId: newSale.id,
        referenceTitle: `Vente ${saleNumber} — ${newSale.vehicleName}`,
        clientId: client.id,
        clientName: clientDisplayName,
        amount: amountPaid,
        paymentDate: newSale.saleDate,
        paymentMethod,
        status: 'Validé',
        notes: `Encaissement sur vente ${saleNumber}`,
        createdAt: new Date().toISOString(),
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    setSales((prev) => [newSale, ...prev]);

    // Update any linked prospect
    setProspects((prev) =>
      prev.map((p) => {
        if (p.convertedToClientId === clientId || (client.phone && p.phone === client.phone)) {
          const saleFollowUp: ProspectFollowUp = {
            id: `fu_sale_${Date.now()}`,
            type: 'Vente',
            date: saleDate || new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            title: `Vente conclue : ${newSale.vehicleName} (${saleNumber})`,
            notes: `Prix : ${totalAmount.toLocaleString('fr-FR')} ${settings.currencySymbol} | Statut : ${paymentStatus}`,
            createdAt: new Date().toISOString(),
          };
          return {
            ...p,
            status: 'Gagné',
            convertedToSaleId: newSale.id,
            lastContactDate: saleDate || new Date().toISOString().split('T')[0],
            lastContactType: 'Vente',
            followUps: [saleFollowUp, ...(p.followUps || [])],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    // Internal notification
    const isFullyPaid = paymentStatus === 'Payé';
    const isPartial = paymentStatus === 'Partiel';
    addNotification({
      category: 'Ventes',
      type: isFullyPaid ? 'Vente entièrement payée' : (isPartial ? 'Vente partiellement payée' : 'Nouvelle vente'),
      title: `Nouvelle vente ${saleNumber}`,
      message: `${newSale.vehicleName} (${totalAmount.toLocaleString('fr-FR')} ${settings.currencySymbol}) • Client : ${clientDisplayName} (${paymentStatus})`,
      priority: isPartial ? 'Important' : 'Normal',
      severity: isFullyPaid ? 'success' : (isPartial ? 'warning' : 'info'),
      linkTab: 'quick-sale',
      referenceType: 'sale',
      referenceId: newSale.id,
      referenceNumber: saleNumber,
      actionLabel: 'Ouvrir la vente',
    });

    addToast({
      title: 'Vente enregistrée avec succès',
      message: `Vente ${saleNumber} pour ${totalAmount.toLocaleString('fr-FR')} ${settings.currencySymbol}`,
      type: 'success',
    });

    return newSale;
  };

  const deleteSale = (id: string) => {
    const sale = sales.find((s) => s.id === id);
    if (sale) {
      // Restore vehicle status to Disponible
      setVehicles((prev) =>
        prev.map((v) => (v.id === sale.vehicleId ? { ...v, status: 'Disponible' } : v))
      );
    }
    setSales((prev) => prev.filter((s) => s.id !== id));
    setNotifications((prev) => prev.filter((n) => n.referenceId !== id && (!sale?.saleNumber || n.referenceNumber !== sale.saleNumber)));
    addToast({
      title: 'Vente supprimée',
      message: 'Le véhicule associé est de nouveau marqué Disponible.',
      type: 'info',
    });
  };

  // Rentals Actions
  const addRental = ({
    vehicleId,
    clientId,
    startDate,
    endDate,
    dailyRate,
    depositAmount,
    mileageDeparture,
    status,
    paymentStatus,
    amountPaid,
    paymentMethod,
    notes,
  }: {
    vehicleId: string;
    clientId: string;
    startDate: string;
    endDate: string;
    dailyRate: number;
    depositAmount: number;
    mileageDeparture: number;
    status: Rental['status'];
    paymentStatus: Rental['paymentStatus'];
    amountPaid: number;
    paymentMethod: Rental['paymentMethod'];
    notes?: string;
  }): Rental | null => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const client = clients.find((c) => c.id === clientId);

    if (!vehicle || !client) {
      addToast({
        title: 'Erreur de location',
        message: 'Véhicule ou client introuvable.',
        type: 'error',
      });
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalAmount = durationDays * dailyRate;

    const count = rentals.length + 1;
    const rentalNumber = `LOC-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const clientDisplayName = client.type === 'entreprise' && client.companyName
      ? client.companyName
      : `${client.firstName} ${client.lastName}`;

    const balanceDue = Math.max(0, totalAmount - amountPaid);

    const newRental: Rental = {
      id: 'rec_' + Date.now().toString(),
      rentalNumber,
      vehicleId,
      vehicleName: `${vehicle.make} ${vehicle.model}`,
      vehicleRegistration: vehicle.registration,
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      clientId,
      clientName: clientDisplayName,
      clientPhone: client.phone,
      clientDrivingLicense: client.drivingLicenseNumber,
      startDate,
      endDate,
      durationDays,
      dailyRate,
      totalAmount,
      depositAmount,
      depositReturned: false,
      mileageDeparture,
      status,
      paymentStatus,
      amountPaid,
      balanceDue,
      paymentMethod,
      notes,
      createdAt: new Date().toISOString(),
    };

    // Update vehicle status
    if (status === 'En cours') {
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, status: 'Loué' } : v))
      );
    } else if (status === 'Réservée') {
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, status: 'Réservé' } : v))
      );
    }

    // Register payment if paid
    if (amountPaid > 0) {
      const payCount = payments.length + 1;
      const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payCount).padStart(4, '0')}`;
      const newPayment: Payment = {
        id: 'pay_' + Date.now().toString(),
        paymentNumber,
        referenceType: 'rental',
        referenceId: newRental.id,
        referenceTitle: `Location ${rentalNumber} — ${newRental.vehicleName}`,
        clientId: client.id,
        clientName: clientDisplayName,
        amount: amountPaid,
        paymentDate: startDate,
        paymentMethod,
        status: 'Validé',
        notes: `Paiement location ${rentalNumber}`,
        createdAt: new Date().toISOString(),
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    setRentals((prev) => [newRental, ...prev]);

    // Update any linked prospect
    setProspects((prev) =>
      prev.map((p) => {
        if (p.convertedToClientId === clientId || (client.phone && p.phone === client.phone)) {
          const rentalFollowUp: ProspectFollowUp = {
            id: `fu_rent_${Date.now()}`,
            type: 'Location',
            date: startDate,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            title: `Location conclue : ${newRental.vehicleName} (${rentalNumber})`,
            notes: `Durée : ${durationDays} jour(s) | Montant : ${totalAmount.toLocaleString('fr-FR')} ${settings.currencySymbol}`,
            createdAt: new Date().toISOString(),
          };
          return {
            ...p,
            status: 'Gagné',
            convertedToRentalId: newRental.id,
            lastContactDate: startDate,
            lastContactType: 'Location',
            followUps: [rentalFollowUp, ...(p.followUps || [])],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    // Internal notification
    addNotification({
      category: 'Locations',
      type: 'Nouvelle location',
      title: `Nouveau contrat de location ${rentalNumber}`,
      message: `${newRental.vehicleName} (${durationDays} jours) • Client : ${clientDisplayName} • Montant : ${totalAmount.toLocaleString('fr-FR')} ${settings.currencySymbol}`,
      priority: 'Normal',
      severity: 'info',
      linkTab: 'quick-rental',
      referenceType: 'rental',
      referenceId: newRental.id,
      referenceNumber: rentalNumber,
      actionLabel: 'Ouvrir la location',
    });

    addToast({
      title: 'Location enregistrée avec succès',
      message: `Location ${rentalNumber} (${durationDays} j) créée.`,
      type: 'success',
    });

    return newRental;
  };

  const updateRental = (id: string, data: Partial<Rental>) => {
    setRentals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
    addToast({
      title: 'Location mise à jour',
      message: 'Les informations du contrat ont été enregistrées.',
      type: 'info',
    });
  };

  const closeRentalVehicle = (
    id: string,
    returnData: {
      actualReturnDate: string;
      returnMileage: number;
      conditionOnReturn: 'Conforme' | 'Dommages constatés';
      damageNotes?: string;
      damageFee?: number;
      depositReturned: boolean;
      notes?: string;
    }
  ) => {
    const rental = rentals.find((r) => r.id === id);
    if (!rental) return;

    setRentals((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: 'Terminée',
            actualReturnDate: returnData.actualReturnDate,
            mileageReturn: returnData.returnMileage,
            conditionOnReturn: returnData.conditionOnReturn,
            damageNotes: returnData.damageNotes,
            damageFee: returnData.damageFee || 0,
            depositReturned: returnData.depositReturned,
            notes: returnData.notes ? `${r.notes ? r.notes + ' | ' : ''}${returnData.notes}` : r.notes,
          };
        }
        return r;
      })
    );

    // Restore vehicle to 'Disponible' and update vehicle mileage
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === rental.vehicleId) {
          return {
            ...v,
            status: 'Disponible',
            mileage: returnData.returnMileage > v.mileage ? returnData.returnMileage : v.mileage,
          };
        }
        return v;
      })
    );

    addToast({
      title: 'Location clôturée',
      message: `Le véhicule ${rental.vehicleName} est de nouveau disponible.`,
      type: 'success',
    });
  };

  const updateRentalStatus = (
    id: string, 
    status: Rental['status'], 
    returnMileage?: number, 
    depositReturned?: boolean
  ) => {
    const rental = rentals.find((r) => r.id === id);
    if (!rental) return;

    setRentals((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status,
            mileageReturn: returnMileage !== undefined ? returnMileage : r.mileageReturn,
            depositReturned: depositReturned !== undefined ? depositReturned : r.depositReturned,
          };
        }
        return r;
      })
    );

    // If closing or canceling, restore vehicle to Disponible and update its mileage if provided
    if (status === 'Clôturée' || status === 'Annulée') {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === rental.vehicleId) {
            return {
              ...v,
              status: 'Disponible',
              mileage: returnMileage && returnMileage > v.mileage ? returnMileage : v.mileage,
            };
          }
          return v;
        })
      );
    } else if (status === 'En cours') {
      setVehicles((prev) =>
        prev.map((v) => (v.id === rental.vehicleId ? { ...v, status: 'Loué' } : v))
      );
    }

    addToast({
      title: `Location mise à jour : ${status}`,
      type: 'info',
    });
  };

  const deleteRental = (id: string) => {
    const rental = rentals.find((r) => r.id === id);
    if (rental && rental.status === 'En cours') {
      setVehicles((prev) =>
        prev.map((v) => (v.id === rental.vehicleId ? { ...v, status: 'Disponible' } : v))
      );
    }
    setRentals((prev) => prev.filter((r) => r.id !== id));
    setNotifications((prev) => prev.filter((n) => n.referenceId !== id && (!rental?.rentalNumber || n.referenceNumber !== rental.rentalNumber)));
    addToast({
      title: 'Contrat de location supprimé',
      type: 'info',
    });
  };

  // Payments Actions
  const addPayment = (paymentData: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt'>): Payment => {
    const count = payments.length + 1;
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
    const newPayment: Payment = {
      ...paymentData,
      id: 'pay_' + Date.now().toString(),
      paymentNumber,
      createdAt: new Date().toISOString(),
    };

    // Automatisation: Update linked Sale if applicable
    if (paymentData.referenceType === 'sale' && paymentData.referenceId) {
      setSales((prev) =>
        prev.map((s) => {
          if (s.id === paymentData.referenceId) {
            const newAmountPaid = (s.amountPaid || 0) + paymentData.amount;
            const newBalanceDue = Math.max(0, s.totalAmount - newAmountPaid);
            const newStatus: Sale['paymentStatus'] = newBalanceDue <= 0 ? 'Payé' : 'Partiellement payé';
            return {
              ...s,
              amountPaid: newAmountPaid,
              balanceDue: newBalanceDue,
              paymentStatus: newStatus,
              status: newStatus === 'Payé' ? 'Payé' : s.status,
            };
          }
          return s;
        })
      );
    }

    // Automatisation: Update linked Rental if applicable
    if (paymentData.referenceType === 'rental' && paymentData.referenceId) {
      setRentals((prev) =>
        prev.map((r) => {
          if (r.id === paymentData.referenceId) {
            const newAmountPaid = (r.amountPaid || 0) + paymentData.amount;
            const newBalanceDue = Math.max(0, r.totalAmount - newAmountPaid);
            const newStatus: Rental['paymentStatus'] = newBalanceDue <= 0 ? 'Payé' : 'Partiellement payé';
            return {
              ...r,
              amountPaid: newAmountPaid,
              balanceDue: newBalanceDue,
              paymentStatus: newStatus,
            };
          }
          return r;
        })
      );
    }

    setPayments((prev) => [newPayment, ...prev]);

    // Internal notification
    addNotification({
      category: 'Paiements',
      type: paymentData.status === 'En attente' ? 'Paiement en attente' : 'Paiement reçu',
      title: paymentData.status === 'En attente' ? `Paiement en attente de validation` : `Paiement reçu ${newPayment.paymentNumber}`,
      message: `${newPayment.amount.toLocaleString('fr-FR')} ${settings.currencySymbol} via ${newPayment.paymentMethod} • Client : ${newPayment.clientName} (${newPayment.referenceTitle})`,
      priority: paymentData.status === 'En attente' ? 'Important' : 'Normal',
      severity: paymentData.status === 'En attente' ? 'warning' : 'success',
      linkTab: 'payments',
      referenceType: 'payment',
      referenceId: newPayment.id,
      referenceNumber: newPayment.paymentNumber,
      actionLabel: 'Voir le paiement',
    });

    addToast({
      title: 'Paiement enregistré',
      message: `${newPayment.amount.toLocaleString('fr-FR')} ${settings.currencySymbol} encaissé (${newPayment.paymentNumber}) via ${newPayment.paymentMethod}.`,
      type: 'success',
    });
    return newPayment;
  };

  const updatePayment = (id: string, data: Partial<Payment>) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
    addToast({
      title: 'Paiement mis à jour',
      message: 'Les modifications ont été enregistrées.',
      type: 'info',
    });
  };

  const updatePaymentStatus = (id: string, status: Payment['status']) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
    addToast({
      title: `Statut paiement : ${status}`,
      type: 'info',
    });
  };

  const deletePayment = (id: string) => {
    const payment = payments.find((p) => p.id === id);
    setPayments((prev) => prev.filter((p) => p.id !== id));
    setNotifications((prev) => prev.filter((n) => n.referenceId !== id && (!payment?.paymentNumber || n.referenceNumber !== payment.paymentNumber)));
    addToast({
      title: 'Paiement supprimé',
      type: 'info',
    });
  };

  const refundDeposit = (
    rentalId: string,
    refundData: {
      amount: number;
      deductionAmount?: number;
      deductionReason?: string;
      refundDate: string;
      paymentMethod: Payment['paymentMethod'];
      notes?: string;
    }
  ) => {
    const rental = rentals.find((r) => r.id === rentalId);
    if (!rental) return;

    const initialDeposit = rental.depositAmount || 0;
    const isFullRefund = refundData.amount >= initialDeposit;
    const depositStatus = isFullRefund ? 'Remboursée' : 'Partiellement remboursée';

    // Update rental record
    setRentals((prev) =>
      prev.map((r) => {
        if (r.id === rentalId) {
          return {
            ...r,
            depositReturned: isFullRefund,
            depositStatus,
            depositRefundedAmount: refundData.amount,
            depositDeductionAmount: refundData.deductionAmount || 0,
            depositDeductionReason: refundData.deductionReason || undefined,
            depositRefundDate: refundData.refundDate,
            depositRefundMethod: refundData.paymentMethod,
            depositRefundNotes: refundData.notes || undefined,
          };
        }
        return r;
      })
    );

    // Register a refund payment entry in the journal for accounting transparency
    const payCount = payments.length + 1;
    const refundPaymentNumber = `REF-${new Date().getFullYear()}-${String(payCount).padStart(4, '0')}`;
    const refundPayment: Payment = {
      id: 'pay_ref_' + Date.now().toString(),
      paymentNumber: refundPaymentNumber,
      referenceType: 'deposit_refund',
      referenceId: rental.id,
      referenceTitle: `Restitution caution — ${rental.rentalNumber} (${rental.vehicleName})`,
      clientId: rental.clientId,
      clientName: rental.clientName,
      clientPhone: rental.clientPhone,
      amount: refundData.amount,
      paymentDate: refundData.refundDate,
      paymentMethod: refundData.paymentMethod,
      status: 'Validé',
      notes: refundData.deductionAmount
        ? `Restitution de ${refundData.amount.toLocaleString('fr-FR')} ${settings.currencySymbol} (Retenue de ${refundData.deductionAmount} ${settings.currencySymbol} pour : ${refundData.deductionReason || 'frais divers'}). ${refundData.notes || ''}`.trim()
        : `Restitution intégrale de la caution. ${refundData.notes || ''}`.trim(),
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [refundPayment, ...prev]);

    addToast({
      title: 'Caution restituée avec succès',
      message: `${refundData.amount.toLocaleString('fr-FR')} ${settings.currencySymbol} remboursé au client (${depositStatus}).`,
      type: 'success',
    });
  };

  // Accounting Actions
  const addExpense = (data: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt'>): Expense => {
    const year = new Date().getFullYear();
    const count = expenses.length + 1;
    const expenseNumber = `DEP-${year}-${String(count).padStart(4, '0')}`;
    const newExpense: Expense = {
      ...data,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      expenseNumber,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);

    // Add notification
    addNotification({
      title: 'Nouvelle dépense enregistrée',
      message: `${newExpense.category} : ${newExpense.amount.toLocaleString('fr-FR')} ${settings.currencySymbol || '€'} (${newExpense.description})`,
      type: 'system',
      severity: 'info',
      linkTab: 'accounting',
      referenceId: newExpense.id,
    });

    addToast({
      title: 'Dépense enregistrée',
      message: `${newExpense.expenseNumber} de ${newExpense.amount.toLocaleString('fr-FR')} ${settings.currencySymbol || '€'} ajoutée avec succès.`,
      type: 'success',
    });

    return newExpense;
  };

  const updateExpense = (id: string, data: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    addToast({
      title: 'Dépense modifiée',
      message: 'Les informations de la dépense ont été mises à jour.',
      type: 'info',
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setNotifications((prev) => prev.filter((n) => n.referenceId !== id));
    addToast({
      title: 'Dépense supprimée',
      message: 'La charge a été retirée des comptes.',
      type: 'info',
    });
  };

  const addOtherRevenue = (data: Omit<OtherRevenue, 'id' | 'revenueNumber' | 'createdAt'>): OtherRevenue => {
    const year = new Date().getFullYear();
    const count = otherRevenues.length + 1;
    const revenueNumber = `REV-${year}-${String(count).padStart(4, '0')}`;
    const newRev: OtherRevenue = {
      ...data,
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      revenueNumber,
      createdAt: new Date().toISOString(),
    };
    setOtherRevenues((prev) => [newRev, ...prev]);

    addNotification({
      title: 'Autre revenu enregistré',
      message: `${newRev.category} : +${newRev.amount.toLocaleString('fr-FR')} ${settings.currencySymbol || '€'} (${newRev.description})`,
      type: 'payment',
      severity: 'success',
      linkTab: 'accounting',
      referenceId: newRev.id,
    });

    addToast({
      title: 'Revenu enregistré',
      message: `${newRev.revenueNumber} de ${newRev.amount.toLocaleString('fr-FR')} ${settings.currencySymbol || '€'} enregistré.`,
      type: 'success',
    });

    return newRev;
  };

  const updateOtherRevenue = (id: string, data: Partial<OtherRevenue>) => {
    setOtherRevenues((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    addToast({
      title: 'Revenu modifié',
      type: 'info',
    });
  };

  const deleteOtherRevenue = (id: string) => {
    setOtherRevenues((prev) => prev.filter((r) => r.id !== id));
    setNotifications((prev) => prev.filter((n) => n.referenceId !== id));
    addToast({
      title: 'Revenu supprimé',
      type: 'info',
    });
  };

  // Comprehensive General Ledger (Journal des opérations consolidé)
  const getAccountingJournal = (): AccountingEntry[] => {
    const entries: AccountingEntry[] = [];

    // 1. Sales
    sales.forEach((s) => {
      entries.push({
        id: `entry_sale_${s.id}`,
        date: s.saleDate,
        reference: s.invoiceNumber || s.id,
        type: 'Vente véhicule',
        flowType: 'credit',
        category: 'Vente',
        thirdParty: s.clientName,
        description: `Vente ${s.vehicleName} (${s.vehicleRegistration})`,
        amount: s.salePrice,
        status: s.paymentStatus,
        paymentMethod: s.paymentMethod,
        sourceId: s.id,
        sourceType: 'sale',
        createdAt: s.createdAt || s.saleDate,
      });
    });

    // 2. Rentals
    rentals.forEach((r) => {
      entries.push({
        id: `entry_rental_${r.id}`,
        date: r.startDate,
        reference: r.contractNumber || r.id,
        type: 'Location véhicule',
        flowType: 'credit',
        category: 'Location',
        thirdParty: r.clientName,
        description: `Location ${r.vehicleName} (${r.durationDays} j)`,
        amount: r.totalAmount,
        status: r.paymentStatus,
        paymentMethod: r.paymentMethod,
        sourceId: r.id,
        sourceType: 'rental',
        createdAt: r.createdAt || r.startDate,
      });
    });

    // 3. Other Revenues
    otherRevenues.forEach((rev) => {
      entries.push({
        id: `entry_other_rev_${rev.id}`,
        date: rev.date,
        reference: rev.revenueNumber,
        type: 'Autre revenu',
        flowType: 'credit',
        category: rev.category,
        thirdParty: rev.clientName || 'Client divers',
        description: rev.description,
        amount: rev.amount,
        status: 'Encaissé',
        paymentMethod: rev.paymentMethod,
        sourceId: rev.id,
        sourceType: 'other_revenue',
        createdAt: rev.createdAt || rev.date,
      });
    });

    // 4. Payments
    payments.forEach((p) => {
      entries.push({
        id: `entry_payment_${p.id}`,
        date: p.date,
        reference: p.paymentNumber || p.id,
        type: 'Paiement reçu',
        flowType: 'credit',
        category: `Règlement ${p.referenceType === 'sale' ? 'Vente' : p.referenceType === 'rental' ? 'Location' : 'Direct'}`,
        thirdParty: p.clientName || 'Tiers',
        description: p.description || `Paiement ${p.referenceType}`,
        amount: p.amount,
        status: 'Encaissé',
        paymentMethod: p.paymentMethod,
        sourceId: p.id,
        sourceType: 'payment',
        createdAt: p.createdAt || p.date,
      });
    });

    // 5. Expenses
    expenses.forEach((exp) => {
      entries.push({
        id: `entry_exp_${exp.id}`,
        date: exp.date,
        reference: exp.expenseNumber,
        type: 'Dépense',
        flowType: 'debit',
        category: exp.category,
        thirdParty: exp.beneficiary || exp.category,
        description: exp.description + (exp.vehicleInfo ? ` [${exp.vehicleInfo}]` : ''),
        amount: exp.amount,
        status: 'Payé',
        paymentMethod: exp.paymentMethod,
        sourceId: exp.id,
        sourceType: 'expense',
        createdAt: exp.createdAt || exp.date,
      });
    });

    // Sort descending by date
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Settings & Storage Actions
  const updateSettings = (newSettings: Partial<AgencySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast({
      title: 'Paramètres enregistrés',
      message: 'Les réglages de votre agence ont été mis à jour.',
      type: 'success',
    });
  };

  const exportDataJSON = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      vehicles,
      clients,
      purchases,
      sales,
      rentals,
      payments,
      expenses,
      otherRevenues,
      reservations,
      maintenances,
      suppliers,
      prospects,
      settings,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sirius_auto_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      title: 'Sauvegarde exportée',
      message: 'Fichier JSON téléchargé avec succès.',
      type: 'success',
    });
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.vehicles)) setVehicles(data.vehicles);
      if (Array.isArray(data.clients)) setClients(data.clients);
      if (Array.isArray(data.purchases)) setPurchases(data.purchases);
      if (Array.isArray(data.sales)) setSales(data.sales);
      if (Array.isArray(data.rentals)) setRentals(data.rentals);
      if (Array.isArray(data.payments)) setPayments(data.payments);
      if (Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (Array.isArray(data.otherRevenues)) setOtherRevenues(data.otherRevenues);
      if (Array.isArray(data.reservations)) setReservations(data.reservations);
      if (Array.isArray(data.maintenances)) setMaintenances(data.maintenances);
      if (Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
      if (Array.isArray(data.prospects)) setProspects(data.prospects);
      if (data.settings && typeof data.settings === 'object') setSettings(data.settings);

      addToast({
        title: 'Données importées avec succès',
        message: 'Toutes les tables et configurations ont été restaurées.',
        type: 'success',
      });
      return true;
    } catch {
      addToast({
        title: 'Erreur d\'importation',
        message: 'Le fichier JSON sélectionné est invalide ou corrompu.',
        type: 'error',
      });
      return false;
    }
  };

  const resetAllData = () => {
    setVehicles([]);
    setClients([]);
    setPurchases([]);
    setSales([]);
    setRentals([]);
    setPayments([]);
    setExpenses([]);
    setOtherRevenues([]);
    setReservations([]);
    setMaintenances([]);
    setSuppliers([]);
    setProspects([]);
    setMessages([]);
    setNotifications([]);
    localStorage.removeItem(`${STORAGE_KEY}_vehicles`);
    localStorage.removeItem(`${STORAGE_KEY}_clients`);
    localStorage.removeItem(`${STORAGE_KEY}_purchases`);
    localStorage.removeItem(`${STORAGE_KEY}_sales`);
    localStorage.removeItem(`${STORAGE_KEY}_rentals`);
    localStorage.removeItem(`${STORAGE_KEY}_payments`);
    localStorage.removeItem(`${STORAGE_KEY}_expenses`);
    localStorage.removeItem(`${STORAGE_KEY}_other_revenues`);
    localStorage.removeItem(`${STORAGE_KEY}_reservations`);
    localStorage.removeItem(`${STORAGE_KEY}_maintenances`);
    localStorage.removeItem(`${STORAGE_KEY}_suppliers`);
    localStorage.removeItem(`${STORAGE_KEY}_prospects`);
    localStorage.removeItem(`${STORAGE_KEY}_messages`);
    localStorage.removeItem(`${STORAGE_KEY}_notifications`);

    addToast({
      title: 'Base de données réinitialisée',
      message: 'Toutes les données ont été remises à zéro (état vierge de production).',
      type: 'info',
    });
  };

  return (
    <CrmContext.Provider
      value={{
        vehicles,
        clients,
        purchases,
        sales,
        rentals,
        payments,
        expenses,
        otherRevenues,
        reservations,
        maintenances,
        suppliers,
        prospects,
        messages,
        templates,
        notifications,
        whatsAppConfig,
        settings,
        activeTab,
        setActiveTab,
        toasts,
        createPurchase,
        updatePurchase,
        deletePurchase,
        addExpense,
        updateExpense,
        deleteExpense,
        addOtherRevenue,
        updateOtherRevenue,
        deleteOtherRevenue,
        getAccountingJournal,
        aiConversations,
        currentConversationId,
        aiSettings,
        isAiDrawerOpen,
        aiInitialPrompt,
        openAiDrawer,
        closeAiDrawer,
        toggleAiDrawer,
        setAiInitialPrompt,
        sendAiMessage,
        createNewAiConversation,
        selectAiConversation,
        deleteAiConversation,
        archiveAiConversation,
        clearAiHistory,
        updateAiSettings,
        getLiveSmartInsights,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addClient,
        updateClient,
        deleteClient,
        addReservation,
        updateReservation,
        cancelReservation,
        deleteReservation,
        convertReservationToRental,
        convertReservationToSale,
        addMaintenance,
        updateMaintenance,
        completeMaintenance,
        cancelMaintenance,
        deleteMaintenance,
        getMaintenanceCostByVehicle,
        getMaintenanceAlerts,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        getSupplierStats,
        getSupplierInterventions,
        getSupplierExpenses,
        addProspect,
        updateProspect,
        deleteProspect,
        addProspectFollowUp,
        addProspectReminder,
        completeProspectReminder,
        convertProspectToClient,
        getCommercialDashboardStats,
        addSale,
        deleteSale,
        addRental,
        updateRental,
        updateRentalStatus,
        closeRentalVehicle,
        deleteRental,
        addPayment,
        updatePayment,
        updatePaymentStatus,
        deletePayment,
        refundDeposit,
        sendWhatsAppMessage,
        deleteWhatsAppMessage,
        resendWhatsAppMessage,
        updateMessageTemplate,
        resetMessageTemplates,
        updateWhatsAppSettings,
        addNotification,
        markNotificationAsRead,
        markNotificationAsUnread,
        markAllNotificationsAsRead,
        deleteNotification,
        clearReadNotifications,
        clearAllNotifications,
        updateSettings,
        exportDataJSON,
        importDataJSON,
        resetAllData,
        addToast,
        removeToast,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
