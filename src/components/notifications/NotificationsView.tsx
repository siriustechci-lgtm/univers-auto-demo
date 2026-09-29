import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  CrmNotification,
  NotificationCategory,
  NotificationPriority,
  NavigationTab,
} from '../../types';
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  ExternalLink,
  Car,
  KeyRound,
  BadgePercent,
  CreditCard,
  CalendarClock,
  Target,
  Sparkles,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface NotificationsViewProps {
  onOpenSaleDetail?: (saleId: string) => void;
  onOpenRentalDetail?: (rentalId: string) => void;
  onCloseRental?: (rentalId: string) => void;
  onOpenPaymentDetail?: (paymentId: string) => void;
  onOpenVehicleDetail?: (vehicleId: string) => void;
  onOpenClientDetail?: (clientId: string) => void;
}

type TabFilter = 'all' | 'unread' | 'read';

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onOpenSaleDetail,
  onOpenRentalDetail,
  onCloseRental,
  onOpenPaymentDetail,
  onOpenVehicleDetail,
  onOpenClientDetail,
}) => {
  const {
    notifications,
    sales,
    rentals,
    payments,
    vehicles,
    prospects,
    reservations,
    setActiveTab,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationsAsRead,
    deleteNotification,
    clearReadNotifications,
    clearAllNotifications,
    addToast,
  } = useCrm();

  const [tabFilter, setTabFilter] = useState<TabFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );
  const readCount = useMemo(
    () => notifications.filter((n) => n.isRead).length,
    [notifications]
  );

  // Filtered Notifications list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Read status filter
      if (tabFilter === 'unread' && item.isRead) return false;
      if (tabFilter === 'read' && !item.isRead) return false;

      // 2. Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // 3. Priority filter
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = (item.title || '').toLowerCase().includes(query);
        const matchMessage = (item.message || '').toLowerCase().includes(query);
        const matchType = (item.type || '').toLowerCase().includes(query);
        const matchRef = (item.referenceNumber || '').toLowerCase().includes(query);
        if (!matchTitle && !matchMessage && !matchType && !matchRef) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, tabFilter, selectedCategory, selectedPriority, searchQuery]);

  // Group into Urgent / Important / Normal if viewing all, or display chronological
  const urgentCount = useMemo(
    () => notifications.filter((n) => !n.isRead && n.priority === 'Urgent').length,
    [notifications]
  );
  const importantCount = useMemo(
    () => notifications.filter((n) => !n.isRead && n.priority === 'Important').length,
    [notifications]
  );

  // Category Icon Resolver
  const getCategoryIcon = (category: NotificationCategory, priority: NotificationPriority) => {
    switch (category) {
      case 'Ventes':
        return <BadgePercent className="w-4 h-4 text-emerald-600" />;
      case 'Locations':
        return <KeyRound className="w-4 h-4 text-blue-600" />;
      case 'Paiements':
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      case 'Véhicules':
        return <Car className="w-4 h-4 text-amber-600" />;
      case 'Réservations':
        return <CalendarClock className="w-4 h-4 text-indigo-600" />;
      case 'Prospects':
        return <Target className="w-4 h-4 text-teal-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#5A5A40]" />;
    }
  };

  // Priority Badge Resolver
  const renderPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Urgent
          </span>
        );
      case 'Important':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Important
          </span>
        );
      case 'Normal':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            <Info className="w-3 h-3 text-slate-500" />
            Information
          </span>
        );
    }
  };

  // Handle direct item opening / navigation
  const handleOpenNotificationItem = (notification: CrmNotification) => {
    // Automatically mark as read when clicking open
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }

    const { linkTab, referenceType, referenceId } = notification;

    if (referenceType === 'sale' && referenceId && onOpenSaleDetail) {
      onOpenSaleDetail(referenceId);
      return;
    }

    if (referenceType === 'rental' && referenceId) {
      if (notification.type === "Retour prévu aujourd'hui" && onCloseRental) {
        onCloseRental(referenceId);
        return;
      }
      if (onOpenRentalDetail) {
        onOpenRentalDetail(referenceId);
        return;
      }
    }

    if (referenceType === 'payment' && referenceId && onOpenPaymentDetail) {
      onOpenPaymentDetail(referenceId);
      return;
    }

    if (referenceType === 'vehicle' && referenceId && onOpenVehicleDetail) {
      onOpenVehicleDetail(referenceId);
      return;
    }

    if (referenceType === 'client' && referenceId && onOpenClientDetail) {
      onOpenClientDetail(referenceId);
      return;
    }

    if (linkTab) {
      setActiveTab(linkTab);
    }
  };

  const formatNotificationTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      const timeStr = date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (isToday) {
        return `Aujourd'hui à ${timeStr}`;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `Hier à ${timeStr}`;
      }

      return `${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à ${timeStr}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div id="notifications-view-root" className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#E5E5DF] bg-white p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
                <Bell className="w-4 h-4" />
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-[#5A5A40]/10 text-[#5A5A40] text-xs font-semibold border border-[#5A5A40]/20">
                Centre d'Attention Opérationnelle
              </span>
              {unreadCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                  À jour
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
              Centre de Notifications
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7A72] mt-1 max-w-2xl">
              Centralisation en direct des alertes prioritaires, échéances contractuelles, règlements et relances réelles de votre CRM.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {unreadCount > 0 && (
              <button
                id="btn-mark-all-read"
                onClick={markAllNotificationsAsRead}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAFAF8] hover:bg-[#F2F2EE] border border-[#E5E5DF] text-xs sm:text-sm font-medium text-[#1A1A18] transition-colors cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-[#5A5A40]" />
                <span>Tout marquer comme lu</span>
              </button>
            )}
            {readCount > 0 && (
              <button
                id="btn-clear-read"
                onClick={clearReadNotifications}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAFAF8] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 border border-[#E5E5DF] text-xs sm:text-sm font-medium text-[#7A7A72] transition-colors cursor-pointer"
                title="Supprimer les notifications déjà lues"
              >
                <Trash2 className="w-4 h-4" />
                <span>Nettoyer les lues</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Summary Pill Row (When notifications exist) */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-[#E5E5DF] shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-[#7A7A72] uppercase tracking-wider">Total alertes</p>
              <p className="text-lg font-bold text-[#1A1A18] mt-0.5">{notifications.length}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#FAFAF8] border border-[#E5E5DF] flex items-center justify-center text-[#5A5A40]">
              <Bell className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#E5E5DF] shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-[#7A7A72] uppercase tracking-wider">Non lues</p>
              <p className="text-lg font-bold text-[#1A1A18] mt-0.5">{unreadCount}</p>
            </div>
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              unreadCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-[#FAFAF8] border-[#E5E5DF] text-[#7A7A72]'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#E5E5DF] shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-[#7A7A72] uppercase tracking-wider">Urgentes</p>
              <p className="text-lg font-bold text-rose-700 mt-0.5">{urgentCount}</p>
            </div>
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              urgentCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-[#FAFAF8] border-[#E5E5DF] text-[#7A7A72]'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#E5E5DF] shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-[#7A7A72] uppercase tracking-wider">Important</p>
              <p className="text-lg font-bold text-amber-700 mt-0.5">{importantCount}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50/50 border border-amber-200/60 flex items-center justify-center text-amber-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Tabs, Search & Filters */}
      <div className="rounded-2xl border border-[#E5E5DF] bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl w-fit">
            <button
              id="tab-filter-all"
              onClick={() => setTabFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tabFilter === 'all'
                  ? 'bg-white text-[#1A1A18] shadow-xs border border-[#E5E5DF]'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              id="tab-filter-unread"
              onClick={() => setTabFilter('unread')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                tabFilter === 'unread'
                  ? 'bg-white text-[#1A1A18] shadow-xs border border-[#E5E5DF]'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              <span>Non lues</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              id="tab-filter-read"
              onClick={() => setTabFilter('read')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tabFilter === 'read'
                  ? 'bg-white text-[#1A1A18] shadow-xs border border-[#E5E5DF]'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              Lues ({readCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A92]" />
            <input
              id="input-search-notifications"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par référence, client, mot-clé..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] text-[#1A1A18] placeholder-[#9A9A92] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9A92] hover:text-[#1A1A18] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E5DF]">
          <div className="flex items-center gap-1.5 text-xs text-[#7A7A72] font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrer :</span>
          </div>

          {/* Category Dropdown/Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Toutes catégories' },
              { id: 'Locations', label: 'Locations' },
              { id: 'Ventes', label: 'Ventes' },
              { id: 'Paiements', label: 'Paiements' },
              { id: 'Véhicules', label: 'Véhicules' },
              { id: 'Réservations', label: 'Réservations' },
              { id: 'Prospects', label: 'Prospects' },
            ].map((cat) => (
              <button
                key={cat.id}
                id={`filter-cat-${cat.id.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#5A5A40] text-white'
                    : 'bg-[#FAFAF8] hover:bg-[#F2F2EE] text-[#7A7A72] border border-[#E5E5DF]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#E5E5DF] hidden sm:block mx-1" />

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'Toutes priorités' },
              { id: 'Urgent', label: 'Urgent' },
              { id: 'Important', label: 'Important' },
              { id: 'Normal', label: 'Normal' },
            ].map((pri) => (
              <button
                key={pri.id}
                id={`filter-pri-${pri.id.toLowerCase()}`}
                onClick={() => setSelectedPriority(pri.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedPriority === pri.id
                    ? 'bg-[#1A1A18] text-white'
                    : 'bg-[#FAFAF8] hover:bg-[#F2F2EE] text-[#7A7A72] border border-[#E5E5DF]'
                }`}
              >
                {pri.label}
              </button>
            ))}
          </div>

          {(selectedCategory !== 'all' || selectedPriority !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedPriority('all');
                setSearchQuery('');
              }}
              className="px-2 py-1 text-xs text-rose-600 hover:text-rose-700 font-medium ml-auto cursor-pointer"
            >
              Réinitialiser filtres
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        /* Empty State: Strictly conforming to rule: Title "Aucune nouvelle notification", Subtitle "Vous n'avez aucune notification pour le moment." */
        <div className="rounded-2xl border border-[#E5E5DF] bg-white p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] flex items-center justify-center mx-auto mb-4 text-[#5A5A40]">
            <CheckCircle2 className="w-8 h-8 text-[#5A5A40]" />
          </div>
          <h3 className="text-lg font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
            Aucune nouvelle notification
          </h3>
          <p className="text-sm text-[#7A7A72] mt-1 max-w-sm mx-auto">
            Vous n'avez aucune notification pour le moment.
          </p>
          {notifications.length > 0 && (
            <p className="text-xs text-[#9A9A92] mt-2">
              Aucun résultat ne correspond à vos filtres actuels.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => {
            const isUrgent = item.priority === 'Urgent';
            const isImportant = item.priority === 'Important';

            return (
              <div
                key={item.id}
                id={`notification-card-${item.id}`}
                className={`group rounded-2xl border transition-all duration-150 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !item.isRead
                    ? isUrgent
                      ? 'bg-white border-rose-200 shadow-xs hover:border-rose-300'
                      : isImportant
                      ? 'bg-white border-amber-200 shadow-xs hover:border-amber-300'
                      : 'bg-white border-[#E5E5DF] shadow-xs hover:border-[#5A5A40]/40'
                    : 'bg-[#FAFAF8]/80 border-[#E5E5DF]/70 text-[#7A7A72] hover:bg-white hover:border-[#E5E5DF]'
                }`}
              >
                {/* Left Content */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Category icon with subtle circle */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      !item.isRead
                        ? isUrgent
                          ? 'bg-rose-50 border-rose-200'
                          : isImportant
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-[#FAFAF8] border-[#E5E5DF]'
                        : 'bg-[#F2F2EE] border-[#E5E5DF]'
                    }`}
                  >
                    {getCategoryIcon(item.category, item.priority)}
                  </div>

                  {/* Text details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#7A7A72]">
                        {item.category}
                      </span>
                      <span className="text-xs text-[#9A9A92]">•</span>
                      <span className="text-xs font-medium text-[#5A5A40] bg-[#5A5A40]/10 px-2 py-0.5 rounded-md">
                        {item.type}
                      </span>
                      {renderPriorityBadge(item.priority)}
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Non lu" />
                      )}
                    </div>

                    <h4
                      className={`text-sm sm:text-base font-semibold tracking-tight truncate ${
                        !item.isRead ? 'text-[#1A1A18]' : 'text-[#5A5A52]'
                      }`}
                    >
                      {item.title}
                    </h4>

                    <p
                      className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${
                        !item.isRead ? 'text-[#4A4A42]' : 'text-[#7A7A72]'
                      }`}
                    >
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-[#9A9A92]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatNotificationTime(item.timestamp)}
                      </span>
                      {item.referenceNumber && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-medium text-[#7A7A72]">
                            Réf : {item.referenceNumber}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E5DF] w-full sm:w-auto justify-end">
                  {/* Direct Item Open Button */}
                  <button
                    id={`btn-open-notif-${item.id}`}
                    onClick={() => handleOpenNotificationItem(item)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
                      isUrgent && !item.isRead
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : isImportant && !item.isRead
                        ? 'bg-[#1A1A18] hover:bg-[#2D2D2A] text-white'
                        : 'bg-[#5A5A40] hover:bg-[#4A4A32] text-white'
                    }`}
                  >
                    <span>{item.actionLabel || 'Ouvrir'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Read / Unread toggle */}
                  {item.isRead ? (
                    <button
                      id={`btn-mark-unread-${item.id}`}
                      onClick={() => markNotificationAsUnread(item.id)}
                      className="p-2 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#E5E5DF] text-[#7A7A72] hover:text-[#1A1A18] transition-colors cursor-pointer"
                      title="Marquer comme non lu"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      id={`btn-mark-read-${item.id}`}
                      onClick={() => markNotificationAsRead(item.id)}
                      className="p-2 rounded-xl bg-white hover:bg-emerald-50 hover:border-emerald-200 text-[#7A7A72] hover:text-emerald-700 transition-colors cursor-pointer"
                      title="Marquer comme lu"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    id={`btn-delete-notif-${item.id}`}
                    onClick={() => deleteNotification(item.id)}
                    className="p-2 rounded-xl bg-white hover:bg-rose-50 hover:border-rose-200 text-[#7A7A72] hover:text-rose-600 transition-colors cursor-pointer"
                    title="Supprimer la notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
