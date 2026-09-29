import React, { useState, useEffect, useRef } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Expense, ExpenseCategory, PaymentMethod, ExpenseDocument } from '../../types';
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
  Upload,
  Image,
  Paperclip,
  Trash2,
  Fuel,
  Wrench,
  Hammer,
  Shield,
  Users,
  Zap,
  Droplets,
  Wifi,
  Megaphone,
  ShoppingBag,
  Landmark,
  MoreHorizontal,
  Clock,
} from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
  initialCategory?: ExpenseCategory;
}

const CATEGORY_OPTIONS: { label: ExpenseCategory; desc: string; icon: React.ReactNode; color: string }[] = [
  { label: 'Carburant', desc: 'Essence, Diesel, péages', icon: <Fuel className="w-4 h-4" />, color: 'hover:border-amber-400' },
  { label: 'Entretien', desc: 'Vidanges, filtres, lavage', icon: <Wrench className="w-4 h-4" />, color: 'hover:border-blue-400' },
  { label: 'Réparation', desc: 'Mécanique, tôlerie, pneus', icon: <Hammer className="w-4 h-4" />, color: 'hover:border-rose-400' },
  { label: 'Assurance', desc: 'Flotte, locaux, RC pro', icon: <Shield className="w-4 h-4" />, color: 'hover:border-emerald-400' },
  { label: 'Salaires', desc: 'Salaires, primes, chauffeurs', icon: <Users className="w-4 h-4" />, color: 'hover:border-purple-400' },
  { label: 'Loyer', desc: 'Bail agence, parking, garage', icon: <Building className="w-4 h-4" />, color: 'hover:border-indigo-400' },
  { label: 'Électricité', desc: 'Facture électricité, borne', icon: <Zap className="w-4 h-4" />, color: 'hover:border-yellow-400' },
  { label: 'Eau', desc: 'Eau sanitaire, lavage', icon: <Droplets className="w-4 h-4" />, color: 'hover:border-cyan-400' },
  { label: 'Internet', desc: 'Fibre, forfaits, GPS', icon: <Wifi className="w-4 h-4" />, color: 'hover:border-teal-400' },
  { label: 'Marketing', desc: 'Publicités, site web, flyers', icon: <Megaphone className="w-4 h-4" />, color: 'hover:border-pink-400' },
  { label: 'Fournitures', desc: 'Papeterie, bureau, outillage', icon: <ShoppingBag className="w-4 h-4" />, color: 'hover:border-slate-400' },
  { label: 'Taxes', desc: 'Vignettes, taxes, timbres', icon: <Landmark className="w-4 h-4" />, color: 'hover:border-orange-400' },
  { label: 'Autres', desc: 'Frais bancaires, imprévus', icon: <MoreHorizontal className="w-4 h-4" />, color: 'hover:border-stone-400' },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'Espèces', label: 'Espèces (Caisse agence)' },
  { value: 'Virement bancaire', label: 'Virement bancaire' },
  { value: 'Chèque', label: 'Chèque bancaire' },
  { value: 'Orange Money', label: 'Orange Money' },
  { value: 'MTN Mobile Money', label: 'MTN Mobile Money' },
  { value: 'Wave', label: 'Wave' },
  { value: 'Carte bancaire', label: 'Carte bancaire' },
  { value: 'Mobile Money', label: 'Mobile Money (Autre)' },
  { value: 'Autre', label: 'Autre mode de règlement' },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
  initialCategory,
}) => {
  const { vehicles, settings, addExpense, updateExpense } = useCrm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>(initialCategory || 'Carburant');
  const [amount, setAmount] = useState('');
  const [supplier, setSupplier] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Espèces');
  const [vehicleId, setVehicleId] = useState('');
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<ExpenseDocument[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expenseToEdit) {
      setDate(expenseToEdit.date || new Date().toISOString().split('T')[0]);
      setCategory(expenseToEdit.category || 'Carburant');
      setAmount(expenseToEdit.amount ? expenseToEdit.amount.toString() : '');
      setSupplier(expenseToEdit.supplier || expenseToEdit.beneficiary || '');
      setDescription(expenseToEdit.description || '');
      setPaymentMethod((expenseToEdit.paymentMethod as PaymentMethod) || 'Espèces');
      setVehicleId(expenseToEdit.vehicleId || '');
      setNotes(expenseToEdit.notes || '');
      setDocuments(expenseToEdit.documents || []);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(initialCategory || 'Carburant');
      setAmount('');
      setSupplier('');
      setDescription('');
      setPaymentMethod('Espèces');
      setVehicleId('');
      setNotes('');
      setDocuments([]);
      setError(null);
    }
  }, [expenseToEdit, initialCategory, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      const docType: 'facture' | 'justificatif' | 'photo' | 'autre' = isImage
        ? 'photo'
        : file.name.toLowerCase().includes('facture')
        ? 'facture'
        : 'justificatif';

      reader.onload = (event) => {
        const fileUrl = event.target?.result as string;
        const newDoc: ExpenseDocument = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          type: docType,
          url: fileUrl,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
        setDocuments((prev) => [...prev, newDoc]);
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveDoc = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

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

    const receiptUrl = documents.length > 0 ? documents[0].name : undefined;

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, {
        date,
        category,
        amount: parsedAmount,
        description: description.trim(),
        supplier: supplier.trim() || undefined,
        beneficiary: supplier.trim() || undefined,
        paymentMethod,
        vehicleId: vehicleId || undefined,
        vehicleInfo,
        receiptUrl,
        documents,
        notes: notes.trim() || undefined,
      });
    } else {
      addExpense({
        date,
        category,
        amount: parsedAmount,
        description: description.trim(),
        supplier: supplier.trim() || undefined,
        beneficiary: supplier.trim() || undefined,
        paymentMethod,
        vehicleId: vehicleId || undefined,
        vehicleInfo,
        receiptUrl,
        documents,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div
        id="modal-add-expense"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E5DF] overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E5E5DF] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A18] font-['Outfit']">
                {expenseToEdit ? 'Modifier la dépense' : 'Nouvelle dépense'}
              </h2>
              <p className="text-xs text-[#7A7A72]">
                {expenseToEdit
                  ? `Mise à jour de la charge ${expenseToEdit.expenseNumber}`
                  : 'Saisie rapide en moins d\'une minute'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Informations Principales */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#7A7A72] mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Informations principales</span>
            </div>

            {/* Montant & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                    className="w-full pl-3.5 pr-12 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-base font-bold text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
                    autoFocus
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A7A72]">
                    {settings.currencySymbol || '€'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                  Date de la dépense <span className="text-red-500">*</span>
                </label>
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

            {/* Catégorie Sélecteur */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-[#FAFAF8] rounded-xl border border-[#E5E5DF]">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center gap-2 ${
                      category === cat.label
                        ? 'border-[#2D2D2A] bg-[#2D2D2A] text-white shadow-xs font-semibold'
                        : 'border-[#E5E5DF] bg-white text-[#2D2D2A] hover:bg-white ' + cat.color
                    }`}
                  >
                    <span className={category === cat.label ? 'text-white' : 'text-[#7A7A72]'}>
                      {cat.icon}
                    </span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fournisseur & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                  Fournisseur / Bénéficiaire
                </label>
                <input
                  id="expense-input-supplier"
                  type="text"
                  placeholder="Ex: TotalEnergies, Garage Central, Bailleur..."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  id="expense-input-description"
                  type="text"
                  required
                  placeholder="Ex: Plein essence départ location, Vidange 60 000 km..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Mode de Paiement & Véhicule */}
          <div className="pt-3 border-t border-[#F0F0EC]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
                  Mode de paiement <span className="text-red-500">*</span>
                </label>
                <select
                  id="expense-select-payment-method"
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
                  Véhicule rattaché (optionnel)
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
            </div>
          </div>

          {/* Section 3: Documents (Facture, Justificatif, Photo) */}
          <div className="pt-3 border-t border-[#F0F0EC]">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#1A1A18]">
                Documents joints (Facture, Justificatif, Photo)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-[#5A5A40] hover:text-[#2D2D2A] flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Joindre un fichier</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />

            {documents.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E5E5DF] hover:border-[#5A5A40] rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#FAFAF8]"
              >
                <Paperclip className="w-6 h-6 text-[#7A7A72] mx-auto mb-1.5" />
                <p className="text-xs text-[#1A1A18] font-medium">
                  Cliquez pour ajouter une facture, un reçu ou une photo de ticket
                </p>
                <p className="text-[10px] text-[#7A7A72] mt-0.5">
                  Formats acceptés : PDF, PNG, JPG, JPEG
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 bg-[#FAFAF8] rounded-xl border border-[#E5E5DF] text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {doc.type === 'photo' || doc.url.startsWith('data:image') ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#E5E5DF]">
                          <img
                            src={doc.url}
                            alt={doc.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0 truncate">
                        <p className="font-semibold text-[#1A1A18] truncate">{doc.name}</p>
                        <p className="text-[10px] text-[#7A7A72] uppercase font-mono">{doc.type}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Retirer la pièce"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 border border-dashed border-[#E5E5DF] hover:border-[#5A5A40] rounded-xl text-xs text-[#7A7A72] hover:text-[#1A1A18] text-center font-medium transition-colors"
                >
                  + Ajouter un autre document
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Notes internes */}
          <div className="pt-3 border-t border-[#F0F0EC]">
            <label className="block text-xs font-semibold text-[#1A1A18] mb-1.5">
              Notes & Commentaires internes
            </label>
            <textarea
              rows={2}
              placeholder="Commentaires pour la comptabilité ou l'équipe..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5DF] rounded-xl text-xs text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A] focus:ring-2 focus:ring-[#4A7A4A]/20"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E5E5DF] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E5E5DF] bg-white text-xs font-medium text-[#7A7A72] hover:bg-[#FAFAF8] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              id="expense-btn-submit"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{expenseToEdit ? 'Mettre à jour' : 'Enregistrer la dépense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
