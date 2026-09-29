import React, { useState, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { Vehicle, VehicleStatus } from '../types';
import {
  Car,
  Plus,
  Search,
  Filter,
  BadgePercent,
  CalendarClock,
  Edit2,
  Trash2,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  Tag,
  Coins,
  DollarSign,
  Truck,
  Image as ImageIcon,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { VehicleModal } from './VehicleModal';

interface VehiclesViewProps {
  onOpenVehicleModal: (vehicle?: Vehicle | null) => void;
  onQuickSale: (vehicleId: string) => void;
  onQuickRental?: (vehicleId: string) => void;
  onQuickReservation?: (vehicleId: string) => void;
  searchQuery?: string;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  onOpenVehicleModal,
  onQuickSale,
  onQuickReservation,
  searchQuery = '',
}) => {
  const { vehicles, deleteVehicle, settings } = useCrm();

  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);

  const activeSearch = searchQuery || localSearch;

  // Filtered vehicles list
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const q = activeSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (v.reference && v.reference.toLowerCase().includes(q)) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        (v.version && v.version.toLowerCase().includes(q)) ||
        (v.vin && v.vin.toLowerCase().includes(q)) ||
        (v.registration && v.registration.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchesCondition = conditionFilter === 'all' || v.condition === conditionFilter;

      return matchesSearch && matchesStatus && matchesCondition;
    });
  }, [vehicles, activeSearch, statusFilter, conditionFilter]);

  // Aggregate Metrics
  const inStockCount = useMemo(() => vehicles.filter((v) => v.status === 'Disponible' || v.status === 'En préparation').length, [vehicles]);
  const soldCount = useMemo(() => vehicles.filter((v) => v.status === 'Vendu').length, [vehicles]);
  const reservedCount = useMemo(() => vehicles.filter((v) => v.status === 'Réservé').length, [vehicles]);
  const totalStockValue = useMemo(() => {
    return vehicles
      .filter((v) => v.status === 'Disponible' || v.status === 'En préparation')
      .reduce((sum, v) => sum + (v.totalCost || v.purchasePrice || 0), 0);
  }, [vehicles]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Confirmez-vous la suppression du véhicule ${name} ?`)) {
      try {
        await deleteVehicle(id);
      } catch (err: any) {
        alert(err.message || 'Erreur lors de la suppression');
      }
    }
  };

  const exportCsv = () => {
    if (filteredVehicles.length === 0) return;
    const headers = [
      'Référence',
      'État',
      'Marque',
      'Modèle',
      'Version',
      'Année',
      'Kilométrage',
      'Carburant',
      'Boîte',
      'Couleur',
      'VIN (Châssis)',
      'Immatriculation',
      'Fournisseur',
      'Date Acquisition',
      'Prix Achat (FCFA)',
      'Frais Transit (FCFA)',
      'Frais Douane (FCFA)',
      'Transport (FCFA)',
      'Réparations (FCFA)',
      'Autres (FCFA)',
      'Coût Total Revient (FCFA)',
      'Prix Vente Fixé (FCFA)',
      'Marge Estimée (FCFA)',
      'Taux Marge (%)',
      'Statut',
    ];

    const rows = filteredVehicles.map((v) => [
      v.reference || '',
      v.condition || 'Occasion',
      `"${v.make.replace(/"/g, '""')}"`,
      `"${v.model.replace(/"/g, '""')}"`,
      `"${(v.version || '').replace(/"/g, '""')}"`,
      v.year,
      v.mileage,
      v.fuelType,
      v.transmission,
      v.color || '',
      v.vin || '',
      v.registration || '',
      `"${(v.supplier || '').replace(/"/g, '""')}"`,
      v.acquisitionDate || '',
      v.purchasePrice || 0,
      v.transitFee || 0,
      v.customsFee || 0,
      v.transportFee || 0,
      v.repairFee || 0,
      v.otherFees || 0,
      v.totalCost || 0,
      v.sellingPrice || 0,
      v.profitMargin || 0,
      v.marginRate || 0,
      v.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `parc_automobile_univers_auto_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusBadges: Record<VehicleStatus, { text: string; bg: string; border: string }> = {
    Disponible: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    Réservé: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    Vendu: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    'En préparation': { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    Loué: { text: 'text-zinc-400', bg: 'bg-zinc-800/40', border: 'border-zinc-700/40' },
    'En maintenance': { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  };

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Parc Automobile & Stock
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914]">
              {vehicles.length} véhicules
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#85878A] mt-1">
            Gestion complète des véhicules neufs et d'occasion, coûts de revient réel et calcul automatique des marges
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportCsv}
            disabled={filteredVehicles.length === 0}
            className="px-3.5 py-2.5 rounded-xl border border-[#2D313B] bg-[#12141A] hover:bg-[#1A1D24] text-xs font-semibold text-[#85878A] hover:text-white transition-colors flex items-center gap-2 disabled:opacity-40"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onOpenVehicleModal(null)}
            className="px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#CC0812] text-xs font-bold text-white transition-all shadow-[0_0_20px_rgba(229,9,20,0.35)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nouveau Véhicule</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-medium mb-2">
            <span>Disponibles à la Vente</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {inStockCount} <span className="text-xs font-normal text-[#85878A]">unités</span>
          </div>
          <p className="text-[11px] text-[#85878A] mt-1">Prêts pour cession immédiate</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-medium mb-2">
            <span>Réservés</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
            {reservedCount} <span className="text-xs font-normal text-[#85878A]">unités</span>
          </div>
          <p className="text-[11px] text-[#85878A] mt-1">Acomptes versés en attente</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-medium mb-2">
            <span>Vendus</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <BadgePercent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {soldCount} <span className="text-xs font-normal text-[#85878A]">unités</span>
          </div>
          <p className="text-[11px] text-[#85878A] mt-1">Transactions conclues</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#85878A] text-xs font-medium mb-2">
            <span>Valeur Coût du Stock</span>
            <div className="w-7 h-7 rounded-lg bg-[#E50914]/15 text-[#E50914] flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {totalStockValue.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-bold text-[#E50914]">FCFA</span>
          </div>
          <p className="text-[11px] text-[#85878A] mt-1">Prix d'achat + charges d'import</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0D0E13] border border-[#222530] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85878A]" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Rechercher par référence, marque, VIN, plaque..."
            className="w-full pl-10 pr-4 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs sm:text-sm text-white placeholder-[#555A66] focus:outline-none focus:border-[#E50914]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#85878A]">
            <Filter className="w-3.5 h-3.5" />
            <span>État :</span>
          </div>
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
          >
            <option value="all">Tous (Neuf & Occasion)</option>
            <option value="Occasion">Occasion</option>
            <option value="Neuf">Neuf</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-[#85878A]">
            <span>Statut :</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#14161C] border border-[#272B35] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
          >
            <option value="all">Tous les statuts</option>
            <option value="Disponible">Disponible</option>
            <option value="Réservé">Réservé</option>
            <option value="Vendu">Vendu</option>
            <option value="En préparation">En préparation</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="rounded-2xl bg-[#0D0E13] border border-[#222530] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-[#D8D9DB]">
            <thead className="bg-[#12141A] text-[#85878A] text-[11px] uppercase tracking-wider border-b border-[#20242D]">
              <tr>
                <th className="py-3.5 px-4">Réf & Photo</th>
                <th className="py-3.5 px-4">Véhicule (Marque / Modèle)</th>
                <th className="py-3.5 px-4">Châssis (VIN) / Plaque</th>
                <th className="py-3.5 px-4 text-center">État</th>
                <th className="py-3.5 px-4 text-right">Coût Réel (FCFA)</th>
                <th className="py-3.5 px-4 text-right">Prix de Vente (FCFA)</th>
                <th className="py-3.5 px-4 text-right">Marge Bénéficiaire</th>
                <th className="py-3.5 px-4 text-center">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2028]">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#85878A]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#14161C] border border-[#2A2E38] flex items-center justify-center text-[#555A66]">
                        <Car className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-white">Aucun véhicule dans le parc automobile</p>
                      <p className="text-xs text-[#85878A] max-w-sm">
                        {vehicles.length === 0
                          ? 'Enregistrez votre premier véhicule neuf ou d’occasion pour constituer le catalogue de vente.'
                          : 'Aucun véhicule ne correspond aux critères de recherche actuels.'}
                      </p>
                      {vehicles.length === 0 && (
                        <button
                          onClick={() => onOpenVehicleModal(null)}
                          className="mt-2 px-4 py-2 rounded-xl bg-[#E50914] text-xs font-bold text-white hover:bg-[#CC0812] transition-colors"
                        >
                          + Ajouter un premier véhicule
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => {
                  const badge = statusBadges[v.status] || {
                    text: 'text-zinc-400',
                    bg: 'bg-zinc-800',
                    border: 'border-zinc-700',
                  };

                  const cost = v.totalCost || v.purchasePrice || 0;
                  const price = v.sellingPrice || 0;
                  const margin = v.profitMargin !== undefined ? v.profitMargin : (price - cost);
                  const marginRate = cost > 0 ? (margin / cost) * 100 : 0;

                  return (
                    <tr key={v.id} className="hover:bg-[#13151D] transition-colors">
                      {/* Photo & Réf */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-[#181A22] border border-[#272B36] flex-shrink-0 flex items-center justify-center">
                            {v.photoUrl || (v.photos && v.photos[0]) ? (
                              <img
                                src={v.photoUrl || (v.photos && v.photos[0])}
                                alt={v.model}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Car className="w-5 h-5 text-[#555A66]" />
                            )}
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold text-white block">
                              {v.reference || 'UA-—'}
                            </span>
                            {v.photos && v.photos.length > 1 && (
                              <span className="text-[10px] text-[#85878A]">
                                {v.photos.length} photos
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Make & Model */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">
                          {v.make} {v.model} {v.version ? <span className="font-normal text-[#85878A] text-xs">· {v.version}</span> : null}
                        </div>
                        <div className="text-[11px] text-[#85878A] flex items-center gap-1.5 mt-0.5">
                          <span>{v.year}</span>
                          <span>·</span>
                          <span>{v.mileage ? `${v.mileage.toLocaleString('fr-FR')} km` : '0 km'}</span>
                          <span>·</span>
                          <span>{v.fuelType}</span>
                          <span>·</span>
                          <span>{v.transmission}</span>
                        </div>
                      </td>

                      {/* VIN & Plate */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span className="text-white block font-semibold">
                          {v.vin || 'VIN non renseigné'}
                        </span>
                        <span className="text-[#85878A] text-[11px]">
                          {v.registration || 'Sans plaque'}
                        </span>
                      </td>

                      {/* État */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            v.condition === 'Neuf'
                              ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                              : 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
                          }`}
                        >
                          {v.condition || 'Occasion'}
                        </span>
                      </td>

                      {/* Total Cost */}
                      <td className="py-3.5 px-4 text-right font-medium text-white">
                        {cost.toLocaleString('fr-FR')} FCFA
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 text-right font-bold text-[#E50914]">
                        {price.toLocaleString('fr-FR')} FCFA
                      </td>

                      {/* Margin */}
                      <td className="py-3.5 px-4 text-right">
                        <span className={`font-bold block ${margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {margin.toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="text-[10px] text-[#85878A]">
                          {marginRate.toFixed(1)}%
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.text} ${badge.bg} ${badge.border}`}
                        >
                          {v.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {v.status === 'Disponible' && (
                            <button
                              onClick={() => onQuickSale(v.id)}
                              title="Vendre ce véhicule"
                              className="px-2 py-1 rounded bg-[#E50914] text-white text-[11px] font-bold hover:bg-[#CC0812] transition-colors"
                            >
                              Vendre
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedVehicleForDetail(v)}
                            title="Détails"
                            className="p-1.5 rounded-lg text-[#85878A] hover:text-white hover:bg-[#1C1F28] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenVehicleModal(v)}
                            title="Modifier"
                            className="p-1.5 rounded-lg text-[#85878A] hover:text-white hover:bg-[#1C1F28] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id, `${v.make} ${v.model}`)}
                            title="Supprimer"
                            className="p-1.5 rounded-lg text-[#85878A] hover:text-[#E50914] hover:bg-[#1C1F28] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Detail Drawer Modal */}
      {selectedVehicleForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0D0F14] border border-[#272B37] rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#20242E] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#E50914] font-bold block">
                  {selectedVehicleForDetail.reference}
                </span>
                <h3 className="font-bold text-lg text-white">
                  {selectedVehicleForDetail.make} {selectedVehicleForDetail.model} ({selectedVehicleForDetail.year})
                </h3>
              </div>
              <button
                onClick={() => setSelectedVehicleForDetail(null)}
                className="text-[#85878A] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Photos Preview */}
            {selectedVehicleForDetail.photos && selectedVehicleForDetail.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {selectedVehicleForDetail.photos.map((p, idx) => (
                  <img
                    key={idx}
                    src={p}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-xl border border-[#222631]"
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#13151D] p-4 rounded-xl border border-[#20242F]">
              <div>
                <span className="text-[#85878A] block">Numéro VIN :</span>
                <span className="font-mono text-white font-semibold">{selectedVehicleForDetail.vin || '—'}</span>
              </div>
              <div>
                <span className="text-[#85878A] block">Immatriculation :</span>
                <span className="font-mono text-white font-semibold">{selectedVehicleForDetail.registration || '—'}</span>
              </div>
              <div>
                <span className="text-[#85878A] block">Kilométrage :</span>
                <span className="text-white font-semibold">{selectedVehicleForDetail.mileage?.toLocaleString('fr-FR')} km</span>
              </div>
              <div>
                <span className="text-[#85878A] block">Carburant / Boîte :</span>
                <span className="text-white font-semibold">{selectedVehicleForDetail.fuelType} · {selectedVehicleForDetail.transmission}</span>
              </div>
              <div>
                <span className="text-[#85878A] block">Fournisseur :</span>
                <span className="text-white font-semibold">{selectedVehicleForDetail.supplier || '—'}</span>
              </div>
              <div>
                <span className="text-[#85878A] block">Statut actuel :</span>
                <span className="text-emerald-400 font-bold">{selectedVehicleForDetail.status}</span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="p-3.5 bg-[#090A0D] border border-[#222530] rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between text-[#85878A]">
                <span>Prix d'achat initial :</span>
                <span className="text-white font-semibold">{(selectedVehicleForDetail.purchasePrice || 0).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-[#85878A]">
                <span>Frais d'importation (douane, transit, réparations) :</span>
                <span className="text-amber-400 font-semibold">
                  +{((selectedVehicleForDetail.totalCost || 0) - (selectedVehicleForDetail.purchasePrice || 0)).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between font-bold border-t border-[#1C1F28] pt-1.5">
                <span className="text-white">Coût Total de Revient Réel :</span>
                <span className="text-white">{(selectedVehicleForDetail.totalCost || 0).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between font-bold text-sm">
                <span className="text-[#E50914]">Prix de Vente Fixé :</span>
                <span className="text-[#E50914]">{(selectedVehicleForDetail.sellingPrice || 0).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedVehicleForDetail(null)}
                className="px-4 py-2 bg-[#1A1D26] text-white rounded-xl text-xs font-semibold hover:bg-[#222631]"
              >
                Fermer
              </button>
              {selectedVehicleForDetail.status === 'Disponible' && (
                <button
                  onClick={() => {
                    const id = selectedVehicleForDetail.id;
                    setSelectedVehicleForDetail(null);
                    onQuickSale(id);
                  }}
                  className="px-4 py-2 bg-[#E50914] text-white rounded-xl text-xs font-bold hover:bg-[#CC0812]"
                >
                  Vendre ce véhicule
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
