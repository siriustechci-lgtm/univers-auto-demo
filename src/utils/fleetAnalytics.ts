import {
  Vehicle,
  Sale,
  Rental,
  Reservation,
  Payment,
  Expense,
  MaintenanceIntervention,
  VehicleStatus,
} from '../types';

export interface VehicleExploitationStats {
  vehicle: Vehicle;
  currentStatus: VehicleStatus;
  
  // Activité
  rentalCount: number;
  activeRentalCount: number;
  saleCount: number;
  isSold: boolean;
  reservationCount: number;
  activeReservationCount: number;
  maintenanceCount: number;
  activeMaintenanceCount: number;
  totalDaysRented: number;

  // Revenus
  rentalRevenue: number;
  saleRevenue: number;
  otherRevenue: number;
  totalRevenue: number;

  // Dépenses
  maintenanceCost: number; // Entretien régulier (vidange, révision, etc.)
  repairsCost: number; // Réparations mécaniques / carrosserie
  insuranceCost: number; // Assurances
  fuelCost: number; // Carburant
  otherExpensesCost: number; // Autres charges
  totalExpenses: number;

  // Résultat
  netProfit: number;
  profitabilityPercentage: number;
  roiPercentage?: number; // Calculé par rapport au prix d'achat si renseigné
  costPerDayRented: number;
  revenuePerDayRented: number;

  // Historique unifié
  history: VehicleHistoryItem[];
}

export type VehicleHistoryItemType =
  | 'location'
  | 'vente'
  | 'reservation'
  | 'paiement'
  | 'entretien'
  | 'depense';

export interface VehicleHistoryItem {
  id: string;
  type: VehicleHistoryItemType;
  date: string;
  title: string;
  subtitle?: string;
  referenceNumber?: string;
  clientOrSupplier?: string;
  amount: number;
  isRevenue: boolean; // true = crédit/recette, false = débit/dépense
  status?: string;
  details?: string;
}

export interface FleetGlobalStats {
  totalVehicles: number;
  availableCount: number;
  rentedCount: number;
  reservedCount: number;
  maintenanceCount: number;
  soldCount: number;
  
  // Taux
  availabilityRate: number; // % de véhicules disponibles immédiatement
  occupancyRate: number; // % en location ou réservés
  maintenanceRate: number; // % en atelier

  // Financier global
  totalFleetRevenue: number;
  totalFleetRentalRevenue: number;
  totalFleetSaleRevenue: number;
  totalFleetExpenses: number;
  totalFleetMaintenanceExpenses: number;
  totalFleetNetProfit: number;
  globalProfitabilityRate: number;

  // Rotation & Exploitation
  totalRentalsCount: number;
  totalReservationsCount: number;
  totalMaintenancesCount: number;

  // Véhicules phares
  topProfitableVehicles: VehicleExploitationStats[];
  leastProfitableVehicles: VehicleExploitationStats[];
  mostRentedVehicles: VehicleExploitationStats[];
  underutilizedVehicles: VehicleExploitationStats[];
}

/**
 * Calcule les statistiques d'exploitation complètes pour un véhicule donné
 */
