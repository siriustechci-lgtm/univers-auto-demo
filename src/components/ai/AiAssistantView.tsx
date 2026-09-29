import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { AiChatView } from './AiChatView';
import { AiSmartSuggestionsView } from './AiSmartSuggestionsView';
import { AiHistoryView } from './AiHistoryView';
import { AiSettingsView } from './AiSettingsView';
import {
  Bot,
  Sparkles,
  History,
  Sliders,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  Zap,
} from 'lucide-react';

export type AiSubTab = 'chat' | 'suggestions' | 'history' | 'settings';

export const AiAssistantView: React.FC = () => {
  const {
    aiConversations,
    currentConversationId,
    selectAiConversation,
    sendAiMessage,
    createNewAiConversation,
    getLiveSmartInsights,
  } = useCrm();

  const [activeSubTab, setActiveSubTab] = useState<AiSubTab>('chat');

  // Compute live alert counts for badges
  const liveInsights = getLiveSmartInsights();
  const alertCount = liveInsights.filter((i) => i.category === 'alertes').length;

  const handleSelectPromptFromSuggestions = (prompt: string) => {
    sendAiMessage(prompt, currentConversationId || undefined);
    setActiveSubTab('chat');
  };

  const handleSelectConversationFromHistory = (id: string) => {
    selectAiConversation(id);
    setActiveSubTab('chat');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#5A5A40] to-[#3D3D2B] text-white p-5 sm:p-6 rounded-2xl shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0 shadow-xs">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Assistant IA Sirius Auto
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                Production Ready
              </span>
            </div>
            <p className="text-xs text-white/80 mt-0.5 max-w-xl leading-relaxed">
              Analyses instantanées, alertes et résumés d'activité propulsés par les données réelles de votre CRM.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              createNewAiConversation();
              setActiveSubTab('chat');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#2D2D2A] hover:bg-[#F5F5F0] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#5A5A40]" />
            <span>Nouveau Chat</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E5DF] overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'chat'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0]'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Discussion IA</span>
        </button>

        <button
          onClick={() => setActiveSubTab('suggestions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap relative ${
            activeSubTab === 'suggestions'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Suggestions & Alertes</span>
          {alertCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeSubTab === 'suggestions'
                  ? 'bg-white text-[#5A5A40]'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {alertCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'history'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historique</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeSubTab === 'history'
                ? 'bg-white/20 text-white'
                : 'bg-[#E5E5DF] text-[#7A7A72]'
            }`}
          >
            {aiConversations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'settings'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Paramètres IA</span>
        </button>
      </div>

      {/* Screen Views */}
      {activeSubTab === 'chat' && <AiChatView />}

      {activeSubTab === 'suggestions' && (
        <AiSmartSuggestionsView onSelectPrompt={handleSelectPromptFromSuggestions} />
      )}

      {activeSubTab === 'history' && (
        <AiHistoryView onSelectConversation={handleSelectConversationFromHistory} />
      )}

      {activeSubTab === 'settings' && <AiSettingsView />}
    </div>
  );
};
