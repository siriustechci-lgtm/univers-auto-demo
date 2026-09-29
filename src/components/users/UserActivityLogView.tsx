import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import { ActivityActionType } from '../../types';
import {
  History,
  Search,
  Filter,
  Trash2,
  Calendar,
  User,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { EmptyState } from '../EmptyState';

export const UserActivityLogView: React.FC = () => {
  const { auditLogs, clearAuditLogs, currentUser } = useAuth();
  const { addToast } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');

  const isAdmin = currentUser?.role === 'Administrateur';

  const handleClearLogs = () => {
    if (!isAdmin) return;
    if (window.confirm('Voulez-vous réinitialiser le journal d\'activité ?')) {
      clearAuditLogs();
      addToast({
        title: 'Journal effacé',
        message: 'L\'historique des actions récentes a été vidé.',
        type: 'info',
      });
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction =
      selectedActionFilter === 'all' || log.actionType === selectedActionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: ActivityActionType) => {
    switch (action) {
      case 'Connexion':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Création':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Modification':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Suppression':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Paiement':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Vente':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Location':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Statut':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5DF] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
            <History className="w-5 h-5 text-[#5A5A40]" />
            <span>Journal d'Activité & Traçabilité</span>
          </h2>
          <p className="text-xs text-[#7A7A72]">
            Historique chronologique certifié des connexions et des opérations enregistrées sur l'application
          </p>
        </div>

        {isAdmin && auditLogs.length > 0 && (
          <button
            type="button"
            onClick={handleClearLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E5DF] text-xs font-semibold text-[#7A7A72] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vider le journal</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      {auditLogs.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par utilisateur, module ou description..."
              className="w-full pl-9.5 pr-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Toutes les actions' },
              { id: 'Connexion', label: 'Connexions' },
              { id: 'Création', label: 'Créations' },
              { id: 'Modification', label: 'Modifications' },
              { id: 'Suppression', label: 'Suppressions' },
              { id: 'Statut', label: 'Statuts' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedActionFilter(f.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedActionFilter === f.id
                    ? 'bg-[#5A5A40] text-white shadow-xs'
                    : 'bg-[#FAFAF8] text-[#5A5A52] border border-[#E5E5DF] hover:bg-[#F0F0EB]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List or Empty State */}
      {auditLogs.length === 0 ? (
        <EmptyState
          id="empty-audit-logs"
          icon={<History className="w-8 h-8 text-[#5A5A40]" />}
          title="Aucune activité enregistrée"
          description="Les actions importantes effectuées par les utilisateurs (connexions, ajouts, modifications) apparaîtront automatiquement ici en temps réel."
        />
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-xs text-[#7A7A72] border border-dashed border-[#E5E5DF] rounded-2xl">
          Aucun événement ne correspond à vos critères de recherche.
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E5E5DF] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase tracking-wider font-semibold border-b border-[#E5E5DF]">
                <tr>
                  <th className="px-4 py-3">Date & Heure</th>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Type d'action</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F9F9F6] transition-colors">
                    {/* Timestamp */}
                    <td className="px-4 py-3 text-[#7A7A72] font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#9A9A92]" />
                        <span>
                          {new Date(log.timestamp).toLocaleString('fr-FR', {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                          })}
                        </span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3 font-semibold text-[#1A1A18] whitespace-nowrap">
                      {log.userName}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[10px] font-bold text-[#5A5A40] uppercase bg-[#5A5A40]/10 px-2 py-0.5 rounded-md">
                        {log.userRole}
                      </span>
                    </td>

                    {/* Action Type */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] uppercase tracking-wider ${getActionBadge(
                          log.actionType
                        )}`}
                      >
                        {log.actionType}
                      </span>
                    </td>

                    {/* Module */}
                    <td className="px-4 py-3 font-medium text-[#5A5A52] whitespace-nowrap">
                      {log.module}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3 text-[#1A1A18] min-w-[200px]">
                      {log.description}
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
