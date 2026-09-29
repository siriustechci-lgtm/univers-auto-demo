import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Sale, SaleStatus } from '../types';
import { EmptyState } from './EmptyState';
import {
  BadgePercent,
  Plus,
  Search,
  Printer,
  Trash2,
  CheckCircle2,
  Clock,
  Car,
  FileText,
  Eye,
  Receipt,
  User,
  Phone,
  AlertTriangle,
  X,
} from 'lucide-react';

interface SalesViewProps {
  onOpenSaleModal: () => void;
  onViewInvoice: (sale: Sale) => void;
  onViewReceipt: (sale: Sale) => void;
  onViewDetail: (sale: Sale) => void;
  searchQuery: string;
}

export const SalesView: React.FC<SalesViewProps> = ({
  onOpenSaleModal,
  onViewInvoice,
  onViewReceipt,
  onViewDetail,
  searchQuery,
}) => {
  const { sales, deleteSale, settings } = useCrm();
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'Payé' | 'Partiellement payé' | 'Brouillon' | 'Annulé'>('Tous');

  const activeSearch = searchQuery || localSearch;

  // Filter sales by search query and status filter
  const filteredSales = sales.filter((s) => {
    const saleStat = s.status || (s.paymentStatus === 'Partiel' ? 'Partiellement payé' : s.paymentStatus) || 'Payé';

    const matchesStatus =
      statusFilter === 'Tous'
        ? true
        : statusFilter === 'Partiellement payé'
        ? saleStat === 'Partiellement payé' || saleStat === 'Partiel'
        : saleStat === statusFilter;

    const query = activeSearch.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      s.saleNumber.toLowerCase().includes(query) ||
      s.vehicleName.toLowerCase().includes(query) ||
      s.clientName.toLowerCase().includes(query) ||
      s.vehicleRegistration.toLowerCase().includes(query) ||
      (s.clientPhone && s.clientPhone.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalAmountPaid = sales.reduce((acc, s) => acc + s.amountPaid, 0);
  const pendingAmount = Math.max(0, totalSalesRevenue - totalAmountPaid);

  const getStatusBadge = (sale: Sale) => {
    const stat: string = sale.status || sale.paymentStatus || 'Payé';
    switch (stat) {
      case 'Payé':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#4A7A4A]/10 text-[#4A7A4A] border border-[#4A7A4A]/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Payé</span>
          </span>
        );
      case 'Partiellement payé':
      case 'Partiel':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B87320]/10 text-[#B87320] border border-[#B87320]/30">
            <Clock className="w-3 h-3" />
            <span>Partiel</span>
          </span>
        );
      case 'Brouillon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/30">
            <AlertTriangle className="w-3 h-3" />
            <span>Brouillon</span>
          </span>
        );
      case 'Annulé':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/30">
            <X className="w-3 h-3" />
            <span>Annulé</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAFAF8] text-[#7A7A72] border border-[#E5E5DF]">
            <span>{stat}</span>
          </span>
        );
    }
  };

  return (
    <div id="sales-view" className="space-y-6">
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
            Vente Rapide & Facturation
          </h2>
          <p className="text-xs text-[#7A7A72]">
            {sales.length} vente{sales.length > 1 ? 's' : ''} enregistrée{sales.length > 1 ? 's' : ''} — Factures, encaissements et cessions
          </p>
        </div>

        <button
          id="sales-create-btn"
          onClick={onOpenSaleModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A7A4A] hover:bg-[#3E663E] text-white font-semibold text-sm transition-all shadow-xs active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nouvelle vente</span>
        </button>
      </div>

      {/* MANDATORY EMPTY STATE: "Aucune vente enregistrée" + Bouton "Créer une vente" */}
      {sales.length === 0 ? (
        <EmptyState
          id="empty-state-sales"
          icon={<BadgePercent className="w-8 h-8" />}
          title="Aucune vente enregistrée"
          description="Vous n'avez pas encore finalisé de vente de véhicule. Utilisez le bouton ci-dessous pour réaliser une vente complète en moins de deux minutes."
          actionText="Créer une vente"
          onAction={onOpenSaleModal}
        />
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
              <span className="text-xs text-[#7A7A72] block mb-1">Chiffre d'affaires Ventes</span>
              <span className="text-xl font-bold text-[#1A1A18] font-['Outfit']">
                {totalSalesRevenue.toLocaleString('fr-FR')} {settings.currencySymbol}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
              <span className="text-xs text-[#7A7A72] block mb-1">Total Encaissé</span>
              <span className="text-xl font-bold text-[#4A7A4A] font-['Outfit']">
                {totalAmountPaid.toLocaleString('fr-FR')} {settings.currencySymbol}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
              <span className="text-xs text-[#7A7A72] block mb-1">Solde à encaisser</span>
              <span
                className={`text-xl font-bold font-['Outfit'] ${
                  pendingAmount > 0 ? 'text-[#B87320]' : 'text-[#7A7A72]'
                }`}
              >
                {pendingAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
              </span>
            </div>
          </div>

          {/* Controls: Search Bar & Quick Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
              <input
                type="text"
                placeholder="Rechercher par N° vente, client, véhicule, immatriculation..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden shadow-xs"
              />
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 bg-[#F5F5F0] p-1 rounded-xl border border-[#E5E5DF] text-xs">
              {(['Tous', 'Payé', 'Partiellement payé', 'Brouillon', 'Annulé'] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === filter
                        ? 'bg-white text-[#1A1A18] font-bold shadow-xs'
                        : 'text-[#7A7A72] hover:text-[#1A1A18]'
                    }`}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Mobile Card View (shown on small screens) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredSales.map((sale) => {
              const balance = Math.max(0, sale.totalAmount - sale.amountPaid);
              return (
                <div
                  key={sale.id}
                  className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-[#5A5A40]">
                        {sale.saleNumber}
                      </span>
                      <h3 className="font-bold text-sm text-[#1A1A18]">{sale.vehicleName}</h3>
                      <span className="font-mono text-xs text-[#7A7A72]">
                        {sale.vehicleRegistration}
                      </span>
                    </div>
                    <div>{getStatusBadge(sale)}</div>
                  </div>

                  <div className="pt-2 border-t border-[#E5E5DF]/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#7A7A72] block text-[10px]">Client</span>
                      <span className="font-semibold text-[#1A1A18]">{sale.clientName}</span>
                      {sale.clientPhone && (
                        <span className="text-[11px] text-[#7A7A72] block">{sale.clientPhone}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[#7A7A72] block text-[10px]">Date de vente</span>
                      <span className="text-[#2D2D2A]">
                        {new Date(sale.saleDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Financial amounts summary */}
                  <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[#7A7A72] block text-[10px]">Montant</span>
                      <span className="font-bold text-[#1A1A18]">
                        {sale.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7A7A72] block text-[10px]">Payé</span>
                      <span className="font-bold text-[#4A7A4A]">
                        {sale.amountPaid.toLocaleString('fr-FR')} {settings.currencySymbol}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7A7A72] block text-[10px]">Solde</span>
                      <span
                        className={`font-bold ${
                          balance > 0 ? 'text-[#B87320]' : 'text-[#4A7A4A]'
                        }`}
                      >
                        {balance.toLocaleString('fr-FR')} {settings.currencySymbol}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => onViewDetail(sale)}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-[#F5F5F0] hover:bg-[#EAEAE5] text-[#2D2D2A] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span>Voir</span>
                    </button>
                    <button
                      onClick={() => onViewReceipt(sale)}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-[#F5F5F0] hover:bg-[#EAEAE5] text-[#2D2D2A] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#4A7A4A]" />
                      <span>Imprimer</span>
                    </button>
                    <button
                      onClick={() => onViewInvoice(sale)}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-[#5A5A40] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Facture</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl border border-[#E5E5DF] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase tracking-wider font-semibold border-b border-[#E5E5DF]">
                  <tr>
                    <th className="px-4 py-3.5">N° Vente</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Client</th>
                    <th className="px-4 py-3.5">Véhicule</th>
                    <th className="px-4 py-3.5">Montant</th>
                    <th className="px-4 py-3.5">Montant payé</th>
                    <th className="px-4 py-3.5">Solde</th>
                    <th className="px-4 py-3.5">Statut</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DF]">
                  {filteredSales.map((sale) => {
                    const balance = Math.max(0, sale.totalAmount - sale.amountPaid);
                    return (
                      <tr
                        key={sale.id}
                        className="hover:bg-[#F9F9F6] transition-colors"
                      >
                        {/* 1. N° Vente */}
                        <td className="px-4 py-3.5 font-mono font-bold text-[#5A5A40]">
                          {sale.saleNumber}
                        </td>

                        {/* 2. Date */}
                        <td className="px-4 py-3.5 text-[#7A7A72] whitespace-nowrap">
                          {new Date(sale.saleDate).toLocaleDateString('fr-FR')}
                        </td>

                        {/* 3. Client */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-[#1A1A18]">{sale.clientName}</div>
                          {sale.clientPhone && (
                            <div className="text-[11px] text-[#7A7A72] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-[#9A9A92]" />
                              <span>{sale.clientPhone}</span>
                            </div>
                          )}
                        </td>

                        {/* 4. Véhicule */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-[#1A1A18]">{sale.vehicleName}</div>
                          <div className="text-[11px] font-mono text-[#5A5A40]">
                            {sale.vehicleRegistration}
                          </div>
                        </td>

                        {/* 5. Montant */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-bold text-[#1A1A18]">
                            {sale.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                          </div>
                        </td>

                        {/* 6. Montant payé */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-bold text-[#4A7A4A]">
                            {sale.amountPaid.toLocaleString('fr-FR')} {settings.currencySymbol}
                          </div>
                          <div className="text-[10px] text-[#7A7A72]">{sale.paymentMethod}</div>
                        </td>

                        {/* 7. Solde */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div
                            className={`font-bold ${
                              balance > 0 ? 'text-[#B87320]' : 'text-[#4A7A4A]'
                            }`}
                          >
                            {balance.toLocaleString('fr-FR')} {settings.currencySymbol}
                          </div>
                          <div className="text-[10px] text-[#9A9A92]">
                            {balance === 0 ? 'Soldé' : 'À encaisser'}
                          </div>
                        </td>

                        {/* 8. Statut */}
                        <td className="px-4 py-3.5 whitespace-nowrap">{getStatusBadge(sale)}</td>

                        {/* 9. Actions (Voir, Imprimer, Générer facture PDF) */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Action: Voir */}
                            <button
                              id={`sale-view-btn-${sale.id}`}
                              onClick={() => onViewDetail(sale)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5F5F0] hover:bg-[#EBEBE6] text-[#2D2D2A] border border-[#E5E5DF] text-xs font-semibold transition-colors cursor-pointer"
                              title="Voir les détails complets de la vente"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#5A5A40]" />
                              <span>Voir</span>
                            </button>

                            {/* Action: Imprimer */}
                            <button
                              id={`sale-print-btn-${sale.id}`}
                              onClick={() => onViewReceipt(sale)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5F5F0] hover:bg-[#EBEBE6] text-[#2D2D2A] border border-[#E5E5DF] text-xs font-semibold transition-colors cursor-pointer"
                              title="Imprimer le reçu d'encaissement"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#4A7A4A]" />
                              <span>Imprimer</span>
                            </button>

                            {/* Action: Générer facture PDF */}
                            <button
                              id={`sale-invoice-btn-${sale.id}`}
                              onClick={() => onViewInvoice(sale)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                              title="Générer et imprimer la facture de cession PDF"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Facture PDF</span>
                            </button>

                            {/* Delete action */}
                            <button
                              id={`sale-delete-btn-${sale.id}`}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Supprimer la vente ${sale.saleNumber} ? Le véhicule sera de nouveau disponible.`
                                  )
                                ) {
                                  deleteSale(sale.id);
                                }
                              }}
                              className="p-1 rounded-lg text-[#7A7A72] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Supprimer la vente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
