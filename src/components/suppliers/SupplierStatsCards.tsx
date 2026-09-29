import React from 'react';
import { Supplier, MaintenanceIntervention, Expense, AgencySettings } from '../../types';
import {
  Building2,
  CheckCircle2,
  Receipt,
  Wrench,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface SupplierStatsCardsProps {
  suppliers: Supplier[];
  maintenances: MaintenanceIntervention[];
  expenses: Expense[];
  settings: AgencySettings;
}

export const SupplierStatsCards: React.FC<SupplierStatsCardsProps> = ({
  suppliers,
  maintenances,
  expenses,
  settings,
}) => {
  const currency = settings.currency || 'FCFA';

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === 'Actif').length;
  const inactiveSuppliers = suppliers.filter((s) => s.status === 'Inactif' || s.status === 'Suspendu').length;

  // Total expenses / maintenance linked to suppliers
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  
  // Total standalone interventions
  const standaloneInterventionsAmount = maintenances
    .filter((m) => !m.expenseId && m.status !== 'Annulée')
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const totalBilled = totalExpensesAmount + standaloneInterventionsAmount;

  // Interventions count
  const totalInterventions = maintenances.length;
  const activeInterventions = maintenances.filter((m) => m.status === 'En cours').length;

  const formatAmount = (val: number) => {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(val || 0))} ${currency}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Fournisseurs */}
      <div
        id="card-stat-total-suppliers"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Partenaires & Fournisseurs
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{totalSuppliers}</span>
          <span className="text-xs text-slate-500 font-medium">enregistré(s)</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> {activeSuppliers} actifs
          </span>
          {inactiveSuppliers > 0 && (
            <span className="text-slate-400">
              • {inactiveSuppliers} inactif(s)
            </span>
          )}
        </div>
      </div>

      {/* 2. Volume Financier / Facturation */}
      <div
        id="card-stat-total-billed"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Facturé / Dépenses
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{formatAmount(totalBilled)}</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>Cumul des prestations & factures réglées</span>
        </div>
      </div>

      {/* 3. Interventions cumulées */}
      <div
        id="card-stat-total-interventions"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Interventions Atelier
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{totalInterventions}</span>
          <span className="text-xs text-slate-500 font-medium">réalisée(s)</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          {activeInterventions > 0 ? (
            <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" /> {activeInterventions} en cours d'atelier
            </span>
          ) : (
            <span className="text-slate-500">Toutes interventions traitées</span>
          )}
        </div>
      </div>

      {/* 4. Répartition / Catégories */}
      <div
        id="card-stat-categories-coverage"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Réseau de Partenaires
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">
            {new Set(suppliers.map((s) => s.category)).size}
          </span>
          <span className="text-xs text-slate-500 font-medium">spécialité(s)</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <span>Garages, assureurs, pièces & services</span>
        </div>
      </div>
    </div>
  );
};
