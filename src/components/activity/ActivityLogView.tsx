import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserActivityLog, ActivityActionType } from '../../types';
import {
  History,
  Search,
  Filter,
  Calendar,
  User,
  Shield,
  Clock,
  Layers,
  ArrowUpDown,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  X,
  FileText,
  KeyRound,
  BadgePercent,
  Car,
  Users as UsersIcon,
  CreditCard,
  Receipt,
  Wrench,
  CalendarClock,
  Settings as SettingsIcon,
  LogIn,
  LogOut,
  ChevronDown,
  Info,
} from 'lucide-react';

interface ActivityLogViewProps {
  searchQuery?: string;
}

type DateFilterOption = 'all' | 'today' | '7days' | '30days' | 'this_month' | 'custom';

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ searchQuery: externalSearch = '' }) => {
  const { auditLogs, currentUser, users, clearAuditLogs } = useAuth();

  // Filters State
  const [search, setSearch] = useState(externalSearch);
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');

  // Detail Modal State
  const [selectedLog, setSelectedLog] = useState<UserActivityLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Sync external search if changed
  React.useEffect(() => {
    if (externalSearch) {
      setSearch(externalSearch);
    }
  }, [externalSearch]);

  // Derived list of distinct modules & action types
  const availableModules = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((l) => {
      if (l.module) set.add(l.module);
    });
    return Array.from(set).sort();
  }, [auditLogs]);

  const availableActionTypes = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((l) => {
      if (l.actionType) set.add(l.actionType);
    });
    return Array.from(set).sort();
  }, [auditLogs]);

  // Role Access Filtering: Commercial / Caissier see only their own logs if not Admin / Gestionnaire
  const accessibleLogs = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Administrateur' || currentUser.role === 'Gestionnaire') {
      return auditLogs;
    }
    // For non-management, show only their own activities
    return auditLogs.filter((log) => log.userId === currentUser.id);
  }, [auditLogs, currentUser]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return accessibleLogs.filter((log) => {
      // 1. Text Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchUser = log.userName?.toLowerCase().includes(q);
        const matchEmail = log.userEmail?.toLowerCase().includes(q);
        const matchDesc = log.description?.toLowerCase().includes(q);
        const matchTarget = log.targetItem?.toLowerCase().includes(q);
        const matchModule = log.module?.toLowerCase().includes(q);
        const matchAction = log.actionType?.toLowerCase().includes(q);
        const matchId = log.id?.toLowerCase().includes(q) || log.operationId?.toLowerCase().includes(q);

        if (!matchUser && !matchEmail && !matchDesc && !matchTarget && !matchModule && !matchAction && !matchId) {
          return false;
        }
      }

      // 2. User Filter
      if (selectedUser !== 'all') {
        if (log.userId !== selectedUser && log.userName !== selectedUser) {
          return false;
        }
      }

      // 3. Module Filter
      if (selectedModule !== 'all') {
        if (log.module !== selectedModule) {
          return false;
        }
      }

      // 4. Action Type Filter
      if (selectedActionType !== 'all') {
        if (log.actionType !== selectedActionType) {
          return false;
        }
      }

      // 5. Date Filter
      const logDate = log.timestamp ? log.timestamp.split('T')[0] : '';
      if (!logDate) return true;

      if (dateFilter === 'today') {
        return logDate === todayStr;
      }

      if (dateFilter === '7days') {
        const limitDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return logDate >= limitDate;
      }

      if (dateFilter === '30days') {
        const limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return logDate >= limitDate;
      }

      if (dateFilter === 'this_month') {
        const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        return logDate >= startMonth;
      }

      if (dateFilter === 'custom') {
        if (startDate && logDate < startDate) return false;
        if (endDate && logDate > endDate) return false;
      }

      return true;
    });
  }, [accessibleLogs, search, selectedUser, selectedModule, selectedActionType, dateFilter, startDate, endDate]);

  // Grouped logs by visual relative day
  const groupedLogs: Record<string, UserActivityLog[]> = useMemo(() => {
    const groups: Record<string, UserActivityLog[]> = {};
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    filteredLogs.forEach((log) => {
      const dateKey = log.timestamp ? log.timestamp.split('T')[0] : 'Inconnue';
      let title = dateKey;

      if (dateKey === todayStr) {
        title = "Aujourd'hui";
      } else if (dateKey === yesterdayDate) {
        title = 'Hier';
      } else if (dateKey !== 'Inconnue') {
        try {
          const d = new Date(dateKey + 'T12:00:00');
          title = d.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          // Capitalize first letter
          title = title.charAt(0).toUpperCase() + title.slice(1);
        } catch {
          title = dateKey;
        }
      }

      if (!groups[title]) {
        groups[title] = [];
      }
      groups[title].push(log);
    });

    return groups;
  }, [filteredLogs]);

  // Statistics
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = accessibleLogs.filter((l) => l.timestamp && l.timestamp.startsWith(todayStr)).length;
    const criticalCount = accessibleLogs.filter(
      (l) => l.actionType === 'Suppression' || l.actionType === 'Désactivation' || l.actionType === 'Annulation'
    ).length;

    const uniqueUsersCount = new Set(accessibleLogs.map((l) => l.userId)).size;

    return {
      total: accessibleLogs.length,
      today: todayCount,
      critical: criticalCount,
      activeUsers: uniqueUsersCount,
    };
  }, [accessibleLogs]);

  // Action Type Badge Helper
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'Connexion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <LogIn className="w-3 h-3" /> Connexion
          </span>
        );
      case 'Déconnexion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <LogOut className="w-3 h-3" /> Déconnexion
          </span>
        );
      case 'Création':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" /> Création
          </span>
        );
      case 'Modification':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <RotateCcw className="w-3 h-3" /> Modification
          </span>
        );
      case 'Suppression':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Trash2 className="w-3 h-3" /> Suppression
          </span>
        );
      case 'Paiement':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CreditCard className="w-3 h-3" /> Paiement
          </span>
        );
      case 'Remboursement':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <RotateCcw className="w-3 h-3" /> Remboursement
          </span>
        );
      case 'Prolongation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <CalendarClock className="w-3 h-3" /> Prolongation
          </span>
        );
      case 'Clôture':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle2 className="w-3 h-3" /> Clôture
          </span>
        );
      case 'Annulation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" /> Annulation
          </span>
        );
      case 'Conversion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
            <CheckCircle2 className="w-3 h-3" /> Conversion
          </span>
        );
      case 'Statut':
      case 'Réactivation':
      case 'Désactivation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Shield className="w-3 h-3" /> {action}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F3] text-[#5A5A40] border border-[#E5E5DF]">
            {action}
          </span>
        );
    }
  };

  // Module Icon Helper
  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'Véhicules':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'Ventes':
        return <BadgePercent className="w-4 h-4 text-emerald-600" />;
      case 'Locations':
        return <KeyRound className="w-4 h-4 text-amber-600" />;
      case 'Clients':
        return <UsersIcon className="w-4 h-4 text-indigo-600" />;
      case 'Paiements':
        return <CreditCard className="w-4 h-4 text-teal-600" />;
      case 'Dépenses':
        return <Receipt className="w-4 h-4 text-rose-600" />;
      case 'Entretien':
      case 'Maintenance':
        return <Wrench className="w-4 h-4 text-orange-600" />;
      case 'Réservations':
        return <CalendarClock className="w-4 h-4 text-purple-600" />;
      case 'Utilisateurs':
      case 'Authentification':
      case 'Sécurité':
        return <Shield className="w-4 h-4 text-slate-700" />;
      case 'Paramètres':
      case 'Agence':
        return <SettingsIcon className="w-4 h-4 text-slate-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  // Role Badge Helper
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'Administrateur':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Gestionnaire':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Commercial':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Caissier':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Formatter for timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const formatFullDate = (isoString?: string) => {
    if (!isoString) return 'Date inconnue';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setDateFilter('all');
    setStartDate('');
    setEndDate('');
    setSelectedUser('all');
    setSelectedModule('all');
    setSelectedActionType('all');
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    dateFilter !== 'all' ||
    selectedUser !== 'all' ||
    selectedModule !== 'all' ||
    selectedActionType !== 'all';

  // Export CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['ID', 'Date', 'Heure', 'Utilisateur', 'Email', 'Rôle', 'Module', 'Action', 'Élément concerné', 'Description', 'ID Opération', 'Ancienne valeur', 'Nouvelle valeur'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp ? l.timestamp.split('T')[0] : '',
      formatTime(l.timestamp),
      l.userName || '',
      l.userEmail || '',
      l.userRole || '',
      l.module || '',
      l.actionType || '',
      `"${(l.targetItem || '').replace(/"/g, '""')}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`,
      l.operationId || '',
      `"${(l.previousValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal_activite_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Log Details Modal
  const handleOpenDetail = (log: UserActivityLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40]">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A18] font-['Outfit']">
                Journal d'activité & Traçabilité
              </h1>
              <p className="text-xs sm:text-sm text-[#7A7A72]">
                Historique chronologique et exhaustif des actions réelles effectuées dans Sirius Auto CRM
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {filteredLogs.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs font-semibold text-[#1A1A18] hover:bg-[#F5F5F3] transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#5A5A40]" />
              Exporter (CSV)
            </button>
          )}

          {currentUser?.role === 'Administrateur' && accessibleLogs.length > 0 && (
            <button
              type="button"
              onClick={() => setIsClearConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors shadow-xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Purger
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#7A7A72] font-medium mb-1">
            <span>Actions totales</span>
            <Layers className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div className="text-2xl font-bold text-[#1A1A18] font-['Outfit']">{stats.total}</div>
          <div className="text-[11px] text-[#7A7A72] mt-0.5">Enregistrées dans le système</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#7A7A72] font-medium mb-1">
            <span>Aujourd'hui</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-['Outfit']">{stats.today}</div>
          <div className="text-[11px] text-[#7A7A72] mt-0.5">Opérations du jour</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#7A7A72] font-medium mb-1">
            <span>Utilisateurs actifs</span>
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#1A1A18] font-['Outfit']">{stats.activeUsers}</div>
          <div className="text-[11px] text-[#7A7A72] mt-0.5">Ayant opéré sur le CRM</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#7A7A72] font-medium mb-1">
            <span>Actions sensibles</span>
            <Shield className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-['Outfit']">{stats.critical}</div>
          <div className="text-[11px] text-[#7A7A72] mt-0.5">Suppressions & Annulations</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7A72]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par utilisateur, action, véhicule, client, ID d'opération..."
              className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm bg-[#F9F9F8] border border-[#E5E5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7A72] hover:text-[#1A1A18]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilterOption)}
              className="px-3 py-2 text-xs sm:text-sm bg-[#F9F9F8] border border-[#E5E5DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30 text-[#1A1A18]"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="7days">7 derniers jours</option>
              <option value="30days">30 derniers jours</option>
              <option value="this_month">Ce mois-ci</option>
              <option value="custom">Période personnalisée...</option>
            </select>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                title="Réinitialiser les filtres"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-[#F0F0EE]">
          {/* User Select */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#7A7A72] mb-1">
              Utilisateur
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#F9F9F8] border border-[#E5E5DF] rounded-lg text-[#1A1A18]"
            >
              <option value="all">Tous les utilisateurs</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Module Select */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#7A7A72] mb-1">
              Module
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#F9F9F8] border border-[#E5E5DF] rounded-lg text-[#1A1A18]"
            >
              <option value="all">Tous les modules</option>
              {availableModules.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>

          {/* Action Type Select */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#7A7A72] mb-1">
              Type d'action
            </label>
            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-[#F9F9F8] border border-[#E5E5DF] rounded-lg text-[#1A1A18]"
            >
              <option value="all">Tous les types d'actions</option>
              {availableActionTypes.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom date range picker if selected */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-[#F0F0EE]">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#7A7A72] font-medium">Du :</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 text-xs bg-[#F9F9F8] border border-[#E5E5DF] rounded-lg text-[#1A1A18]"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#7A7A72] font-medium">Au :</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 text-xs bg-[#F9F9F8] border border-[#E5E5DF] rounded-lg text-[#1A1A18]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Grouped Activity Logs */}
      {Object.keys(groupedLogs).length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E5E5DF] p-12 text-center max-w-lg mx-auto shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F5F3] text-[#5A5A40] flex items-center justify-center mx-auto">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
            {hasActiveFilters ? 'Aucune activité correspondant aux critères' : "Aucune activité enregistrée"}
          </h3>
          <p className="text-xs sm:text-sm text-[#7A7A72] leading-relaxed">
            {hasActiveFilters
              ? 'Essayez de modifier vos filtres ou réinitialisez la recherche pour afficher toutes les entrées.'
              : 'Les actions effectuées dans le CRM (ventes, locations, paiements, clients, véhicules) apparaîtront automatiquement ici.'}
          </p>
          {hasActiveFilters && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupedLogs) as [string, UserActivityLog[]][]).map(([groupTitle, logs]) => (
            <div key={groupTitle} className="space-y-3">
              {/* Group Header Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] bg-[#5A5A40]/10 px-3 py-1 rounded-full border border-[#5A5A40]/20">
                  {groupTitle}
                </span>
                <div className="h-px flex-1 bg-[#E5E5DF]" />
                <span className="text-[11px] text-[#7A7A72] font-medium">
                  {logs.length} action{logs.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-2xl border border-[#E5E5DF] overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F9F9F8] border-b border-[#E5E5DF] text-[11px] font-semibold text-[#7A7A72] uppercase tracking-wider">
                      <th className="py-3 px-4 w-24">Heure</th>
                      <th className="py-3 px-4 w-44">Utilisateur</th>
                      <th className="py-3 px-4 w-32">Module</th>
                      <th className="py-3 px-4 w-36">Action</th>
                      <th className="py-3 px-4">Élément & Description</th>
                      <th className="py-3 px-4 text-right w-20">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0EE] text-xs sm:text-sm">
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => handleOpenDetail(log)}
                        className="hover:bg-[#FDFDFD] transition-colors cursor-pointer group"
                      >
                        {/* Time */}
                        <td className="py-3 px-4 font-mono text-xs text-[#7A7A72] whitespace-nowrap">
                          {formatTime(log.timestamp)}
                        </td>

                        {/* User */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#F5F5F3] border border-[#E5E5DF] flex items-center justify-center font-bold text-[10px] text-[#5A5A40] shrink-0">
                              {log.userName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="truncate">
                              <div className="font-semibold text-[#1A1A18] truncate leading-tight">
                                {log.userName || 'Système'}
                              </div>
                              {log.userRole && (
                                <span className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border mt-0.5 ${getRoleBadge(log.userRole)}`}>
                                  {log.userRole}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Module */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-[#1A1A18]">
                            {getModuleIcon(log.module)}
                            <span>{log.module}</span>
                          </div>
                        </td>

                        {/* Action Type */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getActionBadge(log.actionType)}
                        </td>

                        {/* Target & Description */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1A1A18] line-clamp-1">
                            {log.targetItem || log.description}
                          </div>
                          {log.description && log.targetItem && log.description !== log.targetItem && (
                            <div className="text-xs text-[#7A7A72] line-clamp-1 mt-0.5">
                              {log.description}
                            </div>
                          )}
                        </td>

                        {/* Details Button */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(log);
                            }}
                            className="p-1.5 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F3] transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden space-y-2.5">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => handleOpenDetail(log)}
                    className="bg-white rounded-2xl border border-[#E5E5DF] p-3.5 shadow-xs space-y-2.5 cursor-pointer active:scale-[0.99] transition-transform"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#F5F5F3] border border-[#E5E5DF] flex items-center justify-center font-bold text-[10px] text-[#5A5A40]">
                          {log.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-xs text-[#1A1A18]">
                          {log.userName || 'Système'}
                        </span>
                        {log.userRole && (
                          <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${getRoleBadge(log.userRole)}`}>
                            {log.userRole}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-[#7A7A72]">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-[#7A7A72]">
                        {getModuleIcon(log.module)}
                        <span>{log.module}</span>
                      </div>
                      <span className="text-[#E5E5DF]">•</span>
                      {getActionBadge(log.actionType)}
                    </div>

                    <div>
                      <div className="font-semibold text-xs text-[#1A1A18]">
                        {log.targetItem || log.description}
                      </div>
                      {log.description && log.targetItem && log.description !== log.targetItem && (
                        <div className="text-[11px] text-[#7A7A72] mt-0.5 line-clamp-2">
                          {log.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Detail Modal */}
      {isDetailModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5E5DF] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E5E5DF] flex items-center justify-between bg-[#F9F9F8]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40]">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                    Détails de l'action
                  </h3>
                  <p className="text-xs text-[#7A7A72]">
                    Enregistrement d'audit sécurisé
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#E5E5DF]/50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              {/* Action Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9F9F8] border border-[#E5E5DF]">
                <div className="flex items-center gap-2">
                  {getModuleIcon(selectedLog.module)}
                  <span className="font-bold text-[#1A1A18]">{selectedLog.module}</span>
                </div>
                {getActionBadge(selectedLog.actionType)}
              </div>

              {/* Grid Properties */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FDFDFD] border border-[#E5E5DF] p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A72]">Date & Heure</span>
                  <div className="font-semibold text-[#1A1A18]">
                    {formatFullDate(selectedLog.timestamp)}
                  </div>
                </div>

                <div className="bg-[#FDFDFD] border border-[#E5E5DF] p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A72]">Utilisateur</span>
                  <div className="font-semibold text-[#1A1A18] truncate">
                    {selectedLog.userName || 'Système'}
                  </div>
                  {selectedLog.userRole && (
                    <span className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border ${getRoleBadge(selectedLog.userRole)}`}>
                      {selectedLog.userRole}
                    </span>
                  )}
                </div>
              </div>

              {/* Target Item */}
              <div className="bg-[#FDFDFD] border border-[#E5E5DF] p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A72]">Élément concerné</span>
                <div className="font-semibold text-[#1A1A18] text-sm">
                  {selectedLog.targetItem || selectedLog.description}
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#FDFDFD] border border-[#E5E5DF] p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A72]">Description complète</span>
                <div className="text-xs sm:text-sm text-[#1A1A18] leading-relaxed whitespace-pre-wrap">
                  {selectedLog.description}
                </div>
              </div>

              {/* Value Changes if present */}
              {(selectedLog.previousValue || selectedLog.newValue) && (
                <div className="space-y-2 border-t border-[#F0F0EE] pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A72]">Modifications de valeurs</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedLog.previousValue && (
                      <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200">
                        <span className="block text-[10px] font-bold text-rose-700 uppercase">Ancienne valeur</span>
                        <span className="text-rose-900 font-mono text-xs">{selectedLog.previousValue}</span>
                      </div>
                    )}
                    {selectedLog.newValue && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                        <span className="block text-[10px] font-bold text-emerald-700 uppercase">Nouvelle valeur</span>
                        <span className="text-emerald-900 font-mono text-xs">{selectedLog.newValue}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technical Audit Identifiers */}
              <div className="bg-[#F5F5F3] p-3 rounded-xl space-y-1 text-[11px] font-mono text-[#7A7A72]">
                <div className="flex items-center justify-between">
                  <span>ID Log :</span>
                  <span className="text-[#1A1A18]">{selectedLog.id}</span>
                </div>
                {selectedLog.operationId && (
                  <div className="flex items-center justify-between">
                    <span>ID Opération / Réf :</span>
                    <span className="text-[#1A1A18]">{selectedLog.operationId}</span>
                  </div>
                )}
                {selectedLog.userEmail && (
                  <div className="flex items-center justify-between">
                    <span>E-mail utilisateur :</span>
                    <span className="text-[#1A1A18]">{selectedLog.userEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#E5E5DF] flex justify-end bg-[#F9F9F8]">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5E5DF] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                Purger le journal d'activité ?
              </h3>
              <p className="text-xs sm:text-sm text-[#7A7A72] leading-relaxed">
                Cette action supprimera définitivement l'ensemble des journaux d'audit enregistrés. Cette opération est irréversible.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F3] rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAuditLogs();
                  setIsClearConfirmOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Confirmer la purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
