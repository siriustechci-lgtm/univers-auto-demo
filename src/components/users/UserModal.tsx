import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  AlertCircle,
  Sparkles,
  Percent,
  Target,
  Coins,
} from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
}) => {
  const { addUser, updateUser, users } = useAuth();
  const { addToast } = useCrm();

  const isEditMode = !!userToEdit;

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Commercial');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [monthlySalesGoal, setMonthlySalesGoal] = useState<number>(0);
  const [fixedSalary, setFixedSalary] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'UA';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '2026!';
    setPassword(pass);
  };

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFullName(userToEdit.fullName || '');
        setUsername(userToEdit.username || userToEdit.email.split('@')[0] || '');
        setPhone(userToEdit.phone || '');
        setEmail(userToEdit.email || '');
        setRole(userToEdit.role || 'Commercial');
        setIsActive(userToEdit.isActive !== false);
        setCommissionRate(userToEdit.commissionRate || 0);
        setMonthlySalesGoal(userToEdit.monthlySalesGoal || 0);
        setFixedSalary(userToEdit.fixedSalary || 0);
        setPassword('');
      } else {
        setFullName('');
        setUsername('');
        setPhone('');
        setEmail('');
        setRole('Commercial');
        setIsActive(true);
        setCommissionRate(2.5); // Default 2.5% commission
        setMonthlySalesGoal(15000000); // Default 15M FCFA goal
        setFixedSalary(0);
        generateStrongPassword();
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen, userToEdit]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Le nom complet est obligatoire.';
    }

    if (!username.trim()) {
      newErrors.username = "Le nom d'utilisateur est obligatoire.";
    } else {
      const usernameLower = username.trim().toLowerCase();
      const duplicateUsername = users.find(
        (u) =>
          (u.username || '').toLowerCase() === usernameLower &&
          (!isEditMode || u.id !== userToEdit?.id)
      );
      if (duplicateUsername) {
        newErrors.username = "Ce nom d'utilisateur est déjà utilisé.";
      }
    }

    if (!isEditMode && !password.trim()) {
      newErrors.password = 'Veuillez définir un mot de passe initial.';
    } else if (password.trim() && password.trim().length < 4) {
      newErrors.password = 'Le mot de passe doit comporter au moins 4 caractères.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditMode && userToEdit) {
      updateUser(
        userToEdit.id,
        {
          fullName: fullName.trim(),
          username: username.trim().toLowerCase(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          role,
          isActive,
          commissionRate: Number(commissionRate) || 0,
          monthlySalesGoal: Number(monthlySalesGoal) || 0,
          fixedSalary: Number(fixedSalary) || 0,
        },
        password.trim() || undefined
      );

      addToast({
        title: 'Utilisateur mis à jour',
        message: `Les informations de ${fullName.trim()} (@${username.trim()}) ont été enregistrées avec succès.`,
        type: 'success',
      });
    } else {
      addUser(
        {
          fullName: fullName.trim(),
          username: username.trim().toLowerCase(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          role,
          isActive,
          commissionRate: Number(commissionRate) || 0,
          monthlySalesGoal: Number(monthlySalesGoal) || 0,
          fixedSalary: Number(fixedSalary) || 0,
        },
        password.trim()
      );

      addToast({
        title: 'Utilisateur créé',
        message: `Le compte pour ${fullName.trim()} (@${username.trim()}) a été créé. Il peut se connecter immédiatement.`,
        type: 'success',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#0C0E13] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#232733] space-y-6 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#232733] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E50914]/15 text-[#E50914] flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                {isEditMode ? 'Modifier l’employé' : 'Ajouter un nouvel employé'}
              </h2>
              <p className="text-xs text-[#85878A]">
                {isEditMode
                  ? 'Mettez à jour les informations, rôles, commissions et objectifs'
                  : 'Créez un nouvel accès pour un membre de votre équipe UNIVERS AUTO'}
              </p>
            </div>
          </div>

          <button
            id="close-user-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#85878A] hover:text-white hover:bg-[#1A1D26] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* 1. Nom complet & Nom d'utilisateur */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1.5">
                Nom complet <span className="text-[#E50914]">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878A]" />
                <input
                  id="user-fullname-input"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (!isEditMode && !username) {
                      const auto = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '.');
                      setUsername(auto);
                    }
                  }}
                  placeholder="Ex : Moussa Diop"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#14161E] border text-xs sm:text-sm text-white placeholder-[#525765] focus:bg-[#181B24] focus:outline-hidden transition-all ${
                    errors.fullName ? 'border-[#E50914] focus:border-[#E50914]' : 'border-[#262A36] focus:border-[#E50914]'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-[#E50914] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1.5">
                Identifiant / Nom d'utilisateur <span className="text-[#E50914]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#85878A]">
                  @
                </span>
                <input
                  id="user-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="moussa.diop"
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#14161E] border text-xs sm:text-sm text-white font-mono placeholder-[#525765] focus:bg-[#181B24] focus:outline-hidden transition-all ${
                    errors.username ? 'border-[#E50914] focus:border-[#E50914]' : 'border-[#262A36] focus:border-[#E50914]'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="text-[11px] text-[#E50914] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.username}
                </p>
              )}
            </div>
          </div>

          {/* 2. Téléphone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1.5">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878A]" />
                <input
                  id="user-phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex : +221 77 000 00 00"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#14161E] border border-[#262A36] text-xs sm:text-sm text-white placeholder-[#525765] focus:border-[#E50914] focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#85878A] mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878A]" />
                <input
                  id="user-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="moussa@universauto.sn"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#14161E] border border-[#262A36] text-xs sm:text-sm text-white placeholder-[#525765] focus:border-[#E50914] focus:outline-hidden transition-all"
                />
              </div>
            </div>
          </div>

          {/* 3. Rôle & Permissions */}
          <div>
            <label className="block text-xs font-semibold text-[#85878A] mb-2 flex items-center justify-between">
              <span>Rôle & Niveau d'accès</span>
              <span className="text-[11px] text-[#85878A]">Définit les modules visibles</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'Commercial' as UserRole,
                  title: 'Commercial',
                  desc: 'Ventes, clients & réservations',
                },
                {
                  id: 'Gestionnaire' as UserRole,
                  title: 'Gestionnaire',
                  desc: 'Parc, achats & approvisionnements',
                },
                {
                  id: 'Administrateur' as UserRole,
                  title: 'Administrateur',
                  desc: 'Accès total & configuration',
                },
                {
                  id: 'Caissier' as UserRole,
                  title: 'Caissier',
                  desc: 'Paiements, encaissements & reçus',
                },
                {
                  id: 'Comptable' as UserRole,
                  title: 'Comptable',
                  desc: 'Finances, dépenses & bilans',
                },
                {
                  id: 'Agent' as UserRole,
                  title: 'Agent',
                  desc: 'Réception & inspection véhicules',
                },
              ].map((r) => {
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#E50914] bg-[#E50914]/10 ring-1 ring-[#E50914]'
                        : 'border-[#262A36] bg-[#12141A] hover:bg-[#181B24]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white font-['Outfit']">
                        {r.title}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#E50914]" />}
                    </div>
                    <p className="text-[10px] text-[#85878A] leading-tight">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Commissions et Objectifs Commerciaux */}
          <div className="p-3.5 rounded-2xl bg-[#12141B] border border-[#242834] space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Performances, Commissions & Objectifs</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#85878A] mb-1">
                  Commission sur vente (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#85878A]" />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={commissionRate || ''}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                    placeholder="Ex : 2.5"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#161822] border border-[#2A2E3C] text-xs text-white placeholder-[#525765] focus:border-[#E50914] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#85878A] mb-1">
                  Objectif mensuel de ventes (FCFA)
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#85878A]" />
                  <input
                    type="number"
                    step="500000"
                    min="0"
                    value={monthlySalesGoal || ''}
                    onChange={(e) => setMonthlySalesGoal(parseFloat(e.target.value) || 0)}
                    placeholder="Ex : 20000000"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#161822] border border-[#2A2E3C] text-xs text-white placeholder-[#525765] focus:border-[#E50914] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#85878A]">
                {isEditMode ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe temporaire'}{' '}
                {!isEditMode && <span className="text-[#E50914]">*</span>}
              </label>
              <button
                type="button"
                onClick={generateStrongPassword}
                className="text-[11px] font-semibold text-[#E50914] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Générer un mot de passe
              </button>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878A]" />
              <input
                id="user-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditMode ? 'Laisser vide pour conserver le mot de passe actuel' : 'Saisir ou générer un mot de passe'}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#14161E] border text-xs sm:text-sm font-mono text-white placeholder-[#525765] focus:bg-[#181B24] focus:outline-hidden transition-all ${
                  errors.password ? 'border-[#E50914]' : 'border-[#262A36] focus:border-[#E50914]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#85878A] hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-[#E50914] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.password}
              </p>
            )}
          </div>

          {/* 6. Statut */}
          {isEditMode && (
            <div className="pt-2 border-t border-[#232733]">
              <label className="flex items-center justify-between p-3 rounded-2xl border border-[#262A36] bg-[#12141A] cursor-pointer">
                <div>
                  <span className="font-semibold text-xs text-white block">Statut du compte</span>
                  <span className="text-[11px] text-[#85878A]">
                    {isActive
                      ? 'Compte actif : l\'utilisateur peut se connecter et opérer'
                      : 'Compte désactivé : accès bloqué, historique conservé'}
                  </span>
                </div>
                <input
                  id="user-status-toggle"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#E50914] rounded-sm focus:ring-[#E50914] border-[#262A36] cursor-pointer"
                />
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-[#232733] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#85878A] hover:text-white bg-[#14161E] hover:bg-[#1B1E28] rounded-xl border border-[#262A36] transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#B8000A] rounded-xl shadow-lg shadow-[#E50914]/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isEditMode ? 'Enregistrer les modifications' : 'Créer le compte'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
