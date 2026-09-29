import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Expense, ExpenseDocument } from '../../types';
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
  FileText,
  Paperclip,
  Download,
  Eye,
  ExternalLink,
  CheckCircle2,
  Clock,
  Shield,
  FileCheck,
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
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<ExpenseDocument | null>(null);

  if (!isOpen || !expense) return null;

  const handlePrint = () => {
    window.print();
  };

  const supplier = expense.supplier || expense.beneficiary || 'Non spécifié';
  const sym = settings.currencySymbol || '€';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div
        id="modal-expense-detail"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5E5DF] overflow-hidden my-8 print:shadow-none print:border-none print:max-w-none print:w-full print:m-0"
      >
        {/* Header (Hidden on print) */}
        <div className="px-6 py-4.5 border-b border-[#E5E5DF] flex items-center justify-between bg-[#FAFAF8] print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
                Détail de la dépense
              </h2>
              <p className="text-xs text-[#7A7A72]">{expense.expenseNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EAEAE4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Printable Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-8">
          {/* Printable Header for Bon de Décaissement */}
          <div className="flex items-start justify-between pb-5 border-b border-[#E5E5DF]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-[#1A1A18] font-['Outfit'] tracking-tight">
                  {settings.companyName || 'SIRIUS AUTO'}
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-[#5A5A40]/10 text-[#5A5A40]">
                  CRM
                </span>
              </div>
              <p className="text-xs text-[#7A7A72] mt-0.5">{settings.address || 'Agence Automobile'}</p>
              <p className="text-[11px] text-[#7A7A72]">
                Tél: {settings.phone || 'N/A'} {settings.email ? `• ${settings.email}` : ''}
              </p>
              {settings.taxNumber && (
                <p className="text-[10px] text-[#7A7A72] font-mono">NIF / TVA: {settings.taxNumber}</p>
              )}
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-700 uppercase tracking-wider">
                Bon de dépense
              </div>
              <div className="mt-1.5 text-xs font-bold text-[#1A1A18] font-mono">
                {expense.expenseNumber}
              </div>
              <div className="text-[11px] text-[#7A7A72]">
                Date : {new Date(expense.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Big Amount Card */}
          <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-red-800 uppercase font-semibold tracking-wider">
                Montant Décaissé
              </span>
              <div className="text-2xl font-black text-red-600 font-['Outfit']">
                -{expense.amount.toLocaleString('fr-FR')} {sym}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#7A7A72] block">Mode de règlement</span>
              <span className="text-xs font-bold text-[#1A1A18] px-2.5 py-1 rounded-md bg-white border border-red-200 inline-block mt-0.5">
                {expense.paymentMethod}
              </span>
            </div>
          </div>

          {/* Section: Informations Principales */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7A72] mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Informations de la charge</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E5DF]">
                <span className="text-[#7A7A72] block mb-0.5">Catégorie</span>
                <span className="font-bold text-[#1A1A18]">{expense.category}</span>
              </div>

              <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E5DF]">
                <span className="text-[#7A7A72] block mb-0.5">Fournisseur / Bénéficiaire</span>
                <span className="font-bold text-[#1A1A18]">{supplier}</span>
              </div>

              {expense.vehicleInfo && (
                <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E5DF] sm:col-span-2">
                  <span className="text-[#7A7A72] block mb-0.5">Véhicule rattaché</span>
                  <span className="font-bold text-[#1A1A18]">{expense.vehicleInfo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7A72] mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Description détaillée</span>
            </h3>
            <div className="p-3.5 bg-[#FAFAF8] rounded-xl border border-[#E5E5DF] text-xs font-medium text-[#1A1A18] leading-relaxed">
              {expense.description}
            </div>
          </div>

          {/* Documents joints */}
          {expense.documents && expense.documents.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7A72] mb-2 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Documents & Justificatifs ({expense.documents.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {expense.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] flex items-center justify-between text-xs hover:border-[#5A5A40] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {doc.type === 'photo' || doc.url.startsWith('data:image') ? (
                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-[#E5E5DF] bg-white">
                          <img
                            src={doc.url}
                            alt={doc.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1A1A18] truncate">{doc.name}</p>
                        <p className="text-[10px] text-[#7A7A72] uppercase font-mono">{doc.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedPreviewDoc(doc)}
                        className="p-1.5 text-[#7A7A72] hover:text-[#1A1A18] hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Aperçu"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={doc.url}
                        download={doc.name}
                        className="p-1.5 text-[#7A7A72] hover:text-[#1A1A18] hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Télécharger"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes internes */}
          {expense.notes && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7A72] mb-1.5">
                Notes & Commentaires
              </h3>
              <p className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E5DF] text-xs text-[#7A7A72]">
                {expense.notes}
              </p>
            </div>
          )}

          {/* Signatures & Stamp for print */}
          <div className="pt-8 border-t border-[#E5E5DF] grid grid-cols-2 gap-8 text-center text-xs">
            <div className="border-t border-dashed border-[#A0A098] pt-2">
              <span className="text-[#7A7A72] block text-[10px] uppercase font-bold">
                Le Bénéficiaire / Fournisseur
              </span>
              <span className="text-[11px] font-semibold text-[#1A1A18] mt-1 block">
                {supplier}
              </span>
            </div>

            <div className="border-t border-dashed border-[#A0A098] pt-2">
              <span className="text-[#7A7A72] block text-[10px] uppercase font-bold">
                Visa Direction & Comptabilité
              </span>
              <span className="text-[11px] font-semibold text-[#1A1A18] mt-1 block">
                {settings.companyName || 'Sirius Auto'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden on print) */}
        <div className="px-6 py-4 border-t border-[#E5E5DF] flex items-center justify-between bg-[#FAFAF8] print:hidden">
          <button
            onClick={() => {
              if (window.confirm('Voulez-vous vraiment supprimer définitivement cette dépense ?')) {
                onDelete(expense.id);
                onClose();
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer"
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
              className="px-4 py-2 rounded-xl border border-[#E5E5DF] bg-white text-xs font-medium text-[#2D2D2A] hover:bg-[#F5F5F0] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modifier</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#2D2D2A] hover:bg-[#1A1A18] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer le reçu</span>
            </button>
          </div>
        </div>

        {/* Document Lightbox Preview Modal */}
        {selectedPreviewDoc && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden p-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF] mb-3">
                <span className="font-bold text-sm text-[#1A1A18] truncate">
                  {selectedPreviewDoc.name}
                </span>
                <button
                  onClick={() => setSelectedPreviewDoc(null)}
                  className="p-1 rounded-lg text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#F0F0EC] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-[#FAFAF8] rounded-xl p-2">
                {selectedPreviewDoc.url.startsWith('data:image') || selectedPreviewDoc.type === 'photo' ? (
                  <img
                    src={selectedPreviewDoc.url}
                    alt={selectedPreviewDoc.name}
                    className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-xs"
                  />
                ) : (
                  <div className="p-12 text-center">
                    <FileText className="w-16 h-16 text-red-500 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-[#1A1A18]">{selectedPreviewDoc.name}</p>
                    <p className="text-xs text-[#7A7A72] mt-1">Fichier de document PDF / Bureautique</p>
                    <a
                      href={selectedPreviewDoc.url}
                      download={selectedPreviewDoc.name}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D2D2A] text-white rounded-xl text-xs font-semibold"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger le document</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
