/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CrmProvider, useCrm } from './context/CrmContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { DashboardView } from './components/DashboardView';
import { VehiclesView } from './components/VehiclesView';
import { FleetView } from './components/fleet/FleetView';
import { SalesView } from './components/SalesView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { RentalsView } from './components/RentalsView';
import { ClientsView } from './components/ClientsView';
import { PaymentsView } from './components/PaymentsView';
import { InvoicesView } from './components/InvoicesView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { WhatsAppNotificationsView } from './components/WhatsAppNotificationsView';
import { AiAssistantView } from './components/ai/AiAssistantView';
import { AiFloatingButton } from './components/ai/AiFloatingButton';
import { AiDrawerPanel } from './components/ai/AiDrawerPanel';
import { AccountingView } from './components/accounting/AccountingView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReservationsView } from './components/reservations/ReservationsView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { ProspectsView } from './components/crm/ProspectsView';
import { UsersView } from './components/users/UsersView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ActivityLogView } from './components/activity/ActivityLogView';
import { ShieldAlert } from 'lucide-react';

import { VehicleModal } from './components/VehicleModal';
import { ClientModal } from './components/ClientModal';
import { ClientDetailModal } from './components/ClientDetailModal';
import { SaleModal } from './components/SaleModal';
import { RentalModal } from './components/RentalModal';
import { CloseRentalModal } from './components/CloseRentalModal';
import { PaymentModal } from './components/PaymentModal';
import { PaymentDetailModal } from './components/PaymentDetailModal';
import { RefundDepositModal } from './components/RefundDepositModal';
import { DocumentModal } from './components/DocumentModal';
import { SaleDetailModal } from './components/SaleDetailModal';
import { RentalDetailModal } from './components/RentalDetailModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';

import { LoginView } from './components/auth/LoginView';
import { WelcomeView } from './components/auth/WelcomeView';
import { InitialSetupView } from './components/auth/InitialSetupView';
import { OnboardingWizardModal } from './components/auth/OnboardingWizardModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { FirstLoginModal } from './components/auth/FirstLoginModal';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { PlusNavigationModal } from './components/navigation/PlusNavigationModal';

