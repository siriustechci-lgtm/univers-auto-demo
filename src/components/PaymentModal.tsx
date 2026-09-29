import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { PaymentMethod, PaymentStatus } from '../types';
import {
  X,
  CreditCard,
  Calendar,
  User,
  Building,
  CheckCircle2,
  DollarSign,
  FileText,
  KeyRound,
  ArrowRight,
  Sparkles,
  Smartphone,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
  preselectedReferenceType?: 'sale' | 'rental' | 'direct';
  preselectedReferenceId?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedClientId,
  preselectedReferenceType,
  preselectedReferenceId,
}) => {
  const { clients, sales, rentals, addPayment, settings } = useCrm();

  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [targetType, setTargetType] = useState<'sale' | 'rental' | 'direct'>('direct');
  const [targetId, setTargetId] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Espèces');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenceTitle, setReferenceTitle] = useState('Paiement comptant');
  const [status, setStatus] = useState<PaymentStatus>('Payé');
  const [notes, setNotes] = useState('');

  // Synchronize initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      if (preselectedClientId) {
        setClientId(preselectedClientId);
      } else if (clients.length > 0 && !clientId) {
        setClientId(clients[0].id);
      }

      if (preselectedReferenceType && preselectedReferenceId) {
        setTargetType(preselectedReferenceType);
        setTargetId(preselectedReferenceId);
      }
    }
  }, [isOpen, preselectedClientId, preselectedReferenceType, preselectedReferenceId, clients]);

  // Available sales for selected client
  const clientSales = sales.filter((s) => s.clientId === clientId);
  // Available rentals for selected client
  const clientRentals = rentals.filter((r) => r.clientId === clientId);

  // Selected sale or rental details
  const selectedSale = targetType === 'sale' ? clientSales.find((s) => s.id === targetId) : null;
  const selectedRental = targetType === 'rental' ? clientRentals.find((r) => r.id === targetId) : null;

  // Calculate current balance due on the selected item
  const currentTotalAmount = selectedSale
    ? selectedSale.totalAmount
    : selectedRental
    ? selectedRental.totalAmount
    : 0;

  const currentAmountPaid = selectedSale
    ? selectedSale.amountPaid || 0
    : selectedRental
    ? selectedRental.amountPaid || 0
    : 0;

  const currentBalanceDue = Math.max(0, currentTotalAmount - currentAmountPaid);

  // Automatically update title and suggested amount when target changes
  const handleTargetChange = (type: 'sale' | 'rental' | 'direct', id?: string) => {
    setTargetType(type);
    setTargetId(id || '');

    if (type === 'sale' && id) {
      const s = clientSales.find((item) => item.id === id);
      if (s) {
        const bal = Math.max(0, s.totalAmount - (s.amountPaid || 0));
        setReferenceTitle(`Règlement Vente ${s.saleNumber} — ${s.vehicleName}`);
        if (bal > 0) setAmount(bal);
      }
    } else if (type === 'rental' && id) {
      const r = clientRentals.find((item) => item.id === id);
      if (r) {
        const bal = Math.max(0, r.totalAmount - (r.amountPaid || 0));
        setReferenceTitle(`Règlement Location ${r.rentalNumber} — ${r.vehicleName}`);
        if (bal > 0) setAmount(bal);
      }
    } else {
      setReferenceTitle('Paiement comptant / Règlement libre');
    }
  };

  if (!isOpen) return null;

  const numericAmount = typeof amount === 'number' ? amount : 0;
  const remainingBalanceAfter = Math.max(0, currentBalanceDue - numericAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || numericAmount <= 0) return;

    const client = clients.find((c) => c.id === clientId);
    const clientName = client
      ? client.type === 'entreprise' && client.companyName
        ? client.companyName
        : `${client.firstName} ${client.lastName}`
      : 'Client';

    addPayment({
      referenceType: targetType,
      referenceId: targetType !== 'direct' ? targetId : undefined,
      referenceTitle: referenceTitle.trim() || 'Règlement client',
      clientId,
      clientName,
      clientPhone: client?.phone,
      amount: numericAmount,
      paymentDate,
      paymentMethod,
      status: status || 'Payé',
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
      id="payment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1A18]/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="payment-modal-dialog"
        className="w-full max-w-xl rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#2D2D2A] my-6"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E5E5DF] bg-[#F5F5F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                Nouveau Paiement / Encaissement
              </h2>
              <p className="text-xs text-[#7A7A72]">
                Saisie rapide en moins de 30 secondes et mise à jour immédiate des soldes
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

        {clients.length === 0 ? (
          <div className="p-6 text-center bg-white space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm">
              Aucun client n'est enregistré dans le CRM. Veuillez d'abord enregistrer un client avant de créer un encaissement.
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#5A5A40] text-white text-xs sm:text-sm font-semibold cursor-pointer"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4.5 bg-white">
            {/* 1. Client Payeur */}
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                Client payeur <span className="text-rose-500">*</span>
              </label>
              <select
                id="payment-client-select"
                required
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setTargetType('direct');
                  setTargetId('');
                  setReferenceTitle('Paiement comptant');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] font-medium focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
              >
                <option value="">-- Sélectionner un client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.type === 'entreprise' && c.companyName
                      ? `🏢 ${c.companyName} (${c.firstName} ${c.lastName})`
                      : `👤 ${c.firstName} ${c.lastName}`}{' '}
                    {c.phone ? `— ${c.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Dossier associé (Vente, Location ou Règlement Direct) */}
            {clientId && (
              <div className="space-y-2 p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                <label className="block text-xs font-semibold text-[#1A1A18]">
                  Affectation du paiement (Vente, Location ou Libre)
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTargetChange('direct')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                      targetType === 'direct'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                        : 'bg-white text-[#5A5A52] border-[#E5E5DF] hover:bg-[#F5F5F0]'
                    }`}
                  >
                    Règlement Direct
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (clientSales.length > 0) {
                        handleTargetChange('sale', clientSales[0].id);
                      } else {
                        handleTargetChange('sale', '');
                      }
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                      targetType === 'sale'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                        : 'bg-white text-[#5A5A52] border-[#E5E5DF] hover:bg-[#F5F5F0]'
                    }`}
                  >
                    Vente ({clientSales.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (clientRentals.length > 0) {
                        handleTargetChange('rental', clientRentals[0].id);
                      } else {
                        handleTargetChange('rental', '');
                      }
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                      targetType === 'rental'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                        : 'bg-white text-[#5A5A52] border-[#E5E5DF] hover:bg-[#F5F5F0]'
                    }`}
                  >
                    Location ({clientRentals.length})
                  </button>
                </div>

                {/* Sub-selector for specific sale */}
                {targetType === 'sale' && (
                  <div className="pt-2">
                    {clientSales.length === 0 ? (
                      <p className="text-xs text-[#7A7A72] italic">
                        Aucune vente enregistrée pour ce client.
                      </p>
                    ) : (
                      <select
                        value={targetId}
                        onChange={(e) => handleTargetChange('sale', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs font-medium text-[#1A1A18] focus:border-[#5A5A40] focus:outline-hidden"
                      >
                        {clientSales.map((s) => {
                          const bal = Math.max(0, s.totalAmount - (s.amountPaid || 0));
                          return (
                            <option key={s.id} value={s.id}>
                              {s.saleNumber} — {s.vehicleName} (Total : {s.totalAmount} {settings.currencySymbol} | Solde dû : {bal} {settings.currencySymbol})
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                )}

                {/* Sub-selector for specific rental */}
                {targetType === 'rental' && (
                  <div className="pt-2">
                    {clientRentals.length === 0 ? (
                      <p className="text-xs text-[#7A7A72] italic">
                        Aucun contrat de location enregistré pour ce client.
                      </p>
                    ) : (
                      <select
                        value={targetId}
                        onChange={(e) => handleTargetChange('rental', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs font-medium text-[#1A1A18] focus:border-[#5A5A40] focus:outline-hidden"
                      >
                        {clientRentals.map((r) => {
                          const bal = Math.max(0, r.totalAmount - (r.amountPaid || 0));
                          return (
                            <option key={r.id} value={r.id}>
                              {r.rentalNumber} — {r.vehicleName} (Total : {r.totalAmount} {settings.currencySymbol} | Solde dû : {bal} {settings.currencySymbol})
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. Montant & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#1A1A18]">
                    Montant ({settings.currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  {currentBalanceDue > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmount(currentBalanceDue)}
                      className="text-[11px] font-bold text-[#5A5A40] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Solde ({currentBalanceDue.toLocaleString('fr-FR')} {settings.currencySymbol})</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="payment-amount-input"
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-base font-bold text-[#4A7A4A] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#7A7A72]">
                    {settings.currencySymbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                  Date d'encaissement <span className="text-rose-500">*</span>
                </label>
                <input
                  id="payment-date-input"
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] font-medium focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* 4. Mode de Paiement (Chips & Direct selection) */}
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                Mode de règlement <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {paymentMethodsList.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left truncate flex items-center gap-1.5 ${
                      paymentMethod === method
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] font-semibold shadow-xs'
                        : 'bg-[#FAFAF8] text-[#2D2D2A] border-[#E5E5DF] hover:bg-[#F5F5F0]'
                    }`}
                  >
                    {method.includes('Money') || method === 'Wave' ? (
                      <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="truncate">{method}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Statut & Motif */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                  Statut
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs font-semibold text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                >
                  <option value="Payé">Payé / Validé</option>
                  <option value="Partiellement payé">Partiellement payé</option>
                  <option value="En attente">En attente</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                  Libellé du reçu / Motif
                </label>
                <input
                  type="text"
                  placeholder="ex: Acompte, Solde véhicule, Paiement comptant..."
                  value={referenceTitle}
                  onChange={(e) => setReferenceTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* 6. Realtime Validation Box (Montant payé, Solde restant, Confirmation) */}
            <div className="p-4 rounded-xl bg-[#F5F5F0] border border-[#E5E5DF] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7A7A72]">Montant de ce versement :</span>
                <span className="font-mono font-bold text-[#4A7A4A] text-sm">
                  +{numericAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                </span>
              </div>

              {(selectedSale || selectedRental) && (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7A7A72]">Solde dû avant versement :</span>
                    <span className="font-mono font-semibold text-[#1A1A18]">
                      {currentBalanceDue.toLocaleString('fr-FR')} {settings.currencySymbol}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E5E5DF]">
                    <span className="font-semibold text-[#1A1A18]">Solde restant après validation :</span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        remainingBalanceAfter === 0 ? 'text-[#4A7A4A]' : 'text-amber-600'
                      }`}
                    >
                      {remainingBalanceAfter.toLocaleString('fr-FR')} {settings.currencySymbol}
                      {remainingBalanceAfter === 0 && ' (Solde intégralement soldé)'}
                    </span>
                  </div>
                </>
              )}
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
                id="submit-payment-btn"
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs active:scale-98 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Valider l'encaissement</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
