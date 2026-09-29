import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Prospect, ProspectFollowUpType, ProspectStatus } from '../../types';
import {
  X,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Clock,
  Car,
  DollarSign,
  UserCheck,
  BellRing,
  Plus,
  CheckCircle2,
  Trash2,
  Edit,
  BadgePercent,
  KeyRound,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface ProspectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: Prospect | null;
  onEdit: (prospect: Prospect) => void;
  onConvertToSale?: (prospect: Prospect) => void;
  onConvertToRental?: (prospect: Prospect) => void;
}

export const ProspectDetailModal: React.FC<ProspectDetailModalProps> = ({
  isOpen,
  onClose,
  prospect,
  onEdit,
  onConvertToSale,
  onConvertToRental,
}) => {
  const {
    updateProspect,
    deleteProspect,
    addProspectFollowUp,
    addProspectReminder,
    completeProspectReminder,
    convertProspectToClient,
    clients,
    sales,
    rentals,
    settings,
  } = useCrm();

  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'reminders' | 'details'>('timeline');

  // New follow-up log state
  const [newFollowUpType, setNewFollowUpType] = useState<ProspectFollowUpType>('Appel');
  const [newFollowUpTitle, setNewFollowUpTitle] = useState('');
  const [newFollowUpNotes, setNewFollowUpNotes] = useState('');

  // New reminder state
  const [showAddReminderForm, setShowAddReminderForm] = useState(false);
  const [reminderDate, setReminderDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [reminderTime, setReminderTime] = useState('10:00');
  const [reminderReason, setReminderReason] = useState('Relance téléphonique de suivi');
  const [reminderNotes, setReminderNotes] = useState('');

  if (!isOpen || !prospect) return null;

  const linkedClient = prospect.convertedToClientId
    ? clients.find((c) => c.id === prospect.convertedToClientId)
    : null;

  const linkedSale = prospect.convertedToSaleId
    ? sales.find((s) => s.id === prospect.convertedToSaleId)
    : null;

  const linkedRental = prospect.convertedToRentalId
    ? rentals.find((r) => r.id === prospect.convertedToRentalId)
    : null;

  const handleStatusChange = (newStatus: ProspectStatus) => {
    updateProspect(prospect.id, { status: newStatus });
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowUpTitle.trim()) return;

    addProspectFollowUp(prospect.id, {
      type: newFollowUpType,
      title: newFollowUpTitle.trim(),
      notes: newFollowUpNotes.trim() || undefined,
    });

    setNewFollowUpTitle('');
    setNewFollowUpNotes('');
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderDate || !reminderReason.trim()) return;

    addProspectReminder(prospect.id, {
      date: reminderDate,
      time: reminderTime,
      reason: reminderReason.trim(),
      notes: reminderNotes.trim() || undefined,
    });

    setShowAddReminderForm(false);
    setReminderNotes('');
  };

  const handleConvertClient = () => {
    convertProspectToClient(prospect.id);
  };

  const cleanPhoneForWhatsApp = (num: string) => {
    let clean = num.replace(/\D/g, '');
    if (clean.startsWith('0') && clean.length === 10) {
      clean = '33' + clean.slice(1);
    }
    return clean;
  };

  const whatsappLink = prospect.whatsapp || prospect.phone
    ? `https://wa.me/${cleanPhoneForWhatsApp(prospect.whatsapp || prospect.phone)}?text=${encodeURIComponent(
        `Bonjour ${prospect.name}, je fais suite à votre demande concernant ${prospect.searchedVehicle || 'un véhicule'} chez ${settings.agencyName || 'Sirius Auto'}.`
      )}`
    : null;

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

  const getNeedBadge = (type: string) => {
    switch (type) {
      case 'Achat':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Location':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div
      id="prospect_detail_modal_overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="prospect_detail_modal_container"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                {prospect.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                    {prospect.prospectNumber}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getNeedBadge(prospect.needType)}`}>
                    {prospect.needType}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(prospect.status)}`}>
                    {prospect.status}
                  </span>
                  {prospect.convertedToClientId && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 font-semibold">
                      <UserCheck className="w-3 h-3" /> Client Converti
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {prospect.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Créé le {new Date(prospect.createdAt).toLocaleDateString('fr-FR')} • Dernière activité le {prospect.lastContactDate ? new Date(prospect.lastContactDate).toLocaleDateString('fr-FR') : 'Non renseigné'}
                </p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {whatsappLink && (
                <a
                  id="prospect_whatsapp_quick_btn"
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  title="Ouvrir discussion WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}
              {prospect.phone && (
                <a
                  id="prospect_call_quick_btn"
                  href={`tel:${prospect.phone}`}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Appeler"
                >
                  <Phone className="w-4 h-4" />
                  <span>Appeler</span>
                </a>
              )}
              {!prospect.convertedToClientId ? (
                <button
                  id="prospect_convert_client_btn"
                  onClick={handleConvertClient}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  title="Transformer en client dans Sirius Auto CRM"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Convertir en Client</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  {onConvertToSale && (
                    <button
                      id="prospect_convert_sale_btn"
                      onClick={() => onConvertToSale(prospect)}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <BadgePercent className="w-3.5 h-3.5" />
                      <span>Vente</span>
                    </button>
                  )}
                  {onConvertToRental && (
                    <button
                      id="prospect_convert_rental_btn"
                      onClick={() => onConvertToRental(prospect)}
                      className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Location</span>
                    </button>
                  )}
                </div>
              )}
              <button
                id="prospect_edit_btn"
                onClick={() => {
                  onClose();
                  onEdit(prospect);
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Modifier la fiche"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                id="prospect_delete_btn"
                onClick={() => {
                  if (confirm(`Êtes-vous sûr de vouloir supprimer le prospect ${prospect.name} ?`)) {
                    deleteProspect(prospect.id);
                    onClose();
                  }
                }}
                className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600"
                title="Supprimer le prospect"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                id="close_prospect_detail_btn"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Stage Status Changer */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Étape du pipeline :</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {(['Nouveau', 'En discussion', 'Intéressé', 'Gagné', 'Perdu'] as ProspectStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    prospect.status === st
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'timeline'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Historique & Échanges ({prospect.followUps?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('reminders')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'reminders'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>
              Relances & Rappels (
              {prospect.reminders?.filter((r) => r.status === 'À faire').length || 0}
              )
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('details')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'details'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Détails & Véhicule</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: TIMELINE & INTERACTION LOGGER */}
          {activeSubTab === 'timeline' && (
            <div className="space-y-6">
              {/* Add Interaction Fast Form */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Enregistrer une interaction</span>
                </h3>
                <form onSubmit={handleAddFollowUp} className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {(['Appel', 'WhatsApp', 'Rendez-vous', 'Note'] as ProspectFollowUpType[]).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setNewFollowUpType(type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          newFollowUpType === type
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder={`Titre / Résumé (ex: Appel pour essai routier)`}
                      value={newFollowUpTitle}
                      onChange={(e) => setNewFollowUpTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Commentaires / Réaction du prospect..."
                      value={newFollowUpNotes}
                      onChange={(e) => setNewFollowUpNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ajouter au journal</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Timeline Items List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Fil chronologique des activités
                </h3>

                {(!prospect.followUps || prospect.followUps.length === 0) ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Aucune interaction consignée pour l'instant.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
                    {prospect.followUps.map((item) => (
                      <div key={item.id} className="relative group">
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600" />
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {item.title}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                                {item.type}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              {new Date(item.date).toLocaleDateString('fr-FR')} à {item.time}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REMINDERS & RELANCES */}
          {activeSubTab === 'reminders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Gestion des relances commerciales
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ne manquez aucune opportunité de closing grâce aux rappels programmés.
                  </p>
                </div>
                {!showAddReminderForm && (
                  <button
                    onClick={() => setShowAddReminderForm(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Planifier une relance</span>
                  </button>
                )}
              </div>

              {/* Add reminder box */}
              {showAddReminderForm && (
                <form
                  onSubmit={handleAddReminder}
                  className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-4 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <BellRing className="w-4 h-4 text-amber-600" />
                      <span>Programmer un rappel</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddReminderForm(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Annuler
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 dark:text-amber-200 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 dark:text-amber-200 mb-1">
                        Heure
                      </label>
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 dark:text-amber-200 mb-1">
                        Motif de relance
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: Rappel offre tarifaire"
                        value={reminderReason}
                        onChange={(e) => setReminderReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      Notes complémentaires (Optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Proposer -5% sur l'acompte si validation ce jour"
                      value={reminderNotes}
                      onChange={(e) => setReminderNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm"
                    >
                      Enregistrer le rappel
                    </button>
                  </div>
                </form>
              )}

              {/* Reminders List */}
              <div className="space-y-3">
                {(!prospect.reminders || prospect.reminders.length === 0) ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <BellRing className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Aucune relance programmée.</p>
                  </div>
                ) : (
                  prospect.reminders.map((rem) => {
                    const isPending = rem.status === 'À faire';
                    const isOverdue = isPending && rem.date < todayStr;
                    const isToday = isPending && rem.date === todayStr;

                    return (
                      <div
                        key={rem.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          !isPending
                            ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                            : isOverdue
                            ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                            : isToday
                            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {rem.reason}
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
                                Effectuée
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(rem.date).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {rem.time || '10:00'}
                            </span>
                          </p>
                          {rem.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                              "{rem.notes}"
                            </p>
                          )}
                        </div>

                        {isPending && (
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {whatsappLink && (
                              <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Relancer
                              </a>
                            )}
                            <button
                              onClick={() => completeProspectReminder(prospect.id, rem.id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Terminé
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

          {/* TAB 3: DETAILS & CONVERSION */}
          {activeSubTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Info Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Coordonnées & Canaux
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">Téléphone direct</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{prospect.phone}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">Numéro WhatsApp</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{prospect.whatsapp || prospect.phone}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">Email</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{prospect.email || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Source / Canal</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Saisie Commerciale Directe</span>
                  </div>
                </div>
              </div>

              {/* Search Criteria Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Critères de recherche
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">Type de besoin</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{prospect.needType}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">Modèle recherché</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{prospect.searchedVehicle || 'Non spécifié'}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">Budget prévisionnel</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {prospect.budget ? `${prospect.budget.toLocaleString('fr-FR')} ${settings.currencySymbol}` : 'Non spécifié'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Échéance souhaitée</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {prospect.expectedDate ? new Date(prospect.expectedDate).toLocaleDateString('fr-FR') : 'Immédiat / Dès que possible'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conversion & Links Status */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  Lien avec l'exploitation Sirius Auto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-900/60">
                    <span className="text-slate-500 block mb-1">Fiche Client</span>
                    {linkedClient ? (
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {linkedClient.firstName} {linkedClient.lastName}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Non converti</span>
                    )}
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-900/60">
                    <span className="text-slate-500 block mb-1">Vente Conclue</span>
                    {linkedSale ? (
                      <span className="font-bold text-indigo-600 flex items-center gap-1">
                        <BadgePercent className="w-3.5 h-3.5" />
                        {linkedSale.saleNumber} ({linkedSale.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol})
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Aucune vente liée</span>
                    )}
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-900/60">
                    <span className="text-slate-500 block mb-1">Contrat de Location</span>
                    {linkedRental ? (
                      <span className="font-bold text-teal-600 flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5" />
                        {linkedRental.rentalNumber}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Aucune location liée</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
