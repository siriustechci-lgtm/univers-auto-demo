import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Rental } from '../types';
import { X, CheckCircle2, AlertTriangle, Calendar, Gauge, ShieldCheck } from 'lucide-react';

interface CloseRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: Rental | null;
}

export const CloseRentalModal: React.FC<CloseRentalModalProps> = ({
  isOpen,
  onClose,
  rental,
}) => {
  const { closeRentalVehicle, settings } = useCrm();

  const todayStr = new Date().toISOString().split('T')[0];

  const [actualReturnDate, setActualReturnDate] = useState(todayStr);
  const [returnMileage, setReturnMileage] = useState<number>(rental ? (rental.mileageDeparture || 0) + 120 : 0);
  const [conditionOnReturn, setConditionOnReturn] = useState<'Conforme' | 'Dommages constatés'>('Conforme');
  const [damageNotes, setDamageNotes] = useState('');
  const [damageFee, setDamageFee] = useState<number>(0);
  const [depositReturned, setDepositReturned] = useState(true);
  const [observations, setObservations] = useState('');

  if (!isOpen || !rental) return null;

  const totalKmRun = Math.max(0, returnMileage - (rental.mileageDeparture || 0));

  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    closeRentalVehicle(rental.id, {
      actualReturnDate,
      returnMileage: Number(returnMileage) || 0,
      conditionOnReturn,
      damageNotes: conditionOnReturn === 'Dommages constatés' ? damageNotes : undefined,
      damageFee: conditionOnReturn === 'Dommages constatés' ? Number(damageFee) : 0,
      depositReturned,
      notes: observations.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      id="close-rental-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A18]/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="close-rental-dialog"
        className="w-full max-w-lg rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#2D2D2A]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5DF] bg-[#F5F5F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A7A4A]/10 border border-[#4A7A4A]/20 flex items-center justify-center text-[#4A7A4A]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                Retour du Véhicule — {rental.rentalNumber}
              </h2>
              <p className="text-xs text-[#7A7A72]">
                Restitution et clôture du contrat de location
              </p>
            </div>
          </div>
          <button
            id="close-rental-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EBEBE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirmClose} className="p-6 space-y-4 bg-white max-h-[80vh] overflow-y-auto">
          {/* Info Summary */}
          <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#7A7A72]">Client :</span>
              <span className="font-bold text-[#1A1A18]">{rental.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7A7A72]">Véhicule :</span>
              <span className="font-semibold text-[#5A5A40]">
                {rental.vehicleName} ({rental.vehicleRegistration})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7A7A72]">Km au départ :</span>
              <span className="font-mono text-[#1A1A18] font-bold">
                {(rental.mileageDeparture || 0).toLocaleString('fr-FR')} km
              </span>
            </div>
          </div>

          {/* 1. Date retour réelle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                Date retour réelle <span className="text-rose-500">*</span>
              </label>
              <input
                id="return-actual-date"
                type="date"
                required
                value={actualReturnDate}
                onChange={(e) => setActualReturnDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] focus:border-[#5A5A40] focus:outline-hidden"
              />
            </div>

            {/* 2. Kilométrage retour */}
            <div>
              <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                Kilométrage retour (km) <span className="text-rose-500">*</span>
              </label>
              <input
                id="return-mileage-input"
                type="number"
                min={rental.mileageDeparture || 0}
                required
                value={returnMileage}
                onChange={(e) => setReturnMileage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs font-mono text-[#5A5A40] font-bold focus:border-[#5A5A40] focus:outline-hidden"
              />
              <p className="text-[10px] text-[#7A7A72] mt-0.5">
                Distance parcourue : <strong className="text-[#1A1A18] font-mono">{totalKmRun.toLocaleString('fr-FR')} km</strong>
              </p>
            </div>
          </div>

          {/* 3. État / Conformité du véhicule */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2D2A] mb-1.5">
              État du véhicule au retour
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="return-condition-conforme"
                onClick={() => {
                  setConditionOnReturn('Conforme');
                  setDepositReturned(true);
                }}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  conditionOnReturn === 'Conforme'
                    ? 'border-[#4A7A4A] bg-[#4A7A4A]/10 text-[#4A7A4A]'
                    : 'border-[#E5E5DF] bg-white text-[#7A7A72] hover:bg-[#FAFAF8]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Véhicule conforme</span>
              </button>

              <button
                type="button"
                id="return-condition-dommages"
                onClick={() => {
                  setConditionOnReturn('Dommages constatés');
                  setDepositReturned(false);
                }}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  conditionOnReturn === 'Dommages constatés'
                    ? 'border-[#D9534F] bg-rose-50 text-[#D9534F]'
                    : 'border-[#E5E5DF] bg-white text-[#7A7A72] hover:bg-[#FAFAF8]'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Dommages constatés</span>
              </button>
            </div>
          </div>

          {/* If damages */}
          {conditionOnReturn === 'Dommages constatés' && (
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2.5 animate-in fade-in duration-150">
              <label className="block text-xs font-semibold text-rose-900">
                Description des dommages constatés
              </label>
              <input
                type="text"
                placeholder="ex. Rayure porte arrière gauche, choc pare-choc..."
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs text-[#2D2D2A] focus:border-rose-400 focus:outline-hidden"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-rose-800 mb-1">
                    Frais retenus / Facturés ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="20"
                    value={damageFee}
                    onChange={(e) => setDamageFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs text-rose-900 font-bold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-rose-800 mb-1">
                    Caution ({rental.depositAmount} {settings.currencySymbol})
                  </label>
                  <select
                    value={depositReturned ? 'oui' : 'non'}
                    onChange={(e) => setDepositReturned(e.target.value === 'oui')}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs text-rose-900 font-medium focus:outline-hidden"
                  >
                    <option value="non">Retenue partielle ou totale</option>
                    <option value="oui">Restituée intégralement</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 4. Observations */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
              Observations
            </label>
            <textarea
              id="return-observations-input"
              rows={2}
              placeholder="État intérieur propre, niveau de carburant au retour..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 text-xs text-[#5A5A40]">
            En clôturant cette location, le véhicule <strong>{rental.vehicleName}</strong> repassera immédiatement au statut <strong>Disponible</strong> dans la flotte.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E5DF]">
            <button
              type="button"
              id="return-cancel-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] text-xs font-semibold cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              id="return-confirm-btn"
              className="px-5 py-2.5 rounded-xl bg-[#4A7A4A] hover:bg-[#3E663E] text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Clôturer la location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
