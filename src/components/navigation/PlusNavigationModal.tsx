import React, { useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { useAuth } from '../../context/AuthContext';
import { NavigationTab } from '../../types';
import {
  CalendarClock,
  Target,
  Wrench,
  Building2,
  FileText,
  Receipt,
  Calculator,
  BarChart3,
  ShieldCheck,
  Settings,
  Bell,
  MessageSquare,
  History,
  X,
  ChevronRight,
  Sparkles,
  Users,
  CreditCard,
  Car,
  BadgePercent,
  KeyRound,
  LayoutDashboard,
} from 'lucide-react';

interface PlusNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlusNavigationModal: React.FC<PlusNavigationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeTab,
    setActiveTab,
    reservations,
    maintenances,
    suppliers,
    prospects,
    sales,
    rentals,
    expenses,
    payments,
    clients,
    vehicles,
    notifications,
    messages,
  } = useCrm();

  const { currentUser, users, hasPermission } = useAuth();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalInvoicesCount = sales.length + rentals.length;
  const activeReservationsCount = reservations.filter(
    (r) => r.status === 'Réservée' || r.status === 'Confirmée'
  ).length;
  const activeMaintenancesCount = maintenances.filter(
    (m) => m.status === 'En cours'
  ).length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;
  const activeProspectsCount = prospects.filter(
    (p) => p.status !== 'Gagné' && p.status !== 'Perdu'
  ).length;

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    onClose();
  };

  interface MenuItem {
    id: NavigationTab;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: number;
    highlight?: boolean;
  }

  const operationsItems: MenuItem[] = [
    {
      id: 'reservations',
      label: 'Réservations',
      description: 'Calendrier & plannings de réservation',
      icon: <CalendarClock className="w-5 h-5 text-[#5A5A40]" />,
      badge: activeReservationsCount > 0 ? activeReservationsCount : undefined,
    },
    {
      id: 'prospects',
      label: 'CRM & Prospects',
      description: 'Pipeline commercial & relances',
      icon: <Target className="w-5 h-5 text-emerald-600" />,
      badge: activeProspectsCount > 0 ? activeProspectsCount : undefined,
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      description: 'Entretiens, contrôles techniques & pannes',
      icon: <Wrench className="w-5 h-5 text-amber-600" />,
      badge: activeMaintenancesCount > 0 ? activeMaintenancesCount : undefined,
      highlight: activeMaintenancesCount > 0,
    },
    {
      id: 'suppliers',
      label: 'Fournisseurs',
      description: 'Garages, assureurs, pièces détachées',
      icon: <Building2 className="w-5 h-5 text-sky-600" />,
      badge: suppliers.length > 0 ? suppliers.length : undefined,
    },
  ];

  const financesItems: MenuItem[] = [
    {
      id: 'invoices',
      label: 'Factures',
      description: 'Factures de vente & location',
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      badge: totalInvoicesCount > 0 ? totalInvoicesCount : undefined,
    },
    {
      id: 'expenses',
      label: 'Dépenses',
      description: 'Charges, carburant, réparations',
      icon: <Receipt className="w-5 h-5 text-rose-600" />,
      badge: expenses.length > 0 ? expenses.length : undefined,
    },
    {
      id: 'accounting',
      label: 'Comptabilité',
      description: 'Bilan financier, TVA & trésorerie',
      icon: <Calculator className="w-5 h-5 text-emerald-700" />,
    },
    {
      id: 'reports',
      label: 'Rapports',
      description: 'Analyses de rentabilité & exports',
      icon: <BarChart3 className="w-5 h-5 text-[#5A5A40]" />,
    },
  ];

  const adminItems: MenuItem[] = [
    {
      id: 'users',
      label: 'Utilisateurs',
      description: 'Comptes, rôles & permissions',
      icon: <ShieldCheck className="w-5 h-5 text-[#5A5A40]" />,
      badge: users.length > 0 ? users.length : undefined,
    },
    {
      id: 'settings',
      label: 'Paramètres',
      description: 'Configuration agence & devises',
      icon: <Settings className="w-5 h-5 text-[#7A7A72]" />,
    },
    {
      id: 'whatsapp-notifications',
      label: 'WhatsApp & Alertes',
      description: 'Envois automatiques & modèles',
      icon: <MessageSquare className="w-5 h-5 text-[#25D366]" />,
      badge: messages.length > 0 ? messages.length : undefined,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Historique des alertes',
      icon: <Bell className="w-5 h-5 text-amber-500" />,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
      highlight: unreadNotifsCount > 0,
    },
    {
      id: 'activity-log',
      label: "Journal d'activité",
      description: 'Audit des actions utilisateurs',
      icon: <History className="w-5 h-5 text-[#7A7A72]" />,
    },
  ];

  // Also include shortcuts for clients & payments if on mobile
  const coreShortcuts: MenuItem[] = [
    {
      id: 'clients',
      label: 'Clients',
      description: 'Répertoire et fiches clients',
      icon: <Users className="w-5 h-5 text-[#B87320]" />,
      badge: clients.length > 0 ? clients.length : undefined,
    },
    {
      id: 'payments',
      label: 'Paiements',
      description: 'Encaissements & cautions',
      icon: <CreditCard className="w-5 h-5 text-[#7A5A82]" />,
      badge: payments.length > 0 ? payments.length : undefined,
    },
  ];

  const filterPermitted = (items: MenuItem[]) =>
    items.filter((item) => hasPermission(item.id));

  const permittedOperations = filterPermitted(operationsItems);
  const permittedFinances = filterPermitted(financesItems);
  const permittedAdmin = filterPermitted(adminItems);
  const permittedCoreShortcuts = filterPermitted(coreShortcuts);

  return (
    <div
      id="plus-navigation-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="plus-navigation-modal-panel"
        className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl border border-[#E5E5DF] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E5DF] bg-[#FAFAF8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1A18] font-['Outfit'] uppercase tracking-wider">
                Modules complémentaires
              </h3>
              <p className="text-xs text-[#7A7A72]">
                Accès direct aux fonctionnalités secondaires de Sirius Auto
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EAEAE5] transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Mobile shortcuts for Clients & Payments */}
          <div className="sm:hidden">
            <h4 className="text-[11px] font-bold text-[#7A7A72] uppercase tracking-wider mb-2.5 px-1">
              Accès rapide
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {permittedCoreShortcuts.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                        : 'bg-white border-[#E5E5DF] hover:bg-[#FAFAF8] text-[#1A1A18]'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isActive ? 'bg-white/15 text-white' : 'bg-[#FAFAF8]'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">{item.label}</div>
                      {item.badge !== undefined && (
                        <span
                          className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-full mt-0.5 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-[#EAEAE5] text-[#5A5A40]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 1: Opérations & Flotte */}
          {permittedOperations.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-[#7A7A72] uppercase tracking-wider mb-2.5 px-1 flex items-center gap-1.5">
                <span>Opérations & Flotte</span>
                <span className="text-[10px] font-normal text-[#9A9A92]">
                  ({permittedOperations.length})
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {permittedOperations.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm'
                          : 'bg-white border-[#E5E5DF] hover:border-[#5A5A40]/40 hover:bg-[#FAFAF8]'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-[#FAFAF8] group-hover:scale-105 transition-transform'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-bold ${
                              isActive ? 'text-white' : 'text-[#1A1A18]'
                            }`}
                          >
                            {item.label}
                          </span>
                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : item.highlight
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-[#EAEAE5] text-[#5A5A40]'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] line-clamp-1 mt-0.5 ${
                            isActive ? 'text-white/80' : 'text-[#7A7A72]'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group 2: Finance & Facturation */}
          {permittedFinances.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-[#7A7A72] uppercase tracking-wider mb-2.5 px-1 flex items-center gap-1.5">
                <span>Finance & Facturation</span>
                <span className="text-[10px] font-normal text-[#9A9A92]">
                  ({permittedFinances.length})
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {permittedFinances.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm'
                          : 'bg-white border-[#E5E5DF] hover:border-[#5A5A40]/40 hover:bg-[#FAFAF8]'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-[#FAFAF8] group-hover:scale-105 transition-transform'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-bold ${
                              isActive ? 'text-white' : 'text-[#1A1A18]'
                            }`}
                          >
                            {item.label}
                          </span>
                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-[#EAEAE5] text-[#5A5A40]'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] line-clamp-1 mt-0.5 ${
                            isActive ? 'text-white/80' : 'text-[#7A7A72]'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group 3: Gestion & Système */}
          {permittedAdmin.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-[#7A7A72] uppercase tracking-wider mb-2.5 px-1 flex items-center gap-1.5">
                <span>Gestion & Système</span>
                <span className="text-[10px] font-normal text-[#9A9A92]">
                  ({permittedAdmin.length})
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {permittedAdmin.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm'
                          : 'bg-white border-[#E5E5DF] hover:border-[#5A5A40]/40 hover:bg-[#FAFAF8]'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-[#FAFAF8] group-hover:scale-105 transition-transform'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-bold ${
                              isActive ? 'text-white' : 'text-[#1A1A18]'
                            }`}
                          >
                            {item.label}
                          </span>
                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : item.highlight
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-[#EAEAE5] text-[#5A5A40]'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] line-clamp-1 mt-0.5 ${
                            isActive ? 'text-white/80' : 'text-[#7A7A72]'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#E5E5DF] bg-[#FAFAF8] flex items-center justify-between text-xs text-[#7A7A72] shrink-0">
          <span>Sirius Auto CRM • Tous droits réservés</span>
          <span className="font-semibold text-[#5A5A40]">
            Rôle : {currentUser?.role || 'Utilisateur'}
          </span>
        </div>
      </div>
    </div>
  );
};
