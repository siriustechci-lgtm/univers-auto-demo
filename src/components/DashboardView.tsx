import React, { useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  BadgePercent,
  CalendarClock,
  Coins,
  TrendingUp,
  Receipt,
  Users,
  CreditCard,
  Plus,
  ArrowUpRight,
  ShoppingCart,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  AlertCircle,
  Database,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardViewProps {
  onOpenVehicleModal: () => void;
  onOpenClientModal: () => void;
  onOpenSaleModal: () => void;
  onOpenRentalModal?: () => void;
  onOpenPaymentModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenVehicleModal,
  onOpenClientModal,
  onOpenSaleModal,
  onOpenPaymentModal,
}) => {
  const {
    vehicles,
    purchases,
    sales,
    reservations,
    clients,
    expenses,
    payments,
    settings,
    setActiveTab,
  } = useCrm();

  const { currentUser } = useAuth();

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 1. VEHICLES IN STOCK
  const inStockVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === 'Disponible' || v.status === 'En préparation');
  }, [vehicles]);

  // 2. VEHICLES SOLD
  const soldVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === 'Vendu');
  }, [vehicles]);

  // 3. VEHICLES RESERVED
  const reservedVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === 'Réservé');
  }, [vehicles]);

  // 4. TOTAL STOCK VALUE IN FCFA (Coût de revient réel des véhicules disponibles ou en préparation)
  const totalStockValue = useMemo(() => {
    return inStockVehicles.reduce((sum, v) => sum + (v.totalCost || v.purchasePrice || 0), 0);
  }, [inStockVehicles]);

  // Total stock potential selling value
  const totalStockSellingValue = useMemo(() => {
    return inStockVehicles.reduce((sum, v) => sum + (v.sellingPrice || 0), 0);
  }, [inStockVehicles]);

  // 5. TURNOVER / CHIFFRE D'AFFAIRES (Total des ventes conclues en FCFA)
  const turnover = useMemo(() => {
    return sales.reduce((sum, s) => sum + (s.finalPrice || s.totalAmount || 0), 0);
  }, [sales]);

  // 6. TOTAL EXPENSES / DÉPENSES
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  // 7. CLIENT DEBTS / CRÉANCES CLIENTS (Soldes restants dus par les acquéreurs)
  const clientDebt = useMemo(() => {
    return sales.reduce((sum, s) => sum + (s.balanceDue || 0), 0);
  }, [sales]);

  // 8. REAL NET PROFIT (Bénéfice Réel = Somme des marges réalisées sur les véhicules vendus - Dépenses générales)
  const netRealProfit = useMemo(() => {
    let grossMarginOnSold = 0;
    for (const sale of sales) {
      const v = vehicles.find((veh) => veh.id === sale.vehicleId);
      const cost = v ? (v.totalCost || v.purchasePrice || 0) : 0;
      grossMarginOnSold += (sale.finalPrice || sale.totalAmount || 0) - cost;
    }
    return grossMarginOnSold - totalExpenses;
  }, [sales, vehicles, totalExpenses]);

  // 9. MONTHLY SALES (Ventes du mois en cours)
  const monthlySales = useMemo(() => {
    return sales.filter((s) => (s.saleDate || s.createdAt || '').startsWith(currentMonthStr));
  }, [sales, currentMonthStr]);

  const monthlySalesRevenue = useMemo(() => {
    return monthlySales.reduce((sum, s) => sum + (s.finalPrice || s.totalAmount || 0), 0);
  }, [monthlySales]);

  // Total cash collected
  const totalCashCollected = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  // Monthly trends data for chart
  const monthlyChartData = useMemo(() => {
    const monthsMap: Record<string, { month: string; ventes: number; depenses: number; benefice: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      monthsMap[key] = { month: label, ventes: 0, depenses: 0, benefice: 0 };
    }

    for (const s of sales) {
      const key = (s.saleDate || s.createdAt || '').substring(0, 7);
      if (monthsMap[key]) {
        const amount = s.finalPrice || s.totalAmount || 0;
        monthsMap[key].ventes += amount;
        const v = vehicles.find((veh) => veh.id === saleVehicleId(s));
        const cost = v ? (v.totalCost || v.purchasePrice || 0) : 0;
        monthsMap[key].benefice += (amount - cost);
      }
    }

    for (const e of expenses) {
      const key = (e.date || '').substring(0, 7);
      if (monthsMap[key]) {
        monthsMap[key].depenses += e.amount;
        monthsMap[key].benefice -= e.amount;
      }
    }

    return Object.values(monthsMap);
  }, [sales, expenses, vehicles]);

  function saleVehicleId(s: any) {
    return s.vehicleId;
  }

  const formattedDate = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div id="dashboard-view-root" className="space-y-6 text-white pb-12">
      {/* Top Banner with UNIVERS AUTO Branding */}
      <div className="relative rounded-2xl bg-[#0C0E13] border border-[#232733] p-5 sm:p-6 shadow-2xl overflow-hidden">
        {/* Subtle red metallic racing light glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E50914]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[#E50914]/15 text-[#E50914] text-xs font-black border border-[#E50914]/30 uppercase tracking-wider">
                UNIVERS AUTO
              </span>
              <span className="text-xs text-[#555A66]">|</span>
              <span className="text-xs text-[#85878A] capitalize">{formattedDate}</span>
              {currentUser && (
                <>
                  <span className="text-xs text-[#555A66]">|</span>
                  <span className="text-xs text-[#85878A]">
                    Connecté : <strong className="text-white font-semibold">{currentUser.fullName}</strong> ({currentUser.role})
                  </span>
                </>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit']">
              Tableau de bord de pilotage
            </h1>
            <p className="text-xs sm:text-sm text-[#85878A] mt-0.5 max-w-2xl">
              Supervision en temps réel du parc de véhicules, des ventes, approvisionnements, créances et rentabilité en FCFA.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111319] border border-[#252834] text-xs text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-emerald-400">Système opérationnel</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BUTTONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          onClick={onOpenSaleModal}
          className="p-3 rounded-xl bg-[#111318] hover:bg-[#181B22] border border-[#232733] hover:border-[#E50914]/60 transition-all flex items-center gap-2.5 group cursor-pointer text-left shadow-md"
        >
          <div className="w-8 h-8 rounded-lg bg-[#E50914]/15 text-[#E50914] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <BadgePercent className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-[#E50914] transition-colors leading-tight">
              + Vente
            </div>
            <div className="text-[10px] text-[#85878A] leading-tight">Nouvelle cession</div>
          </div>
        </button>

        <button
          onClick={onOpenVehicleModal}
          className="p-3 rounded-xl bg-[#111318] hover:bg-[#181B22] border border-[#232733] hover:border-[#E50914]/60 transition-all flex items-center gap-2.5 group cursor-pointer text-left shadow-md"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
              + Véhicule
            </div>
            <div className="text-[10px] text-[#85878A] leading-tight">Entrée en stock</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className="p-3 rounded-xl bg-[#111318] hover:bg-[#181B22] border border-[#232733] hover:border-[#E50914]/60 transition-all flex items-center gap-2.5 group cursor-pointer text-left shadow-md"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors leading-tight">
              + Achat
            </div>
            <div className="text-[10px] text-[#85878A] leading-tight">Import & Douane</div>
          </div>
        </button>

        <button
          onClick={onOpenClientModal}
          className="p-3 rounded-xl bg-[#111318] hover:bg-[#181B22] border border-[#232733] hover:border-[#E50914]/60 transition-all flex items-center gap-2.5 group cursor-pointer text-left shadow-md"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
              + Client
            </div>
            <div className="text-[10px] text-[#85878A] leading-tight">Nouveau profil</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className="p-3 rounded-xl bg-[#111318] hover:bg-[#181B22] border border-[#232733] hover:border-[#E50914]/60 transition-all flex items-center gap-2.5 group cursor-pointer text-left shadow-md"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors leading-tight">
              + Réservation
            </div>
            <div className="text-[10px] text-[#85878A] leading-tight">Bloquer véhicule</div>
          </div>
        </button>

        <button
          onClick={onOpenPaymentModal}
          className="p-3 rounded-xl bg-[#111318] hover:bg-[#181B22] border border-[#232733] hover:border-[#E50914]/60 transition-all flex items-center gap-2.5 group cursor-pointer text-left shadow-md"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors leading-tight">
              + Encaissement
            </div>
            <div className="text-[10px] text-[#85878A] leading-tight">Wave, Cash, Banque</div>
          </div>
        </button>
      </div>

      {/* CORE 9 DYNAMIC METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Véhicules en Stock */}
        <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-semibold mb-2">
            <span>1. Véhicules en Stock</span>
            <div className="w-7 h-7 rounded-lg bg-[#E50914]/15 text-[#E50914] flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {inStockVehicles.length} <span className="text-sm font-semibold text-[#85878A]">unités</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1C1F28] text-[11px] text-[#85878A]">
            <span>Disponible pour la vente</span>
            <button
              onClick={() => setActiveTab('vehicles')}
              className="text-[#E50914] hover:underline font-bold flex items-center gap-0.5"
            >
              Voir parc <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Véhicules Vendus & Réservés */}
        <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-semibold mb-2">
            <span>2. Véhicules Vendus / Réservés</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {soldVehicles.length}{' '}
            <span className="text-xs font-normal text-[#85878A]">
              vendus · <strong className="text-amber-400">{reservedVehicles.length}</strong> réservés
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1C1F28] text-[11px] text-[#85878A]">
            <span>Cessions confirmées</span>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-emerald-400 hover:underline font-bold flex items-center gap-0.5"
            >
              Historique ventes <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Valeur Totale du Stock en FCFA */}
        <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-semibold mb-2">
            <span>3. Valeur Totale du Stock</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {totalStockValue.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-bold text-[#E50914]">FCFA</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1C1F28] text-[11px] text-[#85878A]">
            <span>Valeur vente estimée :</span>
            <span className="text-white font-bold">{totalStockSellingValue.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        {/* Card 4: Chiffre d'Affaires en FCFA */}
        <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-semibold mb-2">
            <span>4. Chiffre d'Affaires Réalisé</span>
            <div className="w-7 h-7 rounded-lg bg-[#E50914]/15 text-[#E50914] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#E50914] tracking-tight">
            {turnover.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-bold text-white">FCFA</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1C1F28] text-[11px] text-[#85878A]">
            <span>Encaissé réel : {totalCashCollected.toLocaleString('fr-FR')} FCFA</span>
            <span className="text-emerald-400 font-bold">{sales.length} ventes</span>
          </div>
        </div>

        {/* Card 5: Bénéfices Réels Nets */}
        <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-semibold mb-2">
            <span>5. Bénéfices Réels Nets</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              netRealProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {netRealProfit.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-bold text-white">FCFA</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1C1F28] text-[11px] text-[#85878A]">
            <span>Marges réelles - Dépenses</span>
            <span className="text-white font-semibold">
              {turnover > 0 ? `${((netRealProfit / turnover) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Card 6: Dépenses d'Exploitation */}
        <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-semibold mb-2">
            <span>6. Dépenses d'Exploitation</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {totalExpenses.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-bold text-rose-400">FCFA</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1C1F28] text-[11px] text-[#85878A]">
            <span>Charges générales du parc</span>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-rose-400 hover:underline font-bold flex items-center gap-0.5"
            >
              Voir dépenses <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 7: Créances Clients (Reste à recouvrer) */}
        <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-semibold mb-2">
            <span>7. Créances Clients (Solde dû)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
            {clientDebt.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-bold text-white">FCFA</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1C1F28] text-[11px] text-[#85878A]">
            <span>Reste à percevoir sur ventes</span>
            <span className="text-white font-bold">{sales.filter((s) => (s.balanceDue || 0) > 0).length} dossiers</span>
          </div>
        </div>

        {/* Card 8: Ventes Mensuelles */}
        <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-semibold mb-2">
            <span>8. Ventes du Mois</span>
            <div className="w-7 h-7 rounded-lg bg-[#E50914]/15 text-[#E50914] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {monthlySales.length}{' '}
            <span className="text-sm font-semibold text-[#85878A]">ventes</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1C1F28] text-[11px] text-[#85878A]">
            <span>Volume du mois :</span>
            <span className="text-[#E50914] font-bold">{monthlySalesRevenue.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        {/* Card 9: Base de Données Hostinger / MySQL */}
        <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-semibold mb-2">
            <span>9. Base de Données & Sauvegarde</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-white tracking-tight mt-1">
            Prête pour Hostinger
          </div>
          <p className="text-[11px] text-[#85878A] mt-0.5">
            Schéma relationnel MySQL exportable pour phpMyAdmin
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1C1F28] text-[11px]">
            <span className="text-emerald-400 font-bold">Zéro données fictives</span>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-[#E50914] hover:underline font-bold"
            >
              Config MySQL →
            </button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE CHARTS & ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart (Ventes, Dépenses, Bénéfices) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Évolution Financière Mensuelle (FCFA)
              </h2>
              <p className="text-xs text-[#85878A]">
                Comparatif des ventes conclues et des dépenses sur les 6 derniers mois
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-xs text-[#85878A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E50914]" /> Ventes
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#85878A]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Dépenses
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D212B" vertical={false} />
                <XAxis dataKey="month" stroke="#85878A" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#85878A"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E1016',
                    border: '1px solid #2B303C',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${Number(val).toLocaleString('fr-FR')} FCFA`]}
                />
                <Bar dataKey="ventes" fill="#E50914" radius={[6, 6, 0, 0]} name="Ventes (FCFA)" />
                <Bar dataKey="depenses" fill="#5F6368" radius={[6, 6, 0, 0]} name="Dépenses (FCFA)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Breakdown Card */}
        <div className="p-5 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide mb-1">
              Répartition du Parc Automobile
            </h2>
            <p className="text-xs text-[#85878A] mb-4">
              État d'occupation et disponibilité en temps réel
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#13151D] border border-[#222631] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E50914]" />
                  <span className="text-xs font-semibold text-white">Disponible à la vente</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">{inStockVehicles.length} véhicules</span>
              </div>

              <div className="p-3 rounded-xl bg-[#13151D] border border-[#222631] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs font-semibold text-white">Sous réservation active</span>
                </div>
                <span className="text-xs font-bold text-amber-400 font-mono">{reservedVehicles.length} véhicules</span>
              </div>

              <div className="p-3 rounded-xl bg-[#13151D] border border-[#222631] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-white">Vendus & Livrés</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono">{soldVehicles.length} véhicules</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1C1F28] mt-4">
            <button
              onClick={() => setActiveTab('vehicles')}
              className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#161821] hover:bg-[#1E212C] border border-[#272B37] rounded-xl transition-colors"
            >
              Gérer l'inventaire complet →
            </button>
          </div>
        </div>
      </div>

      {/* RECENT SALES & TRANSACTIONS SUMMARY */}
      <div className="p-5 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Dernières Ventes Conclues
            </h2>
            <p className="text-xs text-[#85878A]">
              Transactions enregistrées avec acomptes et soldes restants
            </p>
          </div>
          <button
            onClick={() => setActiveTab('sales')}
            className="text-xs font-bold text-[#E50914] hover:underline flex items-center gap-1"
          >
            Voir toutes les ventes <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sales.length === 0 ? (
          <div className="py-8 text-center text-[#85878A]">
            <p className="text-xs">Aucune vente enregistrée pour l'instant.</p>
            <button
              onClick={onOpenSaleModal}
              className="mt-2 text-xs font-bold text-[#E50914] hover:underline"
            >
              + Enregistrer une première vente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-[#85878A] border-b border-[#20242E] pb-2">
                <tr>
                  <th className="py-2.5 px-3">N° Vente & Date</th>
                  <th className="py-2.5 px-3">Véhicule</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3 text-right">Prix Net</th>
                  <th className="py-2.5 px-3 text-right">Acompte</th>
                  <th className="py-2.5 px-3 text-right">Solde Dû</th>
                  <th className="py-2.5 px-3 text-center">Règlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B1E26]">
                {sales.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-[#12141C] transition-colors">
                    <td className="py-2.5 px-3 font-mono">
                      <span className="font-bold text-white block">{s.saleNumber}</span>
                      <span className="text-[10px] text-[#85878A]">{s.saleDate}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">{s.vehicleName}</td>
                    <td className="py-2.5 px-3 text-[#D8D9DB]">{s.clientName}</td>
                    <td className="py-2.5 px-3 text-right font-black text-white">
                      {(s.finalPrice || s.totalAmount || 0).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">
                      {(s.deposit || s.amountPaid || 0).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-400 font-semibold">
                      {(s.balanceDue || 0).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          (s.balanceDue || 0) === 0
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                            : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                        }`}
                      >
                        {(s.balanceDue || 0) === 0 ? 'Payé' : 'Acompte versé'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
