import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Rental } from '../types';
import { SendWhatsAppModal } from './SendWhatsAppModal';
import {
  X,
  KeyRound,
  User,
  Car,
  Calendar,
  CreditCard,
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Receipt,
  FileSignature,
  FileCheck2,
  MessageSquare,
} from 'lucide-react';

interface RentalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: Rental | null;
  onOpenCloseRental?: (rental: Rental) => void;
  onGenerateContract?: (rental: Rental) => void;
  onGenerateInvoice?: (rental: Rental) => void;
  onGenerateReceipt?: (rental: Rental) => void;
}

export const RentalDetailModal: React.FC<RentalDetailModalProps> = ({
  isOpen,
  onClose,
  rental,
  onOpenCloseRental,
  onGenerateContract,
  onGenerateInvoice,
  onGenerateReceipt,
}) => {
  const { settings, vehicles, clients } = useCrm();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  if (!isOpen || !rental) return null;

  // Retrieve client & vehicle if missing enriched fields
  const clientObj = clients.find((c) => c.id === rental.clientId);
  const vehicleObj = vehicles.find((v) => v.id === rental.vehicleId);

  const displayClientName =
    rental.clientName ||
    (clientObj?.type === 'entreprise' && clientObj.companyName
      ? clientObj.companyName
      : clientObj
      ? `${clientObj.firstName} ${clientObj.lastName}`
      : 'Client inconnu');

  const displayClientPhone = rental.clientPhone || clientObj?.phone || 'N/C';
  const displayClientLicense =
    rental.clientDrivingLicense || clientObj?.drivingLicenseNumber || 'Non renseigné';

  const displayVehicleMake = rental.vehicleMake || vehicleObj?.make || '';
  const displayVehicleModel = rental.vehicleModel || vehicleObj?.model || rental.vehicleName;
  const displayVehicleReg = rental.vehicleRegistration || vehicleObj?.registration || 'N/C';

  const balance =
    rental.balanceDue !== undefined
      ? rental.balanceDue
      : Math.max(0, rental.totalAmount - (rental.amountPaid || 0));

  const getStatusBadge = (st: Rental['status']) => {
    switch (st) {
      case 'En cours':
        return 'bg-[#4A7A4A]/10 text-[#4A7A4A] border-[#4A7A4A]/30';
      case 'Terminée':
      case 'Clôturée':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Réservée':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Annulée':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-[#F5F5F0] text-[#7A7A72] border-[#E5E5DF]';
    }
  };

  return (
    <div
      id="rental-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A18]/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="rental-detail-dialog"
        className="w-full max-w-2xl rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 text-[#2D2D2A]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5DF] bg-[#F5F5F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                  Contrat de Location {rental.rentalNumber}
                </h2>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                    rental.status
                  )}`}
                >
                  {rental.status}
                </span>
              </div>
              <p className="text-xs text-[#7A7A72]">
                Créé le {new Date(rental.createdAt || rental.startDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <button
            id="rental-detail-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EBEBE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto bg-white">
          {/* Section 1: Client & Véhicule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client */}
            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>Client Conducteur</span>
              </div>
              <div>
                <div className="text-sm font-bold text-[#1A1A18]">{displayClientName}</div>
                <div className="text-xs text-[#7A7A72] mt-0.5">Téléphone : {displayClientPhone}</div>
                <div className="text-xs text-[#5A5A40] font-mono mt-0.5">
                  Permis n° : <strong>{displayClientLicense}</strong>
                </div>
              </div>
            </div>

            {/* Véhicule */}
            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                <Car className="w-4 h-4" />
                <span>Véhicule Loué</span>
              </div>
              <div className="flex items-start gap-3">
                {vehicleObj?.photoUrl ? (
                  <img
                    src={vehicleObj.photoUrl}
                    alt={displayVehicleMake}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover border border-[#E5E5DF]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#EBEBE6] flex items-center justify-center text-[#7A7A72]">
                    <Car className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-[#1A1A18]">
                    {displayVehicleMake} {displayVehicleModel}
                  </div>
                  <div className="text-xs font-mono font-semibold text-[#5A5A40] mt-0.5">
                    Immat : {displayVehicleReg}
                  </div>
                  <div className="text-[11px] text-[#7A7A72]">
                    Départ : {(rental.mileageDeparture || 0).toLocaleString('fr-FR')} km
                    {rental.mileageReturn ? ` → Retour : ${rental.mileageReturn.toLocaleString('fr-FR')} km` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Période & Durée */}
          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4" />
              <span>Période & Tarification</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#7A7A72] block text-[11px]">Départ</span>
                <span className="font-semibold text-[#1A1A18]">
                  {new Date(rental.startDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div>
                <span className="text-[#7A7A72] block text-[11px]">Retour prévu</span>
                <span className="font-semibold text-[#1A1A18]">
                  {new Date(rental.endDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div>
                <span className="text-[#7A7A72] block text-[11px]">Durée</span>
                <span className="font-bold text-[#5A5A40]">
                  {rental.durationDays} jour{rental.durationDays > 1 ? 's' : ''}
                </span>
              </div>
              <div>
                <span className="text-[#7A7A72] block text-[11px]">Tarif / jour</span>
                <span className="font-semibold text-[#2D2D2A]">
                  {rental.dailyRate} {settings.currencySymbol}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Paiement & Caution */}
          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-3">
              <CreditCard className="w-4 h-4" />
              <span>Résumé Financier</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#7A7A72] block text-[11px]">Montant location</span>
                <span className="font-bold text-sm text-[#1A1A18] font-['Outfit']">
                  {rental.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                </span>
              </div>
              <div>
                <span className="text-[#7A7A72] block text-[11px]">Caution déposée</span>
                <span className="font-bold text-sm text-[#2D2D2A] font-['Outfit']">
                  {(rental.depositAmount || 0).toLocaleString('fr-FR')} {settings.currencySymbol}
                </span>
              </div>
              <div>
                <span className="text-[#7A7A72] block text-[11px]">Montant payé</span>
                <span className="font-bold text-sm text-[#4A7A4A] font-['Outfit']">
                  {(rental.amountPaid || 0).toLocaleString('fr-FR')} {settings.currencySymbol}
                </span>
              </div>
              <div>
                <span className="text-[#7A7A72] block text-[11px]">Solde restant</span>
                <span
                  className={`font-bold text-sm font-['Outfit'] ${
                    balance > 0 ? 'text-[#B87320]' : 'text-[#4A7A4A]'
                  }`}
                >
                  {balance.toLocaleString('fr-FR')} {settings.currencySymbol}
                </span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#E5E5DF] flex items-center justify-between text-xs text-[#7A7A72]">
              <span>Mode de règlement : <strong className="text-[#2D2D2A]">{rental.paymentMethod}</strong></span>
              <span>Statut caution : <strong className="text-[#2D2D2A]">{rental.depositReturned ? 'Restituée' : 'Conservée / Non clôturée'}</strong></span>
            </div>
          </div>

          {/* Section 4: Retour & Clôture info if finished */}
          {(rental.status === 'Terminée' || rental.status === 'Clôturée') && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-700" />
                <span>Restitution effectuée</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-blue-800">
                <div>
                  <span className="text-blue-600 block text-[11px]">Date retour :</span>
                  <strong>{rental.actualReturnDate ? new Date(rental.actualReturnDate).toLocaleDateString('fr-FR') : 'Non renseigné'}</strong>
                </div>
                <div>
                  <span className="text-blue-600 block text-[11px]">Kilométrage retour :</span>
                  <strong className="font-mono">{rental.mileageReturn?.toLocaleString('fr-FR')} km</strong>
                </div>
                <div>
                  <span className="text-blue-600 block text-[11px]">État :</span>
                  <strong>{rental.conditionOnReturn || 'Conforme'}</strong>
                </div>
              </div>
              {rental.damageNotes && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs mt-1">
                  <strong>Dommages :</strong> {rental.damageNotes} ({rental.damageFee || 0} {settings.currencySymbol})
                </div>
              )}
            </div>
          )}

          {/* Section 5: Documents PDF Actions & WhatsApp */}
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-2">
              Documents du Contrat & Partage WhatsApp
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {onGenerateContract && (
                <button
                  type="button"
                  id="detail-gen-contract-btn"
                  onClick={() => {
                    onGenerateContract(rental);
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-[#5A5A40]/30 bg-[#5A5A40]/5 hover:bg-[#5A5A40]/10 text-[#5A5A40] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileSignature className="w-4 h-4" />
                  <span>Contrat PDF</span>
                </button>
              )}

              {onGenerateInvoice && (
                <button
                  type="button"
                  id="detail-gen-invoice-btn"
                  onClick={() => {
                    onGenerateInvoice(rental);
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#FAFAF8] text-[#2D2D2A] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#5A5A40]" />
                  <span>Facture PDF</span>
                </button>
              )}

              {onGenerateReceipt && (
                <button
                  type="button"
                  id="detail-gen-receipt-btn"
                  onClick={() => {
                    onGenerateReceipt(rental);
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#FAFAF8] text-[#2D2D2A] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-[#4A7A4A]" />
                  <span>Reçu PDF</span>
                </button>
              )}

              <button
                type="button"
                id="detail-whatsapp-btn"
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="p-3 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1E7E34] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366] fill-current" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-[#E5E5DF] bg-[#F5F5F0]">
          {rental.status === 'En cours' && onOpenCloseRental ? (
            <button
              type="button"
              id="detail-return-vehicle-btn"
              onClick={() => {
                onOpenCloseRental(rental);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4A7A4A] hover:bg-[#3E663E] text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retour du véhicule</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            id="rental-detail-modal-close"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Send WhatsApp Modal */}
      <SendWhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        initialClient={clientObj}
        initialPhone={displayClientPhone}
        initialCategory="location"
        initialTemplateCode="confirmation_location"
        referenceType="rental"
        referenceId={rental.id}
        referenceNumber={rental.rentalNumber}
        documentType="contrat"
        rentalData={rental}
      />
    </div>
  );
};
