import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Payment, PaymentStatus } from '../types';
import { SendWhatsAppModal } from './SendWhatsAppModal';
import {
  X,
  CreditCard,
  Calendar,
  User,
  Building,
  Printer,
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Smartphone,
  Phone,
  MessageSquare,
} from 'lucide-react';

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onViewDocument: (type: 'payment' | 'sale' | 'rental_invoice', data: { paymentData?: Payment; saleData?: any; rentalData?: any }) => void;
}

export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  isOpen,
  onClose,
  payment,
  onViewDocument,
}) => {
  const { clients, sales, rentals, updatePaymentStatus, deletePayment, settings } = useCrm();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  if (!isOpen || !payment) return null;

  const client = clients.find((c) => c.id === payment.clientId);
  const sale = payment.referenceType === 'sale' ? sales.find((s) => s.id === payment.referenceId) : null;
  const rental = payment.referenceType === 'rental' || payment.referenceType === 'deposit_refund'
    ? rentals.find((r) => r.id === payment.referenceId)
    : null;

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'Payé':
      case 'Validé':
        return 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/30';
      case 'Partiellement payé':
      case 'Partiel':
        return 'bg-[#B87320]/10 text-[#B87320] border-[#B87320]/30';
      case 'En attente':
      case 'Brouillon':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Annulé':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Remboursé':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/30';
    }
  };

  return (
    <div
      id="payment-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1A18]/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="payment-detail-modal-dialog"
        className="w-full max-w-xl rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#2D2D2A] my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E5E5DF] bg-[#F5F5F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40] shrink-0 font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                  Détail de l'encaissement
                </h2>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-lg bg-white border border-[#E5E5DF] text-[#5A5A40]">
                  {payment.paymentNumber}
                </span>
              </div>
              <p className="text-xs text-[#7A7A72]">
                Enregistré le {new Date(payment.createdAt || payment.paymentDate).toLocaleDateString('fr-FR')}
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

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 bg-white">
          {/* Main Amount Card */}
          <div className="p-4.5 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-[#7A7A72] uppercase tracking-wider block mb-0.5">
                Montant Encaissé
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#4A7A4A] font-mono tracking-tight font-['Outfit']">
                +{payment.amount.toLocaleString('fr-FR')} {settings.currencySymbol}
              </div>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1.5">
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${getStatusColor(
                  payment.status
                )}`}
              >
                {payment.status}
              </span>
              <span className="text-xs text-[#7A7A72] font-medium">
                Mode : <strong>{payment.paymentMethod}</strong>
              </span>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Client info */}
            <div className="p-3.5 rounded-xl border border-[#E5E5DF] bg-white space-y-1.5">
              <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Client Payeur</span>
              </span>
              <div className="font-bold text-sm text-[#1A1A18]">
                {payment.clientName}
              </div>
              {payment.clientPhone && (
                <div className="text-[#7A7A72] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#5A5A40]" />
                  <span>{payment.clientPhone}</span>
                </div>
              )}
              {client?.email && (
                <div className="text-[#7A7A72] truncate">{client.email}</div>
              )}
            </div>

            {/* Date & Reference */}
            <div className="p-3.5 rounded-xl border border-[#E5E5DF] bg-white space-y-1.5">
              <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date & Motif</span>
              </span>
              <div className="font-bold text-sm text-[#1A1A18]">
                {new Date(payment.paymentDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="text-[#5A5A52] font-medium">
                {payment.referenceTitle}
              </div>
            </div>
          </div>

          {/* Associated Contract / Sale info */}
          {(sale || rental) && (
            <div className="p-3.5 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] space-y-2">
              <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider block">
                Dossier lié
              </span>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#1A1A18] block">
                    {sale ? `Vente ${sale.saleNumber}` : `Location ${rental?.rentalNumber}`}
                  </span>
                  <span className="text-[#7A7A72]">
                    Véhicule : {sale ? sale.vehicleName : rental?.vehicleName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#7A7A72] block">Montant total</span>
                  <span className="font-bold font-mono text-[#1A1A18]">
                    {(sale ? sale.totalAmount : rental?.totalAmount || 0).toLocaleString('fr-FR')} {settings.currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes if any */}
          {payment.notes && (
            <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs">
              <span className="text-[10px] font-bold text-[#7A7A72] block mb-1">Notes / Commentaires :</span>
              <p className="text-[#2D2D2A]">{payment.notes}</p>
            </div>
          )}

          {/* Quick status updater */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs">
            <span className="font-medium text-[#7A7A72]">Modifier le statut :</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['Payé', 'En attente', 'Annulé'] as PaymentStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => updatePaymentStatus(payment.id, st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs ${
                    payment.status === st
                      ? 'bg-[#5A5A40] text-white shadow-xs'
                      : 'bg-white text-[#5A5A52] border border-[#E5E5DF] hover:bg-[#F0EFEB]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Document & Print Actions */}
          <div className="pt-2 border-t border-[#E5E5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <button
              onClick={() => {
                if (window.confirm(`Supprimer définitivement l'écriture ${payment.paymentNumber} ?`)) {
                  deletePayment(payment.id);
                  onClose();
                }
              }}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer l'écriture</span>
            </button>

            <div className="flex items-center gap-2">
              {sale && (
                <button
                  onClick={() => onViewDocument('sale', { saleData: sale })}
                  className="px-3.5 py-2 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#FAFAF8] text-[#2D2D2A] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Facture Vente</span>
                </button>
              )}

              {rental && (
                <button
                  onClick={() => onViewDocument('rental_invoice', { rentalData: rental })}
                  className="px-3.5 py-2 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#FAFAF8] text-[#2D2D2A] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Facture Location</span>
                </button>
              )}

              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1E7E34] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Envoyer le reçu via WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366] fill-current" />
                <span>WhatsApp Reçu</span>
              </button>

              <button
                onClick={() => onViewDocument('payment', { paymentData: payment })}
                className="px-4 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer Reçu PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Send WhatsApp Modal */}
      <SendWhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        initialClient={client}
        initialPhone={client?.whatsapp || client?.phone || ''}
        initialCategory="paiement"
        initialTemplateCode="confirmation_paiement"
        referenceType="payment"
        referenceId={payment.id}
        referenceNumber={payment.paymentNumber}
        documentType="recu"
        paymentData={payment}
        saleData={sale || undefined}
        rentalData={rental || undefined}
      />
    </div>
  );
};
