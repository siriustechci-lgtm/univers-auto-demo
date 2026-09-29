import React from 'react';
import {
  Car,
  KeyRound,
  BadgePercent,
  Users,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardQuickActionsProps {
  onOpenVehicleModal: () => void;
  onOpenClientModal: () => void;
  onOpenSaleModal: () => void;
  onOpenRentalModal: () => void;
  onOpenPaymentModal: () => void;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  onOpenVehicleModal,
  onOpenClientModal,
  onOpenSaleModal,
  onOpenRentalModal,
  onOpenPaymentModal,
}) => {
  const { hasPermission } = useAuth();

  const actions = [
    {
      id: 'quick-action-vehicle',
      title: 'Ajouter un véhicule',
      subtitle: 'Stock, achat & vente, location',
      icon: Car,
      color: 'text-[#4A6B82] bg-[#4A6B82]/10 border-[#4A6B82]/20 hover:border-[#4A6B82]/50',
      btnBg: 'hover:bg-[#F3F6F8]',
      action: onOpenVehicleModal,
      visible: hasPermission('vehicles'),
    },
    {
      id: 'quick-action-sale',
      title: 'Nouvelle vente',
      subtitle: 'Facture, cession & règlement',
      icon: BadgePercent,
      color: 'text-[#4A7A4A] bg-[#4A7A4A]/10 border-[#4A7A4A]/20 hover:border-[#4A7A4A]/50',
      btnBg: 'hover:bg-[#F2F7F2]',
      action: onOpenSaleModal,
      visible: hasPermission('quick-sale'),
    },
    {
      id: 'quick-action-rental',
      title: 'Nouvelle location',
      subtitle: 'Contrat, caution & départ',
      icon: KeyRound,
      color: 'text-[#5A5A40] bg-[#5A5A40]/10 border-[#5A5A40]/20 hover:border-[#5A5A40]/50',
      btnBg: 'hover:bg-[#F6F6F2]',
      action: onOpenRentalModal,
      visible: hasPermission('quick-rental'),
    },
    {
      id: 'quick-action-client',
      title: 'Ajouter un client',
      subtitle: 'Fiche particulier ou pro',
      icon: Users,
      color: 'text-[#B87320] bg-[#B87320]/10 border-[#B87320]/20 hover:border-[#B87320]/50',
      btnBg: 'hover:bg-[#FBF6EE]',
      action: onOpenClientModal,
      visible: hasPermission('clients'),
    },
    {
      id: 'quick-action-payment',
      title: 'Ajouter un paiement',
      subtitle: 'Encaissement vente ou location',
      icon: CreditCard,
      color: 'text-[#7A5A82] bg-[#7A5A82]/10 border-[#7A5A82]/20 hover:border-[#7A5A82]/50',
      btnBg: 'hover:bg-[#F7F2F8]',
      action: onOpenPaymentModal,
      visible: hasPermission('payments'),
    },
  ];

  return (
    <div id="dashboard-quick-actions-section" className="rounded-2xl border border-[#E5E5DF] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
            Actions rapides
          </h2>
          <p className="text-xs text-[#7A7A72] mt-0.5">
            Accès immédiat aux opérations clés en un clic
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#7A7A72] bg-[#F5F5F0] px-2.5 py-1 rounded-lg border border-[#E5E5DF]">
          <span>⚡ Raccourcis opérationnels</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions
          .filter((a) => a.visible)
          .map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={item.id}
                onClick={item.action}
                className={`flex flex-col items-start p-3.5 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] ${item.btnBg} transition-all duration-150 text-left group cursor-pointer active:scale-[0.98]`}
              >
                <div className="flex items-center justify-between w-full mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.color} group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-white border border-[#E5E5DF] flex items-center justify-center text-[#9A9A92] group-hover:text-[#1A1A18] group-hover:border-[#C5C5BD] transition-colors">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
                <span className="text-xs font-bold text-[#1A1A18] group-hover:text-[#000] tracking-tight">
                  {item.title}
                </span>
                <span className="text-[11px] text-[#7A7A72] mt-0.5 line-clamp-1">
                  {item.subtitle}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
};
