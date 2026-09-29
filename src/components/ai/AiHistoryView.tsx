import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  History,
  Search,
  Trash2,
  Archive,
  MessageSquare,
  ArrowRight,
  Clock,
  Download,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface AiHistoryViewProps {
  onSelectConversation: (id: string) => void;
}

export const AiHistoryView: React.FC<AiHistoryViewProps> = ({
  onSelectConversation,
}) => {
  const {
    aiConversations,
    deleteAiConversation,
    archiveAiConversation,
    clearAiHistory,
    currentConversationId,
  } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterArchived, setFilterArchived] = useState<'active' | 'archived' | 'all'>('active');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Filter conversations
  const filteredConversations = aiConversations.filter((conv) => {
    // Archive filter
    if (filterArchived === 'active' && conv.isArchived) return false;
    if (filterArchived === 'archived' && !conv.isArchived) return false;

    // Search query matching
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();

    const matchesTitle = conv.title.toLowerCase().includes(q);
    const matchesMessage = conv.messages.some(
      (m) => m.content.toLowerCase().includes(q)
    );

    return matchesTitle || matchesMessage;
  });

  // Export conversation as text or JSON
  const handleExportText = (conv: typeof aiConversations[0]) => {
    let text = `=== Sirius Auto CRM - Historique Conversation ===\n`;
    text += `Titre : ${conv.title}\n`;
    text += `Date de création : ${new Date(conv.createdAt).toLocaleString('fr-FR')}\n`;
    text += `Dernière mise à jour : ${new Date(conv.updatedAt).toLocaleString('fr-FR')}\n\n`;

    conv.messages.forEach((msg, idx) => {
      const roleLabel = msg.role === 'user' ? 'Vous' : 'Assistant Sirius Auto';
      const time = new Date(msg.timestamp).toLocaleString('fr-FR');
      text += `[${time}] ${roleLabel} :\n${msg.content}\n\n-------------------------\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sirius_ia_conversation_${conv.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[#E5E5DF]">
        <div>
          <h2 className="text-base font-bold text-[#1A1A18] flex items-center gap-2">
            <History className="w-4 h-4 text-[#5A5A40]" />
            Historique des Échanges & Analyses IA
          </h2>
          <p className="text-xs text-[#7A7A72]">
            Consultez, recherchez, archivez ou reprenez vos conversations précédentes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {aiConversations.length > 0 && (
            <button
              onClick={() => setConfirmClearOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purger l'historique</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E5DF] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#9A9A92] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une question, mot-clé..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl focus:outline-hidden focus:border-[#5A5A40]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#F5F5F0] p-1 rounded-xl w-full sm:w-auto justify-center">
          {[
            { id: 'active', label: 'Discussions actives' },
            { id: 'archived', label: 'Archivées' },
            { id: 'all', label: 'Toutes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterArchived(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterArchived === tab.id
                  ? 'bg-white text-[#1A1A18] shadow-xs'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      {filteredConversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5DF] p-8 text-center max-w-md mx-auto shadow-xs">
          <History className="w-10 h-10 text-[#9A9A92] mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-bold text-[#1A1A18] mb-1">
            Aucune conversation trouvée
          </h3>
          <p className="text-xs text-[#7A7A72]">
            {searchQuery
              ? 'Aucun résultat ne correspond à votre recherche.'
              : 'Vos échanges avec l\'assistant apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConversations.map((conv) => {
            const userMessagesCount = conv.messages.filter((m) => m.role === 'user').length;
            const isSelected = conv.id === currentConversationId;
            const lastUserMsg = [...conv.messages].reverse().find((m) => m.role === 'user');

            return (
              <div
                key={conv.id}
                className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 flex flex-col justify-between shadow-xs ${
                  isSelected
                    ? 'border-[#5A5A40] ring-1 ring-[#5A5A40]/20'
                    : 'border-[#E5E5DF] hover:border-[#5A5A40]/40'
                }`}
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1.5 rounded-lg bg-[#5A5A40]/10 text-[#5A5A40]">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[10px] font-semibold text-[#7A7A72] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {conv.isArchived && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold">
                          Archivée
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40] text-[10px] font-bold">
                        {userMessagesCount} question(s)
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#1A1A18] line-clamp-1 mb-1">
                    {conv.title}
                  </h3>

                  {lastUserMsg && (
                    <p className="text-xs text-[#7A7A72] line-clamp-2 italic mb-4 bg-[#FAFAF8] p-2 rounded-xl border border-[#E5E5DF]">
                      « {lastUserMsg.content} »
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E5E5DF] mt-2 gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleExportText(conv)}
                      className="p-1.5 rounded-lg border border-[#E5E5DF] text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
                      title="Télécharger l'historique texte"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => archiveAiConversation(conv.id)}
                      className={`p-1.5 rounded-lg border border-[#E5E5DF] transition-colors cursor-pointer ${
                        conv.isArchived
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F5F5F0]'
                      }`}
                      title={conv.isArchived ? 'Désarchiver' : 'Archiver'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteAiConversation(conv.id)}
                      className="p-1.5 rounded-lg border border-[#E5E5DF] text-[#7A7A72] hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                      title="Supprimer la conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5A5A40] text-white hover:bg-[#484833] text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>Reprendre</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation modal for Purger l'historique */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E5E5DF]">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-center text-[#1A1A18] mb-1">
              Purger tout l'historique ?
            </h3>
            <p className="text-xs text-center text-[#7A7A72] mb-6">
              Toutes les anciennes conversations et analyses enregistrées seront définitivement effacées.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="flex-1 py-2 rounded-xl border border-[#E5E5DF] text-xs font-semibold text-[#4A4A45] hover:bg-[#F5F5F0] cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  clearAiHistory();
                  setConfirmClearOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white cursor-pointer"
              >
                Confirmer la purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
