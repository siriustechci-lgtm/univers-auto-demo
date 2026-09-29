import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Client, Sale, Rental, Payment } from '../../types';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  BadgePercent,
  KeyRound,
  CreditCard,
  Printer,
  Eye,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
} from 'lucide-react';

interface ClientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onViewDocument: (
    type: 'payment' | 'sale' | 'sale_receipt' | 'rental' | 'rental_invoice' | 'rental_receipt',
    data: { paymentData?: Payment; saleData?: Sale; rentalData?: Rental }
  ) => void;
}

export const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({
  isOpen,
  onClose,
  client,
  onViewDocument,
}) => {
  const { sales, rentals, payments, settings } = useCrm();
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'rentals' | 'payments'>('all');

  if (!isOpen || !client) return null;

  // Filter client's records
  const clientSales = sales.filter((s) => s.clientId === client.id);
  const clientRentals = rentals.filter((r) => r.clientId === client.id);
  const clientPayments = payments.filter((p) => p.clientId === client.id);

  // Financial calculations
  const totalSalesAmount = clientSales.reduce((sum, s) => sum + (s.totalAmount || s.salePrice || 0), 0);
  const totalRentalsAmount = clientRentals.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalInvoiced = totalSalesAmount + totalRentalsAmount;
  const totalPaid = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalDue = Math.max(0, totalInvoiced - totalPaid);

  const formatCurrency = (val: number) => {
    return `${val.toLocaleString('fr-FR')} ${settings.currencySymbol || '€'}`;
  };

  return (
    <div
      id="client-history-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A18]/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="client-history-modal-dialog"
        className="w-full max-w-4xl rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5DF] bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center font-bold text-base uppercase shrink-0">
              {client.fullName.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#1A1A18] font-['Outfit']">
                  Historique 360° : {client.fullName}
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    client.type === 'Entreprise'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {client.type || 'Particulier'}
                </span>
              </div>
              <p className="text-xs text-[#7A7A72]">
                Détail chronologique des ventes, locations et encaissements liés à ce client
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EBEBE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Mini-Profile & Financial Summary Banner */}
        <div className="p-5 border-b border-[#E5E5DF] bg-white grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-1 text-xs">
            <span className="text-[11px] font-bold text-[#7A7A72] uppercase tracking-wider block">
              Coordonnées
            </span>
            <div className="flex items-center gap-1.5 text-[#1A1A18]">
              <Phone className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="font-mono">{client.phone || 'Non renseigné'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#1A1A18] truncate">
              <Mail className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="truncate">{client.email || 'Non renseigné'}</span>
            </div>
            {client.city && (
              <div className="flex items-center gap-1.5 text-[#7A7A72]">
                <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>{client.city}</span>
              </div>
            )}
          </div>

          {/* CA Facturé */}
          <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-[#7A7A72] tracking-wider">
              Total Facturé (CA)
            </span>
            <span className="text-base font-extrabold text-[#1A1A18] font-['Outfit'] mt-0.5">
              {formatCurrency(totalInvoiced)}
            </span>
            <span className="text-[10px] text-[#7A7A72] mt-0.5">
              {clientSales.length} vente(s) • {clientRentals.length} location(s)
            </span>
          </div>

          {/* Total Encaissé */}
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              Total Encaissé
            </span>
            <span className="text-base font-extrabold text-emerald-900 font-['Outfit'] mt-0.5">
              {formatCurrency(totalPaid)}
            </span>
            <span className="text-[10px] text-emerald-700 mt-0.5">
              {clientPayments.length} paiement(s) reçus
            </span>
          </div>

          {/* Reste Dû */}
          <div
            className={`p-3 rounded-xl border flex flex-col justify-center ${
              totalDue > 0
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : 'bg-emerald-50/40 border-emerald-100 text-emerald-800'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {totalDue > 0 ? 'Solde Restant Dû' : 'Solde Client'}
            </span>
            <span className="text-base font-extrabold font-['Outfit'] mt-0.5">
              {totalDue > 0 ? formatCurrency(totalDue) : 'À jour (0 €)'}
            </span>
            <span className="text-[10px] mt-0.5">
              {totalDue > 0 ? 'Paiement partiel ou en attente' : 'Aucun impayé'}
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#E5E5DF] bg-[#FAFAF8] px-5 gap-4 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <span>Toutes les opérations</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#EBEBE6] text-[10px] font-mono">
              {clientSales.length + clientRentals.length + clientPayments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sales'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <BadgePercent className="w-3.5 h-3.5" />
            <span>Ventes</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#EBEBE6] text-[10px] font-mono">
              {clientSales.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rentals')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rentals'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Locations</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#EBEBE6] text-[10px] font-mono">
              {clientRentals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Paiements & Reçus</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#EBEBE6] text-[10px] font-mono">
              {clientPayments.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* SALES LIST */}
          {(activeTab === 'all' || activeTab === 'sales') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] flex items-center gap-1.5">
                  <BadgePercent className="w-4 h-4" />
                  <span>Historique des Ventes ({clientSales.length})</span>
                </h3>
              </div>

              {clientSales.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-center text-xs text-[#7A7A72]">
                  Aucune vente enregistrée pour ce client.
                </div>
              ) : (
                <div className="rounded-xl border border-[#E5E5DF] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase font-semibold border-b border-[#E5E5DF]">
                      <tr>
                        <th className="px-3.5 py-2.5">N° Vente</th>
                        <th className="px-3.5 py-2.5">Date</th>
                        <th className="px-3.5 py-2.5">Véhicule</th>
                        <th className="px-3.5 py-2.5 text-right">Montant</th>
                        <th className="px-3.5 py-2.5 text-center">Statut</th>
                        <th className="px-3.5 py-2.5 text-right">Document</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5DF]">
                      {clientSales.map((s) => (
                        <tr key={s.id} className="hover:bg-[#F9F9F6]">
                          <td className="px-3.5 py-2.5 font-mono font-bold text-[#1A1A18]">
                            {s.saleNumber}
                          </td>
                          <td className="px-3.5 py-2.5 text-[#7A7A72]">
                            {new Date(s.saleDate).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-3.5 py-2.5 font-medium text-[#1A1A18]">
                            {s.vehicleName}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono font-bold text-[#1A1A18]">
                            {formatCurrency(s.totalAmount || s.salePrice)}
                          </td>
                          <td className="px-3.5 py-2.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.paymentStatus === 'Payé'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : s.paymentStatus === 'Partiel'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {s.paymentStatus || 'Payé'}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            <button
                              onClick={() => onViewDocument('sale', { saleData: s })}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5A5A40] hover:underline cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Facture</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* RENTALS LIST */}
          {(activeTab === 'all' || activeTab === 'rentals') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>Historique des Locations ({clientRentals.length})</span>
                </h3>
              </div>

              {clientRentals.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-center text-xs text-[#7A7A72]">
                  Aucune location enregistrée pour ce client.
                </div>
              ) : (
                <div className="rounded-xl border border-[#E5E5DF] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase font-semibold border-b border-[#E5E5DF]">
                      <tr>
                        <th className="px-3.5 py-2.5">N° Contrat</th>
                        <th className="px-3.5 py-2.5">Période</th>
                        <th className="px-3.5 py-2.5">Véhicule</th>
                        <th className="px-3.5 py-2.5 text-right">Total</th>
                        <th className="px-3.5 py-2.5 text-center">Statut</th>
                        <th className="px-3.5 py-2.5 text-right">Documents</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5DF]">
                      {clientRentals.map((r) => (
                        <tr key={r.id} className="hover:bg-[#F9F9F6]">
                          <td className="px-3.5 py-2.5 font-mono font-bold text-[#1A1A18]">
                            {r.rentalNumber}
                          </td>
                          <td className="px-3.5 py-2.5 text-[#7A7A72]">
                            {new Date(r.startDate).toLocaleDateString('fr-FR')} →{' '}
                            {new Date(r.endDate).toLocaleDateString('fr-FR')} ({r.durationDays}j)
                          </td>
                          <td className="px-3.5 py-2.5 font-medium text-[#1A1A18]">
                            {r.vehicleName}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono font-bold text-[#1A1A18]">
                            {formatCurrency(r.totalAmount)}
                          </td>
                          <td className="px-3.5 py-2.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'En cours'
                                  ? 'bg-blue-50 text-blue-700'
                                  : r.status === 'Terminée'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 text-right space-x-2">
                            <button
                              onClick={() => onViewDocument('rental', { rentalData: r })}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5A5A40] hover:underline cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Contrat</span>
                            </button>
                            <button
                              onClick={() => onViewDocument('rental_invoice', { rentalData: r })}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5A5A40] hover:underline cursor-pointer"
                            >
                              <span>Facture</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PAYMENTS LIST */}
          {(activeTab === 'all' || activeTab === 'payments') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Historique des Paiements Reçus ({clientPayments.length})</span>
                </h3>
              </div>

              {clientPayments.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-center text-xs text-[#7A7A72]">
                  Aucun paiement enregistré pour ce client.
                </div>
              ) : (
                <div className="rounded-xl border border-[#E5E5DF] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase font-semibold border-b border-[#E5E5DF]">
                      <tr>
                        <th className="px-3.5 py-2.5">N° Reçu</th>
                        <th className="px-3.5 py-2.5">Date</th>
                        <th className="px-3.5 py-2.5">Mode</th>
                        <th className="px-3.5 py-2.5 text-right">Montant Encaissé</th>
                        <th className="px-3.5 py-2.5 text-right">Reçu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5DF]">
                      {clientPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-[#F9F9F6]">
                          <td className="px-3.5 py-2.5 font-mono font-bold text-[#1A1A18]">
                            {p.paymentNumber}
                          </td>
                          <td className="px-3.5 py-2.5 text-[#7A7A72]">
                            {new Date(p.paymentDate).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-3.5 py-2.5 font-medium text-[#1A1A18]">
                            {p.paymentMethod}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono font-bold text-emerald-700">
                            +{formatCurrency(p.amount)}
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            <button
                              onClick={() => onViewDocument('payment', { paymentData: p })}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5A5A40] hover:underline cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Voir Reçu</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E5DF] bg-[#FAFAF8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#EBEBE6] hover:bg-[#E0E0D8] text-[#1A1A18] font-semibold text-xs transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
