import React from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Clock,
  Calendar,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface MaintenanceDashboardCardsProps {
  onNewIntervention: () => void;
  onViewAlerts: () => void;
  onViewCalendar: () => void;
  onSelectVehicleFilter?: (vehicleId: string) => void;
}

export const MaintenanceDashboardCards: React.FC<MaintenanceDashboardCardsProps> = ({
  onNewIntervention,
  onViewAlerts,
  onViewCalendar,
}) => {
  const { vehicles, maintenances, getMaintenanceAlerts } = useCrm();

  const alerts = getMaintenanceAlerts();
  const criticalAlertsCount = alerts.filter((a) => a.severity === 'error').length;
  const warningAlertsCount = alerts.filter((a) => a.severity === 'warning').length;

  const totalVehicles = vehicles.length;
  const inMaintenanceVehicles = vehicles.filter((v) => v.status === 'En maintenance');
  const operationalVehicles = vehicles.filter((v) => v.status !== 'En maintenance');

  const activeInterventions = maintenances.filter((m) => m.status === 'En cours');
  const scheduledInterventions = maintenances.filter((m) => m.status === 'Planifiée');
  const completedInterventions = maintenances.filter((m) => m.status === 'Terminée');

  const totalSpend = maintenances
    .filter((m) => m.status !== 'Annulée')
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const avgCostPerVehicle = totalVehicles > 0 ? totalSpend / totalVehicles : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner if any critical or warning alerts */}
      {alerts.length > 0 && (
        <div
          id="maintenance-alerts-banner"
          className={`rounded-xl border p-4 transition-all ${
            criticalAlertsCount > 0
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  criticalAlertsCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {criticalAlertsCount > 0 ? (
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {criticalAlertsCount > 0
                    ? `${criticalAlertsCount} échéance(s) critique(s) requièrent votre attention !`
                    : `${alerts.length} rappel(s) d'échéance et entretien détecté(s)`}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  {criticalAlertsCount > 0 && `${criticalAlertsCount} assurance(s) ou contrôle(s) expirés • `}
                  {warningAlertsCount > 0 && `${warningAlertsCount} échéance(s) sous 30 jours • `}
                  {inMaintenanceVehicles.length} véhicule(s) actuellement en atelier
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-view-all-alerts"
                onClick={onViewAlerts}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors flex items-center justify-center gap-1.5 w-full sm:w-auto ${
                  criticalAlertsCount > 0
                    ? 'bg-white border-rose-300 text-rose-700 hover:bg-rose-100'
                    : 'bg-white border-amber-300 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Consulter les alertes
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Véhicules en Atelier / Disponibilité */}
        <div
          id="kpi-card-workshop"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Véhicules en atelier
            </span>
            <div
              className={`p-2 rounded-lg ${
                inMaintenanceVehicles.length > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {inMaintenanceVehicles.length}
            </span>
            <span className="text-xs text-slate-500">
              sur {totalVehicles} véhicule(s)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${
                    totalVehicles > 0
                      ? Math.round((operationalVehicles.length / totalVehicles) * 100)
                      : 100
                  }%`,
                }}
              />
            </div>
            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
              {totalVehicles > 0
                ? Math.round((operationalVehicles.length / totalVehicles) * 100)
                : 100}
              % dispo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{operationalVehicles.length} opérationnel(s)</span>
          </p>
        </div>

        {/* Card 2: Interventions en cours & planifiées */}
        <div
          id="kpi-card-active-interventions"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Interventions actives
            </span>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {activeInterventions.length}
            </span>
            <span className="text-xs text-blue-600 font-medium">en cours</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{scheduledInterventions.length} planifiée(s)</span>
            </span>
            <span className="text-emerald-600 font-medium">
              {completedInterventions.length} terminée(s)
            </span>
          </div>
        </div>

        {/* Card 3: Total Dépenses Maintenance */}
        <div
          id="kpi-card-total-spend"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Coût Total Entretien
            </span>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalSpend)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              <span>Moyenne / véhicule :</span>
            </span>
            <span className="font-semibold text-slate-700">
              {formatCurrency(avgCostPerVehicle)}
            </span>
          </div>
        </div>

        {/* Card 4: Échéances & Alertes */}
        <div
          id="kpi-card-alerts"
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Échéances à suivre
            </span>
            <div
              className={`p-2 rounded-lg ${
                criticalAlertsCount > 0
                  ? 'bg-rose-100 text-rose-700'
                  : alerts.length > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                criticalAlertsCount > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {alerts.length}
            </span>
            <span className="text-xs text-slate-500">rappel(s)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <button
              id="btn-quick-calendar"
              onClick={onViewCalendar}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Voir le calendrier</span>
            </button>
            <button
              id="btn-quick-new-maint"
              onClick={onNewIntervention}
              className="text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <span>+ Créer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