export function calculateVehicleExploitation(
  vehicle: Vehicle,
  allSales: Sale[],
  allRentals: Rental[],
  allReservations: Reservation[],
  allPayments: Payment[],
  allExpenses: Expense[],
  allMaintenances: MaintenanceIntervention[]
): VehicleExploitationStats {
  const vehicleSales = allSales.filter((s) => s.vehicleId === vehicle.id);
  const vehicleRentals = allRentals.filter((r) => r.vehicleId === vehicle.id);
  const vehicleReservations = allReservations.filter((res) => res.vehicleId === vehicle.id);
  const vehicleMaintenances = allMaintenances.filter((m) => m.vehicleId === vehicle.id);
  
  // Match expenses explicitly allocated to this vehicle or matching its registration/info
  const vehicleExpenses = allExpenses.filter(
    (e) =>
      e.vehicleId === vehicle.id ||
      (e.vehicleInfo && e.vehicleInfo.includes(vehicle.registration)) ||
      (e.description && e.description.includes(vehicle.registration))
  );

  // Activité
  const rentalCount = vehicleRentals.length;
  const activeRentals = vehicleRentals.filter((r) => r.status === 'En cours');
  const activeRentalCount = activeRentals.length;
  
  const saleCount = vehicleSales.length;
  const isSold = vehicle.status === 'Vendu' || saleCount > 0;

  const reservationCount = vehicleReservations.length;
  const activeReservations = vehicleReservations.filter(
    (res) => res.status === 'Réservée' || res.status === 'Confirmée'
  );
  const activeReservationCount = activeReservations.length;

  const maintenanceCount = vehicleMaintenances.length;
  const activeMaintenances = vehicleMaintenances.filter((m) => m.status === 'En cours');
  const activeMaintenanceCount = activeMaintenances.length;

  // Calcul du nombre total de jours loués
  let totalDaysRented = 0;
  vehicleRentals.forEach((r) => {
    if (r.durationDays) {
      totalDaysRented += r.durationDays;
    } else if (r.startDate && r.endDate) {
      const diff = Math.ceil(
        (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      totalDaysRented += Math.max(1, diff);
    }
  });

  // Revenus
  const rentalRevenue = vehicleRentals.reduce(
    (sum, r) => sum + (Number(r.amountPaid) || Number(r.totalAmount) || 0),
    0
  );
  const saleRevenue = vehicleSales.reduce(
    (sum, s) => sum + (Number(s.amountPaid) || Number(s.salePrice) || 0),
    0
  );
  const otherRevenue = 0;
  const totalRevenue = rentalRevenue + saleRevenue + otherRevenue;

  // Dépenses catégorisées
  let maintenanceCost = 0;
  let repairsCost = 0;
  let insuranceCost = 0;
  let fuelCost = 0;
  let otherExpensesCost = 0;

  // 1. Depuis les dépenses comptables
  vehicleExpenses.forEach((exp) => {
    const amt = Number(exp.amount) || 0;
    const cat = (exp.category || '').toLowerCase();
    if (cat.includes('assurance')) {
      insuranceCost += amt;
    } else if (cat.includes('carburant') || cat.includes('essence') || cat.includes('diesel')) {
      fuelCost += amt;
    } else if (cat.includes('réparation') || cat.includes('reparation') || cat.includes('carrosserie')) {
      repairsCost += amt;
    } else if (cat.includes('entretien') || cat.includes('vidange') || cat.includes('maintenance')) {
      maintenanceCost += amt;
    } else {
      otherExpensesCost += amt;
    }
  });

  // 2. Depuis les interventions de maintenance non déjà comptabilisées dans Expenses
  vehicleMaintenances.forEach((m) => {
    if (!m.expenseId && m.status !== 'Annulée') {
      const amt = Number(m.amount) || 0;
      if (m.type === 'Assurance') {
        insuranceCost += amt;
      } else if (m.type === 'Réparation moteur' || m.type === 'Réparation carrosserie') {
        repairsCost += amt;
      } else {
        maintenanceCost += amt;
      }
    }
  });

  const totalExpenses = maintenanceCost + repairsCost + insuranceCost + fuelCost + otherExpensesCost;

  // Résultat net
  const netProfit = totalRevenue - totalExpenses;
  const profitabilityPercentage =
    totalRevenue > 0
      ? (netProfit / totalRevenue) * 100
      : totalExpenses > 0
      ? -100
      : 0;

  const purchaseVal = Number(vehicle.purchasePrice) || Number(vehicle.sellingPrice) || 0;
  const roiPercentage = purchaseVal > 0 ? (netProfit / purchaseVal) * 100 : undefined;

  const costPerDayRented = totalDaysRented > 0 ? totalExpenses / totalDaysRented : 0;
  const revenuePerDayRented = totalDaysRented > 0 ? totalRevenue / totalDaysRented : 0;

  // Statut réel en temps réel
  let currentStatus: VehicleStatus = vehicle.status;
  if (activeMaintenanceCount > 0) {
    currentStatus = 'En maintenance';
  } else if (activeRentalCount > 0) {
    currentStatus = 'Loué';
  } else if (activeReservationCount > 0) {
    currentStatus = 'Réservé';
  } else if (isSold) {
    currentStatus = 'Vendu';
  } else {
    currentStatus = 'Disponible';
  }

  // Historique unifié
  const history: VehicleHistoryItem[] = [];

  // Ventes
  vehicleSales.forEach((s) => {
    history.push({
      id: `hist_sale_${s.id}`,
      type: 'vente',
      date: s.saleDate || s.createdAt,
      title: `Vente du véhicule (${s.saleNumber})`,
      subtitle: `Vendu à ${s.clientName}`,
      referenceNumber: s.saleNumber,
      clientOrSupplier: s.clientName,
      amount: Number(s.salePrice) || 0,
      isRevenue: true,
      status: s.paymentStatus,
      details: `Prix de vente : ${s.salePrice} | Payé : ${s.amountPaid}`,
    });
  });

  // Locations
  vehicleRentals.forEach((r) => {
    history.push({
      id: `hist_rent_${r.id}`,
      type: 'location',
      date: r.startDate || r.createdAt,
      title: `Contrat de location (${r.rentalNumber})`,
      subtitle: `Client : ${r.clientName} (${r.durationDays || 1} jours)`,
      referenceNumber: r.rentalNumber,
      clientOrSupplier: r.clientName,
      amount: Number(r.totalAmount) || 0,
      isRevenue: true,
      status: r.status,
      details: `Du ${r.startDate} au ${r.endDate} — ${r.paymentStatus}`,
    });
  });

  // Réservations
  vehicleReservations.forEach((res) => {
    history.push({
      id: `hist_res_${res.id}`,
      type: 'reservation',
      date: res.date || res.createdAt,
      title: `Réservation (${res.reservationNumber})`,
      subtitle: `Client : ${res.clientName}`,
      referenceNumber: res.reservationNumber,
      clientOrSupplier: res.clientName,
      amount: Number(res.depositAmount) || 0,
      isRevenue: true,
      status: res.status,
      details: `Période prévue : ${res.startDate} au ${res.endDate}`,
    });
  });

  // Entretiens & Maintenances
  vehicleMaintenances.forEach((m) => {
    history.push({
      id: `hist_maint_${m.id}`,
      type: 'entretien',
      date: m.date || m.createdAt,
      title: `Maintenance : ${m.type} (${m.referenceNumber})`,
      subtitle: `Prestataire : ${m.supplier}`,
      referenceNumber: m.referenceNumber,
      clientOrSupplier: m.supplier,
      amount: Number(m.amount) || 0,
      isRevenue: false,
      status: m.status,
      details: m.description,
    });
  });

  // Dépenses directes non issues de maintenance
  vehicleExpenses.forEach((exp) => {
    if (!history.some((h) => h.details && h.details.includes(exp.expenseNumber))) {
      history.push({
        id: `hist_exp_${exp.id}`,
        type: 'depense',
        date: exp.date || exp.createdAt,
        title: `Dépense : ${exp.category} (${exp.expenseNumber})`,
        subtitle: exp.beneficiary || exp.supplier || 'Fournisseur externe',
        referenceNumber: exp.expenseNumber,
        clientOrSupplier: exp.beneficiary || exp.supplier,
        amount: Number(exp.amount) || 0,
        isRevenue: false,
        status: 'Réglée',
        details: exp.description,
      });
    }
  });

  // Tri chronologique décroissant (le plus récent d'abord)
  history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    vehicle,
    currentStatus,
    rentalCount,
    activeRentalCount,
    saleCount,
    isSold,
    reservationCount,
    activeReservationCount,
    maintenanceCount,
    activeMaintenanceCount,
    totalDaysRented,
    rentalRevenue,
    saleRevenue,
    otherRevenue,
    totalRevenue,
    maintenanceCost,
    repairsCost,
    insuranceCost,
    fuelCost,
    otherExpensesCost,
    totalExpenses,
    netProfit,
    profitabilityPercentage,
    roiPercentage,
    costPerDayRented,
    revenuePerDayRented,
    history,
  };
}

/**
 * Calcule la vue globale et analytique du parc automobile entier
 */
export function calculateFleetGlobalStats(
  vehicles: Vehicle[],
  sales: Sale[],
  rentals: Rental[],
  reservations: Reservation[],
  payments: Payment[],
  expenses: Expense[],
  maintenances: MaintenanceIntervention[]
): FleetGlobalStats {
  const exploitationList = vehicles.map((v) =>
    calculateVehicleExploitation(v, sales, rentals, reservations, payments, expenses, maintenances)
  );

  const totalVehicles = vehicles.length;
  const availableCount = exploitationList.filter((e) => e.currentStatus === 'Disponible').length;
  const rentedCount = exploitationList.filter((e) => e.currentStatus === 'Loué').length;
  const reservedCount = exploitationList.filter((e) => e.currentStatus === 'Réservé').length;
  const maintenanceCount = exploitationList.filter((e) => e.currentStatus === 'En maintenance').length;
  const soldCount = exploitationList.filter((e) => e.currentStatus === 'Vendu').length;

  const activeFleetCount = totalVehicles - soldCount;
  const availabilityRate = activeFleetCount > 0 ? (availableCount / activeFleetCount) * 100 : 0;
  const occupancyRate = activeFleetCount > 0 ? ((rentedCount + reservedCount) / activeFleetCount) * 100 : 0;
  const maintenanceRate = activeFleetCount > 0 ? (maintenanceCount / activeFleetCount) * 100 : 0;

  // Financier global du parc
  const totalFleetRentalRevenue = exploitationList.reduce((acc, e) => acc + e.rentalRevenue, 0);
  const totalFleetSaleRevenue = exploitationList.reduce((acc, e) => acc + e.saleRevenue, 0);
  const totalFleetRevenue = totalFleetRentalRevenue + totalFleetSaleRevenue;

  const totalFleetExpenses = exploitationList.reduce((acc, e) => acc + e.totalExpenses, 0);
  const totalFleetMaintenanceExpenses = exploitationList.reduce(
    (acc, e) => acc + (e.maintenanceCost + e.repairsCost),
    0
  );
  const totalFleetNetProfit = totalFleetRevenue - totalFleetExpenses;
  const globalProfitabilityRate =
    totalFleetRevenue > 0
      ? (totalFleetNetProfit / totalFleetRevenue) * 100
      : totalFleetExpenses > 0
      ? -100
      : 0;

  const totalRentalsCount = rentals.length;
  const totalReservationsCount = reservations.length;
  const totalMaintenancesCount = maintenances.length;

  // Classements analytiques
  const sortedByProfit = [...exploitationList].sort((a, b) => b.netProfit - a.netProfit);
  const topProfitableVehicles = sortedByProfit.filter((e) => e.netProfit > 0).slice(0, 5);
  const leastProfitableVehicles = [...exploitationList]
    .sort((a, b) => a.netProfit - b.netProfit)
    .filter((e) => e.totalExpenses > 0 || e.netProfit < 0)
    .slice(0, 5);

  const mostRentedVehicles = [...exploitationList]
    .sort((a, b) => b.rentalCount - a.rentalCount)
    .filter((e) => e.rentalCount > 0)
    .slice(0, 5);

  const underutilizedVehicles = [...exploitationList]
    .filter((e) => e.currentStatus !== 'Vendu')
    .sort((a, b) => a.rentalCount - b.rentalCount)
    .slice(0, 5);

  return {
    totalVehicles,
    availableCount,
    rentedCount,
    reservedCount,
    maintenanceCount,
    soldCount,
    availabilityRate,
    occupancyRate,
    maintenanceRate,
    totalFleetRevenue,
    totalFleetRentalRevenue,
    totalFleetSaleRevenue,
    totalFleetExpenses,
    totalFleetMaintenanceExpenses,
    totalFleetNetProfit,
    globalProfitabilityRate,
    totalRentalsCount,
    totalReservationsCount,
    totalMaintenancesCount,
    topProfitableVehicles,
    leastProfitableVehicles,
    mostRentedVehicles,
    underutilizedVehicles,
  };
}
