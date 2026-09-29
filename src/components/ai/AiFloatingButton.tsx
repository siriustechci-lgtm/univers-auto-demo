import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { useAuth } from '../../context/AuthContext';
import { Bot, Sparkles, AlertCircle } from 'lucide-react';

export const AiFloatingButton: React.FC = () => {
  const { isAiDrawerOpen, openAiDrawer, getLiveSmartInsights, activeTab } = useCrm();
  const { hasPermission } = useAuth();
  const getBaseOffset = () => (typeof window !== 'undefined' && window.innerWidth < 1024 ? 76 : 20);
  const [viewportBottomOffset, setViewportBottomOffset] = useState<number>(getBaseOffset);
  const [isHovered, setIsHovered] = useState(false);

  // If user does not have permission for AI Assistant or if on full-page AI view, adapt or keep handy
  const canUseAi = hasPermission('ai-assistant');

  // Compute live real alerts count for discrete indicator
  const liveInsights = getLiveSmartInsights();
  const realAlertsCount = liveInsights.filter((i) => i.category === 'alertes').length;

  // Handle virtual keyboard and screen resize on mobile devices with visualViewport API
  useEffect(() => {
    const handleResize = () => {
      const base = getBaseOffset();
      if (window.visualViewport) {
        const offsetFromBottom = Math.max(
          base,
          window.innerHeight - (window.visualViewport.height + window.visualViewport.offsetTop) + base
        );
        setViewportBottomOffset(offsetFromBottom);
      } else {
        setViewportBottomOffset(base);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  if (!canUseAi) {
    return null;
  }

  // If drawer is already open, keep button hidden or in active state
  if (isAiDrawerOpen) {
    return null;
  }

  return (
    <div
      className="fixed z-40 transition-all duration-300 pointer-events-auto"
      style={{
        bottom: `${viewportBottomOffset}px`,
        right: '20px',
      }}
    >
      <button
        type="button"
        id="sirius-ai-floating-trigger"
        onClick={() => openAiDrawer()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Ouvrir l'Assistant IA Sirius Auto"
        title="Assistant IA Sirius Auto (Cliquez pour discuter)"
        className={`group relative flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30 ${
          isHovered ? 'scale-105 shadow-xl' : 'scale-100'
        } bg-[#2D2D2A] text-white border border-white/15 hover:bg-[#1A1A18] hover:border-white/25 rounded-full p-3.5 sm:px-4 sm:py-3`}
      >
        {/* Subtle breathing ambient glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5A5A40] to-[#8C8C6B] opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300 -z-10" />

        {/* Icon with spark micro-badge */}
        <div className="relative flex items-center justify-center">
          <Bot className="w-5 h-5 sm:w-5 sm:h-5 text-white transition-transform duration-300 group-hover:rotate-6" />
          <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
        </div>

        {/* Tablet & Desktop text */}
        <div className="hidden sm:flex items-center gap-1.5 ml-2.5">
          <span className="text-xs font-bold tracking-wide text-white">
            Assistant IA
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold text-white/90">
            En direct
          </span>
        </div>

        {/* Real-time alert indicator (only displayed if genuine CRM alerts exist) */}
        {realAlertsCount > 0 && (
          <span
            id="sirius-ai-floating-alert-badge"
            className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-xs border-2 border-white animate-bounce"
            title={`${realAlertsCount} alerte(s) opérationnelle(s) nécessitant votre attention`}
          >
            {realAlertsCount}
          </span>
        )}
      </button>
    </div>
  );
};
