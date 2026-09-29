import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import {
  ShieldCheck,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  KeyRound,
} from 'lucide-react';

export const FirstLoginModal: React.FC = () => {
  const { currentUser, completeFirstLogin } = useAuth();
  const { addToast } = useCrm();

  // If user is not logged in or has already completed first login, do not show
  if (!currentUser || currentUser.isFirstLogin !== true) {
    return null;
  }

  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedFullName = fullName.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim();

    if (!trimmedFullName) {
      setError('Veuillez renseigner votre nom complet.');
      return;
    }

    if (!trimmedUsername) {
      setError("Veuillez renseigner votre nom d'utilisateur.");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      completeFirstLogin(
        {
          fullName: trimmedFullName,
          username: trimmedUsername,
          email: trimmedEmail,
          phone: phone.trim(),
        },
        newPassword ? newPassword.trim() : undefined
      );

      addToast({
        title: 'Première connexion validée',
        message: 'Votre compte Directeur est configuré avec succès. Bienvenue sur Sirius Auto CRM !',
        type: 'success',
      });
    } catch {
      setError('Une erreur est survenue lors de la configuration de votre compte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickContinue = () => {
    setIsSubmitting(true);
    try {
      completeFirstLogin();
      addToast({
        title: 'Bienvenue sur Sirius Auto CRM',
        message: 'Configuration initiale validée avec succès.',
        type: 'success',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A18]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="first-login-modal"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E5E5DF] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-[#5A5A40] text-white px-6 py-5 shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-[#E5E5DF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Première Connexion — Compte Directeur
                </h2>
                <span className="text-[10px] uppercase font-bold bg-white/20 text-white px-2 py-0.5 rounded-md">
                  Initialisation
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Vérifiez vos informations de responsable et personnalisez vos accès
              </p>
            </div>
          </div>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4.5 flex-1 text-left">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
            <p className="text-xs text-[#5A5A52] leading-relaxed">
              En tant que <strong className="text-[#1A1A18]">Directeur</strong>, vous disposez des droits complets d'administration (Parc automobile, Ventes, Locations, Finances, Équipe et Paramètres).
            </p>
          </div>

          {/* Nom & Prénom */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
              Nom complet du Directeur *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex : Directeur Général ou Jean Dupont"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Identifiant */}
            <div>
              <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                Identifiant de connexion *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="directeur"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] font-mono focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
                Téléphone professionnel
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex : 06 12 34 56 78"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
              Adresse e-mail professionnelle
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex : contact@entreprise.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Nouveau mot de passe (optionnel) */}
          <div className="pt-2 border-t border-[#E5E5DF]/70">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#2D2D2A]">
                Personnaliser le mot de passe (optionnel)
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#5A5A40] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Masquer' : 'Afficher'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] font-mono focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer mot de passe"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs sm:text-sm text-[#1A1A18] font-mono focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
            <p className="mt-1 text-[11px] text-[#7A7A72]">
              Laissez vide pour conserver le mot de passe actuel.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#E5E5DF] flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleQuickContinue}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 text-xs text-[#5A5A52] hover:text-[#1A1A18] hover:bg-[#F5F5F0] rounded-xl font-medium transition-colors cursor-pointer"
            >
              Conserver par défaut & Continuer
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484832] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <span>Valider & Accéder au CRM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
