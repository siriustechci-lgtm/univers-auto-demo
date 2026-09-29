import React, { useRef } from 'react';
import { useCrm } from '../context/CrmContext';
import { useAuth } from '../context/AuthContext';
import { Invoice, Payment } from '../types';
import { BaneServicesLogo } from './common/BaneServicesLogo';
import { BANESERVICES_LOGO_DATA_URI } from '../assets/logo';
import {
  X,
  Printer,
  Download,
  Share2,
  Mail,
  MessageSquare,
  CreditCard,
  Building2,
  User,
  Car,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Shield,
  Receipt,
  ArrowRight,
} from 'lucide-react';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onOpenPaymentModal?: (saleId?: string, rentalId?: string, clientName?: string, amount?: number) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onOpenPaymentModal,
}) => {
  const { settings, vehicles, clients, payments, sales, rentals } = useCrm();
  const { companyProfile } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const vehicle = vehicles.find((v) => v.id === invoice.vehicleId);
  const client = clients.find((c) => c.id === invoice.clientId);

  const linkedSale = invoice.type === 'Vente' ? sales.find((s) => s.id === invoice.referenceId) : null;
  const linkedRental = invoice.type === 'Location' ? rentals.find((r) => r.id === invoice.referenceId) : null;

  const companyName = companyProfile?.name || settings.companyName || 'BANESERVICES AUTO';
  const logoSrc = companyProfile?.logoUrl || settings.logoUrl || BANESERVICES_LOGO_DATA_URI;

  // Find linked payments
  const linkedPayments = payments.filter((p) => {
    if (invoice.type === 'Vente' && p.referenceType === 'sale' && p.referenceId === invoice.referenceId) return true;
    if (invoice.type === 'Location' && p.referenceType === 'rental' && p.referenceId === invoice.referenceId) return true;
    return false;
  });

  const handlePrint = () => {
    window.print();
  };

  // WhatsApp formatted share message
  const handleShareWhatsApp = () => {
    const rawPhone = invoice.clientPhone || client?.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    
    const message = `Bonjour ${invoice.clientName},\n\nVoici le récapitulatif de votre Facture N° *${invoice.invoiceNumber}* chez *${settings.companyName || 'Sirius Auto'}* :\n\n` +
      `🚗 *Véhicule :* ${invoice.vehicleName} (${invoice.vehicleRegistration})\n` +
      `📋 *Type :* ${invoice.type === 'Vente' ? 'Vente de véhicule' : 'Location de véhicule'}\n` +
      `📅 *Date :* ${new Date(invoice.date).toLocaleDateString('fr-FR')}\n` +
      `💰 *Montant Total :* ${invoice.totalAmount.toLocaleString('fr-FR')} ${settings.currencySymbol}\n` +
      `💳 *Montant Réglé :* ${invoice.amountPaid.toLocaleString('fr-FR')} ${settings.currencySymbol}\n` +
      `⚠️ *Solde Dû :* ${invoice.balanceDue.toLocaleString('fr-FR')} ${settings.currencySymbol}\n` +
      `📌 *Statut :* ${invoice.status.toUpperCase()}\n\n` +
      `Pour toute question, contactez-nous au ${settings.phone || ''}.\nMerci pour votre confiance !`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      : `https://api.whatsapp.com/send?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  // Email formatted share
  const handleShareEmail = () => {
    const recipientEmail = invoice.clientEmail || client?.email || '';
    const subject = encodeURIComponent(`Facture N° ${invoice.invoiceNumber} — ${settings.companyName || 'Sirius Auto'}`);
    const body = encodeURIComponent(
      `Madame, Monsieur ${invoice.clientName},\n\n` +
      `Veuillez trouver ci-dessous les détails relatifs à votre facture ${invoice.invoiceNumber} émise par ${settings.companyName || 'Sirius Auto'}.\n\n` +
      `DÉTAILS DE L'OPÉRATION :\n` +
      `- Numéro de Facture : ${invoice.invoiceNumber}\n` +
      `- Date d'émission : ${new Date(invoice.date).toLocaleDateString('fr-FR')}\n` +
      `- Type : ${invoice.type === 'Vente' ? 'Vente définitive de véhicule' : 'Contrat de location de véhicule'}\n` +
      `- Véhicule concerné : ${invoice.vehicleName} (Immatriculation : ${invoice.vehicleRegistration})\n` +
      `- Montant Total TTC : ${invoice.totalAmount.toLocaleString('fr-FR')} ${settings.currencySymbol}\n` +
      `- Total Encaissé : ${invoice.amountPaid.toLocaleString('fr-FR')} ${settings.currencySymbol}\n` +
      `- Solde restant dû : ${invoice.balanceDue.toLocaleString('fr-FR')} ${settings.currencySymbol}\n` +
      `- Statut : ${invoice.status}\n\n` +
      `Pour toute information complémentaire ou pour procéder au règlement, vous pouvez nous joindre par téléphone au ${settings.phone || ''} ou par retour d'email.\n\n` +
      `Cordialement,\n` +
      `${settings.companyName || 'Sirius Auto CRM'}\n` +
      `${settings.address || ''} - ${settings.city || ''}\n` +
      `Tél : ${settings.phone || ''}`
    );

    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  };

  // Status Badge Helper
  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'Payée':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          stamp: 'border-emerald-600 text-emerald-600',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          label: 'PAYÉE',
        };
      case 'Partiellement payée':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          stamp: 'border-amber-600 text-amber-600',
          icon: <Clock className="w-4 h-4 text-amber-600" />,
          label: 'PARTIELLEMENT PAYÉE',
        };
      case 'En attente':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          stamp: 'border-blue-600 text-blue-600',
          icon: <AlertCircle className="w-4 h-4 text-blue-600" />,
          label: 'EN ATTENTE DE RÈGLEMENT',
        };
      case 'Annulée':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          stamp: 'border-rose-600 text-rose-600',
          icon: <XCircle className="w-4 h-4 text-rose-600" />,
          label: 'ANNULÉE',
        };
      default:
        return {
          bg: 'bg-neutral-100 text-neutral-800 border-neutral-300',
          stamp: 'border-neutral-500 text-neutral-500',
          icon: <FileText className="w-4 h-4" />,
          label: status,
        };
    }
  };

  const statusConfig = getStatusBadge(invoice.status);

  return (
    <div
      id="invoice-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white"
    >
      <div
        id="invoice-modal-dialog"
        className="w-full max-w-4xl rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden my-4 sm:my-8 print:border-none print:shadow-none print:my-0 print:bg-white text-[#2D2D2A] print:text-black"
      >
        {/* ================= MODAL TOP ACTION BAR (Hidden in print) ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6 border-b border-[#E5E5DF] bg-[#FAFAF8] print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-[#1A1A18] font-['Outfit']">
                  Facture {invoice.invoiceNumber}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusConfig.bg}`}
                >
                  {statusConfig.icon}
                  {invoice.status}
                </span>
              </div>
              <p className="text-xs text-[#7A7A72]">
                {invoice.type === 'Vente' ? 'Facture de vente définitive' : 'Facture de location'} — Émise le{' '}
                {new Date(invoice.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Direct Pay Action if balance due */}
            {invoice.balanceDue > 0 && invoice.status !== 'Annulée' && onOpenPaymentModal && (
              <button
                id="invoice-action-pay"
                onClick={() => {
                  onClose();
                  onOpenPaymentModal(
                    invoice.type === 'Vente' ? invoice.referenceId : undefined,
                    invoice.type === 'Location' ? invoice.referenceId : undefined,
                    invoice.clientName,
                    invoice.balanceDue
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                title="Enregistrer un encaissement"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Encaisser ({invoice.balanceDue.toLocaleString('fr-FR')} {settings.currencySymbol})</span>
              </button>
            )}

            {/* WhatsApp */}
            <button
              id="invoice-action-whatsapp"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
              title="Envoyer le récapitulatif par WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Email */}
            <button
              id="invoice-action-email"
              onClick={handleShareEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
              title="Envoyer la facture par Email"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Email</span>
            </button>

            {/* Print / PDF */}
            <button
              id="invoice-action-print"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
              title="Imprimer ou enregistrer en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>

            {/* Close */}
            <button
              id="invoice-action-close"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EBEBE6] transition-colors cursor-pointer ml-1"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= PRINTABLE A4 INVOICE SHEET ================= */}
        <div
          ref={printRef}
          id="invoice-printable-sheet"
          className="p-6 sm:p-10 md:p-12 space-y-8 bg-white print:p-0 print:space-y-6 text-xs sm:text-sm font-sans"
        >
          {/* Header: Company & Invoice Metadata */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-[#1A1A18] pb-6">
            <div className="flex items-start gap-4 max-w-md">
              <div className="w-24 h-16 sm:w-28 sm:h-20 shrink-0 p-1 border border-[#E5E5DF] rounded-xl bg-white flex items-center justify-center">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={companyName}
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <BaneServicesLogo variant="full" className="w-full h-full" alt={companyName} />
                )}
              </div>
              <div className="space-y-1">
                <div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#1A1A18] uppercase font-['Outfit']">
                    {companyName}
                  </h1>
                  <p className="text-[11px] text-[#7A7A72] font-semibold tracking-wide uppercase">
                    {companyProfile?.legalInfo || settings.legalStatus || 'Agence Automobile & Vente'}
                  </p>
                </div>

                <div className="text-xs text-[#5A5A52] pt-1 space-y-0.5">
                  {(companyProfile?.rccm || settings.siretOrTaxId) && (
                    <p className="font-mono text-[11px]">
                      <span className="font-semibold text-[#1A1A18]">RCCM / NIF :</span> {companyProfile?.rccm || settings.siretOrTaxId}
                    </p>
                  )}
                  <p>
                    {(companyProfile?.address || settings.address) && `${companyProfile?.address || settings.address}, `}
                    {settings.postalCode} {companyProfile?.city || settings.city}
                  </p>
                  <p>
                    <span className="font-medium text-[#1A1A18]">Tél :</span> {companyProfile?.phone || settings.phone || 'Non renseigné'}
                    {(companyProfile?.email || settings.email) && ` — Email : ${companyProfile?.email || settings.email}`}
                  </p>
                  {(companyProfile?.website || settings.website) && (
                    <p className="text-[11px] text-[#5A5A40] font-medium">{companyProfile?.website || settings.website}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Invoice Box */}
            <div className="sm:text-right space-y-2 self-stretch sm:self-auto flex flex-col items-start sm:items-end justify-between">
              <div className="space-y-1">
                <div className="inline-block px-3 py-1 bg-[#1A1A18] text-white rounded-md text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                  FACTURE {invoice.type === 'Vente' ? 'DE VENTE' : 'DE LOCATION'}
                </div>
                <div className="text-base sm:text-lg font-mono font-black text-[#1A1A18]">
                  N° {invoice.invoiceNumber}
                </div>
              </div>

              <div className="text-xs text-[#5A5A52] space-y-1 bg-[#FAFAF8] p-2.5 rounded-lg border border-[#E5E5DF] sm:w-56">
                <div className="flex justify-between">
                  <span className="text-[#7A7A72]">Date d'émission :</span>
                  <span className="font-bold text-[#1A1A18]">
                    {new Date(invoice.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-[#7A7A72]">Échéance :</span>
                    <span className="font-bold text-[#1A1A18]">
                      {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-[#E5E5DF]">
                  <span className="text-[#7A7A72]">Statut :</span>
                  <span className="font-bold text-[#1A1A18]">{invoice.status}</span>
                </div>
              </div>

              {/* Visual Status Stamp in Document */}
              <div
                className={`hidden sm:inline-block px-3 py-1 border-2 border-dashed rounded-lg font-black text-xs uppercase tracking-widest ${statusConfig.stamp}`}
              >
                {statusConfig.label}
              </div>
            </div>
          </div>

          {/* Client & Transaction Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Facturé à / Client */}
            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-2">
              <span className="text-[10px] font-extrabold text-[#5A5A40] uppercase tracking-wider block">
                Facturé à (Client) :
              </span>
              <div className="space-y-1 text-xs">
                <div className="text-sm font-bold text-[#1A1A18]">
                  {client
                    ? client.type === 'entreprise' && client.companyName
                      ? client.companyName
                      : `${client.firstName} ${client.lastName}`
                    : invoice.clientName}
                </div>
                {client?.type === 'entreprise' && (
                  <p className="text-[11px] text-[#7A7A72] font-medium">
                    Contact : {client.firstName} {client.lastName}
                  </p>
                )}
                <p className="text-[#5A5A52]">
                  {client?.address || invoice.clientAddress || 'Adresse non spécifiée'}
                  {(client?.city || invoice.clientCity) && ` - ${client?.city || invoice.clientCity}`}
                </p>
                <p className="text-[#5A5A52]">
                  Tél : {client?.phone || invoice.clientPhone || 'Non renseigné'}
                </p>
                {(client?.email || invoice.clientEmail) && (
                  <p className="text-[#5A5A52]">Email : {client?.email || invoice.clientEmail}</p>
                )}
                {client?.taxId && (
                  <p className="text-[11px] font-mono text-[#7A7A72]">NIF / Tax ID : {client.taxId}</p>
                )}
                {client?.drivingLicenseNumber && (
                  <p className="text-[11px] font-mono text-[#7A7A72]">
                    Permis N° : {client.drivingLicenseNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Détails du Véhicule */}
            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-2">
              <span className="text-[10px] font-extrabold text-[#5A5A40] uppercase tracking-wider block">
                Véhicule concerné :
              </span>
              <div className="space-y-1 text-xs">
                <div className="text-sm font-bold text-[#1A1A18]">
                  {vehicle ? `${vehicle.make} ${vehicle.model}` : invoice.vehicleName}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5E5DF] font-mono font-bold text-xs text-[#1A1A18]">
                    {vehicle?.registration || invoice.vehicleRegistration}
                  </span>
                  {vehicle?.year && (
                    <span className="text-xs text-[#7A7A72]">Année {vehicle.year}</span>
                  )}
                </div>
                {vehicle?.vin && (
                  <p className="text-[11px] font-mono text-[#7A7A72]">N° Châssis (VIN) : {vehicle.vin}</p>
                )}
                {vehicle?.mileage !== undefined && (
                  <p className="text-xs text-[#5A5A52]">
                    Kilométrage : {vehicle.mileage.toLocaleString('fr-FR')} km
                  </p>
                )}
                {vehicle?.fuel && (
                  <p className="text-xs text-[#5A5A52]">
                    Carburant : {vehicle.fuel} {vehicle.transmission && `— Boîte ${vehicle.transmission}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Table of Invoiced Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1A1A18]">
              Désignation des prestations & Véhicule
            </h3>
            <div className="rounded-xl border border-[#E5E5DF] overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAFAF8] border-b border-[#E5E5DF] text-[#5A5A40] font-bold">
                    <th className="p-3">Désignation</th>
                    <th className="p-3 text-center">Qté / Durée</th>
                    <th className="p-3 text-right">Prix Unitaire HT</th>
                    <th className="p-3 text-right">Taux TVA</th>
                    <th className="p-3 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DF]">
                  {invoice.type === 'Vente' ? (
                    <tr>
                      <td className="p-3">
                        <div className="font-bold text-[#1A1A18]">{invoice.vehicleName}</div>
                        <div className="text-[11px] text-[#7A7A72]">
                          Vente définitive — Immatriculation : {invoice.vehicleRegistration}
                        </div>
                      </td>
                      <td className="p-3 text-center font-medium">1 unité</td>
                      <td className="p-3 text-right font-mono">
                        {invoice.subtotal.toLocaleString('fr-FR')} {settings.currencySymbol}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {invoice.taxRate > 0 ? `${invoice.taxRate}%` : '0%'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#1A1A18]">
                        {invoice.subtotal.toLocaleString('fr-FR')} {settings.currencySymbol}
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td className="p-3">
                        <div className="font-bold text-[#1A1A18]">
                          Location véhicule {invoice.vehicleName}
                        </div>
                        <div className="text-[11px] text-[#7A7A72]">
                          Période : {linkedRental?.startDate ? new Date(linkedRental.startDate).toLocaleDateString('fr-FR') : ''} au{' '}
                          {linkedRental?.endDate ? new Date(linkedRental.endDate).toLocaleDateString('fr-FR') : ''}
                        </div>
                      </td>
                      <td className="p-3 text-center font-medium">
                        {linkedRental?.durationDays || 1} jour(s)
                      </td>
                      <td className="p-3 text-right font-mono">
                        {linkedRental?.dailyRate ? linkedRental.dailyRate.toLocaleString('fr-FR') : invoice.subtotal.toLocaleString('fr-FR')}{' '}
                        {settings.currencySymbol}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {invoice.taxRate > 0 ? `${invoice.taxRate}%` : 'Exonéré'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#1A1A18]">
                        {invoice.subtotal.toLocaleString('fr-FR')} {settings.currencySymbol}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            {/* Payment Details & Bank coordinates */}
            <div className="w-full sm:w-1/2 space-y-3">
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs space-y-2">
                <span className="font-bold text-[#1A1A18] block uppercase text-[11px] tracking-wider">
                  Modalités de Règlement :
                </span>
                <p className="text-[#5A5A52]">
                  {invoice.paymentMethod ? `Mode principal : ${invoice.paymentMethod}` : 'Virement, Chèque, Espèces, Carte bancaire'}
                </p>
                {settings.bankDetails && (
                  <div className="pt-1 border-t border-[#E5E5DF]">
                    <span className="font-semibold text-[#1A1A18] block text-[11px]">Coordonnées bancaires (RIB/IBAN) :</span>
                    <p className="font-mono text-[11px] text-[#5A5A52] whitespace-pre-line">{settings.bankDetails}</p>
                  </div>
                )}
                {settings.iban && (
                  <p className="font-mono text-[11px] text-[#5A5A52]">
                    <span className="font-semibold">IBAN :</span> {settings.iban}
                  </p>
                )}
              </div>

              {/* Linked payments list if any */}
              {linkedPayments.length > 0 && (
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs space-y-1.5">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Historique des versements ({linkedPayments.length}) :</span>
                  </div>
                  <div className="space-y-1">
                    {linkedPayments.map((p) => (
                      <div key={p.id} className="flex justify-between text-[11px] text-emerald-800">
                        <span>
                          {p.paymentNumber} — {new Date(p.paymentDate).toLocaleDateString('fr-FR')} ({p.paymentMethod})
                        </span>
                        <span className="font-bold font-mono">
                          +{p.amount.toLocaleString('fr-FR')} {settings.currencySymbol}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Totals Calculation Box */}
            <div className="w-full sm:w-72 space-y-2 sm:ml-auto">
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-2 text-xs">
                <div className="flex justify-between text-[#5A5A52]">
                  <span>Total HT :</span>
                  <span className="font-mono font-semibold">
                    {invoice.subtotal.toLocaleString('fr-FR')} {settings.currencySymbol}
                  </span>
                </div>

                <div className="flex justify-between text-[#5A5A52]">
                  <span>TVA / Taxes ({invoice.taxRate}%) :</span>
                  <span className="font-mono font-semibold">
                    {invoice.taxAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                  </span>
                </div>

                {invoice.depositAmount !== undefined && invoice.depositAmount > 0 && (
                  <div className="flex justify-between text-blue-700 pt-1 border-t border-[#E5E5DF]">
                    <span>Caution de garantie :</span>
                    <span className="font-mono font-semibold">
                      {invoice.depositAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-extrabold text-[#1A1A18] pt-2 border-t-2 border-[#1A1A18]">
                  <span>TOTAL GÉNÉRAL TTC :</span>
                  <span className="font-mono">
                    {invoice.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-800 pt-1">
                  <span>Montant déjà versé :</span>
                  <span className="font-mono font-bold">
                    {invoice.amountPaid.toLocaleString('fr-FR')} {settings.currencySymbol}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-black text-rose-700 pt-2 border-t border-[#E5E5DF]">
                  <span>RESTE À PAYER :</span>
                  <span className="font-mono">
                    {invoice.balanceDue.toLocaleString('fr-FR')} {settings.currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Legal Footer */}
          <div className="pt-6 border-t border-[#E5E5DF] space-y-4">
            {invoice.notes && (
              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900">
                <span className="font-bold block mb-0.5">Observations particulières :</span>
                <p>{invoice.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="border border-[#E5E5DF] rounded-xl p-3 text-[11px] text-[#7A7A72] h-28 flex flex-col justify-between">
                <span className="font-bold text-[#1A1A18]">Bon pour accord et règlement (Client) :</span>
                <span className="text-[10px] text-neutral-400 italic">Signature précédée de la mention "Lu et approuvé"</span>
              </div>
              <div className="border border-[#E5E5DF] rounded-xl p-3 text-[11px] text-[#7A7A72] h-28 flex flex-col justify-between text-right">
                <span className="font-bold text-[#1A1A18]">Cachet et Signature de l'agence :</span>
                <span className="font-extrabold text-[#5A5A40] text-xs uppercase">{settings.companyName || 'SIRIUS AUTO'}</span>
              </div>
            </div>

            {/* Configured invoice footer */}
            <div className="text-center text-[10px] text-[#7A7A72] pt-4 space-y-1">
              <p>{settings.invoiceFooter || 'Merci pour votre confiance. Sirius Auto CRM — Tous droits réservés.'}</p>
              {settings.rentalTerms && invoice.type === 'Location' && (
                <p className="text-[9px] text-neutral-400 italic">
                  Contrat soumis aux conditions générales de location de véhicules Sirius Auto.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
