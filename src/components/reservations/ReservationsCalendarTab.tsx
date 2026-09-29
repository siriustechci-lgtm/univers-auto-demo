import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Car,
  User,
  Plus,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  ArrowRight,
  KeyRound,
  BadgePercent,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { Reservation, ReservationStatus } from '../../types';

interface ReservationsCalendarTabProps {
  onOpenNewReservation: () => void;
  onSelectReservation: (reservation: Reservation) => void;
}

export const ReservationsCalendarTab: React.FC<ReservationsCalendarTabProps> = ({
  onOpenNewReservation,
  onSelectReservation,
}) => {
  const { reservations, settings } = useCrm();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayString, setSelectedDayString] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const todayStr = new Date().toISOString().split('T')[0];

  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Calculate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Convert JS Sunday (0) to Monday-based (0 = Mon, 6 = Sun)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dateStr: prevDate.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const curr = new Date(year, month, d);
      // Ensure local ISO string
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const dayFormatted = String(d).padStart(2, '0');
      days.push({
        dateStr: `${y}-${m}-${dayFormatted}`,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding to reach 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dayFormatted = String(i).padStart(2, '0');
      days.push({
        dateStr: `${y}-${m}-${dayFormatted}`,
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDayString(now.toISOString().split('T')[0]);
  };

  // Find reservations active on a given date (startDate <= date <= endDate)
  const getReservationsForDate = (dateStr: string) => {
    return reservations.filter(
      (r) => r.startDate <= dateStr && r.endDate >= dateStr && r.status !== 'Annulée'
    );
  };

  // Sections:
  // 1. Aujourd'hui
  const todaysReservations = reservations.filter(
    (r) => r.startDate <= todayStr && r.endDate >= todayStr && r.status !== 'Annulée'
  );

  // 2. À venir
  const upcomingReservations = reservations.filter(
    (r) => r.startDate > todayStr && (r.status === 'Réservée' || r.status === 'Confirmée')
  );

  // 3. Expirées
  const expiredReservations = reservations.filter((r) => r.status === 'Expirée');

  const selectedDayReservations = getReservationsForDate(selectedDayString);

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case 'Réservée':
        return 'bg-[#4A6B82] text-white';
      case 'Confirmée':
        return 'bg-[#4A7A4A] text-white';
      case 'Convertie en location':
        return 'bg-[#5A5A40] text-white';
      case 'Convertie en vente':
        return 'bg-[#3D663D] text-white';
      case 'Expirée':
        return 'bg-[#B87320] text-white';
      default:
        return 'bg-[#7A7A72] text-white';
    }
  };

  return (
    <div id="reservations-calendar-tab" className="space-y-5">
      {/* Calendar Header & Month Navigation */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4A6B82]/10 border border-[#4A6B82]/20 flex items-center justify-center text-[#4A6B82]">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
              {monthNames[month]} {year}
            </h3>
            <p className="text-xs text-[#7A7A72]">
              Planning et vue temporelle des blocages de véhicules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold text-[#1A1A18] bg-[#FAFAF7] border border-[#E5E5DF] hover:bg-white rounded-xl transition-all shadow-2xs"
          >
            Aujourd'hui
          </button>
          <div className="flex items-center rounded-xl border border-[#E5E5DF] bg-[#FAFAF7] p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-[#7A7A72] hover:text-[#1A1A18] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-[#7A7A72] hover:text-[#1A1A18] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={onOpenNewReservation}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4A6B82] hover:bg-[#3B5668] rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Réserver</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Month Grid, Right = Focus Day & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Monthly Calendar Table */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs p-4 space-y-3">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-[#7A7A72] pb-2 border-b border-[#F0F0EC]">
            {daysOfWeek.map((d, i) => (
              <div key={i} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cd, index) => {
              const isToday = cd.dateStr === todayStr;
              const isSelected = cd.dateStr === selectedDayString;
              const dayReservations = getReservationsForDate(cd.dateStr);

              return (
                <div
                  key={index}
                  id={`cal-day-${cd.dateStr}`}
                  onClick={() => setSelectedDayString(cd.dateStr)}
                  className={`min-h-[75px] sm:min-h-[90px] p-1.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#4A6B82] bg-[#4A6B82]/5 ring-1 ring-[#4A6B82]'
                      : isToday
                      ? 'border-[#4A6B82]/40 bg-[#FAFAF7]'
                      : cd.isCurrentMonth
                      ? 'border-[#F0F0EC] bg-white hover:border-[#4A6B82]/40'
                      : 'border-transparent bg-[#FAFAF7]/50 opacity-40 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-[#4A6B82] text-white'
                          : isSelected
                          ? 'text-[#4A6B82]'
                          : 'text-[#1A1A18]'
                      }`}
                    >
                      {cd.dayNum}
                    </span>
                    {dayReservations.length > 0 && (
                      <span className="text-[10px] font-semibold text-[#4A6B82] bg-[#4A6B82]/10 px-1 rounded">
                        {dayReservations.length}
                      </span>
                    )}
                  </div>

                  {/* Day Pills */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayReservations.slice(0, 2).map((res) => (
                      <div
                        key={res.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReservation(res);
                        }}
                        className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${getStatusColor(
                          res.status
                        )}`}
                        title={`${res.reservationNumber} • ${res.vehicleName} (${res.clientName})`}
                      >
                        {res.vehicleName}
                      </div>
                    ))}
                    {dayReservations.length > 2 && (
                      <span className="text-[9px] text-[#7A7A72] block truncate">
                        +{dayReservations.length - 2} autre(s)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-[#7A7A72] pt-2 border-t border-[#F0F0EC]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4A6B82]" /> Réservée
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4A7A4A]" /> Confirmée
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5A5A40]" /> Location
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B87320]" /> Expirée
              </span>
            </div>
            <span className="text-[10px] text-[#9A9A92]">Cliquez sur un jour pour filtrer</span>
          </div>
        </div>

        {/* Right 1 Col: Day Breakdown & Quick Sections */}
        <div className="space-y-4">
          {/* Day Breakdown Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4A6B82]" />
                <h4 className="text-xs font-bold text-[#1A1A18] uppercase tracking-wider">
                  Jour : {selectedDayString}
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-[#4A6B82] bg-[#4A6B82]/10 px-2 py-0.5 rounded-full">
                {selectedDayReservations.length} véhicule(s)
              </span>
            </div>

            {selectedDayReservations.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#7A7A72]">
                Aucune réservation active pour cette date.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                {selectedDayReservations.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => onSelectReservation(res)}
                    className="p-2.5 rounded-xl border border-[#E5E5DF] bg-[#FAFAF7] hover:bg-white hover:border-[#4A6B82] transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1A1A18] truncate">
                        {res.vehicleName}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${getStatusColor(
                          res.status
                        )}`}
                      >
                        {res.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#7A7A72]">
                      <span className="truncate">{res.clientName}</span>
                      <span className="font-mono text-[10px]">{res.reservationNumber}</span>
                    </div>
                    <div className="text-[10px] text-[#4A6B82] flex items-center justify-between pt-1 border-t border-[#E5E5DF]/50">
                      <span>Du {res.startDate} au {res.endDate}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Section: Réservations du jour */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A1A18] flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#4A6B82]" />
                Aujourd'hui ({todaysReservations.length})
              </span>
              <span className="text-[10px] text-[#7A7A72]">{todayStr}</span>
            </div>

            {todaysReservations.length === 0 ? (
              <p className="text-[11px] text-[#7A7A72] italic">
                Aucune réservation active pour aujourd'hui.
              </p>
            ) : (
              <div className="space-y-1.5">
                {todaysReservations.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onSelectReservation(r)}
                    className="p-2 rounded-lg border border-[#E5E5DF] bg-[#FAFAF7] text-xs hover:border-[#4A6B82] cursor-pointer flex items-center justify-between"
                  >
                    <div className="truncate">
                      <span className="font-bold text-[#1A1A18]">{r.vehicleName}</span>
                      <span className="text-[10px] text-[#7A7A72] block">{r.clientName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#4A6B82] shrink-0">
                      {r.reservationNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Section: Réservations à venir */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs space-y-2.5">
            <span className="text-xs font-bold text-[#1A1A18] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#4A7A4A]" />
              Prochaines réservations ({upcomingReservations.length})
            </span>

            {upcomingReservations.length === 0 ? (
              <p className="text-[11px] text-[#7A7A72] italic">
                Aucune réservation future enregistrée.
              </p>
            ) : (
              <div className="space-y-1.5">
                {upcomingReservations.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onSelectReservation(r)}
                    className="p-2 rounded-lg border border-[#E5E5DF] bg-[#FAFAF7] text-xs hover:border-[#4A6B82] cursor-pointer flex items-center justify-between"
                  >
                    <div className="truncate">
                      <span className="font-bold text-[#1A1A18]">{r.vehicleName}</span>
                      <span className="text-[10px] text-[#7A7A72] block">
                        Débute le {r.startDate} • {r.clientName}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#4A7A4A] shrink-0">
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
