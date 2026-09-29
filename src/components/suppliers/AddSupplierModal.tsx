import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Supplier, SupplierCategory, SupplierStatus } from '../../types';
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
} from 'lucide-react';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit?: Supplier | null;
}

const SUPPLIER_CATEGORIES: { category: SupplierCategory; label: string; desc: string }[] = [
  { category: 'Garage', label: 'Garage & Atelier Mécanique', desc: 'Entretien lourd, révisions, diagnostics' },
  { category: 'Mécanicien', label: 'Mécanicien indépendant', desc: 'Dépannage rapide, vidange, interventions légères' },
  { category: 'Carrossier', label: 'Carrosserie & Peinture', desc: 'Tôlerie, redressage, vitrage et lustrage' },
  { category: 'Assureur', label: 'Compagnie d\'Assurance & Courtier', desc: 'Polices auto, responsabilité civile, tout risque' },
  { category: 'Pièces détachées', label: 'Fournisseur de Pièces', desc: 'Filtres, plaquettes, pneus, batteries, pièces OEM' },
  { category: 'Station-service', label: 'Station-service & Carburant', desc: 'Cartes carburant, lavage, lubrifiants' },
  { category: 'Dépannage / Remorquage', label: 'Société de Dépannage / Remorquage', desc: 'Assistance 24/7, remorquage sur plateau' },
  { category: 'Contrôle technique', label: 'Centre de Contrôle Technique', desc: 'Visites techniques réglementaires' },
  { category: 'Lavage & Esthétique', label: 'Lavage & Préparation Esthétique', desc: 'Nettoyage intérieur/extérieur, detailing' },
  { category: 'Prestataire divers', label: 'Autre Prestataire Spécialisé', desc: 'Électronique embarquée, serrurerie auto, tracking GPS' },
];

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  supplierToEdit,
}) => {
  const { addSupplier, updateSupplier } = useCrm();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<SupplierCategory>('Garage');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<SupplierStatus>('Actif');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (supplierToEdit) {
      setName(supplierToEdit.name || '');
      setCategory(supplierToEdit.category || 'Garage');
      setContactPerson(supplierToEdit.contactPerson || '');
      setPhone(supplierToEdit.phone || '');
      setSecondaryPhone(supplierToEdit.secondaryPhone || '');
      setEmail(supplierToEdit.email || '');
      setAddress(supplierToEdit.address || '');
      setCity(supplierToEdit.city || '');
      setPostalCode(supplierToEdit.postalCode || '');
      setTaxNumber(supplierToEdit.taxNumber || '');
      setBankDetails(supplierToEdit.bankDetails || '');
      setPaymentTerms(supplierToEdit.paymentTerms || '');
      setNotes(supplierToEdit.notes || '');
      setStatus(supplierToEdit.status || 'Actif');
    } else {
      setName('');
      setCategory('Garage');
      setContactPerson('');
      setPhone('');
      setSecondaryPhone('');
      setEmail('');
      setAddress('');
      setCity('');
      setPostalCode('');
      setTaxNumber('');
      setBankDetails('');
      setPaymentTerms('Paiement comptant à la livraison');
      setNotes('');
      setStatus('Actif');
    }
    setErrors({});
  }, [supplierToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Le nom ou raison sociale est obligatoire.';
    }
    if (!phone.trim()) {
      errs.phone = 'Le numéro de téléphone principal est obligatoire.';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Veuillez saisir une adresse email valide.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const supplierPayload = {
      name: name.trim(),
      category,
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim(),
      secondaryPhone: secondaryPhone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      taxNumber: taxNumber.trim() || undefined,
      bankDetails: bankDetails.trim() || undefined,
      paymentTerms: paymentTerms.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
    };

    if (supplierToEdit) {
      updateSupplier(supplierToEdit.id, supplierPayload);
    } else {
      addSupplier(supplierPayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="modal-add-supplier"
        className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {supplierToEdit ? 'Modifier la fiche fournisseur' : 'Nouveau Fournisseur / Prestataire'}
              </h2>
              <p className="text-xs text-slate-500">
                {supplierToEdit
                  ? 'Mettez à jour les coordonnées et informations contractuelles du partenaire.'
                  : 'Enregistrez un garage, mécanicien, assureur ou fournisseur officiel.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {/* Section 1: Informations Générales */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Identité & Spécialité
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nom / Raison Sociale *
                </label>
                <input
                  id="input-supplier-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Garage Central Sirius, Point S Abidjan, Allianz Assurances..."
                  className={`w-full rounded-xl border ${
                    errors.name ? 'border-rose-400' : 'border-slate-300'
                  } px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catégorie d'activité *
                </label>
                <select
                  id="select-supplier-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupplierCategory)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {SUPPLIER_CATEGORIES.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Contact principal / Chef d'atelier
                </label>
                <input
                  id="input-supplier-contact"
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Ex: M. Kouassi (Chef d'atelier), Mme Diallo (Gestionnaire sinistres)"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Statut du partenariat
                </label>
                <select
                  id="select-supplier-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SupplierStatus)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Actif">Actif (Partenaire régulier)</option>
                  <option value="Inactif">Inactif (Temporairement non sollicité)</option>
                  <option value="Suspendu">Suspendu (Contrat en litige / pause)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Coordonnées & Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <Phone className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Coordonnées de communication
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Téléphone principal *
                </label>
                <input
                  id="input-supplier-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: +225 07 00 00 00"
                  className={`w-full rounded-xl border ${
                    errors.phone ? 'border-rose-400' : 'border-slate-300'
                  } px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.phone && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Téléphone 2 / WhatsApp
                </label>
                <input
                  id="input-supplier-secondary-phone"
                  type="text"
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  placeholder="Ex: +225 05 00 00 00"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email professionnel
                </label>
                <input
                  id="input-supplier-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@garage-sirius.com"
                  className={`w-full rounded-xl border ${
                    errors.email ? 'border-rose-400' : 'border-slate-300'
                  } px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
                />
                {errors.email && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Adresse physique / Atelier / Rue
                </label>
                <input
                  id="input-supplier-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Boulevard de Marseille, Zone 4C"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ville / Commune
                </label>
                <input
                  id="input-supplier-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Abidjan, Dakar, Douala..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Facturation & Modalités de Paiement */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Informations Bancaires & Commerciales
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  N° Fiscal / NIF / RCCM / SIRET
                </label>
                <input
                  id="input-supplier-tax-number"
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  placeholder="Ex: CI-ABJ-2023-B-12345 / NIF 1234567"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Conditions de règlement / Délais
                </label>
                <input
                  id="input-supplier-payment-terms"
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Ex: Comptant, Virement à 30 jours, 50% acompte..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                RIB / IBAN / Coordonnées Mobile Money
              </label>
              <textarea
                id="input-supplier-bank-details"
                rows={2}
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                placeholder="Ex: Banque Atlantique CI092 01001 12345678901 23 OU Wave / Orange Money : +225 07 00 00 00"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 4: Notes internes & Tarifs négociés */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notes internes & Remises négociées
            </label>
            <textarea
              id="input-supplier-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Remise de 10% sur les pièces détachées, priorité d'accueil des véhicules de la flotte Sirius Auto."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              id="btn-cancel-supplier-modal"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              id="btn-submit-supplier-modal"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {supplierToEdit ? 'Enregistrer les modifications' : 'Créer le fournisseur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
