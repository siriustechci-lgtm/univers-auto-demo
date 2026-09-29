export type UserRole =
  | 'Directeur'
  | 'Gestionnaire'
  | 'Commercial'
  | 'Caissier'
  | 'Comptable'
  | 'Agent'
  | 'Administrateur';

export type CrmModule =
  | 'Tableau de bord'
  | 'Parc automobile'
  | 'Véhicules'
  | 'Clients'
  | 'Prospects'
  | 'Ventes'
  | 'Locations'
  | 'Réservations'
  | 'Paiements'
  | 'Factures'
  | 'Dépenses'
  | 'Revenus'
  | 'Maintenance'
  | 'Fournisseurs'
  | 'Rapports'
  | 'Notifications'
  | 'Paramètres'
  | 'Assistant IA';

export type PermissionAction = 'voir' | 'créer' | 'modifier' | 'supprimer' | 'exporter' | 'ajouter';

export type ModulePermission = {
  voir: boolean;
  créer: boolean;
  ajouter?: boolean;
  modifier: boolean;
  supprimer: boolean;
  exporter: boolean;
};

export type RolePermissionsMap = Record<string, Record<string, ModulePermission>>;

export type ActivityActionType =
  | 'Connexion'
  | 'Déconnexion'
  | 'Création'
  | 'Modification'
  | 'Suppression'
  | 'Changement de statut'
  | 'Statut'
  | 'Prolongation'
  | 'Clôture'
  | 'Annulation'
  | 'Remboursement'
  | 'Conversion'
  | 'Désactivation'
  | 'Réactivation'
  | 'Paiement'
  | 'Vente'
  | 'Location'
  | 'Autre';

export interface UserActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail?: string;
  actionType: ActivityActionType | string;
  module: string;
  targetItem: string;
  description: string;
  timestamp: string;
  operationId?: string;
  previousValue?: string;
  newValue?: string;
  details?: string;
}

export interface User {
  id: string;
  username?: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  role: UserRole;
  companyId: string;
  createdAt: string;
  lastLogin?: string;
  isActive?: boolean;
  isFirstLogin?: boolean;
  commissionRate?: number; // Pourcentage de commission sur les ventes (%)
  monthlySalesGoal?: number; // Objectif mensuel de ventes en FCFA
  fixedSalary?: number; // Salaire de base éventuel en FCFA
}

export interface CompanyProfile {
  id: string;
  name: string;
  logoUrl?: string;
  phone: string;
  whatsapp?: string;
  address: string;
  city: string;
  country: string;
  email: string;
  website?: string;
  currency: string;
  currencySymbol: string;
  language: string;
  timeZone: string;
  dateFormat: string;
  timeFormat?: string; // '24h' | '12h'
  rccm?: string; // Registre de Commerce et du Crédit Mobilier / SIRET
  taxNumber?: string; // Numéro d'Identification Fiscale (NIF / TVA)
  legalInfo?: string; // Autres mentions légales & statuts
  stampUrl?: string; // Cachet de l'entreprise
  signatureUrl?: string; // Signature du responsable
  onboardingCompleted: boolean;
}

export type AuthScreen = 'welcome' | 'setup' | 'login';

export type VehicleStatus = 'Disponible' | 'Réservé' | 'Vendu' | 'En préparation' | 'Loué' | 'En maintenance';

export type TransmissionType = 'Automatique' | 'Manuelle';

export type FuelType = 'Essence' | 'Diesel' | 'Hybride' | 'Électrique' | 'GPL' | 'Autre';

export type VehicleUsage = 'Achat/Vente' | 'Location' | 'Mixte';

