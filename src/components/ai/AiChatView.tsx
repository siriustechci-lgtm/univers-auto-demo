import React, { useState, useRef, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { AiMessageBubble } from './AiMessageBubble';
import {
  Send,
  Sparkles,
  Bot,
  PlusCircle,
  TrendingUp,
  Car,
  KeyRound,
  Users,
  CreditCard,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const QUICK_PROMPT_PILLS = [
  { label: '📊 Résumé du jour', prompt: 'Fais-moi le résumé du jour' },
  { label: '💰 CA du mois', prompt: 'Quel est notre chiffre d\'affaires du mois ?' },
  { label: '🔑 Locations en cours', prompt: 'Combien de véhicules sont actuellement loués ?' },
  { label: '⚠️ Retards de retour', prompt: 'Quelles locations sont en retard ?' },
  { label: '🚗 Véhicules disponibles', prompt: 'Quels véhicules sont disponibles ?' },
  { label: '👥 Meilleurs clients', prompt: 'Qui sont nos meilleurs clients ?' },
  { label: '💳 Impayés', prompt: 'Quels clients ont un solde impayé ?' },
  { label: '💵 Encaissé aujourd\'hui', prompt: 'Quel montant avons-nous encaissé aujourd\'hui ?' },
];

export const AiChatView: React.FC = () => {
  const {
    aiConversations,
    currentConversationId,
    sendAiMessage,
    createNewAiConversation,
    setActiveTab,
    vehicles,
    sales,
    rentals,
  } = useCrm();

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active conversation
  const currentConversation =
    aiConversations.find((c) => c.id === currentConversationId) || aiConversations[0];

  const messages = currentConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsTyping(true);
    // Instant real-time response with micro-delay for natural feel
    setTimeout(() => {
      sendAiMessage(query, currentConversation?.id);
      setIsTyping(false);
    }, 250);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputQuery(e.target.value);
    // Auto-expand textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleNewChat = () => {
    createNewAiConversation();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] sm:h-[calc(100vh-12rem)] min-h-[500px] bg-white rounded-2xl border border-[#E5E5DF] shadow-xs overflow-hidden">
      {/* Top Conversation Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5DF] bg-[#FAFAF8]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-[#1A1A18] line-clamp-1">
              {currentConversation?.title || 'Assistant Sirius Auto'}
            </h2>
            <p className="text-[10px] text-[#7A7A72]">
              Analyses en direct basées sur vos données réelles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Démarrer une nouvelle discussion"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span className="hidden sm:inline">Nouvelle conversation</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAFAF8]/50">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => (
            <AiMessageBubble
              key={msg.id}
              message={msg}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onPromptClick={(prompt) => handleSend(prompt)}
            />
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 items-center justify-start my-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5A5A40] to-[#7A7A58] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#E5E5DF] text-xs text-[#7A7A72] flex items-center gap-2 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#5A5A40] animate-spin" />
                <span>Analyse des données réelles du CRM en cours...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Prompt Suggestions Bar */}
      <div className="px-4 py-2 border-t border-[#E5E5DF] bg-white overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max pb-1">
          <span className="text-[10px] font-bold text-[#7A7A72] uppercase tracking-wider mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#5A5A40]" /> Suggestions :
          </span>
          {QUICK_PROMPT_PILLS.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(pill.prompt)}
              disabled={isTyping}
              className="px-2.5 py-1 rounded-lg border border-[#E5E5DF] bg-[#FAFAF8] hover:bg-[#5A5A40]/10 hover:border-[#5A5A40]/30 hover:text-[#5A5A40] text-[11px] font-medium text-[#4A4A45] whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-[#E5E5DF]">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-[#FAFAF8] border border-[#E5E5DF] focus-within:border-[#5A5A40] focus-within:ring-2 focus-within:ring-[#5A5A40]/10 rounded-2xl p-2 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputQuery}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question sur vos ventes, locations, clients, impayés ou véhicules..."
            className="flex-1 max-h-32 bg-transparent text-[#1A1A18] placeholder-[#9A9A92] text-xs sm:text-sm px-2 py-1.5 focus:outline-hidden resize-none leading-relaxed"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isTyping}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              inputQuery.trim() && !isTyping
                ? 'bg-[#5A5A40] text-white shadow-xs hover:bg-[#484833]'
                : 'bg-[#E5E5DF] text-[#9A9A92] cursor-not-allowed'
            }`}
            title="Envoyer la question"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="max-w-4xl mx-auto flex items-center justify-between text-[10px] text-[#9A9A92] mt-1.5 px-2">
          <span>Appuyez sur Entrée pour envoyer, Maj+Entrée pour saut de ligne</span>
          <span>100% conforme aux données réelles de votre CRM</span>
        </div>
      </div>
    </div>
  );
};
