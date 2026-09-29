import React, { useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { ExpenseCategory } from '../../types';
import {
  Fuel,
  Wrench,
  Hammer,
  Shield,
  Users,
  Building,
  Zap,
  Droplets,
  Wifi,
  Megaphone,
  ShoppingBag,
  Landmark,
  MoreHorizontal,
  ArrowRight,
  TrendingDown,
  Receipt,
  Plus,
} from 'lucide-react';

interface ExpensesCategoriesTabProps {
  onSelectCategory: (cat: string) => void;
  onOpenAddExpenseWithCategory?: (cat: ExpenseCategory) => void;
}

interface CategoryDefinition {
  name: ExpenseCategory;
  description: string;
  icon: React.ReactNode;
  color: string;
  badgeBg: string;
}

export const ALL_EXPENSE_CATEGORIES: CategoryDefinition[] = [
  {
    name: 'Carburant',
    description: 'Plein essence, diesel, appoint niveau, frais de carburant pour convoyage et retours',
    icon: <Fuel className="w-5 h-5" />,
    color: 'text-amber-700',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  {
    name: 'Entretien',
    description: 'Vidanges, filtres, nettoyage des véhicules, révisions courantes et consommables',
    icon: <Wrench className="w-5 h-5" />,
    color: 'text-blue-700',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  {
    name: 'Réparation',
    description: 'Carrosserie, mécanique lourde, pneumatiques, freins, pare-brise et pannes',
    icon: <Hammer className="w-5 h-5" />,
    color: 'text-rose-700',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
  },
  {
    name: 'Assurance',
    description: 'Assurances flotte automobile, responsabilité civile professionnelle et locaux',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  },
  {
    name: 'Salaires',
    description: 'Rémunérations employés, chauffeurs, commissions commerciales et primes',
    icon: <Users className="w-5 h-5" />,
    color: 'text-purple-700',
    badgeBg: 'bg-purple-50 border-purple-200 text-purple-800',
  },
  {
    name: 'Loyer',
    description: 'Bail commercial agence, parking fermé, garage et aire de stockage véhicules',
    icon: <Building className="w-5 h-5" />,
    color: 'text-indigo-700',
    badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  },
  {
    name: 'Électricité',
    description: 'Factures d\'électricité agence, recharge véhicules électriques et éclairage',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-700',
    badgeBg: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  },
  {
    name: 'Eau',
    description: 'Consommation d\'eau sanitaire et station de lavage interne',
    icon: <Droplets className="w-5 h-5" />,
    color: 'text-cyan-700',
    badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-800',
  },
  {
    name: 'Internet',
    description: 'Abonnements fibre agence, forfaits téléphones professionnels et GPS traceurs',
    icon: <Wifi className="w-5 h-5" />,
    color: 'text-teal-700',
    badgeBg: 'bg-teal-50 border-teal-200 text-teal-800',
  },
  {
    name: 'Marketing',
    description: 'Publicités en ligne, réseaux sociaux, flyers, enseigne, site web et événements',
    icon: <Megaphone className="w-5 h-5" />,
    color: 'text-pink-700',
    badgeBg: 'bg-pink-50 border-pink-200 text-pink-800',
  },
  {
    name: 'Fournitures',
    description: 'Papeterie, toner imprimante, produits d\'accueil client, outillage de base',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'text-slate-700',
    badgeBg: 'bg-slate-50 border-slate-200 text-slate-800',
  },
  {
    name: 'Taxes',
    description: 'Vignettes automobiles, taxes locales, droits d\'immatriculation et taxes diverses',
    icon: <Landmark className="w-5 h-5" />,
    color: 'text-orange-700',
    badgeBg: 'bg-orange-50 border-orange-200 text-orange-800',
  },
  {
    name: 'Autres',
    description: 'Frais bancaires, commissions de gestion, imprévus et autres dépenses',
    icon: <MoreHorizontal className="w-5 h-5" />,
    color: 'text-stone-700',
    badgeBg: 'bg-stone-100 border-stone-200 text-stone-800',
  },
];

export const ExpensesCategoriesTab: React.FC<ExpensesCategoriesTabProps> = ({
  onSelectCategory,
  onOpenAddExpenseWithCategory,
}) => {
  const { expenses, settings } = useCrm();
  const sym = settings.currencySymbol || '€';

  const totalAllExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  // Aggregate stats per category
  const categoryStats = useMemo(() => {
    const map: Record<string, { total: number; count: number; lastDate?: string }> = {};

    expenses.forEach((e) => {
      let cat = e.category || 'Autres';
      // normalize alias
      if (cat === 'Maintenance') cat = 'Entretien';
      if (cat === 'Autres dépenses') cat = 'Autres';

      if (!map[cat]) {
        map[cat] = { total: 0, count: 0 };
      }
      map[cat].total += e.amount || 0;
      map[cat].count += 1;
      if (!map[cat].lastDate || (e.date && e.date > map[cat].lastDate!)) {
        map[cat].lastDate = e.date;
      }
    });

    return map;
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-white border border-[#E5E5DF] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
            Nomenclature des Catégories de Dépenses
          </h2>
          <p className="text-xs text-[#7A7A72] mt-0.5">
            Structure officielle des charges de Sirius Auto CRM pour un classement comptable rigoureux
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs">
            <span className="text-[#7A7A72]">Total général : </span>
            <span className="font-bold text-[#1A1A18] font-mono">
              {totalAllExpenses.toLocaleString('fr-FR')} {sym}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_EXPENSE_CATEGORIES.map((catDef) => {
          const stats = categoryStats[catDef.name] || { total: 0, count: 0 };
          const percentage = totalAllExpenses > 0 ? ((stats.total / totalAllExpenses) * 100).toFixed(1) : '0';

          return (
            <div
              key={catDef.name}
              className="p-5 rounded-2xl bg-white border border-[#E5E5DF] hover:border-[#D0D0C8] shadow-xs flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl border ${catDef.badgeBg}`}>
                    {catDef.icon}
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#FAFAF8] text-[#7A7A72] border border-[#E5E5DF]">
                    {stats.count} écriture{stats.count > 1 ? 's' : ''}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#1A1A18] font-['Outfit'] flex items-center gap-2">
                  <span>{catDef.name}</span>
                </h3>

                <p className="text-xs text-[#7A7A72] mt-1.5 line-clamp-2 leading-relaxed">
                  {catDef.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#F0F0EC] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#7A7A72]">Total décaissé</span>
                  <span className="font-bold text-[#1A1A18] font-mono text-sm">
                    {stats.total.toLocaleString('fr-FR')} {sym}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#7A7A72]">
                    <span>Part du budget total</span>
                    <span className="font-semibold">{percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F0F0EC] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2D2D2A]"
                      style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action links */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => onSelectCategory(catDef.name)}
                    className="text-xs font-semibold text-[#5A5A40] hover:text-[#2D2D2A] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Voir les écritures</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {onOpenAddExpenseWithCategory && (
                    <button
                      type="button"
                      onClick={() => onOpenAddExpenseWithCategory(catDef.name)}
                      className="p-1.5 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#FAFAF8] cursor-pointer"
                      title={`Ajouter une dépense ${catDef.name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
