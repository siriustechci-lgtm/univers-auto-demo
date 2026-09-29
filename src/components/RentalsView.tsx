import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Rental, RentalStatus } from '../types';
import { EmptyState } from './EmptyState';
import {
  KeyRound,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Car,
  FileText,
  Trash2,
  RotateCcw,
  Shield,
  Eye,
  FileSignature,
  Receipt,
  User,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface RentalsViewProps {
  onOpenRentalModal: () => void;
  onViewRental: (rental: Rental) => void;
  onCloseRental: (rental: Rental) => void;
  onGenerateContract: (rental: Rental) => void;
  onGenerateInvoice: (rental: Rental) => void;
  onGenerateReceipt?: (rental: Rental) => void;
  searchQuery?: string;
}

export const RentalsView: React.FC<RentalsViewProps> = ({
  onOpenRentalModal,
  onViewRental,
  onCloseRental,
  onGenerateContract,
  onGenerateInvoice,
  onGenerateReceipt,
  searchQuery = '',
}) => {
  const { rentals, deleteRental, settings } = useCrm();
  const [selectedStatus, setSelectedStatus] = useState<string>('Tous');
  const [localSearch, setLocalSearch] = useState('');

  const activeSearch = searchQuery || localSearch;

  const filteredRentals = rentals.filter((r) => {
    const q = activeSearch.toLowerCase();
    const matchesSearch =
      activeSearch === '' ||
      r.rentalNumber.toLowerCase().includes(q) ||
      r.vehicleName.toLowerCase().includes(q) ||
      r.clientName.toLowerCase().includes(q) ||
      r.vehicleRegistration.toLowerCase().includes(q);

    let matchesStatus = selectedStatus === 'Tous';
    if (selectedStatus === 'Terminée') {
      matchesStatus = r.status === 'Terminée' || r.status === 'Clôturée';
    } else if (selectedStatus !== 'Tous') {
      matchesStatus = r.status === selectedStatus;
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (st: RentalStatus) => {
    switch (st) {
      case 'En cours':
        return {
          label: 'En cours',
          bg: 'bg-[#4A7A4A]/10',
          text: 'text-[#4A7A4A]',
          border: 'border-[#4A7A4A]/30',
        };
      case 'Terminée':
      case 'Clôturée':
        return {
          label: 'Terminée',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
        };
      case 'Réservée':
        return {
          label: 'Réservée',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
        };
      case 'Annulée':
        return {
          label: 'Annulée',
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
        };
      default:
        return {
          label: st,
          bg: 'bg-[#F5F5F0]',
          text: 'text-[#7A7A72]',
          border: 'border-[#E5E5DF]',
        };
    }
  };

  return (
    <div id="rentals-view" className="space-y-6">
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
            Liste des Locations
          </h2>
          <p className="text-xs text-[#7A7A72]">
            Gestion des contrats de location, suivi des véhicules en circulation et restitutions
          </p>
        </div>

        <button
          id="rentals-create-btn"
          onClick={onOpenRentalModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white font-semibold text-sm transition-all shadow-xs active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nouvelle location</span>
        </button>
      </div>

      {/* MANDATORY EMPTY STATE: "Aucune location enregistrée" + Bouton "Créer une location" */}
      {rentals.length === 0 ? (
        <EmptyState
          id="empty-state-rentals"
          icon={<KeyRound className="w-8 h-8" />}
          title="Aucune location enregistrée"
          description="Aucun contrat de location n'a encore été créé. Utilisez l'assistant de location rapide pour enregistrer votre première location en quelques clics."
          actionText="Créer une location"
          onAction={onOpenRentalModal}
        />
      ) : (
        <>
          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E5DF] shadow-xs">
            {/* Quick status filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
              {['Tous', 'En cours', 'Réservée', 'Terminée', 'Annulée'].map((st) => {
                const count =
                  st === 'Tous'
                    ? rentals.length
                    : st === 'Terminée'
                    ? rentals.filter((r) => r.status === 'Terminée' || r.status === 'Clôturée').length
                    : rentals.filter((r) => r.status === st).length;

                const isSelected = selectedStatus === st;
                return (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#5A5A40] text-white font-semibold shadow-xs'
                        : 'bg-[#F5F5F0] text-[#5A5A52] hover:text-[#1A1A18] hover:bg-[#EBEBE6]'
                    }`}
                  >
                    {st} ({count})
                  </button>
                );
              })}
            </div>

            {/* Live Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
              <input
                type="text"
                placeholder="Rechercher par client, immatriculation, n° contrat..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl border border-[#E5E5DF] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF8] text-[#7A7A72] uppercase tracking-wider font-semibold border-b border-[#E5E5DF]">
                  <tr>
                    <th className="px-4 py-3.5">N° Contrat</th>
                    <th className="px-4 py-3.5">Date départ</th>
                    <th className="px-4 py-3.5">Date retour</th>
                    <th className="px-4 py-3.5">Client</th>
                    <th className="px-4 py-3.5">Véhicule</th>
                    <th className="px-4 py-3.5">Montant</th>
                    <th className="px-4 py-3.5">Caution</th>
                    <th className="px-4 py-3.5">Statut</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DF]">
                  {filteredRentals.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-[#7A7A72]">
                        Aucune location ne correspond aux critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredRentals.map((rental) => {
                      const badge = getStatusBadge(rental.status);

                      return (
                        <tr key={rental.id} className="hover:bg-[#FAFAF8] transition-colors">
                          {/* N° Contrat */}
                          <td className="px-4 py-3.5 font-mono font-bold text-[#5A5A40]">
                            {rental.rentalNumber}
                          </td>

                          {/* Date départ */}
                          <td className="px-4 py-3.5 text-[#2D2D2A]">
                            {new Date(rental.startDate).toLocaleDateString('fr-FR')}
                          </td>

                          {/* Date retour */}
                          <td className="px-4 py-3.5 text-[#2D2D2A]">
                            {new Date(rental.endDate).toLocaleDateString('fr-FR')}
                            <span className="block text-[10px] text-[#7A7A72] font-mono">
                              ({rental.durationDays} jour{rental.durationDays > 1 ? 's' : ''})
                            </span>
                          </td>

                          {/* Client */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-[#1A1A18]">{rental.clientName}</div>
                            {rental.clientPhone && (
                              <div className="text-[11px] text-[#7A7A72]">{rental.clientPhone}</div>
                            )}
                          </td>

                          {/* Véhicule */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-[#1A1A18]">{rental.vehicleName}</div>
                            <div className="font-mono text-[11px] text-[#5A5A40] font-semibold">
                              {rental.vehicleRegistration}
                            </div>
                          </td>

                          {/* Montant */}
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-[#1A1A18] text-sm font-['Outfit']">
                              {rental.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                            </span>
                            {rental.amountPaid !== undefined && rental.amountPaid < rental.totalAmount && (
                              <div className="text-[10px] text-[#B87320] font-semibold">
                                Payé : {rental.amountPaid.toLocaleString('fr-FR')} {settings.currencySymbol}
                              </div>
                            )}
                          </td>

                          {/* Caution */}
                          <td className="px-4 py-3.5">
                            <div className="font-mono text-[#2D2D2A] font-semibold">
                              {(rental.depositAmount || 0).toLocaleString('fr-FR')} {settings.currencySymbol}
                            </div>
                            <div className="text-[10px]">
                              {rental.depositReturned ? (
                                <span className="text-[#4A7A4A] font-medium">Restituée</span>
                              ) : (
                                <span className="text-[#7A7A72]">En garde</span>
                              )}
                            </div>
                          </td>

                          {/* Statut */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.label}
                            </span>
                          </td>

                          {/* Actions: Voir, Modifier, Retour véhicule, Générer contrat PDF, Générer facture PDF */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Voir détail */}
                              <button
                                id={`rental-view-btn-${rental.id}`}
                                onClick={() => onViewRental(rental)}
                                className="p-1.5 rounded-lg bg-[#F5F5F0] hover:bg-[#EBEBE6] text-[#2D2D2A] transition-colors cursor-pointer"
                                title="Voir les détails de la location"
                              >
                                <Eye className="w-4 h-4 text-[#5A5A40]" />
                              </button>

                              {/* Retour véhicule (si En cours) */}
                              {rental.status === 'En cours' && (
                                <button
                                  id={`rental-close-btn-${rental.id}`}
                                  onClick={() => onCloseRental(rental)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#4A7A4A]/10 hover:bg-[#4A7A4A]/20 text-[#4A7A4A] border border-[#4A7A4A]/30 text-xs font-semibold transition-colors cursor-pointer"
                                  title="Enregistrer le retour du véhicule"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span className="hidden lg:inline">Retour</span>
                                </button>
                              )}

                              {/* Contrat PDF */}
                              <button
                                id={`rental-contract-btn-${rental.id}`}
                                onClick={() => onGenerateContract(rental)}
                                className="p-1.5 rounded-lg bg-[#F5F5F0] hover:bg-[#EBEBE6] text-[#2D2D2A] transition-colors cursor-pointer"
                                title="Générer Contrat PDF"
                              >
                                <FileSignature className="w-4 h-4 text-[#5A5A40]" />
                              </button>

                              {/* Facture PDF */}
                              <button
                                id={`rental-invoice-btn-${rental.id}`}
                                onClick={() => onGenerateInvoice(rental)}
                                className="p-1.5 rounded-lg bg-[#F5F5F0] hover:bg-[#EBEBE6] text-[#2D2D2A] transition-colors cursor-pointer"
                                title="Générer Facture PDF"
                              >
                                <FileText className="w-4 h-4 text-[#5A5A40]" />
                              </button>

                              {/* Supprimer */}
                              <button
                                id={`rental-delete-btn-${rental.id}`}
                                onClick={() => {
                                  if (window.confirm(`Supprimer définitivement le contrat ${rental.rentalNumber} ?`)) {
                                    deleteRental(rental.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-[#9A9A92] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Supprimer la location"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards (Responsive touch optimized) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredRentals.map((rental) => {
              const badge = getStatusBadge(rental.status);
              return (
                <div
                  key={rental.id}
                  className="p-4 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-[#5A5A40]">
                        {rental.rentalNumber}
                      </span>
                      <h4 className="font-bold text-sm text-[#1A1A18] mt-0.5">
                        {rental.vehicleName}
                      </h4>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[#E5E5DF]/60">
                    <div>
                      <span className="text-[#7A7A72] block text-[10px]">Client</span>
                      <span className="font-semibold text-[#1A1A18] truncate block">
                        {rental.clientName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7A7A72] block text-[10px]">Immatriculation</span>
                      <span className="font-mono font-semibold text-[#5A5A40]">
                        {rental.vehicleRegistration}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7A7A72] block text-[10px]">Période</span>
                      <span className="text-[#2D2D2A]">
                        {new Date(rental.startDate).toLocaleDateString('fr-FR')} → {new Date(rental.endDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7A7A72] block text-[10px]">Montant / Caution</span>
                      <span className="font-bold text-[#1A1A18]">
                        {rental.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                      </span>
                      <span className="text-[#7A7A72] text-[10px] block">
                        (Caution: {rental.depositAmount} {settings.currencySymbol})
                      </span>
                    </div>
                  </div>

                  {/* Actions mobile */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <button
                      onClick={() => onViewRental(rental)}
                      className="p-2 rounded-xl bg-[#F5F5F0] hover:bg-[#EBEBE6] text-[#2D2D2A] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span>Détail</span>
                    </button>

                    {rental.status === 'En cours' && (
                      <button
                        onClick={() => onCloseRental(rental)}
                        className="p-2 rounded-xl bg-[#4A7A4A]/10 text-[#4A7A4A] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[#4A7A4A]/30 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retour</span>
                      </button>
                    )}

                    <button
                      onClick={() => onGenerateContract(rental)}
                      className="p-2 rounded-xl bg-[#F5F5F0] hover:bg-[#EBEBE6] text-[#2D2D2A] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileSignature className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span>Contrat</span>
                    </button>

                    <button
                      onClick={() => onGenerateInvoice(rental)}
                      className="p-2 rounded-xl bg-[#F5F5F0] hover:bg-[#EBEBE6] text-[#2D2D2A] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span>Facture</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
