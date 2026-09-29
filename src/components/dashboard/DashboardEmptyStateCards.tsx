import React from 'react';
import {
  Car,
  Users,
  BadgePercent,
  KeyRound,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

interface DashboardEmptyStateCardsProps {
  onOpenVehicleModal: () => void;
  onOpenClientModal: () => void;
  onOpenSaleModal: () => void;
  onOpenRentalModal: () => void;
}

export const DashboardEmptyStateCards: React.FC<DashboardEmptyStateCardsProps> = ({
  onOpenVehicleModal,
  onOpenClientModal,
  onOpenSaleModal,
  onOpenRentalModal,
}) => {
  const { vehicles, clients, sales, rentals } = useCrm();

  const emptyItems = [
    {
      id: 'empty-card-vehicle',
      show: vehicles.length === 0,
      title: 'Aucun véhicule enregistré',
      description: 'Ajoutez vos véhicules disponibles pour la vente ou la location.',
      buttonText: 'Ajouter un véhicule',
      icon: Car,
      color: 'text-[#4A6B82] bg-[#4A6B82]/10 border-[#4A6B82]/20',
      action: onOpenVehicleModal,
    },
    {
      id: 'empty-card-client',
      show: clients.length === 0,
      title: 'Aucun client enregistré',
      description: 'Créez votre premier profil client particulier ou entreprise.',
      buttonText: 'Ajouter un client',
      icon: Users,
      color: 'text-[#B87320] bg-[#B87320]/10 border-[#B87320]/20',
      action: onOpenClientModal,
    },
    {
      id: 'empty-card-sale',
      show: sales.length === 0,
      title: 'Aucune vente enregistrée',
      description: 'Éditez votre première facture de vente avec gestion des paiements.',
      buttonText: 'Créer une vente',
      icon: BadgePercent,
      color: 'text-[#4A7A4A] bg-[#4A7A4A]/10 border-[#4A7A4A]/20',
      action: onOpenSaleModal,
    },
    {
      id: 'empty-card-rental',
      show: rentals.length === 0,
      title: 'Aucune location enregistrée',
      description: 'Générez un contrat de location avec calcul de caution et dates.',
      buttonText: 'Créer une location',
      icon: KeyRound,
      color: 'text-[#5A5A40] bg-[#5A5A40]/10 border-[#5A5A40]/20',
      action: onOpenRentalModal,
    },
  ].filter((item) => item.show);

  if (emptyItems.length === 0) {
    return null;
  }

  return (
    <div
      id="dashboard-onboarding-empty-states"
      className="rounded-2xl border border-[#E5E5DF] bg-[#FAFAF8] p-5 shadow-xs"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
              Mise en route de votre agence
            </h3>
            <p className="text-[11px] text-[#7A7A72]">
              Complétez vos premiers modules pour alimenter automatiquement votre tableau de bord
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {emptyItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={item.id}
              className="p-4 rounded-xl bg-white border border-[#E5E5DF] hover:border-[#D5D5CD] transition-all flex flex-col justify-between"
            >
              <div>
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.color} mb-3`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#7A7A72] mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <button
                onClick={item.action}
                className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A18] hover:bg-[#333330] text-white text-xs font-semibold transition-colors cursor-pointer w-full"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{item.buttonText}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
