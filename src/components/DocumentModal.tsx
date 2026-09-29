import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { useAuth } from '../context/AuthContext';
import { Sale, Rental, Payment } from '../types';
import { X, Printer, FileText, CheckCircle2, Shield, FileSignature, Receipt, MessageSquare } from 'lucide-react';
import { SendWhatsAppModal } from './SendWhatsAppModal';
import { BaneServicesLogo } from './common/BaneServicesLogo';
import { BANESERVICES_LOGO_DATA_URI } from '../assets/logo';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'sale' | 'sale_receipt' | 'rental' | 'rental_invoice' | 'rental_receipt' | 'payment';
  saleData?: Sale | null;
  rentalData?: Rental | null;
  paymentData?: Payment | null;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  documentType,
  saleData,
  rentalData,
  paymentData,
}) => {
  const { settings, vehicles, clients } = useCrm();
  const { companyProfile } = useAuth();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const vehicle = saleData
    ? vehicles.find((v) => v.id === saleData.vehicleId)
    : rentalData
    ? vehicles.find((v) => v.id === rentalData.vehicleId)
    : null;

  const client = saleData
    ? clients.find((c) => c.id === saleData.clientId)
    : rentalData
    ? clients.find((c) => c.id === rentalData.clientId)
    : paymentData
    ? clients.find((c) => c.id === paymentData.clientId)
    : null;

  const companyName = companyProfile?.name || settings.companyName || 'BANESERVICES AUTO';
  const logoSrc = companyProfile?.logoUrl || settings.logoUrl || BANESERVICES_LOGO_DATA_URI;

  const getDocTitle = () => {
    switch (documentType) {
      case 'sale':
        return `FACTURE DE VENTE N° ${saleData?.saleNumber || ''}`;
      case 'sale_receipt':
        return `REÇU DE VENTE N° ${saleData?.saleNumber || ''}`;
      case 'rental':
        return `CONTRAT DE LOCATION DE VÉHICULE N° ${rentalData?.rentalNumber || ''}`;
      case 'rental_invoice':
        return `FACTURE DE LOCATION N° ${rentalData?.rentalNumber || ''}`;
      case 'rental_receipt':
        return `REÇU DE PAIEMENT LOCATION N° ${rentalData?.rentalNumber || ''}`;
      case 'payment':
        return `REÇU DE PAIEMENT N° ${paymentData?.paymentNumber || ''}`;
      default:
        return 'DOCUMENT';
    }
  };

  return (
    <div
      id="document-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A18]/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white"
    >
      <div
        id="document-modal-dialog"
        className="w-full max-w-3xl rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:my-0 print:bg-white text-[#2D2D2A] print:text-black"
      >
        {/* Modal Toolbar (hidden when printing) */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5DF] bg-[#F5F5F0] print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5A5A40]">
            <FileText className="w-4 h-4" />
            <span>{getDocTitle()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#1E7E34] border border-[#25D366]/30 font-bold text-xs transition-colors cursor-pointer"
              title="Envoyer via WhatsApp au client"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366] fill-current" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EBEBE6] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body (A4 Style) */}
        <div className="p-8 sm:p-10 space-y-6 bg-white print:bg-white text-xs sm:text-sm">
          {/* Header Section with Corporate Logo & Metadata */}
          <div className="flex justify-between items-start border-b border-[#E5E5DF] print:border-neutral-300 pb-6 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-24 h-16 sm:w-28 sm:h-20 shrink-0 p-1 border border-[#E5E5DF] rounded-xl bg-white flex items-center justify-center">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={companyName}
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <BaneServicesLogo variant="full" className="w-full h-full" alt={companyName} />
                )}
              </div>
              <div className="space-y-0.5">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#1A1A18] print:text-black uppercase font-['Outfit']">
                  {companyName}
                </h1>
                <p className="text-[#7A7A72] print:text-neutral-600 font-medium text-xs">
                  {companyProfile?.legalInfo || settings.legalStatus || 'Concession & Location de Véhicules'}
                </p>
                {(companyProfile?.rccm || settings.siretOrTaxId || settings.taxNumber) && (
                  <p className="text-[#7A7A72] print:text-neutral-600 font-mono text-[11px]">
                    RCCM / Fiscal : {companyProfile?.rccm || settings.siretOrTaxId || settings.taxNumber}
                  </p>
                )}
                <p className="text-[#7A7A72] print:text-neutral-600 text-xs">
                  {(companyProfile?.address || settings.address) && `${companyProfile?.address || settings.address}, `}
                  {settings.postalCode} {companyProfile?.city || settings.city}
                </p>
                <p className="text-[#7A7A72] print:text-neutral-600 text-xs">
                  Tél : {companyProfile?.phone || settings.phone || 'Non renseigné'}
                  {(companyProfile?.email || settings.email) && ` — Email : ${companyProfile?.email || settings.email}`}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-block px-3 py-1 bg-[#5A5A40]/10 print:bg-neutral-100 rounded-lg text-xs font-bold text-[#5A5A40] print:text-black uppercase tracking-wider mb-2">
                {getDocTitle()}
              </div>
              <div className="text-xs text-[#7A7A72] print:text-neutral-600">
                Date :{' '}
                <strong className="text-[#1A1A18] print:text-black">
                  {new Date().toLocaleDateString('fr-FR')}
                </strong>
              </div>
            </div>
          </div>

          {/* Client & Metadata Box */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-[#FAFAF8] print:bg-neutral-50 border border-[#E5E5DF] print:border-neutral-200">
            <div>
              <span className="text-[10px] font-bold text-[#5A5A40] print:text-neutral-700 uppercase tracking-wider block mb-1">
                {documentType.includes('rental') ? 'Locataire / Conducteur :' : 'Facturé à :'}
              </span>
              <div className="font-bold text-sm text-[#1A1A18] print:text-black">
                {client
                  ? client.type === 'entreprise' && client.companyName
                    ? client.companyName
                    : `${client.firstName} ${client.lastName}`
                  : saleData?.clientName || rentalData?.clientName || paymentData?.clientName || 'Client standard'}
              </div>
              {client?.phone && <div className="text-xs text-[#7A7A72] print:text-neutral-600">Tél : {client.phone}</div>}
              {client?.drivingLicenseNumber && (
                <div className="text-xs text-[#5A5A40] font-mono mt-0.5">
                  Permis n° : <strong>{client.drivingLicenseNumber}</strong>
                </div>
              )}
              {client?.address && (
                <div className="text-xs text-[#7A7A72] print:text-neutral-600">
                  {client.address}, {client.postalCode} {client.city}
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-[#5A5A40] print:text-neutral-700 uppercase tracking-wider block mb-1">
                Détails du document :
              </span>
              <div className="text-xs space-y-1 text-[#2D2D2A] print:text-neutral-700">
                {saleData && (
                  <>
                    <div>Réf Vente : <strong className="font-mono text-[#5A5A40]">{saleData.saleNumber}</strong></div>
                    <div>Date de vente : {new Date(saleData.saleDate).toLocaleDateString('fr-FR')}</div>
                    <div>Statut : <strong>{saleData.status || saleData.paymentStatus}</strong></div>
                  </>
                )}
                {rentalData && (
                  <>
                    <div>N° Contrat : <strong className="font-mono text-[#5A5A40]">{rentalData.rentalNumber}</strong></div>
                    <div>Période : {new Date(rentalData.startDate).toLocaleDateString('fr-FR')} au {new Date(rentalData.endDate).toLocaleDateString('fr-FR')}</div>
                    <div>Durée : <strong>{rentalData.durationDays} jour(s)</strong></div>
                    <div>Statut : <strong>{rentalData.status}</strong></div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Specifications */}
          {vehicle && (
            <div className="p-4 rounded-xl border border-[#E5E5DF] print:border-neutral-200">
              <h3 className="text-xs font-bold text-[#5A5A40] print:text-neutral-800 uppercase tracking-wider mb-2">
                Désignation du Véhicule
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#2D2D2A] print:text-neutral-700 text-xs">
                <div>
                  <span className="text-[#7A7A72] block text-[10px]">Marque & Modèle</span>
                  <span className="font-semibold text-[#1A1A18] print:text-black">{vehicle.make} {vehicle.model}</span>
                </div>
                <div>
                  <span className="text-[#7A7A72] block text-[10px]">Immatriculation</span>
                  <span className="font-mono font-bold text-[#5A5A40] print:text-black">{vehicle.registration}</span>
                </div>
                <div>
                  <span className="text-[#7A7A72] block text-[10px]">Année / Énergie</span>
                  <span>{vehicle.year} — {vehicle.fuelType}</span>
                </div>
                <div>
                  <span className="text-[#7A7A72] block text-[10px]">Compteur départ</span>
                  <span className="font-mono">{((rentalData?.mileageDeparture ?? vehicle.mileage) || 0).toLocaleString('fr-FR')} km</span>
                </div>
              </div>
            </div>
          )}

          {/* 1. FACTURE DE VENTE */}
          {documentType === 'sale' && saleData && (
            <div className="border border-[#E5E5DF] print:border-neutral-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F0] print:bg-neutral-100 text-[#7A7A72] print:text-neutral-700">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Montant HT</th>
                    <th className="p-3 text-right">TVA ({saleData.taxRate}%)</th>
                    <th className="p-3 text-right">Total TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DF] print:divide-neutral-200">
                  <tr>
                    <td className="p-3 font-medium text-[#1A1A18] print:text-black">
                      Vente Véhicule : {saleData.vehicleName} (Immat: {saleData.vehicleRegistration})
                    </td>
                    <td className="p-3 text-right font-mono">{saleData.salePrice.toLocaleString('fr-FR')} {settings.currencySymbol}</td>
                    <td className="p-3 text-right font-mono">{saleData.taxAmount.toLocaleString('fr-FR')} {settings.currencySymbol}</td>
                    <td className="p-3 text-right font-mono font-bold text-[#4A7A4A] print:text-black">
                      {saleData.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-4 bg-[#F5F5F0]/60 print:bg-neutral-50 border-t border-[#E5E5DF] print:border-neutral-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#7A7A72] print:text-neutral-600">Règlement : </span>
                  <span className="font-semibold text-[#1A1A18] print:text-black">{saleData.paymentMethod} ({saleData.status || saleData.paymentStatus})</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#1A1A18] print:text-black">
                    Net à payer TTC : {saleData.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. REÇU DE VENTE */}
          {documentType === 'sale_receipt' && saleData && (
            <div className="border border-[#E5E5DF] print:border-neutral-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F0] print:bg-neutral-100 text-[#7A7A72] print:text-neutral-700">
                  <tr>
                    <th className="p-3">Objet du Règlement</th>
                    <th className="p-3 text-right">Montant Total</th>
                    <th className="p-3 text-right">Montant Encaissé</th>
                    <th className="p-3 text-right">Solde Restant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DF] print:divide-neutral-200">
                  <tr>
                    <td className="p-3 font-medium text-[#1A1A18] print:text-black">
                      Encaissement Vente {saleData.saleNumber} — {saleData.vehicleName}
                    </td>
                    <td className="p-3 text-right font-mono">{saleData.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}</td>
                    <td className="p-3 text-right font-mono font-bold text-[#4A7A4A] print:text-black">
                      {saleData.amountPaid.toLocaleString('fr-FR')} {settings.currencySymbol}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[#B87320] print:text-black">
                      {Math.max(0, saleData.totalAmount - saleData.amountPaid).toLocaleString('fr-FR')} {settings.currencySymbol}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-4 bg-[#F5F5F0]/60 print:bg-neutral-50 border-t border-[#E5E5DF] print:border-neutral-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#7A7A72] print:text-neutral-600">Mode de versement : </span>
                  <span className="font-semibold text-[#1A1A18] print:text-black">{saleData.paymentMethod}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#4A7A4A] print:text-black">
                    Statut : {saleData.status || saleData.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. CONTRAT DE LOCATION */}
          {documentType === 'rental' && rentalData && (
            <div className="border border-[#E5E5DF] print:border-neutral-300 rounded-xl overflow-hidden space-y-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F0] print:bg-neutral-100 text-[#7A7A72] print:text-neutral-700">
                  <tr>
                    <th className="p-3">Prestation</th>
                    <th className="p-3 text-center">Durée</th>
                    <th className="p-3 text-right">Tarif / jour</th>
                    <th className="p-3 text-right">Total TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DF] print:divide-neutral-200">
                  <tr>
                    <td className="p-3 font-medium text-[#1A1A18] print:text-black">
                      Location de Véhicule : {rentalData.vehicleName} ({rentalData.vehicleRegistration})
                    </td>
                    <td className="p-3 text-center font-semibold">{rentalData.durationDays} jour(s)</td>
                    <td className="p-3 text-right font-mono">{rentalData.dailyRate} {settings.currencySymbol}</td>
                    <td className="p-3 text-right font-mono font-bold text-[#5A5A40] print:text-black">
                      {rentalData.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-[#7A7A72] print:text-neutral-600">
                      Caution de garantie (Dépôt de garantie)
                    </td>
                    <td className="p-3 text-center">—</td>
                    <td className="p-3 text-right">—</td>
                    <td className="p-3 text-right font-mono text-[#2D2D2A] print:text-neutral-800 font-semibold">
                      {(rentalData.depositAmount || 0).toLocaleString('fr-FR')} {settings.currencySymbol}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-4 bg-[#F5F5F0]/60 print:bg-neutral-50 border-t border-[#E5E5DF] print:border-neutral-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#7A7A72]">Règlement : </span>
                  <span className="font-semibold">{rentalData.paymentMethod} (Encaissé : {(rentalData.amountPaid || 0).toLocaleString('fr-FR')} {settings.currencySymbol})</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#1A1A18] print:text-black">
                    Total Location : {rentalData.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. FACTURE DE LOCATION */}
          {documentType === 'rental_invoice' && rentalData && (
            <div className="border border-[#E5E5DF] print:border-neutral-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F0] print:bg-neutral-100 text-[#7A7A72] print:text-neutral-700">
                  <tr>
                    <th className="p-3">Désignation</th>
                    <th className="p-3 text-center">Quantité / Jours</th>
                    <th className="p-3 text-right">Tarif Unitaire</th>
                    <th className="p-3 text-right">Total TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DF] print:divide-neutral-200">
                  <tr>
                    <td className="p-3 font-medium text-[#1A1A18] print:text-black">
                      Forfait Location Véhicule {rentalData.vehicleName} ({rentalData.vehicleRegistration})
                      <div className="text-[10px] text-[#7A7A72]">
                        Du {new Date(rentalData.startDate).toLocaleDateString('fr-FR')} au {new Date(rentalData.endDate).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold">{rentalData.durationDays} jour(s)</td>
                    <td className="p-3 text-right font-mono">{rentalData.dailyRate} {settings.currencySymbol}</td>
                    <td className="p-3 text-right font-mono font-bold text-[#5A5A40] print:text-black">
                      {rentalData.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-4 bg-[#F5F5F0]/60 print:bg-neutral-50 border-t border-[#E5E5DF] print:border-neutral-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#7A7A72] print:text-neutral-600">Mode de paiement : </span>
                  <span className="font-semibold text-[#1A1A18] print:text-black">{rentalData.paymentMethod}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#1A1A18] print:text-black">
                    Net à payer TTC : {rentalData.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 5. REÇU DE LOCATION */}
          {documentType === 'rental_receipt' && rentalData && (
            <div className="border border-[#E5E5DF] print:border-neutral-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F0] print:bg-neutral-100 text-[#7A7A72] print:text-neutral-700">
                  <tr>
                    <th className="p-3">Objet du Paiement</th>
                    <th className="p-3 text-right">Total Location</th>
                    <th className="p-3 text-right">Montant Encaissé</th>
                    <th className="p-3 text-right">Solde Restant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DF] print:divide-neutral-200">
                  <tr>
                    <td className="p-3 font-medium text-[#1A1A18] print:text-black">
                      Règlement Location {rentalData.rentalNumber} — {rentalData.vehicleName}
                    </td>
                    <td className="p-3 text-right font-mono">{rentalData.totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}</td>
                    <td className="p-3 text-right font-mono font-bold text-[#4A7A4A] print:text-black">
                      {(rentalData.amountPaid || 0).toLocaleString('fr-FR')} {settings.currencySymbol}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[#B87320] print:text-black">
                      {Math.max(0, rentalData.totalAmount - (rentalData.amountPaid || 0)).toLocaleString('fr-FR')} {settings.currencySymbol}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-4 bg-[#F5F5F0]/60 print:bg-neutral-50 border-t border-[#E5E5DF] print:border-neutral-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#7A7A72] print:text-neutral-600">Mode : </span>
                  <span className="font-semibold text-[#1A1A18] print:text-black">{rentalData.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[#7A7A72] print:text-neutral-600">Caution : </span>
                  <strong className="text-[#2D2D2A]">
                    {(rentalData.depositAmount || 0).toLocaleString('fr-FR')} {settings.currencySymbol} ({rentalData.depositReturned ? 'Restituée' : 'Déposée'})
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* 6. REÇU DE PAIEMENT GÉNÉRAL */}
          {documentType === 'payment' && paymentData && (
            <div className="border border-[#E5E5DF] print:border-neutral-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F0] print:bg-neutral-100 text-[#7A7A72] print:text-neutral-700">
                  <tr>
                    <th className="p-3">Désignation / Motif</th>
                    <th className="p-3">Affectation</th>
                    <th className="p-3 text-right">Mode de versement</th>
                    <th className="p-3 text-right">Montant Encaissé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DF] print:divide-neutral-200">
                  <tr>
                    <td className="p-3 font-medium text-[#1A1A18] print:text-black">
                      {paymentData.referenceTitle || 'Règlement client'}
                      {paymentData.notes && (
                        <div className="text-[11px] text-[#7A7A72] print:text-neutral-600 mt-0.5">
                          Note : {paymentData.notes}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-xs font-semibold text-[#5A5A40] print:text-black uppercase">
                      {paymentData.referenceType === 'sale'
                        ? 'Vente de véhicule'
                        : paymentData.referenceType === 'rental'
                        ? 'Location de véhicule'
                        : paymentData.referenceType === 'deposit_refund'
                        ? 'Restitution de caution'
                        : 'Paiement direct / Autre'}
                    </td>
                    <td className="p-3 text-right font-medium text-[#1A1A18] print:text-black">
                      {paymentData.paymentMethod}
                    </td>
                    <td className="p-3 text-right font-mono font-extrabold text-sm text-[#4A7A4A] print:text-black">
                      +{paymentData.amount.toLocaleString('fr-FR')} {settings.currencySymbol}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-4 bg-[#F5F5F0]/60 print:bg-neutral-50 border-t border-[#E5E5DF] print:border-neutral-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#7A7A72] print:text-neutral-600">Statut du règlement : </span>
                  <span className="font-bold text-[#4A7A4A] print:text-black uppercase">{paymentData.status}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#1A1A18] print:text-black">
                    Total Reçu : {paymentData.amount.toLocaleString('fr-FR')} {settings.currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Legal Terms and Signatures */}
          <div className="pt-4 border-t border-[#E5E5DF] print:border-neutral-300 space-y-4">
            <p className="text-[10px] text-[#7A7A72] print:text-neutral-600 leading-relaxed italic">
              {documentType === 'rental'
                ? settings.rentalTerms || "Le locataire déclare avoir pris connaissance des conditions générales de location et s'engage à restituer le véhicule dans l'état où il a été remis."
                : settings.invoiceFooter || 'Membre d’un centre de gestion agréé. Règlement par chèque, carte ou virement accepté.'}
            </p>

            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="border-t border-[#E5E5DF] print:border-neutral-400 pt-2">
                <span className="text-[11px] font-bold text-[#7A7A72] print:text-neutral-700 block">
                  Pour l'Agence (Signature & Cachet) :
                </span>
                <div className="h-14"></div>
              </div>

              <div className="border-t border-[#E5E5DF] print:border-neutral-400 pt-2 text-right">
                <span className="text-[11px] font-bold text-[#7A7A72] print:text-neutral-700 block">
                  Le Locataire / Client ("Lu et approuvé") :
                </span>
                <div className="h-14"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send WhatsApp Modal */}
      <SendWhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        initialClient={client}
        initialPhone={client?.whatsapp || client?.phone || saleData?.clientPhone || rentalData?.clientPhone || ''}
        initialCategory={documentType.includes('sale') ? 'vente' : documentType.includes('rental') ? 'location' : 'paiement'}
        initialTemplateCode={
          documentType === 'sale'
            ? 'confirmation_vente'
            : documentType === 'rental'
            ? 'confirmation_location'
            : documentType === 'payment'
            ? 'confirmation_paiement'
            : undefined
        }
        referenceType={saleData ? 'sale' : rentalData ? 'rental' : paymentData ? 'payment' : 'client'}
        referenceId={saleData?.id || rentalData?.id || paymentData?.id}
        referenceNumber={saleData?.saleNumber || rentalData?.rentalNumber || paymentData?.paymentNumber}
        documentType={documentType === 'sale' ? 'facture' : documentType === 'rental' ? 'contrat' : 'recu'}
        saleData={saleData}
        rentalData={rentalData}
        paymentData={paymentData}
      />
    </div>
  );
};
