import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { OtherRevenue } from '../../types';
import {
  TrendingUp,
  Search,
  Filter,
  Plus,
  BadgePercent,
  KeyRound,
  DollarSign,
  Calendar,
  User,
  ArrowUpDown,
  Trash2,
  Edit2,
  FileText,
} from 'lucide-react';

interface AccountingRevenuesTabProps {
  onOpenAddOtherRevenue: () => void;
  onEditOtherRevenue: (rev: OtherRevenue) => void;
}

export const AccountingRevenuesTab: React.FC<AccountingRevenuesTabProps> = ({
  onOpenAddOtherRevenue,
  onEditOtherRevenue,
}) => {
  const { sales, rentals, otherRevenues, settings, deleteOtherRevenue } = useCrm();
  const sym = settings.currencySymbol || '€';

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'rental' | 'other'>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'this_month' | 'today'>('all');

  // Consolidated revenues list
  const consolidatedRevenues = useMemo(() => {
    const list: Array<{
      id: string;
      date: string;
      reference: string;
      clientName: string;
      type: 'Vente véhicule' | 'Location véhicule' | 'Autre revenu';
      category: string;
      amount: number;
      paymentMethod?: string;
      notes?: string;
      rawObject?: any;
    }> = [];

    // 1. Sales
    sales.forEach((s) => {
      list.push({
        id: `sale_${s.id}`,
        date: s.saleDate,
        reference: s.invoiceNumber || `FAC-VTE-${s.id.substring(0, 4)}`,
        clientName: s.clientName,
        type: 'Vente véhicule',
        category: `Vente ${s.vehicleName}`,
        amount: s.salePrice,
        paymentMethod: s.paymentMethod,
        rawObject: s,
      });
    });

    // 2. Rentals
    rentals.forEach((r) => {
      list.push({
        id: `rental_${r.id}`,
        date: r.startDate,
        reference: r.contractNumber || `CTR-${r.id.substring(0, 4)}`,
        clientName: r.clientName,
        type: 'Location véhicule',
        category: `Location ${r.vehicleName} (${r.durationDays}j)`,
        amount: r.totalAmount,
        paymentMethod: r.paymentMethod,
        rawObject: r,
      });
    });

    // 3. Other Revenues
    otherRevenues.forEach((rev) => {
      list.push({
        id: `other_${rev.id}`,
        date: rev.date,
        reference: rev.revenueNumber,
        clientName: rev.clientName || 'Client libre',
        type: 'Autre revenu',
        category: rev.category,
        amount: rev.amount,
        paymentMethod: rev.paymentMethod,
        notes: rev.description,
        rawObject: rev,
      });
    });

    // Sort descending by date
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, rentals, otherRevenues]);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Filtered revenues
  const filteredRevenues = useMemo(() => {
    return consolidatedRevenues.filter((item) => {
      // Type filter
      if (typeFilter === 'sale' && item.type !== 'Vente véhicule') return false;
      if (typeFilter === 'rental' && item.type !== 'Location véhicule') return false;
      if (typeFilter === 'other' && item.type !== 'Autre revenu') return false;

      // Period filter
      if (periodFilter === 'today' && item.date !== todayStr) return false;
      if (periodFilter === 'this_month' && !item.date.startsWith(currentMonthStr)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.reference.toLowerCase().includes(q) ||
          item.clientName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.date.includes(q) ||
          item.type.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [consolidatedRevenues, typeFilter, periodFilter, searchQuery, todayStr, currentMonthStr]);

  const totalFilteredAmount = filteredRevenues.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
            Revenus & Chiffre d'Affaires
          </h2>
          <p className="text-xs text-[#7A7A72]">
            Total filtré : <span className="font-bold text-[#1A1A18]">{totalFilteredAmount.toLocaleString('fr-FR')} {sym}</span> ({filteredRevenues.length} écritures)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-add-other-revenue"
            onClick={onOpenAddOtherRevenue}
            className="px-4 py-2 rounded-xl bg-[#4A7A4A] hover:bg-[#3D663D] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Enregistrer un autre revenu</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-[#9A9A92] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher référence, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A]"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                typeFilter === 'all' ? 'bg-white shadow-xs text-[#1A1A18] font-bold' : 'text-[#7A7A72]'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setTypeFilter('sale')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                typeFilter === 'sale' ? 'bg-white shadow-xs text-[#4A7A4A] font-bold' : 'text-[#7A7A72]'
              }`}
            >
              Ventes
            </button>
            <button
              onClick={() => setTypeFilter('rental')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                typeFilter === 'rental' ? 'bg-white shadow-xs text-[#5A5A40] font-bold' : 'text-[#7A7A72]'
              }`}
            >
              Locations
            </button>
            <button
              onClick={() => setTypeFilter('other')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                typeFilter === 'other' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-[#7A7A72]'
              }`}
            >
              Autres
            </button>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs">
            <button
              onClick={() => setPeriodFilter('all')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                periodFilter === 'all' ? 'bg-white shadow-xs text-[#1A1A18] font-bold' : 'text-[#7A7A72]'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setPeriodFilter('this_month')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                periodFilter === 'this_month' ? 'bg-white shadow-xs text-[#1A1A18] font-bold' : 'text-[#7A7A72]'
              }`}
            >
              Ce mois
            </button>
            <button
              onClick={() => setPeriodFilter('today')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                periodFilter === 'today' ? 'bg-white shadow-xs text-[#1A1A18] font-bold' : 'text-[#7A7A72]'
              }`}
            >
              Aujourd'hui
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredRevenues.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E5E5DF]">
          <TrendingUp className="w-10 h-10 text-[#9A9A92] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-[#1A1A18]">
            Aucune donnée de revenu disponible
          </h3>
          <p className="text-xs text-[#7A7A72] max-w-sm mx-auto mt-1 mb-4">
            Les revenus proviennent automatiquement de vos ventes et locations validées, ou d'autres prestations enregistrées.
          </p>
          <button
            onClick={onOpenAddOtherRevenue}
            className="px-4 py-2 rounded-xl bg-[#4A7A4A] text-white text-xs font-semibold shadow-xs hover:bg-[#3D663D] transition-colors"
          >
            Commencer à enregistrer des opérations
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5DF] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF8] border-b border-[#E5E5DF] text-[#7A7A72] uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Référence</th>
                  <th className="px-4 py-3.5">Client</th>
                  <th className="px-4 py-3.5">Type d'opération</th>
                  <th className="px-4 py-3.5">Détail</th>
                  <th className="px-4 py-3.5">Règlement</th>
                  <th className="px-4 py-3.5 text-right">Montant</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC]">
                {filteredRevenues.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1A1A18] whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#1A1A18] whitespace-nowrap">
                      {item.reference}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1A1A18]">
                      {item.clientName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                          item.type === 'Vente véhicule'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : item.type === 'Location véhicule'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {item.type === 'Vente véhicule' && <BadgePercent className="w-3 h-3" />}
                        {item.type === 'Location véhicule' && <KeyRound className="w-3 h-3" />}
                        {item.type === 'Autre revenu' && <TrendingUp className="w-3 h-3" />}
                        <span>{item.type}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#7A7A72] max-w-xs truncate">
                      {item.category}
                      {item.notes && <span className="block text-[10px] text-[#9A9A92]">{item.notes}</span>}
                    </td>
                    <td className="px-4 py-3 text-[#7A7A72] whitespace-nowrap">
                      {item.paymentMethod || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700 whitespace-nowrap text-sm">
                      +{item.amount.toLocaleString('fr-FR')} {sym}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {item.type === 'Autre revenu' ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditOtherRevenue(item.rawObject as OtherRevenue)}
                            title="Modifier"
                            className="p-1.5 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0F0EC] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Supprimer ce revenu ?')) {
                                deleteOtherRevenue((item.rawObject as OtherRevenue).id);
                              }
                            }}
                            title="Supprimer"
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#9A9A92] italic">Auto-sync</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
