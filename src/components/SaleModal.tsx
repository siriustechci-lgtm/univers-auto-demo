import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { PaymentMethod, PaymentStatus, SaleStatus, Vehicle, Client } from '../types';
import {
  X,
  BadgePercent,
  User,
  Car,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  ArrowRight,
  Phone,
  DollarSign,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedVehicleId?: string;
  preselectedClientId?: string;
  onOpenNewClientModal?: () => void;
}

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  preselectedVehicleId,
  preselectedClientId,
}) => {
  const { vehicles, clients, addSale, addClient, settings } = useCrm();

  // Wizard Step: 1 = Client, 2 = Véhicule, 3 = Paiement, 4 = Validation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Client state
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  // New Client quick fields
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  // Step 2: Vehicle state
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');

  // Step 3: Payment state
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Virement bancaire');
  const [saleDate, setSaleDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  // Filter available vehicles only (Disponibles)
  const availableVehicles = vehicles.filter(
    (v) => v.status === 'Disponible' || v.id === preselectedVehicleId
  );

  // Initialize or reset wizard when opened
  useEffect(() => {
    if (isOpen) {
      if (preselectedClientId) {
        setSelectedClientId(preselectedClientId);
        setClientMode('existing');
        setCurrentStep(2); // Jump to vehicle selection
      } else {
        setCurrentStep(1);
        if (clients.length === 0) {
          setClientMode('new');
        } else {
          setClientMode('existing');
          if (!selectedClientId && clients.length > 0) {
            setSelectedClientId(clients[0].id);
          }
        }
      }

      if (preselectedVehicleId) {
        setSelectedVehicleId(preselectedVehicleId);
        const veh = vehicles.find((v) => v.id === preselectedVehicleId);
        if (veh && veh.sellingPrice) {
          setTotalAmount(veh.sellingPrice);
          setAmountPaid(veh.sellingPrice);
        }
      }
    }
  }, [isOpen, preselectedVehicleId, preselectedClientId, vehicles, clients]);

  // When selected vehicle changes, update default totalAmount & amountPaid
  const handleSelectVehicle = (veh: Vehicle) => {
    setSelectedVehicleId(veh.id);
    const price = veh.sellingPrice || 0;
    setTotalAmount(price);
    setAmountPaid(price);
  };

  if (!isOpen) return null;

  // Derived calculations
  const remainingBalance = Math.max(0, totalAmount - amountPaid);

  // Selected client object
  const selectedExistingClient = clients.find((c) => c.id === selectedClientId);
  const displayClientName =
    clientMode === 'new'
      ? newClientName.trim()
      : selectedExistingClient?.type === 'entreprise' && selectedExistingClient.companyName
      ? selectedExistingClient.companyName
      : selectedExistingClient
      ? `${selectedExistingClient.firstName} ${selectedExistingClient.lastName}`.trim()
      : 'Client non sélectionné';

  const displayClientPhone =
    clientMode === 'new'
      ? newClientPhone.trim()
      : selectedExistingClient?.phone || 'N/C';

  // Selected vehicle object
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Filtered lists for selection
  const filteredClients = clients.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName} ${c.companyName || ''}`.toLowerCase();
    const phone = c.phone.toLowerCase();
    const q = clientSearch.toLowerCase();
    return fullName.includes(q) || phone.includes(q);
  });

  const filteredVehicles = availableVehicles.filter((v) => {
    const term = `${v.make} ${v.model} ${v.registration}`.toLowerCase();
    return term.includes(vehicleSearch.toLowerCase());
  });

  // Step Validation Handlers
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (clientMode === 'new') {
        if (!newClientName.trim()) {
          alert('Veuillez renseigner le nom du client.');
          return;
        }
        if (!newClientPhone.trim()) {
          alert('Veuillez renseigner le téléphone du client.');
          return;
        }
      } else {
        if (!selectedClientId) {
          alert('Veuillez sélectionner un client.');
          return;
        }
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedVehicleId) {
        alert('Veuillez sélectionner un véhicule disponible.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (totalAmount <= 0) {
        alert('Le montant total doit être supérieur à 0.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  // Final Confirmation of Sale
  const handleConfirmSale = () => {
    let finalClientId = selectedClientId;

    // If new client was entered in Step 1, create client record first
    if (clientMode === 'new') {
      const parts = newClientName.trim().split(' ');
      const firstName = parts.length > 1 ? parts.slice(0, -1).join(' ') : '';
      const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];

      const created = addClient({
        type: 'particulier',
        firstName: firstName || 'Client',
        lastName: lastName || 'Nouveau',
        phone: newClientPhone.trim(),
        email: newClientEmail.trim() || `${Date.now()}@client.sirius`,
      });
      finalClientId = created.id;
    }

    if (!finalClientId || !selectedVehicleId || totalAmount <= 0) {
      return;
    }

    const calculatedStatus: PaymentStatus =
      amountPaid >= totalAmount
        ? 'Payé'
        : amountPaid > 0
        ? 'Partiel'
        : 'En attente';

    // Call addSale from context (automatically marks vehicle as Vendu and adds payment)
    const sale = addSale({
      vehicleId: selectedVehicleId,
      clientId: finalClientId,
      salePrice: totalAmount,
      taxRate: 0, // In total direct pricing
      paymentMethod,
      paymentStatus: calculatedStatus,
      amountPaid: Number(amountPaid) || 0,
      saleDate: saleDate || new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
    });

    if (sale) {
      onClose();
    }
  };

  return (
    <div
      id="sale-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A18]/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="sale-modal-dialog"
        className="w-full max-w-2xl rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 text-[#2D2D2A]"
      >
        {/* Header with Title & Close */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5DF] bg-[#F5F5F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A7A4A]/10 border border-[#4A7A4A]/20 flex items-center justify-center text-[#4A7A4A]">
              <BadgePercent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A18] tracking-tight font-['Outfit']">
                Vente Rapide de Véhicule
              </h2>
              <p className="text-xs text-[#7A7A72]">
                Assistant en 4 étapes — Vente, encaissement et facture en 1 minute
              </p>
            </div>
          </div>
          <button
            id="sale-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A7A72] hover:text-[#1A1A18] hover:bg-[#EBEBE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tracker */}
        <div className="px-6 py-3.5 bg-[#FAFAF8] border-b border-[#E5E5DF]">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors ${
                currentStep === 1
                  ? 'text-[#5A5A40]'
                  : currentStep > 1
                  ? 'text-[#4A7A4A]'
                  : 'text-[#9A9A92]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 1
                    ? 'bg-[#5A5A40] text-white'
                    : currentStep > 1
                    ? 'bg-[#4A7A4A] text-white'
                    : 'bg-[#E5E5DF] text-[#7A7A72]'
                }`}
              >
                1
              </div>
              <span className="hidden sm:inline">Client</span>
            </button>

            <ChevronRight className="w-4 h-4 text-[#C5C5BF]" />

            {/* Step 2 */}
            <button
              onClick={() => {
                if (clientMode === 'new' && (!newClientName || !newClientPhone)) return;
                if (clientMode === 'existing' && !selectedClientId) return;
                setCurrentStep(2);
              }}
              className={`flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors ${
                currentStep === 2
                  ? 'text-[#5A5A40]'
                  : currentStep > 2
                  ? 'text-[#4A7A4A]'
                  : 'text-[#9A9A92]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 2
                    ? 'bg-[#5A5A40] text-white'
                    : currentStep > 2
                    ? 'bg-[#4A7A4A] text-white'
                    : 'bg-[#E5E5DF] text-[#7A7A72]'
                }`}
              >
                2
              </div>
              <span className="hidden sm:inline">Véhicule</span>
            </button>

            <ChevronRight className="w-4 h-4 text-[#C5C5BF]" />

            {/* Step 3 */}
            <button
              onClick={() => {
                if (!selectedVehicleId) return;
                setCurrentStep(3);
              }}
              className={`flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors ${
                currentStep === 3
                  ? 'text-[#5A5A40]'
                  : currentStep > 3
                  ? 'text-[#4A7A4A]'
                  : 'text-[#9A9A92]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 3
                    ? 'bg-[#5A5A40] text-white'
                    : currentStep > 3
                    ? 'bg-[#4A7A4A] text-white'
                    : 'bg-[#E5E5DF] text-[#7A7A72]'
                }`}
              >
                3
              </div>
              <span className="hidden sm:inline">Paiement</span>
            </button>

            <ChevronRight className="w-4 h-4 text-[#C5C5BF]" />

            {/* Step 4 */}
            <button
              onClick={() => {
                if (!selectedVehicleId || totalAmount <= 0) return;
                setCurrentStep(4);
              }}
              className={`flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors ${
                currentStep === 4 ? 'text-[#4A7A4A]' : 'text-[#9A9A92]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 4
                    ? 'bg-[#4A7A4A] text-white'
                    : 'bg-[#E5E5DF] text-[#7A7A72]'
                }`}
              >
                4
              </div>
              <span className="hidden sm:inline">Validation</span>
            </button>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto bg-white">
          {/* =========================================================
              ÉTAPE 1 — SÉLECTION DU CLIENT
             ========================================================= */}
          {currentStep === 1 && (
            <div id="step-1-client" className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                  Étape 1 — Sélection du Client
                </label>

                {/* Mode toggle */}
                <div className="flex bg-[#F5F5F0] p-1 rounded-xl border border-[#E5E5DF]">
                  <button
                    type="button"
                    onClick={() => setClientMode('existing')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      clientMode === 'existing'
                        ? 'bg-white text-[#1A1A18] shadow-xs'
                        : 'text-[#7A7A72] hover:text-[#1A1A18]'
                    }`}
                  >
                    Client existant
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientMode('new')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      clientMode === 'new'
                        ? 'bg-white text-[#1A1A18] shadow-xs'
                        : 'text-[#7A7A72] hover:text-[#1A1A18]'
                    }`}
                  >
                    Nouveau client
                  </button>
                </div>
              </div>

              {clientMode === 'existing' ? (
                <div className="space-y-3">
                  {clients.length === 0 ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      <p className="font-semibold mb-1">Aucun client existant dans la base.</p>
                      <p className="text-amber-800">
                        Basculez sur "Nouveau client" ci-dessus pour saisir rapidement les informations minimales (Nom et Téléphone).
                      </p>
                      <button
                        type="button"
                        onClick={() => setClientMode('new')}
                        className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#5A5A40] text-white font-semibold text-xs cursor-pointer"
                      >
                        Créer un nouveau client
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Search client */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                        <input
                          type="text"
                          placeholder="Rechercher un client par nom ou téléphone..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden shadow-xs"
                        />
                      </div>

                      {/* Client List Selection */}
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {filteredClients.map((client) => {
                          const isSelected = selectedClientId === client.id;
                          const name =
                            client.type === 'entreprise' && client.companyName
                              ? client.companyName
                              : `${client.firstName} ${client.lastName}`;
                          return (
                            <div
                              key={client.id}
                              onClick={() => setSelectedClientId(client.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'border-[#4A7A4A] bg-[#4A7A4A]/5 ring-1 ring-[#4A7A4A]'
                                  : 'border-[#E5E5DF] bg-white hover:bg-[#FAFAF8]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                    isSelected
                                      ? 'bg-[#4A7A4A] text-white'
                                      : 'bg-[#F5F5F0] text-[#5A5A40]'
                                  }`}
                                >
                                  {name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-xs text-[#1A1A18]">{name}</div>
                                  <div className="text-[11px] text-[#7A7A72] flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-[#9A9A92]" />
                                    <span>{client.phone}</span>
                                    {client.email && (
                                      <span className="hidden sm:inline"> — {client.email}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-[#4A7A4A] shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Nouveau Client Express */
                <div className="space-y-4 p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                  <p className="text-xs text-[#7A7A72]">
                    Renseignez les informations minimales de l'acheteur pour enregistrer la vente :
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                        Nom complet ou Raison Sociale <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex. Jean Dupont ou Sarl Alpha"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2D2D2A] mb-1">
                        Téléphone <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="ex. +225 07 00 00 00 00"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#7A7A72] mb-1">
                        Email (Optionnel)
                      </label>
                      <input
                        type="email"
                        placeholder="ex. client@email.com"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              ÉTAPE 2 — SÉLECTION DU VÉHICULE (Disponibles uniquement)
             ========================================================= */}
          {currentStep === 2 && (
            <div id="step-2-vehicle" className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                  Étape 2 — Véhicules Disponibles ({availableVehicles.length})
                </label>
              </div>

              {availableVehicles.length === 0 ? (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <Car className="w-10 h-10 text-amber-700 mx-auto mb-2 opacity-60" />
                  <h4 className="text-sm font-bold text-amber-900 mb-1">
                    Aucun véhicule disponible à la vente
                  </h4>
                  <p className="text-xs text-amber-800 max-w-md mx-auto">
                    Tous les véhicules de la flotte sont actuellement loués, réservés ou déjà vendus.
                    Veuillez ajouter un nouveau véhicule ou mettre à jour le statut d'un véhicule existant.
                  </p>
                </div>
              ) : (
                <>
                  {/* Vehicle Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A92]" />
                    <input
                      type="text"
                      placeholder="Filtrer par marque, modèle, immatriculation..."
                      value={vehicleSearch}
                      onChange={(e) => setVehicleSearch(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden shadow-xs"
                    />
                  </div>

                  {/* Available Vehicles Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {filteredVehicles.map((vehicle) => {
                      const isSelected = selectedVehicleId === vehicle.id;
                      return (
                        <div
                          key={vehicle.id}
                          onClick={() => handleSelectVehicle(vehicle)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#4A7A4A] bg-[#4A7A4A]/5 ring-2 ring-[#4A7A4A]'
                              : 'border-[#E5E5DF] bg-white hover:bg-[#FAFAF8]'
                          }`}
                        >
                          <div className="flex gap-3 items-start mb-2">
                            {/* Photo */}
                            {vehicle.photoUrl ? (
                              <img
                                src={vehicle.photoUrl}
                                alt={vehicle.make}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-lg object-cover border border-[#E5E5DF] shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-[#F5F5F0] border border-[#E5E5DF] flex items-center justify-center text-[#7A7A72] shrink-0">
                                <Car className="w-6 h-6" />
                              </div>
                            )}

                            {/* Details */}
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-[#1A1A18] truncate">
                                {vehicle.make} {vehicle.model}
                              </h4>
                              <div className="font-mono text-[11px] font-semibold text-[#5A5A40]">
                                {vehicle.registration}
                              </div>
                              <div className="text-[11px] text-[#7A7A72]">
                                Année {vehicle.year}
                              </div>
                            </div>
                          </div>

                          {/* Price Tag */}
                          <div className="pt-2 border-t border-[#E5E5DF]/60 flex items-center justify-between">
                            <span className="text-[10px] text-[#7A7A72] uppercase font-semibold">
                              Prix de vente
                            </span>
                            <span className="font-bold text-xs text-[#4A7A4A] font-['Outfit']">
                              {vehicle.sellingPrice
                                ? `${vehicle.sellingPrice.toLocaleString('fr-FR')} ${settings.currencySymbol}`
                                : 'À définir'}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle2 className="w-4 h-4 text-[#4A7A4A]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* =========================================================
              ÉTAPE 3 — PAIEMENT
             ========================================================= */}
          {currentStep === 3 && (
            <div id="step-3-payment" className="space-y-5 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                Étape 3 — Modalités & Règlement
              </label>

              {/* Financial Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D2D2A] mb-1.5">
                    Montant Total de la Vente ({settings.currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="50"
                    required
                    value={totalAmount || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTotalAmount(val);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E5DF] text-sm text-[#1A1A18] font-bold focus:border-[#5A5A40] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2D2A] mb-1.5">
                    Montant Encaissé Aujourd'hui ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E5DF] text-sm text-[#4A7A4A] font-bold focus:border-[#5A5A40] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Quick Amount Helper Buttons */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-[11px] text-[#7A7A72] self-center mr-1">Raccourcis :</span>
                <button
                  type="button"
                  onClick={() => setAmountPaid(totalAmount)}
                  className="px-2.5 py-1 rounded-lg bg-[#4A7A4A]/10 text-[#4A7A4A] font-semibold hover:bg-[#4A7A4A]/20 transition-colors cursor-pointer"
                >
                  Totalité (100%)
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaid(Math.round(totalAmount * 0.5))}
                  className="px-2.5 py-1 rounded-lg bg-[#F5F5F0] text-[#2D2D2A] font-semibold hover:bg-[#EBEBE6] transition-colors cursor-pointer"
                >
                  Acompte 50%
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaid(Math.round(totalAmount * 0.3))}
                  className="px-2.5 py-1 rounded-lg bg-[#F5F5F0] text-[#2D2D2A] font-semibold hover:bg-[#EBEBE6] transition-colors cursor-pointer"
                >
                  Acompte 30%
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaid(0)}
                  className="px-2.5 py-1 rounded-lg bg-[#F5F5F0] text-[#7A7A72] font-semibold hover:bg-[#EBEBE6] transition-colors cursor-pointer"
                >
                  0 (En attente)
                </button>
              </div>

              {/* Automatic Calculation of Solde Restant */}
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#7A7A72] block">Solde restant à devoir</span>
                  <span className="text-xs text-[#9A9A92]">Calcul automatique (Total - Payé)</span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-lg font-bold font-['Outfit'] ${
                      remainingBalance > 0 ? 'text-[#B87320]' : 'text-[#4A7A4A]'
                    }`}
                  >
                    {remainingBalance.toLocaleString('fr-FR')} {settings.currencySymbol}
                  </span>
                  <span className="block text-[10px] text-[#7A7A72]">
                    {remainingBalance === 0 ? 'Vente soldée' : 'Reste à payer'}
                  </span>
                </div>
              </div>

              {/* Mode de Paiement (Espèces, Virement bancaire, Chèque, Orange Money, MTN Mobile Money, Wave, Paiement mixte, Carte bancaire) */}
              <div>
                <label className="block text-xs font-semibold text-[#5A5A40] uppercase tracking-wider mb-2">
                  Mode de Paiement
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    'Espèces',
                    'Virement bancaire',
                    'Chèque',
                    'Orange Money',
                    'MTN Mobile Money',
                    'Wave',
                    'Paiement mixte',
                    'Carte bancaire',
                  ].map((method) => {
                    const isSelected = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method as PaymentMethod)}
                        className={`p-2.5 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                            : 'bg-white text-[#2D2D2A] border-[#E5E5DF] hover:bg-[#FAFAF8]'
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#7A7A72] mb-1">
                    Date de la transaction
                  </label>
                  <input
                    type="date"
                    required
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] focus:border-[#5A5A40] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A7A72] mb-1">
                    Notes / Remarques (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="ex. Double des clés remis, garantie..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E5DF] text-xs text-[#2D2D2A] placeholder-[#9A9A92] focus:border-[#5A5A40] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              ÉTAPE 4 — VALIDATION (Récapitulatif)
             ========================================================= */}
          {currentStep === 4 && (
            <div id="step-4-validation" className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#4A7A4A]" />
                <label className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                  Étape 4 — Récapitulatif & Validation
                </label>
              </div>

              {/* Summary Cards */}
              <div className="space-y-4">
                {/* Client Recap */}
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Client</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-[#5A5A40] hover:underline font-semibold cursor-pointer"
                    >
                      Modifier
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#7A7A72] block text-[11px]">Nom</span>
                      <span className="font-bold text-[#1A1A18] text-sm">{displayClientName}</span>
                    </div>
                    <div>
                      <span className="text-[#7A7A72] block text-[11px]">Téléphone</span>
                      <span className="font-semibold text-[#2D2D2A]">{displayClientPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Véhicule Recap */}
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5" />
                      <span>Véhicule</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-[#5A5A40] hover:underline font-semibold cursor-pointer"
                    >
                      Modifier
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {selectedVehicle?.photoUrl ? (
                      <img
                        src={selectedVehicle.photoUrl}
                        alt={selectedVehicle.make}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border border-[#E5E5DF]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#EAEAE5] flex items-center justify-center text-[#7A7A72]">
                        <Car className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-[#1A1A18] text-sm">
                        {selectedVehicle?.make} {selectedVehicle?.model} ({selectedVehicle?.year})
                      </div>
                      <div className="font-mono text-xs font-semibold text-[#5A5A40]">
                        Immatriculation : {selectedVehicle?.registration}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paiement Recap */}
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Paiement & Règlement</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs text-[#5A5A40] hover:underline font-semibold cursor-pointer"
                    >
                      Modifier
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-[#7A7A72] block text-[11px]">Montant Total</span>
                      <span className="font-bold text-[#1A1A18] text-sm">
                        {totalAmount.toLocaleString('fr-FR')} {settings.currencySymbol}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7A7A72] block text-[11px]">Montant Payé</span>
                      <span className="font-bold text-[#4A7A4A] text-sm">
                        {amountPaid.toLocaleString('fr-FR')} {settings.currencySymbol}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7A7A72] block text-[11px]">Solde Restant</span>
                      <span
                        className={`font-bold text-sm ${
                          remainingBalance > 0 ? 'text-[#B87320]' : 'text-[#4A7A4A]'
                        }`}
                      >
                        {remainingBalance.toLocaleString('fr-FR')} {settings.currencySymbol}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#7A7A72] pt-2 border-t border-[#E5E5DF] flex items-center justify-between">
                    <span>Mode : <strong className="text-[#2D2D2A]">{paymentMethod}</strong></span>
                    <span>Date : <strong className="text-[#2D2D2A]">{new Date(saleDate).toLocaleDateString('fr-FR')}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between p-4 border-t border-[#E5E5DF] bg-[#F5F5F0]">
          {/* Cancel or Prev */}
          {currentStep === 1 ? (
            <button
              type="button"
              id="sale-wizard-cancel-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Annuler
            </button>
          ) : (
            <button
              type="button"
              id="sale-wizard-prev-btn"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>
          )}

          {/* Next or Confirm */}
          {currentStep < 4 ? (
            <button
              type="button"
              id="sale-wizard-next-btn"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="sale-wizard-edit-btn"
                onClick={() => setCurrentStep(1)}
                className="px-3.5 py-2.5 rounded-xl border border-[#E5E5DF] bg-white hover:bg-[#F5F5F0] text-[#2D2D2A] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Modifier
              </button>
              <button
                type="button"
                id="sale-wizard-confirm-btn"
                onClick={handleConfirmSale}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4A7A4A] hover:bg-[#3E663E] text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmer la vente</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
