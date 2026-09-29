import React, { useState } from 'react';
import { AiMessage, NavigationTab } from '../../types';
import { useCrm } from '../../context/CrmContext';
import {
  Bot,
  User,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AiMessageBubbleProps {
  message: AiMessage;
  onNavigateTab?: (tab: NavigationTab) => void;
  onPromptClick?: (prompt: string) => void;
}

export const AiMessageBubble: React.FC<AiMessageBubbleProps> = ({
  message,
  onNavigateTab,
  onPromptClick,
}) => {
  const { setActiveTab } = useCrm();
  const [copied, setCopied] = useState(false);

  const isAssistant = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAction = (tab: NavigationTab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else {
      setActiveTab(tab);
    }
  };

  // Format rich text with bold and bullet points
  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lineIdx) => {
      if (!line.trim()) {
        return <div key={lineIdx} className="h-1.5" />;
      }

      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const isIndented = line.startsWith('   ') || line.startsWith('\t');

      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIdx} className="font-bold text-[#1A1A18]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={partIdx} className="italic text-[#4A4A45]">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      });

      return (
        <p
          key={lineIdx}
          className={`leading-relaxed text-xs ${
            isIndented ? 'pl-4 text-[11px] text-[#5A5A52]' : isBullet ? 'pl-1.5' : ''
          }`}
        >
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div
      className={`flex gap-2 my-2 group ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="w-6 h-6 rounded-lg bg-[#5A5A40] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
          <Bot className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div
        className={`max-w-[92%] rounded-xl p-3 transition-all shadow-2xs ${
          isAssistant
            ? 'bg-white border border-[#E5E5DF] text-[#2D2D2A]'
            : 'bg-[#5A5A40] text-white'
        }`}
      >
        {/* Header & Meta */}
        <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-black/5 text-[10px]">
          <span
            className={`font-semibold flex items-center gap-1 ${
              isAssistant ? 'text-[#7A7A72]' : 'text-white/80'
            }`}
          >
            {isAssistant ? (
              <>
                <Sparkles className="w-2.5 h-2.5 text-[#5A5A40]" />
                <span>Assistant</span>
                {message.category && message.category !== 'general' && (
                  <span className="px-1 py-0.2 rounded bg-[#F5F5F0] text-[#5A5A40] uppercase text-[8px] font-bold">
                    {message.category}
                  </span>
                )}
              </>
            ) : (
              <span>Vous</span>
            )}
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[9px] ${
                isAssistant ? 'text-[#9A9A92]' : 'text-white/70'
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>

            {isAssistant && (
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0] transition-all cursor-pointer"
                title="Copier la réponse"
              >
                {copied ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-0.5">{formatContent(message.content)}</div>

        {/* Real-Time Stats Cards */}
        {isAssistant && message.statsCards && message.statsCards.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-[#E5E5DF]">
            {message.statsCards.map((card, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg border text-[11px] ${
                  card.type === 'positive'
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : card.type === 'negative'
                    ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                    : card.type === 'warning'
                    ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                    : 'bg-[#F9F9F7] border-[#E5E5DF] text-[#2D2D2A]'
                }`}
              >
                <div className="text-[9px] font-medium text-[#7A7A72] truncate">
                  {card.label}
                </div>
                <div className="text-xs font-bold mt-0.5 truncate">{card.value}</div>
                {card.hint && (
                  <div className="text-[8px] text-[#8A8A80] mt-0.5 truncate">{card.hint}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Table Data */}
        {isAssistant && message.tableData && message.tableData.rows.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-[#E5E5DF] overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5DF] text-[#7A7A72] bg-[#FAFAF8]">
                  {message.tableData.headers.map((h, i) => (
                    <th key={i} className="p-1 font-semibold text-[10px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {message.tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#F9F9F7] transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1 text-[#2D2D2A]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Links */}
        {isAssistant && message.actionLinks && message.actionLinks.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[#E5E5DF] flex-wrap">
            <span className="text-[9px] font-semibold text-[#7A7A72]">
              Aller à :
            </span>
            {message.actionLinks.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleAction(action.tab)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 text-[#5A5A40] text-[10px] font-semibold transition-colors cursor-pointer"
              >
                <span>{action.label}</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="w-6 h-6 rounded-lg bg-[#2D2D2A] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
          <User className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};
