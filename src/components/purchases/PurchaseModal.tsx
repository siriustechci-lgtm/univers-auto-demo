import React, { useState, useEffect } from 'react';
import { Purchase, Vehicle } from '../../types';
import { X, ShoppingCart, Calculator, Truck, FileText, CheckCircle2 } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (purchase: Partial<Purchase>) => Promise<void>;
  purchaseToEdit?: Purchase | null;
  vehicles: Vehicle[];
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  purchaseToEdit,
  vehicles,
}) => {
  const [purchaseNumber, setPurchaseNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Cost items
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [customsFee, setCustomsFee] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [transportFee, setTransportFee] = useState<number>(0);
  const [preparationFee, setPreparationFee] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);

  const [status, setStatus] = useState<'Commandé' | 'En transit' | 'En douane' | 'Arrivé / En parc' | 'Clôturé'>('Arrivé / En parc');
  const [paymentStatus, setPaymentStatus] = useState<'Payé' | 'Partiellement payé' | 'En attente'>('Payé');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculated real cost of goods
  const totalCost = purchasePrice + customsFee + shippingFee + transportFee + preparationFee + otherCharges;

  useEffect(() => {
    if (purchaseToEdit) {
      setPurchaseNumber(purchaseToEdit.purchaseNumber || '');
      setDate(purchaseToEdit.date || new Date().toISOString().split('T')[0]);
      setSelectedVehicleId(purchaseToEdit.vehicleId || '');
      setVehicleInfo(purchaseToEdit.vehicleInfo || '');
      setSupplierName(purchaseToEdit.supplierName || '');
      setInvoiceNumber(purchaseToEdit.invoiceNumber || '');
      setPurchasePrice(purchaseToEdit.purchasePrice || 0);
      setCustomsFee(purchaseToEdit.customsFee || 0);
      setShippingFee(purchaseToEdit.shippingFee || 0);
      setTransportFee(purchaseToEdit.transportFee || 0);
      setPreparationFee(purchaseToEdit.preparationFee || 0);
      setOtherCharges(purchaseToEdit.otherCharges || 0);
      setStatus(purchaseToEdit.status || 'Arrivé / En parc');
      setPaymentStatus(purchaseToEdit.paymentStatus || 'Payé');
      setAmountPaid(purchaseToEdit.amountPaid || 0);
      setNotes(purchaseToEdit.notes || '');
    } else {
      setPurchaseNumber(`ACH-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`);
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedVehicleId('');
      setVehicleInfo('');
      setSupplierName('');
      setInvoiceNumber('');
      setPurchasePrice(0);
      setCustomsFee(0);
      setShippingFee(0);
      setTransportFee(0);
      setPreparationFee(0);
      setOtherCharges(0);
      setStatus('Arrivé / En parc');
      setPaymentStatus('Payé');
      setAmountPaid(0);
      setNotes('');
    }
    setError(null);
  }, [purchaseToEdit, isOpen]);

  // When vehicle selected, prepopulate vehicleInfo
  const handleVehicleSelect = (vId: string) => {
    setSelectedVehicleId(vId);
    const found = vehicles.find((v) => v.id === vId);
    if (found) {
      setVehicleInfo(`${found.make} ${found.model} (${found.year}) - VIN: ${found.vin || 'N/A'}`);
      if (found.purchasePrice && !purchasePrice) {
        setPurchasePrice(found.purchasePrice);
      }
      if (found.supplier && !supplierName) {
        setSupplierName(found.supplier);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      setError('Veuillez renseigner le nom du fournisseur ou la provenance.');
      return;
    }
    if (!vehicleInfo.trim() && !selectedVehicleId) {
      setError('Veuillez indiquer la description du véhicule commandé ou en sélectionner un.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        purchaseNumber,
        date,
        vehicleId: selectedVehicleId || undefined,
        vehicleInfo: vehicleInfo.trim() || 'Véhicule',
        supplierName: supplierName.trim(),
        invoiceNumber: invoiceNumber.trim(),
        purchasePrice,
        customsFee,
        shippingFee,
        transportFee,
        preparationFee,
        otherCharges,
        totalCost,
        status,
        paymentStatus,
        amountPaid: paymentStatus === 'Payé' ? totalCost : amountPaid,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement de l'achat");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[#0D0E12] border border-[#262A33] rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#20242D] bg-[#12141A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {purchaseToEdit ? "Modifier l'achat de véhicule" : 'Nouvel Achat / Approvisionnement'}
              </h2>
              <p className="text-xs text-[#85878A]">
                Calcul du coût de revient réel : achat, douane, transit et transport
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#85878A] hover:text-white rounded-lg hover:bg-[#1C1F27] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1.5">
                N° Achat / Réf
              </label>
              <input
                type="text"
                value={purchaseNumber}
                onChange={(e) => setPurchaseNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#14161C] border border-[#2A2E38] rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1.5">
                Date d'acquisition
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#14161C] border border-[#2A2E38] rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1.5">
                Statut approvisionnement
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#14161C] border border-[#2A2E38] rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
              >
                <option value="Commandé">Commandé</option>
                <option value="En transit">En transit maritime/routier</option>
                <option value="En douane">En cours de dédouanement</option>
                <option value="Arrivé / En parc">Arrivé / En parc</option>
                <option value="Clôturé">Clôturé</option>
              </select>
            </div>
          </div>

          {/* Supplier & Vehicle Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1.5">
                Fournisseur / Concession d'origine *
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Ex : Dubai Auto Hub, Autohaus Munich, Port Autonome..."
                className="w-full px-3.5 py-2.5 bg-[#14161C] border border-[#2A2E38] rounded-xl text-sm text-white placeholder-[#505460] focus:outline-none focus:border-[#E50914]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1.5">
                N° Facture d'origine / BL
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Ex : BL-908821 / INV-2024-44"
                className="w-full px-3.5 py-2.5 bg-[#14161C] border border-[#2A2E38] rounded-xl text-sm text-white placeholder-[#505460] focus:outline-none focus:border-[#E50914]"
              />
            </div>
          </div>

          {/* Vehicle binding */}
          <div className="p-4 bg-[#12141A] border border-[#242833] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E50914]" />
                Rattachement au Parc Automobile
              </span>
              <span className="text-[11px] text-[#85878A]">
                Associer à un véhicule existant ou saisir la désignation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#85878A] mb-1">
                  Sélectionner dans le stock (optionnel)
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => handleVehicleSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#161820] border border-[#2A2E38] rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
                >
                  <option value="">-- Aucun (Saisie manuelle libre) --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.reference ? `[${v.reference}] ` : ''}{v.make} {v.model} ({v.year}) - {v.vin || v.registration || 'Sans immat'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#85878A] mb-1">
                  Désignation du véhicule / Réf / VIN *
                </label>
                <input
                  type="text"
                  value={vehicleInfo}
                  onChange={(e) => setVehicleInfo(e.target.value)}
                  placeholder="Ex : Toyota Land Cruiser V8 2022 - VIN: JT3..."
                  className="w-full px-3.5 py-2.5 bg-[#161820] border border-[#2A2E38] rounded-xl text-sm text-white placeholder-[#505460] focus:outline-none focus:border-[#E50914]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Detailed Cost Breakdown (Coût de revient réel) */}
          <div className="p-4 bg-[#12141A] border border-[#262A34] rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#20242E] pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#E50914]" />
                Décomposition des coûts d'acquisition (FCFA)
              </span>
              <span className="text-xs text-[#E50914] font-semibold">
                Tous montants en FCFA
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#85878A] mb-1">
                  1. Prix d'achat véhicule
                </label>
                <input
                  type="number"
                  min="0"
                  value={purchasePrice || ''}
                  onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#171922] border border-[#2E333F] rounded-lg text-sm text-white focus:outline-none focus:border-[#E50914]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#85878A] mb-1">
                  2. Frais de douane
                </label>
                <input
                  type="number"
                  min="0"
                  value={customsFee || ''}
                  onChange={(e) => setCustomsFee(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#171922] border border-[#2E333F] rounded-lg text-sm text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#85878A] mb-1">
                  3. Fret maritime / Transit
                </label>
                <input
                  type="number"
                  min="0"
                  value={shippingFee || ''}
                  onChange={(e) => setShippingFee(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#171922] border border-[#2E333F] rounded-lg text-sm text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#85878A] mb-1">
                  4. Transport local / Remorquage
                </label>
                <input
                  type="number"
                  min="0"
                  value={transportFee || ''}
                  onChange={(e) => setTransportFee(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#171922] border border-[#2E333F] rounded-lg text-sm text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#85878A] mb-1">
                  5. Préparation / Réparations
                </label>
                <input
                  type="number"
                  min="0"
                  value={preparationFee || ''}
                  onChange={(e) => setPreparationFee(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#171922] border border-[#2E333F] rounded-lg text-sm text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#85878A] mb-1">
                  6. Autres charges / Assurances
                </label>
                <input
                  type="number"
                  min="0"
                  value={otherCharges || ''}
                  onChange={(e) => setOtherCharges(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#171922] border border-[#2E333F] rounded-lg text-sm text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>
            </div>

            {/* Total Cost Display Box */}
            <div className="flex items-center justify-between p-3.5 bg-[#090A0D] border border-[#2B303C] rounded-xl">
              <div>
                <span className="text-xs font-semibold text-[#85878A] uppercase tracking-wider block">
                  Coût de revient réel total calculé
                </span>
                <span className="text-[11px] text-[#555A66]">
                  Achat + Douane + Transit + Transport + Réparations + Charges
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#E50914] tracking-tight">
                  {totalCost.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1.5">
                Statut de règlement fournisseur
              </label>
              <select
                value={paymentStatus}
                onChange={(e: any) => setPaymentStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#14161C] border border-[#2A2E38] rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
              >
                <option value="Payé">Payé intégralement</option>
                <option value="Partiellement payé">Partiellement payé (Acompte versé)</option>
                <option value="En attente">En attente de règlement</option>
              </select>
            </div>

            {paymentStatus === 'Partiellement payé' && (
              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1.5">
                  Montant déjà versé (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalCost}
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-[#14161C] border border-[#2A2E38] rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#85878A] mb-1.5">
              Notes & Commentaires (Conditions de livraison, garanties, transporteur...)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations complémentaires sur l'importation..."
              className="w-full px-3.5 py-2 bg-[#14161C] border border-[#2A2E38] rounded-xl text-sm text-white placeholder-[#505460] focus:outline-none focus:border-[#E50914]"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#20242D]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-[#85878A] hover:text-white rounded-xl border border-[#2A2E38] hover:bg-[#1C1F27] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#E50914] hover:bg-[#CC0812] rounded-xl transition-all shadow-[0_0_15px_rgba(229,9,20,0.4)] flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer l’achat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
