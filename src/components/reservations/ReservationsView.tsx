import React, { useState } from 'react';
import {
  CalendarClock,
  List,
  CalendarDays,
  Plus,
  Car,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { Reservation } from '../../types';
import { ReservationsDashboardCards } from './ReservationsDashboardCards';
import { ReservationsListTab } from './ReservationsListTab';
import { ReservationsCalendarTab } from './ReservationsCalendarTab';
import { AddReservationModal } from './AddReservationModal';
import { ReservationDetailModal } from './ReservationDetailModal';
import { EditReservationModal } from './EditReservationModal';
import { ConvertToRentalModal } from './ConvertToRentalModal';
import { ConvertToSaleModal } from './ConvertToSaleModal';
import { CancelReservationModal } from './CancelReservationModal';

export const ReservationsView: React.FC = () => {
  const { reservations } = useCrm();

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'calendar'>('list');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [convertingToRentalReservation, setConvertingToRentalReservation] =
    useState<Reservation | null>(null);
  const [convertingToSaleReservation, setConvertingToSaleReservation] =
    useState<Reservation | null>(null);
  const [cancelingReservation, setCancelingReservation] = useState<Reservation | null>(null);

  const handleOpenNew = () => {
    setIsAddModalOpen(true);
  };

  const handleFilterFromCards = (status: string) => {
    setActiveStatusFilter(status);
    setActiveSubTab('list');
  };

  const handleClearStatusFilter = () => {
    setActiveStatusFilter('all');
  };

  return (
    <div id="reservations-view-container" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#4A6B82]/10 border border-[#4A6B82]/20 flex items-center justify-center text-[#4A6B82]">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A18] font-['Outfit']">
              Réservations de Véhicules
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#7A7A72] mt-1">
            Bloquez rapidement des véhicules avant vente ou location pour éviter les doubles
            réservations.
          </p>
        </div>

        {/* Action button & View Switcher */}
        <div className="flex items-center gap-2">
          {/* Sub-tab switcher */}
          <div className="inline-flex p-1 rounded-xl bg-white border border-[#E5E5DF] shadow-2xs">
            <button
              type="button"
              id="subtab-reservations-list"
              onClick={() => setActiveSubTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'list'
                  ? 'bg-[#1A1A18] text-white shadow-xs'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Liste</span>
            </button>
            <button
              type="button"
              id="subtab-reservations-calendar"
              onClick={() => setActiveSubTab('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'calendar'
                  ? 'bg-[#1A1A18] text-white shadow-xs'
                  : 'text-[#7A7A72] hover:text-[#1A1A18]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendrier</span>
            </button>
          </div>

          <button
            type="button"
            id="top-new-reservation-btn"
            onClick={handleOpenNew}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#4A6B82] hover:bg-[#3B5668] rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle réservation</span>
          </button>
        </div>
      </div>

      {/* KPI Dashboard Cards */}
      <ReservationsDashboardCards
        onOpenNewReservation={handleOpenNew}
        onFilterStatus={handleFilterFromCards}
      />

      {/* Content depending on activeSubTab */}
      {activeSubTab === 'list' ? (
        <ReservationsListTab
          onOpenNewReservation={handleOpenNew}
          onSelectReservation={(r) => setSelectedReservation(r)}
          onEditReservation={(r) => setEditingReservation(r)}
          onConvertToRental={(r) => setConvertingToRentalReservation(r)}
          onConvertToSale={(r) => setConvertingToSaleReservation(r)}
          onCancelReservation={(r) => setCancelingReservation(r)}
          activeStatusFilter={activeStatusFilter}
          onClearStatusFilter={handleClearStatusFilter}
        />
      ) : (
        <ReservationsCalendarTab
          onOpenNewReservation={handleOpenNew}
          onSelectReservation={(r) => setSelectedReservation(r)}
        />
      )}

      {/* Modals */}
      {/* 1. Add Modal */}
      <AddReservationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* 2. Detail Modal */}
      <ReservationDetailModal
        reservation={selectedReservation}
        isOpen={!!selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onEdit={(r) => {
          setSelectedReservation(null);
          setEditingReservation(r);
        }}
        onConvertToRental={(r) => {
          setSelectedReservation(null);
          setConvertingToRentalReservation(r);
        }}
        onConvertToSale={(r) => {
          setSelectedReservation(null);
          setConvertingToSaleReservation(r);
        }}
        onCancelReservation={(r) => {
          setSelectedReservation(null);
          setCancelingReservation(r);
        }}
      />

      {/* 3. Edit Modal */}
      <EditReservationModal
        reservation={editingReservation}
        isOpen={!!editingReservation}
        onClose={() => setEditingReservation(null)}
      />

      {/* 4. Convert to Rental Modal */}
      <ConvertToRentalModal
        reservation={convertingToRentalReservation}
        isOpen={!!convertingToRentalReservation}
        onClose={() => setConvertingToRentalReservation(null)}
        onSuccess={() => setConvertingToRentalReservation(null)}
      />

      {/* 5. Convert to Sale Modal */}
      <ConvertToSaleModal
        reservation={convertingToSaleReservation}
        isOpen={!!convertingToSaleReservation}
        onClose={() => setConvertingToSaleReservation(null)}
        onSuccess={() => setConvertingToSaleReservation(null)}
      />

      {/* 6. Cancel Reservation Modal */}
      <CancelReservationModal
        reservation={cancelingReservation}
        isOpen={!!cancelingReservation}
        onClose={() => setCancelingReservation(null)}
        onSuccess={() => setCancelingReservation(null)}
      />
    </div>
  );
};
