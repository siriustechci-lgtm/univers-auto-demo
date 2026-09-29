import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Client, Sale, Rental, Payment } from '../types';
import {
  X,
  User,
  Building,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  IdCard,
  Award,
  Calendar,
  CreditCard,
  FileText,
  Plus,
  Edit2,
  ExternalLink,
  DollarSign,
  TrendingUp,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  ChevronRight,
  Shield,
  FileSignature,
  Receipt,
  FileCheck,
} from 'lucide-react';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: (client: Client) => void;
  onNewSale: (clientId: string) => void;
  onNewRental: (clientId: string) => void;
  onNewPayment: (clientId: string) => void;
  onViewDocument: (
    type: 'sale' | 'sale_receipt' | 'rental' | 'rental_invoice' | 'rental_receipt' | 'payment',
    data: { saleData?: Sale; rentalData?: Rental; paymentData?: Payment }
  ) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  client,
  onEdit,
  onNewSale,
  onNewRental,
  onNewPayment,
  onViewDocument,
}) => {
  const { sales, rentals, payments, settings, vehicles } = useCrm();
  const [activeTab, setActiveTab] = useState<'apercu' | 'ventes' | 'locations' | 'paiements' | 'documents'>('apercu');

  if (!isOpen || !client) return null;

  // Retrieve all client related items
  const clientSales = sales.filter((s) => s.clientId === client.id);
  const clientRentals = rentals.filter((r) => r.clientId === client.id);
  const clientPayments = payments.filter((p) => p.clientId === client.id);

  // Financial calculations
  const totalSalesAmount = clientSales.reduce((acc, s) => acc + (s.totalAmount || s.salePrice || 0), 0);
  const totalRentalsAmount = clientRentals.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
  const totalInvoiced = totalSalesAmount + totalRentalsAmount;

  const salesPaid = clientSales.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
  const rentalsPaid = clientRentals.reduce((acc, r) => acc + (r.amountPaid || 0), 0);
  const directPayments = clientPayments
    .filter((p) => p.referenceType === 'direct')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const totalPaid = salesPaid + rentalsPaid + directPayments;
  const balanceDue = Math.max(0, totalInvoiced - totalPaid);

  const displayName =
    client.type === 'entreprise' && client.companyName
      ? client.companyName
      : `${client.firstName} ${client.lastName}`.trim();

  // Clean phone number for WhatsApp URL
  const cleanPhone = (client.whatsapp || client.phone || '').replace(/[^0-9+]/g, '');
  const cleanPhoneCall = (client.phone || '').replace(/[^0-9+]/g, '');

  const formatCurrency = (val: number) => {
    return `${val.toLocaleString('fr-FR')} ${settings.currencySymbol || '€'}`;
  };

  return (
    <div
      id="client-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1A18]/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="client-detail-dialog"
        className="w-full max-w-4xl rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-150 text-[#2D2D2A] flex flex-col max-h-[90vh]"
      >
        {/* Header with Title and Status */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5DF] bg-[#F5F5F0]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40] shrink-0 font-bold text-base">
              {client.type === 'entreprise' ? (
                <Building className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                  {displayName}
                </h2>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                    (client.status || 'Actif') === 'Actif'
                      ? 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/30'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                  }`}
                >
                  {client.status || 'Actif'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#FAFAF8] text-[#7A7A72] border border-[#E5E5DF]">
                  {client.type === 'entreprise' ? 'Compte Entreprise' : 'Particulier'}
                </span>
              </div>
              <p className="text-xs text-[#7A7A72] mt-0.5">
                Client enregistré le {new Date(client.createdAt).toLocaleDateString('fr-FR')} • Réf : {client.id}
              </p>
            </div>
          </div>

          <button
            id="client-detail-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EBEBE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="p-3 sm:p-4 bg-white border-b border-[#E5E5DF] flex items-center justify-between gap-2 overflow-x-auto">
          {/* Direct Communication Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {cleanPhoneCall && (
              <a
                href={`tel:${cleanPhoneCall}`}
                id="client-call-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAFAF8] hover:bg-[#F0EFEB] text-[#2D2D2A] border border-[#E5E5DF] text-xs font-semibold transition-colors"
                title="Appeler le client"
              >
                <Phone className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Appeler</span>
              </a>
            )}

            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                id="client-whatsapp-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4A7A4A]/10 hover:bg-[#4A7A4A]/20 text-[#4A7A4A] border border-[#4A7A4A]/30 text-xs font-semibold transition-colors"
                title="Ouvrir WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}

            {client.email && (
              <a
                href={`mailto:${client.email}`}
                id="client-email-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAFAF8] hover:bg-[#F0EFEB] text-[#2D2D2A] border border-[#E5E5DF] text-xs font-semibold transition-colors"
                title="Envoyer un email"
              >
                <Mail className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span className="hidden sm:inline">Email</span>
              </a>
            )}
          </div>

          {/* Business Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="client-quick-sale-btn"
              onClick={() => {
                onClose();
                onNewSale(client.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Nouvelle vente</span>
            </button>

            <button
              id="client-quick-rental-btn"
              onClick={() => {
                onClose();
                onNewRental(client.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B87320] hover:bg-[#9E6018] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Nouvelle location</span>
            </button>

            <button
              id="client-quick-payment-btn"
              onClick={() => {
                onClose();
                onNewPayment(client.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4A7A4A] hover:bg-[#3B633B] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Ajouter paiement</span>
            </button>

            <button
              id="client-edit-btn"
              onClick={() => {
                onClose();
                onEdit(client);
              }}
              className="p-1.5 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0EFEB] transition-colors border border-[#E5E5DF] cursor-pointer"
              title="Modifier la fiche"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI Financial & Operations Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-4 bg-[#FAFAF8] border-b border-[#E5E5DF] text-xs">
          <div className="p-3 rounded-xl bg-white border border-[#E5E5DF]">
            <span className="text-[11px] text-[#7A7A72] block mb-0.5">Ventes conclues</span>
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-sm sm:text-base text-[#1A1A18]">
                {clientSales.length}
              </span>
              <span className="text-[11px] font-semibold text-[#5A5A40]">
                {formatCurrency(totalSalesAmount)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#E5E5DF]">
            <span className="text-[11px] text-[#7A7A72] block mb-0.5">Locations souscrites</span>
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-sm sm:text-base text-[#1A1A18]">
                {clientRentals.length}
              </span>
              <span className="text-[11px] font-semibold text-[#B87320]">
                {formatCurrency(totalRentalsAmount)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#E5E5DF]">
            <span className="text-[11px] text-[#7A7A72] block mb-0.5">Total Encaissé</span>
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-sm sm:text-base text-[#4A7A4A]">
                {formatCurrency(totalPaid)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#E5E5DF]">
            <span className="text-[11px] text-[#7A7A72] block mb-0.5">Solde Restant Dû</span>
            <div className="flex items-baseline justify-between">
              <span
                className={`font-bold text-sm sm:text-base ${
                  balanceDue > 0 ? 'text-amber-600' : 'text-[#4A7A4A]'
                }`}
              >
                {formatCurrency(balanceDue)}
              </span>
              {balanceDue > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                  À régler
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#E5E5DF] bg-white overflow-x-auto text-xs">
          <button
            id="tab-btn-apercu"
            onClick={() => setActiveTab('apercu')}
            className={`pb-2.5 px-2 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'apercu'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            Informations & Coordonnées
          </button>
          <button
            id="tab-btn-ventes"
            onClick={() => setActiveTab('ventes')}
            className={`pb-2.5 px-2 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'ventes'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <span>Ventes</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E5E5DF] text-[#2D2D2A]">
              {clientSales.length}
            </span>
          </button>
          <button
            id="tab-btn-locations"
            onClick={() => setActiveTab('locations')}
            className={`pb-2.5 px-2 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'locations'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <span>Locations</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E5E5DF] text-[#2D2D2A]">
              {clientRentals.length}
            </span>
          </button>
          <button
            id="tab-btn-paiements"
            onClick={() => setActiveTab('paiements')}
            className={`pb-2.5 px-2 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'paiements'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <span>Paiements</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E5E5DF] text-[#2D2D2A]">
              {clientPayments.length}
            </span>
          </button>
          <button
            id="tab-btn-documents"
            onClick={() => setActiveTab('documents')}
            className={`pb-2.5 px-2 font-semibold transition-colors border-b-2 cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <span>Documents & Factures</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E5E5DF] text-[#2D2D2A]">
              {clientSales.length + clientRentals.length + clientPayments.length}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-white space-y-6">
          {/* TAB 1: INFORMATIONS GÉNÉRALES */}
          {activeTab === 'apercu' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Information */}
                <div className="p-4 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] space-y-3">
                  <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>Informations Générales</span>
                  </h3>

                  <div className="space-y-2.5 text-xs text-[#2D2D2A]">
                    <div className="flex items-center justify-between py-1 border-b border-[#E5E5DF]">
                      <span className="text-[#7A7A72]">Nom complet :</span>
                      <span className="font-semibold">{displayName}</span>
                    </div>

                    {client.type === 'entreprise' && (
                      <div className="flex items-center justify-between py-1 border-b border-[#E5E5DF]">
                        <span className="text-[#7A7A72]">Contact référent :</span>
                        <span className="font-semibold">{client.firstName} {client.lastName}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-1 border-b border-[#E5E5DF]">
                      <span className="text-[#7A7A72]">Téléphone :</span>
                      <a href={`tel:${cleanPhoneCall}`} className="font-semibold hover:underline text-[#5A5A40] flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{client.phone}</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-[#E5E5DF]">
                      <span className="text-[#7A7A72]">WhatsApp :</span>
                      <span className="font-semibold text-[#4A7A4A] flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{client.whatsapp || client.phone}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-[#E5E5DF]">
                      <span className="text-[#7A7A72]">Email :</span>
                      <a href={`mailto:${client.email}`} className="font-semibold hover:underline text-[#5A5A40] truncate max-w-[200px]">
                        {client.email}
                      </a>
                    </div>

                    <div className="flex items-start justify-between py-1">
                      <span className="text-[#7A7A72]">Adresse :</span>
                      <span className="font-semibold text-right max-w-[220px]">
                        {client.address ? (
                          <>
                            {client.address}
                            {client.city ? `, ${client.postalCode ? `${client.postalCode} ` : ''}${client.city}` : ''}
                          </>
                        ) : (
                          <span className="text-[#9A9A92] font-normal italic">Non renseignée</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legal & Driving License */}
                <div className="p-4 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] space-y-3">
                  <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                    <IdCard className="w-4 h-4" />
                    <span>Pièces & Permis de Conduire</span>
                  </h3>

                  <div className="space-y-2.5 text-xs text-[#2D2D2A]">
                    <div className="flex items-center justify-between py-1 border-b border-[#E5E5DF]">
                      <span className="text-[#7A7A72]">N° Permis de conduire :</span>
                      {client.drivingLicenseNumber ? (
                        <span className="font-mono font-bold text-[#5A5A40] bg-[#5A5A40]/10 px-2 py-0.5 rounded border border-[#5A5A40]/20">
                          {client.drivingLicenseNumber}
                        </span>
                      ) : (
                        <span className="text-[#9A9A92] font-normal italic">Non renseigné</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-[#E5E5DF]">
                      <span className="text-[#7A7A72]">Délivrance permis :</span>
                      <span className="font-semibold">
                        {client.drivingLicenseIssueDate ? (
                          new Date(client.drivingLicenseIssueDate).toLocaleDateString('fr-FR')
                        ) : (
                          <span className="text-[#9A9A92] font-normal italic">—</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-[#E5E5DF]">
                      <span className="text-[#7A7A72]">N° CNI / Passeport :</span>
                      {client.idCardNumber ? (
                        <span className="font-mono font-bold text-[#2D2D2A] bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                          {client.idCardNumber}
                        </span>
                      ) : (
                        <span className="text-[#9A9A92] font-normal italic">Non renseigné</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#7A7A72]">Statut du compte :</span>
                      <span
                        className={`font-semibold ${
                          (client.status || 'Actif') === 'Actif' ? 'text-[#4A7A4A]' : 'text-neutral-500'
                        }`}
                      >
                        {client.status || 'Actif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {client.notes && (
                <div className="p-4 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8]">
                  <h4 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">
                    Observations & Notes
                  </h4>
                  <p className="text-xs text-[#2D2D2A] whitespace-pre-wrap">{client.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTORIQUE DES VENTES */}
          {activeTab === 'ventes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                  Historique des Ventes ({clientSales.length})
                </h3>
                <button
                  id="client-tab-new-sale-btn"
                  onClick={() => {
                    onClose();
                    onNewSale(client.id);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouvelle Vente</span>
                </button>
              </div>

              {clientSales.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#FAFAF8] border border-dashed border-[#E5E5DF]">
                  <TrendingUp className="w-8 h-8 text-[#9A9A92] mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#2D2D2A]">Aucune vente enregistrée pour ce client</p>
                  <p className="text-[11px] text-[#7A7A72] mt-0.5">
                    Créez un dossier de vente pour assigner un véhicule à ce client.
                  </p>
                </div>
              ) : (
                <div className="border border-[#E5E5DF] rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F5F5F0] text-[#5A5A40] border-b border-[#E5E5DF]">
                          <th className="py-2.5 px-3 font-semibold">Date</th>
                          <th className="py-2.5 px-3 font-semibold">N° Vente</th>
                          <th className="py-2.5 px-3 font-semibold">Véhicule</th>
                          <th className="py-2.5 px-3 font-semibold">Montant TTC</th>
                          <th className="py-2.5 px-3 font-semibold">Payé</th>
                          <th className="py-2.5 px-3 font-semibold">Statut</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Documents</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5DF]">
                        {clientSales.map((s) => (
                          <tr key={s.id} className="hover:bg-[#FAFAF8] transition-colors">
                            <td className="py-2.5 px-3 whitespace-nowrap text-[#7A7A72]">
                              {new Date(s.saleDate).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#5A5A40] whitespace-nowrap">
                              {s.saleNumber}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-[#1A1A18]">{s.vehicleName}</div>
                              <div className="font-mono text-[10px] text-[#7A7A72]">
                                {s.vehicleRegistration}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-[#1A1A18] whitespace-nowrap">
                              {formatCurrency(s.totalAmount)}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-[#4A7A4A] whitespace-nowrap">
                              {formatCurrency(s.amountPaid)}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  s.paymentStatus === 'Payé'
                                    ? 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/30'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {s.paymentStatus}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onViewDocument('sale', { saleData: s })}
                                  className="p-1 rounded-lg hover:bg-[#E5E5DF] text-[#5A5A40] text-[11px] font-semibold flex items-center gap-1"
                                  title="Facture de vente"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Facture</span>
                                </button>
                                <button
                                  onClick={() => onViewDocument('sale_receipt', { saleData: s })}
                                  className="p-1 rounded-lg hover:bg-[#E5E5DF] text-[#4A7A4A] text-[11px] font-semibold flex items-center gap-1"
                                  title="Reçu de vente"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  <span>Reçu</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HISTORIQUE DES LOCATIONS */}
          {activeTab === 'locations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                  Historique des Locations ({clientRentals.length})
                </h3>
                <button
                  id="client-tab-new-rental-btn"
                  onClick={() => {
                    onClose();
                    onNewRental(client.id);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#B87320] hover:bg-[#9E6018] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouvelle Location</span>
                </button>
              </div>

              {clientRentals.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#FAFAF8] border border-dashed border-[#E5E5DF]">
                  <KeyRound className="w-8 h-8 text-[#9A9A92] mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#2D2D2A]">Aucune location enregistrée pour ce client</p>
                  <p className="text-[11px] text-[#7A7A72] mt-0.5">
                    Créez un contrat de location rapide pour ce client.
                  </p>
                </div>
              ) : (
                <div className="border border-[#E5E5DF] rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F5F5F0] text-[#5A5A40] border-b border-[#E5E5DF]">
                          <th className="py-2.5 px-3 font-semibold">N° Contrat</th>
                          <th className="py-2.5 px-3 font-semibold">Véhicule</th>
                          <th className="py-2.5 px-3 font-semibold">Période</th>
                          <th className="py-2.5 px-3 font-semibold">Montant Total</th>
                          <th className="py-2.5 px-3 font-semibold">Caution</th>
                          <th className="py-2.5 px-3 font-semibold">Statut</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Documents</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5DF]">
                        {clientRentals.map((r) => (
                          <tr key={r.id} className="hover:bg-[#FAFAF8] transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#B87320] whitespace-nowrap">
                              {r.rentalNumber}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-[#1A1A18]">{r.vehicleName}</div>
                              <div className="font-mono text-[10px] text-[#7A7A72]">
                                {r.vehicleRegistration}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-[#2D2D2A] whitespace-nowrap">
                              <div>{new Date(r.startDate).toLocaleDateString('fr-FR')} → {new Date(r.endDate).toLocaleDateString('fr-FR')}</div>
                              <div className="text-[10px] text-[#7A7A72] font-semibold">{r.durationDays} jour{r.durationDays > 1 ? 's' : ''}</div>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-[#1A1A18] whitespace-nowrap">
                              {formatCurrency(r.totalAmount)}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-[#7A7A72] whitespace-nowrap">
                              {formatCurrency(r.depositAmount)}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  r.status === 'En cours'
                                    ? 'bg-[#B87320]/10 text-[#B87320] border-[#B87320]/30'
                                    : r.status === 'Terminée'
                                    ? 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/30'
                                    : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onViewDocument('rental', { rentalData: r })}
                                  className="p-1 rounded-lg hover:bg-[#E5E5DF] text-[#B87320] text-[11px] font-semibold flex items-center gap-1"
                                  title="Contrat de location"
                                >
                                  <FileSignature className="w-3.5 h-3.5" />
                                  <span>Contrat</span>
                                </button>
                                <button
                                  onClick={() => onViewDocument('rental_invoice', { rentalData: r })}
                                  className="p-1 rounded-lg hover:bg-[#E5E5DF] text-[#5A5A40] text-[11px] font-semibold flex items-center gap-1"
                                  title="Facture de location"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Facture</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HISTORIQUE DES PAIEMENTS */}
          {activeTab === 'paiements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                  Historique des Règlements & Paiements ({clientPayments.length})
                </h3>
                <button
                  id="client-tab-new-payment-btn"
                  onClick={() => {
                    onClose();
                    onNewPayment(client.id);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#4A7A4A] hover:bg-[#3B633B] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enregistrer un Paiement</span>
                </button>
              </div>

              {clientPayments.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#FAFAF8] border border-dashed border-[#E5E5DF]">
                  <CreditCard className="w-8 h-8 text-[#9A9A92] mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#2D2D2A]">Aucun paiement enregistré pour ce client</p>
                  <p className="text-[11px] text-[#7A7A72] mt-0.5">
                    Enregistrez un encaissement direct, acompte ou règlement par carte / virement / espèces.
                  </p>
                </div>
              ) : (
                <div className="border border-[#E5E5DF] rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F5F5F0] text-[#5A5A40] border-b border-[#E5E5DF]">
                          <th className="py-2.5 px-3 font-semibold">Date</th>
                          <th className="py-2.5 px-3 font-semibold">N° Reçu</th>
                          <th className="py-2.5 px-3 font-semibold">Motif / Réf</th>
                          <th className="py-2.5 px-3 font-semibold">Mode de règlement</th>
                          <th className="py-2.5 px-3 font-semibold">Montant</th>
                          <th className="py-2.5 px-3 font-semibold">Statut</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Reçu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5DF]">
                        {clientPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-[#FAFAF8] transition-colors">
                            <td className="py-2.5 px-3 whitespace-nowrap text-[#7A7A72]">
                              {new Date(p.paymentDate).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#4A7A4A] whitespace-nowrap">
                              {p.paymentNumber}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-[#1A1A18]">
                              {p.referenceTitle}
                            </td>
                            <td className="py-2.5 px-3 text-[#2D2D2A] whitespace-nowrap">
                              {p.paymentMethod}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-[#4A7A4A] whitespace-nowrap">
                              {formatCurrency(p.amount)}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  p.status === 'Validé'
                                    ? 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/30'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <button
                                onClick={() => onViewDocument('payment', { paymentData: p })}
                                className="p-1 rounded-lg hover:bg-[#E5E5DF] text-[#4A7A4A] text-[11px] font-semibold inline-flex items-center gap-1"
                                title="Reçu de paiement"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Reçu</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DOCUMENTS & FACTURES */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                Tous les Documents du Client
              </h3>

              {clientSales.length === 0 && clientRentals.length === 0 && clientPayments.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#FAFAF8] border border-dashed border-[#E5E5DF]">
                  <FileCheck className="w-8 h-8 text-[#9A9A92] mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#2D2D2A]">Aucun document généré</p>
                  <p className="text-[11px] text-[#7A7A72] mt-0.5">
                    Les contrats, factures et reçus apparaîtront ici dès la création d'une opération.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Sales Invoices */}
                  {clientSales.map((s) => (
                    <div
                      key={`doc-sale-${s.id}`}
                      className="p-3.5 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] flex items-center justify-between gap-3 hover:border-[#5A5A40] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40] shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#1A1A18]">
                            Facture de vente {s.saleNumber}
                          </div>
                          <div className="text-[10px] text-[#7A7A72]">
                            {s.vehicleName} • {formatCurrency(s.totalAmount)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onViewDocument('sale', { saleData: s })}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E5DF] hover:bg-[#5A5A40] hover:text-white text-xs font-semibold text-[#2D2D2A] transition-colors cursor-pointer shrink-0"
                      >
                        Imprimer PDF
                      </button>
                    </div>
                  ))}

                  {/* Rental Contracts & Invoices */}
                  {clientRentals.map((r) => (
                    <div
                      key={`doc-rental-${r.id}`}
                      className="p-3.5 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] flex items-center justify-between gap-3 hover:border-[#B87320] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#B87320]/10 border border-[#B87320]/20 flex items-center justify-center text-[#B87320] shrink-0">
                          <FileSignature className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#1A1A18]">
                            Contrat de Location {r.rentalNumber}
                          </div>
                          <div className="text-[10px] text-[#7A7A72]">
                            {r.vehicleName} • {r.durationDays} jours
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onViewDocument('rental', { rentalData: r })}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E5DF] hover:bg-[#B87320] hover:text-white text-xs font-semibold text-[#2D2D2A] transition-colors cursor-pointer shrink-0"
                      >
                        Imprimer PDF
                      </button>
                    </div>
                  ))}

                  {/* Payments Receipts */}
                  {clientPayments.map((p) => (
                    <div
                      key={`doc-pay-${p.id}`}
                      className="p-3.5 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] flex items-center justify-between gap-3 hover:border-[#4A7A4A] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#4A7A4A]/10 border border-[#4A7A4A]/20 flex items-center justify-center text-[#4A7A4A] shrink-0">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#1A1A18]">
                            Reçu de Paiement {p.paymentNumber}
                          </div>
                          <div className="text-[10px] text-[#7A7A72]">
                            {p.referenceTitle} • {formatCurrency(p.amount)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onViewDocument('payment', { paymentData: p })}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E5DF] hover:bg-[#4A7A4A] hover:text-white text-xs font-semibold text-[#2D2D2A] transition-colors cursor-pointer shrink-0"
                      >
                        Imprimer PDF
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E5DF] bg-[#F5F5F0] flex items-center justify-between text-xs text-[#7A7A72]">
          <span>Sirius Auto CRM • Fiche Client Active</span>
          <button
            id="client-detail-close-bottom-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[#E5E5DF] bg-white text-[#2D2D2A] font-semibold hover:bg-[#EBEBE6] transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
