import React, { useState } from 'react';
import {
  Clock,
  BadgePercent,
  KeyRound,
  CreditCard,
  Car,
  Users,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

type ActivityFilter = 'all' | 'sales' | 'rentals' | 'payments' | 'vehicles' | 'clients';

export const DashboardRecentActivity: React.FC = () => {
  const { vehicles, clients, sales, rentals, payments, settings, setActiveTab } = useCrm();
  const [filter, setFilter] = useState<ActivityFilter>('all');

  type ActivityItem = {
    id: string;
    type: 'sale' | 'rental' | 'payment' | 'vehicle' | 'client';
    title: string;
    subtitle: string;
    amount?: number;
    date: string;
    badgeText: string;
    targetTab: 'quick-sale' | 'quick-rental' | 'payments' | 'vehicles' | 'clients';
  };

  const allActivities: ActivityItem[] = [
    // 1. Sales
    ...sales.map((s) => ({
      id: `sale-${s.id}`,
      type: 'sale' as const,
      title: `Vente ${s.saleNumber} — ${s.vehicleName}`,
      subtitle: `Client : ${s.clientName} (${s.paymentMethod})`,
      amount: s.totalAmount,
      date: s.createdAt || s.saleDate,
      badgeText: 'Vente enregistrée',
      targetTab: 'quick-sale' as const,
    })),

    // 2. Rentals
    ...rentals.map((r) => ({
      id: `rental-${r.id}`,
      type: 'rental' as const,
      title: `Location ${r.rentalNumber} — ${r.vehicleName}`,
      subtitle: `Client : ${r.clientName} (${r.durationDays} jour${r.durationDays > 1 ? 's' : ''})`,
      amount: r.totalAmount,
      date: r.createdAt || r.startDate,
      badgeText: 'Location enregistrée',
      targetTab: 'quick-rental' as const,
    })),

    // 3. Payments
    ...payments.map((p) => ({
      id: `payment-${p.id}`,
      type: 'payment' as const,
      title: `Paiement ${p.paymentNumber} — ${p.referenceTitle}`,
      subtitle: `Reçu de ${p.clientName} via ${p.paymentMethod}`,
      amount: p.amount,
      date: p.createdAt || p.paymentDate,
      badgeText: 'Paiement reçu',
      targetTab: 'payments' as const,
    })),

    // 4. Vehicles
    ...vehicles.map((v) => ({
      id: `veh-${v.id}`,
      type: 'vehicle' as const,
      title: `${v.make} ${v.model} (${v.year})`,
      subtitle: `Immatriculation : ${v.registration} • Statut : ${v.status}`,
      amount: v.sellingPrice || v.dailyRate,
      date: v.createdAt,
      badgeText: 'Véhicule ajouté',
      targetTab: 'vehicles' as const,
    })),

    // 5. Clients
    ...clients.map((c) => ({
      id: `client-${c.id}`,
      type: 'client' as const,
      title: `${c.firstName} ${c.lastName}${c.companyName ? ` (${c.companyName})` : ''}`,
      subtitle: `Tél : ${c.phone} • ${c.email || 'Sans e-mail'}`,
      date: c.createdAt,
      badgeText: 'Client ajouté',
      targetTab: 'clients' as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredActivities = allActivities.filter((item) => {
    if (filter === 'sales') return item.type === 'sale';
    if (filter === 'rentals') return item.type === 'rental';
    if (filter === 'payments') return item.type === 'payment';
    if (filter === 'vehicles') return item.type === 'vehicle';
    if (filter === 'clients') return item.type === 'client';
    return true;
  });

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'sale':
        return <BadgePercent className="w-3.5 h-3.5 text-[#4A7A4A]" />;
      case 'rental':
        return <KeyRound className="w-3.5 h-3.5 text-[#5A5A40]" />;
      case 'payment':
        return <CreditCard className="w-3.5 h-3.5 text-[#7A5A82]" />;
      case 'vehicle':
        return <Car className="w-3.5 h-3.5 text-[#4A6B82]" />;
      case 'client':
        return <Users className="w-3.5 h-3.5 text-[#B87320]" />;
    }
  };

  const getBadgeColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'sale':
        return 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/20';
      case 'rental':
        return 'bg-[#5A5A40]/10 text-[#5A5A40] border-[#5A5A40]/20';
      case 'payment':
        return 'bg-[#7A5A82]/10 text-[#7A5A82] border-[#7A5A82]/20';
      case 'vehicle':
        return 'bg-[#4A6B82]/10 text-[#4A6B82] border-[#4A6B82]/20';
      case 'client':
        return 'bg-[#B87320]/10 text-[#B87320] border-[#B87320]/20';
    }
  };

  return (
    <div
      id="dashboard-recent-activity-card"
      className="rounded-2xl border border-[#E5E5DF] bg-white p-5 flex flex-col shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
              Activité récente
            </h3>
            <p className="text-[11px] text-[#7A7A72]">
              Historique chronologique des opérations réelles
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: 'Tout' },
            { id: 'sales', label: 'Ventes' },
            { id: 'rentals', label: 'Locations' },
            { id: 'payments', label: 'Paiements' },
            { id: 'vehicles', label: 'Véhicules' },
            { id: 'clients', label: 'Clients' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as ActivityFilter)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filter === f.id
                  ? 'bg-[#1A1A18] text-white'
                  : 'bg-[#FAFAF8] text-[#7A7A72] hover:bg-[#F0EFEB] border border-[#E5E5DF]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] min-h-[220px]">
          <Clock className="w-8 h-8 text-[#9A9A92] mb-2" />
          <p className="text-xs font-semibold text-[#1A1A18]">
            Aucune activité enregistrée
          </p>
          <p className="text-[11px] text-[#7A7A72] mt-1 max-w-xs">
            Les opérations créées (ventes, contrats de location, clients, paiements ou véhicules) s'afficheront ici en direct.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[400px] pr-1">
          {filteredActivities.slice(0, 10).map((act) => (
            <div
              key={act.id}
              onClick={() => setActiveTab(act.targetTab)}
              className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] hover:border-[#D5D5CD] hover:bg-[#F7F7F4] transition-all cursor-pointer flex items-center justify-between gap-3 text-xs group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E5DF] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  {getIcon(act.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#1A1A18] truncate group-hover:text-[#000]">
                      {act.title}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${getBadgeColor(
                        act.type
                      )}`}
                    >
                      {act.badgeText}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A7A72] truncate mt-0.5">{act.subtitle}</p>
                  <p className="text-[10px] text-[#9A9A92] mt-1">
                    {new Date(act.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                {act.amount !== undefined && act.amount > 0 && (
                  <div className="font-mono font-bold text-xs text-[#1A1A18]">
                    {act.amount.toLocaleString('fr-FR')} {settings.currencySymbol}
                  </div>
                )}
                <span className="inline-flex items-center gap-0.5 text-[10px] text-[#9A9A92] group-hover:text-[#5A5A40] transition-colors mt-0.5">
                  Consulter →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
