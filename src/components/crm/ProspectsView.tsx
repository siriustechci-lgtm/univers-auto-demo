import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Prospect, ProspectStatus, ProspectNeedType } from '../../types';
import { ProspectModal } from './ProspectModal';
import { ProspectDetailModal } from './ProspectDetailModal';
import {
  Target,
  UserPlus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  Car,
  DollarSign,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  BellRing,
  Layers,
  Kanban,
  List,
  BarChart3,
  CalendarDays,
} from 'lucide-react';

interface ProspectsViewProps {
  onNewSale?: (clientId?: string) => void;
  onNewRental?: (clientId?: string) => void;
  searchQuery?: string;
}

export const ProspectsView: React.FC<ProspectsViewProps> = ({
  onNewSale,
  onNewRental,
  searchQuery = '',
}) => {
  const {
    prospects,
    updateProspect,
    deleteProspect,
    completeProspectReminder,
    convertProspectToClient,
    getCommercialDashboardStats,
    settings,
  } = useCrm();

  // Internal search and filters
  const [internalSearch, setInternalSearch] = useState('');
  const [activeMainTab, setActiveMainTab] = useState<'list' | 'pipeline' | 'reminders' | 'stats'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [needFilter, setNeedFilter] = useState<string>('all');
  const [reminderFilter, setReminderFilter] = useState<'all' | 'today' | 'overdue' | 'upcoming'>('all');

  // Modals state
  const [isProspectModalOpen, setIsProspectModalOpen] = useState(false);
  const [prospectToEdit, setProspectToEdit] = useState<Prospect | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [prospectToView, setProspectToView] = useState<Prospect | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Stats calculation
  const stats = useMemo(() => getCommercialDashboardStats(), [prospects, getCommercialDashboardStats]);

  // Combined search term
  const effectiveSearch = (searchQuery || internalSearch).toLowerCase().trim();

  // Filtered prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      // Search matching
      const matchesSearch =
        !effectiveSearch ||
        p.name.toLowerCase().includes(effectiveSearch) ||
        p.phone.includes(effectiveSearch) ||
        (p.whatsapp && p.whatsapp.includes(effectiveSearch)) ||
        (p.email && p.email.toLowerCase().includes(effectiveSearch)) ||
        (p.searchedVehicle && p.searchedVehicle.toLowerCase().includes(effectiveSearch)) ||
        p.prospectNumber.toLowerCase().includes(effectiveSearch) ||
        (p.notes && p.notes.toLowerCase().includes(effectiveSearch));

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }

      // Need filter
      if (needFilter !== 'all' && p.needType !== needFilter) {
        return false;
      }

      // Reminder filter
      if (reminderFilter === 'today') {
        const hasTodayReminder = p.reminders?.some((r) => r.status === 'À faire' && r.date === todayStr);
        if (!hasTodayReminder) return false;
      } else if (reminderFilter === 'overdue') {
        const hasOverdueReminder = p.reminders?.some((r) => r.status === 'À faire' && r.date < todayStr);
        if (!hasOverdueReminder) return false;
      } else if (reminderFilter === 'upcoming') {
        const hasUpcomingReminder = p.reminders?.some((r) => r.status === 'À faire' && r.date > todayStr);
        if (!hasUpcomingReminder) return false;
      }

      return true;
    });
  }, [prospects, effectiveSearch, statusFilter, needFilter, reminderFilter, todayStr]);

  // Handle open creation
  const handleOpenAddModal = () => {
    setProspectToEdit(null);
    setIsProspectModalOpen(true);
  };

  // Handle open edit
  const handleOpenEditModal = (p: Prospect) => {
    setProspectToEdit(p);
    setIsProspectModalOpen(true);
  };

  // Handle open detail sheet
  const handleOpenDetailModal = (p: Prospect) => {
    setProspectToView(p);
    setIsDetailModalOpen(true);
  };

  // Clean phone helper for WhatsApp
  const cleanPhoneForWhatsApp = (num: string) => {
    let clean = num.replace(/\D/g, '');
    if (clean.startsWith('0') && clean.length === 10) {
      clean = '33' + clean.slice(1);
    }
    return clean;
  };

  const getStatusBadge = (st: ProspectStatus) => {
    switch (st) {
      case 'Nouveau':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'En discussion':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Intéressé':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Gagné':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Perdu':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const pipelineStages: ProspectStatus[] = ['Nouveau', 'En discussion', 'Intéressé', 'Gagné', 'Perdu'];

  return (
    <div id="crm_prospects_view_root" className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                CRM Commercial & Prospects
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Suivi des opportunités, relances et conversion en ventes ou locations
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            id="add_new_prospect_main_btn"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouveau prospect</span>
          </button>
        </div>
      </div>

      {/* Real-time Summary Cards Section */}
      <div id="prospects_summary_cards_section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Prospects Card */}
        <div
          id="prospects_summary_card_total"
          onClick={() => {
            setStatusFilter('all');
            setNeedFilter('all');
            setReminderFilter('all');
          }}
          className="cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              {stats.totalProspects} {stats.totalProspects > 1 ? 'prospects' : 'prospect'}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Total Prospects
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {stats.totalProspects}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                au portefeuille
              </span>
            </div>
          </div>
        </div>

        {/* Nouveaux Prospects Card */}
        <div
          id="prospects_summary_card_new"
          onClick={() => {
            setStatusFilter('Nouveau');
            setActiveMainTab('list');
          }}
          className="cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500/50 dark:hover:border-sky-500/50 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              {stats.newProspects > 0 && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>}
              {stats.newProspects} nouveau{stats.newProspects > 1 ? 'x' : ''}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Nouveaux Prospects
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-sky-600 dark:text-sky-400 tracking-tight">
                {stats.newProspects}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                à qualifier
              </span>
            </div>
          </div>
        </div>

        {/* Prospects En Discussion Card */}
        <div
          id="prospects_summary_card_in_discussion"
          onClick={() => {
            setStatusFilter('En discussion');
            setActiveMainTab('list');
          }}
          className="cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              {stats.inDiscussionProspects} en cours
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              En Discussion
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 tracking-tight">
                {stats.inDiscussionProspects}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                négociations actives
              </span>
            </div>
          </div>
        </div>

        {/* Taux de Conversion Card */}
        <div
          id="prospects_summary_card_conversion_rate"
          onClick={() => {
            setActiveMainTab('stats');
          }}
          className="cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {stats.wonProspects} clos gagné{stats.wonProspects > 1 ? 's' : ''}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Taux de Conversion
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {stats.conversionRate}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ratio gagné / total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Tabs (Liste / Pipeline / Relances / Stats) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="tab_prospects_list_btn"
              onClick={() => setActiveMainTab('list')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeMainTab === 'list'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Liste des prospects ({filteredProspects.length})</span>
            </button>

            <button
              id="tab_prospects_pipeline_btn"
              onClick={() => setActiveMainTab('pipeline')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeMainTab === 'pipeline'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Pipeline & Opportunités</span>
            </button>

            <button
              id="tab_prospects_reminders_btn"
              onClick={() => setActiveMainTab('reminders')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeMainTab === 'reminders'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BellRing className="w-4 h-4" />
              <span>Relances & Agenda</span>
              {(stats.upcomingRemindersCount > 0 || stats.overdueRemindersCount > 0) && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {stats.upcomingRemindersCount + stats.overdueRemindersCount}
                </span>
              )}
            </button>

            <button
              id="tab_prospects_stats_btn"
              onClick={() => setActiveMainTab('stats')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeMainTab === 'stats'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Performance</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search_prospects_input"
              type="text"
              placeholder="Rechercher nom, tél, auto..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Filter Bar (in List View) */}
        {activeMainTab === 'list' && (
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtres :
            </span>

            {/* Status pills */}
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Tous ({prospects.length})
            </button>
            {(['Nouveau', 'En discussion', 'Intéressé', 'Gagné', 'Perdu'] as ProspectStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {st}
              </button>
            ))}

            <span className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

            {/* Need filters */}
            <select
              value={needFilter}
              onChange={(e) => setNeedFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="all">Tous besoins</option>
              <option value="Achat">Achat</option>
              <option value="Location">Location</option>
              <option value="Information">Information</option>
              <option value="Autre">Autre</option>
            </select>

            {/* Reminder filter */}
            <select
              value={reminderFilter}
              onChange={(e) => setReminderFilter(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="all">Toutes dates</option>
              <option value="today">Relances du jour</option>
              <option value="overdue">Relances en retard</option>
              <option value="upcoming">Relances à venir</option>
            </select>
          </div>
        )}

        {/* 1. LIST VIEW */}
        {activeMainTab === 'list' && (
          <div className="overflow-x-auto">
            {filteredProspects.length === 0 ? (
              <div className="p-12 text-center">
                <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Aucun prospect trouvé
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  {prospects.length === 0
                    ? 'Ajoutez votre premier prospect pour démarrer le suivi commercial.'
                    : 'Aucun prospect ne correspond à vos critères de recherche.'}
                </p>
                {prospects.length === 0 && (
                  <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm inline-flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Créer le premier prospect</span>
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Prospect</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Besoin & Véhicule</th>
                    <th className="py-3.5 px-4">Budget</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4">Prochaine relance</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredProspects.map((p) => {
                    const waLink = p.whatsapp || p.phone
                      ? `https://wa.me/${cleanPhoneForWhatsApp(p.whatsapp || p.phone)}?text=${encodeURIComponent(
                          `Bonjour ${p.name}, je fais suite à votre demande concernant ${p.searchedVehicle || 'un véhicule'} chez ${settings.agencyName || 'Sirius Auto'}.`
                        )}`
                      : null;

                    const pendingReminder = p.reminders?.find((r) => r.status === 'À faire');
                    const isReminderOverdue = pendingReminder && pendingReminder.date < todayStr;
                    const isReminderToday = pendingReminder && pendingReminder.date === todayStr;

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* Prospect ID & Name */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleOpenDetailModal(p)}
                            className="font-bold text-slate-900 dark:text-white hover:text-blue-600 text-left block"
                          >
                            {p.name}
                          </button>
                          <span className="text-[11px] font-mono text-slate-400">
                            {p.prospectNumber}
                          </span>
                        </td>

                        {/* Contact details */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{p.phone}</span>
                            </div>
                            {p.email && (
                              <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                                {p.email}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Need & Vehicle */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                              {p.needType}
                            </span>
                            {p.searchedVehicle && (
                              <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 pt-0.5">
                                <Car className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate max-w-[160px]">{p.searchedVehicle}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Budget */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {p.budget ? `${p.budget.toLocaleString('fr-FR')} ${settings.currencySymbol}` : '-'}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full font-semibold border text-[11px] ${getStatusBadge(p.status)}`}>
                            {p.status}
                          </span>
                        </td>

                        {/* Next Reminder */}
                        <td className="py-3.5 px-4">
                          {pendingReminder ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{new Date(pendingReminder.date).toLocaleDateString('fr-FR')}</span>
                                {isReminderOverdue && (
                                  <span className="text-[10px] px-1.5 rounded bg-rose-100 text-rose-700 font-bold">
                                    Retard
                                  </span>
                                )}
                                {isReminderToday && (
                                  <span className="text-[10px] px-1.5 rounded bg-amber-100 text-amber-700 font-bold">
                                    Aujourd'hui
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                                {pendingReminder.reason}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Aucune</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60"
                                title="Ouvrir WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => handleOpenDetailModal(p)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                              title="Voir la fiche détaillée"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {!p.convertedToClientId && (
                              <button
                                onClick={() => convertProspectToClient(p.id)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40"
                                title="Convertir en client officiel"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                              title="Modifier"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Supprimer le prospect ${p.name} ?`)) {
                                  deleteProspect(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 2. PIPELINE & OPPORTUNITÉS (KANBAN) */}
        {activeMainTab === 'pipeline' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[600px] overflow-x-auto">
            {pipelineStages.map((stage) => {
              const stageProspects = filteredProspects.filter((p) => p.status === stage);
              const stageTotalBudget = stageProspects.reduce((acc, p) => acc + (p.budget || 0), 0);

              const getStageHeaderBg = () => {
                switch (stage) {
                  case 'Nouveau':
                    return 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20';
                  case 'En discussion':
                    return 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20';
                  case 'Intéressé':
                    return 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20';
                  case 'Gagné':
                    return 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20';
                  case 'Perdu':
                    return 'border-slate-500 bg-slate-50/50 dark:bg-slate-800/20';
                }
              };

              return (
                <div
                  key={stage}
                  className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col min-w-[220px]"
                >
                  {/* Stage header */}
                  <div className={`p-3.5 rounded-t-xl border-t-4 ${getStageHeaderBg()}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {stage}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-[10px] font-bold shadow-sm">
                        {stageProspects.length}
                      </span>
                    </div>
                    {stageTotalBudget > 0 && (
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                        {stageTotalBudget.toLocaleString('fr-FR')} {settings.currencySymbol}
                      </p>
                    )}
                  </div>

                  {/* Stage cards */}
                  <div className="p-3 flex-1 space-y-3 overflow-y-auto max-h-[650px]">
                    {stageProspects.map((p) => {
                      const currentIdx = pipelineStages.indexOf(p.status);
                      const waLink = p.whatsapp || p.phone
                        ? `https://wa.me/${cleanPhoneForWhatsApp(p.whatsapp || p.phone)}`
                        : null;

                      return (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2 group hover:border-blue-400 dark:hover:border-blue-500 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <button
                                onClick={() => handleOpenDetailModal(p)}
                                className="font-bold text-xs text-slate-900 dark:text-white hover:text-blue-600 text-left block leading-snug"
                              >
                                {p.name}
                              </button>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {p.prospectNumber}
                              </span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                              {p.needType}
                            </span>
                          </div>

                          {p.searchedVehicle && (
                            <div className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium">
                              <Car className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{p.searchedVehicle}</span>
                            </div>
                          )}

                          {p.budget && (
                            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                              {p.budget.toLocaleString('fr-FR')} {settings.currencySymbol}
                            </div>
                          )}

                          {/* Move Stage Buttons */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {currentIdx > 0 && (
                                <button
                                  onClick={() => updateProspect(p.id, { status: pipelineStages[currentIdx - 1] })}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                                  title={`Reculer vers ${pipelineStages[currentIdx - 1]}`}
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {currentIdx < pipelineStages.length - 1 && (
                                <button
                                  onClick={() => updateProspect(p.id, { status: pipelineStages[currentIdx + 1] })}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                                  title={`Avancer vers ${pipelineStages[currentIdx + 1]}`}
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                  title="WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => handleOpenDetailModal(p)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded"
                                title="Fiche"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. RELANCES & AGENDA COMMERCIAL */}
        {activeMainTab === 'reminders' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Agenda des relances & relances prioritaires
              </h3>
              <p className="text-xs text-slate-500">
                Toutes les relances programmées auprès de vos prospects avec accès direct WhatsApp.
              </p>
            </div>

            {/* Reminders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prospects.flatMap((p) =>
                (p.reminders || []).map((rem) => {
                  const isPending = rem.status === 'À faire';
                  const isOverdue = isPending && rem.date < todayStr;
                  const isToday = isPending && rem.date === todayStr;

                  const waLink = p.whatsapp || p.phone
                    ? `https://wa.me/${cleanPhoneForWhatsApp(p.whatsapp || p.phone)}?text=${encodeURIComponent(
                        `Bonjour ${p.name}, je me permets de revenir vers vous suite à notre dernier échange concernant votre projet automobile chez ${settings.agencyName || 'Sirius Auto'}.`
                      )}`
                    : null;

                  return (
                    <div
                      key={rem.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                        !isPending
                          ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                          : isOverdue
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-sm'
                          : isToday
                          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {p.name}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                              En retard
                            </span>
                          )}
                          {isToday && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">
                              Aujourd'hui
                            </span>
                          )}
                          {!isPending && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                              Terminé
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {rem.reason}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(rem.date).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {rem.time || '10:00'}
                          </span>
                        </div>

                        {rem.notes && (
                          <p className="text-[11px] text-slate-500 italic bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg">
                            "{rem.notes}"
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      {isPending && (
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              WhatsApp
                            </a>
                          )}
                          <button
                            onClick={() => completeProspectReminder(p.id, rem.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Effectué
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 4. PERFORMANCE & STATISTIQUES COMMERCIALES (100% REAL DATA) */}
        {activeMainTab === 'stats' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tableau de bord de rentabilité commerciale
              </h3>
              <p className="text-xs text-slate-500">
                Statistiques basées à 100% sur les opportunités et affaires réelles enregistrées.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Conversion summary */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Entonnoir de Conversion
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Total Prospects créés</span>
                    <span className="font-bold text-slate-900 dark:text-white">{stats.totalProspects}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Prospects Convertis en Clients</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{stats.convertedClientsCount}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Opportunités Gagnées</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.wonProspects}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Opportunités Perdues</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{stats.lostProspects}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 font-bold text-sm">
                    <span>Taux de succès global</span>
                    <span className="text-emerald-600">{stats.conversionRate}%</span>
                  </div>
                </div>
              </div>

              {/* Real Deals Won */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Activité Concrète Issue du CRM
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Ventes générées</span>
                    <span className="font-bold text-indigo-600">{stats.totalSalesCount} vente(s)</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Locations conclues</span>
                    <span className="font-bold text-teal-600">{stats.totalRentalsCount} location(s)</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Relances planifiées</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {prospects.reduce((acc, p) => acc + (p.reminders?.length || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown by need type */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Répartition des Besoins
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Achat de véhicules</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {prospects.filter((p) => p.needType === 'Achat').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Location de véhicules</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {prospects.filter((p) => p.needType === 'Location').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Demandes d'information</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {prospects.filter((p) => p.needType === 'Information').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Autres besoins</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {prospects.filter((p) => p.needType === 'Autre').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProspectModal
        isOpen={isProspectModalOpen}
        onClose={() => {
          setIsProspectModalOpen(false);
          setProspectToEdit(null);
        }}
        prospectToEdit={prospectToEdit}
      />

      <ProspectDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setProspectToView(null);
        }}
        prospect={prospectToView}
        onEdit={(p) => {
          setProspectToEdit(p);
          setIsProspectModalOpen(true);
        }}
        onConvertToSale={(p) => {
          setIsDetailModalOpen(false);
          if (p.convertedToClientId) {
            onNewSale?.(p.convertedToClientId);
          } else {
            const newCli = convertProspectToClient(p.id);
            if (newCli) onNewSale?.(newCli.id);
          }
        }}
        onConvertToRental={(p) => {
          setIsDetailModalOpen(false);
          if (p.convertedToClientId) {
            onNewRental?.(p.convertedToClientId);
          } else {
            const newCli = convertProspectToClient(p.id);
            if (newCli) onNewRental?.(newCli.id);
          }
        }}
      />
    </div>
  );
};
