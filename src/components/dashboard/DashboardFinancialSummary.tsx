import React from 'react';
import {
  Wallet,
  CheckCircle2,
  Clock,
  BadgePercent,
  KeyRound,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export const DashboardFinancialSummary: React.FC = () => {
  const { sales, rentals, payments, settings, setActiveTab } = useCrm();

  // Total sales contracted amount
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);

  // Total rentals contracted amount
  const totalRentalsRevenue = rentals.reduce((acc, r) => acc + r.totalAmount, 0);

  // Total billed amount
  const totalContracted = totalSalesRevenue + totalRentalsRevenue;

  // Total actually collected / validated
  const totalCollected = payments.reduce(
    (acc, p) => acc + (p.status === 'Validé' ? p.amount : 0),
    0
  );

  // Total remaining to collect (unpaid balance on sales & rentals)
  const remainingSales = sales.reduce((acc, s) => {
    const paid = s.amountPaid || 0;
    return acc + Math.max(0, s.totalAmount - paid);
  }, 0);

  const remainingRentals = rentals.reduce((acc, r) => {
    const paid = r.amountPaid || 0;
    return acc + Math.max(0, r.totalAmount - paid);
  }, 0);

  const totalRemainingToCollect = remainingSales + remainingRentals;

  // Collection rate percentage
  const collectionRate =
    totalContracted > 0
      ? Math.min(100, Math.round((totalCollected / totalContracted) * 100))
      : totalCollected > 0
      ? 100
      : 0;

  return (
    <div
      id="dashboard-financial-summary-card"
      className="rounded-2xl border border-[#E5E5DF] bg-white p-5 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#1A1A18] tracking-tight font-['Outfit'] flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#5A5A40]" />
            <span>Résumé financier & Recouvrement</span>
          </h3>
          <p className="text-xs text-[#7A7A72] mt-0.5">
            Bilan consolidé des ventes, contrats de location et encaissements
          </p>
        </div>

        <button
          onClick={() => setActiveTab('payments')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5A5A40] hover:text-[#40402C] transition-colors cursor-pointer"
        >
          <span>Détail des paiements</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Primary Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        {/* Total Encaissé */}
        <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#4A7A4A]/25">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#7A7A72]">Total encaissé</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7A4A]" />
          </div>
          <div className="text-xl font-bold text-[#4A7A4A] font-['Outfit'] mt-1 truncate">
            {totalCollected.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-semibold">{settings.currencySymbol}</span>
          </div>
          <div className="text-[10px] text-[#7A7A72] mt-1">Paiements validés</div>
        </div>

        {/* Total Restant à Encaisser */}
        <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#B87320]/25">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#7A7A72]">Total restant à encaisser</span>
            <Clock className="w-3.5 h-3.5 text-[#B87320]" />
          </div>
          <div className="text-xl font-bold text-[#B87320] font-['Outfit'] mt-1 truncate">
            {totalRemainingToCollect.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-semibold">{settings.currencySymbol}</span>
          </div>
          <div className="text-[10px] text-[#7A7A72] mt-1">Soldes sur contrats</div>
        </div>

        {/* Revenus des Ventes */}
        <div
          onClick={() => setActiveTab('quick-sale')}
          className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] hover:border-[#4A7A4A]/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#7A7A72]">Revenus des ventes</span>
            <BadgePercent className="w-3.5 h-3.5 text-[#4A7A4A]" />
          </div>
          <div className="text-xl font-bold text-[#1A1A18] font-['Outfit'] mt-1 truncate">
            {totalSalesRevenue.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-normal text-[#7A7A72]">{settings.currencySymbol}</span>
          </div>
          <div className="text-[10px] text-[#7A7A72] mt-1">{sales.length} véhicule(s) vendu(s)</div>
        </div>

        {/* Revenus des Locations */}
        <div
          onClick={() => setActiveTab('quick-rental')}
          className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] hover:border-[#5A5A40]/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#7A7A72]">Revenus des locations</span>
            <KeyRound className="w-3.5 h-3.5 text-[#5A5A40]" />
          </div>
          <div className="text-xl font-bold text-[#1A1A18] font-['Outfit'] mt-1 truncate">
            {totalRentalsRevenue.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-normal text-[#7A7A72]">{settings.currencySymbol}</span>
          </div>
          <div className="text-[10px] text-[#7A7A72] mt-1">{rentals.length} contrat(s) de location</div>
        </div>
      </div>

      {/* Collection Rate Bar */}
      <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium text-[#2D2D2A]">
            Taux global de recouvrement
          </span>
          <span className="font-bold font-mono text-[#1A1A18]">{collectionRate}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#EAEAE5] overflow-hidden">
          <div
            className="h-full bg-[#4A7A4A] transition-all duration-500 rounded-full"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#7A7A72] mt-1.5">
          <span>0 {settings.currencySymbol}</span>
          <span>
            {totalContracted > 0
              ? `Total facturé : ${totalContracted.toLocaleString('fr-FR')} ${settings.currencySymbol}`
              : 'Aucun contrat émis pour le moment'}
          </span>
        </div>
      </div>
    </div>
  );
};
