import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { User as UserIcon, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();

  // Clean empty state by default
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [touched, setTouched] = useState({ username: false, password: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    setErrorMessage(null);

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setErrorMessage("Veuillez saisir votre nom d'utilisateur.");
      return;
    }

    if (!password) {
      setErrorMessage('Veuillez saisir votre mot de passe.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(trimmedUsername, password, rememberMe);
      if (!result.success) {
        setErrorMessage(result.message || "Nom d'utilisateur ou mot de passe incorrect.");
      }
    } catch {
      setErrorMessage('Une erreur est survenue lors de la tentative de connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Connexion à votre espace"
      subtitle="Accédez à la gestion du parc automobile et des ventes"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Error Alert Message */}
        {errorMessage && (
          <div
            id="login-error-alert"
            className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="leading-relaxed font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Nom d'utilisateur Field */}
        <div>
          <label htmlFor="login-username" className="block text-xs font-semibold text-[#85878A] mb-1.5">
            Identifiant / Nom d'utilisateur
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878A]" />
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
              placeholder="Ex : admin ou commercial"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14161C] border text-sm text-white placeholder-[#555A66] focus:outline-hidden transition-all ${
                touched.username && !username.trim()
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-[#262A34] focus:border-[#E50914]'
              }`}
            />
          </div>
          {touched.username && !username.trim() && (
            <p className="mt-1 text-[11px] text-rose-400 font-medium">
              Veuillez renseigner votre nom d'utilisateur
            </p>
          )}
        </div>

        {/* Mot de passe Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-semibold text-[#85878A]">
              Mot de passe
            </label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85878A]" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              placeholder="•••••••••••"
              className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#14161C] border border-[#262A34] text-sm text-white placeholder-[#555A66] focus:outline-hidden focus:border-[#E50914] transition-all font-mono"
            />
            <button
              type="button"
              id="toggle-show-password"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#85878A] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Se souvenir de moi */}
        <div className="flex items-center pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="login-remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-md border-[#262A34] text-[#E50914] focus:ring-[#E50914] accent-[#E50914] cursor-pointer"
            />
            <span className="text-xs text-[#85878A] font-medium">Se souvenir de moi sur cet appareil</span>
          </label>
        </div>

        {/* Bouton Connexion */}
        <button
          type="submit"
          id="btn-submit-login"
          disabled={isLoading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#E50914] hover:bg-[#CC0812] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(229,9,20,0.4)] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Connexion au CRM</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};
