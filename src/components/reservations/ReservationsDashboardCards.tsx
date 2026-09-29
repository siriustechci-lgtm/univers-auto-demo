import React from 'react';
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  BadgePercent,
  KeyRound,
  DollarSign,
  CalendarCheck,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

interface ReservationsDashboardCardsProps {
  onOpenNewReservation: () => void;
  onFilterStatus?: (status: string) => void;
}

export const ReservationsDashboardCards: React.FC<ReservationsDashboardCardsProps> = ({
  onOpenNewReservation,
  onFilterStatus,
}) => {
  const { reservations, settings } = useCrm();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Active reservations (Réservée or Confirmée)
  const activeReservations = reservations.filter(
    (r) => r.status === 'Réservée' || r.status === 'Confirmée'
  );

  // 2. Expired reservations
  const expiredReservations = reservations.filter((r) => r.status === 'Expirée');

  // 3. Converted reservations (to sale or rental)
  const convertedReservations = reservations.filter(
    (r) => r.status === 'Convertie en location' || r.status === 'Convertie en vente'
  );
  const convertedToRental = reservations.filter((r) => r.status === 'Convertie en location').length;
  const convertedToSale = reservations.filter((r) => r.status === 'Convertie en vente').length;

  // 4. Deposits received (Total sum of depositAmount for active and converted)
  const totalDeposits = reservations
    .filter((r) => r.status !== 'Annulée')
    .reduce((sum, r) => sum + (Number(r.depositAmount) || 0), 0);

  // Today's starting or ending reservations
  const todayStarting = reservations.filter(
    (r) => r.startDate === todayStr && (r.status === 'Réservée' || r.status === 'Confirmée')
  ).length;

  return (
    <div id="reservations-dashboard-cards-container" className="space-y-4">
      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Réservations Actives */}
        <div
          id="kpi-active-reservations"
          onClick={() => onFilterStatus && onFilterStatus('actives')}
          className="p-4 rounded-2xl bg-white border border-[#E5E5DF] hover:border-[#4A6B82]/40 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7A7A72]">Réservations actives</span>
            <div className="w-8 h-8 rounded-xl bg-[#4A6B82]/10 border border-[#4A6B82]/20 flex items-center justify-center text-[#4A6B82] group-hover:scale-105 transition-transform">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1A1A18] font-['Outfit'] mt-2">
            {activeReservations.length}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#7A7A72] mt-1.5 pt-1.5 border-t border-[#F0F0EC]">
            <span>Véhicules actuellement bloqués</span>
            {todayStarting > 0 && (
              <span className="text-[#B87320] font-semibold">{todayStarting} débute(nt) auj.</span>
            )}
          </div>
        </div>

        {/* Card 2: Réservations Expirées */}
        <div
          id="kpi-expired-reservations"
          onClick={() => onFilterStatus && onFilterStatus('Expirée')}
          className="p-4 rounded-2xl bg-white border border-[#E5E5DF] hover:border-[#B87320]/40 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7A7A72]">Réservations expirées</span>
            <div className="w-8 h-8 rounded-xl bg-[#B87320]/10 border border-[#B87320]/20 flex items-center justify-center text-[#B87320] group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#B87320] font-['Outfit'] mt-2">
            {expiredReservations.length}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#7A7A72] mt-1.5 pt-1.5 border-t border-[#F0F0EC]">
            <span>Date d'échéance dépassée</span>
            <span className="text-[10px] text-[#9A9A92]">Véhicules libérés</span>
          </div>
        </div>

        {/* Card 3: Réservations Converties */}
        <div
          id="kpi-converted-reservations"
          onClick={() => onFilterStatus && onFilterStatus('converties')}
          className="p-4 rounded-2xl bg-white border border-[#E5E5DF] hover:border-[#4A7A4A]/40 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7A7A72]">Réservations converties</span>
            <div className="w-8 h-8 rounded-xl bg-[#4A7A4A]/10 border border-[#4A7A4A]/20 flex items-center justify-center text-[#4A7A4A] group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#4A7A4A] font-['Outfit'] mt-2">
            {convertedReservations.length}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#7A7A72] mt-1.5 pt-1.5 border-t border-[#F0F0EC]">
            <span className="inline-flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-[#5A5A40]" /> {convertedToRental} loc.
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <BadgePercent className="w-3 h-3 text-[#4A7A4A]" /> {convertedToSale} ventes
            </span>
          </div>
        </div>

        {/* Card 4: Acomptes Reçus */}
        <div
          id="kpi-deposits-received"
          className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7A7A72]">Acomptes reçus</span>
            <div className="w-8 h-8 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1A1A18] font-['Outfit'] mt-2 truncate">
            {totalDeposits.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-semibold text-[#7A7A72]">{settings.currencySymbol}</span>
          </div>
          <div className="text-[11px] text-[#7A7A72] mt-1.5 pt-1.5 border-t border-[#F0F0EC] truncate">
            Fonds garantis sur réservations
          </div>
        </div>
      </div>
    </div>
  );
};
