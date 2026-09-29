import React from 'react';

interface UniversAutoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const UniversAutoLogo: React.FC<UniversAutoLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  // Dimensions
  const sizes = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[8px]' },
    md: { icon: 38, text: 'text-xl', sub: 'text-[9px]' },
    lg: { icon: 52, text: 'text-2xl sm:text-3xl', sub: 'text-[10px] sm:text-xs' },
    xl: { icon: 68, text: 'text-3xl sm:text-4xl', sub: 'text-xs sm:text-sm' },
  };

  const current = sizes[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Automotive Metallic Emblem */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        {/* Glow behind badge */}
        <div className="absolute inset-0 rounded-xl bg-[#E50914]/20 blur-md" />

        <svg
          width={current.icon}
          height={current.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-[0_4px_12px_rgba(229,9,20,0.35)]"
        >
          <defs>
            {/* Dark Metallic Chrome Gradient */}
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A2B2E" />
              <stop offset="45%" stopColor="#121316" />
              <stop offset="70%" stopColor="#1E2024" />
              <stop offset="100%" stopColor="#0A0B0D" />
            </linearGradient>

            {/* Brushed Chrome Border */}
            <linearGradient id="chromeBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="25%" stopColor="#85878A" />
              <stop offset="50%" stopColor="#E50914" />
              <stop offset="75%" stopColor="#85878A" />
              <stop offset="100%" stopColor="#3A3D44" />
            </linearGradient>

            {/* Red Racing Accent */}
            <linearGradient id="redAccent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF2E3B" />
              <stop offset="100%" stopColor="#B3050F" />
            </linearGradient>
          </defs>

          {/* Hexagonal Shield Body */}
          <polygon
            points="50,4 92,20 92,68 50,96 8,68 8,20"
            fill="url(#shieldGrad)"
            stroke="url(#chromeBorder)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Aerodynamic Speed Slits */}
          <path
            d="M26 36L44 36L40 44L22 44Z"
            fill="#85878A"
            opacity="0.7"
          />
          <path
            d="M30 48L48 48L44 56L26 56Z"
            fill="#85878A"
            opacity="0.85"
          />
          <path
            d="M34 60L52 60L48 68L30 68Z"
            fill="url(#redAccent)"
          />

          {/* Bold Automotive Stylized 'U' Wing */}
          <path
            d="M56 30L68 30L78 60L66 60L63 50L53 50L50 60L38 60L52 30Z"
            fill="url(#redAccent)"
          />
          <path
            d="M58 36L64 36L70 54L64 54Z"
            fill="#FFFFFF"
            opacity="0.9"
          />

          {/* Central Racing Line */}
          <line
            x1="50"
            y1="8"
            x2="50"
            y2="92"
            stroke="#E50914"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={`font-['Outfit',sans-serif] font-black tracking-wider leading-none flex items-center ${current.text}`}>
          <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            UNIVERS
          </span>
          <span className="ml-1.5 text-[#E50914] font-extrabold tracking-widest drop-shadow-[0_0_10px_rgba(229,9,20,0.5)]">
            AUTO
          </span>
        </div>

        {showSubtitle && (
          <span className={`font-['Plus_Jakarta_Sans',sans-serif] font-medium tracking-widest uppercase text-[#85878A] mt-0.5 leading-tight ${current.sub}`}>
            Achat & Vente · Neuf & Occasion
          </span>
        )}
      </div>
    </div>
  );
};
