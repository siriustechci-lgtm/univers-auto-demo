import React, { useState } from 'react';
import { Sale, Vehicle, Client } from '../types';
import { useCrm } from '../context/CrmContext';
import { SendWhatsAppModal } from './SendWhatsAppModal';
import {
  X,
  FileText,
  Printer,
  Receipt,
  Car,
  User,
  CreditCard,
  Calendar,
  Phone,
  ShieldCheck,
  Trash2,
  BadgePercent,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  onOpenInvoice: (sale: Sale) => void;
  onOpenReceipt: (sale: Sale) => void;
}

export const SaleDetailModal: React.FC<SaleDetailModalProps> = ({
  isOpen,
  onClose,
  sale,
  onOpenInvoice,
  onOpenReceipt,
}) => {
  const { vehicles, clients, deleteSale, settings } = useCrm();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  if (!isOpen || !sale) return null;

  const vehicle = vehicles.find((v) => v.id === sale.vehicleId);
  const client = clients.find((c) => c.id === sale.clientId);

  const clientName =
    client?.type === 'entreprise' && client.companyName
      ? client.companyName
      : client
      ? `${client.firstName} ${client.lastName}`
      : sale.clientName;

  const clientPhone = client?.phone || sale.clientPhone || 'Non renseigné';
  const vehicleMake = vehicle?.make || sale.vehicleMake || 'Véhicule';
  const vehicleModel = vehicle?.model || sale.vehicleModel || '';
  const vehicleRegistration = vehicle?.registration || sale.vehicleRegistration;

  const balance = Math.max(0, sale.totalAmount - sale.amountPaid);

  const statusBadges: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    Payé: {
      bg: 'bg-[#4A7A4A]/10',
      text: 'text-[#4A7A4A]',
      border: 'border-[#4A7A4A]/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    'Partiellement payé': {
      bg: 'bg-[#B87320]/10',
      text: 'text-[#B87320]',
      border: 'border-[#B87320]/30',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    Partiel: {
      bg: 'bg-[#B87320]/10',
      text: 'text-[#B87320]',
      border: 'border-[#B87320]/30',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    Brouillon: {
      bg: 'bg-[#5A5A40]/10',
      text: 'text-[#5A5A40]',
      border: 'border-[#5A5A40]/30',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    Annulé: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      border: 'border-rose-500/30',
      icon: <X className="w-3.5 h-3.5" />,
    },
  };

  const currentStatus = sale.status || sale.paymentStatus || 'Payé';
  const badgeConfig = statusBadges[currentStatus] || statusBadges['Payé'];

  const handleDelete = () => {
    if (
      window.confirm(
        `Confirmer la suppression de la vente ${sale.saleNumber} ? Le véhicule redeviendra disponible.`
      )
    ) {
      deleteSale(sale.id);
      onClose();
    }
  };

  return (
    <div
      id="sale-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A18]/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="sale-detail-dialog"
        className="w-full max-w-2xl rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 text-[#2D2D2A]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5DF] bg-[#F5F5F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A7A4A]/10 border border-[#4A7A4A]/20 flex items-center justify-center text-[#4A7A4A]">
              <BadgePercent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                  Vente {sale.saleNumber}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}
                >
                  {badgeConfig.icon}
                  <span>{currentStatus}</span>
                </span>
              </div>
              <p className="text-xs text-[#7A7A72]">
                Enregistrée le {new Date(sale.saleDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <button
            id="sale-detail-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EBEBE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
          {/* Quick Action Document Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              id="sale-detail-invoice-btn"
              onClick={() => {
                onOpenInvoice(sale);
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <FileText className="w-4 h-4" />
              <span>Facture PDF</span>
            </button>

            <button
              id="sale-detail-receipt-btn"
              onClick={() => {
                onOpenReceipt(sale);
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] border border-[#E5E5DF] font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <Receipt className="w-4 h-4 text-[#4A7A4A]" />
              <span>Reçu PDF</span>
            </button>

            <button
              id="sale-detail-whatsapp-btn"
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1E7E34] border border-[#25D366]/30 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366] fill-current" />
              <span>WhatsApp Facture</span>
            </button>
          </div>

          {/* 1. Informations générales */}
          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
            <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Informations de la Vente</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[#7A7A72] block text-[11px] mb-0.5">Numéro de vente</span>
                <span className="font-mono font-bold text-[#1A1A18]">{sale.saleNumber}</span>
              </div>
              <div>
                <span className="text-[#7A7A72] block text-[11px] mb-0.5">Date de vente</span>
                <span className="font-semibold text-[#1A1A18]">
                  {new Date(sale.saleDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div>
                <span className="text-[#7A7A72] block text-[11px] mb-0.5">Statut</span>
                <span className="font-semibold text-[#1A1A18]">{currentStatus}</span>
              </div>
            </div>
          </div>

          {/* 2. Client & Véhicule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Card */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E5DF] shadow-xs">
              <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Client</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#7A7A72] block text-[11px]">Nom / Raison Sociale</span>
                  <span className="font-bold text-[#1A1A18] text-sm">{clientName}</span>
                </div>
                <div>
                  <span className="text-[#7A7A72] block text-[11px]">Téléphone</span>
                  <span className="font-medium text-[#2D2D2A] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#7A7A72]" />
                    {clientPhone}
                  </span>
                </div>
                {client?.email && (
                  <div>
                    <span className="text-[#7A7A72] block text-[11px]">Email</span>
                    <span className="text-[#2D2D2A]">{client.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Card */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E5DF] shadow-xs">
              <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5" />
                <span>Véhicule</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  {vehicle?.photoUrl ? (
                    <img
                      src={vehicle.photoUrl}
                      alt={vehicleMake}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover border border-[#E5E5DF]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#F5F5F0] border border-[#E5E5DF] flex items-center justify-center text-[#7A7A72]">
                      <Car className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <span className="text-[#7A7A72] block text-[11px]">Marque & Modèle</span>
                    <span className="font-bold text-[#1A1A18] text-sm">
                      {vehicleMake} {vehicleModel}
                    </span>
                    <div className="font-mono text-xs font-semibold text-[#5A5A40] mt-0.5">
                      {vehicleRegistration}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Paiement */}
          <div className="p-5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
            <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Règlement & Soldes</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-3.5 rounded-lg bg-white border border-[#E5E5DF]">
                <span className="text-[11px] text-[#7A7A72] block mb-1">Montant Total</span>
                <span className="text-lg font-bold text-[#1A1A18] font-['Outfit']">
                  {sale.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                </span>
                <span className="text-[10px] text-[#9A9A92] block mt-0.5">
                  HT: {sale.salePrice.toLocaleString('fr-FR')} | TVA: {sale.taxRate}%
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-[#E5E5DF]">
                <span className="text-[11px] text-[#7A7A72] block mb-1">Montant Payé</span>
                <span className="text-lg font-bold text-[#4A7A4A] font-['Outfit']">
                  {sale.amountPaid.toLocaleString('fr-FR')} {settings.currencySymbol}
                </span>
                <span className="text-[10px] text-[#7A7A72] block mt-0.5">
                  Par {sale.paymentMethod}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-[#E5E5DF]">
                <span className="text-[11px] text-[#7A7A72] block mb-1">Solde Restant</span>
                <span
                  className={`text-lg font-bold font-['Outfit'] ${
                    balance > 0 ? 'text-[#B87320]' : 'text-[#4A7A4A]'
                  }`}
                >
                  {balance.toLocaleString('fr-FR')} {settings.currencySymbol}
                </span>
                <span className="text-[10px] text-[#7A7A72] block mt-0.5">
                  {balance === 0 ? 'Intégralement soldé' : 'Reste à encaisser'}
                </span>
              </div>
            </div>

            {sale.notes && (
              <div className="text-xs text-[#7A7A72] bg-white p-3 rounded-lg border border-[#E5E5DF]">
                <span className="font-semibold text-[#2D2D2A]">Notes : </span>
                {sale.notes}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-[#E5E5DF] bg-[#F5F5F0]">
          <button
            id="sale-detail-delete-btn"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer la vente</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Send WhatsApp Modal */}
      <SendWhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        initialClient={client}
        initialPhone={clientPhone}
        initialCategory="vente"
        initialTemplateCode="confirmation_vente"
        referenceType="sale"
        referenceId={sale.id}
        referenceNumber={sale.saleNumber}
        documentType="facture"
        saleData={sale}
      />
    </div>
  );
};
