import React, { useState, useEffect, useRef } from 'react';
import { useCrm } from '../context/CrmContext';
import { Vehicle, TransmissionType, FuelType, VehicleStatus } from '../types';
import {
  X,
  Car,
  Image as ImageIcon,
  Upload,
  Trash2,
  Calculator,
  CheckCircle2,
  Plus,
  Truck,
  Building2,
  Calendar,
  AlertCircle,
  Tag,
} from 'lucide-react';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleToEdit?: Vehicle | null;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  vehicleToEdit,
}) => {
  const { addVehicle, updateVehicle, settings } = useCrm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Identity & General
  const [reference, setReference] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [version, setVersion] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [mileage, setMileage] = useState<number>(0);
  const [fuelType, setFuelType] = useState<FuelType>('Essence');
  const [transmission, setTransmission] = useState<TransmissionType>('Automatique');
  const [color, setColor] = useState('');
  const [vin, setVin] = useState('');
  const [registration, setRegistration] = useState('');
  const [condition, setCondition] = useState<'Neuf' | 'Occasion'>('Occasion');
  const [supplier, setSupplier] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState(new Date().toISOString().split('T')[0]);

  // Cost & Profit Breakdown
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [transitFee, setTransitFee] = useState<number>(0);
  const [customsFee, setCustomsFee] = useState<number>(0);
  const [transportFee, setTransportFee] = useState<number>(0);
  const [repairFee, setRepairFee] = useState<number>(0);
  const [otherFees, setOtherFees] = useState<number>(0);

  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [status, setStatus] = useState<VehicleStatus>('Disponible');
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculated Cost & Margins
  const totalCost = purchasePrice + transitFee + customsFee + transportFee + repairFee + otherFees;
  const profitMargin = sellingPrice - totalCost;
  const marginRate = totalCost > 0 ? (profitMargin / totalCost) * 100 : 0;

  useEffect(() => {
    if (vehicleToEdit) {
      setReference(vehicleToEdit.reference || '');
      setMake(vehicleToEdit.make || '');
      setModel(vehicleToEdit.model || '');
      setVersion(vehicleToEdit.version || '');
      setYear(vehicleToEdit.year || new Date().getFullYear());
      setMileage(vehicleToEdit.mileage || 0);
      setFuelType(vehicleToEdit.fuelType || 'Essence');
      setTransmission(vehicleToEdit.transmission || 'Automatique');
      setColor(vehicleToEdit.color || '');
      setVin(vehicleToEdit.vin || '');
      setRegistration(vehicleToEdit.registration || '');
      setCondition(vehicleToEdit.condition || 'Occasion');
      setSupplier(vehicleToEdit.supplier || '');
      setAcquisitionDate(vehicleToEdit.acquisitionDate || new Date().toISOString().split('T')[0]);
      setPurchasePrice(vehicleToEdit.purchasePrice || 0);
      setTransitFee(vehicleToEdit.transitFee || 0);
      setCustomsFee(vehicleToEdit.customsFee || 0);
      setTransportFee(vehicleToEdit.transportFee || 0);
      setRepairFee(vehicleToEdit.repairFee || 0);
      setOtherFees(vehicleToEdit.otherFees || 0);
      setSellingPrice(vehicleToEdit.sellingPrice || 0);
      setStatus(vehicleToEdit.status || 'Disponible');
      setPhotos(vehicleToEdit.photos || (vehicleToEdit.photoUrl ? [vehicleToEdit.photoUrl] : []));
      setNotes(vehicleToEdit.notes || '');
    } else {
      const count = Math.floor(Math.random() * 900) + 100;
      setReference(`UA-${new Date().getFullYear()}-${count}`);
      setMake('');
      setModel('');
      setVersion('');
      setYear(new Date().getFullYear());
      setMileage(0);
      setFuelType('Essence');
      setTransmission('Automatique');
      setColor('');
      setVin('');
      setRegistration('');
      setCondition('Occasion');
      setSupplier('');
      setAcquisitionDate(new Date().toISOString().split('T')[0]);
      setPurchasePrice(0);
      setTransitFee(0);
      setCustomsFee(0);
      setTransportFee(0);
      setRepairFee(0);
      setOtherFees(0);
      setSellingPrice(0);
      setStatus('Disponible');
      setPhotos([]);
      setNotes('');
    }
    setError(null);
  }, [vehicleToEdit, isOpen]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image dépasse la limite de 5 Mo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make.trim() || !model.trim()) {
      setError('Veuillez renseigner la marque et le modèle du véhicule.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const vehicleData: any = {
        reference: reference.trim(),
        make: make.trim(),
        model: model.trim(),
        version: version.trim(),
        year: Number(year),
        mileage: Number(mileage),
        fuelType,
        transmission,
        color: color.trim(),
        vin: vin.trim().toUpperCase(),
        registration: registration.trim().toUpperCase(),
        condition,
        supplier: supplier.trim(),
        acquisitionDate,
        purchasePrice,
        transitFee,
        customsFee,
        transportFee,
        repairFee,
        otherFees,
        totalCost,
        sellingPrice,
        profitMargin,
        marginRate: Number(marginRate.toFixed(2)),
        status,
        photos,
        photoUrl: photos[0] || '',
        notes: notes.trim(),
      };

      if (vehicleToEdit) {
        await updateVehicle(vehicleToEdit.id, vehicleData);
      } else {
        await addVehicle(vehicleData);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde du véhicule');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-[#0D0E13] border border-[#242833] rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E212A] bg-[#12141A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {vehicleToEdit ? `Modifier le véhicule : ${vehicleToEdit.make} ${vehicleToEdit.model}` : 'Ajouter un Véhicule au Parc'}
              </h2>
              <p className="text-xs text-[#85878A]">
                Fiche complète, coûts d'importation, marge et photos multiples
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#85878A] hover:text-white rounded-lg hover:bg-[#1A1D25] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Identification & Statut */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2 text-[#E50914]">
              <Tag className="w-3.5 h-3.5" />
              1. Identification & Caractéristiques
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  Référence Unique *
                </label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex : UA-2024-001"
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  État du véhicule *
                </label>
                <select
                  value={condition}
                  onChange={(e: any) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
                >
                  <option value="Occasion">Occasion certifiée</option>
                  <option value="Neuf">Neuf 0 km</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  Statut dans le parc *
                </label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
                >
                  <option value="Disponible">Disponible à la vente</option>
                  <option value="Réservé">Réservé (Acompte versé)</option>
                  <option value="Vendu">Vendu & Livré</option>
                  <option value="En préparation">En préparation / Atelier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  Date d'acquisition
                </label>
                <input
                  type="date"
                  value={acquisitionDate}
                  onChange={(e) => setAcquisitionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  Marque *
                </label>
                <input
                  type="text"
                  required
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="Ex : Toyota, Mercedes, Peugeot..."
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  Modèle *
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ex : Land Cruiser, C-Class, 3008..."
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  Version / Finition
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="Ex : V8 VX, AMG Line, Allure..."
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  Année *
                </label>
                <input
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  required
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  Kilométrage (km)
                </label>
                <input
                  type="number"
                  min="0"
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  Carburant
                </label>
                <select
                  value={fuelType}
                  onChange={(e: any) => setFuelType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
                >
                  <option value="Essence">Essence</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybride">Hybride</option>
                  <option value="Électrique">Électrique</option>
                  <option value="GPL">GPL</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  Boîte de vitesse
                </label>
                <select
                  value={transmission}
                  onChange={(e: any) => setTransmission(e.target.value)}
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
                >
                  <option value="Automatique">Automatique</option>
                  <option value="Manuelle">Manuelle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  Couleur
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Ex : Noir Obsidienne, Blanc Nacré"
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  N° de Châssis VIN (17 car.)
                </label>
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="Ex : JT3HJ88J20..."
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  Plaque d'immatriculation
                </label>
                <input
                  type="text"
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value.toUpperCase())}
                  placeholder="Ex : DK-8492-AX ou En cours"
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#85878A] mb-1">
                  Fournisseur / Provenance
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Ex : Dubai Auto Hub, Concessionnaire France, Allemagne..."
                  className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Coût de Revient Réel, Marges & Prix de Vente */}
          <div className="p-4 bg-[#111319] border border-[#242833] rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#20232E] pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 text-[#E50914]">
                <Calculator className="w-4 h-4" />
                2. Décomposition des Coûts, Prix de Vente et Marge (FCFA)
              </span>
              <span className="text-[11px] text-[#85878A]">
                Calcul automatique transparent
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-[#85878A] mb-1">
                  Prix d'achat initial
                </label>
                <input
                  type="number"
                  min="0"
                  value={purchasePrice || ''}
                  onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 bg-[#171922] border border-[#2A2E3B] rounded-lg text-xs text-white focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#85878A] mb-1">
                  Frais de transit
                </label>
                <input
                  type="number"
                  min="0"
                  value={transitFee || ''}
                  onChange={(e) => setTransitFee(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 bg-[#171922] border border-[#2A2E3B] rounded-lg text-xs text-white focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#85878A] mb-1">
                  Frais de douane
                </label>
                <input
                  type="number"
                  min="0"
                  value={customsFee || ''}
                  onChange={(e) => setCustomsFee(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 bg-[#171922] border border-[#2A2E3B] rounded-lg text-xs text-white focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#85878A] mb-1">
                  Transport local
                </label>
                <input
                  type="number"
                  min="0"
                  value={transportFee || ''}
                  onChange={(e) => setTransportFee(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 bg-[#171922] border border-[#2A2E3B] rounded-lg text-xs text-white focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#85878A] mb-1">
                  Réparations / Atelier
                </label>
                <input
                  type="number"
                  min="0"
                  value={repairFee || ''}
                  onChange={(e) => setRepairFee(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 bg-[#171922] border border-[#2A2E3B] rounded-lg text-xs text-white focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#85878A] mb-1">
                  Autres charges
                </label>
                <input
                  type="number"
                  min="0"
                  value={otherFees || ''}
                  onChange={(e) => setOtherFees(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 bg-[#171922] border border-[#2A2E3B] rounded-lg text-xs text-white focus:border-[#E50914]"
                />
              </div>
            </div>

            {/* Calculations Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#0A0B0E] border border-[#252834] rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#85878A] block">
                  Coût Total de Revient Réel
                </span>
                <span className="text-lg font-black text-white">
                  {totalCost.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="p-3 bg-[#0A0B0E] border border-[#252834] rounded-xl">
                <label className="text-[10px] uppercase font-bold text-[#E50914] block mb-1">
                  Prix de Vente Fixé (FCFA) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={sellingPrice || ''}
                  onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
                  placeholder="Prix de vente en FCFA"
                  className="w-full px-2 py-1 bg-[#14161C] border border-[#2A2E3A] rounded text-sm font-black text-[#E50914] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-[#0A0B0E] border border-[#252834] rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#85878A] block">
                  Marge Bénéficiaire Estimée
                </span>
                <span className={`text-lg font-black ${profitMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {profitMargin.toLocaleString('fr-FR')} FCFA{' '}
                  <span className="text-xs font-semibold">({marginRate.toFixed(1)}%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Photos Multiples */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#E50914]">
                <ImageIcon className="w-3.5 h-3.5" />
                3. Photos Multiples du Véhicule
              </span>
              <span className="text-[11px] text-[#85878A] font-normal">
                {photos.length} photo{photos.length > 1 ? 's' : ''} ajoutée{photos.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-3">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative group rounded-xl overflow-hidden aspect-video bg-[#14161C] border border-[#272B35]"
                >
                  <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-[#E50914] text-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Supprimer la photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-[#E50914]">
                      Principale
                    </span>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-dashed border-[#2F3442] hover:border-[#E50914] bg-[#14161C] hover:bg-[#181B22] aspect-video flex flex-col items-center justify-center gap-1 text-[#85878A] hover:text-white transition-all cursor-pointer"
              >
                <Upload className="w-5 h-5 text-[#E50914]" />
                <span className="text-[10px] font-semibold">+ Ajouter</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Section 4: Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#85878A] mb-1">
              Notes & Commentaires (Historique d'entretien, options spécifiques, carrosserie...)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails complémentaires sur le véhicule..."
              className="w-full px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white placeholder-[#505460] focus:outline-none focus:border-[#E50914]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E212A]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-[#85878A] hover:text-white rounded-xl border border-[#272B35] hover:bg-[#181B22] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#E50914] hover:bg-[#CC0812] rounded-xl transition-all shadow-[0_0_20px_rgba(229,9,20,0.4)] flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Enregistrement...' : vehicleToEdit ? 'Mettre à jour le véhicule' : 'Enregistrer le véhicule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
