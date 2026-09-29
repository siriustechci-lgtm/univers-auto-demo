import React, { useState, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { useAuth } from '../context/AuthContext';
import {
  WhatsAppMessage,
  MessageTemplate,
  CrmNotification,
  WhatsAppSettings,
  NavigationTab,
} from '../types';
import {
  MessageSquare,
  Bell,
  Sliders,
  FileCode,
  Send,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  RotateCw,
  Eye,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  ShieldAlert,
  Smartphone,
  Mail,
  Zap,
  Tag,
  Calendar,
  User,
  Car,
  FileText,
  CreditCard,
  X,
  Save,
  CheckCheck,
} from 'lucide-react';
import { SendWhatsAppModal } from './SendWhatsAppModal';

type ActiveSubTab = 'notifications' | 'history' | 'templates' | 'settings';

export const WhatsAppNotificationsView: React.FC = () => {
  const {
    messages,
    templates,
    notifications,
    whatsAppConfig,
    settings,
    clients,
    sales,
    rentals,
    payments,
    setActiveTab,
    sendWhatsAppMessage,
    deleteWhatsAppMessage,
    resendWhatsAppMessage,
    updateMessageTemplate,
    resetMessageTemplates,
    updateWhatsAppSettings,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    addToast,
  } = useCrm();

  const { currentUser } = useAuth();

  // Sub tab navigation
  const [subTab, setSubTab] = useState<ActiveSubTab>('notifications');

  // Search & Filters for Notifications
  const [notifFilterType, setNotifFilterType] = useState<string>('all');
  const [notifFilterUnreadOnly, setNotifFilterUnreadOnly] = useState<boolean>(false);
  const [notifSearchQuery, setNotifSearchQuery] = useState<string>('');

  // Search & Filters for Message History
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<string>('all');

  // Selected Message for detail modal preview
  const [selectedMessageForDetail, setSelectedMessageForDetail] = useState<WhatsAppMessage | null>(null);

  // Template Editing State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || 'tpl_conf_vente');
  const [editingTemplateText, setEditingTemplateText] = useState<string>('');
  const [editingTemplateTitle, setEditingTemplateTitle] = useState<string>('');
  const [editingTemplateDescription, setEditingTemplateDescription] = useState<string>('');
  const [isTemplateModified, setIsTemplateModified] = useState<boolean>(false);

  // Quick Send WhatsApp Modal
  const [isSendModalOpen, setIsSendModalOpen] = useState<boolean>(false);

  // Sync selected template
  const activeEditingTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  // Load active template to editor
  React.useEffect(() => {
    if (activeEditingTemplate) {
      setEditingTemplateText(activeEditingTemplate.template);
      setEditingTemplateTitle(activeEditingTemplate.title);
      setEditingTemplateDescription(activeEditingTemplate.description);
      setIsTemplateModified(false);
    }
  }, [activeEditingTemplate]);

  // Settings Local Form State
  const [settingsForm, setSettingsForm] = useState<WhatsAppSettings>(whatsAppConfig);

  React.useEffect(() => {
    setSettingsForm(whatsAppConfig);
  }, [whatsAppConfig]);

  // Handle Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateWhatsAppSettings(settingsForm);
  };

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (notifFilterUnreadOnly && n.isRead) return false;
      if (notifFilterType !== 'all' && n.type !== notifFilterType) return false;
      if (notifSearchQuery.trim()) {
        const query = notifSearchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [notifications, notifFilterType, notifFilterUnreadOnly, notifSearchQuery]);

  // Filtered Messages
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (historyCategoryFilter !== 'all' && m.messageCategory !== historyCategoryFilter) return false;
      if (historySearchQuery.trim()) {
        const query = historySearchQuery.toLowerCase();
        return (
          m.clientName.toLowerCase().includes(query) ||
          m.clientPhone.toLowerCase().includes(query) ||
          m.content.toLowerCase().includes(query) ||
          (m.referenceNumber && m.referenceNumber.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [messages, historyCategoryFilter, historySearchQuery]);

  // Stat Counters
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;
  const totalSentMessagesCount = messages.length;

  // Insert variable into template textarea
  const handleInsertVariable = (variable: string) => {
    setEditingTemplateText((prev) => prev + ' ' + variable);
    setIsTemplateModified(true);
  };

  // Save template edit
  const handleSaveTemplate = () => {
    if (!activeEditingTemplate) return;
    updateMessageTemplate(activeEditingTemplate.id, {
      title: editingTemplateTitle,
      description: editingTemplateDescription,
      template: editingTemplateText,
    });
    setIsTemplateModified(false);
  };

  // Helper for notification icons and colors
  const getNotificationIcon = (type: CrmNotification['type'], severity: CrmNotification['severity']) => {
    switch (type) {
      case 'sale':
        return <Tag className="w-4 h-4 text-[#107C41]" />;
      case 'rental':
        return <Car className="w-4 h-4 text-[#0066CC]" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-[#7A5A82]" />;
      case 'client':
        return <User className="w-4 h-4 text-[#8C6D1F]" />;
      case 'overdue_payment':
      case 'overdue_return':
        return <AlertTriangle className="w-4 h-4 text-[#D83B01]" />;
      case 'upcoming_return':
        return <Clock className="w-4 h-4 text-[#0078D4]" />;
      default:
        return <Bell className="w-4 h-4 text-[#5A5A40]" />;
    }
  };

  const getNotificationSeverityBadge = (severity: CrmNotification['severity']) => {
    switch (severity) {
      case 'success':
        return 'bg-[#107C41]/10 text-[#107C41] border-[#107C41]/20';
      case 'warning':
        return 'bg-[#FFF4CE] text-[#8C6D1F] border-[#FED9CC]';
      case 'error':
        return 'bg-[#FDE7E9] text-[#D83B01] border-[#F8B6BC]';
      default:
        return 'bg-[#F0EFEB] text-[#5A5A50] border-[#E5E5DF]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5DF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#1EBE5D] flex items-center justify-center shadow-xs">
            <MessageSquare className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A18] font-['Outfit'] tracking-tight flex items-center gap-2.5">
              WhatsApp & Notifications
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#25D366]/10 text-[#107C41]">
                Production Ready
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7A72]">
              Communications directes WhatsApp, automatisation des factures/contrats et alertes internes en temps réel
            </p>
          </div>
        </div>

        {/* Quick Send WhatsApp Action Button */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            id="btn-open-send-whatsapp-modal"
            onClick={() => setIsSendModalOpen(true)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-98 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Nouveau message WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-[#EBEBE6] rounded-2xl max-w-full overflow-x-auto">
        <button
          id="subtab-notifications"
          onClick={() => setSubTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'notifications'
              ? 'bg-white text-[#1A1A18] shadow-xs font-semibold'
              : 'text-[#6A6A60] hover:text-[#1A1A18]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Centre de notifications</span>
          {unreadNotifsCount > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#D83B01] text-white animate-pulse">
              {unreadNotifsCount}
            </span>
          )}
        </button>

        <button
          id="subtab-history"
          onClick={() => setSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'history'
              ? 'bg-white text-[#1A1A18] shadow-xs font-semibold'
              : 'text-[#6A6A60] hover:text-[#1A1A18]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Historique des messages</span>
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#F0EFEB] text-[#5A5A40]">
            {totalSentMessagesCount}
          </span>
        </button>

        <button
          id="subtab-templates"
          onClick={() => setSubTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'templates'
              ? 'bg-white text-[#1A1A18] shadow-xs font-semibold'
              : 'text-[#6A6A60] hover:text-[#1A1A18]'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Modèles de messages</span>
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#F0EFEB] text-[#5A5A40]">
            {templates.length}
          </span>
        </button>

        <button
          id="subtab-settings"
          onClick={() => setSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'settings'
              ? 'bg-white text-[#1A1A18] shadow-xs font-semibold'
              : 'text-[#6A6A60] hover:text-[#1A1A18]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Paramètres WhatsApp</span>
        </button>
      </div>

      {/* SUBTAB 1: CENTRE DE NOTIFICATIONS */}
      {subTab === 'notifications' && (
        <div className="space-y-4">
          {/* Action Bar & Filters */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E5E5DF] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                <input
                  type="text"
                  placeholder="Filtrer les notifications..."
                  value={notifSearchQuery}
                  onChange={(e) => setNotifSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#2D2D2A] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] focus:outline-hidden transition-all"
                />
              </div>

              <select
                value={notifFilterType}
                onChange={(e) => setNotifFilterType(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#2D2D2A] focus:outline-hidden"
              >
                <option value="all">Tous les types</option>
                <option value="sale">Ventes</option>
                <option value="rental">Locations</option>
                <option value="payment">Paiements</option>
                <option value="client">Clients</option>
                <option value="system">Système & WhatsApp</option>
              </select>

              <button
                onClick={() => setNotifFilterUnreadOnly(!notifFilterUnreadOnly)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  notifFilterUnreadOnly
                    ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                    : 'bg-[#FAFAF8] text-[#5A5A50] border-[#E5E5DF] hover:bg-[#F0EFEB]'
                }`}
              >
                Non lues uniquement ({unreadNotifsCount})
              </button>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {unreadNotifsCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAFAF8] hover:bg-[#F0EFEB] border border-[#E5E5DF] text-xs font-semibold text-[#5A5A40] transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Tout marquer lu</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAFAF8] hover:bg-[#FDE7E9] border border-[#E5E5DF] hover:border-[#F8B6BC] text-xs font-medium text-[#7A7A72] hover:text-[#D83B01] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Effacer</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-[#E5E5DF] shadow-xs text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#F5F5F0] text-[#9A9A92] flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit'] mb-1">
                Aucune nouvelle notification
              </h3>
              <p className="text-xs text-[#7A7A72] max-w-sm mx-auto">
                Vous n'avez aucune notification pour le moment.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`bg-white rounded-2xl p-4 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs hover:border-[#5A5A40]/40 ${
                    !notif.isRead ? 'border-[#5A5A40]/30 bg-[#FAFAF8]' : 'border-[#E5E5DF]'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-[#F5F5F0] shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type, notif.severity)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1A1A18] truncate">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#D83B01] shrink-0" />
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getNotificationSeverityBadge(
                            notif.severity
                          )}`}
                        >
                          {notif.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#5A5A50] leading-relaxed break-words">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[#9A9A92]">
                        <span>{new Date(notif.timestamp).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {notif.linkTab && (
                      <button
                        onClick={() => {
                          if (!notif.isRead) markNotificationAsRead(notif.id);
                          setActiveTab(notif.linkTab!);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#5A5A40] text-white hover:bg-[#484832] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span>Voir</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!notif.isRead && (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="p-1.5 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0EFEB] transition-colors cursor-pointer"
                        title="Marquer comme lu"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1.5 rounded-xl text-[#7A7A72] hover:text-[#D83B01] hover:bg-[#FDE7E9] transition-colors cursor-pointer"
                      title="Supprimer la notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: HISTORIQUE DES MESSAGES */}
      {subTab === 'history' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E5E5DF] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                <input
                  type="text"
                  placeholder="Rechercher par client, tél, mot clé..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#2D2D2A] focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] focus:outline-hidden transition-all"
                />
              </div>

              <select
                value={historyCategoryFilter}
                onChange={(e) => setHistoryCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#2D2D2A] focus:outline-hidden"
              >
                <option value="all">Toutes les catégories</option>
                <option value="vente">Ventes</option>
                <option value="location">Locations</option>
                <option value="paiement">Paiements</option>
                <option value="general">Général</option>
              </select>
            </div>

            <button
              onClick={() => setIsSendModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau message</span>
            </button>
          </div>

          {/* Messages Table / List */}
          {filteredMessages.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-[#E5E5DF] shadow-xs text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 fill-current opacity-40" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit'] mb-1">
                Aucun message envoyé
              </h3>
              <p className="text-xs text-[#7A7A72] max-w-sm mx-auto mb-5">
                Vous n'avez pas encore envoyé de messages WhatsApp à vos clients. Cliquez ci-dessous pour démarrer une communication réelle.
              </p>
              <button
                onClick={() => setIsSendModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer un message maintenant</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E5E5DF] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] border-b border-[#E5E5DF] text-[#7A7A72] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Date & Heure</th>
                      <th className="py-3 px-4">Client & N°</th>
                      <th className="py-3 px-4">Type de message</th>
                      <th className="py-3 px-4">Aperçu du contenu</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DF]">
                    {filteredMessages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-[#1A1A18]">
                            {new Date(msg.timestamp).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-[11px] text-[#9A9A92]">
                            {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-[#1A1A18] flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#25D366]" />
                            {msg.clientName}
                          </div>
                          <div className="text-[11px] text-[#5A5A40] font-mono">
                            {msg.clientPhone}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold text-[#1A1A18]">
                              {msg.messageType}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-[#F0EFEB] text-[#5A5A40] text-[10px] font-bold uppercase">
                              {msg.messageCategory}
                            </span>
                            {msg.referenceNumber && (
                              <span className="text-[10px] text-[#9A9A92] font-mono">
                                Réf: {msg.referenceNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <p className="line-clamp-2 text-[#5A5A50] leading-relaxed">
                            {msg.content}
                          </p>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#25D366]/10 text-[#1E7E34] text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            {msg.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedMessageForDetail(msg)}
                              className="p-1.5 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0EFEB] transition-colors cursor-pointer"
                              title="Voir le message complet"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => resendWhatsAppMessage(msg.id)}
                              className="p-1.5 rounded-lg text-[#25D366] hover:text-[#1EBE5D] hover:bg-[#25D366]/10 transition-colors cursor-pointer"
                              title="Renvoyer via WhatsApp"
                            >
                              <RotateCw className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => deleteWhatsAppMessage(msg.id)}
                              className="p-1.5 rounded-lg text-[#7A7A72] hover:text-[#D83B01] hover:bg-[#FDE7E9] transition-colors cursor-pointer"
                              title="Supprimer de l'historique"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: MODÈLES DE MESSAGES */}
      {subTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of Templates */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-3xl p-5 border border-[#E5E5DF] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#1A1A18] font-['Outfit']">
                  Modèles disponibles
                </h3>
                <button
                  onClick={resetMessageTemplates}
                  className="text-xs text-[#7A7A72] hover:text-[#5A5A40] font-semibold transition-colors cursor-pointer"
                >
                  Restaurer par défaut
                </button>
              </div>

              <div className="space-y-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedTemplateId === tpl.id
                        ? 'border-[#25D366] bg-[#25D366]/5 shadow-xs'
                        : 'border-[#E5E5DF] bg-white hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#1A1A18]">
                        {tpl.title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-[#F0EFEB] text-[#5A5A40] text-[9px] font-bold uppercase">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A7A72] line-clamp-2">
                      {tpl.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Template Editor & Simulator */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#E5E5DF] shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5DF]">
                <div>
                  <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                    Éditeur de modèle : {activeEditingTemplate?.title}
                  </h3>
                  <p className="text-xs text-[#7A7A72]">
                    Personnalisez le texte envoyé automatiquement ou manuellement à vos clients
                  </p>
                </div>

                <button
                  onClick={handleSaveTemplate}
                  disabled={!isTemplateModified}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    isTemplateModified
                      ? 'bg-[#5A5A40] text-white hover:bg-[#484832] cursor-pointer'
                      : 'bg-[#F0EFEB] text-[#9A9A92] cursor-not-allowed'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer</span>
                </button>
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A5A50] mb-1">
                    Titre du modèle
                  </label>
                  <input
                    type="text"
                    value={editingTemplateTitle}
                    onChange={(e) => {
                      setEditingTemplateTitle(e.target.value);
                      setIsTemplateModified(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#25D366] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A5A50] mb-1">
                    Description du cas d'usage
                  </label>
                  <input
                    type="text"
                    value={editingTemplateDescription}
                    onChange={(e) => {
                      setEditingTemplateDescription(e.target.value);
                      setIsTemplateModified(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#25D366] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Variables Chips (1-click insert) */}
              <div>
                <label className="block text-xs font-semibold text-[#5A5A50] mb-1.5 flex items-center justify-between">
                  <span>Variables insérables (cliquez pour insérer)</span>
                  <span className="text-[11px] text-[#25D366] font-bold">Remplacées automatiquement</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF]">
                  {activeEditingTemplate?.variables.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => handleInsertVariable(variable)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E5DF] hover:border-[#25D366] hover:text-[#25D366] text-[#2D2D2A] text-xs font-mono font-medium transition-colors cursor-pointer"
                    >
                      + {variable}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea Editor */}
              <div>
                <label className="block text-xs font-semibold text-[#5A5A50] mb-1">
                  Corps du message
                </label>
                <textarea
                  rows={9}
                  value={editingTemplateText}
                  onChange={(e) => {
                    setEditingTemplateText(e.target.value);
                    setIsTemplateModified(true);
                  }}
                  className="w-full p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] focus:outline-hidden font-sans leading-relaxed"
                />
              </div>

              {/* WhatsApp Formatting Preview simulator */}
              <div className="p-4 rounded-2xl bg-[#25D366]/5 border border-[#25D366]/20">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#1E7E34]">
                  <MessageSquare className="w-4 h-4" />
                  <span>Aperçu du rendu WhatsApp</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#25D366]/20 text-xs text-[#1A1A18] whitespace-pre-wrap leading-relaxed shadow-xs font-sans">
                  {editingTemplateText}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: PARAMÈTRES WHATSAPP & AUTOMATISATIONS */}
      {subTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E5E5DF] shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                Configuration WhatsApp & Numéro Officiel
              </h3>
              <p className="text-xs text-[#7A7A72]">
                Configurez le comportement du connecteur WhatsApp pour votre agence
              </p>
            </div>

            {/* Toggle WhatsApp Enabled */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#1EBE5D] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A1A18]">
                    Activer les envois WhatsApp
                  </h4>
                  <p className="text-xs text-[#7A7A72]">
                    Permet d'ouvrir WhatsApp Web et l'application mobile en 1 clic pour chaque document
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.whatsappEnabled}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, whatsappEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E5E5DF] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D5D5CF] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
              </label>
            </div>

            {/* Country code and phone settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A5A50] mb-1">
                  Indicatif international par défaut
                </label>
                <select
                  value={settingsForm.defaultCountryCode}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, defaultCountryCode: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#25D366] focus:outline-hidden"
                >
                  <option value="+33">+33 (France / Monaco)</option>
                  <option value="+225">+225 (Côte d'Ivoire)</option>
                  <option value="+221">+221 (Sénégal)</option>
                  <option value="+212">+212 (Maroc)</option>
                  <option value="+216">+216 (Tunisie)</option>
                  <option value="+213">+213 (Algérie)</option>
                  <option value="+32">+32 (Belgique)</option>
                  <option value="+41">+41 (Suisse)</option>
                  <option value="+1">+1 (Canada / USA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A5A50] mb-1">
                  Numéro WhatsApp de l'agence (Support)
                </label>
                <input
                  type="text"
                  value={settingsForm.agencyWhatsAppNumber}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, agencyWhatsAppNumber: e.target.value })
                  }
                  placeholder="Ex: +33 6 12 34 56 78"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#25D366] focus:outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          {/* Automations Section */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5E5DF] shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#8C6D1F]" />
                Automatisations des Communications
              </h3>
              <p className="text-xs text-[#7A7A72]">
                Configurez les envois déclenchés automatiquement après chaque opération
              </p>
            </div>

            <div className="space-y-3">
              {/* After Sale */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF]">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A1A18]">
                    Après une vente : Confirmation & Facture
                  </h4>
                  <p className="text-[11px] text-[#7A7A72]">
                    Prépare automatiquement l'envoi de la facture et du récapitulatif client
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.autoSendSaleInvoice}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, autoSendSaleInvoice: e.target.checked })
                  }
                  className="w-4 h-4 text-[#25D366] rounded-md focus:ring-[#25D366]"
                />
              </div>

              {/* After Rental */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF]">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A1A18]">
                    Après une location : Contrat & Confirmation
                  </h4>
                  <p className="text-[11px] text-[#7A7A72]">
                    Prépare le contrat de location et les détails de caution pour le locataire
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.autoSendRentalContract}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, autoSendRentalContract: e.target.checked })
                  }
                  className="w-4 h-4 text-[#25D366] rounded-md focus:ring-[#25D366]"
                />
              </div>

              {/* After Payment */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF]">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A1A18]">
                    Après un paiement : Reçu de versement
                  </h4>
                  <p className="text-[11px] text-[#7A7A72]">
                    Accusé de réception officiel pour chaque encaissement client
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.autoSendPaymentReceipt}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, autoSendPaymentReceipt: e.target.checked })
                  }
                  className="w-4 h-4 text-[#25D366] rounded-md focus:ring-[#25D366]"
                />
              </div>

              {/* Before Return */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF]">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A1A18]">
                    Avant un retour véhicule : Notification de rappel
                  </h4>
                  <p className="text-[11px] text-[#7A7A72]">
                    Rappelle au locataire l'heure et le lieu de restitution avant échéance
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={settingsForm.returnReminderHoursBefore}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        returnReminderHoursBefore: parseInt(e.target.value, 10),
                      })
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A]"
                  >
                    <option value={12}>12 heures avant</option>
                    <option value={24}>24 heures avant</option>
                    <option value={48}>48 heures avant</option>
                  </select>

                  <input
                    type="checkbox"
                    checked={settingsForm.autoSendReturnReminder}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        autoSendReturnReminder: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#25D366] rounded-md focus:ring-[#25D366]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Channels Section */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5E5DF] shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                Canaux d'alertes & Notifications
              </h3>
              <p className="text-xs text-[#7A7A72]">
                Choisissez où recevoir les alertes internes du CRM
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-[#5A5A40]" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1A1A18]">
                    Notifications internes CRM
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.internalNotifications}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, internalNotifications: e.target.checked })
                  }
                  className="w-4 h-4 text-[#5A5A40] rounded-md focus:ring-[#5A5A40]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#0078D4]" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1A1A18]">
                    Notifications par Email
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.emailNotifications}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, emailNotifications: e.target.checked })
                  }
                  className="w-4 h-4 text-[#0078D4] rounded-md focus:ring-[#0078D4]"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#5A5A40] hover:bg-[#484832] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer tous les paramètres WhatsApp</span>
            </button>
          </div>
        </form>
      )}

      {/* Global Quick Send WhatsApp Modal */}
      <SendWhatsAppModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
      />

      {/* Message Detail View Modal */}
      {selectedMessageForDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E5E5DF] overflow-hidden">
            <div className="px-6 py-4 bg-[#25D366]/10 border-b border-[#25D366]/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-[#25D366] fill-current" />
                <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                  Détail du message WhatsApp
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessageForDetail(null)}
                className="p-1.5 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF]">
                <div>
                  <span className="text-[11px] text-[#7A7A72]">Destinataire :</span>
                  <div className="font-bold text-[#1A1A18]">{selectedMessageForDetail.clientName}</div>
                </div>
                <div>
                  <span className="text-[11px] text-[#7A7A72]">Numéro WhatsApp :</span>
                  <div className="font-mono text-[#5A5A40] font-semibold">{selectedMessageForDetail.clientPhone}</div>
                </div>
                <div>
                  <span className="text-[11px] text-[#7A7A72]">Date d'envoi :</span>
                  <div className="text-[#1A1A18]">{new Date(selectedMessageForDetail.timestamp).toLocaleString('fr-FR')}</div>
                </div>
                <div>
                  <span className="text-[11px] text-[#7A7A72]">Catégorie :</span>
                  <div className="capitalize font-medium text-[#1A1A18]">{selectedMessageForDetail.messageCategory}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A5A50] mb-1.5">
                  Contenu intégral du message
                </label>
                <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] whitespace-pre-wrap leading-relaxed text-[#1A1A18] font-sans text-xs sm:text-sm">
                  {selectedMessageForDetail.content}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#FAFAF8] border-t border-[#E5E5DF] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedMessageForDetail.content);
                  addToast({ title: 'Message copié', type: 'info' });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E5DF] text-xs font-semibold text-[#5A5A40] hover:bg-[#F0EFEB] cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copier le texte</span>
              </button>

              <button
                onClick={() => {
                  resendWhatsAppMessage(selectedMessageForDetail.id);
                  setSelectedMessageForDetail(null);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Renvoyer sur WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
