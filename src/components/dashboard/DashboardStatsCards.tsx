import React from 'react';
import {
  Car,
  KeyRound,
  BadgePercent,
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Wrench,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export const DashboardStatsCards: React.FC = () => {
  const { vehicles, clients, sales, rentals, payments, settings, setActiveTab } = useCrm();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayStr = now.toISOString().split('T')[0];

  // Helper date checking
  const isToday = (dateStr?: string) => {
    if (!dateStr) return false;
    return dateStr.startsWith(todayStr);
  };

  const isCurrentMonth = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  };

  const isCurrentYear = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d.getFullYear() === currentYear;
  };

  // 1. VEHICLES STATISTICS
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === 'Disponible').length;
  const rentedVehicles = vehicles.filter((v) => v.status === 'Loué').length;
  const soldVehicles = vehicles.filter((v) => v.status === 'Vendu').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'En maintenance').length;

  // 2. COMMERCIAL ACTIVITY
  const totalClients = clients.length;
  const monthlySales = sales.filter((s) => isCurrentMonth(s.saleDate || s.createdAt)).length;
  const monthlyRentals = rentals.filter((r) => isCurrentMonth(r.startDate || r.createdAt)).length;
  const validatedPayments = payments.filter((p) => p.status === 'Validé');
  const paymentsReceivedCount = validatedPayments.length;

  // 3. FINANCES
  // Daily revenue (sales created/dated today + rentals created/dated today + validated payments dated today)
  const todaySalesRevenue = sales
    .filter((s) => isToday(s.saleDate || s.createdAt))
    .reduce((acc, s) => acc + (s.amountPaid || s.totalAmount || 0), 0);
  const todayRentalsRevenue = rentals
    .filter((r) => isToday(r.startDate || r.createdAt))
    .reduce((acc, r) => acc + (r.amountPaid || r.totalAmount || 0), 0);
  const todayPaymentsRevenue = payments
    .filter((p) => p.status === 'Validé' && isToday(p.paymentDate || p.createdAt))
    .reduce((acc, p) => acc + p.amount, 0);

  // If there are standalone payments, or we calculate from sales/rentals
  const todayRevenue = todayPaymentsRevenue > 0 
    ? todayPaymentsRevenue 
    : (todaySalesRevenue + todayRentalsRevenue);

  // Monthly revenue
  const monthlyPaymentsSum = payments
    .filter((p) => p.status === 'Validé' && isCurrentMonth(p.paymentDate || p.createdAt))
    .reduce((acc, p) => acc + p.amount, 0);
  const monthlySalesSum = sales
    .filter((s) => isCurrentMonth(s.saleDate || s.createdAt))
    .reduce((acc, s) => acc + s.totalAmount, 0);
  const monthlyRentalsSum = rentals
    .filter((r) => isCurrentMonth(r.startDate || r.createdAt))
    .reduce((acc, r) => acc + r.totalAmount, 0);
  const monthlyRevenue = monthlyPaymentsSum > 0 ? monthlyPaymentsSum : (monthlySalesSum + monthlyRentalsSum);

  // Annual revenue
  const yearlyPaymentsSum = payments
    .filter((p) => p.status === 'Validé' && isCurrentYear(p.paymentDate || p.createdAt))
    .reduce((acc, p) => acc + p.amount, 0);
  const yearlySalesSum = sales
    .filter((s) => isCurrentYear(s.saleDate || s.createdAt))
    .reduce((acc, s) => acc + s.totalAmount, 0);
  const yearlyRentalsSum = rentals
    .filter((r) => isCurrentYear(r.startDate || r.createdAt))
    .reduce((acc, r) => acc + r.totalAmount, 0);
  const yearlyRevenue = yearlyPaymentsSum > 0 ? yearlyPaymentsSum : (yearlySalesSum + yearlyRentalsSum);

  // Pending balances / Montants en attente
  const pendingSalesBalance = sales.reduce((acc, s) => {
    const paid = s.amountPaid || 0;
    const remaining = Math.max(0, s.totalAmount - paid);
    return acc + (s.paymentStatus !== 'Payé' ? remaining : 0);
  }, 0);

  const pendingRentalsBalance = rentals.reduce((acc, r) => {
    const paid = r.amountPaid || 0;
    const remaining = Math.max(0, r.totalAmount - paid);
    return acc + (r.paymentStatus !== 'Payé' ? remaining : 0);
  }, 0);

  const pendingPaymentsSum = payments
    .filter((p) => p.status === 'En attente')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPendingAmount = pendingSalesBalance + pendingRentalsBalance + pendingPaymentsSum;

  return (
    <div id="dashboard-statistics-cards" className="space-y-6">
      {/* SECTION 1: FLOTTE VÉHICULES */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#4A6B82]/10 border border-[#4A6B82]/20 flex items-center justify-center text-[#4A6B82]">
              <Car className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
              Véhicules & Parc
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('vehicles')}
            className="text-xs font-semibold text-[#5A5A40] hover:text-[#40402C] transition-colors cursor-pointer"
          >
            Consulter le parc →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total Véhicules */}
          <div
            id="stat-total-vehicles"
            onClick={() => setActiveTab('vehicles')}
            className="p-3.5 rounded-xl bg-white border border-[#E5E5DF] hover:border-[#D5D5CD] transition-all cursor-pointer shadow-xs"
          >
            <div className="text-[11px] font-medium text-[#7A7A72]">Total véhicules</div>
            <div className="text-2xl font-bold text-[#1A1A18] mt-1 font-['Outfit']">
              {totalVehicles}
            </div>
            <div className="text-[10px] text-[#9A9A92] mt-1">Parc automobile global</div>
          </div>

          {/* Véhicules Disponibles */}
          <div
            id="stat-available-vehicles"
            onClick={() => setActiveTab('vehicles')}
            className="p-3.5 rounded-xl bg-white border border-[#E5E5DF] hover:border-[#4A7A4A]/40 transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#7A7A72]">Disponibles</span>
              <span className="w-2 h-2 rounded-full bg-[#4A7A4A]" />
            </div>
            <div className="text-2xl font-bold text-[#4A7A4A] mt-1 font-['Outfit']">
              {availableVehicles}
            </div>
            <div className="text-[10px] text-[#7A7A72] mt-1">Prêts à la vente / loc.</div>
          </div>

          {/* Véhicules Loués */}
          <div
            id="stat-rented-vehicles"
            onClick={() => setActiveTab('vehicles')}
            className="p-3.5 rounded-xl bg-white border border-[#E5E5DF] hover:border-[#5A5A40]/40 transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#7A7A72]">Loués</span>
              <span className="w-2 h-2 rounded-full bg-[#5A5A40]" />
            </div>
            <div className="text-2xl font-bold text-[#5A5A40] mt-1 font-['Outfit']">
              {rentedVehicles}
            </div>
            <div className="text-[10px] text-[#7A7A72] mt-1">En contrat actif</div>
          </div>

          {/* Véhicules Vendus */}
          <div
            id="stat-sold-vehicles"
            onClick={() => setActiveTab('vehicles')}
            className="p-3.5 rounded-xl bg-white border border-[#E5E5DF] hover:border-[#7A7A72]/40 transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#7A7A72]">Vendus</span>
              <span className="w-2 h-2 rounded-full bg-[#2D2D2A]" />
            </div>
            <div className="text-2xl font-bold text-[#2D2D2A] mt-1 font-['Outfit']">
              {soldVehicles}
            </div>
            <div className="text-[10px] text-[#7A7A72] mt-1">Cessions finalisées</div>
          </div>

          {/* Véhicules En maintenance */}
          <div
            id="stat-maintenance-vehicles"
            onClick={() => setActiveTab('vehicles')}
            className="p-3.5 rounded-xl bg-white border border-[#E5E5DF] hover:border-[#B87320]/40 transition-all cursor-pointer shadow-xs col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#7A7A72]">En maintenance</span>
              <Wrench className="w-3.5 h-3.5 text-[#B87320]" />
            </div>
            <div className="text-2xl font-bold text-[#B87320] mt-1 font-['Outfit']">
              {maintenanceVehicles}
            </div>
            <div className="text-[10px] text-[#7A7A72] mt-1">Atelier & révision</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ACTIVITÉ COMMERCIALE & FINANCES (2-COLUMN BALANCED) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Commercial Activity Box */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#4A7A4A]/10 border border-[#4A7A4A]/20 flex items-center justify-center text-[#4A7A4A]">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                Activité commerciale
              </h3>
            </div>
            <span className="text-[10px] font-medium text-[#7A7A72] bg-[#F5F5F0] px-2 py-0.5 rounded-md border border-[#E5E5DF]">
              Mois en cours
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Total clients */}
            <div
              onClick={() => setActiveTab('clients')}
              className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] hover:border-[#B87320]/40 transition-colors cursor-pointer"
            >
              <div className="text-[11px] text-[#7A7A72]">Total clients</div>
              <div className="text-xl font-bold text-[#1A1A18] font-['Outfit'] mt-0.5">
                {totalClients}
              </div>
              <div className="text-[10px] text-[#7A7A72] mt-0.5">Fiches enregistrées</div>
            </div>

            {/* Ventes du mois */}
            <div
              onClick={() => setActiveTab('quick-sale')}
              className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] hover:border-[#4A7A4A]/40 transition-colors cursor-pointer"
            >
              <div className="text-[11px] text-[#7A7A72]">Ventes du mois</div>
              <div className="text-xl font-bold text-[#4A7A4A] font-['Outfit'] mt-0.5">
                {monthlySales}
              </div>
              <div className="text-[10px] text-[#7A7A72] mt-0.5">Contrats signés</div>
            </div>

            {/* Locations du mois */}
            <div
              onClick={() => setActiveTab('quick-rental')}
              className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] hover:border-[#5A5A40]/40 transition-colors cursor-pointer"
            >
              <div className="text-[11px] text-[#7A7A72]">Locations du mois</div>
              <div className="text-xl font-bold text-[#5A5A40] font-['Outfit'] mt-0.5">
                {monthlyRentals}
              </div>
              <div className="text-[10px] text-[#7A7A72] mt-0.5">Contrats actifs</div>
            </div>

            {/* Paiements reçus */}
            <div
              onClick={() => setActiveTab('payments')}
              className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] hover:border-[#7A5A82]/40 transition-colors cursor-pointer"
            >
              <div className="text-[11px] text-[#7A7A72]">Paiements reçus</div>
              <div className="text-xl font-bold text-[#7A5A82] font-['Outfit'] mt-0.5">
                {paymentsReceivedCount}
              </div>
              <div className="text-[10px] text-[#7A7A72] mt-0.5">Encaissements validés</div>
            </div>
          </div>
        </div>

        {/* Finances Box */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                Finances & Trésorerie
              </h3>
            </div>
            <span className="text-[10px] font-medium text-[#7A7A72] bg-[#F5F5F0] px-2 py-0.5 rounded-md border border-[#E5E5DF]">
              En temps réel
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Revenus du jour */}
            <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
              <div className="text-[11px] text-[#7A7A72]">Revenus du jour</div>
              <div className="text-lg font-bold text-[#1A1A18] font-['Outfit'] mt-0.5 truncate">
                {todayRevenue.toLocaleString('fr-FR')} <span className="text-xs font-normal text-[#7A7A72]">{settings.currencySymbol}</span>
              </div>
              <div className="text-[10px] text-[#7A7A72] mt-0.5">Aujourd'hui</div>
            </div>

            {/* Revenus du mois */}
            <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
              <div className="text-[11px] text-[#7A7A72]">Revenus du mois</div>
              <div className="text-lg font-bold text-[#4A7A4A] font-['Outfit'] mt-0.5 truncate">
                {monthlyRevenue.toLocaleString('fr-FR')} <span className="text-xs font-normal text-[#4A7A4A]">{settings.currencySymbol}</span>
              </div>
              <div className="text-[10px] text-[#7A7A72] mt-0.5">Mois en cours</div>
            </div>

            {/* Revenus de l'année */}
            <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
              <div className="text-[11px] text-[#7A7A72]">Revenus de l'année</div>
              <div className="text-lg font-bold text-[#5A5A40] font-['Outfit'] mt-0.5 truncate">
                {yearlyRevenue.toLocaleString('fr-FR')} <span className="text-xs font-normal text-[#5A5A40]">{settings.currencySymbol}</span>
              </div>
              <div className="text-[10px] text-[#7A7A72] mt-0.5">Année {currentYear}</div>
            </div>

            {/* Montants en attente */}
            <div
              onClick={() => setActiveTab('payments')}
              className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] hover:border-[#B87320]/40 transition-colors cursor-pointer"
            >
              <div className="text-[11px] text-[#7A7A72]">Montants en attente</div>
              <div className={`text-lg font-bold font-['Outfit'] mt-0.5 truncate ${totalPendingAmount > 0 ? 'text-[#B87320]' : 'text-[#7A7A72]'}`}>
                {totalPendingAmount.toLocaleString('fr-FR')} <span className="text-xs font-normal">{settings.currencySymbol}</span>
              </div>
              <div className="text-[10px] text-[#7A7A72] mt-0.5">Impayés & soldes dus</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
