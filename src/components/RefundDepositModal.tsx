import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Rental, PaymentMethod } from '../types';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  CreditCard,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  FileText,
  Smartphone,
} from 'lucide-react';

interface RefundDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: Rental | null;
}

export const RefundDepositModal: React.FC<RefundDepositModalProps> = ({
  isOpen,
  onClose,
  rental,
}) => {
  const { refundDeposit, settings } = useCrm();

  const initialDeposit = rental?.depositAmount || 0;
  const alreadyRefunded = rental?.depositRefundedAmount || 0;
  const remainingDeposit = Math.max(0, initialDeposit - alreadyRefunded);

  const [refundAmount, setRefundAmount] = useState<number>(remainingDeposit);
  const [deductionAmount, setDeductionAmount] = useState<number>(0);
  const [deductionReason, setDeductionReason] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Espèces');
  const [refundDate, setRefundDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  React.useEffect(() => {
    if (rental) {
      const rem = Math.max(0, (rental.depositAmount || 0) - (rental.depositRefundedAmount || 0));
      setRefundAmount(rem);
      setDeductionAmount(0);
      setDeductionReason('');
    }
  }, [rental, isOpen]);

  if (!isOpen || !rental) return null;

  const handleDeductionChange = (deduction: number) => {
    setDeductionAmount(deduction);
    const calculatedRefund = Math.max(0, remainingDeposit - deduction);
    setRefundAmount(calculatedRefund);
  };

  const handleRefundAmountChange = (val: number) => {
    setRefundAmount(val);
    const calculatedDeduction = Math.max(0, remainingDeposit - val);
    setDeductionAmount(calculatedDeduction);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refundAmount < 0) return;

    refundDeposit(rental.id, {
      amount: Number(refundAmount),
      deductionAmount: Number(deductionAmount),
      deductionReason: deductionReason.trim() || undefined,
      refundDate,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const paymentMethodsList: PaymentMethod[] = [
    'Espèces',
    'Virement bancaire',
    'Chèque',
    'Carte bancaire',
    'Orange Money',
    'MTN Mobile Money',
    'Wave',
  ];

  return (
    <div
      id="refund-deposit-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1A18]/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="refund-deposit-modal-dialog"
        className="w-full max-w-lg rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#2D2D2A] my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E5E5DF] bg-[#F5F5F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                Restitution de Caution
              </h2>
              <p className="text-xs text-[#7A7A72]">
                Contrat {rental.rentalNumber} — {rental.vehicleName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EBEBE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4.5 bg-white">
          {/* Summary Card */}
          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#7A7A72] block">Client :</span>
              <strong className="text-[#1A1A18] font-bold text-sm block truncate">
                {rental.clientName}
              </strong>
              <span className="text-[11px] text-[#7A7A72]">{rental.clientPhone || 'Tél non renseigné'}</span>
            </div>
            <div className="text-right">
              <span className="text-[#7A7A72] block">Caution déposée :</span>
              <strong className="text-base font-extrabold text-[#5A5A40] font-mono block">
                {initialDeposit.toLocaleString('fr-FR')} {settings.currencySymbol}
              </strong>
              {alreadyRefunded > 0 && (
                <span className="text-[10px] text-amber-700">
                  Déjà remboursé : {alreadyRefunded.toLocaleString('fr-FR')} {settings.currencySymbol}
                </span>
              )}
            </div>
          </div>

          {/* Restitution and deduction inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Montant à restituer <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={remainingDeposit}
                  step="any"
                  required
                  value={refundAmount}
                  onChange={(e) => handleRefundAmountChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-base font-bold text-[#4A7A4A] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#7A7A72]">
                  {settings.currencySymbol}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Retenue appliquée
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={remainingDeposit}
                  step="any"
                  value={deductionAmount}
                  onChange={(e) => handleDeductionChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-base font-bold text-rose-600 focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#7A7A72]">
                  {settings.currencySymbol}
                </span>
              </div>
            </div>
          </div>

          {/* Deduction Reason if deduction > 0 */}
          {deductionAmount > 0 && (
            <div className="space-y-1.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200">
              <label className="block text-xs font-semibold text-amber-900">
                Motif de la retenue / franchise
              </label>
              <input
                type="text"
                placeholder="ex: Rayure pare-choc, Retard retour, Nettoyage intérieur..."
                value={deductionReason}
                onChange={(e) => setDeductionReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:outline-hidden"
              />
            </div>
          )}

          {/* Refund Method & Date */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1A1A18]">
              Mode de restitution <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {paymentMethodsList.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer truncate flex items-center gap-1 ${
                    paymentMethod === method
                      ? 'bg-[#5A5A40] text-white border-[#5A5A40] font-semibold'
                      : 'bg-[#FAFAF8] text-[#2D2D2A] border-[#E5E5DF] hover:bg-[#F5F5F0]'
                  }`}
                >
                  <span className="truncate">{method}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Date de restitution
              </label>
              <input
                type="date"
                required
                value={refundDate}
                onChange={(e) => setRefundDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] font-medium focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Commentaires / Notes
              </label>
              <input
                type="text"
                placeholder="Remarques..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E5DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs active:scale-98 cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider le remboursement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
