import React from 'react';
import {
  AlertTriangle,
  Clock,
  Wrench,
  KeyRound,
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

interface AlertItem {
  id: string;
  category: 'payment' | 'vehicle' | 'rental' | 'prospect';
  title: string;
  description: string;
  severity: 'warning' | 'danger' | 'info';
  actionTab: 'payments' | 'vehicles' | 'quick-rental' | 'quick-sale' | 'prospects';
}

export const DashboardAlerts: React.FC = () => {
  const { vehicles, sales, rentals, payments, prospects, settings, setActiveTab } = useCrm();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const alerts: AlertItem[] = [];

  // 0. RELANCES PROSPECTS COMMERCIALES
  prospects.forEach((p) => {
    (p.reminders || []).forEach((rem) => {
      if (rem.status === 'À faire') {
        if (rem.date < todayStr) {
          alerts.push({
            id: `alert-prospect-overdue-${p.id}-${rem.id}`,
            category: 'prospect',
            title: `Relance prospect en retard`,
            description: `${p.name} (${rem.reason}) — Prévue le ${new Date(rem.date).toLocaleDateString('fr-FR')}`,
            severity: 'danger',
            actionTab: 'prospects',
          });
        } else if (rem.date === todayStr) {
          alerts.push({
            id: `alert-prospect-today-${p.id}-${rem.id}`,
            category: 'prospect',
            title: `Relance prospect à effectuer aujourd'hui`,
            description: `${p.name} (${rem.reason}) à ${rem.time || '10:00'}`,
            severity: 'warning',
            actionTab: 'prospects',
          });
        }
      }
    });
  });

  // 1. PAIEMENTS ALERTES
  // Unpaid or partial sales
  sales.forEach((s) => {
    const paid = s.amountPaid || 0;
    const remaining = Math.max(0, s.totalAmount - paid);
    if (s.paymentStatus !== 'Payé' && remaining > 0) {
      alerts.push({
        id: `alert-sale-${s.id}`,
        category: 'payment',
        title: `Solde impayé — Vente ${s.saleNumber}`,
        description: `Reste dû : ${remaining.toLocaleString('fr-FR')} ${settings.currencySymbol} (${s.clientName} / ${s.vehicleName})`,
        severity: 'warning',
        actionTab: 'quick-sale',
      });
    }
  });

  // Unpaid or partial rentals
  rentals.forEach((r) => {
    const paid = r.amountPaid || 0;
    const remaining = Math.max(0, r.totalAmount - paid);
    if (r.paymentStatus !== 'Payé' && remaining > 0 && r.status === 'En cours') {
      alerts.push({
        id: `alert-rental-pay-${r.id}`,
        category: 'payment',
        title: `Solde impayé — Location ${r.rentalNumber}`,
        description: `Reste dû : ${remaining.toLocaleString('fr-FR')} ${settings.currencySymbol} (${r.clientName})`,
        severity: 'warning',
        actionTab: 'quick-rental',
      });
    }
  });

  // Pending payments
  payments
    .filter((p) => p.status === 'En attente')
    .forEach((p) => {
      alerts.push({
        id: `alert-pay-pend-${p.id}`,
        category: 'payment',
        title: `Paiement en attente de validation`,
        description: `${p.amount.toLocaleString('fr-FR')} ${settings.currencySymbol} — ${p.clientName} (${p.referenceTitle})`,
        severity: 'warning',
        actionTab: 'payments',
      });
    });

  // 2. VÉHICULES ALERTES
  vehicles
    .filter((v) => v.status === 'En maintenance')
    .forEach((v) => {
      alerts.push({
        id: `alert-veh-maint-${v.id}`,
        category: 'vehicle',
        title: `Véhicule en maintenance`,
        description: `${v.make} ${v.model} (${v.registration}) — Immobilisé en atelier`,
        severity: 'danger',
        actionTab: 'vehicles',
      });
    });

  vehicles
    .filter((v) => v.status === 'Réservé')
    .forEach((v) => {
      alerts.push({
        id: `alert-veh-res-${v.id}`,
        category: 'vehicle',
        title: `Véhicule réservé indisponible`,
        description: `${v.make} ${v.model} (${v.registration}) — En attente de livraison/contrat`,
        severity: 'info',
        actionTab: 'vehicles',
      });
    });

  // 3. LOCATIONS ALERTES
  rentals.forEach((r) => {
    if (r.status === 'En cours') {
      // Retours prévus aujourd'hui
      if (r.endDate && r.endDate.startsWith(todayStr)) {
        alerts.push({
          id: `alert-return-today-${r.id}`,
          category: 'rental',
          title: `Retour prévu aujourd'hui`,
          description: `Location ${r.rentalNumber} : ${r.vehicleName} (${r.clientName})`,
          severity: 'info',
          actionTab: 'quick-rental',
        });
      }
      // Locations expirées
      else if (r.endDate && r.endDate < todayStr) {
        alerts.push({
          id: `alert-expired-${r.id}`,
          category: 'rental',
          title: `Location expirée non clôturée`,
          description: `Contrat ${r.rentalNumber} dépassé depuis le ${new Date(r.endDate).toLocaleDateString('fr-FR')} (${r.clientName})`,
          severity: 'danger',
          actionTab: 'quick-rental',
        });
      }
    }
  });

  return (
    <div
      id="dashboard-alerts-card"
      className="rounded-2xl border border-[#E5E5DF] bg-white p-5 flex flex-col shadow-xs"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#B87320]/10 border border-[#B87320]/20 flex items-center justify-center text-[#B87320]">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
            Alertes opérationnelles
          </h3>
        </div>

        {alerts.length > 0 && (
          <span className="text-[11px] font-bold text-[#B87320] bg-[#B87320]/10 px-2 py-0.5 rounded-full border border-[#B87320]/20">
            {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] min-h-[180px]">
          <div className="w-10 h-10 rounded-xl bg-[#4A7A4A]/10 border border-[#4A7A4A]/20 flex items-center justify-center text-[#4A7A4A] mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[#1A1A18]">
            Aucune alerte actuellement
          </p>
          <p className="text-[11px] text-[#7A7A72] mt-1 max-w-xs">
            Tous les véhicules sont opérationnels, aucun retard de paiement ni dépassement de contrat détecté.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[340px] pr-1">
          {alerts.map((item) => {
            const isDanger = item.severity === 'danger';
            const isWarning = item.severity === 'warning';

            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.actionTab)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 text-xs ${
                  isDanger
                    ? 'bg-[#FDF6F6] border-[#D9534F]/30 hover:border-[#D9534F]'
                    : isWarning
                    ? 'bg-[#FDF9F3] border-[#B87320]/30 hover:border-[#B87320]'
                    : 'bg-[#F7F8FA] border-[#4A6B82]/30 hover:border-[#4A6B82]'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {item.category === 'payment' && (
                    <CreditCard
                      className={`w-4 h-4 ${
                        isDanger ? 'text-[#D9534F]' : isWarning ? 'text-[#B87320]' : 'text-[#4A6B82]'
                      }`}
                    />
                  )}
                  {item.category === 'vehicle' && (
                    <Wrench
                      className={`w-4 h-4 ${
                        isDanger ? 'text-[#D9534F]' : isWarning ? 'text-[#B87320]' : 'text-[#4A6B82]'
                      }`}
                    />
                  )}
                  {item.category === 'rental' && (
                    <Clock
                      className={`w-4 h-4 ${
                        isDanger ? 'text-[#D9534F]' : isWarning ? 'text-[#B87320]' : 'text-[#4A6B82]'
                      }`}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-[#1A1A18] truncate">{item.title}</span>
                    <span className="text-[10px] text-[#7A7A72] shrink-0">Voir →</span>
                  </div>
                  <p className="text-[11px] text-[#7A7A72] mt-0.5">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
