import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Client, ClientType, ClientStatus } from '../types';
import { EmptyState } from './EmptyState';
import {
  Users,
  Plus,
  Search,
  User,
  Building,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  IdCard,
  Award,
  Edit2,
  Trash2,
  Eye,
  CreditCard,
  KeyRound,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface ClientsViewProps {
  onOpenClientModal: (client?: Client | null) => void;
  onOpenClientDetail: (client: Client) => void;
  onNewSale?: (clientId: string) => void;
  onNewRental?: (clientId: string) => void;
  onNewPayment?: (clientId: string) => void;
  searchQuery: string;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  onOpenClientModal,
  onOpenClientDetail,
  onNewSale,
  onNewRental,
  onNewPayment,
  searchQuery,
}) => {
  const { clients, deleteClient, sales, rentals, payments, settings } = useCrm();
  const [filterType, setFilterType] = useState<string>('Tous');
  const [filterStatus, setFilterStatus] = useState<string>('Tous');
  const [localSearch, setLocalSearch] = useState('');

  const activeSearch = searchQuery || localSearch;

  const filteredClients = clients.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const company = (c.companyName || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    const whatsapp = (c.whatsapp || '').toLowerCase();
    const license = (c.drivingLicenseNumber || '').toLowerCase();
    const idCard = (c.idCardNumber || '').toLowerCase();
    const q = activeSearch.toLowerCase().trim();

    const matchesSearch =
      q === '' ||
      fullName.includes(q) ||
      company.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      whatsapp.includes(q) ||
      license.includes(q) ||
      idCard.includes(q);

    const matchesType =
      filterType === 'Tous' ||
      (filterType === 'particulier' && c.type === 'particulier') ||
      (filterType === 'entreprise' && c.type === 'entreprise');

    const matchesStatus =
      filterStatus === 'Tous' ||
      (filterStatus === 'Actif' && (c.status || 'Actif') === 'Actif') ||
      (filterStatus === 'Inactif' && c.status === 'Inactif');

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate client balance (sales balance + rentals balance - direct payments)
  const getClientFinancials = (clientId: string) => {
    const clientSales = sales.filter((s) => s.clientId === clientId);
    const clientRentals = rentals.filter((r) => r.clientId === clientId);
    const clientPayments = payments.filter((p) => p.clientId === clientId);

    const salesTotal = clientSales.reduce((sum, s) => sum + (s.totalAmount || s.salePrice || 0), 0);
    const salesPaid = clientSales.reduce((sum, s) => sum + (s.amountPaid || 0), 0);

    const rentalsTotal = clientRentals.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    const rentalsPaid = clientRentals.reduce((sum, r) => sum + (r.amountPaid || 0), 0);

    const directPaid = clientPayments
      .filter((p) => p.referenceType === 'direct')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalInvoiced = salesTotal + rentalsTotal;
    const totalPaid = salesPaid + rentalsPaid + directPaid;
    const balanceDue = Math.max(0, totalInvoiced - totalPaid);

    return {
      salesCount: clientSales.length,
      rentalsCount: clientRentals.length,
      paymentsCount: clientPayments.length,
      balanceDue,
    };
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} ${settings.currencySymbol || '€'}`;
  };

  return (
    <div id="clients-view" className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A18] tracking-tight font-['Outfit'] flex items-center gap-2">
            <span>Répertoire des Clients</span>
          </h2>
          <p className="text-xs text-[#7A7A72]">
            Gestion des acheteurs, locataires et suivi centralisé des comptes
          </p>
        </div>

        <button
          id="clients-add-btn"
          onClick={() => onOpenClientModal(null)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nouveau client</span>
        </button>
      </div>

      {/* MANDATORY EMPTY STATE: If no clients in CRM */}
      {clients.length === 0 ? (
        <EmptyState
          id="empty-state-clients"
          icon={<Users className="w-8 h-8" />}
          title="Aucun client enregistré"
          description="Votre base de données clients est actuellement vierge. Enregistrez votre premier client pour initier des ventes, locations et encaissements."
          actionText="Ajouter un client"
          onAction={() => onOpenClientModal(null)}
        />
      ) : (
        <>
          {/* Filter Bar & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
            {/* Type & Status Filter buttons */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center bg-[#FAFAF8] p-1 rounded-xl border border-[#E5E5DF]">
                {['Tous', 'particulier', 'entreprise'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer capitalize text-xs ${
                      filterType === t
                        ? 'bg-[#5A5A40] text-white font-semibold shadow-xs'
                        : 'text-[#7A7A72] hover:text-[#1A1A18]'
                    }`}
                  >
                    {t === 'Tous' ? 'Tous' : t === 'particulier' ? 'Particuliers' : 'Entreprises'}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-[#FAFAF8] p-1 rounded-xl border border-[#E5E5DF]">
                {['Tous', 'Actif', 'Inactif'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer text-xs ${
                      filterStatus === st
                        ? 'bg-[#5A5A40] text-white font-semibold shadow-xs'
                        : 'text-[#7A7A72] hover:text-[#1A1A18]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input (Nom, Téléphone, Email) */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
              <input
                id="clients-search-input"
                type="text"
                placeholder="Rechercher par nom, tél, email, permis..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden"
              />
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-[#E5E5DF] shadow-xs">
              <Search className="w-8 h-8 text-[#9A9A92] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#1A1A18]">Aucun client trouvé</h3>
              <p className="text-xs text-[#7A7A72] mt-1">
                Aucun client ne correspond aux critères de recherche actuels.
              </p>
              <button
                onClick={() => {
                  setLocalSearch('');
                  setFilterType('Tous');
                  setFilterStatus('Tous');
                }}
                className="mt-3 px-3 py-1.5 rounded-xl border border-[#E5E5DF] text-xs font-semibold text-[#5A5A40] hover:bg-[#FAFAF8] cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (Hidden on Mobile) */}
              <div className="hidden lg:block rounded-2xl border border-[#E5E5DF] bg-white overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F5F5F0] text-[#5A5A40] border-b border-[#E5E5DF]">
                        <th className="py-3 px-4 font-semibold">Nom & Identité</th>
                        <th className="py-3 px-4 font-semibold">Téléphone & WhatsApp</th>
                        <th className="py-3 px-4 font-semibold">Email</th>
                        <th className="py-3 px-4 font-semibold text-center">Ventes</th>
                        <th className="py-3 px-4 font-semibold text-center">Locations</th>
                        <th className="py-3 px-4 font-semibold text-right">Solde Dû</th>
                        <th className="py-3 px-4 font-semibold text-center">Statut</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5DF]">
                      {filteredClients.map((client) => {
                        const financials = getClientFinancials(client.id);
                        const displayName =
                          client.type === 'entreprise' && client.companyName
                            ? client.companyName
                            : `${client.firstName} ${client.lastName}`.trim();
                        const cleanPhone = (client.phone || '').replace(/[^0-9+]/g, '');
                        const cleanWa = (client.whatsapp || client.phone || '').replace(/[^0-9+]/g, '');

                        return (
                          <tr
                            key={client.id}
                            id={`client-row-${client.id}`}
                            className="hover:bg-[#FAFAF8] transition-colors group cursor-pointer"
                            onClick={() => onOpenClientDetail(client)}
                          >
                            {/* Nom & Identité */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40] shrink-0 font-bold">
                                  {client.type === 'entreprise' ? (
                                    <Building className="w-4 h-4" />
                                  ) : (
                                    <User className="w-4 h-4" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-sm text-[#1A1A18] group-hover:text-[#5A5A40] transition-colors font-['Outfit']">
                                    {displayName}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-[#7A7A72]">
                                    <span className="capitalize">{client.type}</span>
                                    {client.type === 'entreprise' && client.firstName && (
                                      <span>• Contact : {client.firstName} {client.lastName}</span>
                                    )}
                                    {client.drivingLicenseNumber && (
                                      <span className="font-mono text-[#5A5A40]">
                                        • Permis : {client.drivingLicenseNumber}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Téléphone & WhatsApp */}
                            <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <a
                                  href={`tel:${cleanPhone}`}
                                  className="text-xs font-semibold text-[#2D2D2A] hover:underline flex items-center gap-1.5"
                                  title="Appeler"
                                >
                                  <Phone className="w-3.5 h-3.5 text-[#7A7A72]" />
                                  <span>{client.phone}</span>
                                </a>
                                {cleanWa && (
                                  <a
                                    href={`https://wa.me/${cleanWa.replace('+', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded-md text-[#4A7A4A] hover:bg-[#4A7A4A]/10 transition-colors"
                                    title="WhatsApp direct"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>

                            {/* Email */}
                            <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                              <a
                                href={`mailto:${client.email}`}
                                className="text-xs text-[#5A5A40] hover:underline truncate max-w-[180px] block"
                              >
                                {client.email}
                              </a>
                            </td>

                            {/* Nombre de Ventes */}
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                                  financials.salesCount > 0
                                    ? 'bg-[#5A5A40]/10 text-[#5A5A40]'
                                    : 'text-[#9A9A92]'
                                }`}
                              >
                                {financials.salesCount}
                              </span>
                            </td>

                            {/* Nombre de Locations */}
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                                  financials.rentalsCount > 0
                                    ? 'bg-[#B87320]/10 text-[#B87320]'
                                    : 'text-[#9A9A92]'
                                }`}
                              >
                                {financials.rentalsCount}
                              </span>
                            </td>

                            {/* Solde Restant Dû */}
                            <td className="py-3.5 px-4 text-right">
                              <span
                                className={`font-bold text-xs ${
                                  financials.balanceDue > 0
                                    ? 'text-amber-600 font-semibold'
                                    : 'text-[#4A7A4A]'
                                }`}
                              >
                                {formatCurrency(financials.balanceDue)}
                              </span>
                            </td>

                            {/* Statut */}
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                                  (client.status || 'Actif') === 'Actif'
                                    ? 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/30'
                                    : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                                }`}
                              >
                                {client.status || 'Actif'}
                              </span>
                            </td>

                            {/* Actions (Voir, Modifier, Supprimer) */}
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  id={`client-view-btn-${client.id}`}
                                  onClick={() => onOpenClientDetail(client)}
                                  className="p-1.5 rounded-lg text-[#5A5A40] hover:bg-[#5A5A40]/10 transition-colors cursor-pointer"
                                  title="Voir la fiche client"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  id={`client-edit-btn-${client.id}`}
                                  onClick={() => onOpenClientModal(client)}
                                  className="p-1.5 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0EFEB] transition-colors cursor-pointer"
                                  title="Modifier le client"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  id={`client-del-btn-${client.id}`}
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Confirmer la suppression définitive du client ${displayName} ?`
                                      )
                                    ) {
                                      deleteClient(client.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-[#7A7A72] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Supprimer le client"
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

              {/* MOBILE & TABLET CARDS VIEW (Shown on smaller screens) */}
              <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredClients.map((client) => {
                  const financials = getClientFinancials(client.id);
                  const displayName =
                    client.type === 'entreprise' && client.companyName
                      ? client.companyName
                      : `${client.firstName} ${client.lastName}`.trim();
                  const cleanPhone = (client.phone || '').replace(/[^0-9+]/g, '');
                  const cleanWa = (client.whatsapp || client.phone || '').replace(/[^0-9+]/g, '');

                  return (
                    <div
                      key={client.id}
                      id={`client-card-${client.id}`}
                      className="rounded-2xl border border-[#E5E5DF] bg-white p-4.5 shadow-xs flex flex-col justify-between hover:border-[#5A5A40] transition-colors"
                    >
                      <div>
                        {/* Header: Name & Status */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40] shrink-0 font-bold">
                              {client.type === 'entreprise' ? (
                                <Building className="w-4 h-4" />
                              ) : (
                                <User className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <h3
                                onClick={() => onOpenClientDetail(client)}
                                className="font-bold text-sm text-[#1A1A18] hover:text-[#5A5A40] cursor-pointer font-['Outfit']"
                              >
                                {displayName}
                              </h3>
                              <p className="text-[11px] text-[#7A7A72]">
                                {client.type === 'entreprise'
                                  ? `Entreprise • Contact : ${client.firstName} ${client.lastName}`
                                  : 'Client Particulier'}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                              (client.status || 'Actif') === 'Actif'
                                ? 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/30'
                                : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                            }`}
                          >
                            {client.status || 'Actif'}
                          </span>
                        </div>

                        {/* Contact details */}
                        <div className="space-y-1.5 text-xs text-[#2D2D2A] mb-3.5 bg-[#FAFAF8] p-3 rounded-xl border border-[#E5E5DF]">
                          <div className="flex items-center justify-between">
                            <span className="text-[#7A7A72] flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#5A5A40]" />
                              <span>Téléphone :</span>
                            </span>
                            <a
                              href={`tel:${cleanPhone}`}
                              className="font-semibold text-[#1A1A18] hover:underline"
                            >
                              {client.phone}
                            </a>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[#7A7A72] flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-[#5A5A40]" />
                              <span>Email :</span>
                            </span>
                            <a
                              href={`mailto:${client.email}`}
                              className="font-semibold text-[#5A5A40] hover:underline truncate max-w-[160px]"
                            >
                              {client.email}
                            </a>
                          </div>

                          {client.drivingLicenseNumber && (
                            <div className="flex items-center justify-between">
                              <span className="text-[#7A7A72] flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-[#5A5A40]" />
                                <span>Permis :</span>
                              </span>
                              <span className="font-mono font-bold text-[#5A5A40]">
                                {client.drivingLicenseNumber}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Metrics Summary Chips */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                          <div className="p-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                            <span className="text-[10px] text-[#7A7A72] block">Ventes</span>
                            <span className="font-bold text-[#5A5A40]">{financials.salesCount}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                            <span className="text-[10px] text-[#7A7A72] block">Locations</span>
                            <span className="font-bold text-[#B87320]">{financials.rentalsCount}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                            <span className="text-[10px] text-[#7A7A72] block">Solde Dû</span>
                            <span
                              className={`font-bold ${
                                financials.balanceDue > 0 ? 'text-amber-600' : 'text-[#4A7A4A]'
                              }`}
                            >
                              {formatCurrency(financials.balanceDue)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons on mobile */}
                      <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1">
                          {cleanPhone && (
                            <a
                              href={`tel:${cleanPhone}`}
                              className="p-2 rounded-xl bg-[#FAFAF8] text-[#2D2D2A] border border-[#E5E5DF] hover:bg-[#F0EFEB]"
                              title="Appeler"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {cleanWa && (
                            <a
                              href={`https://wa.me/${cleanWa.replace('+', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-[#4A7A4A]/10 text-[#4A7A4A] border border-[#4A7A4A]/30 hover:bg-[#4A7A4A]/20"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => onOpenClientModal(client)}
                            className="p-2 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0EFEB] border border-[#E5E5DF]"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Supprimer définitivement le client ${displayName} ?`)) {
                                deleteClient(client.id);
                              }
                            }}
                            className="p-2 rounded-xl text-[#7A7A72] hover:text-rose-600 hover:bg-rose-50 border border-[#E5E5DF]"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => onOpenClientDetail(client)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#5A5A40] text-white font-semibold text-xs transition-colors hover:bg-[#484832]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Fiche Client</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