import { Vehicle, Client, Sale, Rental, Payment, Invoice } from './types';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, vehicles } = useCrm();
  const { hasPermission } = useAuth();

  // Mobile drawer state
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Global search modal state & keyboard shortcut (Ctrl+K / Cmd+K)
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fallback to dashboard if active tab is not permitted for current user's role
  useEffect(() => {
    if (!hasPermission(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, hasPermission, setActiveTab]);

  // Modals state
  const [isPlusModalOpen, setIsPlusModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [preselectedSaleVehicleId, setPreselectedSaleVehicleId] = useState<string | undefined>(undefined);
  const [preselectedSaleClientId, setPreselectedSaleClientId] = useState<string | undefined>(undefined);

  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [preselectedRentalVehicleId, setPreselectedRentalVehicleId] = useState<string | undefined>(undefined);
  const [preselectedRentalClientId, setPreselectedRentalClientId] = useState<string | undefined>(undefined);

  const [isCloseRentalModalOpen, setIsCloseRentalModalOpen] = useState(false);
  const [rentalToClose, setRentalToClose] = useState<Rental | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preselectedPaymentClientId, setPreselectedPaymentClientId] = useState<string | undefined>(undefined);
  const [preselectedPaymentRefType, setPreselectedPaymentRefType] = useState<'sale' | 'rental' | 'direct' | undefined>(undefined);
  const [preselectedPaymentRefId, setPreselectedPaymentRefId] = useState<string | undefined>(undefined);

  const [isPaymentDetailModalOpen, setIsPaymentDetailModalOpen] = useState(false);
  const [paymentDetailToView, setPaymentDetailToView] = useState<Payment | null>(null);

  const [isRefundDepositModalOpen, setIsRefundDepositModalOpen] = useState(false);
  const [rentalToRefundDeposit, setRentalToRefundDeposit] = useState<Rental | null>(null);

  // Detail modals
  const [isSaleDetailModalOpen, setIsSaleDetailModalOpen] = useState(false);
  const [saleDetailToView, setSaleDetailToView] = useState<Sale | null>(null);

  const [isRentalDetailModalOpen, setIsRentalDetailModalOpen] = useState(false);
  const [rentalDetailToView, setRentalDetailToView] = useState<Rental | null>(null);

  const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false);
  const [clientDetailToView, setClientDetailToView] = useState<Client | null>(null);

  const [isInvoiceDetailModalOpen, setIsInvoiceDetailModalOpen] = useState(false);
  const [invoiceDetailToView, setInvoiceDetailToView] = useState<Invoice | null>(null);

  // Document preview modal
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docType, setDocType] = useState<'sale' | 'sale_receipt' | 'rental' | 'rental_invoice' | 'rental_receipt' | 'payment'>('sale');
  const [docSale, setDocSale] = useState<Sale | null>(null);
  const [docRental, setDocRental] = useState<Rental | null>(null);
  const [docPayment, setDocPayment] = useState<Payment | null>(null);

  // Open Handlers
  const handleOpenVehicleModal = (vehicle?: Vehicle | null) => {
    setVehicleToEdit(vehicle || null);
    setIsVehicleModalOpen(true);
  };

  const handleOpenClientModal = (client?: Client | null) => {
    setClientToEdit(client || null);
    setIsClientModalOpen(true);
  };

  const handleOpenClientDetail = (client: Client) => {
    setClientDetailToView(client);
    setIsClientDetailModalOpen(true);
  };

  const handleOpenInvoiceDetail = (invoice: Invoice) => {
    setInvoiceDetailToView(invoice);
    setIsInvoiceDetailModalOpen(true);
  };

  const handleOpenSaleModal = (preselectedVehId?: string, preselectedCliId?: string) => {
    setPreselectedSaleVehicleId(preselectedVehId);
    setPreselectedSaleClientId(preselectedCliId);
    setIsSaleModalOpen(true);
  };

  const handleOpenRentalModal = (preselectedVehId?: string, preselectedCliId?: string) => {
    setPreselectedRentalVehicleId(preselectedVehId);
    setPreselectedRentalClientId(preselectedCliId);
    setIsRentalModalOpen(true);
  };

  const handleOpenPaymentModal = (
    preselectedCliId?: string,
    refType?: 'sale' | 'rental' | 'direct',
    refId?: string
  ) => {
    setPreselectedPaymentClientId(preselectedCliId);
    setPreselectedPaymentRefType(refType);
    setPreselectedPaymentRefId(refId);
    setIsPaymentModalOpen(true);
  };

  const handleOpenPaymentDetail = (payment: Payment) => {
    setPaymentDetailToView(payment);
    setIsPaymentDetailModalOpen(true);
  };

  const handleOpenRefundDeposit = (rental: Rental) => {
    setRentalToRefundDeposit(rental);
    setIsRefundDepositModalOpen(true);
  };

  const handleCloseRental = (rental: Rental) => {
    setRentalToClose(rental);
    setIsCloseRentalModalOpen(true);
  };

  const handleViewInvoice = (sale: Sale) => {
    setDocType('sale');
    setDocSale(sale);
    setDocRental(null);
    setDocPayment(null);
    setIsDocModalOpen(true);
  };

  const handleViewReceipt = (sale: Sale) => {
    setDocType('sale_receipt');
    setDocSale(sale);
    setDocRental(null);
    setDocPayment(null);
    setIsDocModalOpen(true);
  };

  const handleViewSaleDetail = (sale: Sale) => {
    setSaleDetailToView(sale);
    setIsSaleDetailModalOpen(true);
  };

  const handleViewRentalDetail = (rental: Rental) => {
    setRentalDetailToView(rental);
    setIsRentalDetailModalOpen(true);
  };

  const handleViewRentalContract = (rental: Rental) => {
    setDocType('rental');
    setDocRental(rental);
    setDocSale(null);
    setDocPayment(null);
    setIsDocModalOpen(true);
  };

  const handleViewRentalInvoice = (rental: Rental) => {
    setDocType('rental_invoice');
    setDocRental(rental);
    setDocSale(null);
    setDocPayment(null);
    setIsDocModalOpen(true);
  };

  const handleViewRentalReceipt = (rental: Rental) => {
    setDocType('rental_receipt');
    setDocRental(rental);
    setDocSale(null);
    setDocPayment(null);
    setIsDocModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        onOpenPlusModal={() => setIsPlusModalOpen(true)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onOpenVehicleModal={() => handleOpenVehicleModal(null)}
          onOpenClientModal={() => handleOpenClientModal(null)}
          onOpenSaleModal={() => handleOpenSaleModal()}
          onOpenRentalModal={() => handleOpenRentalModal()}
          onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && hasPermission('dashboard') && (
            <DashboardView
              onOpenVehicleModal={() => handleOpenVehicleModal(null)}
              onOpenClientModal={() => handleOpenClientModal(null)}
              onOpenSaleModal={() => handleOpenSaleModal()}
              onOpenRentalModal={() => handleOpenRentalModal()}
              onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            />
          )}

          {activeTab === 'vehicles' && hasPermission('vehicles') && (
            <VehiclesView
              onOpenVehicleModal={handleOpenVehicleModal}
              onQuickSale={(vehId) => handleOpenSaleModal(vehId)}
              onQuickReservation={(vehId) => {
                setActiveTab('reservations');
              }}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchasesView />
          )}

          {activeTab === 'reservations' && hasPermission('reservations') && (
            <ReservationsView />
          )}

          {activeTab === 'maintenance' && hasPermission('maintenance') && (
            <MaintenanceView />
          )}

          {activeTab === 'suppliers' && hasPermission('suppliers') && (
            <SuppliersView />
          )}

          {(activeTab === 'sales' || activeTab === 'quick-sale') && (
            <SalesView
              onOpenSaleModal={() => handleOpenSaleModal()}
              onViewInvoice={handleViewInvoice}
              onViewReceipt={handleViewReceipt}
              onViewDetail={handleViewSaleDetail}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'quick-rental' && hasPermission('quick-rental') && (
            <RentalsView
              onOpenRentalModal={() => handleOpenRentalModal()}
              onViewRental={handleViewRentalDetail}
              onCloseRental={handleCloseRental}
              onGenerateContract={handleViewRentalContract}
              onGenerateInvoice={handleViewRentalInvoice}
              onGenerateReceipt={handleViewRentalReceipt}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'prospects' && hasPermission('prospects') && (
            <ProspectsView
              onNewSale={(cliId) => handleOpenSaleModal(undefined, cliId)}
              onNewRental={(cliId) => handleOpenRentalModal(undefined, cliId)}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'invoices' && hasPermission('invoices') && (
            <InvoicesView
              onOpenSaleModal={() => handleOpenSaleModal()}
              onOpenRentalModal={() => handleOpenRentalModal()}
              onOpenPaymentModal={(saleId, rentalId, clientName, amount) => {
                const refType = saleId ? 'sale' : rentalId ? 'rental' : 'direct';
                const refId = saleId || rentalId || undefined;
                handleOpenPaymentModal(undefined, refType, refId);
              }}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'clients' && hasPermission('clients') && (
            <ClientsView
              onOpenClientModal={handleOpenClientModal}
              onOpenClientDetail={handleOpenClientDetail}
              onNewSale={(cliId) => handleOpenSaleModal(undefined, cliId)}
              onNewRental={(cliId) => handleOpenRentalModal(undefined, cliId)}
              onNewPayment={(cliId) => handleOpenPaymentModal(cliId)}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'payments' && hasPermission('payments') && (
            <PaymentsView
              onOpenPaymentModal={handleOpenPaymentModal}
              onOpenPaymentDetail={handleOpenPaymentDetail}
              onOpenRefundDeposit={handleOpenRefundDeposit}
              onViewDocument={(type, data) => {
                setDocType(type);
                setDocSale(data.saleData || null);
                setDocRental(data.rentalData || null);
                setDocPayment(data.paymentData || null);
                setIsDocModalOpen(true);
              }}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'reports' && hasPermission('reports') && (
            <ReportsView
              onOpenSaleModal={() => handleOpenSaleModal()}
              onOpenRentalModal={() => handleOpenRentalModal()}
              onOpenVehicleModal={() => handleOpenVehicleModal(null)}
              onOpenClientModal={() => handleOpenClientModal(null)}
              onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
              onViewDocument={(type, data) => {
                setDocType(type);
                setDocSale(data.saleData || null);
                setDocRental(data.rentalData || null);
                setDocPayment(data.paymentData || null);
                setIsDocModalOpen(true);
              }}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'notifications' && hasPermission('notifications') && (
            <NotificationsView
              onOpenSaleDetail={handleViewSaleDetail}
              onOpenRentalDetail={handleViewRentalDetail}
              onCloseRental={handleCloseRental}
              onOpenPaymentDetail={handleOpenPaymentDetail}
              onOpenVehicleDetail={(vId) => {
                const veh = vehicles.find((v) => v.id === vId);
                if (veh) handleOpenVehicleModal(veh);
              }}
              onOpenClientDetail={handleOpenClientDetail}
            />
          )}

          {activeTab === 'whatsapp-notifications' && hasPermission('whatsapp-notifications') && (
            <WhatsAppNotificationsView />
          )}

          {activeTab === 'ai-assistant' && hasPermission('ai-assistant') && (
            <AiAssistantView />
          )}

          {activeTab === 'expenses' && hasPermission('expenses') && (
            <ExpensesView searchQuery={searchQuery} />
          )}

          {activeTab === 'accounting' && hasPermission('accounting') && (
            <AccountingView searchQuery={searchQuery} />
          )}

          {activeTab === 'users' && hasPermission('users') && <UsersView />}

          {activeTab === 'activity-log' && hasPermission('activity-log') && (
            <ActivityLogView searchQuery={searchQuery} />
          )}

          {activeTab === 'settings' && hasPermission('settings') && <SettingsView />}

          {/* Unauthorized access message fallback */}
          {!hasPermission(activeTab) && (
            <div className="bg-white rounded-3xl border border-[#E5E5DF] p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs space-y-4 my-8">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-[#1A1A18] font-['Outfit']">
                  Accès restreint
                </h2>
                <p className="text-xs sm:text-sm text-[#7A7A72] leading-relaxed">
                  Vous n'avez pas l'autorisation d'accéder à cette fonctionnalité.
                </p>
              </div>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  Retourner au Tableau de bord
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        vehicleToEdit={vehicleToEdit}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clientToEdit={clientToEdit}
      />

      <ClientDetailModal
        isOpen={isClientDetailModalOpen}
        onClose={() => setIsClientDetailModalOpen(false)}
        client={clientDetailToView}
        onEdit={(cli) => {
          setIsClientDetailModalOpen(false);
          handleOpenClientModal(cli);
        }}
        onNewSale={(cliId) => {
          setIsClientDetailModalOpen(false);
          handleOpenSaleModal(undefined, cliId);
        }}
        onNewRental={(cliId) => {
          setIsClientDetailModalOpen(false);
          handleOpenRentalModal(undefined, cliId);
        }}
        onNewPayment={(cliId) => {
          setIsClientDetailModalOpen(false);
          handleOpenPaymentModal(cliId);
        }}
        onViewDocument={(type, data) => {
          setDocType(type);
          setDocSale(data.saleData || null);
          setDocRental(data.rentalData || null);
          setDocPayment(data.paymentData || null);
          setIsDocModalOpen(true);
        }}
      />

      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setPreselectedSaleClientId(undefined);
          setPreselectedSaleVehicleId(undefined);
        }}
        preselectedVehicleId={preselectedSaleVehicleId}
        preselectedClientId={preselectedSaleClientId}
        onOpenNewClientModal={() => {
          setIsSaleModalOpen(false);
          handleOpenClientModal(null);
        }}
      />

      <RentalModal
        isOpen={isRentalModalOpen}
        onClose={() => {
          setIsRentalModalOpen(false);
          setPreselectedRentalClientId(undefined);
          setPreselectedRentalVehicleId(undefined);
        }}
        preselectedVehicleId={preselectedRentalVehicleId}
        preselectedClientId={preselectedRentalClientId}
        onOpenNewClientModal={() => {
          setIsRentalModalOpen(false);
          handleOpenClientModal(null);
        }}
      />

      <CloseRentalModal
        isOpen={isCloseRentalModalOpen}
        onClose={() => setIsCloseRentalModalOpen(false)}
        rental={rentalToClose}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPreselectedPaymentClientId(undefined);
          setPreselectedPaymentRefType(undefined);
          setPreselectedPaymentRefId(undefined);
        }}
        preselectedClientId={preselectedPaymentClientId}
        preselectedReferenceType={preselectedPaymentRefType}
        preselectedReferenceId={preselectedPaymentRefId}
      />

      <PaymentDetailModal
        isOpen={isPaymentDetailModalOpen}
        onClose={() => {
          setIsPaymentDetailModalOpen(false);
          setPaymentDetailToView(null);
        }}
        payment={paymentDetailToView}
        onViewDocument={(type, data) => {
          setDocType(type as any);
          setDocSale(data.saleData || null);
          setDocRental(data.rentalData || null);
          setDocPayment(data.paymentData || null);
          setIsDocModalOpen(true);
        }}
      />

      <RefundDepositModal
        isOpen={isRefundDepositModalOpen}
        onClose={() => {
          setIsRefundDepositModalOpen(false);
          setRentalToRefundDeposit(null);
        }}
        rental={rentalToRefundDeposit}
      />

      <DocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        documentType={docType}
        saleData={docSale}
        rentalData={docRental}
        paymentData={docPayment}
      />

      <SaleDetailModal
        isOpen={isSaleDetailModalOpen}
        onClose={() => setIsSaleDetailModalOpen(false)}
        sale={saleDetailToView}
        onOpenInvoice={(sale) => {
          setIsSaleDetailModalOpen(false);
          handleViewInvoice(sale);
        }}
        onOpenReceipt={(sale) => {
          setIsSaleDetailModalOpen(false);
          handleViewReceipt(sale);
        }}
      />

      <RentalDetailModal
        isOpen={isRentalDetailModalOpen}
        onClose={() => setIsRentalDetailModalOpen(false)}
        rental={rentalDetailToView}
        onOpenCloseRental={(rental) => {
          setIsRentalDetailModalOpen(false);
          handleCloseRental(rental);
        }}
        onGenerateContract={(rental) => {
          setIsRentalDetailModalOpen(false);
          handleViewRentalContract(rental);
        }}
        onGenerateInvoice={(rental) => {
          setIsRentalDetailModalOpen(false);
          handleViewRentalInvoice(rental);
        }}
        onGenerateReceipt={(rental) => {
          setIsRentalDetailModalOpen(false);
          handleViewRentalReceipt(rental);
        }}
      />

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={isInvoiceDetailModalOpen}
        onClose={() => setIsInvoiceDetailModalOpen(false)}
        invoice={invoiceDetailToView}
        onOpenPaymentModal={(saleId, rentalId, clientName, amount) => {
          setIsInvoiceDetailModalOpen(false);
          handleOpenPaymentModal(undefined, saleId ? 'sale' : rentalId ? 'rental' : undefined, saleId || rentalId);
        }}
      />

      {/* Global Search & Command Palette Modal (Ctrl+K / Cmd+K) */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectClient={(client) => handleOpenClientDetail(client)}
        onSelectVehicle={(vehicle) => {
          handleOpenVehicleModal(vehicle);
          setActiveTab('vehicles');
        }}
        onSelectSale={(sale) => handleViewSaleDetail(sale)}
        onSelectRental={(rental) => handleViewRentalDetail(rental)}
        onSelectReservation={(reservation) => {
          setActiveTab('reservations');
        }}
        onSelectPayment={(payment) => handleOpenPaymentDetail(payment)}
        onSelectInvoice={(invoice) => handleOpenInvoiceDetail(invoice)}
        onSelectContract={(rental) => handleViewRentalContract(rental)}
        onSelectProspect={(prospect) => {
          setActiveTab('prospects');
        }}
      />

      {/* Auth Modals */}
      <FirstLoginModal />
      <OnboardingWizardModal />
      <UserProfileModal />

      {/* Plus Navigation Panel Modal (Mobile & Universal) */}
      <PlusNavigationModal
        isOpen={isPlusModalOpen}
        onClose={() => setIsPlusModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenPlusModal={() => setIsPlusModalOpen(true)} />

      {/* Adaptive Floating AI Assistant Button & Drawer */}
      <AiFloatingButton />
      <AiDrawerPanel />

      {/* Real-time Toasts */}
      <ToastContainer />
    </div>
  );
};

const AuthRouter: React.FC = () => {
  const { isConfigured, isAuthenticated, activeAuthScreen, setActiveAuthScreen } = useAuth();

  // 1. Authenticated session: Display main CRM workspace
  if (isAuthenticated) {
    return <MainAppContent />;
  }

  // 2. Unauthenticated: If system is not configured yet (no users/director)
  if (!isConfigured) {
    if (activeAuthScreen === 'setup') {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
          <InitialSetupView onBackToWelcome={() => setActiveAuthScreen('welcome')} />
          <ToastContainer />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        <WelcomeView onStart={() => setActiveAuthScreen('setup')} />
        <ToastContainer />
      </div>
    );
  }

  // 3. System configured: LoginView only (no register, no public routes)
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <LoginView />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CrmProvider>
        <AuthRouter />
      </CrmProvider>
    </AuthProvider>
  );
}
