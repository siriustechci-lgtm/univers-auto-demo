import React from 'react';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  Shield,
  Calendar,
  Clock,
  Edit2,
  Power,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  TrendingUp,
  Percent,
  Target,
  BadgePercent,
  Award,
} from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const { currentUser, auditLogs } = useAuth();
  const { sales, settings, addToast } = useCrm();

  if (!isOpen || !user) return null;

  const isSelf = currentUser?.id === user.id;
  const isActive = user.isActive !== false;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      title: 'Copié',
      message: `${label} copié dans le presse-papiers.`,
      type: 'info',
    });
  };

  const userLogs = auditLogs.filter((log) => log.userId === user.id).slice(0, 5);

  // Performance calculations
  const userSales = sales.filter(
    (s) =>
      s.sellerId === user.id ||
      (s.sellerName && (s.sellerName === user.fullName || s.sellerName === user.username))
  );

  const totalSalesCount = userSales.length;
  const totalRevenueGenerated = userSales.reduce(
    (sum, s) => sum + (s.finalPrice || s.totalAmount || 0),
    0
  );

  const commissionRate = user.commissionRate || 0;
  const estimatedCommissions = totalRevenueGenerated * (commissionRate / 100);

  const monthlyGoal = user.monthlySalesGoal || 0;
  const goalAchievementRate = monthlyGoal > 0 ? (totalRevenueGenerated / monthlyGoal) * 100 : 0;

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'Administrateur':
      case 'Directeur':
        return 'bg-[#E50914]/15 text-[#E50914] border-[#E50914]/30';
      case 'Gestionnaire':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Commercial':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Caissier':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#0C0E13] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#232733] space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#232733] pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E50914]/15 text-[#E50914] flex items-center justify-center font-bold text-lg uppercase shadow-xs">
              {user.fullName.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-['Outfit']">
                  {user.fullName}
                </h2>
                {isSelf && (
                  <span className="text-[10px] text-[#E50914] font-semibold bg-[#E50914]/10 border border-[#E50914]/30 px-2 py-0.5 rounded-md">
                    Vous
                  </span>
                )}
              </div>
              <p className="text-xs text-[#85878A] flex items-center gap-1 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-[#E50914]" />
                <span>@{user.username || user.email.split('@')[0]} · {user.role}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#85878A] hover:text-white hover:bg-[#1A1D26] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Role Badges */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#12141B] border border-[#232733]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#85878A]">Statut du compte :</span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {isActive ? 'Actif' : 'Désactivé'}
            </span>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getRoleBadgeStyle(
              user.role
            )}`}
          >
            {user.role}
          </span>
        </div>

        {/* Performance & Commercial Tracking */}
        <div className="p-4 rounded-2xl bg-[#12141B] border border-[#232733] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#E50914]" />
              <span>Performances Commerciales</span>
            </h3>
            {commissionRate > 0 && (
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {commissionRate}% comm.
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#161822] border border-[#262A36]">
              <span className="text-[10px] text-[#85878A] block">Ventes conclues</span>
              <span className="text-lg font-bold text-white font-['Outfit']">
                {totalSalesCount} <span className="text-xs font-normal text-[#85878A]">véhicule(s)</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#161822] border border-[#262A36]">
              <span className="text-[10px] text-[#85878A] block">Chiffre d’affaires généré</span>
              <span className="text-sm font-bold text-emerald-400 font-['Outfit'] block truncate">
                {totalRevenueGenerated.toLocaleString('fr-FR')} {settings.currencySymbol}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#161822] border border-[#262A36]">
              <span className="text-[10px] text-[#85878A] block">Commissions acquises</span>
              <span className="text-sm font-bold text-amber-400 font-['Outfit'] block truncate">
                {estimatedCommissions.toLocaleString('fr-FR')} {settings.currencySymbol}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#161822] border border-[#262A36]">
              <span className="text-[10px] text-[#85878A] block">Objectif mensuel</span>
              <span className="text-sm font-bold text-white font-['Outfit'] block truncate">
                {monthlyGoal > 0 ? `${monthlyGoal.toLocaleString('fr-FR')} ${settings.currencySymbol}` : 'Non défini'}
              </span>
            </div>
          </div>

          {monthlyGoal > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#85878A]">Taux de réalisation de l'objectif</span>
                <span className="font-bold text-white">{Math.round(goalAchievementRate)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#20232E] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#E50914] rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round(goalAchievementRate))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Contact Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-[#12141B] border border-[#232733] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Phone className="w-4 h-4 text-[#E50914] shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-[#85878A]">Téléphone</p>
                <p className="text-xs font-mono font-bold text-white truncate">
                  {user.phone || 'Non renseigné'}
                </p>
              </div>
            </div>
            {user.phone && (
              <button
                type="button"
                onClick={() => copyToClipboard(user.phone, 'Téléphone')}
                className="p-1 text-[#85878A] hover:text-white rounded-md hover:bg-[#1A1D26] cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-[#12141B] border border-[#232733] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Mail className="w-4 h-4 text-[#E50914] shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-[#85878A]">Email</p>
                <p className="text-xs font-medium text-white truncate">
                  {user.email || 'Non renseigné'}
                </p>
              </div>
            </div>
            {user.email && (
              <button
                type="button"
                onClick={() => copyToClipboard(user.email, 'Email')}
                className="p-1 text-[#85878A] hover:text-white rounded-md hover:bg-[#1A1D26] cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Recent user activity */}
        {userLogs.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Dernières actions enregistrées
            </h3>
            <div className="divide-y divide-[#232733] rounded-2xl border border-[#232733] overflow-hidden bg-[#12141B]">
              {userLogs.map((log) => (
                <div key={log.id} className="p-2.5 text-xs flex items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-white block">{log.description}</span>
                    <span className="text-[10px] text-[#85878A]">{log.module}</span>
                  </div>
                  <span className="text-[10px] text-[#85878A] shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#232733]">
          <div className="flex items-center gap-2">
            {!isSelf && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onToggleStatus(user);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                  isActive
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isActive ? 'Désactiver le compte' : 'Réactiver le compte'}</span>
              </button>
            )}

            {!isSelf && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(user);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(user);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#B8000A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Modifier la fiche</span>
          </button>
        </div>
      </div>
    </div>
  );
};
