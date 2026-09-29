import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import { UserRole, User } from '../../types';
import {
  User as UserIcon,
  Shield,
  KeyRound,
  Laptop,
  Smartphone,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  UserPlus,
  Trash2,
  Building2,
  Sparkles,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Upload,
} from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    users,
    isProfileModalOpen,
    setIsProfileModalOpen,
    activeProfileTab,
    setActiveProfileTab,
    updateUserProfile,
    changeUserPassword,
    logoutOtherDevices,
    logout,
    addUser,
    updateUserRole,
    deleteUser,
    switchActiveUser,
  } = useAuth();

  const { addToast } = useCrm();

  // Personal Info Form State
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Teammate Form State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newTeammateName, setNewTeammateName] = useState('');
  const [newTeammateEmail, setNewTeammateEmail] = useState('');
  const [newTeammatePhone, setNewTeammatePhone] = useState('');
  const [newTeammateRole, setNewTeammateRole] = useState<UserRole>('Commercial');

  if (!isProfileModalOpen || !currentUser) return null;

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      addToast({
        title: 'Erreur',
        message: 'Le nom complet et l\'adresse e-mail sont obligatoires.',
        type: 'error',
      });
      return;
    }

    updateUserProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      avatarUrl: avatarUrl.trim(),
    });

    addToast({
      title: 'Profil mis à jour',
      message: 'Vos informations personnelles ont été enregistrées.',
      type: 'success',
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setSecurityMessage({
        type: 'error',
        text: 'Le nouveau mot de passe doit comporter au moins 6 caractères.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityMessage({
        type: 'error',
        text: 'Les nouveaux mots de passe ne correspondent pas.',
      });
      return;
    }

    const res = changeUserPassword(currentPassword, newPassword);
    if (res.success) {
      setSecurityMessage({
        type: 'success',
        text: 'Votre mot de passe a été modifié avec succès.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setSecurityMessage({
        type: 'error',
        text: res.message || 'Erreur lors du changement de mot de passe.',
      });
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCreateTeammate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeammateName.trim() || !newTeammateEmail.trim()) {
      addToast({
        title: 'Erreur',
        message: 'Nom et e-mail sont requis pour créer un collaborateur.',
        type: 'error',
      });
      return;
    }

    addUser({
      fullName: newTeammateName.trim(),
      email: newTeammateEmail.trim(),
      phone: newTeammatePhone.trim(),
      role: newTeammateRole,
    });

    addToast({
      title: 'Collaborateur ajouté',
      message: `${newTeammateName} a été ajouté avec le rôle ${newTeammateRole}.`,
      type: 'success',
    });

    setNewTeammateName('');
    setNewTeammateEmail('');
    setNewTeammatePhone('');
    setIsAddingUser(false);
  };

  const roleDescriptions: Record<UserRole, { badge: string; desc: string; color: string }> = {
    Directeur: {
      badge: 'Direction & Master',
      desc: 'Accès complet : gestion totale de l\'entreprise BANESERVICES AUTO, parc, ventes, locations, finances, rapports et utilisateurs.',
      color: 'bg-purple-700 text-white',
    },
    Administrateur: {
      badge: 'Accès complet',
      desc: 'Gestion totale : flotte, ventes, locations, finances, facturation, configuration de l\'agence et gestion des utilisateurs.',
      color: 'bg-[#5A5A40] text-white',
    },
    Gestionnaire: {
      badge: 'Gestion opérationnelle',
      desc: 'Supervision complète des véhicules, contrats de location, ventes, maintenance, fournisseurs et fiches clients.',
      color: 'bg-[#4A6B82] text-white',
    },
    Commercial: {
      badge: 'Ventes & Locations',
      desc: 'Saisie et conclusion des ventes et contrats de location, prospection, consultation de la flotte et des clients.',
      color: 'bg-[#4A7A4A] text-white',
    },
    Caissier: {
      badge: 'Paiements & Caisse',
      desc: 'Gestion et encaissement des règlements financiers, cautions, reçus et flux de caisse.',
      color: 'bg-[#7A5A82] text-white',
    },
    Comptable: {
      badge: 'Finances & Comptabilité',
      desc: 'Gestion financière complète, suivi des règlements, factures, dépenses, revenus et rapports analytiques.',
      color: 'bg-[#3B5998] text-white',
    },
    Agent: {
      badge: 'Opérations terrain',
      desc: 'Consultation du parc de véhicules, suivi des départs et réceptions de contrats de location autorisés.',
      color: 'bg-[#5C6B73] text-white',
    },
  };

  return (
    <div
      id="user-profile-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl border border-[#E5E5DF] shadow-2xl max-w-3xl w-full overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header with User Info Banner */}
        <div className="p-6 bg-[#FAFAF8] border-b border-[#E5E5DF] flex items-center justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={currentUser.fullName}
                className="w-14 h-14 rounded-2xl object-cover border border-[#E5E5DF] shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#5A5A40] flex items-center justify-center text-white text-xl font-bold font-['Outfit'] shadow-xs">
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                  {currentUser.fullName || 'Veuillez compléter votre profil'}
                </h2>
                <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg ${roleDescriptions[currentUser.role].color}`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-[#7A7A72] mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            className="p-2 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0EFEB] transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E5DF] bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveProfileTab('profile')}
            className={`py-3.5 px-4 flex items-center gap-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeProfileTab === 'profile'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Informations personnelles</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveProfileTab('security')}
            className={`py-3.5 px-4 flex items-center gap-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeProfileTab === 'security'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Sécurité & Sessions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveProfileTab('team')}
            className={`py-3.5 px-4 flex items-center gap-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeProfileTab === 'team'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#7A7A72] hover:text-[#1A1A18]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Équipe & Rôles ({users.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: INFORMATIONS PERSONNELLES */}
          {activeProfileTab === 'profile' && (
            <form onSubmit={handleSavePersonalInfo} className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo de profil */}
                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Photo" className="w-12 h-12 rounded-xl object-cover border border-[#E5E5DF]" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#EAEAE5] flex items-center justify-center text-[#7A7A72]">
                        <UserIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-[#1A1A18] block">Photo de profil</span>
                      <span className="text-[11px] text-[#7A7A72]">Personnalisez votre avatar</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="text-xs text-rose-500 hover:underline cursor-pointer"
                      >
                        Supprimer
                      </button>
                    )}
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F0EFEB] text-[#1A1A18] border border-[#E5E5DF] text-xs font-semibold transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span>{avatarUrl ? 'Changer' : 'Téléverser'}</span>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Nom complet */}
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Nom complet
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Prénom et Nom"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 00 00 00 00"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                    />
                  </div>
                </div>

                {/* Adresse e-mail */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                    Adresse e-mail professionnelle
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@agence.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5DF] flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SÉCURITÉ */}
          {activeProfileTab === 'security' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Changer mot de passe */}
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7A72] border-b border-[#E5E5DF] pb-2">
                  Changer votre mot de passe
                </h3>

                {securityMessage && (
                  <div
                    className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 ${
                      securityMessage.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-700'
                    }`}
                  >
                    {securityMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <span>{securityMessage.text}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7A72] hover:text-[#1A1A18] p-1 cursor-pointer"
                      >
                        {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 caractères"
                        className="w-full pl-10 pr-10 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7A72] hover:text-[#1A1A18] p-1 cursor-pointer"
                      >
                        {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Répéter mot de passe"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-sm text-[#1A1A18] focus:outline-hidden focus:border-[#5A5A40] font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Mettre à jour le mot de passe</span>
                  </button>
                </div>
              </form>

              {/* Déconnexion des autres appareils */}
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-[#5A5A40]" />
                    <span className="text-xs font-bold text-[#1A1A18]">Sessions & Appareils connectés</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Session active
                  </span>
                </div>

                <p className="text-[11px] text-[#7A7A72] leading-relaxed">
                  Si vous avez laissé votre compte ouvert sur un autre poste de travail ou appareil mobile, vous pouvez forcer la déconnexion immédiate de toutes les autres sessions.
                </p>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      logoutOtherDevices();
                      addToast({
                        title: 'Sessions réinitialisées',
                        message: 'Toutes les autres sessions ont été déconnectées avec succès.',
                        type: 'info',
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F0EFEB] text-[#2D2D2A] border border-[#E5E5DF] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Déconnexion des autres appareils</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ÉQUIPE & GESTION DES RÔLES */}
          {activeProfileTab === 'team' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7A72]">
                    Collaborateurs & Rôles
                  </h3>
                  <p className="text-[11px] text-[#7A7A72] mt-0.5">
                    Gérez les permissions de votre équipe pour chaque collaborateur
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingUser(!isAddingUser)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Ajouter un membre</span>
                </button>
              </div>

              {/* Add Teammate Drawer */}
              {isAddingUser && (
                <form onSubmit={handleCreateTeammate} className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-3">
                  <h4 className="text-xs font-bold text-[#1A1A18]">Nouveau collaborateur</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2D2D2A] mb-1">Nom complet</label>
                      <input
                        type="text"
                        value={newTeammateName}
                        onChange={(e) => setNewTeammateName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#1A1A18]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2D2D2A] mb-1">Adresse e-mail</label>
                      <input
                        type="email"
                        value={newTeammateEmail}
                        onChange={(e) => setNewTeammateEmail(e.target.value)}
                        placeholder="jean@monagence.com"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#1A1A18]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2D2D2A] mb-1">Téléphone</label>
                      <input
                        type="tel"
                        value={newTeammatePhone}
                        onChange={(e) => setNewTeammatePhone(e.target.value)}
                        placeholder="06 11 22 33 44"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#1A1A18]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2D2D2A] mb-1">Rôle & Permissions</label>
                      <select
                        value={newTeammateRole}
                        onChange={(e) => setNewTeammateRole(e.target.value as UserRole)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#1A1A18]"
                      >
                        <option value="Directeur">Directeur (Accès complet & administration)</option>
                        <option value="Gestionnaire">Gestionnaire (Parc, ventes, locations, contrats)</option>
                        <option value="Commercial">Commercial (Clients, prospects, ventes, devis)</option>
                        <option value="Caissier">Caissier (Paiements, encaissements, reçus)</option>
                        <option value="Comptable">Comptable (Finances, dépenses, revenus, rapports)</option>
                        <option value="Agent">Agent (Opérations terrain, réceptions véhicules)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingUser(false)}
                      className="px-3 py-1.5 rounded-xl bg-white text-xs font-semibold text-[#7A7A72] border border-[#E5E5DF]"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#5A5A40] text-white text-xs font-bold"
                    >
                      Enregistrer le collaborateur
                    </button>
                  </div>
                </form>
              )}

              {/* Teammates List */}
              <div className="space-y-2.5">
                {users.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] text-center text-xs text-[#7A7A72]">
                    Aucune information enregistrée
                  </div>
                ) : (
                  users.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    return (
                      <div
                        key={u.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between flex-wrap gap-3 transition-colors ${
                          isSelf ? 'bg-[#FAFAF8] border-[#5A5A40]/40' : 'bg-white border-[#E5E5DF]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#EAEAE5] flex items-center justify-center text-sm font-bold text-[#1A1A18]">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#1A1A18]">{u.fullName}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded-md bg-[#5A5A40]/10 text-[#5A5A40] text-[10px] font-bold">
                                  Vous
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#7A7A72]">{u.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Role Selector */}
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                            className="px-2.5 py-1 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs font-semibold text-[#1A1A18] cursor-pointer"
                          >
                            <option value="Administrateur">Administrateur</option>
                            <option value="Gestionnaire">Gestionnaire</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Caissier">Caissier</option>
                          </select>

                          {/* Switch User (For testing role permissions) */}
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => switchActiveUser(u.id)}
                              className="px-2.5 py-1 rounded-xl bg-[#EAEAE5] hover:bg-[#E0E0DA] text-[11px] font-bold text-[#1A1A18] cursor-pointer transition-colors"
                              title="Changer de session pour tester les permissions de ce rôle"
                            >
                              Tester ce rôle
                            </button>
                          )}

                          {/* Delete */}
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Supprimer l'accès pour ${u.fullName} ?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-[#7A7A72] hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Detailed Roles Matrix */}
              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-3">
                <h4 className="text-xs font-bold text-[#1A1A18]">Guide des privilèges par rôle</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(roleDescriptions) as UserRole[]).map((r) => (
                    <div key={r} className="p-3 rounded-xl bg-white border border-[#E5E5DF] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1A1A18]">{r}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${roleDescriptions[r].color}`}>
                          {roleDescriptions[r].badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A7A72] leading-relaxed">
                        {roleDescriptions[r].desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Logout */}
        <div className="px-6 py-4 bg-[#FAFAF8] border-t border-[#E5E5DF] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setIsProfileModalOpen(false);
              logout();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-[#5A5A40] text-white text-xs font-bold hover:bg-[#484832] transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
