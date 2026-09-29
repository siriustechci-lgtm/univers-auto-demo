import React, { useState } from 'react';
import { X, KeyRound, Car, User, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { Reservation, PaymentMethod } from '../../types';

interface ConvertToRentalModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ConvertToRentalModal: React.FC<ConvertToRentalModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { vehicles, convertReservationToRental, settings } = useCrm();

  if (!isOpen || !reservation) return null;

  const vehicle = vehicles.find((v) => v.id === reservation.vehicleId);

  const startD = new Date(reservation.startDate);
  const endD = new Date(reservation.endDate);
  const diffTime = endD.getTime() - startD.getTime();
  const durationDays = isNaN(diffTime) ? 1 : Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const initialDailyRate = vehicle?.dailyRate || 50;
  const initialTotalAmount = durationDays * initialDailyRate;
  const initialDeposit = vehicle?.securityDeposit || 500;

  const [dailyRate, setDailyRate] = useState<number>(initialDailyRate);
  const [depositAmount, setDepositAmount] = useState<number>(initialDeposit);
  const [amountPaid, setAmountPaid] = useState<number>(reservation.depositAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | string>(
    reservation.depositPaymentMethod || 'Espèces'
  );
  const [mileageDeparture, setMileageDeparture] = useState<number>(vehicle?.mileage || 0);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const totalRentalAmount = durationDays * dailyRate;
  const balanceDue = Math.max(0, totalRentalAmount - amountPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (dailyRate <= 0) {
      setErrorMsg('Le tarif journalier doit être supérieur à 0.');
      return;
    }

    const res = convertReservationToRental(reservation.id, {
      dailyRate: Number(dailyRate),
      depositAmount: Number(depositAmount),
      mileageDeparture: Number(mileageDeparture),
      amountPaid: Number(amountPaid),
      paymentMethod: paymentMethod as PaymentMethod,
      notes: notes.trim() || undefined,
    });

    if (res) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div
      id="convert-to-rental-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="convert-to-rental-modal-container"
        className="w-full max-w-lg bg-white rounded-3xl border border-[#E5E5DF] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EC] bg-[#FAFAF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                Convertir la réservation en location
              </h2>
              <p className="text-xs text-[#7A7A72]">
                Réservation {reservation.reservationNumber} • {reservation.clientName}
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
          {/* Summary Box */}
          <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#F0F0EC] space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#7A7A72]">Véhicule :</span>
              <span className="font-bold text-[#1A1A18]">{reservation.vehicleName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7A7A72]">Période :</span>
              <span className="font-semibold text-[#1A1A18]">
                {reservation.startDate} au {reservation.endDate} ({durationDays} jours)
              </span>
            </div>
            {reservation.depositAmount > 0 && (
              <div className="flex justify-between text-[#4A7A4A] font-semibold pt-1 border-t border-[#E5E5DF]">
                <span>Acompte de réservation crédité :</span>
                <span>
                  {reservation.depositAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Tarif journalier ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="1"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Caution garantie ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Montant réglé maintenant ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Mode de règlement
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
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
            <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
              Kilométrage au départ
            </label>
            <input
              type="number"
              min="0"
              value={mileageDeparture}
              onChange={(e) => setMileageDeparture(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-white text-[#1A1A18] focus:border-[#4A6B82]"
            />
          </div>

          {/* Financial Calculation summary */}
          <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#F0F0EC] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#7A7A72] block">Total contrat de location</span>
              <span className="font-bold text-[#1A1A18] text-sm">
                {totalRentalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#7A7A72] block">Solde restant à régler</span>
              <span
                className={`font-bold text-sm ${
                  balanceDue > 0 ? 'text-[#B87320]' : 'text-[#4A7A4A]'
                }`}
              >
                {balanceDue.toLocaleString('fr-FR')} {settings.currencySymbol}
              </span>
            </div>
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
              className="px-4 py-2 text-xs font-semibold text-white bg-[#5A5A40] hover:bg-[#484833] rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Générer le contrat de location</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
