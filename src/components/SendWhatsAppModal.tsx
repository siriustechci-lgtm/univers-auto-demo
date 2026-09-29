import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { WhatsAppMessage, MessageTemplate, Client, Sale, Rental, Payment } from '../types';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  User,
} from 'lucide-react';

interface SendWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClient?: Client | null;
  initialPhone?: string;
  initialCategory?: WhatsAppMessage['messageCategory'];
  initialTemplateCode?: string;
  initialContent?: string;
  referenceType?: WhatsAppMessage['referenceType'];
  referenceId?: string;
  referenceNumber?: string;
  documentType?: WhatsAppMessage['documentType'];
  saleData?: Sale | null;
  rentalData?: Rental | null;
  paymentData?: Payment | null;
}

export const SendWhatsAppModal: React.FC<SendWhatsAppModalProps> = ({
  isOpen,
  onClose,
  initialClient,
  initialPhone,
  initialCategory = 'general',
  initialTemplateCode,
  initialContent,
  referenceType,
  referenceId,
  referenceNumber,
  documentType,
  saleData,
  rentalData,
  paymentData,
}) => {
  const { clients, settings, templates, whatsAppConfig, sendWhatsAppMessage, addToast } = useCrm();

  const [selectedClientId, setSelectedClientId] = useState<string>(initialClient?.id || '');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<WhatsAppMessage['messageCategory']>(initialCategory);
  const [selectedTemplateCode, setSelectedTemplateCode] = useState<string>(initialTemplateCode || '');
  const [messageContent, setMessageContent] = useState<string>('');
  const [includeDocNotice, setIncludeDocNotice] = useState<boolean>(true);
  const [selectedDocType, setSelectedDocType] = useState<WhatsAppMessage['documentType']>(documentType);

  // Initialize data on modal open
  useEffect(() => {
    if (isOpen) {
      if (initialClient) {
        setSelectedClientId(initialClient.id);
        setPhoneNumber(initialClient.whatsapp || initialClient.phone || '');
      } else if (saleData) {
        setSelectedClientId(saleData.clientId);
        setPhoneNumber(saleData.clientPhone || '');
      } else if (rentalData) {
        setSelectedClientId(rentalData.clientId);
        setPhoneNumber(rentalData.clientPhone || '');
      } else if (paymentData) {
        setSelectedClientId(paymentData.clientId);
        const cli = clients.find((c) => c.id === paymentData.clientId);
        setPhoneNumber(cli?.whatsapp || cli?.phone || '');
      } else if (initialPhone) {
        setPhoneNumber(initialPhone);
      }

      if (initialCategory) {
        setSelectedCategory(initialCategory);
      }

      if (initialTemplateCode) {
        setSelectedTemplateCode(initialTemplateCode);
      } else {
        // Auto-select template based on category / context
        if (saleData) {
          setSelectedTemplateCode('confirmation_vente');
          setSelectedCategory('vente');
        } else if (rentalData) {
          setSelectedTemplateCode('confirmation_location');
          setSelectedCategory('location');
        } else if (paymentData) {
          setSelectedTemplateCode('confirmation_paiement');
          setSelectedCategory('paiement');
        } else {
          setSelectedTemplateCode('bienvenue');
        }
      }

      if (documentType) {
        setSelectedDocType(documentType);
      }
    }
  }, [isOpen, initialClient, initialPhone, initialCategory, initialTemplateCode, saleData, rentalData, paymentData, documentType, clients]);

  // Resolve template variables with real CRM context
  const resolveTemplateText = (templateText: string): string => {
    const currentClient = clients.find((c) => c.id === selectedClientId) || initialClient;
    const clientName = currentClient
      ? currentClient.type === 'entreprise' && currentClient.companyName
        ? currentClient.companyName
        : `${currentClient.firstName} ${currentClient.lastName}`
      : 'Client';

    const companyName = settings.companyName || 'Sirius Auto';
    const companyPhone = settings.phone || settings.whatsapp || '+33 1 00 00 00 00';
    const companyAddress = `${settings.address || ''}, ${settings.city || ''}`.trim() || 'Agence Principale';
    const companyWebsite = settings.website || 'www.siriusauto.com';

    let vehicleName = 'Véhicule';
    let vehicleRegistration = 'En attente';
    let invoiceNumber = referenceNumber || 'Facture';
    let rentalNumber = referenceNumber || 'Contrat';
    let amount = '0 ' + settings.currencySymbol;
    let amountPaid = '0 ' + settings.currencySymbol;
    let balance = '0 ' + settings.currencySymbol;
    let depositAmount = '0 ' + settings.currencySymbol;
    let startDate = 'Date de départ';
    let endDate = 'Date de retour';
    let duration = '1';
    let mileageDeparture = '0';
    let paymentAmount = '0 ' + settings.currencySymbol;
    let paymentMethod = 'Virement';
    let referenceTitle = 'Dossier automobile';
    let receiptNumber = referenceNumber || 'Reçu';
    let paymentDate = new Date().toLocaleDateString('fr-FR');

    if (saleData) {
      vehicleName = saleData.vehicleName || `${saleData.vehicleMake || ''} ${saleData.vehicleModel || ''}`.trim();
      vehicleRegistration = saleData.vehicleRegistration || '—';
      invoiceNumber = saleData.saleNumber;
      amount = `${saleData.totalAmount.toLocaleString('fr-FR')} ${settings.currencySymbol}`;
      amountPaid = `${saleData.amountPaid.toLocaleString('fr-FR')} ${settings.currencySymbol}`;
      balance = `${saleData.balanceDue.toLocaleString('fr-FR')} ${settings.currencySymbol}`;
      referenceTitle = `Vente ${saleData.saleNumber}`;
    }

    if (rentalData) {
      vehicleName = rentalData.vehicleName;
      vehicleRegistration = rentalData.vehicleRegistration || '—';
      rentalNumber = rentalData.rentalNumber;
      amount = `${rentalData.totalAmount.toLocaleString('fr-FR')} ${settings.currencySymbol}`;
      amountPaid = `${rentalData.amountPaid.toLocaleString('fr-FR')} ${settings.currencySymbol}`;
      balance = `${rentalData.balanceDue.toLocaleString('fr-FR')} ${settings.currencySymbol}`;
      depositAmount = `${rentalData.depositAmount.toLocaleString('fr-FR')} ${settings.currencySymbol}`;
      startDate = new Date(rentalData.startDate).toLocaleDateString('fr-FR');
      endDate = new Date(rentalData.endDate).toLocaleDateString('fr-FR');
      duration = rentalData.durationDays.toString();
      mileageDeparture = rentalData.mileageDeparture.toString();
      referenceTitle = `Location ${rentalData.rentalNumber}`;
    }

    if (paymentData) {
      paymentAmount = `${paymentData.amount.toLocaleString('fr-FR')} ${settings.currencySymbol}`;
      paymentMethod = paymentData.paymentMethod;
      referenceTitle = paymentData.referenceTitle || 'Règlement facture';
      receiptNumber = paymentData.paymentNumber;
      paymentDate = new Date(paymentData.paymentDate).toLocaleDateString('fr-FR');
    }

    return templateText
      .replace(/{client_name}/g, clientName)
      .replace(/{company_name}/g, companyName)
      .replace(/{company_phone}/g, companyPhone)
      .replace(/{company_address}/g, companyAddress)
      .replace(/{company_website}/g, companyWebsite)
      .replace(/{vehicle_name}/g, vehicleName)
      .replace(/{vehicle_registration}/g, vehicleRegistration)
      .replace(/{invoice_number}/g, invoiceNumber)
      .replace(/{rental_number}/g, rentalNumber)
      .replace(/{amount}/g, amount)
      .replace(/{amount_paid}/g, amountPaid)
      .replace(/{balance}/g, balance)
      .replace(/{deposit_amount}/g, depositAmount)
      .replace(/{start_date}/g, startDate)
      .replace(/{end_date}/g, endDate)
      .replace(/{duration}/g, duration)
      .replace(/{mileage_departure}/g, mileageDeparture)
      .replace(/{payment_amount}/g, paymentAmount)
      .replace(/{payment_method}/g, paymentMethod)
      .replace(/{reference_title}/g, referenceTitle)
      .replace(/{receipt_number}/g, receiptNumber)
      .replace(/{payment_date}/g, paymentDate);
  };

  // Re-generate content when template or selected client changes
  useEffect(() => {
    if (initialContent && !selectedTemplateCode) {
      setMessageContent(initialContent);
      return;
    }

    if (selectedTemplateCode) {
      const tpl = templates.find((t) => t.code === selectedTemplateCode);
      if (tpl) {
        const resolved = resolveTemplateText(tpl.template);
        setMessageContent(resolved);
      }
    }
  }, [selectedTemplateCode, selectedClientId, saleData, rentalData, paymentData, templates]);

  // Update phone when client dropdown selection changes
  const handleClientChange = (cliId: string) => {
    setSelectedClientId(cliId);
    const cli = clients.find((c) => c.id === cliId);
    if (cli) {
      setPhoneNumber(cli.whatsapp || cli.phone || '');
    }
  };

  const handleSend = () => {
    if (!phoneNumber.trim()) {
      addToast({
        title: 'Numéro requis',
        message: 'Veuillez saisir ou sélectionner un numéro de téléphone WhatsApp valide.',
        type: 'error',
      });
      return;
    }

    if (!messageContent.trim()) {
      addToast({
        title: 'Message vide',
        message: 'Le contenu du message ne peut pas être vide.',
        type: 'error',
      });
      return;
    }

    const currentClient = clients.find((c) => c.id === selectedClientId) || initialClient;
    const clientName = currentClient
      ? currentClient.type === 'entreprise' && currentClient.companyName
        ? currentClient.companyName
        : `${currentClient.firstName} ${currentClient.lastName}`
      : 'Client';

    let finalContent = messageContent;
    if (includeDocNotice && selectedDocType) {
      const docLabel = selectedDocType === 'facture' ? 'Facture officielle' : selectedDocType === 'contrat' ? 'Contrat de location' : 'Reçu de paiement';
      const refNum = referenceNumber || (saleData?.saleNumber || rentalData?.rentalNumber || paymentData?.paymentNumber || '');
      finalContent += `\n\n📄 *Document rattaché :* ${docLabel} N° ${refNum} disponible sur votre espace ou en pièce jointe.`;
    }

    sendWhatsAppMessage({
      clientId: selectedClientId || currentClient?.id || 'cli_direct',
      clientName,
      clientPhone: phoneNumber,
      content: finalContent,
      messageCategory: selectedCategory,
      messageType: selectedTemplateCode || 'message_libre',
      referenceType: referenceType || (saleData ? 'sale' : rentalData ? 'rental' : paymentData ? 'payment' : 'client'),
      referenceId: referenceId || saleData?.id || rentalData?.id || paymentData?.id,
      referenceNumber: referenceNumber || saleData?.saleNumber || rentalData?.rentalNumber || paymentData?.paymentNumber,
      documentType: selectedDocType,
      openUrl: true,
    });

    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageContent);
    addToast({
      title: 'Message copié',
      message: 'Le texte a été copié dans votre presse-papiers.',
      type: 'info',
    });
  };

  if (!isOpen) return null;

  const currentClient = clients.find((c) => c.id === selectedClientId) || initialClient;
  const filteredTemplates = templates.filter((t) => t.category === selectedCategory || selectedCategory === 'general');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E5E5DF] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#25D366]/10 border-b border-[#25D366]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
                Envoyer un message WhatsApp
              </h2>
              <p className="text-xs text-[#5A5A50]">
                Communication directe avec vos clients à partir de données réelles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Row 1: Destinataire & Téléphone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A5A50] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#25D366]" />
                Client destinataire
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] focus:outline-hidden transition-all"
              >
                <option value="">-- Sélectionner un client réel --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.type === 'entreprise' && c.companyName ? c.companyName : `${c.firstName} ${c.lastName}`} ({c.phone || 'Sans tél.'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A5A50] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                Numéro WhatsApp
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: +33 6 12 34 56 78 ou 0612345678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] focus:outline-hidden transition-all font-mono"
              />
            </div>
          </div>

          {/* Row 2: Catégorie & Modèle pré-défini */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A5A50] mb-1.5">
                Catégorie de communication
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const cat = e.target.value as WhatsAppMessage['messageCategory'];
                  setSelectedCategory(cat);
                  const firstMatching = templates.find((t) => t.category === cat);
                  if (firstMatching) {
                    setSelectedTemplateCode(firstMatching.code);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] focus:outline-hidden transition-all"
              >
                <option value="vente">Vente & Facture</option>
                <option value="location">Location & Contrat</option>
                <option value="paiement">Paiement & Reçu</option>
                <option value="general">Général & Accueil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A5A50] mb-1.5 flex items-center justify-between">
                <span>Modèle de message</span>
                <span className="text-[10px] text-[#25D366] font-bold">Auto-remplissage</span>
              </label>
              <select
                value={selectedTemplateCode}
                onChange={(e) => setSelectedTemplateCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] focus:outline-hidden transition-all font-medium"
              >
                <option value="">-- Message libre personnalisé --</option>
                {filteredTemplates.map((t) => (
                  <option key={t.id} value={t.code}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reference Banner if associated with a sale/rental/payment */}
          {(saleData || rentalData || paymentData || referenceNumber) && (
            <div className="p-3 bg-[#FAFAF8] rounded-2xl border border-[#E5E5DF] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#5A5A40]">
                <FileText className="w-4 h-4 text-[#25D366]" />
                <span className="font-medium text-[#2D2D2A]">
                  Dossier lié :{' '}
                  <strong className="font-semibold">
                    {referenceNumber || saleData?.saleNumber || rentalData?.rentalNumber || paymentData?.paymentNumber}
                  </strong>
                  {saleData && ` (Vente • ${saleData.vehicleName})`}
                  {rentalData && ` (Location • ${rentalData.vehicleName})`}
                  {paymentData && ` (Paiement ${paymentData.amount.toLocaleString('fr-FR')} ${settings.currencySymbol})`}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#25D366]/10 text-[#1E7E34] text-[10px] font-bold uppercase tracking-wider">
                Données réelles
              </span>
            </div>
          )}

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#5A5A50] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#25D366]" />
                Texte du message WhatsApp (variables résolues en direct)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-[#7A7A72] hover:text-[#1A1A18] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                Copier
              </button>
            </div>

            <textarea
              rows={8}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Écrivez votre message WhatsApp ici..."
              className="w-full p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] focus:outline-hidden transition-all resize-y leading-relaxed font-sans"
            />
            <div className="flex items-center justify-between mt-1 text-[11px] text-[#9A9A92]">
              <span>*Texte en gras*, _texte en italique_ supportés par WhatsApp</span>
              <span>{messageContent.length} caractères</span>
            </div>
          </div>

          {/* Document Attachment toggle */}
          <div className="p-3.5 rounded-2xl bg-[#F0EFEB]/60 border border-[#E5E5DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#2D2D2A]">
              <input
                type="checkbox"
                checked={includeDocNotice}
                onChange={(e) => setIncludeDocNotice(e.target.checked)}
                className="w-4 h-4 rounded-md text-[#25D366] focus:ring-[#25D366] border-[#D5D5CF]"
              />
              <span>Ajouter la mention officielle du document rattaché (PDF)</span>
            </label>

            {includeDocNotice && (
              <select
                value={selectedDocType || ''}
                onChange={(e) => setSelectedDocType(e.target.value as WhatsAppMessage['documentType'])}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] focus:outline-hidden"
              >
                <option value="facture">Facture officielle PDF</option>
                <option value="contrat">Contrat de location PDF</option>
                <option value="recu">Reçu de versement PDF</option>
              </select>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAFAF8] border-t border-[#E5E5DF] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E5E5DF] text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0EFEB] font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Annuler
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSend}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Ouvrir & Envoyer sur WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
