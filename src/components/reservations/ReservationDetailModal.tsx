import React, { useState } from 'react';
import {
  X,
  Calendar,
  Car,
  User,
  Phone,
  Mail,
  DollarSign,
  FileText,
  Printer,
  Edit2,
  Trash2,
  XCircle,
  KeyRound,
  BadgePercent,
  CheckCircle2,
  Clock,
  Send,
  Building2,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { Reservation, ReservationStatus, PaymentMethod } from '../../types';

interface ReservationDetailModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (reservation: Reservation) => void;
  onConvertToRental: (reservation: Reservation) => void;
  onConvertToSale: (reservation: Reservation) => void;
  onCancelReservation: (reservation: Reservation) => void;
}

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onEdit,
  onConvertToRental,
  onConvertToSale,
  onCancelReservation,
}) => {
  const { vehicles, clients, settings, deleteReservation, sendWhatsAppMessage } = useCrm();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !reservation) return null;

  const vehicle = vehicles.find((v) => v.id === reservation.vehicleId);
  const client = clients.find((c) => c.id === reservation.clientId);

  const startD = new Date(reservation.startDate);
  const endD = new Date(reservation.endDate);
  const diffTime = endD.getTime() - startD.getTime();
  const durationDays = isNaN(diffTime) ? 1 : Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'Réservée':
        return {
          bg: 'bg-[#4A6B82]/10',
          text: 'text-[#4A6B82]',
          border: 'border-[#4A6B82]/20',
          label: 'Réservée',
        };
      case 'Confirmée':
        return {
          bg: 'bg-[#4A7A4A]/10',
          text: 'text-[#4A7A4A]',
          border: 'border-[#4A7A4A]/20',
          label: 'Confirmée',
        };
      case 'Convertie en location':
        return {
          bg: 'bg-[#5A5A40]/10',
          text: 'text-[#5A5A40]',
          border: 'border-[#5A5A40]/20',
          label: 'Convertie en location',
        };
      case 'Convertie en vente':
        return {
          bg: 'bg-[#4A7A4A]/15',
          text: 'text-[#4A7A4A]',
          border: 'border-[#4A7A4A]/30',
          label: 'Convertie en vente',
        };
      case 'Annulée':
        return {
          bg: 'bg-[#B84030]/10',
          text: 'text-[#B84030]',
          border: 'border-[#B84030]/20',
          label: 'Annulée',
        };
      case 'Expirée':
        return {
          bg: 'bg-[#B87320]/10',
          text: 'text-[#B87320]',
          border: 'border-[#B87320]/20',
          label: 'Expirée',
        };
      default:
        return {
          bg: 'bg-[#7A7A72]/10',
          text: 'text-[#7A7A72]',
          border: 'border-[#7A7A72]/20',
          label: status,
        };
    }
  };

  const badge = getStatusBadge(reservation.status);

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    if (!reservation.clientPhone) return;
    const message = `Bonjour ${reservation.clientName}, votre réservation ${reservation.reservationNumber} pour le véhicule ${reservation.vehicleName} est bien enregistrée chez ${settings.agencyName} pour la période du ${reservation.startDate} au ${reservation.endDate}. Pour toute question, nous restons à votre entière disposition.`;

    sendWhatsAppMessage({
      clientId: reservation.clientId,
      clientName: reservation.clientName,
      clientPhone: reservation.clientPhone,
      content: message,
      messageCategory: 'reservation',
      referenceType: 'reservation',
      referenceId: reservation.id,
      referenceNumber: reservation.reservationNumber,
      openUrl: true,
    });
  };

  const handleDelete = () => {
    deleteReservation(reservation.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const canConvert =
    reservation.status === 'Réservée' ||
    reservation.status === 'Confirmée' ||
    reservation.status === 'Expirée';

  return (
    <div
      id="reservation-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="reservation-detail-modal-container"
        className="w-full max-w-3xl bg-white rounded-3xl border border-[#E5E5DF] shadow-xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header - Screen Only */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EC] bg-[#FAFAF7] print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A6B82]/10 border border-[#4A6B82]/20 flex items-center justify-center text-[#4A6B82]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1A1A18] font-['Outfit']">
                  Réservation {reservation.reservationNumber}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-[#7A7A72]">
                Créée le {reservation.date} • {reservation.vehicleName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="print-reservation-btn"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl border border-[#E5E5DF] bg-white text-xs font-semibold text-[#1A1A18] hover:bg-[#FAFAF7] transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#7A7A72]" />
              <span>Imprimer</span>
            </button>
            <button
              type="button"
              id="close-reservation-detail-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#E5E5DF]/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE VOUCHER / BON DE RÉSERVATION (Shows cleanly on print & preview) */}
        <div id="printable-reservation-voucher" className="p-6 space-y-6">
          {/* Header on print */}
          <div className="hidden print:flex items-center justify-between border-b border-[#E5E5DF] pb-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-[#1A1A18] font-['Outfit']">
                {settings.agencyName || 'SIRIUS AUTO'}
              </h1>
              <p className="text-xs text-[#7A7A72]">{settings.address || 'Agence Automobile'}</p>
              <p className="text-xs text-[#7A7A72]">
                Tél: {settings.phone || '-'} • Email: {settings.email || '-'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#1A1A18]">BON DE RÉSERVATION</div>
              <div className="text-xs font-mono font-bold text-[#4A6B82]">
                {reservation.reservationNumber}
              </div>
              <div className="text-xs text-[#7A7A72]">Date : {reservation.date}</div>
            </div>
          </div>

          {/* Cards Grid: Client & Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Info */}
            <div className="p-4 rounded-2xl border border-[#E5E5DF] bg-[#FAFAF7] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A1A18] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#4A6B82]" />
                  Informations Client
                </span>
                {reservation.clientPhone && (
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="text-[11px] font-semibold text-[#25D366] hover:underline flex items-center gap-1 print:hidden"
                  >
                    <Send className="w-3 h-3" /> WhatsApp
                  </button>
                )}
              </div>
              <div className="space-y-1.5 text-xs text-[#1A1A18]">
                <div className="font-bold text-sm text-[#1A1A18]">{reservation.clientName}</div>
                {reservation.clientPhone && (
                  <div className="flex items-center gap-1.5 text-[#7A7A72]">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{reservation.clientPhone}</span>
                  </div>
                )}
                {reservation.clientEmail && (
                  <div className="flex items-center gap-1.5 text-[#7A7A72]">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{reservation.clientEmail}</span>
                  </div>
                )}
                {client?.drivingLicenseNumber && (
                  <div className="text-[11px] text-[#7A7A72]">
                    Permis : <strong className="text-[#1A1A18]">{client.drivingLicenseNumber}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="p-4 rounded-2xl border border-[#E5E5DF] bg-[#FAFAF7] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A1A18] uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#4A6B82]" />
                  Véhicule Réservé
                </span>
                {vehicle?.status && (
                  <span className="text-[10px] font-semibold text-[#4A6B82] bg-[#4A6B82]/10 px-2 py-0.5 rounded-full">
                    Statut actuel : {vehicle.status}
                  </span>
                )}
              </div>
              <div className="space-y-1 text-xs text-[#1A1A18]">
                <div className="font-bold text-sm text-[#1A1A18]">{reservation.vehicleName}</div>
                <div className="flex items-center justify-between text-[#7A7A72]">
                  <span>Immatriculation :</span>
                  <span className="font-mono font-bold text-[#1A1A18]">
                    {reservation.vehicleRegistration}
                  </span>
                </div>
                {vehicle?.fuelType && (
                  <div className="flex items-center justify-between text-[#7A7A72]">
                    <span>Carburant / Boîte :</span>
                    <span>
                      {vehicle.fuelType} • {vehicle.transmission || 'Manuelle'}
                    </span>
                  </div>
                )}
                {vehicle?.dailyRate && (
                  <div className="flex items-center justify-between text-[#7A7A72]">
                    <span>Tarif journalier :</span>
                    <span className="font-semibold text-[#1A1A18]">
                      {vehicle.dailyRate} {settings.currencySymbol} / jour
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reservation Dates & Deposit */}
          <div className="p-4 rounded-2xl border border-[#E5E5DF] bg-white space-y-3">
            <div className="text-xs font-bold text-[#1A1A18] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#4A6B82]" />
              Période et Conditions Financières
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#F0F0EC]">
                <span className="text-[11px] text-[#7A7A72] block">Début de réservation</span>
                <span className="text-xs font-bold text-[#1A1A18]">{reservation.startDate}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#F0F0EC]">
                <span className="text-[11px] text-[#7A7A72] block">Fin de réservation</span>
                <span className="text-xs font-bold text-[#1A1A18]">{reservation.endDate}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#F0F0EC]">
                <span className="text-[11px] text-[#7A7A72] block">Durée totale</span>
                <span className="text-xs font-bold text-[#4A6B82]">{durationDays} jour(s)</span>
              </div>
            </div>

            {/* Acompte row */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#4A7A4A]/5 border border-[#4A7A4A]/20 text-xs">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#4A7A4A]" />
                <span className="font-medium text-[#1A1A18]">Acompte de réservation versé :</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm text-[#4A7A4A]">
                  {(reservation.depositAmount || 0).toLocaleString('fr-FR')}{' '}
                  {settings.currencySymbol}
                </span>
                {reservation.depositPaymentMethod && (
                  <span className="block text-[10px] text-[#7A7A72]">
                    Règlement par {reservation.depositPaymentMethod}
                  </span>
                )}
              </div>
            </div>

            {/* Notes if any */}
            {reservation.notes && (
              <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#F0F0EC] text-xs">
                <span className="font-semibold text-[#1A1A18] block mb-0.5">Notes internes :</span>
                <p className="text-[#7A7A72] italic whitespace-pre-wrap">{reservation.notes}</p>
              </div>
            )}
          </div>

          {/* Signature Block on Print */}
          <div className="hidden print:grid grid-cols-2 gap-8 pt-8 border-t border-[#E5E5DF] text-xs text-[#1A1A18]">
            <div className="space-y-12">
              <p className="font-bold">Signature du client :</p>
              <p className="text-[10px] text-[#7A7A72]">"Bon pour accord et réservation"</p>
            </div>
            <div className="space-y-12 text-right">
              <p className="font-bold">Cachet et signature de l'agence :</p>
              <p className="text-[10px] text-[#7A7A72]">{settings.agencyName}</p>
            </div>
          </div>

          {/* Conversion notice if converted */}
          {reservation.status === 'Convertie en location' && (
            <div className="p-3 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center gap-2 text-xs text-[#5A5A40]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Cette réservation a été convertie en contrat de location en cours.</span>
            </div>
          )}
          {reservation.status === 'Convertie en vente' && (
            <div className="p-3 rounded-xl bg-[#4A7A4A]/10 border border-[#4A7A4A]/20 flex items-center gap-2 text-xs text-[#4A7A4A]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Cette réservation a été convertie en vente définitive.</span>
            </div>
          )}
        </div>

        {/* Delete Confirmation Alert */}
        {showDeleteConfirm && (
          <div className="mx-6 mb-4 p-4 rounded-2xl bg-[#B84030]/10 border border-[#B84030]/20 space-y-3">
            <div className="text-xs font-semibold text-[#B84030]">
              Êtes-vous sûr de vouloir supprimer définitivement cette réservation ?
            </div>
            <p className="text-[11px] text-[#7A7A72]">
              Si le véhicule est actuellement réservé, son statut sera automatiquement réinitialisé
              sur « Disponible ».
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 text-xs font-semibold text-[#7A7A72] hover:bg-white rounded-lg"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1 text-xs font-semibold text-white bg-[#B84030] hover:bg-[#A33425] rounded-lg"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions - Screen Only */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-t border-[#F0F0EC] bg-[#FAFAF7] print:hidden">
          {/* Destructive / Status actions */}
          <div className="flex items-center gap-2">
            {canConvert && (
              <button
                type="button"
                id="cancel-res-btn"
                onClick={() => onCancelReservation(reservation)}
                className="px-3 py-2 text-xs font-semibold text-[#B84030] hover:bg-[#B84030]/10 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Annuler la réservation</span>
              </button>
            )}
            <button
              type="button"
              id="delete-res-btn"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 text-xs font-semibold text-[#7A7A72] hover:text-[#B84030] hover:bg-[#B84030]/10 rounded-xl transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer</span>
            </button>
          </div>

          {/* Edit & Conversion actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="edit-res-btn"
              onClick={() => onEdit(reservation)}
              className="px-3.5 py-2 text-xs font-semibold text-[#1A1A18] bg-white border border-[#E5E5DF] hover:bg-[#F0F0EC] rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#7A7A72]" />
              <span>Modifier</span>
            </button>

            {canConvert && (
              <>
                <button
                  type="button"
                  id="convert-to-rental-btn"
                  onClick={() => onConvertToRental(reservation)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#5A5A40] hover:bg-[#484833] rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Convertir en location</span>
                </button>
                <button
                  type="button"
                  id="convert-to-sale-btn"
                  onClick={() => onConvertToSale(reservation)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#4A7A4A] hover:bg-[#3D663D] rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <BadgePercent className="w-3.5 h-3.5" />
                  <span>Convertir en vente</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
