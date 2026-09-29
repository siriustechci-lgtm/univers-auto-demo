import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { AccountingEntry } from '../../types';
import {
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  BadgePercent,
  KeyRound,
  CreditCard,
  Receipt,
  TrendingUp,
  FileText,
  User,
} from 'lucide-react';

export const AccountingJournalTab: React.FC = () => {
  const { getAccountingJournal, settings } = useCrm();
  const sym = settings.currencySymbol || '€';

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [flowFilter, setFlowFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const journalEntries = useMemo(() => getAccountingJournal(), [getAccountingJournal]);

  const filteredEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      // Flow filter
      if (flowFilter !== 'all' && entry.flowType !== flowFilter) return false;

      // Type filter
      if (typeFilter !== 'all' && entry.type !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          entry.reference.toLowerCase().includes(q) ||
          entry.thirdParty.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q) ||
          entry.category.toLowerCase().includes(q) ||
          entry.date.includes(q)
        );
      }

      return true;
    });
  }, [journalEntries, flowFilter, typeFilter, searchQuery]);

  // Compute totals
  const totalCredits = filteredEntries
    .filter((e) => e.flowType === 'credit')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalDebits = filteredEntries
    .filter((e) => e.flowType === 'debit')
    .reduce((acc, e) => acc + e.amount, 0);

  const balance = totalCredits - totalDebits;

  return (
    <div className="space-y-6">
      {/* Header & Metric Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
            Journal Général des Opérations
          </h2>
          <p className="text-xs text-[#7A7A72]">
            Audit chronologique complet de tous les flux réels (ventes, locations, encaissements, dépenses)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DF] text-[#1A1A18] font-semibold">
            {filteredEntries.length} écritures
          </span>
        </div>
      </div>

      {/* Mini Flow Balance Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#7A7A72] uppercase block">
              Total Crédits (Entrées)
            </span>
            <span className="text-lg font-bold text-emerald-700">
              +{totalCredits.toLocaleString('fr-FR')} {sym}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#7A7A72] uppercase block">
              Total Débits (Sorties)
            </span>
            <span className="text-lg font-bold text-red-600">
              -{totalDebits.toLocaleString('fr-FR')} {sym}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#7A7A72] uppercase block">
              Solde Période
            </span>
            <span className={`text-lg font-black ${balance >= 0 ? 'text-[#1A1A18]' : 'text-red-600'}`}>
              {balance >= 0 ? '+' : ''}{balance.toLocaleString('fr-FR')} {sym}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#FAFAF8] text-[#1A1A18] flex items-center justify-center border border-[#E5E5DF]">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#9A9A92] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher référence, client, libellé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A]"
            />
          </div>

          {/* Operation Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs text-[#1A1A18] focus:outline-hidden focus:border-[#4A7A4A]"
            >
              <option value="all">Tous les types d'opérations</option>
              <option value="Vente véhicule">Ventes de véhicules</option>
              <option value="Location véhicule">Locations de véhicules</option>
              <option value="Paiement reçu">Paiements reçus</option>
              <option value="Autre revenu">Autres revenus</option>
              <option value="Dépense">Dépenses & charges</option>
            </select>
          </div>

          {/* Flow Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs">
            <button
              onClick={() => setFlowFilter('all')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                flowFilter === 'all' ? 'bg-white shadow-xs text-[#1A1A18] font-bold' : 'text-[#7A7A72]'
              }`}
            >
              Tous flux
            </button>
            <button
              onClick={() => setFlowFilter('credit')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                flowFilter === 'credit' ? 'bg-white shadow-xs text-emerald-700 font-bold' : 'text-[#7A7A72]'
              }`}
            >
              Entrées (+)
            </button>
            <button
              onClick={() => setFlowFilter('debit')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                flowFilter === 'debit' ? 'bg-white shadow-xs text-red-600 font-bold' : 'text-[#7A7A72]'
              }`}
            >
              Sorties (-)
            </button>
          </div>
        </div>
      </div>

      {/* Journal Table */}
      {filteredEntries.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E5E5DF]">
          <FileText className="w-10 h-10 text-[#9A9A92] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-[#1A1A18]">
            Aucune donnée comptable disponible
          </h3>
          <p className="text-xs text-[#7A7A72] max-w-sm mx-auto mt-1 mb-4">
            Le journal synchronise automatiquement chaque vente, location, encaissement ou charge enregistrée dans Sirius Auto CRM.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5DF] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF8] border-b border-[#E5E5DF] text-[#7A7A72] uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Référence</th>
                  <th className="px-4 py-3.5">Opération</th>
                  <th className="px-4 py-3.5">Tiers / Client</th>
                  <th className="px-4 py-3.5">Libellé de l'écriture</th>
                  <th className="px-4 py-3.5">Mode</th>
                  <th className="px-4 py-3.5">Statut</th>
                  <th className="px-4 py-3.5 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC]">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1A1A18] whitespace-nowrap">
                      {new Date(entry.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#1A1A18] whitespace-nowrap">
                      {entry.reference}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                          entry.type === 'Vente véhicule'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : entry.type === 'Location véhicule'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : entry.type === 'Paiement reçu'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : entry.type === 'Autre revenu'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {entry.type === 'Vente véhicule' && <BadgePercent className="w-3 h-3" />}
                        {entry.type === 'Location véhicule' && <KeyRound className="w-3 h-3" />}
                        {entry.type === 'Paiement reçu' && <CreditCard className="w-3 h-3" />}
                        {entry.type === 'Autre revenu' && <TrendingUp className="w-3 h-3" />}
                        {entry.type === 'Dépense' && <Receipt className="w-3 h-3" />}
                        <span>{entry.type}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1A1A18] whitespace-nowrap">
                      {entry.thirdParty}
                    </td>
                    <td className="px-4 py-3 text-[#7A7A72] max-w-xs truncate">
                      {entry.description}
                    </td>
                    <td className="px-4 py-3 text-[#7A7A72] whitespace-nowrap">
                      {entry.paymentMethod || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          entry.status === 'Payée' || entry.status === 'Encaissé' || entry.status === 'Payé'
                            ? 'bg-emerald-50 text-emerald-700'
                            : entry.status === 'En attente'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-[#FAFAF8] text-[#7A7A72]'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold whitespace-nowrap text-sm ${
                        entry.flowType === 'credit' ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {entry.flowType === 'credit' ? '+' : '-'}
                      {entry.amount.toLocaleString('fr-FR')} {sym}
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
