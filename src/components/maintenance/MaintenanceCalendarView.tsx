import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { MaintenanceIntervention } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ShieldAlert,
  FileText,
  Wrench,
  Clock,
  Car,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface MaintenanceCalendarViewProps {
  onSelectIntervention: (intervention: MaintenanceIntervention) => void;
  onOpenVehicleSheet: (vehicleId: string) => void;
  onNewIntervention: () => void;
}

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  subtitle: string;
  type: 'insurance' | 'inspection' | 'scheduled_maint' | 'active_maint';
  vehicleId?: string;
  intervention?: MaintenanceIntervention;
  severity?: 'error' | 'warning' | 'info';
}

export const MaintenanceCalendarView: React.FC<MaintenanceCalendarViewProps> = ({
  onSelectIntervention,
  onOpenVehicleSheet,
  onNewIntervention,
}) => {
  const { vehicles, maintenances } = useCrm();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Compile all calendar events from real data:
  const events: CalendarEvent[] = [];

  // 1. Insurance expiries
  vehicles.forEach((v) => {
    if (v.insuranceExpiryDate) {
      events.push({
        id: `event_ins_${v.id}`,
        date: v.insuranceExpiryDate.split('T')[0],
        title: `Échéance Assurance`,
        subtitle: `${v.make} ${v.model} (${v.registration})`,
        type: 'insurance',
        vehicleId: v.id,
        severity: 'error',
      });
    }
  });

  // 2. Technical Inspection expiries
  vehicles.forEach((v) => {
    if (v.technicalInspectionExpiryDate) {
      events.push({
        id: `event_insp_${v.id}`,
        date: v.technicalInspectionExpiryDate.split('T')[0],
        title: `Visite Technique`,
        subtitle: `${v.make} ${v.model} (${v.registration})`,
        type: 'inspection',
        vehicleId: v.id,
        severity: 'warning',
      });
    }
  });

  // 3. Maintenance interventions (scheduled, active, or with next scheduled date)
  maintenances.forEach((m) => {
    if (m.status !== 'Annulée') {
      events.push({
        id: `event_maint_${m.id}`,
        date: m.date.split('T')[0],
        title: `${m.type}`,
        subtitle: `${m.vehicleName} (${m.supplier})`,
        type: m.status === 'En cours' ? 'active_maint' : 'scheduled_maint',
        vehicleId: m.vehicleId,
        intervention: m,
        severity: m.status === 'En cours' ? 'warning' : 'info',
      });

      if (m.nextScheduledDate) {
        events.push({
          id: `event_next_maint_${m.id}`,
          date: m.nextScheduledDate.split('T')[0],
          title: `Rappel : ${m.type}`,
          subtitle: `${m.vehicleName}`,
          type: 'scheduled_maint',
          vehicleId: m.vehicleId,
          intervention: m,
          severity: 'info',
        });
      }
    }
  });

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon...
  // Shift so Monday is 0
  const startDay = (firstDayIndex + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: startDay }, (_, i) => i);

  const todayStr = new Date().toISOString().split('T')[0];

  const getEventsForDay = (dayNum: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return events.filter((e) => e.date === dayStr);
  };

  const selectedDayEvents = selectedDay
    ? events.filter((e) => e.date === selectedDay)
    : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-500">
              Calendrier des échéances d'assurance, visites techniques et révisions
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white rounded-lg transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onNewIntervention}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Planifier un entretien
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600">
        <span className="font-semibold text-slate-800">Légende :</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Assurance expirant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Visite Technique / CT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Atelier en cours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Entretien / Révision</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-600 uppercase py-2.5">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mer</span>
          <span>Jeu</span>
          <span>Ven</span>
          <span>Sam</span>
          <span>Dim</span>
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 text-xs">
          {blankDays.map((_, i) => (
            <div key={`blank-${i}`} className="h-24 sm:h-28 bg-slate-50/50 p-1" />
          ))}

          {daysArray.map((dayNum) => {
            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayEvents = getEventsForDay(dayNum);
            const isToday = dayStr === todayStr;
            const isSelected = dayStr === selectedDay;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => setSelectedDay(dayStr)}
                className={`h-24 sm:h-28 p-1.5 overflow-hidden transition-colors cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/60 ring-2 ring-indigo-500 ring-inset'
                    : isToday
                    ? 'bg-amber-50/40 hover:bg-slate-50'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs ${
                      isToday
                        ? 'bg-indigo-600 text-white'
                        : isSelected
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'text-slate-800'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-500 px-1 rounded-sm bg-slate-100">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event Pills */}
                <div className="space-y-1 overflow-y-auto max-h-[60px] scrollbar-none my-1">
                  {dayEvents.slice(0, 3).map((e) => {
                    let pillStyle = 'bg-blue-100 text-blue-800 border-blue-200';
                    if (e.type === 'insurance') {
                      pillStyle = 'bg-rose-100 text-rose-800 border-rose-200 font-semibold';
                    } else if (e.type === 'inspection') {
                      pillStyle = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                    } else if (e.type === 'active_maint') {
                      pillStyle = 'bg-amber-100 text-amber-800 border-amber-200';
                    }

                    return (
                      <div
                        key={e.id}
                        onClick={(evt) => {
                          evt.stopPropagation();
                          if (e.intervention) {
                            onSelectIntervention(e.intervention);
                          } else if (e.vehicleId) {
                            onOpenVehicleSheet(e.vehicleId);
                          }
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded-sm truncate border leading-tight ${pillStyle} hover:opacity-80 transition-opacity`}
                        title={`${e.title} : ${e.subtitle}`}
                      >
                        {e.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <p className="text-[9px] text-slate-500 text-center font-semibold">
                      +{dayEvents.length - 3} de plus
                    </p>
                  )}
                </div>

                <div />
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Panel */}
      {selectedDay && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              Échéances pour le {new Date(selectedDay).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              Masquer
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 italic">
              Aucun événement ni échéance planifiée pour cette date.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {selectedDayEvents.map((e) => (
                <div
                  key={e.id}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                    e.type === 'insurance'
                      ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                      : e.type === 'inspection'
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : e.type === 'active_maint'
                      ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                      : 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">{e.title}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/80 border">
                        {e.type === 'insurance'
                          ? 'Assurance'
                          : e.type === 'inspection'
                          ? 'Visite Technique'
                          : 'Entretien'}
                      </span>
                    </div>
                    <p className="text-xs opacity-90">{e.subtitle}</p>
                  </div>
                  <div>
                    {e.intervention ? (
                      <button
                        onClick={() => onSelectIntervention(e.intervention!)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-xs font-semibold rounded-lg border shadow-2xs transition-colors"
                      >
                        Intervention →
                      </button>
                    ) : e.vehicleId ? (
                      <button
                        onClick={() => onOpenVehicleSheet(e.vehicleId!)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-xs font-semibold rounded-lg border shadow-2xs transition-colors"
                      >
                        Fiche véhicule →
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
