import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  X,
  Save,
  FileText,
  Percent,
  Building2,
  Receipt,
  CheckCircle2,
  DollarSign,
  CreditCard,
} from 'lucide-react';

interface InvoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceSettingsModal: React.FC<InvoiceSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings } = useCrm();

  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix || 'FAC-');
  const [receiptPrefix, setReceiptPrefix] = useState(settings.receiptPrefix || 'REC-');
  const [defaultVatRate, setDefaultVatRate] = useState(settings.defaultVatRate || 20);
  const [taxEnabled, setTaxEnabled] = useState(settings.taxEnabled ?? true);
  const [autoNumbering, setAutoNumbering] = useState(settings.autoNumbering ?? true);
  const [invoiceFooter, setInvoiceFooter] = useState(
    settings.invoiceFooter || 'Merci pour votre confiance. Sirius Auto CRM — Tous droits réservés.'
  );
  const [rentalTerms, setRentalTerms] = useState(
    settings.rentalTerms || 'Paiement comptant à la livraison. Le locataire s\'engage à restituer le véhicule dans son état d\'origine avec le plein de carburant.'
  );
  const [bankDetails, setBankDetails] = useState(settings.bankDetails || '');
  const [iban, setIban] = useState(settings.iban || '');
  const [bic, setBic] = useState(settings.bic || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      invoicePrefix,
      receiptPrefix,
      defaultVatRate: Number(defaultVatRate),
      taxEnabled,
      autoNumbering,
      invoiceFooter,
      rentalTerms,
      bankDetails,
      iban,
      bic,
    });
    onClose();
  };

  return (
    <div
      id="invoice-settings-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="invoice-settings-dialog"
        className="w-full max-w-2xl rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden my-6 text-[#2D2D2A]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#E5E5DF] bg-[#FAFAF8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#1A1A18] font-['Outfit']">
                Paramètres de Facturation & Documents
              </h2>
              <p className="text-xs text-[#7A7A72]">
                Configurez les préfixes, la fiscalité, les mentions légales et coordonnées bancaires
              </p>
            </div>
          </div>

          <button
            id="close-invoice-settings-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EBEBE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
          {/* Séquences et Préfixes */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4" />
              <span>Numérotation & Séquences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                  Préfixe des Factures
                </label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  placeholder="FAC-"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] font-mono text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                  Préfixe des Reçus
                </label>
                <input
                  type="text"
                  value={receiptPrefix}
                  onChange={(e) => setReceiptPrefix(e.target.value)}
                  placeholder="REC-"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] font-mono text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoNumbering}
                    onChange={(e) => setAutoNumbering(e.target.checked)}
                    className="w-4 h-4 text-[#5A5A40] rounded-sm focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#1A1A18] block">
                      Incrémentation automatique des numéros
                    </span>
                    <span className="text-[11px] text-[#7A7A72]">
                      Génère des numéros chronologiques uniques lors de chaque vente et location.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* TVA et Fiscalité */}
          <div className="space-y-4 pt-4 border-t border-[#E5E5DF]">
            <h3 className="text-xs font-extrabold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-4 h-4" />
              <span>Fiscalité & TVA</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                  Taux de TVA par défaut (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={defaultVatRate}
                  onChange={(e) => setDefaultVatRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] font-mono text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxEnabled}
                    onChange={(e) => setTaxEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#5A5A40] rounded-sm focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[#1A1A18]">
                    Appliquer la TVA sur les factures par défaut
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Coordonnées Bancaires */}
          <div className="space-y-4 pt-4 border-t border-[#E5E5DF]">
            <h3 className="text-xs font-extrabold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>Règlement & Coordonnées Bancaires (Sur Factures)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                  Coordonnées bancaires / Instructions de paiement
                </label>
                <textarea
                  rows={2}
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  placeholder="Ex : Banque X — RIB : 12345 67890 12345678901 23 ou Mobile Money : +225 07 00 00 00 00"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A18] mb-1">IBAN</label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="FR76 1234 5678 9012 3456 7890 123"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] font-mono text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A18] mb-1">BIC / SWIFT</label>
                <input
                  type="text"
                  value={bic}
                  onChange={(e) => setBic(e.target.value)}
                  placeholder="BNPAFR2X"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] font-mono text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Mentions & Conditions */}
          <div className="space-y-4 pt-4 border-t border-[#E5E5DF]">
            <h3 className="text-xs font-extrabold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>Conditions Générales & Pied de page</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Pied de page des factures (Mentions légales)
              </label>
              <textarea
                rows={2}
                value={invoiceFooter}
                onChange={(e) => setInvoiceFooter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A18] mb-1">
                Conditions contractuelles par défaut (Locations)
              </label>
              <textarea
                rows={2}
                value={rentalTerms}
                onChange={(e) => setRentalTerms(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5E5DF] text-xs font-semibold text-[#7A7A72] hover:bg-[#F0EFEB] hover:text-[#1A1A18] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les paramètres</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