export interface Vehicle {
  id: string;
  reference?: string; // Référence unique ex: UA-2024-001
  make: string;
  model: string;
  version?: string;
  year: number;
  registration: string; // Immatriculation
  vin?: string; // Numéro de châssis VIN
  mileage: number; // Kilométrage
  transmission: TransmissionType;
  fuelType: FuelType;
  usage?: VehicleUsage;
  condition?: 'Neuf' | 'Occasion'; // État neuf ou occasion
  supplier?: string; // Fournisseur / Provenance
  acquisitionDate?: string; // Date d'acquisition
  purchasePrice?: number; // Prix d'achat
  transitFee?: number; // Frais de transit
  customsFee?: number; // Frais de douane
  transportFee?: number; // Frais de transport
  repairFee?: number; // Frais de réparations
  otherFees?: number; // Autres charges
  totalCost?: number; // Coût total de revient calculé automatiquement
  sellingPrice?: number; // Prix de vente
  profitMargin?: number; // Marge bénéficiaire calculée automatiquement
  marginRate?: number; // Taux de marge (%)
  dailyRate?: number; // Prix par jour si location
  securityDeposit?: number; // Caution
  status: VehicleStatus; // Disponible, Réservé, Vendu, En préparation
  color?: string;
  photoUrl?: string; // Photo principale
  photos?: string[]; // Galerie de photos multiples
  category?: string; // Berline, SUV, Pick-up, etc.
  location?: string;
  notes?: string;
  insuranceExpiryDate?: string;
  technicalInspectionExpiryDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string; // e.g. ACH-2024-001
  date: string;
  vehicleId?: string;
  vehicleInfo: string;
  supplierName: string;
  invoiceNumber?: string;
  purchasePrice: number;
  customsFee: number;
  shippingFee: number;
  transportFee: number;
  preparationFee: number;
  otherCharges: number;
  totalCost: number;
  status: 'Commandé' | 'En transit' | 'En douane' | 'Arrivé / En parc' | 'Clôturé';
  paymentStatus: 'Payé' | 'Partiellement payé' | 'En attente';
  amountPaid: number;
  notes?: string;
  createdAt: string;
}

export type ClientType = 'particulier' | 'entreprise';
export type ClientStatus = 'Actif' | 'Inactif';

