import React, { useState } from 'react';
import { X, XCircle, AlertTriangle, Car, Calendar, User } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { Reservation } from '../../types';

interface CancelReservationModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelReservationModal: React.FC<CancelReservationModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { cancelReservation, settings } = useCrm();
  const [reason, setReason] = useState<string>('');

  if (!isOpen || !reservation) return null;

  const handleConfirm = () => {
    cancelReservation(reservation.id);
    onSuccess();
    onClose();
  };

  return (
    <div
      id="cancel-reservation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="cancel-reservation-modal-container"
        className="w-full max-w-md bg-white rounded-3xl border border-[#E5E5DF] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EC] bg-[#FAFAF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#B84030]/10 border border-[#B84030]/20 flex items-center justify-center text-[#B84030]">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                Annuler la réservation
              </h2>
              <p className="text-xs text-[#7A7A72]">{reservation.reservationNumber}</p>
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

        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#B84030]/5 border border-[#B84030]/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#B84030] shrink-0 mt-0.5" />
            <div className="text-xs text-[#1A1A18] space-y-1">
              <p className="font-semibold">Le véhicule sera immédiatement libéré</p>
              <p className="text-[#7A7A72]">
                Le statut du véhicule <strong>{reservation.vehicleName}</strong> (
                {reservation.vehicleRegistration}) sera remis sur « Disponible » et réinséré dans le
                parc locatif et commercial.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#F0F0EC] text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-[#7A7A72]">Client :</span>
              <span className="font-bold text-[#1A1A18]">{reservation.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7A7A72]">Période prévue :</span>
              <span className="text-[#1A1A18]">
                {reservation.startDate} au {reservation.endDate}
              </span>
            </div>
            {reservation.depositAmount > 0 && (
              <div className="flex justify-between text-[#B87320] font-semibold pt-1 border-t border-[#E5E5DF]">
                <span>Acompte enregistré :</span>
                <span>
                  {reservation.depositAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#7A7A72] hover:bg-[#E5E5DF]/50 rounded-xl transition-colors"
            >
              Retour
            </button>
            <button
              type="button"
              id="confirm-cancel-res-btn"
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#B84030] hover:bg-[#A33425] rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Confirmer l'annulation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
