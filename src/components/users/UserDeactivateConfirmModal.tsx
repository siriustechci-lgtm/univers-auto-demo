import React from 'react';
import { User } from '../../types';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface UserDeactivateConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: () => void;
}

export const UserDeactivateConfirmModal: React.FC<UserDeactivateConfirmModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm,
}) => {
  if (!isOpen || !user) return null;

  const isCurrentlyActive = user.isActive !== false;
  const actionLabel = isCurrentlyActive ? 'Désactiver' : 'Réactiver';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E5DF] space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                isCurrentlyActive
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}
            >
              {isCurrentlyActive ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                {actionLabel} le compte utilisateur
              </h3>
              <p className="text-xs text-[#7A7A72]">{user.fullName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7A7A72] hover:bg-[#F0F0EC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Information */}
        <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E5DF] space-y-2.5 text-xs text-[#5A5A52] leading-relaxed">
          {isCurrentlyActive ? (
            <>
              <p className="font-semibold text-[#1A1A18]">
                Êtes-vous sûr de vouloir désactiver l'accès de{' '}
                <span className="text-[#5A5A40] font-bold">{user.fullName}</span> ({user.role}) ?
              </p>
              <ul className="space-y-1.5 text-[11px] list-disc list-inside text-[#7A7A72]">
                <li>L'utilisateur ne pourra plus se connecter au CRM.</li>
                <li>
                  <strong className="text-[#1A1A18]">Son historique complet est conservé</strong> : aucune vente, location, facture ou paiement antérieur n'est altéré.
                </li>
                <li>Vous pourrez réactiver son compte à tout moment.</li>
              </ul>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#1A1A18]">
                Confirmez-vous la réactivation de{' '}
                <span className="text-[#5A5A40] font-bold">{user.fullName}</span> ({user.role}) ?
              </p>
              <p className="text-[11px] text-[#7A7A72]">
                L'utilisateur pourra à nouveau se connecter avec son adresse e-mail{' '}
                <span className="font-mono text-[#1A1A18]">{user.email}</span> et ses identifiants existants.
              </p>
            </>
          )}
        </div>

        {/* User Summary Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E5E5DF]">
          <div className="w-8 h-8 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center font-bold text-xs">
            {user.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <p className="font-bold text-[#1A1A18] truncate">{user.fullName}</p>
            <p className="text-[#7A7A72] text-[11px] truncate font-mono">{user.email}</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#5A5A40]/10 text-[#5A5A40]">
            {user.role}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#E5E5DF] text-xs font-semibold text-[#5A5A52] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl text-white font-semibold text-xs transition-all shadow-xs cursor-pointer ${
              isCurrentlyActive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#5A5A40] hover:bg-[#484832]'
            }`}
          >
            Confirmer la {isCurrentlyActive ? 'désactivation' : 'réactivation'}
          </button>
        </div>
      </div>
    </div>
  );
};
