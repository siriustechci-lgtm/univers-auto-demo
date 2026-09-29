import React from 'react';
import { useCrm } from '../context/CrmContext';
import { useAuth } from '../context/AuthContext';
import { NavigationTab } from '../types';
import { UniversAutoLogo } from './common/UniversAutoLogo';
import {
  LayoutDashboard,
  Car,
  ShoppingCart,
  BadgePercent,
  CalendarClock,
  Users,
  FileText,
  Receipt,
  BarChart3,
  UserCheck,
  Settings,
  Plus,
  LogOut,
  X,
  Database,
  CheckCircle2,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenPlusModal?: () => void;
  onOpenVehicleModal?: () => void;
  onOpenSaleModal?: () => void;
  onOpenClientModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  setIsOpenMobile,
  onOpenPlusModal,
  onOpenVehicleModal,
  onOpenSaleModal,
  onOpenClientModal,
}) => {
  const {
    activeTab,
    setActiveTab,
    vehicles,
    purchases,
    sales,
    reservations,
    clients,
    expenses,
    settings,
  } = useCrm();

  const { currentUser, logout, hasPermission } = useAuth();

  // 11 Core Navigation Modules requested by UNIVERS AUTO specifications
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'vehicles',
      label: 'Véhicules',
      icon: <Car className="w-4 h-4" />,
      badge: vehicles.length > 0 ? vehicles.length : undefined,
    },
    {
      id: 'purchases',
      label: 'Achats',
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: purchases.length > 0 ? purchases.length : undefined,
    },
    {
      id: 'sales',
      label: 'Ventes',
      icon: <BadgePercent className="w-4 h-4" />,
      badge: sales.length > 0 ? sales.length : undefined,
      badgeColor: 'bg-[#E50914] text-white',
    },
    {
      id: 'reservations',
      label: 'Réservations',
      icon: <CalendarClock className="w-4 h-4" />,
      badge: reservations.filter((r) => r.status === 'En cours').length > 0
        ? reservations.filter((r) => r.status === 'En cours').length
        : undefined,
      badgeColor: 'bg-amber-500 text-black',
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: <Users className="w-4 h-4" />,
      badge: clients.length > 0 ? clients.length : undefined,
    },
    {
      id: 'invoices',
      label: 'Facturation',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'expenses',
      label: 'Dépenses',
      icon: <Receipt className="w-4 h-4" />,
      badge: expenses.length > 0 ? expenses.length : undefined,
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'users',
      label: 'Employés',
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (tabId: NavigationTab) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#090A0D] border-r border-[#1F222A] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#1A1D24] flex items-center justify-between bg-[#0C0D11]">
          <UniversAutoLogo size="sm" showSubtitle={true} />
          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden p-1.5 text-[#85878A] hover:text-white rounded-lg hover:bg-[#161820]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              if (onOpenSaleModal) onOpenSaleModal();
              else if (onOpenPlusModal) onOpenPlusModal();
              else setActiveTab('sales');
              setIsOpenMobile(false);
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B3050F] hover:from-[#FF1E2B] hover:to-[#CC0812] text-white font-bold text-xs shadow-[0_2px_15px_rgba(229,9,20,0.4)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nouvelle Vente</span>
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#606470]">
            Navigation Principale
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'sales' && activeTab === 'quick-sale');
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#181A22] text-white border border-[#2E333F] shadow-inner font-bold'
                    : 'text-[#85878A] hover:text-white hover:bg-[#12141A]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`transition-colors ${
                      isActive ? 'text-[#E50914]' : 'text-[#85878A] group-hover:text-white'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="tracking-wide">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                        item.badgeColor || 'bg-[#20232B] text-[#D8D9DB] border border-[#2C303B]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Database & Hostinger Status Indicator */}
        <div className="px-3 py-2 mx-3 mb-2 bg-[#101217] border border-[#22252F] rounded-xl flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[#85878A] font-medium">Base de données :</span>
          </div>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MySQL / Prête
          </span>
        </div>

        {/* Current User & Logout Footer */}
        <div className="p-3 border-t border-[#1A1D24] bg-[#0C0D11] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {currentUser?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {currentUser?.fullName || 'Administrateur'}
              </p>
              <p className="text-[10px] text-[#85878A] truncate flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-[#E50914]" />
                {currentUser?.role || 'Directeur'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Voulez-vous vraiment vous déconnecter du CRM ?')) {
                logout();
              }
            }}
            title="Se déconnecter"
            className="p-1.5 text-[#85878A] hover:text-[#E50914] hover:bg-[#1A1D24] rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
