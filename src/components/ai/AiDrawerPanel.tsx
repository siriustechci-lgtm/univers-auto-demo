import React, { useState, useRef, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { useAuth } from '../../context/AuthContext';
import { AiMessageBubble } from './AiMessageBubble';
import {
  Bot,
  Sparkles,
  X,
  Minus,
  Maximize2,
  Minimize2,
  Send,
  Plus,
  AlertTriangle,
  Zap,
  CheckCircle2,
  TrendingUp,
  KeyRound,
  CreditCard,
  Car,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { NavigationTab } from '../../types';

export const AiDrawerPanel: React.FC = () => {
  const {
    isAiDrawerOpen,
    closeAiDrawer,
    aiConversations,
    currentConversationId,
    sendAiMessage,
    createNewAiConversation,
    getLiveSmartInsights,
    aiInitialPrompt,
    setAiInitialPrompt,
    setActiveTab,
  } = useCrm();

  const { hasPermission } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'quick' | 'alerts'>('chat');
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active conversation
  const currentConversation =
    aiConversations.find((c) => c.id === currentConversationId) || aiConversations[0];
  const messages = currentConversation?.messages || [];

  // Live insights & alerts count
  const liveInsights = getLiveSmartInsights();
  const alertsList = liveInsights.filter((i) => i.category === 'alertes');
  const alertCount = alertsList.length;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAiDrawerOpen && !isMinimized && activeSubTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isTyping, isAiDrawerOpen, isMinimized, activeSubTab]);

  // If an initial prompt was triggered
  useEffect(() => {
    if (isAiDrawerOpen && aiInitialPrompt) {
      const promptToSend = aiInitialPrompt;
      setAiInitialPrompt(null);
      setIsMinimized(false);
      setActiveSubTab('chat');
      setTimeout(() => {
        handleSend(promptToSend);
      }, 100);
    }
  }, [isAiDrawerOpen, aiInitialPrompt]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAiDrawerOpen) {
        closeAiDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAiDrawerOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsTyping(true);
    setActiveSubTab('chat');

    setTimeout(() => {
      sendAiMessage(query, currentConversation?.id);
      setIsTyping(false);
    }, 180);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 72)}px`;
  };

  const handleNavigate = (tab: NavigationTab) => {
    if (hasPermission(tab)) {
      setActiveTab(tab);
    }
  };

  if (!isAiDrawerOpen) {
    return null;
  }

  // If minimized, display a sleek floating pill header
  if (isMinimized) {
    return (
      <div
        id="sirius-ai-minimized-bar"
        className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex items-center gap-2 bg-[#2D2D2A] text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-white/15 cursor-pointer hover:bg-[#20201D] transition-all"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-tight">Assistant IA</span>
          {alertCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] font-black text-white">
              {alertCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2 border-l border-white/20 pl-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            title="Restaurer l'assistant"
            className="p-1 rounded text-white/70 hover:text-white"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeAiDrawer();
            }}
            title="Fermer l'assistant"
            className="p-1 rounded text-white/70 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  const QUICK_QUESTIONS = [
    { label: 'Résumé du jour', prompt: 'Fais-moi le résumé du jour', icon: Calendar },
    { label: 'Loyers et impayés', prompt: 'Qui doit encore payer ?', icon: CreditCard },
    { label: 'Alertes importantes', prompt: 'Quelles sont les alertes opérationnelles ?', icon: AlertTriangle },
    { label: 'Véhicules loués', prompt: 'Quels véhicules sont actuellement loués ?', icon: KeyRound },
    { label: 'Véhicules disponibles', prompt: 'Quels véhicules sont disponibles ?', icon: Car },
    { label: "Chiffre d'affaires & Ventes", prompt: "Quel est mon chiffre d'affaires ?", icon: TrendingUp },
  ];

  return (
    <div
      id="sirius-ai-floating-panel"
      role="region"
      aria-label="Assistant IA Sirius Auto"
      className={`fixed z-50 transition-all duration-200 ease-out flex flex-col bg-white rounded-2xl shadow-2xl border border-[#E5E5DF] overflow-hidden ${
        isExpanded
          ? 'bottom-3 right-3 sm:bottom-5 sm:right-5 w-[calc(100vw-24px)] sm:w-[460px] h-[calc(100vh-24px)] sm:h-[620px] max-w-[460px] max-h-[620px]'
          : 'bottom-3 right-3 sm:bottom-5 sm:right-5 w-[calc(100vw-24px)] sm:w-[380px] h-[500px] sm:h-[520px] max-w-[380px] max-h-[520px]'
      }`}
    >
      {/* Compact Top Header */}
      <div className="px-3.5 py-2.5 bg-[#2D2D2A] text-white flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white tracking-tight truncate flex items-center gap-1.5">
              Assistant IA
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </h3>
          </div>
        </div>

        {/* Window controls (New Chat, Minimize, Expand/Shrink, Close) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => createNewAiConversation()}
            title="Nouvelle conversation"
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Réduire la taille' : 'Agrandir la fenêtre'}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            title="Réduire"
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={closeAiDrawer}
            title="Fermer"
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Compact 3 Sub-Tabs */}
      <div className="flex items-center px-2 py-1.5 border-b border-[#E5E5DF] bg-[#FAFAF8] gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setActiveSubTab('chat')}
          className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'chat'
              ? 'bg-[#5A5A40] text-white shadow-2xs'
              : 'text-[#6A6A62] hover:text-[#1A1A18] hover:bg-[#EAEAE5]'
          }`}
        >
          <Bot className="w-3 h-3" />
          <span>Discussion</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('quick')}
          className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'quick'
              ? 'bg-[#5A5A40] text-white shadow-2xs'
              : 'text-[#6A6A62] hover:text-[#1A1A18] hover:bg-[#EAEAE5]'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Questions rapides</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('alerts')}
          className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
            activeSubTab === 'alerts'
              ? 'bg-[#5A5A40] text-white shadow-2xs'
              : 'text-[#6A6A62] hover:text-[#1A1A18] hover:bg-[#EAEAE5]'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Alertes</span>
          {alertCount > 0 && (
            <span
              className={`ml-0.5 px-1 py-0.1 rounded-full text-[9px] font-black ${
                activeSubTab === 'alerts' ? 'bg-white text-[#5A5A40]' : 'bg-rose-500 text-white'
              }`}
            >
              {alertCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: DISCUSSION */}
      {activeSubTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#FAFAF8]/40">
          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {/* If conversation only has 1 message (or welcome), show clean top prompt with max 3 chips */}
            {messages.length <= 1 && (
              <div className="p-3 rounded-xl bg-white border border-[#E5E5DF] shadow-2xs my-1 text-center">
                <p className="text-xs font-bold text-[#1A1A18] mb-2.5">
                  Comment puis-je vous aider ?
                </p>
                <div className="flex flex-col gap-1.5 text-left">
                  <button
                    type="button"
                    onClick={() => handleSend('Fais-moi le résumé du jour')}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAFAF8] hover:bg-[#5A5A40]/10 hover:text-[#5A5A40] border border-[#E5E5DF] text-xs font-medium text-[#2D2D2A] flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <span>📊 Résumé du jour</span>
                    <Zap className="w-3 h-3 text-[#9A9A92] group-hover:text-[#5A5A40]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend('Qui doit encore payer ?')}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAFAF8] hover:bg-[#5A5A40]/10 hover:text-[#5A5A40] border border-[#E5E5DF] text-xs font-medium text-[#2D2D2A] flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <span>💳 Loyers et impayés</span>
                    <Zap className="w-3 h-3 text-[#9A9A92] group-hover:text-[#5A5A40]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend('Quelles sont les alertes importantes ?')}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAFAF8] hover:bg-[#5A5A40]/10 hover:text-[#5A5A40] border border-[#E5E5DF] text-xs font-medium text-[#2D2D2A] flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <span>⚠️ Alertes importantes</span>
                    <Zap className="w-3 h-3 text-[#9A9A92] group-hover:text-[#5A5A40]" />
                  </button>
                </div>
              </div>
            )}

            {/* Message history */}
            {messages.map((msg) => (
              <AiMessageBubble
                key={msg.id}
                message={msg}
                onNavigateTab={handleNavigate}
                onPromptClick={(prompt) => handleSend(prompt)}
              />
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center justify-start my-1 text-xs text-[#7A7A72]">
                <div className="w-5 h-5 rounded-md bg-[#5A5A40] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5E5DF] flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-[#5A5A40] animate-spin" />
                  <span className="text-[11px]">Analyse des données CRM...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sticky Bottom Input Area */}
          <div className="p-2.5 bg-white border-t border-[#E5E5DF] shrink-0">
            <div className="relative flex items-center gap-1.5 bg-[#FAFAF8] border border-[#E5E5DF] focus-within:border-[#5A5A40] focus-within:ring-1 focus-within:ring-[#5A5A40]/20 rounded-xl p-1.5 transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputQuery}
                onChange={handleTextareaChange}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Posez votre question..."
                className="flex-1 max-h-18 bg-transparent text-[#1A1A18] placeholder-[#9A9A92] text-xs px-1.5 py-0.5 focus:outline-none resize-none leading-tight"
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputQuery.trim() || isTyping}
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  inputQuery.trim() && !isTyping
                    ? 'bg-[#5A5A40] text-white shadow-2xs hover:bg-[#484833]'
                    : 'bg-[#E5E5DF] text-[#9A9A92] cursor-not-allowed'
                }`}
                title="Envoyer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: QUESTIONS RAPIDES */}
      {activeSubTab === 'quick' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#FAFAF8]/50">
          <div className="text-[11px] font-bold text-[#7A7A72] uppercase px-1 mb-1">
            Requêtes instantanées
          </div>
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q.prompt)}
              className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#5A5A40]/10 hover:text-[#5A5A40] border border-[#E5E5DF] hover:border-[#5A5A40]/30 text-xs font-medium text-[#2D2D2A] transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <q.icon className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
                <span className="truncate">{q.label}</span>
              </div>
              <Zap className="w-3 h-3 text-[#9A9A92] group-hover:text-[#5A5A40] transition-colors shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Tab 3: ALERTES */}
      {activeSubTab === 'alerts' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#FAFAF8]/50">
          <div className="text-[11px] font-bold text-[#7A7A72] uppercase px-1 mb-1">
            Alertes opérationnelles ({alertCount})
          </div>

          {alertsList.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-emerald-800">
                Aucune alerte critique en cours
              </p>
              <p className="text-[10px] text-emerald-700 mt-0.5">
                Tous les retours et véhicules sont à jour.
              </p>
            </div>
          ) : (
            alertsList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSend(item.prompt)}
                className="p-2.5 rounded-xl bg-white border border-rose-200 hover:border-rose-300 hover:shadow-2xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 text-[9px] font-bold">
                    {item.badgeText}
                  </span>
                  <span className="text-[10px] font-semibold text-rose-600 group-hover:underline">
                    Détails →
                  </span>
                </div>
                <h5 className="text-xs font-bold text-[#1A1A18] mb-0.5">{item.title}</h5>
                <p className="text-[11px] text-[#7A7A72] line-clamp-2">{item.description}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