export interface Client {
  id: string;
  type: ClientType;
  firstName: string;
  lastName: string;
  fullName?: string;
  companyName?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  drivingLicenseNumber?: string;
  drivingLicenseIssueDate?: string;
  idCardNumber?: string;
  taxId?: string;
  status?: ClientStatus;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod =
  | 'Espèces'
  | 'Virement bancaire'
  | 'Chèque'
  | 'Carte bancaire'
  | 'Mobile Money'
  | 'Orange Money'
  | 'MTN Mobile Money'
  | 'Wave'
  | 'Paiement mixte'
  | 'Financement'
  | 'Autre';

export type PaymentStatus = 'Payé' | 'Partiellement payé' | 'Validé' | 'Partiel' | 'Brouillon' | 'En attente' | 'Annulé' | 'Remboursé';

export type SaleStatus = 'Brouillon' | 'Partiellement payé' | 'Payé' | 'Annulé';

export interface Sale {
  id: string;
  saleNumber: string;
  vehicleId: string;
  vehicleName: string;
  vehicleRegistration?: string;
  vehicleVin?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  sellerId?: string;
  sellerName?: string;
  saleDate: string;
  salePrice?: number;
  agreedPrice?: number;
  discount?: number;
  finalPrice?: number;
  deposit?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount?: number;
  paymentMethod: PaymentMethod | string;
  paymentStatus: PaymentStatus | string;
  status?: SaleStatus;
  amountPaid: number;
  balanceDue: number;
  commissionRate?: number;
  commissionAmount?: number;
  notes?: string;
  createdAt: string;
}

export type RentalStatus = 'Réservée' | 'En cours' | 'Terminée' | 'Annulée' | 'Clôturée';

export interface Rental {
  id: string;
  rentalNumber: string;
  vehicleId: string;
  vehicleName: string;
  vehicleRegistration: string;
  vehicleMake?: string;
  vehicleModel?: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientDrivingLicense?: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  dailyRate: number;
  totalAmount: number;
  depositAmount: number;
  depositReturned: boolean;
  depositStatus?: 'En caisse' | 'Remboursée' | 'Partiellement remboursée';
  depositRefundedAmount?: number;
  depositDeductionAmount?: number;
  depositDeductionReason?: string;
  depositRefundDate?: string;
  depositRefundMethod?: PaymentMethod;
  depositRefundNotes?: string;
  mileageDeparture: number;
  mileageReturn?: number;
  actualReturnDate?: string;
  conditionOnReturn?: 'Conforme' | 'Dommages constatés';
  damageNotes?: string;
  damageFee?: number;
  status: RentalStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  balanceDue?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  referenceType: 'sale' | 'rental' | 'deposit' | 'deposit_refund' | 'direct' | 'reservation';
  referenceId?: string;
  referenceTitle: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod | string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface NotificationSettings {
  systemNotifications: boolean;
  paymentNotifications: boolean;
  rentalNotifications: boolean;
  saleNotifications: boolean;
  channelApp: boolean;
  channelWhatsapp: boolean;
  channelEmail: boolean;
}

export interface WhatsAppMessage {
  id: string;
  timestamp: string; // ISO
  clientId: string;
  clientName: string;
  clientPhone: string;
  messageCategory: 'vente' | 'location' | 'paiement' | 'rappel' | 'general' | 'reservation';
  messageType: string; // e.g. 'confirmation_vente', 'facture_disponible', 'confirmation_location', 'contrat_disponible', 'rappel_retour', 'retour_retard', 'paiement_recu', 'solde_restant', 'rappel_paiement', 'bienvenue', 'remerciement', 'message_libre'
  content: string;
  referenceType?: 'sale' | 'rental' | 'payment' | 'invoice' | 'client' | 'reservation';
  referenceId?: string;
  referenceNumber?: string;
  documentType?: 'facture' | 'contrat' | 'recu';
  status: 'Envoyé' | 'En attente' | 'Échoué';
  sentBy?: string;
}

export interface MessageTemplate {
  id: string;
  code: string;
  title: string;
  category: 'vente' | 'location' | 'paiement' | 'rappel' | 'general';
  description: string;
  template: string;
  variables: string[];
  isDefault?: boolean;
}

export type NotificationPriority = 'Normal' | 'Important' | 'Urgent';

export type NotificationCategory =
  | 'Ventes'
  | 'Locations'
  | 'Paiements'
  | 'Véhicules'
  | 'Réservations'
  | 'Prospects'
  | 'Système'
  | 'Général';

export interface CrmNotification {
  id: string;
  category?: NotificationCategory;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority?: NotificationPriority;
  severity?: 'info' | 'success' | 'warning' | 'error';
  linkTab?: NavigationTab;
  referenceId?: string;
  referenceType?: 'sale' | 'rental' | 'payment' | 'vehicle' | 'reservation' | 'prospect' | 'maintenance' | 'client' | 'invoice';
  referenceNumber?: string;
  actionLabel?: string;
}

export interface WhatsAppSettings {
  whatsappEnabled: boolean;
  agencyWhatsAppNumber: string;
  defaultCountryCode: string;
  autoSendSaleInvoice: boolean;
  autoSendRentalContract: boolean;
  autoSendPaymentReceipt: boolean;
  autoSendReturnReminder: boolean;
  returnReminderHoursBefore: number;
  emailNotifications: boolean;
  internalNotifications: boolean;
}

export interface BackupLog {
  id: string;
  timestamp: string;
  sizeKb: number;
  itemCount: number;
  type: 'manual' | 'auto' | 'restoration';
  status: 'Succès' | 'Échoué';
}

export interface AgencySettings {
  companyName: string;
  legalStatus: string;
  siretOrTaxId: string;
  rccm?: string;
  taxNumber?: string;
  legalInfo?: string;
  address: string;
  city: string;
  country?: string;
  postalCode: string;
  phone: string;
  whatsapp?: string;
  email: string;
  website: string;
  currency: string;
  currencySymbol: string;
  language?: string;
  timeZone?: string;
  dateFormat?: string;
  timeFormat?: string; // '24h' | '12h'
  defaultVatRate: number;
  rentalTerms: string;
  invoiceFooter: string;
  invoicePrefix?: string;
  receiptPrefix?: string;
  autoNumbering?: boolean;
  taxEnabled?: boolean;
  notifications?: NotificationSettings;
  whatsAppConfig?: WhatsAppSettings;
  backupHistory?: BackupLog[];
  lastBackupDate?: string;
  bankDetails?: string;
  iban?: string;
  bic?: string;
}

export type InvoiceType = 'Vente' | 'Location' | 'Devis';
export type InvoiceStatus = 'En attente' | 'Partiellement payée' | 'Payée' | 'Annulée';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  referenceId: string; // saleId or rentalId
  date: string;
  dueDate?: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientCity?: string;
  vehicleId: string;
  vehicleName: string;
  vehicleRegistration: string;
  vehicleMake?: string;
  vehicleModel?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  depositAmount?: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod | string;
  notes?: string;
  createdAt: string;
}

export type NavigationTab = 
  | 'dashboard' 
  | 'vehicles' 
  | 'purchases'
  | 'sales'
  | 'reservations'
  | 'clients' 
  | 'invoices'
  | 'expenses'
  | 'reports'
  | 'employees'
  | 'settings'
  | 'prospects'
  | 'maintenance'
  | 'suppliers'
  | 'quick-sale' 
  | 'quick-rental' 
  | 'payments' 
  | 'accounting'
  | 'notifications'
  | 'whatsapp-notifications'
  | 'ai-assistant'
  | 'activity-log'
  | 'users';

export type ProspectNeedType = 'Achat' | 'Location' | 'Achat et location';

export type ProspectStatus = 'Nouveau' | 'En discussion' | 'Intéressé' | 'Gagné' | 'Perdu';

export type ProspectFollowUpType = 'Appel' | 'Message' | 'Note' | 'Rendez-vous' | 'Vente' | 'Location' | 'Relance';

export interface ProspectFollowUp {
  id: string;
  type: ProspectFollowUpType;
  date: string; // ISO string or YYYY-MM-DD
  time?: string;
  title: string;
  notes?: string;
  performedBy?: string;
  createdAt: string;
}

export interface ProspectReminder {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  reason: string; // Motif de la relance
  notes?: string;
  status: 'À faire' | 'Terminée' | 'Annulée';
  completedAt?: string;
  createdAt: string;
}

export interface Prospect {
  id: string;
  prospectNumber: string; // e.g. PROSP-2026-0001
  name: string; // Nom & Prénom / Entreprise
  phone: string;
  whatsapp?: string;
  email?: string;
  needType: ProspectNeedType; // Achat | Location | Achat et location
  searchedVehicle?: string; // Véhicule recherché
  budget?: number; // Budget indicatif
  expectedDate?: string; // Date prévue du besoin
  status: ProspectStatus; // Nouveau | En discussion | Intéressé | Gagné | Perdu
  notes?: string;
  
