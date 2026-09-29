import React from 'react';
import { UniversAutoLogo } from '../common/UniversAutoLogo';
import {
  Car,
  FileText,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Database,
  Building2,
  ShoppingCart,
  BadgePercent,
} from 'lucide-react';

interface WelcomeViewProps {
  onStart?: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      {/* Luxury Red Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-[#E50914]/15 blur-[130px]" />
        <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-[#E50914]/10 blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-[#161820]/30 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4 p-4 bg-[#0D0F14] rounded-2xl border border-[#232733] shadow-2xl flex items-center justify-center">
            <UniversAutoLogo size="lg" showSubtitle={true} />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0E1015] border border-[#282C38] text-xs text-[#E50914] font-bold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
            <span>Bienvenue dans UNIVERS AUTO CRM</span>
          </div>
        </div>

        {/* Welcome Card */}
        <div
          id="welcome-view-card"
          className="bg-[#0C0E13] py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-[#222530] text-center animate-in fade-in zoom-in-95 duration-200"
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit'] mb-2">
            Gestion Intégrale de votre Activité Automobile
          </h1>

          <p className="text-sm text-[#85878A] max-w-lg mx-auto leading-relaxed mb-6">
            Configurez votre espace administrateur pour commencer à gérer votre parc de véhicules, vos ventes, vos approvisionnements et votre facturation en FCFA.
          </p>

          {/* Key Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
            <div className="p-3.5 rounded-2xl bg-[#12141A] border border-[#242833] flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E50914]/15 text-[#E50914] flex items-center justify-center shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Parc & Véhicules</h2>
                <p className="text-[11px] text-[#85878A] leading-tight mt-0.5">
                  Neuf & occasion, VIN, immatriculation, prix et marges.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#12141A] border border-[#242833] flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Achats & Importations</h2>
                <p className="text-[11px] text-[#85878A] leading-tight mt-0.5">
                  Frais de douane, transit maritime et coût de revient réel.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#12141A] border border-[#242833] flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                <BadgePercent className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Ventes & Contrats</h2>
                <p className="text-[11px] text-[#85878A] leading-tight mt-0.5">
                  Acomptes, soldes, anti-double vente et contrats PDF.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#12141A] border border-[#242833] flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Facturation en FCFA</h2>
                <p className="text-[11px] text-[#85878A] leading-tight mt-0.5">
                  Factures proforma, reçus et suivi des encaissements.
                </p>
              </div>
            </div>
          </div>

          {/* Database Info Banner */}
          <div className="p-3.5 rounded-2xl bg-[#101218] border border-[#262B37] text-left mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Base de données propre & prête</p>
              <p className="text-[11px] text-[#85878A]">
                Compatible hébergement Hostinger et base MySQL distante.
              </p>
            </div>
          </div>

          {/* Main Action Button */}
          <button
            id="btn-start-initial-setup"
            onClick={onStart}
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#E50914] hover:bg-[#CC0812] text-white font-black text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(229,9,20,0.45)] hover:shadow-[0_0_35px_rgba(229,9,20,0.6)] transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span>DÉMARRER</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
