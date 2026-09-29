import React from 'react';
import { useCrm } from '../../context/CrmContext';
import { useAuth } from '../../context/AuthContext';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  Car,
  BadgePercent,
  KeyRound,
  Layers,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenPlusModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenPlusModal,
}) => {
  const { activeTab, setActiveTab, vehicles, sales, rentals } = useCrm();
  const { hasPermission } = useAuth();

  // Core items for the bottom navigation
  const primaryNavItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Accueil',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'vehicles',
      label: 'Parc',
      icon: <Car className="w-5 h-5" />,
      badge: vehicles.length > 0 ? vehicles.length : undefined,
    },
    {
      id: 'quick-sale',
      label: 'Ventes',
      icon: <BadgePercent className="w-5 h-5" />,
      badge: sales.length > 0 ? sales.length : undefined,
    },
    {
      id: 'quick-rental',
      label: 'Locations',
      icon: <KeyRound className="w-5 h-5" />,
      badge: rentals.length > 0 ? rentals.length : undefined,
    },
  ];

  // Check if current tab is one of the secondary tabs
  const isPlusActive = !['dashboard', 'vehicles', 'quick-sale', 'quick-rental'].includes(
    activeTab
  );

  return (
    <nav
      id="mobile-bottom-navigation-bar"
      aria-label="Navigation mobile principale"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E5DF] lg:hidden safe-area-bottom shadow-lg"
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {primaryNavItems.map((item) => {
          const isAllowed = hasPermission(item.id);
          if (!isAllowed) return null;

          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] min-h-[44px] transition-all cursor-pointer relative ${
                isActive
                  ? 'text-[#5A5A40] font-bold'
                  : 'text-[#7A7A72] hover:text-[#1A1A18] font-medium'
              }`}
            >
              <div className="relative">
                <span
                  className={`transition-transform duration-150 ${
                    isActive ? 'scale-110' : ''
                  }`}
                >
                  {item.icon}
                </span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-1 text-[9px] font-bold bg-[#5A5A40] text-white rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>

              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#5A5A40] mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Plus Button */}
        <button
          type="button"
          id="mobile-nav-plus-btn"
          onClick={onOpenPlusModal}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] min-h-[44px] transition-all cursor-pointer relative ${
            isPlusActive
              ? 'text-[#5A5A40] font-bold'
              : 'text-[#7A7A72] hover:text-[#1A1A18] font-medium'
          }`}
        >
          <div className="relative">
            <span
              className={`transition-transform duration-150 ${
                isPlusActive ? 'scale-110' : ''
              }`}
            >
              <Layers className="w-5 h-5" />
            </span>

            {isPlusActive && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-[#5A5A40] rounded-full ring-2 ring-white" />
            )}
          </div>

          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
            Plus
          </span>

          {isPlusActive && (
            <span className="w-1 h-1 rounded-full bg-[#5A5A40] mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
