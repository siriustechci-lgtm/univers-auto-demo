import React, { useState, useRef, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { useAuth } from '../context/AuthContext';
import { UniversAutoLogo } from './common/UniversAutoLogo';
import {
  Menu,
  Plus,
  Car,
  BadgePercent,
  ShoppingCart,
  Users,
  CreditCard,
  Search,
  ChevronDown,
  User,
  Shield,
  LogOut,
  Sliders,
  Bell,
  CalendarClock,
  Sparkles,
  Database,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenVehicleModal: () => void;
  onOpenClientModal: () => void;
  onOpenSaleModal: () => void;
  onOpenRentalModal: () => void;
  onOpenPaymentModal: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onOpenGlobalSearch?: (initialQuery?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenVehicleModal,
  onOpenClientModal,
  onOpenSaleModal,
  onOpenRentalModal,
  onOpenPaymentModal,
  searchQuery = '',
  setSearchQuery,
  onOpenGlobalSearch,
}) => {
  const {
    activeTab,
    setActiveTab,
    settings,
    notifications,
    markAllNotificationsAsRead,
  } = useCrm();
  const {
    currentUser,
    logout,
  } = useAuth();

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQuickActionOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Tableau de bord',
      subtitle: 'Indicateurs en direct · Stock, chiffre d’affaires et rentabilité',
    },
    vehicles: {
      title: 'Parc Automobile & Stock',
      subtitle: 'Inventaire des véhicules neufs et d’occasion, prix d’achat et marges',
    },
    purchases: {
      title: 'Achats & Approvisionnements',
      subtitle: 'Coûts d’importation, douane, transit maritime et prix de revient réel',
    },
    sales: {
      title: 'Ventes & Cessions',
      subtitle: 'Contrats de vente officiels, acomptes, soldes dus et commissions',
    },
    'quick-sale': {
      title: 'Ventes de Véhicules',
      subtitle: 'Fiches de vente, acomptes, facturation et génération de contrats',
    },
    reservations: {
      title: 'Réservations de Véhicules',
      subtitle: 'Bons de réservation, acomptes bloqués et échéances de validité',
    },
    clients: {
      title: 'Répertoire Clients',
      subtitle: 'Fiches clients 360°, pièces d’identité, créances et historique',
    },
    invoices: {
      title: 'Facturation & Devis',
      subtitle: 'Factures officielles, devis proforma et reçus en FCFA',
    },
    expenses: {
      title: 'Dépenses & Charges',
      subtitle: 'Charges d’exploitation, prestataires et suivi de trésorerie',
    },
    reports: {
      title: 'Rapports & Statistiques',
      subtitle: 'Bilans financiers, rentabilité réelle, créances et exports PDF/Excel',
    },
    users: {
      title: 'Gestion des Employés & Vendeurs',
      subtitle: 'Comptes utilisateurs, objectifs commerciaux, commissions et rôles',
    },
    settings: {
      title: 'Paramètres du CRM',
      subtitle: 'Coordonnées UNIVERS AUTO, logo, devise FCFA et connexion MySQL Hostinger',
    },
  };

  const currentTabInfo = tabTitles[activeTab] || {
    title: 'UNIVERS AUTO CRM',
    subtitle: 'Solution de gestion automobile',
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-30 bg-[#08090C]/95 backdrop-blur-md border-b border-[#1E2129] px-4 sm:px-6 lg:px-8 py-3 text-white"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Mobile toggle, Company Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <button
            id="header-mobile-toggle"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-[#85878A] hover:text-white hover:bg-[#151720] transition-colors shrink-0"
            aria-label="Ouvrir la navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Compact Logo for Mobile & Tablet */}
          <div className="lg:hidden flex items-center shrink-0">
            <UniversAutoLogo size="sm" showSubtitle={false} />
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate font-['Outfit']">
              {currentTabInfo.title}
            </h1>
            <p className="text-xs text-[#85878A] hidden sm:block truncate">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Center/Right Section: Search, Quick Actions, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Trigger Bar */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <button
              id="global-search-trigger-btn"
              type="button"
              onClick={() => onOpenGlobalSearch?.()}
              className="w-full flex items-center justify-between pl-9 pr-2.5 py-2 rounded-xl bg-[#111318] hover:bg-[#161820] border border-[#232733] hover:border-[#E50914]/50 text-xs text-[#85878A] hover:text-white transition-all text-left group"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878A] group-hover:text-[#E50914] transition-colors" />
              <span className="truncate">Rechercher (VIN, client, n°...)</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#1A1D26] border border-[#2E3342] text-[10px] font-mono text-[#85878A]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Quick Action Button with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="header-quick-action-btn"
              onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#CC0812] text-white font-bold text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(229,9,20,0.35)] active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Action rapide</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isQuickActionOpen ? 'rotate-180' : ''}`} />
            </button>

            {isQuickActionOpen && (
              <div
                id="quick-actions-dropdown"
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0F1116] border border-[#272B36] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#85878A] uppercase tracking-wider border-b border-[#20242E] mb-1">
                  Création Rapide
                </div>

                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    onOpenSaleModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-[#1A1D26] hover:text-[#E50914] transition-colors text-left"
                >
                  <BadgePercent className="w-4 h-4 text-[#E50914]" />
                  <span>Nouvelle Vente</span>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    setActiveTab('purchases');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-[#1A1D26] hover:text-[#E50914] transition-colors text-left"
                >
                  <ShoppingCart className="w-4 h-4 text-amber-500" />
                  <span>Nouvel Achat / Import</span>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    onOpenVehicleModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-[#1A1D26] hover:text-[#E50914] transition-colors text-left"
                >
                  <Car className="w-4 h-4 text-blue-400" />
                  <span>Ajouter un Véhicule</span>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    onOpenClientModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-[#1A1D26] hover:text-[#E50914] transition-colors text-left"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Nouveau Client</span>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    setActiveTab('reservations');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-[#1A1D26] hover:text-[#E50914] transition-colors text-left"
                >
                  <CalendarClock className="w-4 h-4 text-purple-400" />
                  <span>Nouvelle Réservation</span>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    onOpenPaymentModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-[#1A1D26] hover:text-[#E50914] transition-colors text-left"
                >
                  <CreditCard className="w-4 h-4 text-teal-400" />
                  <span>Encaisser un Paiement</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#232733] bg-[#111318] hover:bg-[#181B22] text-white transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#E50914]/20 border border-[#E50914]/40 flex items-center justify-center text-[#E50914] font-black text-xs">
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold max-w-[100px] truncate">
                {currentUser?.fullName || 'Utilisateur'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#85878A] hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#0F1116] border border-[#272B36] shadow-2xl p-2 z-50 text-white">
                <div className="px-3 py-2 border-b border-[#20242E] mb-1">
                  <p className="text-xs font-bold text-white truncate">{currentUser?.fullName}</p>
                  <p className="text-[10px] text-[#E50914] font-semibold">{currentUser?.role}</p>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setActiveTab('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#85878A] hover:text-white hover:bg-[#181B24] transition-colors text-left"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Paramètres & MySQL</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (window.confirm('Confirmez-vous la déconnexion ?')) {
                      logout();
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
