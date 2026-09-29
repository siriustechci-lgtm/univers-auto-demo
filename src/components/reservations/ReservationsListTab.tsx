import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  XCircle,
  KeyRound,
  BadgePercent,
  Calendar,
  Car,
  User,
  Clock,
  DollarSign,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { Reservation, ReservationStatus } from '../../types';

interface ReservationsListTabProps {
  onOpenNewReservation: () => void;
  onSelectReservation: (reservation: Reservation) => void;
  onEditReservation: (reservation: Reservation) => void;
  onConvertToRental: (reservation: Reservation) => void;
  onConvertToSale: (reservation: Reservation) => void;
  onCancelReservation: (reservation: Reservation) => void;
  activeStatusFilter?: string;
  onClearStatusFilter?: () => void;
}

export const ReservationsListTab: React.FC<ReservationsListTabProps> = ({
  onOpenNewReservation,
  onSelectReservation,
  onEditReservation,
  onConvertToRental,
  onConvertToSale,
  onCancelReservation,
  activeStatusFilter,
  onClearStatusFilter,
}) => {
  const { reservations, settings } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(activeStatusFilter || 'all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortField, setSortField] = useState<'date' | 'startDate' | 'endDate' | 'reservationNumber'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Sync external status filter if passed
  React.useEffect(() => {
    if (activeStatusFilter) {
      setStatusFilter(activeStatusFilter);
    }
  }, [activeStatusFilter]);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Helper date calculations
  const isDateInCurrentWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1;
    const firstDay = new Date(curr.setDate(first));
    firstDay.setHours(0, 0, 0, 0);
    const lastDay = new Date(firstDay);
    lastDay.setDate(lastDay.getDate() + 6);
    lastDay.setHours(23, 59, 59, 999);
    return d >= firstDay && d <= lastDay;
  };

  const isDateInCurrentMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    const curr = new Date();
    return d.getMonth() === curr.getMonth() && d.getFullYear() === curr.getFullYear();
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // 1. Search Query
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.reservationNumber.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        (r.clientPhone && r.clientPhone.toLowerCase().includes(q)) ||
        r.vehicleName.toLowerCase().includes(q) ||
        r.vehicleRegistration.toLowerCase().includes(q);

      if (!matchSearch) return false;

      // 2. Status filter
      if (statusFilter === 'actives') {
        if (r.status !== 'Réservée' && r.status !== 'Confirmée') return false;
      } else if (statusFilter === 'converties') {
        if (r.status !== 'Convertie en location' && r.status !== 'Convertie en vente') return false;
      } else if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }

      // 3. Period filter
      if (periodFilter === 'today') {
        if (r.date !== todayStr && r.startDate !== todayStr && r.endDate !== todayStr) return false;
      } else if (periodFilter === 'week') {
        if (!isDateInCurrentWeek(r.date) && !isDateInCurrentWeek(r.startDate)) return false;
      } else if (periodFilter === 'month') {
        if (!isDateInCurrentMonth(r.date) && !isDateInCurrentMonth(r.startDate)) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [reservations, searchTerm, statusFilter, periodFilter, sortField, sortAsc, todayStr]);

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'Réservée':
        return 'bg-[#4A6B82]/10 text-[#4A6B82] border-[#4A6B82]/25';
      case 'Confirmée':
        return 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/25';
      case 'Convertie en location':
        return 'bg-[#5A5A40]/10 text-[#5A5A40] border-[#5A5A40]/25';
      case 'Convertie en vente':
        return 'bg-[#4A7A4A]/15 text-[#4A7A4A] border-[#4A7A4A]/30';
      case 'Annulée':
        return 'bg-[#B84030]/10 text-[#B84030] border-[#B84030]/25';
      case 'Expirée':
        return 'bg-[#B87320]/10 text-[#B87320] border-[#B87320]/25';
      default:
        return 'bg-[#7A7A72]/10 text-[#7A7A72] border-[#7A7A72]/20';
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div id="reservations-list-tab" className="space-y-4">
      {/* Controls Bar: Search & Quick Filters */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A72]" />
            <input
              type="text"
              id="search-reservations-input"
              placeholder="Rechercher par référence, client, téléphone, véhicule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E5E5DF] bg-[#FAFAF7] text-[#1A1A18] placeholder:text-[#9A9A92] focus:bg-white focus:outline-hidden focus:border-[#4A6B82] transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A7A72] hover:text-[#1A1A18]"
              >
                ×
              </button>
            )}
          </div>

          {/* New Reservation CTA */}
          <button
            type="button"
            id="new-reservation-btn"
            onClick={onOpenNewReservation}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#4A6B82] hover:bg-[#3B5668] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle réservation</span>
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F0F0EC]">
          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-medium text-[#7A7A72] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Statut :
            </span>
            {[
              { id: 'all', label: 'Tous' },
              { id: 'actives', label: 'Actives' },
              { id: 'Réservée', label: 'Réservées' },
              { id: 'Confirmée', label: 'Confirmées' },
              { id: 'converties', label: 'Converties' },
              { id: 'Expirée', label: 'Expirées' },
              { id: 'Annulée', label: 'Annulées' },
            ].map((st) => (
              <button
                key={st.id}
                id={`filter-res-status-${st.id}`}
                onClick={() => {
                  setStatusFilter(st.id);
                  if (onClearStatusFilter && st.id === 'all') onClearStatusFilter();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === st.id
                    ? 'bg-[#1A1A18] text-white shadow-2xs'
                    : 'bg-[#FAFAF7] border border-[#E5E5DF] text-[#7A7A72] hover:text-[#1A1A18]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-medium text-[#7A7A72] mr-1">Période :</span>
            {[
              { id: 'all', label: 'Tout' },
              { id: 'today', label: "Aujourd'hui" },
              { id: 'week', label: 'Semaine' },
              { id: 'month', label: 'Mois' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodFilter(p.id as any)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                  periodFilter === p.id
                    ? 'bg-[#4A6B82]/15 text-[#4A6B82] font-bold'
                    : 'text-[#7A7A72] hover:text-[#1A1A18]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-white border border-[#E5E5DF] shadow-xs overflow-hidden">
        {filteredReservations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAF7] border border-[#E5E5DF] flex items-center justify-center text-[#7A7A72] mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1A18]">Aucune réservation trouvée</p>
              <p className="text-xs text-[#7A7A72] max-w-sm mx-auto mt-1">
                {reservations.length === 0
                  ? 'Aucune réservation enregistrée. Utilisez le bouton ci-dessous pour créer une réservation réelle.'
                  : 'Aucune réservation ne correspond à vos filtres de recherche actuels.'}
              </p>
            </div>
            {reservations.length === 0 && (
              <button
                type="button"
                onClick={onOpenNewReservation}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#4A6B82] hover:bg-[#3B5668] rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Créer la première réservation</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#F0F0EC] bg-[#FAFAF7] text-[#7A7A72] font-semibold select-none">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-[#1A1A18]"
                    onClick={() => handleSort('reservationNumber')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Référence</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-[#1A1A18]"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Véhicule</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-[#1A1A18]"
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Début</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-[#1A1A18]"
                    onClick={() => handleSort('endDate')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Fin</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Acompte</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC]">
                {filteredReservations.map((r) => {
                  const canConvert =
                    r.status === 'Réservée' || r.status === 'Confirmée' || r.status === 'Expirée';
                  return (
                    <tr
                      key={r.id}
                      id={`res-row-${r.id}`}
                      className="hover:bg-[#FAFAF7]/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectReservation(r)}
                    >
                      {/* Référence */}
                      <td className="py-3 px-4 font-mono font-bold text-[#4A6B82]">
                        {r.reservationNumber}
                      </td>

                      {/* Date de création */}
                      <td className="py-3 px-4 text-[#7A7A72]">{r.date}</td>

                      {/* Client */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1A1A18] truncate max-w-[160px]">
                          {r.clientName}
                        </div>
                        {r.clientPhone && (
                          <div className="text-[11px] text-[#7A7A72]">{r.clientPhone}</div>
                        )}
                      </td>

                      {/* Véhicule */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#1A1A18] truncate max-w-[180px]">
                          {r.vehicleName}
                        </div>
                        <div className="text-[11px] font-mono text-[#7A7A72]">
                          {r.vehicleRegistration}
                        </div>
                      </td>

                      {/* Début */}
                      <td className="py-3 px-4 font-medium text-[#1A1A18]">{r.startDate}</td>

                      {/* Fin */}
                      <td className="py-3 px-4 font-medium text-[#1A1A18]">{r.endDate}</td>

                      {/* Acompte */}
                      <td className="py-3 px-4 text-right">
                        {r.depositAmount > 0 ? (
                          <span className="font-bold text-[#4A7A4A]">
                            {r.depositAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                          </span>
                        ) : (
                          <span className="text-[#9A9A92]">-</span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                            r.status
                          )}`}
                        >
                          {r.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* Voir */}
                          <button
                            type="button"
                            title="Voir le détail"
                            onClick={() => onSelectReservation(r)}
                            className="p-1.5 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#E5E5DF]/50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Modifier */}
                          <button
                            type="button"
                            title="Modifier"
                            onClick={() => onEditReservation(r)}
                            className="p-1.5 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#E5E5DF]/50 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Convertir en location */}
                          {canConvert && (
                            <button
                              type="button"
                              title="Convertir en location"
                              onClick={() => onConvertToRental(r)}
                              className="p-1.5 rounded-lg text-[#5A5A40] hover:bg-[#5A5A40]/10 transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Convertir en vente */}
                          {canConvert && (
                            <button
                              type="button"
                              title="Convertir en vente"
                              onClick={() => onConvertToSale(r)}
                              className="p-1.5 rounded-lg text-[#4A7A4A] hover:bg-[#4A7A4A]/10 transition-colors"
                            >
                              <BadgePercent className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Annuler */}
                          {canConvert && (
                            <button
                              type="button"
                              title="Annuler la réservation"
                              onClick={() => onCancelReservation(r)}
                              className="p-1.5 rounded-lg text-[#B84030] hover:bg-[#B84030]/10 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info bar */}
        <div className="px-4 py-3 bg-[#FAFAF7] border-t border-[#F0F0EC] flex items-center justify-between text-[11px] text-[#7A7A72]">
          <span>
            Affichage de <strong>{filteredReservations.length}</strong> réservation(s) sur{' '}
            <strong>{reservations.length}</strong> au total
          </span>
          <span className="text-[10px] text-[#9A9A92]">Données réelles uniquement</span>
        </div>
      </div>
    </div>
  );
};
