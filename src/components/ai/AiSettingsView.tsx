import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { AiSettings, AiTone, AiDetailLevel, AiLanguage } from '../../types';
import {
  Sliders,
  Check,
  Globe,
  Sparkles,
  Volume2,
  FileSpreadsheet,
  Save,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

export const AiSettingsView: React.FC = () => {
  const { aiSettings, updateAiSettings } = useCrm();

  const [formData, setFormData] = useState<AiSettings>({
    language: aiSettings.language || 'fr',
    tone: aiSettings.tone || 'professionnel',
    detailLevel: aiSettings.detailLevel || 'standard',
    autoSuggestions: aiSettings.autoSuggestions ?? true,
    includeAlertsInSummaries: aiSettings.includeAlertsInSummaries ?? true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAiSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    const defaultVals: AiSettings = {
      language: 'fr',
      tone: 'professionnel',
      detailLevel: 'standard',
      autoSuggestions: true,
      includeAlertsInSummaries: true,
    };
    setFormData(defaultVals);
    updateAiSettings(defaultVals);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DF]">
        <div>
          <h2 className="text-base font-bold text-[#1A1A18] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#5A5A40]" />
            Paramètres & Comportement de l'Assistant IA
          </h2>
          <p className="text-xs text-[#7A7A72]">
            Personnalisez le style de rédaction, la langue et la profondeur des analyses CRM
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#F5F5F0] text-[#7A7A72] hover:text-[#1A1A18] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Par défaut</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Langue de communication */}
        <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#5A5A40]" />
            <h3 className="text-sm font-bold text-[#1A1A18]">
              Langue de Réponse
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'fr', title: 'Français (Recommandé)', desc: 'Idéal pour les agences francophones et locales' },
              { id: 'en', title: 'English', desc: 'International standard for global mobility management' },
              { id: 'ar', title: 'العربية', desc: 'Pour les opérations régionales' },
            ].map((item) => (
              <label
                key={item.id}
                className={`relative flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.language === item.id
                    ? 'border-[#5A5A40] bg-[#5A5A40]/5 ring-1 ring-[#5A5A40]/20'
                    : 'border-[#E5E5DF] hover:bg-[#FAFAF8]'
                }`}
              >
                <input
                  type="radio"
                  name="language"
                  value={item.id}
                  checked={formData.language === item.id}
                  onChange={() => setFormData({ ...formData, language: item.id as AiLanguage })}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1A1A18]">{item.title}</span>
                  {formData.language === item.id && (
                    <Check className="w-3.5 h-3.5 text-[#5A5A40]" />
                  )}
                </div>
                <span className="text-[10px] text-[#7A7A72] leading-tight">{item.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SECTION 2: Ton des réponses */}
        <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#5A5A40]" />
            <h3 className="text-sm font-bold text-[#1A1A18]">
              Ton & Style de Communication
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 'professionnel',
                title: 'Professionnel & Courtois',
                desc: 'Équilibré, clair et adapté à la direction et aux gestionnaires.',
              },
              {
                id: 'concis',
                title: 'Ultra-Concis & Direct',
                desc: 'Chiffres clés et puces synthétiques sans formules d’introduction.',
              },
              {
                id: 'détaillé',
                title: 'Détaillé & Pédagogique',
                desc: 'Explications complètes avec contextes et détails des dossiers.',
              },
              {
                id: 'analytique',
                title: 'Analytique & Stratégique',
                desc: 'Focus sur les ratios de rentabilité, pourcentages et opportunités.',
              },
            ].map((tone) => (
              <label
                key={tone.id}
                className={`relative flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.tone === tone.id
                    ? 'border-[#5A5A40] bg-[#5A5A40]/5 ring-1 ring-[#5A5A40]/20'
                    : 'border-[#E5E5DF] hover:bg-[#FAFAF8]'
                }`}
              >
                <input
                  type="radio"
                  name="tone"
                  value={tone.id}
                  checked={formData.tone === tone.id}
                  onChange={() => setFormData({ ...formData, tone: tone.id as AiTone })}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1A1A18]">{tone.title}</span>
                  {formData.tone === tone.id && (
                    <Check className="w-3.5 h-3.5 text-[#5A5A40]" />
                  )}
                </div>
                <span className="text-[10px] text-[#7A7A72] leading-tight">{tone.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SECTION 3: Niveau de détail */}
        <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#5A5A40]" />
            <h3 className="text-sm font-bold text-[#1A1A18]">
              Niveau de Détail & Tableaux
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'synthétique',
                title: 'Synthétique',
                desc: 'Uniquement les totaux et indicateurs majeurs.',
              },
              {
                id: 'standard',
                title: 'Standard (Recommandé)',
                desc: 'Cartes statistiques, tableaux partiels et liens rapides.',
              },
              {
                id: 'approfondi',
                title: 'Approfondi',
                desc: 'Ventilation ligne par ligne avec toutes les métadonnées.',
              },
            ].map((lvl) => (
              <label
                key={lvl.id}
                className={`relative flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.detailLevel === lvl.id
                    ? 'border-[#5A5A40] bg-[#5A5A40]/5 ring-1 ring-[#5A5A40]/20'
                    : 'border-[#E5E5DF] hover:bg-[#FAFAF8]'
                }`}
              >
                <input
                  type="radio"
                  name="detailLevel"
                  value={lvl.id}
                  checked={formData.detailLevel === lvl.id}
                  onChange={() =>
                    setFormData({ ...formData, detailLevel: lvl.id as AiDetailLevel })
                  }
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1A1A18]">{lvl.title}</span>
                  {formData.detailLevel === lvl.id && (
                    <Check className="w-3.5 h-3.5 text-[#5A5A40]" />
                  )}
                </div>
                <span className="text-[10px] text-[#7A7A72] leading-tight">{lvl.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SECTION 4: Toggles Proactifs */}
        <div className="bg-white rounded-2xl border border-[#E5E5DF] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
            <h3 className="text-sm font-bold text-[#1A1A18]">
              Automatisations & Alertes Proactives
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] cursor-pointer hover:bg-[#F5F5F0] transition-colors">
              <div>
                <div className="text-xs font-bold text-[#1A1A18]">
                  Suggestions Intelligentes en Direct
                </div>
                <div className="text-[10px] text-[#7A7A72]">
                  Afficher les badges d'alertes de retard et tendances d'activité en temps réel
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoSuggestions}
                onChange={(e) =>
                  setFormData({ ...formData, autoSuggestions: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#5A5A40] focus:ring-[#5A5A40] accent-[#5A5A40] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] cursor-pointer hover:bg-[#F5F5F0] transition-colors">
              <div>
                <div className="text-xs font-bold text-[#1A1A18]">
                  Inclure les alertes critiques dans les résumés automatiques
                </div>
                <div className="text-[10px] text-[#7A7A72]">
                  Ajouter automatiquement les impayés et retards de flotte dans les bilans du jour et hebdos
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.includeAlertsInSummaries}
                onChange={(e) =>
                  setFormData({ ...formData, includeAlertsInSummaries: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#5A5A40] focus:ring-[#5A5A40] accent-[#5A5A40] cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-[#4A7A4A] flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Paramètres enregistrés avec succès !
            </span>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les préférences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
