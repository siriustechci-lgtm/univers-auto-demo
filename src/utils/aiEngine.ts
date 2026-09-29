import {
  Vehicle,
  Client,
  Sale,
  Rental,
  Payment,
  Expense,
  OtherRevenue,
  Reservation,
  MaintenanceIntervention,
  Supplier,
  Prospect,
  AgencySettings,
  AiMessage,
  AiSettings,
  AiStatCard,
  AiSmartInsight,
  NavigationTab,
  User,
  CrmModule,
  PermissionAction,
} from '../types';

export interface CrmDataSnapshot {
  vehicles: Vehicle[];
  clients: Client[];
  sales: Sale[];
  rentals: Rental[];
  payments: Payment[];
  expenses?: Expense[];
  otherRevenues?: OtherRevenue[];
  reservations?: Reservation[];
  maintenances?: MaintenanceIntervention[];
  suppliers?: Supplier[];
  prospects?: Prospect[];
  settings: AgencySettings;
  aiSettings?: AiSettings;
  currentUser?: User | null;
  hasPermission?: (tab: NavigationTab) => boolean;
  hasModulePermission?: (module: CrmModule, action: PermissionAction) => boolean;
}

// Helper to format currency
export const formatCurrency = (amount: number, currency = 'FCFA'): string => {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0))} ${currency}`;
};

// Helper date comparison
const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const isCurrentMonth = (d: Date, now = new Date()) => {
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

const isPreviousMonth = (d: Date, now = new Date()) => {
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getFullYear() === prevMonth.getFullYear() && d.getMonth() === prevMonth.getMonth();
};

const isWithinLastDays = (d: Date, days: number, now = new Date()) => {
  const diffTime = now.getTime() - d.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  return diffDays >= 0 && diffDays <= days;
};

// Normalize text for flexible NLP intent matching
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

// Check if user has permission to view financial / sensitive data
export const canViewFinancials = (snapshot: CrmDataSnapshot): boolean => {
  if (!snapshot.currentUser) return true;
  const role = snapshot.currentUser.role;
  if (role === 'Administrateur') return true;
  if (role === 'Gestionnaire') return true;
  if (role === 'Caissier') return true;
  if (snapshot.hasPermission && snapshot.hasPermission('payments')) return true;
  if (snapshot.hasModulePermission && snapshot.hasModulePermission('Paiements', 'voir')) return true;
  return false;
};

// Check if user has permission to view expenses
export const canViewExpenses = (snapshot: CrmDataSnapshot): boolean => {
  if (!snapshot.currentUser) return true;
  const role = snapshot.currentUser.role;
  if (role === 'Administrateur') return true;
  if (role === 'Gestionnaire') return true;
  if (snapshot.hasPermission && snapshot.hasPermission('expenses')) return true;
  if (snapshot.hasModulePermission && snapshot.hasModulePermission('Dépenses', 'voir')) return true;
  return false;
};

// Permission denial response generator
const buildPermissionDeniedResponse = (moduleName = 'ces informations financières'): Omit<AiMessage, 'id' | 'timestamp'> => {
  return {
    role: 'assistant',
    category: 'general',
    content: `🔒 **Accès restreint**\n\nVous n'avez pas l'autorisation d'accéder à ${moduleName}.\n\nConformément aux règles de sécurité et aux permissions de votre profil utilisateur, ces données sont réservées à la direction et aux gestionnaires habilités.`,
    statsCards: [
      { label: 'Contrôle RBAC', value: 'Non autorisé', type: 'warning' },
    ],
    actionLinks: [
      { label: 'Tableau de bord', tab: 'dashboard' },
    ],
  };
};

