import React, { useState, useEffect } from 'react';
import { X, Calendar, Car, DollarSign, AlertCircle } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { Reservation, ReservationStatus, PaymentMethod } from '../../types';

interface EditReservationModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditReservationModal: React.FC<EditReservationModalProps> = ({
  reservation,
  isOpen,
  onClose,
}) => {
  const { vehicles, updateReservation, settings } = useCrm();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<PaymentMethod | string>('Espèces');
  const [status, setStatus] = useState<ReservationStatus>('Réservée');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (reservation) {
      setStartDate(reservation.startDate);
      setEndDate(reservation.endDate);
      setDepositAmount(reservation.depositAmount ? String(reservation.depositAmount) : '');
      setDepositPaymentMethod(reservation.depositPaymentMethod || 'Espèces');
      setStatus(reservation.status);
      setNotes(reservation.notes || '');
      setErrorMsg('');
    }
  }, [reservation]);

  if (!isOpen || !reservation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!startDate || !endDate) {
      setErrorMsg('Veuillez renseigner les dates de début et de fin.');
      return;
    }

    if (endDate < startDate) {
      setErrorMsg('La date de fin doit être postérieure à la date de début.');
      return;
    }

    updateReservation(reservation.id, {
      startDate,
      endDate,
      depositAmount: Number(depositAmount) || 0,
      depositPaymentMethod: Number(depositAmount) > 0 ? depositPaymentMethod : undefined,
      status,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div
      id="edit-reservation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="edit-reservation-modal-container"
        className="w-full max-w-lg bg-white rounded-3xl border border-[#E5E5DF] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EC] bg-[#FAFAF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4A6B82]/10 border border-[#4A6B82]/20 flex items-center justify-center text-[#4A6B82]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                Modifier la réservation {reservation.reservationNumber}
              </h2>
              <p className="text-xs text-[#7A7A72]">
                {reservation.clientName} • {reservation.vehicleName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#E5E5DF]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#B84030]/10 border border-[#B84030]/20 flex items-center gap-2 text-xs text-[#B84030]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Date de début <span className="text-[#B84030]">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Date de fin <span className="text-[#B84030]">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
              Statut de la réservation
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReservationStatus)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
            >
              <option value="Réservée">Réservée</option>
              <option value="Confirmée">Confirmée</option>
              <option value="Expirée">Expirée</option>
              <option value="Annulée">Annulée (Libère le véhicule)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Acompte ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Mode de paiement
              </label>
              <select
                value={depositPaymentMethod}
                onChange={(e) => setDepositPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
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

          <div>
            <label className="block text-xs font-semibold text-[#1A1A18] mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F0F0EC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#7A7A72] hover:bg-[#E5E5DF]/50 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#4A6B82] hover:bg-[#3B5668] rounded-xl shadow-sm"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