  // Suivi
  lastContactDate?: string;
  lastContactType?: ProspectFollowUpType;
  nextReminderDate?: string; // Prochaine relance
  nextReminderTime?: string;
  nextReminderReason?: string;
  
  // Relations CRM
  convertedToClientId?: string; // ID client si converti
  convertedToSaleId?: string; // ID vente si gagné via vente
  convertedToRentalId?: string; // ID location si gagné via location
  
  // Historique des interactions
  followUps?: ProspectFollowUp[];
  reminders?: ProspectReminder[];

  createdAt: string;
  updatedAt?: string;
}

export type SupplierCategory =
  | 'Garage'
  | 'Mécanicien'
  | 'Carrossier'
  | 'Assurance'
  | 'Assureur'
  | 'Pièces détachées'
  | 'Fournisseur de pièces'
  | 'Station-service'
  | 'Dépannage'
  | 'Dépannage / Remorquage'
  | 'Contrôle technique'
  | 'Lavage & Esthétique'
  | 'Prestataire divers'
  | 'Autre';

export type SupplierStatus = 'Actif' | 'Inactif' | 'Suspendu';

export interface Supplier {
  id: string;
  name: string; // Nom de l'entreprise / Raison sociale
  contactPerson?: string; // Interlocuteur / Chef d'atelier
  contactName?: string; // Responsable / Interlocuteur principal
  category: SupplierCategory;
  phone: string;
  secondaryPhone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  status: SupplierStatus;
  website?: string;
  rccm?: string; // RCCM / SIRET / N° registre
  taxNumber?: string; // Numéro fiscal / NIF / TVA
  bankDetails?: string; // RIB / IBAN / Mobile Money
  paymentTerms?: string; // Délais et conditions de règlement
  notes?: string; // Notes internes / Tarifs négociés
  createdAt: string;
  updatedAt?: string;
}

export type MaintenanceType =
  | 'Vidange'
  | 'Révision générale'
  | 'Réparation moteur'
  | 'Réparation carrosserie'
  | 'Pneumatiques'
  | 'Batterie'
  | 'Climatisation'
  | 'Freinage'
  | 'Visite technique'
  | 'Contrôle technique'
  | 'Assurance'
  | 'Diagnostic'
  | 'Autre';

export type MaintenanceStatus = 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';

export interface MaintenanceDocument {
  id: string;
  name: string;
  type: 'facture' | 'devis' | 'photo' | 'autre';
  url: string;
  size?: number;
  uploadedAt: string;
}

export interface MaintenanceIntervention {
  id: string;
  referenceNumber: string; // e.g. 'MAINT-2026-0001'
  date: string; // Date de l'intervention ou date programmée
  dueDate?: string; // Date d'échéance / fin prévue (optionnelle)
  vehicleId: string;
  vehicleName: string; // Marque + Modèle + Année
  vehicleRegistration: string;
  type: MaintenanceType;
  description: string;
  supplierId?: string; // ID du fournisseur associé
  supplier: string; // Fournisseur / Garage / Prestataire
  supplierPhone?: string;
  amount: number; // Montant de l'intervention
  status: MaintenanceStatus;
  mileageAtIntervention?: number;
  nextScheduledDate?: string; // Prochaine échéance recommandée
  nextScheduledMileage?: number; // Prochain kilométrage
  documents?: MaintenanceDocument[];
  invoiceUrl?: string;
  quoteUrl?: string;
  photos?: string[];
  notes?: string;
  expenseId?: string; // Auto-linked to Expense module
  completedAt?: string;
  recordedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ReservationStatus =
  | 'Réservée'
  | 'Confirmée'
  | 'Convertie en location'
  | 'Convertie en vente'
  | 'Annulée'
  | 'Expirée';

export interface Reservation {
  id: string;
  reservationNumber: string;
  date: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  vehicleId: string;
  vehicleName: string; // Marque + Modèle + Année
  vehicleRegistration: string;
  startDate: string;
  endDate: string;
  depositAmount?: number;
  depositPaymentMethod?: PaymentMethod | string;
  notes?: string;
  status: ReservationStatus;
  convertedToType?: 'location' | 'vente';
  convertedId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ExpenseCategory =
  | 'Carburant'
  | 'Entretien'
  | 'Réparation'
  | 'Assurance'
  | 'Salaires'
  | 'Loyer'
  | 'Électricité'
  | 'Eau'
  | 'Internet'
  | 'Marketing'
  | 'Fournitures'
  | 'Taxes'
  | 'Autres'
  | 'Maintenance'
  | 'Autres dépenses';

export interface ExpenseDocument {
  id: string;
  name: string;
  type: 'facture' | 'justificatif' | 'photo' | 'autre';
  url: string;
  size?: number;
  uploadedAt: string;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod | string;
  supplierId?: string; // ID du fournisseur associé
  supplier?: string; // Fournisseur / Prestataire / Salarié
  beneficiary?: string; // Fournisseur / Prestataire / Salarié
  receiptUrl?: string; // Pièce justificative (Nom ou URL)
  documents?: ExpenseDocument[];
  vehicleId?: string; // Véhicule rattaché (optionnel)
  vehicleInfo?: string;
  notes?: string;
  recordedBy?: string;
  createdAt: string;
}

export type OtherRevenueCategory =
  | 'Prestation'
  | 'Vente accessoire'
  | 'Frais de dossier'
  | 'Commission'
  | 'Pénalité/Frais retard'
  | 'Autre revenu';

export interface OtherRevenue {
  id: string;
  revenueNumber: string;
  date: string;
  category: OtherRevenueCategory;
  amount: number;
  clientId?: string;
  clientName?: string;
  description: string;
  paymentMethod: PaymentMethod | string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

export type AccountingOperationType =
  | 'Vente véhicule'
  | 'Location véhicule'
  | 'Paiement reçu'
  | 'Autre revenu'
  | 'Dépense';

export interface AccountingEntry {
  id: string;
  date: string;
  time?: string;
  reference: string;
  type: AccountingOperationType;
  flowType: 'credit' | 'debit';
  category: string;
  thirdParty: string;
  description: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  sourceId?: string;
  sourceType: 'sale' | 'rental' | 'payment' | 'expense' | 'other_revenue';
  createdAt: string;
}

export type AccountingPeriodFilter = 'today' | 'week' | 'month' | 'year' | 'custom' | 'all';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export type AiTone = 'professionnel' | 'concis' | 'détaillé' | 'analytique';
export type AiDetailLevel = 'synthétique' | 'standard' | 'approfondi';
export type AiLanguage = 'fr' | 'en' | 'ar';

export interface AiSettings {
  language: AiLanguage;
  tone: AiTone;
  detailLevel: AiDetailLevel;
  autoSuggestions: boolean;
  includeAlertsInSummaries: boolean;
}

export interface AiStatCard {
  label: string;
  value: string;
  hint?: string;
  type?: 'positive' | 'negative' | 'neutral' | 'warning';
}

export interface AiTableData {
  headers: string[];
  rows: (string | number)[][];
}

export interface AiActionLink {
  label: string;
  tab: NavigationTab;
  filter?: string;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  category?: 'ventes' | 'locations' | 'clients' | 'paiements' | 'vehicules' | 'resume' | 'alertes' | 'general';
  statsCards?: AiStatCard[];
  tableData?: AiTableData;
  actionLinks?: AiActionLink[];
  summaryType?: 'day' | 'week' | 'month';
}

export interface AiConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AiMessage[];
  isArchived?: boolean;
}

export interface AiSmartInsight {
  id: string;
  category: 'activite' | 'alertes' | 'opportunites' | 'resumes';
  title: string;
  description: string;
  prompt: string;
  badgeText?: string;
  badgeColor?: 'green' | 'amber' | 'red' | 'blue' | 'purple';
}

