import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import { User, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Filter,
  Eye,
  Edit2,
  Power,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  History,
  UserCheck,
  UserX,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { EmptyState } from '../EmptyState';
import { UserModal } from './UserModal';
import { UserDetailModal } from './UserDetailModal';
import { UserDeactivateConfirmModal } from './UserDeactivateConfirmModal';
import { RolesPermissionsMatrix } from './RolesPermissionsMatrix';
import { UserActivityLogView } from './UserActivityLogView';

export const UsersView: React.FC = () => {
  const {
    users,
    currentUser,
    toggleUserStatus,
    deleteUser,
    activeProfileTab,
    setIsProfileModalOpen,
  } = useAuth();
  const { addToast } = useCrm();

  // Navigation tab within the Users module
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'activity'>('users');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [userToView, setUserToView] = useState<User | null>(null);

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);

  const isAdmin = currentUser?.role === 'Directeur' || currentUser?.role === 'Administrateur';

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive !== false).length;
  const inactiveUsers = users.filter((u) => u.isActive === false).length;

  // Handlers
  const handleOpenAddUser = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setUserToEdit(user);
    setIsUserModalOpen(true);
  };

  const handleOpenViewUser = (user: User) => {
    setUserToView(user);
    setIsDetailModalOpen(true);
  };

  const handleOpenDeactivateModal = (user: User) => {
    if (user.role === 'Directeur') {
      addToast({
        title: 'Action non autorisée',
        message: 'Le compte Directeur principal ne peut pas être désactivé.',
        type: 'error',
      });
      return;
    }
    setUserToDeactivate(user);
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmDeactivation = () => {
    if (!userToDeactivate) return;
    if (userToDeactivate.role === 'Directeur') {
      addToast({
        title: 'Action non autorisée',
        message: 'Le compte Directeur ne peut pas être désactivé.',
        type: 'error',
      });
      setUserToDeactivate(null);
      return;
    }
    const newStatus = toggleUserStatus(userToDeactivate.id);
    addToast({
      title: newStatus ? 'Compte réactivé' : 'Compte désactivé',
      message: newStatus
        ? `L'utilisateur ${userToDeactivate.fullName} peut de nouveau se connecter.`
        : `L'accès de ${userToDeactivate.fullName} a été suspendu. L'historique des opérations est conservé.`,
      type: newStatus ? 'success' : 'info',
    });
    setUserToDeactivate(null);
  };

  const handleDeleteUser = (user: User) => {
    if (user.role === 'Directeur') {
      addToast({
        title: 'Action non autorisée',
        message: 'Le compte Directeur principal ne peut pas être supprimé.',
        type: 'error',
      });
      return;
    }

    if (currentUser?.id === user.id) {
      addToast({
        title: 'Action impossible',
        message: 'Vous ne pouvez pas supprimer votre propre compte.',
        type: 'error',
      });
      return;
    }

    if (window.confirm(`Supprimer définitivement l'utilisateur ${user.fullName} ?`)) {
      deleteUser(user.id);
      addToast({
        title: 'Utilisateur supprimé',
        message: `Le compte ${user.fullName} a été retiré.`,
        type: 'info',
      });
    }
  };

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery)) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    const isActive = u.isActive !== false;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'inactive' && !isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Directeur':
      case 'Administrateur':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Gestionnaire':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Commercial':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Caissier':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Comptable':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Agent':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A18] font-['Outfit'] tracking-tight">
              Utilisateurs & Permissions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20">
              {totalUsers} compte{totalUsers > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A7A72] mt-1">
            Gérez les comptes des collaborateurs de votre agence et contrôlez leurs droits d'accès
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <button
              id="add-user-btn"
              onClick={handleOpenAddUser}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouveau collaborateur</span>
            </button>
          )}

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E5DF] hover:bg-[#FAFAF8] text-[#1A1A18] font-semibold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer"
          >
            <Shield className="w-4 h-4 text-[#5A5A40]" />
            <span>Mon Profil</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => {
            setStatusFilter('all');
            setRoleFilter('all');
          }}
          className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-2xs cursor-pointer hover:border-[#5A5A40] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7A7A72]">Total Utilisateurs</span>
            <Users className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <p className="text-2xl font-extrabold text-[#1A1A18] font-['Outfit'] mt-2">
            {totalUsers}
          </p>
          <span className="text-[10px] text-[#7A7A72]">Équipe globale</span>
        </div>

        <div
          onClick={() => setStatusFilter('active')}
          className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-2xs cursor-pointer hover:border-emerald-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7A7A72]">Comptes Actifs</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 font-['Outfit'] mt-2">
            {activeUsers}
          </p>
          <span className="text-[10px] text-emerald-700">Accès autorisés</span>
        </div>

        <div
          onClick={() => setStatusFilter('inactive')}
          className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-2xs cursor-pointer hover:border-rose-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7A7A72]">Désactivés</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 font-['Outfit'] mt-2">
            {inactiveUsers}
          </p>
          <span className="text-[10px] text-rose-700">Accès suspendus</span>
        </div>

        <div
          onClick={() => setActiveTab('roles')}
          className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-2xs cursor-pointer hover:border-purple-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7A7A72]">Rôles Définis</span>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-600 font-['Outfit'] mt-2">
            6
          </p>
          <span className="text-[10px] text-purple-700">Directeur, Gest, Comm, Caisse...</span>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E5DF] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#FAFAF8]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Liste des Utilisateurs</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 ml-1">
            {filteredUsers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'roles'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#FAFAF8]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Rôles & Permissions</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'activity'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#FAFAF8]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Journal d'Activité</span>
        </button>
      </div>

      {/* ================= TAB 1: LISTE DES UTILISATEURS ================= */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 sm:p-6 shadow-xs space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
              <input
                id="search-users-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, email, téléphone ou rôle..."
                className="w-full pl-9.5 pr-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Role filter */}
              <select
                id="filter-users-role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs font-semibold text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="all">Tous les rôles</option>
                <option value="Directeur">Directeurs</option>
                <option value="Gestionnaire">Gestionnaires</option>
                <option value="Commercial">Commerciaux</option>
                <option value="Caissier">Caissiers</option>
                <option value="Comptable">Comptables</option>
                <option value="Agent">Agents</option>
              </select>

              {/* Status filter */}
              <select
                id="filter-users-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs font-semibold text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs uniquement</option>
                <option value="inactive">Désactivés</option>
              </select>
            </div>
          </div>

          {/* List or Empty State */}
          {users.length === 0 ? (
            <EmptyState
              id="empty-users-state"
              icon={<Users className="w-8 h-8 text-[#5A5A40]" />}
              title="Aucun utilisateur enregistré"
              description="Créez des comptes pour vos collaborateurs pour leur donner accès au CRM selon leurs responsabilités."
              actionText="Ajouter un utilisateur"
              onAction={handleOpenAddUser}
            />
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#7A7A72] border border-dashed border-[#E5E5DF] rounded-2xl">
              Aucun utilisateur ne correspond aux filtres sélectionnés.
            </div>
          ) : (
            <>
              {/* Desktop & Tablet Table (Hidden on small mobile) */}
              <div className="hidden md:block rounded-2xl border border-[#E5E5DF] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase tracking-wider font-semibold border-b border-[#E5E5DF]">
                      <tr>
                        <th className="px-4 py-3">Nom</th>
                        <th className="px-4 py-3">Téléphone</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Rôle</th>
                        <th className="px-4 py-3 text-center">Statut</th>
                        <th className="px-4 py-3">Dernière connexion</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5DF]">
                      {filteredUsers.map((u) => {
                        const isActive = u.isActive !== false;
                        const isSelf = currentUser?.id === u.id;

                        return (
                          <tr key={u.id} className="hover:bg-[#F9F9F6] transition-colors">
                            {/* Nom */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                  {u.fullName.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <span className="font-bold text-[#1A1A18] block flex items-center gap-1.5">
                                    {u.fullName}
                                    {isSelf && (
                                      <span className="text-[10px] text-[#5A5A40] font-medium bg-[#5A5A40]/10 px-1.5 py-0.2 rounded-sm">
                                        (Vous)
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[11px] text-[#7A7A72] font-mono">
                                    @{u.username || u.email.split('@')[0]}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Téléphone */}
                            <td className="px-4 py-3 text-[#5A5A52] font-mono whitespace-nowrap">
                              {u.phone || '—'}
                            </td>

                            {/* Email */}
                            <td className="px-4 py-3 text-[#1A1A18] font-medium whitespace-nowrap">
                              {u.email}
                            </td>

                            {/* Rôle */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] uppercase tracking-wider ${getRoleBadgeStyle(
                                  u.role
                                )}`}
                              >
                                {u.role}
                              </span>
                            </td>

                            {/* Statut */}
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                  isActive
                                    ? 'bg-[#4A7A4A]/10 text-[#4A7A4A]'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {isActive ? 'Actif' : 'Désactivé'}
                              </span>
                            </td>

                            {/* Dernière connexion */}
                            <td className="px-4 py-3 text-[#7A7A72] text-[11px] whitespace-nowrap">
                              {u.lastLogin ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#9A9A92]" />
                                  <span>
                                    {new Date(u.lastLogin).toLocaleString('fr-FR', {
                                      dateStyle: 'short',
                                      timeStyle: 'short',
                                    })}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[#9A9A92] italic">Jamais connecté</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                {/* Voir */}
                                <button
                                  onClick={() => handleOpenViewUser(u)}
                                  className="p-1.5 rounded-lg text-[#5A5A40] hover:bg-[#5A5A40]/10 transition-colors cursor-pointer"
                                  title="Consulter la fiche profil"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Modifier */}
                                {isAdmin && (
                                  <button
                                    onClick={() => handleOpenEditUser(u)}
                                    className="p-1.5 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                                    title="Modifier l'utilisateur"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Activer / Désactiver */}
                                {isAdmin && !isSelf && (
                                  <button
                                    onClick={() => handleOpenDeactivateModal(u)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                                      isActive
                                        ? 'text-amber-700 hover:bg-amber-50'
                                        : 'text-emerald-700 hover:bg-emerald-50'
                                    }`}
                                    title={isActive ? 'Désactiver le compte' : 'Réactiver le compte'}
                                  >
                                    {isActive ? 'Désactiver' : 'Activer'}
                                  </button>
                                )}

                                {/* Supprimer */}
                                {isAdmin && !isSelf && (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    className="p-1.5 rounded-lg text-[#7A7A72] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
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
              </div>

              {/* Mobile Cards View (Visible on small screens) */}
              <div className="md:hidden space-y-3">
                {filteredUsers.map((u) => {
                  const isActive = u.isActive !== false;
                  const isSelf = currentUser?.id === u.id;

                  return (
                    <div
                      key={u.id}
                      className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center font-bold text-sm uppercase">
                            {u.fullName.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#1A1A18]">
                              {u.fullName}
                              {isSelf && (
                                <span className="ml-1.5 text-[10px] text-[#5A5A40] bg-[#5A5A40]/10 px-1.5 py-0.2 rounded-sm">
                                  (Vous)
                                </span>
                              )}
                            </h4>
                            <p className="text-xs text-[#7A7A72] font-mono">{u.email}</p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getRoleBadgeStyle(
                            u.role
                          )}`}
                        >
                          {u.role}
                        </span>
                      </div>

                      {/* Info lines */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#E5E5DF]">
                        <div>
                          <span className="text-[10px] text-[#7A7A72] block">Téléphone</span>
                          <span className="font-mono text-[#1A1A18]">{u.phone || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#7A7A72] block">Statut</span>
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              isActive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                            }`}
                          >
                            {isActive ? 'Actif' : 'Désactivé'}
                          </span>
                        </div>
                      </div>

                      {/* Last login */}
                      <div className="text-[11px] text-[#7A7A72] flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#9A9A92]" />
                        <span>
                          Dernière connexion :{' '}
                          {u.lastLogin
                            ? new Date(u.lastLogin).toLocaleDateString('fr-FR')
                            : 'Jamais'}
                        </span>
                      </div>

                      {/* Mobile action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E5DF]">
                        <button
                          type="button"
                          onClick={() => handleOpenViewUser(u)}
                          className="px-3 py-1.5 rounded-xl border border-[#E5E5DF] text-xs font-semibold text-[#5A5A52] hover:bg-white transition-colors"
                        >
                          Voir
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditUser(u)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DF] text-xs font-semibold text-[#5A5A40] hover:bg-[#FAFAF8] transition-colors"
                          >
                            Modifier
                          </button>
                        )}
                        {isAdmin && !isSelf && (
                          <button
                            type="button"
                            onClick={() => handleOpenDeactivateModal(u)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                              isActive
                                ? 'text-amber-700 bg-amber-50'
                                : 'text-emerald-700 bg-emerald-50'
                            }`}
                          >
                            {isActive ? 'Désactiver' : 'Activer'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= TAB 2: RÔLES & PERMISSIONS ================= */}
      {activeTab === 'roles' && <RolesPermissionsMatrix />}

      {/* ================= TAB 3: JOURNAL D'ACTIVITÉ ================= */}
      {activeTab === 'activity' && <UserActivityLogView />}

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setUserToEdit(null);
        }}
        userToEdit={userToEdit}
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setUserToView(null);
        }}
        user={userToView}
        onEdit={(u) => handleOpenEditUser(u)}
        onToggleStatus={(u) => handleOpenDeactivateModal(u)}
        onDelete={(u) => handleDeleteUser(u)}
      />

      <UserDeactivateConfirmModal
        isOpen={isDeactivateModalOpen}
        onClose={() => {
          setIsDeactivateModalOpen(false);
          setUserToDeactivate(null);
        }}
        user={userToDeactivate}
        onConfirm={handleConfirmDeactivation}
      />
    </div>
  );
};
