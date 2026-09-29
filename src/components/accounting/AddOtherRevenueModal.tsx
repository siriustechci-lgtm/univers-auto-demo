import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { OtherRevenue, OtherRevenueCategory, PaymentMethod } from '../../types';
import {
  X,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AddOtherRevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  revenueToEdit?: OtherRevenue | null;
}

const REVENUE_CATEGORIES: { label: OtherRevenueCategory; desc: string }[] = [
  { label: 'Prestation', desc: 'Nettoyage, livraison véhicule, convoyage' },
  { label: 'Vente accessoire', desc: 'Siège auto, GPS, barres de toit, dashcam' },
  { label: 'Frais de dossier', desc: 'Frais administratifs, gestion de carte grise' },
  { label: 'Commission', desc: 'Apporteur d\'affaires, intermédiaire, courtage' },
  { label: 'Pénalité/Frais retard', desc: 'Frais kilométriques dépassés, retard restitution' },
  { label: 'Autre revenu', desc: 'Produits exceptionnels, remboursements' },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'Espèces', label: 'Espèces (Caisse)' },
  { value: 'Virement bancaire', label: 'Virement bancaire' },
  { value: 'Carte bancaire', label: 'Carte bancaire' },
  { value: 'Chèque', label: 'Chèque' },
  { value: 'Mobile Money', label: 'Mobile Money / Portefeuille' },
  { value: 'Autre', label: 'Autre mode' },
];

export const AddOtherRevenueModal: React.FC<AddOtherRevenueModalProps> = ({
  isOpen,
  onClose,
  revenueToEdit,
}) => {
  const { clients, settings, addOtherRevenue, updateOtherRevenue } = useCrm();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<OtherRevenueCategory>('Prestation');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Espèces');
  const [clientId, setClientId] = useState('');
  const [customClientName, setCustomClientName] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (revenueToEdit) {
      setDate(revenueToEdit.date);
      setCategory(revenueToEdit.category);
      setAmount(revenueToEdit.amount.toString());
      setDescription(revenueToEdit.description);
      setPaymentMethod(revenueToEdit.paymentMethod as PaymentMethod);
      setClientId(revenueToEdit.clientId || '');
      setCustomClientName(revenueToEdit.clientName || '');
      setReceiptNumber(revenueToEdit.receiptNumber || '');
      setNotes(revenueToEdit.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Prestation');
      setAmount('');
      setDescription('');
      setPaymentMethod('Espèces');
      setClientId('');
      setCustomClientName('');
      setReceiptNumber('');
      setNotes('');
      setError(null);
    }
  }, [revenueToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Veuillez saisir un montant valide supérieur à 0.');
      return;
    }

    if (!description.trim()) {
      setError('Veuillez saisir une description du revenu.');
      return;
    }

    const selectedClient = clients.find((c) => c.id === clientId);
    const clientName = selectedClient ? selectedClient.fullName : customClientName.trim() || undefined;

    if (revenueToEdit) {
      updateOtherRevenue(revenueToEdit.id, {
        date,
        category,
        amount: parsedAmount,
        description: description.trim(),
        paymentMethod,
        clientId: clientId || undefined,
        clientName,
        receiptNumber: receiptNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addOtherRevenue({
        date,
        category,
        amount: parsedAmount,
        description: description.trim(),
        paymentMethod,
        clientId: clientId || undefined,
        clientName,
        receiptNumber: receiptNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div
        id="modal-add-other-revenue"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5E5DF] overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E5E5DF] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A18] font-['Outfit']">
                {revenueToEdit ? 'Modifier le revenu' : 'Enregistrer un autre revenu'}
              </h2>
              <p className="text-xs text-[#7A7A72]">
                Prestations de service, accessoires, commissions ou frais de dossier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EAEAE4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Montant & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                Montant encaissé ({settings.currencySymbol || '€'}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm font-bold text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#7A7A72]">
                  {settings.currencySymbol || '€'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                Date d'encaissement <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
              />
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
              Type de revenu <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REVENUE_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setCategory(cat.label)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    category === cat.label
                      ? 'border-[#4A7A4A] bg-[#4A7A4A] text-white shadow-xs'
                      : 'border-[#E5E5DF] bg-white text-[#2D2D2A] hover:bg-[#FAFAF8]'
                  }`}
                >
                  <span className="block font-semibold">{cat.label}</span>
                  <span className={`text-[10px] line-clamp-1 mt-0.5 ${category === cat.label ? 'text-white/80' : 'text-[#7A7A72]'}`}>
                    {cat.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
              Description de la prestation / vente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Nettoyage complet véhicule retour, Siège bébé 7 jours..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
            />
          </div>

          {/* Client & Moyen de paiement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                Client (enregistré ou libre)
              </label>
              {clients.length > 0 ? (
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    if (e.target.value) setCustomClientName('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
                >
                  <option value="">-- Client occasionnel / Libre --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Nom du client"
                  value={customClientName}
                  onChange={(e) => setCustomClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                Mode de règlement
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Réf. reçu / Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                N° de reçu / Ticket (optionnel)
              </label>
              <input
                type="text"
                placeholder="Ex: TKT-0931"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                Notes (optionnel)
              </label>
              <input
                type="text"
                placeholder="Remarques complémentaires..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E5E5DF] bg-white text-xs font-medium text-[#7A7A72] hover:bg-[#FAFAF8] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#4A7A4A] hover:bg-[#3D663D] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{revenueToEdit ? 'Mettre à jour' : 'Enregistrer le revenu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
