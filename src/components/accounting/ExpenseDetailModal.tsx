import React from 'react';
import { useCrm } from '../../context/CrmContext';
import { Expense } from '../../types';
import {
  X,
  Printer,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  Tag,
  Receipt,
  Car,
  Building,
  User,
  CreditCard,
} from 'lucide-react';

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  isOpen,
  onClose,
  expense,
  onEdit,
  onDelete,
}) => {
  const { settings } = useCrm();

  if (!isOpen || !expense) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div
        id="modal-expense-detail"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E5E5DF] overflow-hidden my-8 print:shadow-none print:border-none"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E5E5DF] flex items-center justify-between bg-[#FAFAF8] print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                Pièce de dépense
              </h2>
              <p className="text-xs text-[#7A7A72]">{expense.expenseNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EAEAE4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Printable Slip */}
        <div className="p-6 space-y-5">
          {/* Company Mini Header */}
          <div className="text-center pb-4 border-b border-[#E5E5DF]">
            <h3 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
              {settings.companyName || 'Sirius Auto'}
            </h3>
            <p className="text-[11px] text-[#7A7A72]">{settings.address || 'Agence Automobile'}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              <span>JUSTIFICATIF DE DÉCAISSEMENT</span>
            </div>
          </div>

          {/* Big Amount */}
          <div className="text-center py-3 bg-[#FAFAF8] rounded-xl border border-[#E5E5DF]">
            <span className="text-xs text-[#7A7A72] block uppercase tracking-wider font-semibold">
              Montant Décaissé
            </span>
            <span className="text-2xl font-black text-red-600">
              -{expense.amount.toLocaleString('fr-FR')} {settings.currencySymbol || '€'}
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F0F0EC]">
              <span className="text-[#7A7A72]">Numéro de référence</span>
              <span className="font-semibold text-[#1A1A18]">{expense.expenseNumber}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0EC]">
              <span className="text-[#7A7A72]">Date d'opération</span>
              <span className="font-semibold text-[#1A1A18]">
                {new Date(expense.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0EC]">
              <span className="text-[#7A7A72]">Catégorie de charge</span>
              <span className="font-semibold px-2 py-0.5 rounded-md bg-[#F0F0EC] text-[#1A1A18]">
                {expense.category}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0EC]">
              <span className="text-[#7A7A72]">Mode de règlement</span>
              <span className="font-semibold text-[#1A1A18]">{expense.paymentMethod}</span>
            </div>

            {expense.beneficiary && (
              <div className="flex justify-between py-1.5 border-b border-[#F0F0EC]">
                <span className="text-[#7A7A72]">Fournisseur / Bénéficiaire</span>
                <span className="font-semibold text-[#1A1A18]">{expense.beneficiary}</span>
              </div>
            )}

            {expense.vehicleInfo && (
              <div className="flex justify-between py-1.5 border-b border-[#F0F0EC]">
                <span className="text-[#7A7A72]">Véhicule rattaché</span>
                <span className="font-semibold text-[#1A1A18]">{expense.vehicleInfo}</span>
              </div>
            )}

            {expense.receiptUrl && (
              <div className="flex justify-between py-1.5 border-b border-[#F0F0EC]">
                <span className="text-[#7A7A72]">Réf. Pièce jointe / Facture</span>
                <span className="font-semibold text-[#1A1A18]">{expense.receiptUrl}</span>
              </div>
            )}

            <div className="pt-2">
              <span className="text-[#7A7A72] block mb-1">Description :</span>
              <p className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E5DF] text-xs font-medium text-[#1A1A18]">
                {expense.description}
              </p>
            </div>

            {expense.notes && (
              <div className="pt-1">
                <span className="text-[#7A7A72] block mb-1">Notes :</span>
                <p className="p-2.5 bg-[#FAFAF8] rounded-xl border border-[#E5E5DF] text-xs text-[#7A7A72]">
                  {expense.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E5E5DF] flex items-center justify-between bg-[#FAFAF8] print:hidden">
          <button
            onClick={() => {
              if (window.confirm('Voulez-vous vraiment supprimer cette dépense des comptes ?')) {
                onDelete(expense.id);
                onClose();
              }
            }}
            className="px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(expense);
              }}
              className="px-3.5 py-2 rounded-xl border border-[#E5E5DF] bg-white text-xs font-medium text-[#2D2D2A] hover:bg-[#F5F5F0] transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modifier</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#2D2D2A] hover:bg-[#1A1A18] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
