import React, { useState } from 'react';
import {
  X,
  Calendar,
  Car,
  User,
  DollarSign,
  FileText,
  Plus,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { ReservationStatus, PaymentMethod } from '../../types';

interface AddReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicleId?: string;
  initialClientId?: string;
}

export const AddReservationModal: React.FC<AddReservationModalProps> = ({
  isOpen,
  onClose,
  initialVehicleId,
  initialClientId,
}) => {
  const { vehicles, clients, addClient, addReservation, settings } = useCrm();

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Vehicle selection
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialVehicleId || '');
  const [vehicleSearch, setVehicleSearch] = useState<string>('');

  // Client mode: 'existing' or 'new'
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId || '');
  const [clientSearch, setClientSearch] = useState<string>('');

  // New Client quick fields
  const [newClientType, setNewClientType] = useState<'particulier' | 'entreprise'>('particulier');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Reservation details
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<PaymentMethod | string>('Espèces');
  const [status, setStatus] = useState<ReservationStatus>('Réservée');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Filter available vehicles (or the currently selected vehicle if pre-selected)
  const availableVehicles = vehicles.filter(
    (v) => v.status === 'Disponible' || v.id === initialVehicleId
  );

  const filteredVehicles = availableVehicles.filter((v) => {
    const q = vehicleSearch.toLowerCase();
    return (
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.registration.toLowerCase().includes(q)
    );
  });

  const filteredClients = clients.filter((c) => {
    const q = clientSearch.toLowerCase();
    const name = `${c.firstName} ${c.lastName} ${c.companyName || ''}`.toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Calculate duration
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffTime = endD.getTime() - startD.getTime();
  const durationDays = isNaN(diffTime) ? 1 : Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedVehicleId) {
      setErrorMsg('Veuillez sélectionner un véhicule disponible.');
      return;
    }

    let finalClientId = selectedClientId;

    if (clientMode === 'new') {
      if (newClientType === 'particulier') {
        if (!newFirstName.trim() || !newLastName.trim()) {
          setErrorMsg('Veuillez renseigner le nom et prénom du client.');
          return;
        }
      } else {
        if (!newCompanyName.trim()) {
          setErrorMsg("Veuillez renseigner le nom de l'entreprise.");
          return;
        }
      }

      if (!newPhone.trim()) {
        setErrorMsg('Veuillez renseigner le numéro de téléphone.');
        return;
      }

      // Create client quickly
      const created = addClient({
        type: newClientType,
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        companyName: newCompanyName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim() || undefined,
        address: '',
        notes: 'Client créé lors de la réservation rapide',
      });
      finalClientId = created.id;
    } else {
      if (!finalClientId) {
        setErrorMsg('Veuillez sélectionner un client existant.');
        return;
      }
    }

    if (!startDate || !endDate) {
      setErrorMsg('Veuillez définir les dates de début et de fin.');
      return;
    }

    if (endDate < startDate) {
      setErrorMsg('La date de fin doit être postérieure ou égale à la date de début.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = addReservation({
        vehicleId: selectedVehicleId,
        clientId: finalClientId,
        startDate,
        endDate,
        depositAmount: Number(depositAmount) || 0,
        depositPaymentMethod: Number(depositAmount) > 0 ? depositPaymentMethod : undefined,
        status,
        notes: notes.trim() || undefined,
      });

      if (res) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-reservation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="add-reservation-modal-container"
        className="w-full max-w-2xl bg-white rounded-3xl border border-[#E5E5DF] shadow-xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EC] bg-[#FAFAF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4A6B82]/10 border border-[#4A6B82]/20 flex items-center justify-center text-[#4A6B82]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A18] font-['Outfit']">
                Nouvelle réservation de véhicule
              </h2>
              <p className="text-xs text-[#7A7A72]">
                Bloquez un véhicule pour un client en moins d'une minute
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-add-reservation-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#E5E5DF]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#B84030]/10 border border-[#B84030]/20 flex items-center gap-2 text-xs text-[#B84030]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* STEP 1: VEHICLE SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#1A1A18] uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#4A6B82]" />
                1. Sélection du véhicule <span className="text-[#B84030]">*</span>
              </label>
              <span className="text-[11px] text-[#4A7A4A] bg-[#4A7A4A]/10 px-2 py-0.5 rounded-full font-medium">
                {availableVehicles.length} disponible(s)
              </span>
            </div>

            {availableVehicles.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#B87320]/10 border border-[#B87320]/20 text-xs text-[#B87320]">
                Aucun véhicule disponible en stock actuellement. Tous les véhicules sont loués,
                réservés ou vendus.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A72]" />
                  <input
                    type="text"
                    placeholder="Filtrer un véhicule par marque, modèle, immatriculation..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:outline-hidden focus:border-[#4A6B82]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border border-[#F0F0EC] rounded-xl bg-[#FAFAF7]">
                  {filteredVehicles.map((v) => {
                    const isSelected = selectedVehicleId === v.id;
                    return (
                      <div
                        key={v.id}
                        id={`select-vehicle-${v.id}`}
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white border-[#4A6B82] shadow-xs ring-1 ring-[#4A6B82]'
                            : 'bg-white border-[#E5E5DF] hover:border-[#4A6B82]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#1A1A18] truncate">
                            {v.make} {v.model}
                          </span>
                          <span className="text-[10px] font-semibold text-[#4A7A4A] bg-[#4A7A4A]/10 px-1.5 py-0.5 rounded">
                            Dispo
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#7A7A72] mt-1">
                          <span className="font-mono">{v.registration}</span>
                          <span>{v.dailyRate} {settings.currencySymbol}/j</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: CLIENT SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#1A1A18] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#4A6B82]" />
                2. Client <span className="text-[#B84030]">*</span>
              </label>
              {/* Mode switcher tabs */}
              <div className="inline-flex p-0.5 rounded-lg bg-[#E5E5DF]/60 text-xs">
                <button
                  type="button"
                  id="tab-client-existing"
                  onClick={() => setClientMode('existing')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    clientMode === 'existing'
                      ? 'bg-white text-[#1A1A18] shadow-xs'
                      : 'text-[#7A7A72] hover:text-[#1A1A18]'
                  }`}
                >
                  Client existant
                </button>
                <button
                  type="button"
                  id="tab-client-new"
                  onClick={() => setClientMode('new')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    clientMode === 'new'
                      ? 'bg-white text-[#1A1A18] shadow-xs'
                      : 'text-[#7A7A72] hover:text-[#1A1A18]'
                  }`}
                >
                  + Nouveau client
                </button>
              </div>
            </div>

            {clientMode === 'existing' ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A72]" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, entreprise ou téléphone..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:outline-hidden focus:border-[#4A6B82]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1 border border-[#F0F0EC] rounded-xl bg-[#FAFAF7]">
                  {filteredClients.length === 0 ? (
                    <div className="col-span-2 p-3 text-center text-xs text-[#7A7A72]">
                      Aucun client trouvé.{' '}
                      <button
                        type="button"
                        onClick={() => setClientMode('new')}
                        className="text-[#4A6B82] font-semibold underline"
                      >
                        Créer une fiche rapide
                      </button>
                    </div>
                  ) : (
                    filteredClients.map((c) => {
                      const isSelected = selectedClientId === c.id;
                      const displayName =
                        c.type === 'entreprise' && c.companyName
                          ? c.companyName
                          : `${c.firstName} ${c.lastName}`;
                      return (
                        <div
                          key={c.id}
                          id={`select-client-${c.id}`}
                          onClick={() => setSelectedClientId(c.id)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-white border-[#4A6B82] shadow-xs ring-1 ring-[#4A6B82]'
                              : 'bg-white border-[#E5E5DF] hover:border-[#4A6B82]/50'
                          }`}
                        >
                          <div className="font-bold text-xs text-[#1A1A18] truncate">{displayName}</div>
                          <div className="text-[11px] text-[#7A7A72] truncate">
                            {c.phone || 'Sans tél.'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-[#E5E5DF] bg-[#FAFAF7] space-y-3">
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={newClientType === 'particulier'}
                      onChange={() => setNewClientType('particulier')}
                      className="text-[#4A6B82]"
                    />
                    <span>Particulier</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={newClientType === 'entreprise'}
                      onChange={() => setNewClientType('entreprise')}
                      className="text-[#4A6B82]"
                    />
                    <span>Entreprise / Société</span>
                  </label>
                </div>

                {newClientType === 'particulier' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Prénom *"
                        value={newFirstName}
                        onChange={(e) => setNewFirstName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Nom *"
                        value={newLastName}
                        onChange={(e) => setNewLastName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="Nom de l'entreprise *"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="tel"
                      placeholder="Téléphone / WhatsApp *"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email (optionnel)"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: DATES & STATUS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Début de réservation <span className="text-[#B84030]">*</span>
              </label>
              <input
                type="date"
                id="reservation-start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:outline-hidden focus:border-[#4A6B82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Fin de réservation <span className="text-[#B84030]">*</span>
              </label>
              <input
                type="date"
                id="reservation-end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:outline-hidden focus:border-[#4A6B82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Statut initial
              </label>
              <select
                id="reservation-initial-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ReservationStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:outline-hidden focus:border-[#4A6B82]"
              >
                <option value="Réservée">Réservée (En attente confirmation)</option>
                <option value="Confirmée">Confirmée (Garantie)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#7A7A72] bg-[#FAFAF7] p-2.5 rounded-xl border border-[#F0F0EC]">
            <Clock className="w-4 h-4 text-[#4A6B82]" />
            <span>
              Durée réservée : <strong className="text-[#1A1A18]">{durationDays} jour(s)</strong>
            </span>
          </div>

          {/* STEP 4: ACOMPTE (OPTIONNEL) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F0F0EC]">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Montant acompte ({settings.currencySymbol})
              </label>
              <input
                type="number"
                id="reservation-deposit-amount"
                placeholder="0"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:outline-hidden focus:border-[#4A6B82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Mode de règlement de l'acompte
              </label>
              <select
                id="reservation-deposit-method"
                value={depositPaymentMethod}
                onChange={(e) => setDepositPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:outline-hidden focus:border-[#4A6B82]"
              >
                <option value="Espèces">Espèces</option>
                <option value="Carte bancaire">Carte bancaire</option>
                <option value="Virement bancaire">Virement bancaire</option>
                <option value="Wave">Wave</option>
                <option value="Orange Money">Orange Money</option>
                <option value="Chèque">Chèque</option>
              </select>
            </div>
          </div>

          {/* STEP 5: NOTES */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
              Notes / Instructions particulières (optionnel)
            </label>
            <textarea
              rows={2}
              id="reservation-notes"
              placeholder="Ex: Client passe le matin, vérifier le contrôle technique avant..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:outline-hidden focus:border-[#4A6B82]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F0EC]">
            <button
              type="button"
              id="cancel-add-reservation-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#7A7A72] hover:text-[#1A1A18] rounded-xl hover:bg-[#E5E5DF]/50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              id="submit-add-reservation-btn"
              disabled={isSubmitting || availableVehicles.length === 0}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#4A6B82] hover:bg-[#3B5668] rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Confirmer la réservation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
