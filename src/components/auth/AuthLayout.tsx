import React from 'react';
import { ShieldCheck, Lock, Database } from 'lucide-react';
import { UniversAutoLogo } from '../common/UniversAutoLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      {/* Luxury Automotive Red & Dark Metallic Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#E50914]/10 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#E50914]/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-[#181A22]/20 via-[#0A0B0E]/60 to-transparent blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Logo & Tagline */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 p-4 bg-[#0D0F14] rounded-2xl border border-[#232733] shadow-2xl flex items-center justify-center">
            <UniversAutoLogo size="lg" showSubtitle={true} />
          </div>

          <p className="text-xs text-[#85878A] font-medium max-w-xs leading-relaxed">
            Plateforme CRM & Gestion de Parc Automobile
          </p>
        </div>

        {/* Security / Production Indicator */}
        <div className="mt-3 mx-auto inline-flex items-center justify-center gap-2 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E1015] border border-[#272B38] text-[11px] text-emerald-400 font-semibold shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>Système Sécurisé · Architecture MySQL Hostinger</span>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0C0E13] py-7 px-5 sm:px-8 shadow-2xl rounded-3xl border border-[#222530]">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-['Outfit']">
              {title}
            </h2>
            <p className="text-xs text-[#85878A] mt-1">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-[#555A66] flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#E50914]" />
            Chiffrement SSL / SHA-256
          </span>
          <span>·</span>
          <span>UNIVERS AUTO © {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
};