export const processAiQuery = (
  rawQuery: string,
  crmData: CrmDataSnapshot
): Omit<AiMessage, 'id' | 'timestamp'> => {
  const query = normalizeText(rawQuery);
  const now = new Date();
  const {
    vehicles,
    clients,
    sales,
    rentals,
    payments,
    expenses = [],
    otherRevenues = [],
    reservations = [],
    maintenances = [],
    suppliers = [],
    prospects = [],
    settings,
  } = crmData;
  const currency = settings.currencySymbol || settings.currency || 'FCFA';

  // -------------------------------------------------------------
  // 0. CONVERSATIONAL INTENTS (GREETINGS, POLITE CHAT, CAPABILITIES)
  // -------------------------------------------------------------
  if (
    query === 'bonjour' ||
    query === 'salut' ||
    query === 'hello' ||
    query === 'bonsoir' ||
    query === 'coucou' ||
    query.startsWith('bonjour ') ||
    query.startsWith('salut ') ||
    query.startsWith('bonsoir ')
  ) {
    return {
      role: 'assistant',
      category: 'general',
      content: "Bonjour ! Comment puis-je vous aider aujourd'hui dans la gestion de votre activité automobile ?",
      actionLinks: [
        { label: 'Tableau de bord', tab: 'dashboard' },
        { label: 'Parc de véhicules', tab: 'vehicles' },
      ],
    };
  }

  if (
    query === 'merci' ||
    query === 'merci beaucoup' ||
    query === 'super merci' ||
    query.startsWith('merci ')
  ) {
    return {
      role: 'assistant',
      category: 'general',
      content: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions sur vos véhicules, locations, ventes ou paiements.",
    };
  }

  if (
    query.includes('comment vas tu') ||
    query.includes('comment va tu') ||
    query.includes('ca va') ||
    query.includes('comment allez vous')
  ) {
    return {
      role: 'assistant',
      category: 'general',
      content: "Je vais très bien, merci ! Prêt à vous assister dans le pilotage de votre parc automobile et le suivi de vos opérations.",
    };
  }

  if (
    query.includes('qui es tu') ||
    query.includes('que peux tu faire') ||
    query.includes('que sais tu faire') ||
    query.includes('quelles sont tes fonctionnalites') ||
    query.includes('aide moi') ||
    query.includes('aide ia')
  ) {
    let content = `Je suis votre **Assistant IA** dédié à la gestion de votre concession et agence de location.\n\n`;
    content += `Voici les domaines sur lesquels je peux vous renseigner en direct :\n\n`;
    content += `• 🚗 **Parc de véhicules** : Véhicules disponibles, loués, vendus, kilométrages ou contrôles techniques.\n`;
    content += `• 🔑 **Locations** : Contrats actifs, véhicules en retard de restitution, restitutions prévues.\n`;
    content += `• 🛒 **Ventes** : Ventes du mois, bilans commerciaux, dernières transactions.\n`;
    content += `• 💳 **Finances & Trésorerie** : Montants encaissés, chiffre d'affaires, créances et soldes impayés.\n`;
    content += `• 📊 **Synthèses** : Résumé du jour, de la semaine ou du mois.`;

    return {
      role: 'assistant',
      category: 'general',
      content,
      actionLinks: [
        { label: 'Tableau de bord', tab: 'dashboard' },
        { label: 'Parc de véhicules', tab: 'vehicles' },
        { label: 'Locations', tab: 'quick-rental' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 0.1 SPECIFIC ENTITY CHECKS: "COMBIEN DE VÉHICULES AVONS-NOUS ?", ETC.
  // -------------------------------------------------------------
  if (
    query.includes('combien de vehicules avons nous') ||
    query.includes('combien de vehicule') ||
    query.includes('nombre de vehicule') ||
    query.includes('taille du parc') ||
    query.includes('total des vehicules')
  ) {
    if (vehicles.length === 0) {
      return {
        role: 'assistant',
        category: 'vehicules',
        content: "Je n'ai encore aucun véhicule enregistré dans votre CRM. Vous pouvez ajouter votre premier véhicule depuis le module Parc Automobile.",
        statsCards: [{ label: 'Total véhicules', value: '0', type: 'neutral' }],
        actionLinks: [{ label: 'Ajouter un véhicule', tab: 'vehicles' }],
      };
    }

    const availableCount = vehicles.filter((v) => v.status === 'Disponible').length;
    const rentedCount = vehicles.filter((v) => v.status === 'Loué').length;
    const soldCount = vehicles.filter((v) => v.status === 'Vendu').length;
    const maintenanceCount = vehicles.filter((v) => v.status === 'En maintenance').length;
    const reservedCount = vehicles.filter((v) => v.status === 'Réservé').length;

    let content = `🚗 Vous avez actuellement **${vehicles.length} véhicule(s)** enregistré(s) dans votre parc :\n\n`;
    content += `• **${availableCount}** disponible(s)\n`;
    content += `• **${rentedCount}** actuellement loué(s)\n`;
    if (reservedCount > 0) content += `• **${reservedCount}** réservé(s)\n`;
    if (maintenanceCount > 0) content += `• **${maintenanceCount}** en maintenance\n`;
    if (soldCount > 0) content += `• **${soldCount}** vendu(s)\n`;

    return {
      role: 'assistant',
      category: 'vehicules',
      content,
      statsCards: [
        { label: 'Total parc', value: `${vehicles.length}`, type: 'neutral' },
        { label: 'Disponibles', value: `${availableCount}`, type: availableCount > 0 ? 'positive' : 'warning' },
        { label: 'Loués', value: `${rentedCount}`, type: 'neutral' },
      ],
      actionLinks: [{ label: 'Parc de véhicules', tab: 'vehicles' }],
    };
  }

  // "COMBIEN AVONS-NOUS VENDU CE MOIS-CI ?"
  if (
    query.includes('combien avons nous vendu') ||
    query.includes('combien avons-nous vendu') ||
    query.includes('combien de ventes ce mois') ||
    query.includes('ventes de ce mois') ||
    query.includes('ventes realisees ce mois')
  ) {
    const monthSales = sales.filter((s) => isCurrentMonth(new Date(s.saleDate || s.createdAt), now));
    const totalMonthSalesRev = monthSales.reduce((acc, s) => acc + (s.totalAmount || s.salePrice || 0), 0);

    if (sales.length === 0) {
      return {
        role: 'assistant',
        category: 'ventes',
        content: "Je n'ai encore aucune vente enregistrée dans votre CRM.",
        statsCards: [{ label: 'Ventes ce mois', value: '0', type: 'neutral' }],
        actionLinks: [{ label: 'Nouvelle vente', tab: 'quick-sale' }],
      };
    }

    let content = `🛒 **Ventes du mois en cours (${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })})** :\n\n`;
    if (monthSales.length === 0) {
      content += `Aucune vente n'a encore été réalisée ce mois-ci. (Total historique : ${sales.length} vente(s)).`;
    } else {
      content += `Vous avez réalisé **${monthSales.length} vente(s)** ce mois-ci`;
      if (canViewFinancials(crmData)) {
        content += ` pour un montant total de **${formatCurrency(totalMonthSalesRev, currency)}**.\n\n`;
        content += `Détails des véhicules vendus :\n`;
        monthSales.forEach((s, idx) => {
          content += `${idx + 1}. **${s.vehicleName}** (${s.vehicleRegistration}) → **${s.clientName}** — ${formatCurrency(s.totalAmount || s.salePrice || 0, currency)}\n`;
        });
      } else {
        content += `.\n\nDétails des véhicules vendus :\n`;
        monthSales.forEach((s, idx) => {
          content += `${idx + 1}. **${s.vehicleName}** (${s.vehicleRegistration}) → **${s.clientName}**\n`;
        });
      }
    }

    return {
      role: 'assistant',
      category: 'ventes',
      content,
      statsCards: [
        { label: 'Ventes du mois', value: `${monthSales.length}`, type: monthSales.length > 0 ? 'positive' : 'neutral' },
        { label: 'CA Ventes mois', value: canViewFinancials(crmData) ? formatCurrency(totalMonthSalesRev, currency) : `${monthSales.length} unités`, type: 'positive' },
      ],
      actionLinks: [{ label: 'Gestion des ventes', tab: 'quick-sale' }],
    };
  }

  // "QUELS CONTRATS SONT ACTUELLEMENT ACTIFS ?"
  if (
    query.includes('quels contrats sont actuellement actifs') ||
    query.includes('contrats actuellement actifs') ||
    query.includes('contrats actifs') ||
    query.includes('locations actives')
  ) {
    const activeRentals = rentals.filter((r) => r.status === 'En cours');

    if (rentals.length === 0) {
      return {
        role: 'assistant',
        category: 'locations',
        content: "Je n'ai encore aucun contrat de location enregistré dans votre CRM.",
        statsCards: [{ label: 'Contrats actifs', value: '0', type: 'neutral' }],
        actionLinks: [{ label: 'Créer une location', tab: 'quick-rental' }],
      };
    }

    if (activeRentals.length === 0) {
      return {
        role: 'assistant',
        category: 'locations',
        content: `Il n'y a actuellement **aucun contrat de location actif** en cours. (Sur un total historique de ${rentals.length} contrat(s) enregistrés).`,
        statsCards: [
          { label: 'Contrats actifs', value: '0', type: 'neutral' },
          { label: 'Total historique', value: `${rentals.length}`, type: 'neutral' },
        ],
        actionLinks: [{ label: 'Nouvelle location', tab: 'quick-rental' }],
      };
    }

    let content = `🔑 Vous avez actuellement **${activeRentals.length} contrat(s) de location actif(s)** :\n\n`;
    activeRentals.forEach((r, idx) => {
      const endStr = new Date(r.endDate).toLocaleDateString('fr-FR');
      content += `${idx + 1}. Contrat **${r.rentalNumber || 'LOC'}** : **${r.vehicleName}** (${r.vehicleRegistration})\n`;
      content += `   ↳ Locataire : **${r.clientName}** (📞 ${r.clientPhone || 'N/C'})\n`;
      content += `   ↳ Restitution prévue le : **${endStr}**\n`;
    });

    return {
      role: 'assistant',
      category: 'locations',
      content,
      statsCards: [
        { label: 'Contrats actifs', value: `${activeRentals.length}`, type: 'positive' },
        { label: 'Flotte totale', value: `${vehicles.length}`, type: 'neutral' },
      ],
      actionLinks: [{ label: 'Gérer les locations', tab: 'quick-rental' }],
    };
  }

  // "COMBIEN DE CLIENTS AVONS-NOUS ?"
  if (
    query.includes('combien de clients') ||
    query.includes('nombre de client') ||
    query.includes('total des clients')
  ) {
    if (clients.length === 0) {
      return {
        role: 'assistant',
        category: 'clients',
        content: "Je n'ai encore aucun client enregistré dans votre CRM.",
        statsCards: [{ label: 'Total clients', value: '0', type: 'neutral' }],
        actionLinks: [{ label: 'Ajouter un client', tab: 'clients' }],
      };
    }

    const individuals = clients.filter((c) => c.type === 'particulier').length;
    const companies = clients.filter((c) => c.type === 'entreprise').length;

    let content = `👥 Vous avez **${clients.length} client(s)** enregistré(s) dans votre CRM :\n\n`;
    content += `• **${individuals}** particulier(s)\n`;
    content += `• **${companies}** entreprise(s)\n`;

    return {
      role: 'assistant',
      category: 'clients',
      content,
      statsCards: [
        { label: 'Total clients', value: `${clients.length}`, type: 'neutral' },
        { label: 'Particuliers', value: `${individuals}`, type: 'neutral' },
        { label: 'Entreprises', value: `${companies}`, type: 'neutral' },
      ],
      actionLinks: [{ label: 'Fichier clients', tab: 'clients' }],
    };
  }

  // -------------------------------------------------------------
  // 1. INTENT: COMMENT VA MON ACTIVITÉ ? (General Business Health)
  // -------------------------------------------------------------
  if (
    query.includes('comment va mon activite') ||
    query.includes('comment va l activite') ||
    query.includes('comment se porte l activite') ||
    query.includes('sante de mon activite') ||
    query.includes('etat de l activite') ||
    query.includes('bilan global')
  ) {
    const activeRentals = rentals.filter((r) => r.status === 'En cours');
    const availableVehicles = vehicles.filter((v) => v.status === 'Disponible');
    const maintenanceVehicles = vehicles.filter((v) => v.status === 'En maintenance');
    const overdueRentals = rentals.filter((r) => {
      if (r.status !== 'En cours') return false;
      const end = new Date(r.endDate);
      return end.getTime() < now.getTime() && !isSameDay(end, now);
    });
    const unpaidSales = sales.filter((s) => (s.balanceDue || 0) > 0);
    const unpaidRentals = rentals.filter((r) => (r.balanceDue || 0) > 0);

    const monthSales = sales.filter((s) => isCurrentMonth(new Date(s.saleDate || s.createdAt), now));
    const monthRentals = rentals.filter((r) => isCurrentMonth(new Date(r.startDate || r.createdAt), now));
    const monthSalesRev = monthSales.reduce((acc, s) => acc + (s.totalAmount || s.salePrice || 0), 0);
    const monthRentalsRev = monthRentals.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
    const totalMonthRev = monthSalesRev + monthRentalsRev;

    const occupancyRate =
      vehicles.length > 0 ? Math.round((activeRentals.length / vehicles.length) * 100) : 0;

    let content = `📈 **Diagnostic de Santé de Votre Activité** :\n\n`;

    if (canViewFinancials(crmData)) {
      content += `• **Chiffre d'affaires ce mois** : **${formatCurrency(totalMonthRev, currency)}** (${monthSales.length} vente(s), ${monthRentals.length} location(s)).\n`;
    } else {
      content += `• **Volume commercial ce mois** : ${monthSales.length} véhicule(s) vendu(s) et ${monthRentals.length} nouveau(x) contrat(s) de location.\n`;
    }

    content += `• **Taux d'occupation de la flotte** : **${occupancyRate}%** (${activeRentals.length} véhicule(s) sur les routes sur ${vehicles.length} au total).\n`;
    content += `• **Disponibilité immédiate** : ${availableVehicles.length} véhicule(s) prêts pour vente ou location.\n`;

    if (maintenanceVehicles.length > 0) {
      content += `• **Au garage / maintenance** : ${maintenanceVehicles.length} véhicule(s) en atelier.\n`;
    }

    if (overdueRentals.length > 0 || unpaidSales.length > 0 || unpaidRentals.length > 0) {
      content += `\n⚠️ **Points de vigilance opérationnels** :\n`;
      if (overdueRentals.length > 0) {
        content += `  - ${overdueRentals.length} véhicule(s) en retard de restitution.\n`;
      }
      if (unpaidSales.length + unpaidRentals.length > 0 && canViewFinancials(crmData)) {
        const totalDue =
          unpaidSales.reduce((acc, s) => acc + (s.balanceDue || 0), 0) +
          unpaidRentals.reduce((acc, r) => acc + (r.balanceDue || 0), 0);
        content += `  - ${unpaidSales.length + unpaidRentals.length} créance(s) en attente pour un montant de **${formatCurrency(totalDue, currency)}**.\n`;
      }
    } else {
      content += `\n✅ **Aucun retard ni impayé critique** à signaler. Votre gestion opérationnelle est au vert !`;
    }

    return {
      role: 'assistant',
      category: 'resume',
      content,
      statsCards: [
        { label: 'Taux occupation', value: `${occupancyRate}%`, type: occupancyRate > 50 ? 'positive' : 'neutral' },
        { label: 'Locations en cours', value: `${activeRentals.length}`, type: 'positive' },
        { label: 'Véhicules dispo', value: `${availableVehicles.length}`, type: availableVehicles.length > 0 ? 'positive' : 'warning' },
        { label: 'Retards', value: `${overdueRentals.length}`, type: overdueRentals.length > 0 ? 'negative' : 'positive' },
      ],
      actionLinks: [
        { label: 'Voir le tableau de bord', tab: 'dashboard' },
        { label: 'Gérer les locations', tab: 'quick-rental' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 2. INTENT: CHIFFRE D'AFFAIRES / REVENUS / ENCAISSEMENTS
  // -------------------------------------------------------------
  if (
    query.includes('chiffre d affaire') ||
    query.includes('chiffre d\'affaire') ||
    query.includes('quel est mon chiffre') ||
    query.includes('notre ca') ||
    query.includes('total de nos revenus') ||
    (query.includes('combien') && query.includes('gagne'))
  ) {
    if (!canViewFinancials(crmData)) {
      return buildPermissionDeniedResponse('au chiffre d\'affaires global et aux indicateurs financiers');
    }

    const monthSales = sales.filter((s) => isCurrentMonth(new Date(s.saleDate || s.createdAt), now));
    const monthRentals = rentals.filter((r) => isCurrentMonth(new Date(r.startDate || r.createdAt), now));
    const salesRev = monthSales.reduce((acc, s) => acc + (s.totalAmount || s.salePrice || 0), 0);
    const rentalsRev = monthRentals.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
    const totalRev = salesRev + rentalsRev;

    const totalHistoricalSales = sales.reduce((acc, s) => acc + (s.totalAmount || s.salePrice || 0), 0);
    const totalHistoricalRentals = rentals.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
    const totalHistorical = totalHistoricalSales + totalHistoricalRentals;

    let content = `💰 **Chiffre d'Affaires (${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })})** :\n\n`;
    content += `• **Chiffre d'Affaires du mois en cours** : **${formatCurrency(totalRev, currency)}**\n`;
    content += `  - 🛒 Ventes : **${formatCurrency(salesRev, currency)}** (${monthSales.length} transaction(s))\n`;
    content += `  - 🔑 Locations : **${formatCurrency(rentalsRev, currency)}** (${monthRentals.length} contrat(s))\n\n`;
    content += `• **Chiffre d'Affaires Cumulé Historique** : **${formatCurrency(totalHistorical, currency)}** (${sales.length} ventes + ${rentals.length} locations au total).`;

    return {
      role: 'assistant',
      category: 'ventes',
      content,
      statsCards: [
        { label: 'CA du mois', value: formatCurrency(totalRev, currency), type: totalRev > 0 ? 'positive' : 'neutral' },
        { label: 'Ventes du mois', value: formatCurrency(salesRev, currency), type: 'neutral' },
        { label: 'Locations du mois', value: formatCurrency(rentalsRev, currency), type: 'neutral' },
        { label: 'CA Total Cumulé', value: formatCurrency(totalHistorical, currency), type: 'positive' },
      ],
      actionLinks: [
        { label: 'Voir les rapports', tab: 'reports' },
        { label: 'Gestion des ventes', tab: 'quick-sale' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 3. INTENT: COMBIEN AI-JE ENCAISSÉ ? (Cash Collections)
  // -------------------------------------------------------------
  if (
    query.includes('combien ai-je encaisse') ||
    query.includes('combien ai je encaisse') ||
    query.includes('combien avons nous encaisse') ||
    query.includes('montant encaisse') ||
    query.includes('total encaisse') ||
    query.includes('encaissements')
  ) {
    if (!canViewFinancials(crmData)) {
      return buildPermissionDeniedResponse('aux encaissements et à la trésorerie');
    }

    const todayPayments = payments.filter((p) => isSameDay(new Date(p.paymentDate || p.createdAt), now));
    const monthPayments = payments.filter((p) => isCurrentMonth(new Date(p.paymentDate || p.createdAt), now));

    const todayCollected = todayPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const monthCollected = monthPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    let content = `💵 **Bilan des Encaissements Réels** :\n\n`;
    content += `• **Aujourd'hui (${now.toLocaleDateString('fr-FR')})** : **${formatCurrency(todayCollected, currency)}** sur ${todayPayments.length} paiement(s).\n`;
    content += `• **Ce mois-ci (${now.toLocaleDateString('fr-FR', { month: 'long' })})** : **${formatCurrency(monthCollected, currency)}** sur ${monthPayments.length} règlement(s).\n`;
    content += `• **Total historique encaissé** : **${formatCurrency(totalCollected, currency)}** (${payments.length} reçus enregistrés).\n\n`;

    if (monthPayments.length > 0) {
      content += `Derniers règlements perçus :\n`;
      monthPayments.slice(0, 4).forEach((p, idx) => {
        content += `${idx + 1}. **${p.clientName}** — **${formatCurrency(p.amount, currency)}** via ${p.paymentMethod || 'Espèces'} (${p.referenceTitle || p.referenceType || 'Règlement'})\n`;
      });
    }

    return {
      role: 'assistant',
      category: 'paiements',
      content,
      statsCards: [
        { label: 'Encaissé aujourd\'hui', value: formatCurrency(todayCollected, currency), type: todayCollected > 0 ? 'positive' : 'neutral' },
        { label: 'Encaissé ce mois', value: formatCurrency(monthCollected, currency), type: 'positive' },
        { label: 'Règlements ce mois', value: `${monthPayments.length}`, type: 'neutral' },
      ],
      actionLinks: [
        { label: 'Gérer les paiements', tab: 'payments' },
        { label: 'Journal comptable', tab: 'accounting' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 4. INTENT: QUELLES SONT MES VENTES ? (Sales List & Analytics)
  // -------------------------------------------------------------
  if (
    query.includes('quelles sont mes ventes') ||
    query.includes('mes ventes') ||
    query.includes('liste des ventes') ||
    query.includes('dernieres ventes') ||
    query.includes('combien de vente') ||
    query.includes('combien de vehicule vendu')
  ) {
    const monthSales = sales.filter((s) => isCurrentMonth(new Date(s.saleDate || s.createdAt), now));
    const totalSalesAmount = monthSales.reduce((acc, s) => acc + (s.totalAmount || s.salePrice || 0), 0);

    let content = `🛒 **Rapport des Ventes de Véhicules** :\n\n`;
    content += `• **Ventes ce mois-ci** : **${monthSales.length} véhicule(s)** vendu(s)`;
    if (canViewFinancials(crmData)) {
      content += ` pour un total de **${formatCurrency(totalSalesAmount, currency)}**.\n`;
    } else {
      content += `.\n`;
    }
    content += `• **Total historique** : ${sales.length} vente(s) enregistrée(s) au CRM.\n\n`;

    if (sales.length === 0) {
      content += `Aucune vente de véhicule n'a encore été enregistrée.`;
    } else {
      content += `Voici les dernières transactions de vente :\n`;
      sales.slice(0, 5).forEach((s, idx) => {
        const dateStr = s.saleDate || s.createdAt ? new Date(s.saleDate || s.createdAt).toLocaleDateString('fr-FR') : '-';
        content += `${idx + 1}. **${s.vehicleName}** (${s.vehicleRegistration}) → **${s.clientName}**`;
        if (canViewFinancials(crmData)) {
          content += ` — ${formatCurrency(s.totalAmount || s.salePrice || 0, currency)} (Statut: ${s.paymentStatus || 'Validé'})`;
        }
        content += ` [${dateStr}]\n`;
      });
    }

    const rows = sales.slice(0, 5).map((s) => [
      s.saleNumber || 'VNT',
      s.vehicleName || 'Véhicule',
      s.clientName || 'Client',
      canViewFinancials(crmData) ? formatCurrency(s.totalAmount || s.salePrice || 0, currency) : '***',
      s.paymentStatus || 'Enregistré',
    ]);

    return {
      role: 'assistant',
      category: 'ventes',
      content,
      statsCards: [
        { label: 'Ventes du mois', value: `${monthSales.length}`, type: monthSales.length > 0 ? 'positive' : 'neutral' },
        { label: 'Total historique', value: `${sales.length}`, type: 'neutral' },
      ],
      tableData:
        rows.length > 0
          ? {
              headers: ['N° Vente', 'Véhicule', 'Client', 'Montant', 'Statut'],
              rows,
            }
          : undefined,
      actionLinks: [{ label: 'Accéder aux ventes', tab: 'quick-sale' }],
    };
  }

  // -------------------------------------------------------------
  // 5. INTENT: QUELS VÉHICULES SONT ACTUELLEMENT LOUÉS ?
  // -------------------------------------------------------------
  if (
    query.includes('quels vehicules sont actuellement loues') ||
    query.includes('vehicules actuellement loues') ||
    query.includes('vehicules loues') ||
    query.includes('locations en cours') ||
    query.includes('contrats de location en cours') ||
    query.includes('qui a loue quoi')
  ) {
    const activeRentals = rentals.filter((r) => r.status === 'En cours');
    const totalActiveAmount = activeRentals.reduce((acc, r) => acc + (r.totalAmount || 0), 0);

    let content = `🔑 **Véhicules Actuellement en Location** :\n\n`;
    content += `• **${activeRentals.length} véhicule(s)** sont actuellement sur les routes.\n\n`;

    if (activeRentals.length === 0) {
      content += `Aucun véhicule n'est actuellement loué. Tous vos véhicules de location sont disponibles au parc ou en révision.`;
    } else {
      activeRentals.forEach((r, idx) => {
        const endDateStr = new Date(r.endDate).toLocaleDateString('fr-FR');
        content += `${idx + 1}. **${r.vehicleName}** (${r.vehicleRegistration})\n`;
        content += `   ↳ Locataire : **${r.clientName}** (📞 ${r.clientPhone || 'N/C'})\n`;
        content += `   ↳ Retour prévu le : **${endDateStr}**`;
        if (canViewFinancials(crmData)) {
          content += ` | Montant : ${formatCurrency(r.totalAmount || 0, currency)}`;
        }
        content += `\n`;
      });
    }

    const rows = activeRentals.map((r) => [
      r.rentalNumber || 'LOC',
      r.vehicleName || 'Véhicule',
      r.clientName || 'Locataire',
      new Date(r.endDate).toLocaleDateString('fr-FR'),
      canViewFinancials(crmData) ? formatCurrency(r.totalAmount || 0, currency) : '***',
    ]);

    return {
      role: 'assistant',
      category: 'locations',
      content,
      statsCards: [
        { label: 'Véhicules loués', value: `${activeRentals.length}`, type: activeRentals.length > 0 ? 'positive' : 'neutral' },
        { label: 'Flotte totale', value: `${vehicles.length}`, type: 'neutral' },
      ],
      tableData:
        rows.length > 0
          ? {
              headers: ['N° Contrat', 'Véhicule', 'Locataire', 'Retour prévu', 'Montant'],
              rows,
            }
          : undefined,
      actionLinks: [{ label: 'Gérer les locations', tab: 'quick-rental' }],
    };
  }

  // -------------------------------------------------------------
  // 6. INTENT: QUELS VÉHICULES DOIVENT REVENIR ? (Restitutions)
  // -------------------------------------------------------------
  if (
    query.includes('doivent revenir') ||
    query.includes('quand reviennent les vehicules') ||
    query.includes('restitutions') ||
    query.includes('retours prevus') ||
    query.includes('fin de contrat')
  ) {
    const todayReturns = rentals.filter((r) => {
      if (r.status !== 'En cours') return false;
      return isSameDay(new Date(r.endDate), now);
    });

    const overdueRentals = rentals.filter((r) => {
      if (r.status !== 'En cours') return false;
      const end = new Date(r.endDate);
      return end.getTime() < now.getTime() && !isSameDay(end, now);
    });

    const upcomingReturns = rentals.filter((r) => {
      if (r.status !== 'En cours') return false;
      const end = new Date(r.endDate);
      return end.getTime() > now.getTime() && isWithinLastDays(now, 7, end);
    });

    let content = `📅 **Planning des Restitutions de Véhicules** :\n\n`;

    if (todayReturns.length > 0) {
      content += `⚠️ **À restituer AUJOURD'HUI (${now.toLocaleDateString('fr-FR')})** :\n`;
      todayReturns.forEach((r, idx) => {
        content += `• **${r.vehicleName}** (${r.vehicleRegistration}) — Client: **${r.clientName}** (📞 ${r.clientPhone || 'N/C'}) | Caution : ${formatCurrency(r.depositAmount || 0, currency)}\n`;
      });
      content += `\n`;
    } else {
      content += `• ✅ **Aucun retour attendu aujourd'hui.**\n\n`;
    }

    if (overdueRentals.length > 0) {
      content += `🚨 **Retards de restitution constatés** :\n`;
      overdueRentals.forEach((r, idx) => {
        const daysLate = Math.max(1, Math.floor((now.getTime() - new Date(r.endDate).getTime()) / (1000 * 3600 * 24)));
        content += `• **${r.vehicleName}** (${r.vehicleRegistration}) — Locataire: **${r.clientName}** (📞 ${r.clientPhone || 'N/C'}) [**+${daysLate} j de retard**]\n`;
      });
      content += `\n`;
    }

    if (upcomingReturns.length > 0) {
      content += `🗓️ **Prochains retours prévus (7 prochains jours)** :\n`;
      upcomingReturns.forEach((r) => {
        content += `• **${r.vehicleName}** (${r.vehicleRegistration}) — Date de retour : ${new Date(r.endDate).toLocaleDateString('fr-FR')} (${r.clientName})\n`;
      });
    }

    return {
      role: 'assistant',
      category: 'locations',
      content,
      statsCards: [
        { label: 'Retours aujourd\'hui', value: `${todayReturns.length}`, type: todayReturns.length > 0 ? 'warning' : 'neutral' },
        { label: 'En retard', value: `${overdueRentals.length}`, type: overdueRentals.length > 0 ? 'negative' : 'positive' },
        { label: 'Retours 7 jours', value: `${upcomingReturns.length}`, type: 'neutral' },
      ],
      actionLinks: [
        { label: 'Locations en cours', tab: 'quick-rental' },
        { label: 'Notifications WhatsApp', tab: 'whatsapp-notifications' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 7. INTENT: QUI DOIT ENCORE PAYER ? (Unpaid balances / Debts)
  // -------------------------------------------------------------
  if (
    query.includes('qui doit encore payer') ||
    query.includes('qui doit payer') ||
    query.includes('qui me doit de l argent') ||
    query.includes('qui doit de l argent') ||
    query.includes('impaye') ||
    query.includes('soldes dus') ||
    query.includes('creances clients') ||
    query.includes('reste a payer')
  ) {
    if (!canViewFinancials(crmData)) {
      return buildPermissionDeniedResponse('au suivi des créances et soldes impayés');
    }

    const unpaidSales = sales.filter((s) => (s.balanceDue || 0) > 0);
    const unpaidRentals = rentals.filter((r) => (r.balanceDue || 0) > 0);

    const totalUnpaidSales = unpaidSales.reduce((acc, s) => acc + (s.balanceDue || 0), 0);
    const totalUnpaidRentals = unpaidRentals.reduce((acc, r) => acc + (r.balanceDue || 0), 0);
    const totalDebt = totalUnpaidSales + totalUnpaidRentals;

    let content = `💳 **Suivi des Soldes & Créances Clients** :\n\n`;

    if (unpaidSales.length === 0 && unpaidRentals.length === 0) {
      content += `✅ **Félicitations ! Aucun client n'a de solde impayé actuellement.** Tous les dossiers de vente et de location sont entièrement réglés.`;
    } else {
      content += `• **Montant total des créances en attente** : **${formatCurrency(totalDebt, currency)}**\n\n`;

      if (unpaidSales.length > 0) {
        content += `🛒 **Dossiers de vente avec solde dû (${unpaidSales.length})** :\n`;
        unpaidSales.forEach((s, idx) => {
          content += `${idx + 1}. **${s.clientName}** — Véhicule: **${s.vehicleName}** | Reste à régler : **${formatCurrency(s.balanceDue || 0, currency)}** (Total: ${formatCurrency(s.totalAmount || s.salePrice || 0, currency)})\n`;
        });
        content += `\n`;
      }

      if (unpaidRentals.length > 0) {
        content += `🔑 **Contrats de location avec solde dû (${unpaidRentals.length})** :\n`;
        unpaidRentals.forEach((r, idx) => {
          content += `${idx + 1}. **${r.clientName}** (📞 ${r.clientPhone || 'N/C'}) — Véhicule: **${r.vehicleName}** | Reste à régler : **${formatCurrency(r.balanceDue || 0, currency)}**\n`;
        });
      }

      content += `\n💡 Action recommandée : Vous pouvez envoyer une relance WhatsApp ou enregistrer un encaissement direct.`;
    }

    const rows: (string | number)[][] = [];
    unpaidSales.forEach((s) => {
      rows.push([s.clientName, 'Vente', s.vehicleName || '-', formatCurrency(s.balanceDue || 0, currency)]);
    });
    unpaidRentals.forEach((r) => {
      rows.push([r.clientName, 'Location', r.vehicleName || '-', formatCurrency(r.balanceDue || 0, currency)]);
    });

    return {
      role: 'assistant',
      category: 'paiements',
      content,
      statsCards: [
        { label: 'Total créances', value: formatCurrency(totalDebt, currency), type: totalDebt > 0 ? 'negative' : 'positive' },
        { label: 'Dossiers impayés', value: `${unpaidSales.length + unpaidRentals.length}`, type: totalDebt > 0 ? 'warning' : 'positive' },
      ],
      tableData:
        rows.length > 0
          ? {
              headers: ['Client', 'Type', 'Véhicule', 'Reste à payer'],
              rows,
            }
          : undefined,
      actionLinks: [
        { label: 'Enregistrer un paiement', tab: 'payments' },
        { label: 'Envoyer un rappel WhatsApp', tab: 'whatsapp-notifications' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 8. INTENT: QUELS VÉHICULES SONT DISPONIBLES ?
  // -------------------------------------------------------------
  if (
    query.includes('quels vehicules sont disponibles') ||
    query.includes('vehicules disponibles') ||
    query.includes('parc disponible') ||
    query.includes('voitures disponibles') ||
    query.includes('vehicules libres') ||
    query.includes('disponibilite des vehicules') ||
    query.includes('vehicules dispo')
  ) {
    if (vehicles.length === 0) {
      return {
        role: 'assistant',
        category: 'vehicules',
        content: "Je n'ai encore aucun véhicule enregistré dans votre CRM. Dès que vous ajouterez vos premiers véhicules, je pourrai vous lister ceux qui sont disponibles.",
        statsCards: [{ label: 'Disponibles', value: '0', type: 'neutral' }],
        actionLinks: [{ label: 'Ajouter un véhicule', tab: 'vehicles' }],
      };
    }

    const availableVehicles = vehicles.filter((v) => v.status === 'Disponible');
    const forSale = availableVehicles.filter((v) => v.category === 'Vente' || v.category === 'Vente & Location');
    const forRental = availableVehicles.filter((v) => v.category === 'Location' || v.category === 'Vente & Location');

    let content = `🚗 **État du Parc : Véhicules Disponibles** :\n\n`;
    content += `• **${availableVehicles.length} véhicule(s) disponible(s)** immédiatement (sur ${vehicles.length} dans votre flotte).\n\n`;

    if (availableVehicles.length === 0) {
      content += `⚠️ Aucun véhicule n'est actuellement marqué comme "Disponible". Tous vos véhicules sont soit loués, vendus, réservés ou en cours de maintenance.`;
    } else {
      content += `Détails des véhicules prêts à être loués ou vendus :\n`;
      availableVehicles.slice(0, 8).forEach((v, idx) => {
        content += `${idx + 1}. **${v.make} ${v.model}** (${v.year || ''}) — Immat: **${v.registration}** | Catégorie: ${v.category} | Kilométrage: ${v.mileage?.toLocaleString('fr-FR') || 0} km\n`;
      });

      if (availableVehicles.length > 8) {
        content += `\n... et ${availableVehicles.length - 8} autre(s) véhicule(s) disponible(s).`;
      }
    }

    const rows = availableVehicles.slice(0, 6).map((v) => [
      `${v.make} ${v.model}`,
      v.registration,
      v.category,
      `${v.mileage?.toLocaleString('fr-FR') || 0} km`,
      v.color || 'Standard',
    ]);

    return {
      role: 'assistant',
      category: 'vehicules',
      content,
      statsCards: [
        { label: 'Disponibles', value: `${availableVehicles.length}`, type: availableVehicles.length > 0 ? 'positive' : 'warning' },
        { label: 'Prêts location', value: `${forRental.length}`, type: 'neutral' },
        { label: 'Prêts vente', value: `${forSale.length}`, type: 'neutral' },
      ],
      tableData:
        rows.length > 0
          ? {
              headers: ['Modèle', 'Immatriculation', 'Usage', 'Kilométrage', 'Couleur'],
              rows,
            }
          : undefined,
      actionLinks: [
        { label: 'Voir le parc complet', tab: 'vehicles' },
        { label: 'Créer un contrat', tab: 'quick-rental' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 9. INTENT: QUELS VÉHICULES SONT EN MAINTENANCE ?
  // -------------------------------------------------------------
  if (
    query.includes('quels vehicules sont en maintenance') ||
    query.includes('vehicules en maintenance') ||
    query.includes('vehicules au garage') ||
    query.includes('vehicules en reparation') ||
    query.includes('reparations en cours') ||
    query.includes('interventions en cours')
  ) {
    const maintenanceVehicles = vehicles.filter((v) => v.status === 'En maintenance');
    const activeInterventions = maintenances.filter((m) => m.status === 'En cours' || m.status === 'Planifiée');

    let content = `🛠️ **Véhicules en Maintenance & Atelier** :\n\n`;
    content += `• **${maintenanceVehicles.length} véhicule(s)** immobilisé(s) en statut "En maintenance".\n`;
    content += `• **${activeInterventions.length} intervention(s)** en cours ou planifiée(s).\n\n`;

    if (maintenanceVehicles.length === 0 && activeInterventions.length === 0) {
      content += `✅ **Aucun véhicule n'est actuellement en panne ou en révision.** Votre parc est 100% opérationnel !`;
    } else {
      if (activeInterventions.length > 0) {
        content += `Interventions actives enregistrées :\n`;
        activeInterventions.forEach((m, idx) => {
          content += `${idx + 1}. **${m.vehicleName}** (${m.vehicleRegistration}) — Type: **${m.type}** | Prestataire: **${m.supplier || 'Garage'}** | Statut: ${m.status}\n`;
        });
      } else if (maintenanceVehicles.length > 0) {
        content += `Véhicules avec statut maintenance :\n`;
        maintenanceVehicles.forEach((v, idx) => {
          content += `${idx + 1}. **${v.make} ${v.model}** (${v.registration}) — Immatriculation: ${v.registration}\n`;
        });
      }
    }

    return {
      role: 'assistant',
      category: 'vehicules',
      content,
      statsCards: [
        { label: 'Véhicules en atelier', value: `${maintenanceVehicles.length}`, type: maintenanceVehicles.length > 0 ? 'warning' : 'positive' },
        { label: 'Interventions actives', value: `${activeInterventions.length}`, type: 'neutral' },
      ],
      actionLinks: [
        { label: 'Gérer la maintenance', tab: 'maintenance' },
        { label: 'Fournisseurs & Garages', tab: 'suppliers' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 10. INTENT: RÉSUMÉ DU JOUR (Daily Summary)
  // -------------------------------------------------------------
  if (
    query.includes('resume du jour') ||
    query.includes('bilan du jour') ||
    query.includes('recapitulatif du jour') ||
    (query.includes('aujourd hui') && (query.includes('resume') || query.includes('bilan') || query.includes('rapport')))
  ) {
    const todaySales = sales.filter((s) => isSameDay(new Date(s.saleDate || s.createdAt), now));
    const todayRentalsStarted = rentals.filter((r) => isSameDay(new Date(r.startDate || r.createdAt), now));
    const todayRentalsEnded = rentals.filter((r) => isSameDay(new Date(r.endDate), now));
    const todayPayments = payments.filter((p) => isSameDay(new Date(p.paymentDate || p.createdAt), now));
    const todayExpenses = expenses.filter((e) => isSameDay(new Date(e.date || e.createdAt), now));
    const todayClients = clients.filter((c) => isSameDay(new Date(c.createdAt), now));

    const totalSalesAmount = todaySales.reduce((acc, s) => acc + (s.totalAmount || s.salePrice || 0), 0);
    const totalPaymentsReceived = todayPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalExpensesAmount = todayExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const activeRentalsCount = rentals.filter((r) => r.status === 'En cours').length;

    let content = `📊 **Résumé d'Activité du Jour (${now.toLocaleDateString('fr-FR')})** :\n\n`;
    content += `• **Ventes conclues** : ${todaySales.length} véhicule(s)`;
    if (canViewFinancials(crmData)) {
      content += ` pour un total de **${formatCurrency(totalSalesAmount, currency)}**.\n`;
    } else {
      content += `.\n`;
    }

    content += `• **Locations** : ${todayRentalsStarted.length} nouveau(x) départ(s), ${todayRentalsEnded.length} restitution(s) attendue(s) (${activeRentalsCount} contrat(s) en cours).\n`;

    if (canViewFinancials(crmData)) {
      content += `• **Encaissements réels** : **${formatCurrency(totalPaymentsReceived, currency)}** perçu(s) sur ${todayPayments.length} paiement(s).\n`;
    }

    if (canViewExpenses(crmData)) {
      content += `• **Dépenses engagées** : **${formatCurrency(totalExpensesAmount, currency)}** (${todayExpenses.length} écriture(s)).\n`;
    }

    content += `• **Nouveaux clients** : ${todayClients.length} fiche(s) créée(s) aujourd'hui.`;

    if (todayRentalsEnded.length > 0) {
      content += `\n\n⚠️ **Restitutions à clôturer aujourd'hui** : ${todayRentalsEnded.map((r) => `${r.vehicleName} (${r.clientName})`).join(', ')}.`;
    }

    return {
      role: 'assistant',
      category: 'resume',
      summaryType: 'day',
      content,
      statsCards: [
        { label: 'Ventes du jour', value: canViewFinancials(crmData) ? formatCurrency(totalSalesAmount, currency) : `${todaySales.length} ventes`, type: todaySales.length > 0 ? 'positive' : 'neutral' },
        { label: 'Encaissements', value: canViewFinancials(crmData) ? formatCurrency(totalPaymentsReceived, currency) : `${todayPayments.length} reçus`, type: totalPaymentsReceived > 0 ? 'positive' : 'neutral' },
        { label: 'Locations en cours', value: `${activeRentalsCount}`, type: 'neutral' },
        { label: 'Nouveaux clients', value: `${todayClients.length}`, type: todayClients.length > 0 ? 'positive' : 'neutral' },
      ],
      actionLinks: [
        { label: 'Gérer les paiements', tab: 'payments' },
        { label: 'Locations en cours', tab: 'quick-rental' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 11. INTENT: RÉSUMÉ HEBDOMADAIRE (Weekly Summary)
  // -------------------------------------------------------------
  if (
    query.includes('resume hebdomadaire') ||
    query.includes('bilan hebdo') ||
    query.includes('cette semaine') ||
    query.includes('7 derniers jours')
  ) {
    const weekSales = sales.filter((s) => isWithinLastDays(new Date(s.saleDate || s.createdAt), 7, now));
    const weekRentals = rentals.filter((r) => isWithinLastDays(new Date(r.startDate || r.createdAt), 7, now));
    const weekPayments = payments.filter((p) => isWithinLastDays(new Date(p.paymentDate || p.createdAt), 7, now));
    const weekExpenses = expenses.filter((e) => isWithinLastDays(new Date(e.date || e.createdAt), 7, now));
    const weekClients = clients.filter((c) => isWithinLastDays(new Date(c.createdAt), 7, now));

    const totalSalesRev = weekSales.reduce((acc, s) => acc + (s.totalAmount || s.salePrice || 0), 0);
    const totalRentalsRev = weekRentals.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
    const totalCollected = weekPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalExpenses = weekExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    const overdueRentals = rentals.filter((r) => {
      if (r.status !== 'En cours') return false;
      const end = new Date(r.endDate);
      return end.getTime() < now.getTime() && !isSameDay(end, now);
    });

    let content = `📈 **Bilan Hebdomadaire (7 Derniers Jours)** :\n\n`;

    if (canViewFinancials(crmData)) {
      content += `• **Chiffre d'affaires global généré** : **${formatCurrency(totalSalesRev + totalRentalsRev, currency)}**\n`;
      content += `  - Ventes : **${formatCurrency(totalSalesRev, currency)}** (${weekSales.length} transaction(s))\n`;
      content += `  - Locations : **${formatCurrency(totalRentalsRev, currency)}** (${weekRentals.length} contrat(s))\n`;
      content += `• **Total Encaissé** : **${formatCurrency(totalCollected, currency)}** (${weekPayments.length} écriture(s))\n`;
    } else {
      content += `• **Volume d'activité** : ${weekSales.length} vente(s) conclue(s) et ${weekRentals.length} contrat(s) de location signés.\n`;
    }

    if (canViewExpenses(crmData)) {
      content += `• **Dépenses engagées** : **${formatCurrency(totalExpenses, currency)}**\n`;
    }

    content += `• **Acquisition** : +${weekClients.length} nouveau(x) client(s).\n\n`;

    content += `🔍 **Points d'attention & Performances** :\n`;
    if (overdueRentals.length > 0) {
      content += `• ⚠️ ${overdueRentals.length} véhicule(s) en retard de restitution.\n`;
    } else {
      content += `• ✅ Aucune location en retard cette semaine.\n`;
    }
    const availableCount = vehicles.filter((v) => v.status === 'Disponible').length;
    content += `• 🚗 Disponibilité du parc : ${availableCount} sur ${vehicles.length} véhicules prêts à la location ou vente.`;

    return {
      role: 'assistant',
      category: 'resume',
      summaryType: 'week',
      content,
      statsCards: [
        { label: 'CA 7 jours', value: canViewFinancials(crmData) ? formatCurrency(totalSalesRev + totalRentalsRev, currency) : `${weekSales.length + weekRentals.length} contrats`, type: 'positive' },
        { label: 'Encaissements', value: canViewFinancials(crmData) ? formatCurrency(totalCollected, currency) : `${weekPayments.length} reçus`, type: 'positive' },
        { label: 'Nouveaux clients', value: `+${weekClients.length}`, type: 'positive' },
        { label: 'Retards', value: `${overdueRentals.length}`, type: overdueRentals.length > 0 ? 'warning' : 'positive' },
      ],
      actionLinks: [
        { label: 'Rapports & Statistiques', tab: 'reports' },
        { label: 'Gérer les paiements', tab: 'payments' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 12. INTENT: RÉSUMÉ MENSUEL (Monthly Summary)
  // -------------------------------------------------------------
  if (
    query.includes('resume mensuel') ||
    query.includes('bilan mensuel') ||
    query.includes('bilan du mois') ||
    query.includes('performance du mois')
  ) {
    const monthSales = sales.filter((s) => isCurrentMonth(new Date(s.saleDate || s.createdAt), now));
    const monthRentals = rentals.filter((r) => isCurrentMonth(new Date(r.startDate || r.createdAt), now));
    const monthPayments = payments.filter((p) => isCurrentMonth(new Date(p.paymentDate || p.createdAt), now));
    const monthExpenses = expenses.filter((e) => isCurrentMonth(new Date(e.date || e.createdAt), now));
    const monthClients = clients.filter((c) => isCurrentMonth(new Date(c.createdAt), now));

    const currentRevenue =
      monthSales.reduce((acc, s) => acc + (s.totalAmount || s.salePrice || 0), 0) +
      monthRentals.reduce((acc, r) => acc + (r.totalAmount || 0), 0);

    const totalExpensesMonth = monthExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const netProfit = currentRevenue - totalExpensesMonth;

    let content = `🗓️ **Bilan Mensuel (${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })})** :\n\n`;

    if (canViewFinancials(crmData)) {
      content += `• **Chiffre d'Affaires Total** : **${formatCurrency(currentRevenue, currency)}**\n`;
      content += `  - 🛒 Ventes : **${formatCurrency(monthSales.reduce((a, s) => a + (s.totalAmount || s.salePrice || 0), 0), currency)}** (${monthSales.length} véhicule(s))\n`;
      content += `  - 🔑 Locations : **${formatCurrency(monthRentals.reduce((a, r) => a + (r.totalAmount || 0), 0), currency)}** (${monthRentals.length} contrat(s))\n`;

      if (canViewExpenses(crmData)) {
        content += `• **Total Dépenses d'Exploitation** : **${formatCurrency(totalExpensesMonth, currency)}**\n`;
        content += `• **Bénéfice d'Exploitation Estimé** : **${formatCurrency(netProfit, currency)}** (${netProfit >= 0 ? 'Positif' : 'Déficitaire'})\n`;
      }
    } else {
      content += `• **Volume d'activité** : ${monthSales.length} véhicule(s) vendu(s) et ${monthRentals.length} contrat(s) de location signés.\n`;
    }

    content += `• **Développement clientèle** : +${monthClients.length} nouveaux clients enregistrés.`;

    return {
      role: 'assistant',
      category: 'resume',
      summaryType: 'month',
      content,
      statsCards: [
        { label: 'CA du mois', value: canViewFinancials(crmData) ? formatCurrency(currentRevenue, currency) : `${monthSales.length + monthRentals.length} opérations`, type: 'positive' },
        { label: 'Dépenses', value: canViewExpenses(crmData) ? formatCurrency(totalExpensesMonth, currency) : `${monthExpenses.length} dépenses`, type: 'neutral' },
        { label: 'Nouveaux clients', value: `+${monthClients.length}`, type: 'positive' },
      ],
      actionLinks: [
        { label: 'Consulter les rapports complets', tab: 'reports' },
        { label: 'Comptabilité', tab: 'accounting' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 13. INTENT: ALERTES INTELLIGENTES (Smart Real-Time Alerts)
  // -------------------------------------------------------------
  if (
    query.includes('alerte') ||
    query.includes('quelles sont les alertes') ||
    query.includes('points d attention') ||
    query.includes('urgences')
  ) {
    const overdueRentals = rentals.filter((r) => {
      if (r.status !== 'En cours') return false;
      const end = new Date(r.endDate);
      return end.getTime() < now.getTime() && !isSameDay(end, now);
    });

    const unpaidSales = sales.filter((s) => (s.balanceDue || 0) > 0);
    const unpaidRentals = rentals.filter((r) => (r.balanceDue || 0) > 0);

    const expiredInspections = vehicles.filter((v) => {
      if (!v.technicalInspectionExpiryDate) return false;
      return new Date(v.technicalInspectionExpiryDate).getTime() < now.getTime();
    });

    const expiredInsurances = vehicles.filter((v) => {
      if (!v.insuranceExpiryDate) return false;
      return new Date(v.insuranceExpiryDate).getTime() < now.getTime();
    });

    const dormantVehicles = vehicles.filter((v) => {
      if (v.status !== 'Disponible') return false;
      const hasRecentRental = rentals.some((r) => r.vehicleId === v.id && isWithinLastDays(new Date(r.startDate || r.createdAt), 30, now));
      return !hasRecentRental;
    });

    const totalAlertsCount =
      overdueRentals.length +
      (canViewFinancials(crmData) ? unpaidSales.length + unpaidRentals.length : 0) +
      expiredInspections.length +
      expiredInsurances.length;

    let content = `🚨 **Centre d'Alertes Opérationnelles en Temps Réel** :\n\n`;

    if (totalAlertsCount === 0) {
      content += `✅ **Aucune alerte critique !**\n\nTous vos véhicules sont en règle (contrôle technique & assurance), aucune location n'est en retard et aucun solde n'est en souffrance.`;
    } else {
      if (overdueRentals.length > 0) {
        content += `🔴 **${overdueRentals.length} Retard(s) de restitution** :\n`;
        overdueRentals.forEach((r) => {
          content += `  - **${r.vehicleName}** (${r.vehicleRegistration}) — Locataire: ${r.clientName} (📞 ${r.clientPhone || 'N/C'})\n`;
        });
        content += `\n`;
      }

      if (expiredInspections.length > 0) {
        content += `🔴 **${expiredInspections.length} Contrôle(s) technique(s) expiré(s)** :\n`;
        expiredInspections.forEach((v) => {
          content += `  - **${v.make} ${v.model}** (${v.registration})\n`;
        });
        content += `\n`;
      }

      if (expiredInsurances.length > 0) {
        content += `🔴 **${expiredInsurances.length} Assurance(s) expirée(s)** :\n`;
        expiredInsurances.forEach((v) => {
          content += `  - **${v.make} ${v.model}** (${v.registration})\n`;
        });
        content += `\n`;
      }

      if ((unpaidSales.length > 0 || unpaidRentals.length > 0) && canViewFinancials(crmData)) {
        content += `🟠 **${unpaidSales.length + unpaidRentals.length} Créance(s) client(s) à recouvrer**.\n`;
      }

      if (dormantVehicles.length > 0) {
        content += `\n🟡 **Véhicules dormants (peu demandés ces 30 derniers jours)** : ${dormantVehicles.length} véhicule(s) à promouvoir.`;
      }
    }

    return {
      role: 'assistant',
      category: 'alertes',
      content,
      statsCards: [
        { label: 'Retards restitution', value: `${overdueRentals.length}`, type: overdueRentals.length > 0 ? 'negative' : 'positive' },
        { label: 'CT & Assurances expirés', value: `${expiredInspections.length + expiredInsurances.length}`, type: expiredInspections.length + expiredInsurances.length > 0 ? 'negative' : 'positive' },
        { label: 'Créances en attente', value: `${unpaidSales.length + unpaidRentals.length}`, type: unpaidSales.length + unpaidRentals.length > 0 ? 'warning' : 'positive' },
      ],
      actionLinks: [
        { label: 'Locations en cours', tab: 'quick-rental' },
        { label: 'Planifier maintenance', tab: 'maintenance' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 14. INTENT: RECOMMANDATIONS PROACTIVES (Non-decisional guidance)
  // -------------------------------------------------------------
  if (
    query.includes('recommandation') ||
    query.includes('conseil') ||
    query.includes('que me conseilles tu') ||
    query.includes('optimiser mon activite') ||
    query.includes('comment ameliorer') ||
    query.includes('suggestions')
  ) {
    const activeRentals = rentals.filter((r) => r.status === 'En cours');
    const availableVehicles = vehicles.filter((v) => v.status === 'Disponible');
    const unpaidTotalCount = sales.filter((s) => (s.balanceDue || 0) > 0).length + rentals.filter((r) => (r.balanceDue || 0) > 0).length;

    let content = `💡 **Recommandations & Suggestions Constructives** :\n\n`;
    content += `*Note : En tant qu'Assistant IA, je propose des pistes d'optimisation basées sur vos chiffres réels, sans jamais prendre de décision financière ou contractuelle à votre place.*\n\n`;

    let recIdx = 1;

    // 1. Unpaid debt recommendation
    if (unpaidTotalCount > 0 && canViewFinancials(crmData)) {
      content += `${recIdx}. 💳 **Optimiser le recouvrement des créances** :\n`;
      content += `   ↳ Vous avez ${unpaidTotalCount} dossier(s) avec solde dû. Une campagne de relance WhatsApp ciblée permettrait d'accélérer vos rentrées de trésorerie sans effort.\n\n`;
      recIdx++;
    }

    // 2. High rotation vehicle recommendation
    const rentedModelCounts = new Map<string, number>();
    rentals.forEach((r) => {
      rentedModelCounts.set(r.vehicleName, (rentedModelCounts.get(r.vehicleName) || 0) + 1);
    });
    const mostRented = Array.from(rentedModelCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    if (mostRented && mostRented[1] >= 2) {
      content += `${recIdx}. 🚗 **Étudier l'extension de votre flotte sur les modèles très demandés** :\n`;
      content += `   ↳ Le véhicule **${mostRented[0]}** totalise ${mostRented[1]} locations. Son fort taux d'occupation suggère une forte demande client sur cette gamme.\n\n`;
      recIdx++;
    }

    // 3. Dormant vehicles recommendation
    const dormant = vehicles.filter((v) => v.status === 'Disponible');
    if (dormant.length > 0) {
      content += `${recIdx}. 🏷️ **Ajuster le tarif ou promouvoir les véhicules disponibles** :\n`;
      content += `   ↳ ${dormant.length} véhicule(s) sont prêts au parc. Pensez à proposer une offre week-end ou un tarif dégressif pour maximiser leur taux de rotation.\n\n`;
      recIdx++;
    }

    // 4. Hot prospects recommendation
    const hotProspects = prospects.filter((p) => p.status === 'Intéressé' || p.status === 'En discussion' || p.status === 'Nouveau');
    if (hotProspects.length > 0) {
      content += `${recIdx}. 🎯 **Relancer les prospects qualifiés** :\n`;
      content += `   ↳ ${hotProspects.length} prospect(s) sont actuellement qualifiés au CRM. Un appel de suivi peut concrétiser de nouvelles ventes ou locations.`;
    }

    return {
      role: 'assistant',
      category: 'general',
      content,
      statsCards: [
        { label: 'Véhicules prêts', value: `${availableVehicles.length}`, type: 'neutral' },
        { label: 'Locations actives', value: `${activeRentals.length}`, type: 'positive' },
        { label: 'Prospects chauds', value: `${hotProspects.length}`, type: hotProspects.length > 0 ? 'positive' : 'neutral' },
      ],
      actionLinks: [
        { label: 'Gérer les prospects', tab: 'prospects' },
        { label: 'Parc de véhicules', tab: 'vehicles' },
      ],
    };
  }

  // -------------------------------------------------------------
  // 15. DEFAULT DETERMINISTIC FALLBACK (Exact & Helpful)
  // -------------------------------------------------------------
  const availableCount = vehicles.filter((v) => v.status === 'Disponible').length;
  const activeRentalsCount = rentals.filter((r) => r.status === 'En cours').length;

  let content = `🔍 **Analyse de votre demande** :\n\n`;
  content += `Je n'ai pas trouvé de correspondance exacte pour votre question : *"${rawQuery}"*.\n\n`;
  content += `Vous pouvez me poser des questions précises en langage naturel comme :\n`;
  content += `• *"Comment va mon activité ?"*\n`;
  content += `• *"Quel est mon chiffre d'affaires ?"*\n`;
  content += `• *"Quelles sont mes ventes ?"*\n`;
  content += `• *"Quels véhicules sont actuellement loués ?"*\n`;
  content += `• *"Quels véhicules doivent revenir ?"*\n`;
  content += `• *"Qui doit encore payer ?"*\n`;
  content += `• *"Quels véhicules sont disponibles ?"*\n`;
  content += `• *"Quels véhicules sont en maintenance ?"*\n`;
  content += `• *"Donne-moi le résumé du jour (ou du mois)"*`;

  return {
    role: 'assistant',
    category: 'general',
    content,
    statsCards: [
      { label: 'Parc total', value: `${vehicles.length} véhicules`, type: 'neutral' },
      { label: 'Disponibles', value: `${availableCount}`, type: 'neutral' },
      { label: 'Locations en cours', value: `${activeRentalsCount}`, type: 'neutral' },
    ],
    actionLinks: [
      { label: 'Tableau de bord', tab: 'dashboard' },
      { label: 'Rapports', tab: 'reports' },
    ],
  };
};

export const generateLiveSmartInsights = (crmData: CrmDataSnapshot): AiSmartInsight[] => {
  const insights: AiSmartInsight[] = [];
  const { vehicles, sales, rentals, payments } = crmData;
  const now = new Date();

  // 1. Overdue Rentals Alert
  const overdueRentals = rentals.filter((r) => {
    if (r.status !== 'En cours') return false;
    const end = new Date(r.endDate);
    return end.getTime() < now.getTime() && !isSameDay(end, now);
  });
  if (overdueRentals.length > 0) {
    insights.push({
      id: 'ins_overdue',
      category: 'alertes',
      title: `${overdueRentals.length} Retard(s) de restitution`,
      description: `${overdueRentals.length} véhicule(s) ont dépassé leur date de retour prévue.`,
      prompt: 'Quels véhicules doivent revenir ?',
      badgeText: 'Retard',
      badgeColor: 'red',
    });
  }

  // 2. Returns today
  const returnsToday = rentals.filter((r) => r.status === 'En cours' && isSameDay(new Date(r.endDate), now));
  if (returnsToday.length > 0) {
    insights.push({
      id: 'ins_returns_today',
      category: 'alertes',
      title: `${returnsToday.length} Restitution(s) aujourd'hui`,
      description: 'Véhicules devant être contrôlés et restitués ce jour.',
      prompt: 'Quels véhicules doivent revenir ?',
      badgeText: 'Aujourd\'hui',
      badgeColor: 'amber',
    });
  }

  // 3. Outstanding balances
  const unpaidSales = sales.filter((s) => (s.balanceDue || 0) > 0);
  const unpaidRentals = rentals.filter((r) => (r.balanceDue || 0) > 0);
  if (unpaidSales.length + unpaidRentals.length > 0) {
    insights.push({
      id: 'ins_unpaid',
      category: 'opportunites',
      title: `${unpaidSales.length + unpaidRentals.length} Créance(s) en attente`,
      description: 'Dossiers avec solde dû nécessitant un suivi ou un encaissement.',
      prompt: 'Qui doit encore payer ?',
      badgeText: 'Impayés',
      badgeColor: 'blue',
    });
  }

  // 4. Quick Summaries
  insights.push({
    id: 'ins_daily_summary',
    category: 'resumes',
    title: 'Résumé du Jour',
    description: 'Synthèse des ventes, locations, encaissements et restitutions.',
    prompt: 'Fais-moi le résumé du jour',
    badgeText: 'Auto',
    badgeColor: 'green',
  });

  insights.push({
    id: 'ins_activity_health',
    category: 'activite',
    title: 'Diagnostic de l\'activité',
    description: 'Taux d\'occupation, dynamisme commercial et alertes de gestion.',
    prompt: 'Comment va mon activité ?',
    badgeText: 'Santé',
    badgeColor: 'purple',
  });

  return insights;
};
