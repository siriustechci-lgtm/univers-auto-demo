import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  FileText,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Car,
  Users,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

interface AiSmartSuggestionsViewProps {
  onSelectPrompt: (prompt: string) => void;
}

export const AiSmartSuggestionsView: React.FC<AiSmartSuggestionsViewProps> = ({
  onSelectPrompt,
}) => {
  const {
    vehicles,
    clients,
    sales,
    rentals,
    payments,
    settings,
    getLiveSmartInsights,
  } = useCrm();

  const [activeCategory, setActiveCategory] = useState<
    'all' | 'activite' | 'alertes' | 'opportunites' | 'resumes'
  >('all');

  const currency = settings.currencySymbol || 'FCFA';
  const now = new Date();

  // Compute live contextual metrics
  const activeRentals = rentals.filter((r) => r.status === 'En cours');
  const availableVehicles = vehicles.filter((v) => v.status === 'Disponible');
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'En maintenance');
  const overdueRentals = rentals.filter((r) => {
    if (r.status !== 'En cours') return false;
    const end = new Date(r.endDate);
    return end.getTime() < now.getTime() && end.toDateString() !== now.toDateString();
  });
  const unpaidSales = sales.filter((s) => (s.balanceDue || 0) > 0);
  const unpaidRentals = rentals.filter((r) => (r.balanceDue || 0) > 0);

  const isCrmEmpty =
    vehicles.length === 0 &&
    clients.length === 0 &&
    sales.length === 0 &&
    rentals.length === 0 &&
    payments.length === 0;

  if (isCrmEmpty) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E5DF] p-8 text-center max-w-xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#1A1A18] mb-2">
          Suggestions & Alertes Intelligentes
        </h3>
        <p className="text-xs text-[#7A7A72] leading-relaxed">
          L'assistant pourra fournir des analyses dès que des données seront enregistrées dans le système.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Pills Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[#E5E5DF]">
        <div>
          <h2 className="text-base font-bold text-[#1A1A18] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5A5A40]" />
            Suggestions & Analyses Proactives
          </h2>
          <p className="text-xs text-[#7A7A72]">
            Alertes, tendances d'activité et opportunités calculées en continu sur vos données CRM
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#F5F5F0] p-1 rounded-xl">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'resumes', label: 'Résumés Auto' },
            { id: 'alertes', label: 'Alertes' },
            { id: 'activite', label: 'Activité & Ventes' },
            { id: 'opportunites', label: 'Opportunités' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-white text-[#1A1A18] shadow-xs'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: RÉSUMÉS AUTOMATIQUES */}
      {(activeCategory === 'all' || activeCategory === 'resumes') && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-[#5A5A40]" />
            <h3 className="text-sm font-bold text-[#1A1A18] uppercase tracking-wider text-[11px]">
              Générateur de Résumés Automatiques
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Daily Summary */}
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 sm:p-5 hover:border-[#5A5A40]/40 transition-all shadow-xs flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-md bg-[#5A5A40]/10 text-[#5A5A40] text-[10px] font-bold uppercase tracking-wider">
                    Quotidien
                  </span>
                  <Zap className="w-4 h-4 text-[#5A5A40]" />
                </div>
                <h4 className="text-sm font-bold text-[#1A1A18] mb-1">
                  Résumé du Jour
                </h4>
                <p className="text-xs text-[#7A7A72] leading-relaxed mb-4">
                  Synthèse complète : Ventes conclues, nouveaux contrats de location, restitutions et encaissements reçus.
                </p>
              </div>

              <button
                onClick={() => onSelectPrompt('Fais-moi le résumé du jour')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F5F5F0] group-hover:bg-[#5A5A40] group-hover:text-white text-[#2D2D2A] text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Générer en 1 clic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Weekly Summary */}
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 sm:p-5 hover:border-[#5A5A40]/40 transition-all shadow-xs flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                    Hebdomadaire
                  </span>
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="text-sm font-bold text-[#1A1A18] mb-1">
                  Bilan Hebdomadaire
                </h4>
                <p className="text-xs text-[#7A7A72] leading-relaxed mb-4">
                  Chiffre d'affaires des 7 derniers jours, meilleures performances commerciales et points d'attention prioritaires.
                </p>
              </div>

              <button
                onClick={() => onSelectPrompt('Fais-moi le bilan hebdomadaire')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F5F5F0] group-hover:bg-[#5A5A40] group-hover:text-white text-[#2D2D2A] text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Générer en 1 clic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Monthly Summary */}
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 sm:p-5 hover:border-[#5A5A40]/40 transition-all shadow-xs flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
                    Mensuel
                  </span>
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="text-sm font-bold text-[#1A1A18] mb-1">
                  Bilan Mensuel & Croissance
                </h4>
                <p className="text-xs text-[#7A7A72] leading-relaxed mb-4">
                  Revenus du mois, analyse d'évolution vs mois précédent et état global de la flotte.
                </p>
              </div>

              <button
                onClick={() => onSelectPrompt('Fais-moi le bilan mensuel')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F5F5F0] group-hover:bg-[#5A5A40] group-hover:text-white text-[#2D2D2A] text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Générer en 1 clic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ALERTES & VIGILANCE */}
      {(activeCategory === 'all' || activeCategory === 'alertes') && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-[#1A1A18] uppercase tracking-wider text-[11px]">
              Alertes & Points d'Attention
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Overdue rentals */}
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 sm:p-5 hover:border-rose-300 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      overdueRentals.length > 0
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {overdueRentals.length > 0
                      ? `${overdueRentals.length} Retard(s)`
                      : 'Aucun retard'}
                  </span>
                  <AlertTriangle
                    className={`w-4 h-4 ${
                      overdueRentals.length > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  />
                </div>
                <h4 className="text-sm font-bold text-[#1A1A18] mb-1">
                  Retards de Restitution
                </h4>
                <p className="text-xs text-[#7A7A72] leading-relaxed mb-4">
                  {overdueRentals.length > 0
                    ? `Certains véhicules n'ont pas été restitués à la date prévue.`
                    : `Toutes les locations en cours respectent leurs délais de retour.`}
                </p>
              </div>

              <button
                onClick={() => onSelectPrompt('Quelles locations sont en retard ?')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white text-[#2D2D2A] text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Consulter l'alerte</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Unpaid balances */}
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 sm:p-5 hover:border-amber-300 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      unpaidSales.length + unpaidRentals.length > 0
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {unpaidSales.length + unpaidRentals.length > 0
                      ? `${unpaidSales.length + unpaidRentals.length} Impayé(s)`
                      : 'Soldes à jour'}
                  </span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <h4 className="text-sm font-bold text-[#1A1A18] mb-1">
                  Créances & Soldes Dûs
                </h4>
                <p className="text-xs text-[#7A7A72] leading-relaxed mb-4">
                  Suivi des factures de vente et contrats de location en attente de solde complet.
                </p>
              </div>

              <button
                onClick={() => onSelectPrompt('Quels clients ont un solde impayé ?')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white text-[#2D2D2A] text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Voir les impayés</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Vehicles in maintenance */}
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 sm:p-5 hover:border-blue-300 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      maintenanceVehicles.length > 0
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {maintenanceVehicles.length > 0
                      ? `${maintenanceVehicles.length} En atelier`
                      : 'Parc opérationnel'}
                  </span>
                  <Car className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="text-sm font-bold text-[#1A1A18] mb-1">
                  Maintenances & Révisions
                </h4>
                <p className="text-xs text-[#7A7A72] leading-relaxed mb-4">
                  Véhicules immobilisés pour contrôle technique, entretien ou réparations.
                </p>
              </div>

              <button
                onClick={() => onSelectPrompt('Quels véhicules sont en maintenance ?')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white text-[#2D2D2A] text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Vérifier le parc</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: ACTIVITÉ & TENDANCES */}
      {(activeCategory === 'all' || activeCategory === 'activite') && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-[#1A1A18] uppercase tracking-wider text-[11px]">
              Activité Commerciale & Analyse des Ventes
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 sm:p-5 hover:border-[#5A5A40]/40 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1A1A18] mb-1">
                  Chiffre d'Affaires du Mois
                </h4>
                <p className="text-xs text-[#7A7A72] leading-relaxed mb-4">
                  Répartition des gains entre ventes de véhicules et contrats de location.
                </p>
              </div>
              <button
                onClick={() => onSelectPrompt('Quel est notre chiffre d\'affaires du mois ?')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white text-[#2D2D2A] text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Analyser le CA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 sm:p-5 hover:border-[#5A5A40]/40 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1A1A18] mb-1">
                  Véhicules Vendus ce Mois
                </h4>
                <p className="text-xs text-[#7A7A72] leading-relaxed mb-4">
                  Nombre de cartes grises cédées et montant global des transactions conclues.
                </p>
              </div>
              <button
                onClick={() => onSelectPrompt('Combien de véhicules avons-nous vendus ce mois ?')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white text-[#2D2D2A] text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Détail des ventes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 sm:p-5 hover:border-[#5A5A40]/40 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1A1A18] mb-1">
                  Taux d'Occupation Location
                </h4>
                <p className="text-xs text-[#7A7A72] leading-relaxed mb-4">
                  Proportion de véhicules loués ({activeRentals.length}) par rapport aux disponibles ({availableVehicles.length}).
                </p>
              </div>
              <button
                onClick={() => onSelectPrompt('Combien de véhicules sont actuellement loués ?')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white text-[#2D2D2A] text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Voir les locations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: OPPORTUNITÉS DE CROISSANCE */}
      {(activeCategory === 'all' || activeCategory === 'opportunites') && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-[#1A1A18] uppercase tracking-wider text-[11px]">
              Opportunités & Recommandations
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 sm:p-5 hover:border-[#5A5A40]/40 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-[#5A5A40]" />
                  <h4 className="text-sm font-bold text-[#1A1A18]">
                    Clients Inactifs à Relancer
                  </h4>
                </div>
                <p className="text-xs text-[#7A7A72] leading-relaxed mb-4">
                  Identifiez les prospects inscrits n'ayant pas encore finalisé de contrat pour leur envoyer un catalogue WhatsApp.
                </p>
              </div>
              <button
                onClick={() => onSelectPrompt('Clients inactifs à relancer')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white text-[#2D2D2A] text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Afficher la liste</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 sm:p-5 hover:border-[#5A5A40]/40 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Car className="w-4 h-4 text-[#5A5A40]" />
                  <h4 className="text-sm font-bold text-[#1A1A18]">
                    Véhicules les Plus Rentables & Demandés
                  </h4>
                </div>
                <p className="text-xs text-[#7A7A72] leading-relaxed mb-4">
                  Découvrez les modèles qui génèrent le plus de contrats de location et le plus fort taux de retour sur investissement.
                </p>
              </div>
              <button
                onClick={() => onSelectPrompt('Quels véhicules sont les plus loués ?')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white text-[#2D2D2A] text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Analyser la rentabilité</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
