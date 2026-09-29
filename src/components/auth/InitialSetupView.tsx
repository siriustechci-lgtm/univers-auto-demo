import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UniversAutoLogo } from '../common/UniversAutoLogo';
import {
  ShieldCheck,
  ArrowRight,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
  Sparkles,
  KeyRound,
  ArrowLeft,
  AlertCircle,
  Database,
} from 'lucide-react';

interface InitialSetupViewProps {
  initialStep?: 'welcome' | 'form';
  onBackToWelcome?: () => void;
  onFinish?: () => void;
}

export const InitialSetupView: React.FC<InitialSetupViewProps> = ({
  initialStep = 'form',
  onBackToWelcome,
  onFinish,
}) => {
  const { companyProfile, createInitialDirector, setIsFirstLaunch } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const companyName = companyProfile?.name || 'UNIVERS AUTO';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedFullName = fullName.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedFullName) {
      setError('Veuillez renseigner le nom du Directeur.');
      return;
    }

    if (!trimmedUsername) {
      setError("Veuillez choisir un nom d'utilisateur (identifiant).");
      return;
    }

    if (trimmedUsername.length < 3) {
      setError("Le nom d'utilisateur doit contenir au moins 3 caractères.");
      return;
    }

    if (!trimmedPassword) {
      setError('Veuillez définir un mot de passe.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createInitialDirector({
        fullName: trimmedFullName,
        username: trimmedUsername,
        password: trimmedPassword,
        companyName,
      });

      if (result.success) {
        if (setIsFirstLaunch) {
          setIsFirstLaunch(false);
        }
        if (onFinish) {
          onFinish();
        }
      } else {
        setError(result.message || 'Impossible de créer le compte Directeur.');
      }
    } catch {
      setError('Une erreur est survenue lors de la création du compte.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      {/* Luxury Red Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-[#E50914]/15 blur-[130px]" />
        <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-[#E50914]/10 blur-[130px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3 p-4 bg-[#0D0F14] rounded-2xl border border-[#232733] shadow-2xl flex items-center justify-center">
            <UniversAutoLogo size="lg" showSubtitle={true} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E1015] border border-[#282C38] text-[11px] text-[#E50914] font-bold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
            <span>Assistant de Première Configuration</span>
          </div>
        </div>

        {/* Setup Form Card */}
        <div
          id="initial-setup-form-card"
          className="bg-[#0C0E13] py-7 px-6 sm:px-8 shadow-2xl rounded-3xl border border-[#222530] animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-['Outfit']">
                Configuration du Directeur
              </h2>
              <p className="text-xs text-[#85878A] mt-0.5">
                Créez le compte administrateur principal d'UNIVERS AUTO
              </p>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Directeur</span>
            </span>
          </div>

          {/* Company Badge */}
          <div className="mb-4 p-2.5 rounded-xl bg-[#12141A] border border-[#242833] flex items-center justify-between text-xs">
            <span className="text-[#85878A]">Entreprise :</span>
            <span className="font-bold text-white tracking-wide">{companyName}</span>
          </div>

          {/* Error message */}
          {error && (
            <div
              id="setup-error-alert"
              className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
            {/* Nom du directeur */}
            <div>
              <label
                htmlFor="setup-director-name"
                className="block text-xs font-semibold text-[#85878A] mb-1.5"
              >
                Nom complet du Directeur *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878A]" />
                <input
                  id="setup-director-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) setError(null);
                    if (!username && e.target.value) {
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }
                  }}
                  placeholder="Ex : Moustapha Diallo"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#14161C] border border-[#272B36] text-sm text-white placeholder-[#555A66] focus:outline-hidden focus:border-[#E50914] transition-all"
                />
              </div>
            </div>

            {/* Nom d'utilisateur */}
            <div>
              <label
                htmlFor="setup-director-username"
                className="block text-xs font-semibold text-[#85878A] mb-1.5"
              >
                Nom d'utilisateur (identifiant de connexion) *
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878A]" />
                <input
                  id="setup-director-username"
                  type="text"
                  required
                  autoCapitalize="none"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                    if (error) setError(null);
                  }}
                  placeholder="Ex : directeur ou mdiallo"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#14161C] border border-[#272B36] text-sm text-white font-mono placeholder-[#555A66] focus:outline-hidden focus:border-[#E50914] transition-all"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="setup-director-password"
                className="block text-xs font-semibold text-[#85878A] mb-1.5"
              >
                Mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878A]" />
                <input
                  id="setup-director-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="•••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#14161C] border border-[#272B36] text-sm text-white font-mono placeholder-[#555A66] focus:outline-hidden focus:border-[#E50914] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#85878A] hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmation du mot de passe */}
            <div>
              <label
                htmlFor="setup-director-confirm-password"
                className="block text-xs font-semibold text-[#85878A] mb-1.5"
              >
                Confirmation du mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878A]" />
                <input
                  id="setup-director-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="•••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#14161C] border border-[#272B36] text-sm text-white font-mono placeholder-[#555A66] focus:outline-hidden focus:border-[#E50914] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#85878A] hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              {onBackToWelcome && (
                <button
                  type="button"
                  onClick={onBackToWelcome}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[#272B36] text-xs font-semibold text-[#85878A] hover:text-white hover:bg-[#14161C] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>
              )}

              <button
                type="submit"
                id="btn-submit-initial-director"
                disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#E50914] hover:bg-[#CC0812] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(229,9,20,0.4)] active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Créer mon espace & Accéder au CRM</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
