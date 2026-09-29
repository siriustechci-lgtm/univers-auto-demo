import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Prospect, ProspectNeedType, ProspectStatus } from '../../types';
import {
  X,
  UserPlus,
  Phone,
  MessageSquare,
  Mail,
  Car,
  DollarSign,
  Calendar,
  Clock,
  BellRing,
  FileText,
  CheckCircle2,
} from 'lucide-react';

interface ProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospectToEdit?: Prospect | null;
}

export const ProspectModal: React.FC<ProspectModalProps> = ({
  isOpen,
  onClose,
  prospectToEdit,
}) => {
  const { addProspect, updateProspect, vehicles, settings } = useCrm();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [needType, setNeedType] = useState<ProspectNeedType>('Achat');
  const [searchedVehicle, setSearchedVehicle] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [expectedDate, setExpectedDate] = useState('');
  const [status, setStatus] = useState<ProspectStatus>('Nouveau');
  const [notes, setNotes] = useState('');

  // Initial reminder fields (for ultra-fast creation)
  const [enableInitialReminder, setEnableInitialReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('10:00');
  const [reminderReason, setReminderReason] = useState('Premier rappel commercial');

  // Sync state on open or edit
  useEffect(() => {
    if (prospectToEdit) {
      setName(prospectToEdit.name || '');
      setPhone(prospectToEdit.phone || '');
      setWhatsapp(prospectToEdit.whatsapp || '');
      setEmail(prospectToEdit.email || '');
      setNeedType(prospectToEdit.needType || 'Achat');
      setSearchedVehicle(prospectToEdit.searchedVehicle || '');
      setBudget(prospectToEdit.budget ? String(prospectToEdit.budget) : '');
      setExpectedDate(prospectToEdit.expectedDate || '');
      setStatus(prospectToEdit.status || 'Nouveau');
      setNotes(prospectToEdit.notes || '');
      setEnableInitialReminder(false);
    } else {
      setName('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setNeedType('Achat');
      setSearchedVehicle('');
      setBudget('');
      setExpectedDate('');
      setStatus('Nouveau');
      setNotes('');
      // Default initial reminder tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setReminderDate(tomorrow.toISOString().split('T')[0]);
      setReminderTime('10:00');
      setReminderReason('Premier rappel pour proposition de véhicule');
      setEnableInitialReminder(false);
    }
  }, [prospectToEdit, isOpen]);

  // Auto-sync whatsapp with phone if whatsapp is empty
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (!whatsapp || whatsapp === phone) {
      setWhatsapp(val);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      return;
    }

    if (prospectToEdit) {
      updateProspect(prospectToEdit.id, {
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim() || undefined,
        needType,
        searchedVehicle: searchedVehicle.trim() || undefined,
        budget: budget ? parseFloat(budget) : undefined,
        expectedDate: expectedDate || undefined,
        status,
        notes: notes.trim() || undefined,
      });
    } else {
      addProspect({
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim() || undefined,
        needType,
        searchedVehicle: searchedVehicle.trim() || undefined,
        budget: budget ? parseFloat(budget) : undefined,
        expectedDate: expectedDate || undefined,
        status,
        notes: notes.trim() || undefined,
        initialReminderDate: enableInitialReminder ? reminderDate : undefined,
        initialReminderTime: enableInitialReminder ? reminderTime : undefined,
        initialReminderReason: enableInitialReminder ? reminderReason : undefined,
      });
    }

    onClose();
  };

  return (
    <div
      id="prospect_modal_overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="prospect_modal_container"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {prospectToEdit ? 'Modifier la fiche prospect' : 'Nouveau prospect'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {prospectToEdit
                  ? `Fiche N° ${prospectToEdit.prospectNumber}`
                  : 'Saisie rapide en moins de 30 secondes'}
              </p>
            </div>
          </div>
          <button
            id="close_prospect_modal_btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Section 1: Contact Principal */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 block">
              1. Coordonnées du contact
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nom & Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  id="prospect_input_name"
                  type="text"
                  required
                  placeholder="ex: Karim Benali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Téléphone <span className="text-red-500">*</span></span>
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <input
                  id="prospect_input_phone"
                  type="tel"
                  required
                  placeholder="ex: 06 12 34 56 78"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>WhatsApp</span>
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                </label>
                <input
                  id="prospect_input_whatsapp"
                  type="tel"
                  placeholder="ex: +212 6 12 34 56 78"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Email (Optionnel)</span>
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <input
                  id="prospect_input_email"
                  type="email"
                  placeholder="ex: karim@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Projet & Recherche */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 block">
              2. Projet & Véhicule recherché
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Type de besoin <span className="text-red-500">*</span>
                </label>
                <select
                  id="prospect_select_need_type"
                  value={needType}
                  onChange={(e) => setNeedType(e.target.value as ProspectNeedType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="Achat">Achat de véhicule</option>
                  <option value="Location">Location de véhicule</option>
                  <option value="Information">Demande d'information</option>
                  <option value="Autre">Autre demande</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Modèle recherché</span>
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <input
                  id="prospect_input_vehicle"
                  type="text"
                  list="available-fleet-list"
                  placeholder="ex: Peugeot 208, SUV, Clio"
                  value={searchedVehicle}
                  onChange={(e) => setSearchedVehicle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <datalist id="available-fleet-list">
                  {vehicles.map((v) => (
                    <option key={v.id} value={`${v.make} ${v.model} (${v.year || ''})`}>
                      {v.make} {v.model} - {v.status}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Budget ({settings.currencySymbol})</span>
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <input
                  id="prospect_input_budget"
                  type="number"
                  placeholder="ex: 15000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Date de besoin prévue</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <input
                  id="prospect_input_expected_date"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Statut commercial
                </label>
                <select
                  id="prospect_select_status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProspectStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="Nouveau">Nouveau</option>
                  <option value="En discussion">En discussion</option>
                  <option value="Intéressé">Intéressé</option>
                  <option value="Gagné">Gagné (Conclu)</option>
                  <option value="Perdu">Perdu</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Commentaires / Précisions</span>
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <textarea
                id="prospect_input_notes"
                rows={2}
                placeholder="ex: Cherche automatique, diesel, prêt à verser un acompte sous 48h..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>
          </div>

          {/* Section 3: Programmation de la première relance (Nouveau uniquement) */}
          {!prospectToEdit && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-amber-500" />
                  <label htmlFor="enable_reminder_chk" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    Programmer une première relance automatique
                  </label>
                </div>
                <input
                  id="enable_reminder_chk"
                  type="checkbox"
                  checked={enableInitialReminder}
                  onChange={(e) => setEnableInitialReminder(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                />
              </div>

              {enableInitialReminder && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      Date de relance
                    </label>
                    <input
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      Heure
                    </label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      Motif
                    </label>
                    <input
                      type="text"
                      value={reminderReason}
                      onChange={(e) => setReminderReason(e.target.value)}
                      placeholder="ex: Rappel devis"
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              id="cancel_prospect_btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              id="save_prospect_btn"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              {prospectToEdit ? 'Enregistrer les modifications' : 'Créer le prospect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
