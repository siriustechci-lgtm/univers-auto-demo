import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { Client, ClientType, ClientStatus } from '../types';
import {
  X,
  User,
  Building,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  IdCard,
  Award,
  CheckCircle2,
  FileText,
  Copy,
} from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
  onCreated?: (client: Client) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  clientToEdit,
  onCreated,
}) => {
  const { addClient, updateClient } = useCrm();

  const [type, setType] = useState<ClientType>('particulier');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [status, setStatus] = useState<ClientStatus>('Actif');

  // Complementary optional fields
  const [idCardNumber, setIdCardNumber] = useState('');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [drivingLicenseIssueDate, setDrivingLicenseIssueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setType(clientToEdit.type || 'particulier');
      setFirstName(clientToEdit.firstName || '');
      setLastName(clientToEdit.lastName || '');
      setCompanyName(clientToEdit.companyName || '');
      setPhone(clientToEdit.phone || '');
      setWhatsapp(clientToEdit.whatsapp || clientToEdit.phone || '');
      setSameAsPhone(
        !clientToEdit.whatsapp || clientToEdit.whatsapp === clientToEdit.phone
      );
      setEmail(clientToEdit.email || '');
      setAddress(clientToEdit.address || '');
      setCity(clientToEdit.city || '');
      setPostalCode(clientToEdit.postalCode || '');
      setStatus(clientToEdit.status || 'Actif');
      setIdCardNumber(clientToEdit.idCardNumber || '');
      setDrivingLicenseNumber(clientToEdit.drivingLicenseNumber || '');
      setDrivingLicenseIssueDate(clientToEdit.drivingLicenseIssueDate || '');
      setNotes(clientToEdit.notes || '');
    } else {
      setType('particulier');
      setFirstName('');
      setLastName('');
      setCompanyName('');
      setPhone('');
      setWhatsapp('');
      setSameAsPhone(true);
      setEmail('');
      setAddress('');
      setCity('');
      setPostalCode('');
      setStatus('Actif');
      setIdCardNumber('');
      setDrivingLicenseNumber('');
      setDrivingLicenseIssueDate('');
      setNotes('');
    }
  }, [clientToEdit, isOpen]);

  // Sync WhatsApp with Phone if sameAsPhone is true
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsapp(val);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'particulier' && (!firstName.trim() || !lastName.trim())) {
      return;
    }
    if (type === 'entreprise' && !companyName.trim()) {
      return;
    }
    if (!phone.trim() || !email.trim()) {
      return;
    }

    const payload = {
      type,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      companyName: type === 'entreprise' ? companyName.trim() : undefined,
      phone: phone.trim(),
      whatsapp: (sameAsPhone ? phone.trim() : whatsapp.trim()) || phone.trim(),
      email: email.trim(),
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      status,
      idCardNumber: idCardNumber.trim().toUpperCase() || undefined,
      drivingLicenseNumber: drivingLicenseNumber.trim().toUpperCase() || undefined,
      drivingLicenseIssueDate: drivingLicenseIssueDate || undefined,
      notes: notes.trim() || undefined,
    };

    if (clientToEdit) {
      updateClient(clientToEdit.id, payload);
    } else {
      const created = addClient(payload);
      if (onCreated) onCreated(created);
    }

    onClose();
  };

  return (
    <div
      id="client-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A18]/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="client-modal-dialog"
        className="w-full max-w-2xl rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 text-[#2D2D2A]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5DF] bg-[#F5F5F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                {clientToEdit ? 'Modifier la Fiche Client' : 'Nouveau Client'}
              </h2>
              <p className="text-xs text-[#7A7A72]">
                Création rapide des coordonnées et documents du client
              </p>
            </div>
          </div>
          <button
            id="client-modal-close"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EBEBE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto bg-white">
          {/* Type selector & Status toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5">
                Type de client
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="client-type-particulier"
                  onClick={() => setType('particulier')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    type === 'particulier'
                      ? 'border-[#5A5A40] bg-[#5A5A40]/10 text-[#5A5A40]'
                      : 'border-[#E5E5DF] bg-[#FAFAF8] text-[#7A7A72] hover:text-[#2D2D2A]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Particulier</span>
                </button>

                <button
                  type="button"
                  id="client-type-entreprise"
                  onClick={() => setType('entreprise')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    type === 'entreprise'
                      ? 'border-[#5A5A40] bg-[#5A5A40]/10 text-[#5A5A40]'
                      : 'border-[#E5E5DF] bg-[#FAFAF8] text-[#7A7A72] hover:text-[#2D2D2A]'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Entreprise</span>
                </button>
              </div>
            </div>

            {/* Status (Actif / Inactif) */}
            <div>
              <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5">
                Statut du compte
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="client-status-actif"
                  onClick={() => setStatus('Actif')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    status === 'Actif'
                      ? 'border-[#4A7A4A] bg-[#4A7A4A]/10 text-[#4A7A4A]'
                      : 'border-[#E5E5DF] bg-[#FAFAF8] text-[#7A7A72] hover:text-[#2D2D2A]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Actif</span>
                </button>

                <button
                  type="button"
                  id="client-status-inactif"
                  onClick={() => setStatus('Inactif')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    status === 'Inactif'
                      ? 'border-neutral-400 bg-neutral-100 text-neutral-700'
                      : 'border-[#E5E5DF] bg-[#FAFAF8] text-[#7A7A72] hover:text-[#2D2D2A]'
                  }`}
                >
                  <span>Inactif</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Informations Principales */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Informations Principales</span>
            </h3>

            {type === 'entreprise' && (
              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                  Raison Sociale / Nom Entreprise <span className="text-rose-500">*</span>
                </label>
                <input
                  id="client-company-input"
                  type="text"
                  required
                  placeholder="ex: SAS Transports Alpha"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                  Prénom {type === 'particulier' ? <span className="text-rose-500">*</span> : '(Contact)'}
                </label>
                <input
                  id="client-firstname-input"
                  type="text"
                  required={type === 'particulier'}
                  placeholder="ex: Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                  Nom de famille {type === 'particulier' ? <span className="text-rose-500">*</span> : '(Contact)'}
                </label>
                <input
                  id="client-lastname-input"
                  type="text"
                  required={type === 'particulier'}
                  placeholder="ex: Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1 flex items-center justify-between">
                  <span>Téléphone <span className="text-rose-500">*</span></span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9A9A92]" />
                  <input
                    id="client-phone-input"
                    type="tel"
                    required
                    placeholder="+33 6 12 34 56 78"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#2D2D2A]">
                    Numéro WhatsApp
                  </label>
                  <label className="text-[11px] text-[#5A5A40] flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        setSameAsPhone(e.target.checked);
                        if (e.target.checked) setWhatsapp(phone);
                      }}
                      className="rounded accent-[#5A5A40]"
                    />
                    <span>Identique</span>
                  </label>
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4A7A4A]" />
                  <input
                    id="client-whatsapp-input"
                    type="tel"
                    disabled={sameAsPhone}
                    placeholder="+33 6 12 34 56 78"
                    value={sameAsPhone ? phone : whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden ${
                      sameAsPhone ? 'bg-[#F5F5F0] border-[#E5E5DF] opacity-80' : 'bg-white border-[#E5E5DF]'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Email & Adresse */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                  Adresse Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9A9A92]" />
                  <input
                    id="client-email-input"
                    type="email"
                    required
                    placeholder="jean.dupont@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                  Adresse physique
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9A9A92]" />
                  <input
                    id="client-address-input"
                    type="text"
                    placeholder="12 rue de la Paix"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#7A7A72] mb-1">
                  Ville
                </label>
                <input
                  id="client-city-input"
                  type="text"
                  placeholder="Paris"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] focus:border-[#5A5A40] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#7A7A72] mb-1">
                  Code Postal
                </label>
                <input
                  id="client-postal-input"
                  type="text"
                  placeholder="75001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] focus:border-[#5A5A40] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Informations Complémentaires (Facultatives) */}
          <div className="space-y-3 pt-3 border-t border-[#E5E5DF]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                <span>2. Informations Complémentaires</span>
              </h3>
              <span className="text-[11px] text-[#7A7A72] italic">(Facultatif)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                  Numéro de pièce d'identité (CNI / Passeport)
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9A9A92]" />
                  <input
                    id="client-idcard-input"
                    type="text"
                    placeholder="ex: 190275100234"
                    value={idCardNumber}
                    onChange={(e) => setIdCardNumber(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs font-mono font-semibold uppercase text-[#5A5A40] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                  Numéro de permis de conduire
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9A9A92]" />
                  <input
                    id="client-license-input"
                    type="text"
                    placeholder="ex: 12AA34567"
                    value={drivingLicenseNumber}
                    onChange={(e) => setDrivingLicenseNumber(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs font-mono font-semibold uppercase text-[#5A5A40] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                Notes ou observations
              </label>
              <textarea
                id="client-notes-input"
                rows={2}
                placeholder="Préférences de véhicules, historique de contact, observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E5DF]">
            <button
              type="button"
              id="client-modal-cancel-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] text-xs font-semibold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              id="client-modal-submit-btn"
              className="px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
            >
              {clientToEdit ? 'Enregistrer les modifications' : 'Créer le client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
