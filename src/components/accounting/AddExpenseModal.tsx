import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import {
  X,
  Plus,
  Receipt,
  Car,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

const EXPENSE_CATEGORIES: { label: ExpenseCategory; desc: string; color: string }[] = [
  { label: 'Carburant', desc: 'Essence, Diesel, péages', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { label: 'Maintenance', desc: 'Réparations, vidanges, pneus, contrôle technique', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { label: 'Assurance', desc: 'Primes flotte, garanties conducteur', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { label: 'Salaires', desc: 'Rémunérations, commissions d\'équipe', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { label: 'Loyer', desc: 'Loyer du local, parking, garage', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { label: 'Marketing', desc: 'Publicité, site web, flyers, annonces', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { label: 'Fournitures', desc: 'Bureau, papeterie, produits de nettoyage', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
  { label: 'Autres dépenses', desc: 'Frais bancaires, impôts, divers', color: 'text-stone-700 bg-stone-100 border-stone-300' },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'Espèces', label: 'Espèces (Caisse)' },
  { value: 'Virement bancaire', label: 'Virement bancaire' },
  { value: 'Carte bancaire', label: 'Carte bancaire' },
  { value: 'Chèque', label: 'Chèque' },
  { value: 'Mobile Money', label: 'Mobile Money / Portefeuille' },
  { value: 'Autre', label: 'Autre mode' },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
}) => {
  const { vehicles, settings, addExpense, updateExpense } = useCrm();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Carburant');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Virement bancaire');
  const [beneficiary, setBeneficiary] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expenseToEdit) {
      setDate(expenseToEdit.date);
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount.toString());
      setDescription(expenseToEdit.description);
      setPaymentMethod(expenseToEdit.paymentMethod as PaymentMethod);
      setBeneficiary(expenseToEdit.beneficiary || '');
      setVehicleId(expenseToEdit.vehicleId || '');
      setReceiptUrl(expenseToEdit.receiptUrl || '');
      setNotes(expenseToEdit.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Carburant');
      setAmount('');
      setDescription('');
      setPaymentMethod('Virement bancaire');
      setBeneficiary('');
      setVehicleId('');
      setReceiptUrl('');
      setNotes('');
      setError(null);
    }
  }, [expenseToEdit, isOpen]);

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
      setError('Veuillez saisir une description claire de la dépense.');
      return;
    }

    const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
    const vehicleInfo = selectedVehicle
      ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.registration})`
      : undefined;

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, {
        date,
        category,
        amount: parsedAmount,
        description: description.trim(),
        paymentMethod,
        beneficiary: beneficiary.trim() || undefined,
        vehicleId: vehicleId || undefined,
        vehicleInfo,
        receiptUrl: receiptUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addExpense({
        date,
        category,
        amount: parsedAmount,
        description: description.trim(),
        paymentMethod,
        beneficiary: beneficiary.trim() || undefined,
        vehicleId: vehicleId || undefined,
        vehicleInfo,
        receiptUrl: receiptUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div
        id="modal-add-expense"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5E5DF] overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E5E5DF] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A18] font-['Outfit']">
                {expenseToEdit ? 'Modifier la dépense' : 'Enregistrer une dépense'}
              </h2>
              <p className="text-xs text-[#7A7A72]">
                {expenseToEdit
                  ? `Mise à jour de la charge ${expenseToEdit.expenseNumber}`
                  : 'Saisie comptable d\'une charge réelle d\'exploitation'}
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
                Montant ({settings.currencySymbol || '€'}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="expense-input-amount"
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
                Date de la dépense <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="expense-input-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
                />
              </div>
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
              Catégorie de charge <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setCategory(cat.label)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    category === cat.label
                      ? 'border-[#2D2D2A] bg-[#2D2D2A] text-white shadow-xs'
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
              Description de la dépense <span className="text-red-500">*</span>
            </label>
            <input
              id="expense-input-description"
              type="text"
              required
              placeholder="Ex: Plein carburant retour client, Vidange 50.000 km, Loyer bureau mars..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
            />
          </div>

          {/* Moyen de paiement & Bénéficiaire */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                Bénéficiaire / Fournisseur
              </label>
              <input
                type="text"
                placeholder="Ex: Station Total, Garage Central, Bailleur..."
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
              >
              </input>
            </div>
          </div>

          {/* Véhicule rattaché (Optionnel) & Pièce justificative */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                Véhicule concerné (optionnel)
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
              >
                <option value="">-- Aucun véhicule spécifique --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.registration})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                Réf. pièce justificative
              </label>
              <input
                type="text"
                placeholder="Ex: Facture N° 8492, Reçu CB #402..."
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
              Notes complémentaires (optionnel)
            </label>
            <textarea
              rows={2}
              placeholder="Précisions utiles pour la comptabilité..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-[#E5E5DF] rounded-xl text-xs text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
            />
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
              id="expense-btn-submit"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{expenseToEdit ? 'Mettre à jour' : 'Enregistrer la charge'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
