import React, { useState } from 'react';
import { UserRole, CrmModule, PermissionAction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import {
  Shield,
  Check,
  X,
  RotateCcw,
  LayoutDashboard,
  Car,
  BadgePercent,
  KeyRound,
  Users,
  CreditCard,
  FileText,
  Receipt,
  TrendingUp,
  Wrench,
  Building2,
  Target,
  BarChart3,
  Settings,
  Lock,
  CalendarCheck,
  Bell,
  Sparkles,
  Layers,
} from 'lucide-react';

const MODULES_CONFIG: { id: CrmModule; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'Tableau de bord', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" />, desc: 'Vue d\'ensemble, KPI, activité générale' },
  { id: 'Parc automobile', label: 'Parc automobile', icon: <Layers className="w-4 h-4" />, desc: 'Stock global, disponibilités, parc agence' },
  { id: 'Véhicules', label: 'Véhicules', icon: <Car className="w-4 h-4" />, desc: 'Fiches techniques, ajout, modification et vente' },
  { id: 'Clients', label: 'Clients', icon: <Users className="w-4 h-4" />, desc: 'Répertoire clients, documents, historique' },
  { id: 'Prospects', label: 'Prospects', icon: <Target className="w-4 h-4" />, desc: 'Pipeline commercial, besoins et relances' },
  { id: 'Ventes', label: 'Ventes', icon: <BadgePercent className="w-4 h-4" />, desc: 'Bons de commande, ventes directes, marges' },
  { id: 'Locations', label: 'Locations', icon: <KeyRound className="w-4 h-4" />, desc: 'Contrats de location, cautions, retours' },
  { id: 'Réservations', label: 'Réservations', icon: <CalendarCheck className="w-4 h-4" />, desc: 'Planning des réservations et acomptes' },
  { id: 'Paiements', label: 'Paiements', icon: <CreditCard className="w-4 h-4" />, desc: 'Encaissements, règlements, reçus de caisse' },
  { id: 'Factures', label: 'Factures', icon: <FileText className="w-4 h-4" />, desc: 'Facturation officielle, avoirs, relances' },
  { id: 'Dépenses', label: 'Dépenses', icon: <Receipt className="w-4 h-4" />, desc: 'Frais de fonctionnement, carburant, achats' },
  { id: 'Revenus', label: 'Revenus', icon: <TrendingUp className="w-4 h-4" />, desc: 'Entrées financières et récapitulatif des recettes' },
  { id: 'Maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" />, desc: 'Entretiens, réparations, contrôle technique' },
  { id: 'Fournisseurs', label: 'Fournisseurs', icon: <Building2 className="w-4 h-4" />, desc: 'Garages, concessionnaires, partenaires' },
  { id: 'Rapports', label: 'Rapports', icon: <BarChart3 className="w-4 h-4" />, desc: 'Chiffre d\'affaires, rentabilité et statistiques' },
  { id: 'Notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, desc: 'Alertes urgentes, rappels et messages WhatsApp' },
  { id: 'Paramètres', label: 'Paramètres', icon: <Settings className="w-4 h-4" />, desc: 'Configuration agence, utilisateurs et système' },
  { id: 'Assistant IA', label: 'Assistant IA', icon: <Sparkles className="w-4 h-4" />, desc: 'Assistant intelligent pour le diagnostic et requêtes' },
];

const ROLES_DETAILS: {
  id: UserRole;
  title: string;
  badgeClass: string;
  desc: string;
  highlights: string[];
}[] = [
  {
    id: 'Directeur',
    title: 'Directeur',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-200',
    desc: 'Accès complet au CRM. Responsable principal : gestion des utilisateurs, paramètres, finances, parc, ventes, locations et rapports.',
    highlights: ['Tous les modules déverrouillés', 'Gestion des comptes & permissions', 'Supervision complète agence'],
  },
  {
    id: 'Gestionnaire',
    title: 'Gestionnaire',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-200',
    desc: 'Gestion opérationnelle : parc automobile, ventes, locations, clients, maintenance, fournisseurs, suivi financier de base.',
    highlights: ['Opérations complètes parc & contrats', 'Consultation financière & rapports', 'Sans gestion des utilisateurs'],
  },
  {
    id: 'Commercial',
    title: 'Commercial',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    desc: 'Gestion de la relation client : prospection, création de ventes, contrats de location, devis et consultation du parc.',
    highlights: ['Clients & prospects', 'Création ventes et locations', 'Accès restreint aux paramètres'],
  },
  {
    id: 'Caissier',
    title: 'Caissier',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    desc: 'Encaissements, règlements, reçus de caisse, factures et consultation des ventes / locations.',
    highlights: ['Paiements, encaissements, reçus', 'Factures et consultations contrats', 'Accès restreint au parc'],
  },
  {
    id: 'Comptable',
    title: 'Comptable',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    desc: 'Gestion financière complète : paiements, dépenses, revenus, factures et rapports financiers détaillés.',
    highlights: ['Finances, dépenses, revenus', 'Rapports financiers & exports', 'Gestion des pièces comptables'],
  },
  {
    id: 'Agent',
    title: 'Agent',
    badgeClass: 'bg-slate-100 text-slate-900 border-slate-200',
    desc: 'Accès opérationnel de terrain : consultation parc, création contrats simples, retours et suivi atelier.',
    highlights: ['Consultation parc automobile', 'Locations et clients autorisés', 'Accès strictement ciblé'],
  },
];

const ACTIONS_CONFIG: { id: PermissionAction; label: string; width: string }[] = [
  { id: 'voir', label: 'Voir', width: 'w-20' },
  { id: 'créer', label: 'Créer', width: 'w-20' },
  { id: 'modifier', label: 'Modifier', width: 'w-20' },
  { id: 'supprimer', label: 'Supprimer', width: 'w-20' },
  { id: 'exporter', label: 'Exporter', width: 'w-20' },
];

export const RolesPermissionsMatrix: React.FC = () => {
  const { rolePermissions, updateRolePermission, resetRolePermissions, currentUser } = useAuth();
  const { addToast } = useCrm();

  const [selectedRole, setSelectedRole] = useState<UserRole>('Gestionnaire');
  const isDirector = currentUser?.role === 'Directeur' || currentUser?.role === 'Administrateur';

  const handleToggle = (module: CrmModule, action: PermissionAction, currentValue: boolean) => {
    if (!isDirector) {
      addToast({
        title: 'Action non autorisée',
        message: "Seul le Directeur peut ajuster les permissions des rôles.",
        type: 'error',
      });
      return;
    }

    if (selectedRole === 'Directeur' || selectedRole === 'Administrateur') {
      addToast({
        title: 'Rôle Directeur',
        message: "Le Directeur conserve obligatoirement tous les accès pour la gestion de l'entreprise.",
        type: 'info',
      });
      return;
    }

    updateRolePermission(selectedRole, module, action, !currentValue);
  };

  const handleReset = () => {
    if (!isDirector) return;
    if (window.confirm('Voulez-vous restaurer les permissions par défaut recommandées pour tous les rôles ?')) {
      resetRolePermissions();
      addToast({
        title: 'Permissions restaurées',
        message: 'Les permissions par défaut de BANESERVICES AUTO ont été réinitialisées.',
        type: 'success',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 6 Roles Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {ROLES_DETAILS.map((r) => {
          const isSelected = selectedRole === r.id;
          return (
            <div
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-[#5A5A40] bg-white ring-2 ring-[#5A5A40]/30 shadow-xs'
                  : 'border-[#E5E5DF] bg-white/70 hover:bg-white hover:border-[#D5D5CF]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#1A1A18] font-['Outfit']">
                    {r.title}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${r.badgeClass}`}>
                    {r.id === 'Directeur' ? 'Master' : 'Rôle'}
                  </span>
                </div>
                <p className="text-[11px] text-[#7A7A72] leading-snug line-clamp-2">
                  {r.desc}
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-[#E5E5DF] flex items-center justify-between text-[10px]">
                <span className="font-semibold text-[#5A5A40]">
                  {isSelected ? 'Sélectionné' : 'Voir droits'}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#5A5A40]" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix for Selected Role */}
      <div className="bg-white rounded-2xl border border-[#E5E5DF] p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5DF] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#5A5A40]" />
              <span>Matrice des autorisations : </span>
              <span className="text-[#5A5A40] underline underline-offset-4">{selectedRole}</span>
            </h3>
            <p className="text-xs text-[#7A7A72] mt-0.5">
              Définissez les modules et actions (Voir, Créer, Modifier, Supprimer, Exporter) accordés aux utilisateurs ayant le rôle {selectedRole}.
            </p>
          </div>

          {isDirector && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E5DF] text-xs font-semibold text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#FAFAF8] transition-colors cursor-pointer shrink-0"
              title="Restaurer la matrice par défaut"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser par défaut</span>
            </button>
          )}
        </div>

        {(selectedRole === 'Directeur' || selectedRole === 'Administrateur') && (
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Le compte <strong>Directeur</strong> possède tous les droits sans restriction pour administrer la société <strong>BANESERVICES AUTO</strong>. Ces droits sont verrouillés par mesure de sécurité.
            </p>
          </div>
        )}

        {/* Matrix Table */}
        <div className="rounded-2xl border border-[#E5E5DF] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase tracking-wider font-semibold border-b border-[#E5E5DF]">
                <tr>
                  <th className="px-4 py-3 min-w-[220px]">Module CRM</th>
                  {ACTIONS_CONFIG.map((act) => (
                    <th key={act.id} className={`px-3 py-3 text-center ${act.width}`}>
                      {act.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {MODULES_CONFIG.map((m) => {
                  const roleMap = rolePermissions[selectedRole] || {};
                  const modPerm = roleMap[m.id] || roleMap[m.id === 'Parc automobile' ? 'Véhicules' : m.id] || {
                    voir: false,
                    créer: false,
                    modifier: false,
                    supprimer: false,
                    exporter: false,
                  };

                  return (
                    <tr key={m.id} className="hover:bg-[#F9F9F6] transition-colors">
                      {/* Module info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center shrink-0">
                            {m.icon}
                          </div>
                          <div>
                            <span className="font-bold text-[#1A1A18] block">{m.label}</span>
                            <span className="text-[10px] text-[#7A7A72] hidden sm:block">{m.desc}</span>
                          </div>
                        </div>
                      </td>

                      {/* 5 Actions */}
                      {ACTIONS_CONFIG.map((act) => {
                        const isGranted =
                          act.id === 'créer'
                            ? Boolean(modPerm.créer ?? modPerm.ajouter)
                            : Boolean(modPerm[act.id as keyof typeof modPerm]);

                        const isLocked = selectedRole === 'Directeur' || selectedRole === 'Administrateur' || !isDirector;

                        return (
                          <td key={act.id} className="px-3 py-3 text-center">
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => handleToggle(m.id, act.id, isGranted)}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                                isGranted
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-50 text-rose-400 border border-rose-200 opacity-60'
                              } ${isLocked ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                              title={`${act.label} - ${isGranted ? 'Autorisé' : 'Refusé'}`}
                            >
                              {isGranted ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
