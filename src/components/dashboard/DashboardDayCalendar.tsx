import React from 'react';
import {
  Calendar as CalendarIcon,
  KeyRound,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Car,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export const DashboardDayCalendar: React.FC = () => {
  const { rentals, sales, payments, reservations, settings, setActiveTab } = useCrm();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const formattedToday = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  type CalendarEvent = {
    id: string;
    type: 'departure' | 'return' | 'payment_due' | 'reservation';
    title: string;
    subtitle: string;
    time?: string;
    clientName: string;
    vehicleName?: string;
    amount?: number;
  };

  const events: CalendarEvent[] = [];

  // 1. Réservations actives débutant aujourd'hui
  reservations.forEach((res) => {
    if (
      res.startDate === todayStr &&
      (res.status === 'Réservée' || res.status === 'Confirmée')
    ) {
      events.push({
        id: `res-${res.id}`,
        type: 'reservation',
        title: `Réservation — ${res.vehicleName}`,
        subtitle: `Réf ${res.reservationNumber} • Client : ${res.clientName}`,
        clientName: res.clientName,
        vehicleName: res.vehicleName,
        amount: res.depositAmount,
      });
    }
  });

  // 2. Départs de location du jour
  rentals.forEach((r) => {
    if (r.startDate && r.startDate.startsWith(todayStr)) {
      events.push({
        id: `depart-${r.id}`,
        type: 'departure',
        title: `Départ de location — ${r.vehicleName}`,
        subtitle: `Contrat ${r.rentalNumber} • Durée : ${r.durationDays} jour(s)`,
        clientName: r.clientName,
        vehicleName: r.vehicleName,
        amount: r.totalAmount,
      });
    }
  });

  // 2. Retours prévus du jour
  rentals.forEach((r) => {
    if (r.endDate && r.endDate.startsWith(todayStr)) {
      events.push({
        id: `return-${r.id}`,
        type: 'return',
        title: `Retour prévu — ${r.vehicleName}`,
        subtitle: `Contrat ${r.rentalNumber} • Caution : ${r.depositAmount.toLocaleString('fr-FR')} ${settings.currencySymbol}`,
        clientName: r.clientName,
        vehicleName: r.vehicleName,
        amount: r.totalAmount,
      });
    }
  });

  return (
    <div
      id="dashboard-day-calendar-card"
      className="rounded-2xl border border-[#E5E5DF] bg-white p-5 flex flex-col shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
              Calendrier du jour
            </h3>
            <p className="text-[11px] text-[#7A7A72] capitalize">
              {formattedToday}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-medium text-[#7A7A72] bg-[#F5F5F0] px-2 py-0.5 rounded-md border border-[#E5E5DF] self-start sm:self-auto">
          {events.length} planning(s)
        </span>
      </div>

      {events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] min-h-[160px]">
          <CalendarIcon className="w-8 h-8 text-[#9A9A92] mb-2" />
          <p className="text-xs font-semibold text-[#1A1A18]">
            Aucun événement aujourd'hui
          </p>
          <p className="text-[11px] text-[#7A7A72] mt-1 max-w-xs">
            Aucun départ ni retour de location n'est programmé à cette date.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => {
                if (evt.type === 'reservation') {
                  setActiveTab('reservations');
                } else {
                  setActiveTab('quick-rental');
                }
              }}
              className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] hover:border-[#D5D5CD] transition-all cursor-pointer text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {evt.type === 'reservation' ? (
                    <div className="w-7 h-7 rounded-lg bg-[#4A6B82]/10 border border-[#4A6B82]/20 flex items-center justify-center text-[#4A6B82] shrink-0">
                      <CalendarClock className="w-3.5 h-3.5" />
                    </div>
                  ) : evt.type === 'departure' ? (
                    <div className="w-7 h-7 rounded-lg bg-[#4A7A4A]/10 border border-[#4A7A4A]/20 flex items-center justify-center text-[#4A7A4A] shrink-0">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40] shrink-0">
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="font-semibold text-[#1A1A18] block truncate">
                      {evt.title}
                    </span>
                    <span className="text-[11px] text-[#7A7A72] block truncate">
                      Client : {evt.clientName}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 border ${
                    evt.type === 'reservation'
                      ? 'bg-[#4A6B82]/10 text-[#4A6B82] border-[#4A6B82]/20'
                      : evt.type === 'departure'
                      ? 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/20'
                      : 'bg-[#5A5A40]/10 text-[#5A5A40] border-[#5A5A40]/20'
                  }`}
                >
                  {evt.type === 'reservation'
                    ? 'Réservation'
                    : evt.type === 'departure'
                    ? 'Départ'
                    : 'Retour'}
                </span>
              </div>
              <p className="text-[10px] text-[#9A9A92] mt-1.5 pl-9">{evt.subtitle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
