import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  Building2,
  Receipt,
  TrendingUp,
} from 'lucide-react';

export const AccountingExportTab: React.FC = () => {
  const { sales, rentals, otherRevenues, expenses, getAccountingJournal, settings } = useCrm();
  const sym = settings.currencySymbol || '€';

  const [exportPeriod, setExportPeriod] = useState<'all' | 'year' | 'month'>('month');
  const [includeDetails, setIncludeDetails] = useState(true);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);
  const currentYearStr = todayStr.substring(0, 4);

  const journal = useMemo(() => getAccountingJournal(), [getAccountingJournal]);

  // Filter journal according to period
  const filteredJournal = useMemo(() => {
    return journal.filter((entry) => {
      if (exportPeriod === 'month' && !entry.date.startsWith(currentMonthStr)) return false;
      if (exportPeriod === 'year' && !entry.date.startsWith(currentYearStr)) return false;
      return true;
    });
  }, [journal, exportPeriod, currentMonthStr, currentYearStr]);

  // Financial summary
  const totalRevenues = filteredJournal
    .filter((e) => e.flowType === 'credit')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalExpenses = filteredJournal
    .filter((e) => e.flowType === 'debit')
    .reduce((acc, e) => acc + e.amount, 0);

  const netResult = totalRevenues - totalExpenses;

  // CSV / Excel Exporter
  const handleExportCSV = () => {
    const headers = ['Date', 'Reference', 'Operation', 'Tiers_Client', 'Description', 'Sens_Flux', 'Montant', 'Statut', 'Mode_Paiement'];
    const rows = filteredJournal.map((e) => [
      e.date,
      `"${e.reference.replace(/"/g, '""')}"`,
      `"${e.type.replace(/"/g, '""')}"`,
      `"${e.thirdParty.replace(/"/g, '""')}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.flowType === 'credit' ? 'CREDIT' : 'DEBIT',
      e.amount,
      `"${e.status.replace(/"/g, '""')}"`,
      `"${(e.paymentMethod || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sirius_auto_journal_comptable_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls & Export Triggers */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E5DF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-base font-bold text-[#1A1A18] font-['Outfit']">
            Export & Impression Comptable
          </h2>
          <p className="text-xs text-[#7A7A72]">
            Générez des rapports certifiés pour votre expert-comptable, direction ou archivage fiscal
          </p>
        </div>

        {/* Options & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <select
            value={exportPeriod}
            onChange={(e) => setExportPeriod(e.target.value as any)}
            className="px-3.5 py-2 rounded-xl border border-[#E5E5DF] bg-[#FAFAF8] text-xs font-semibold text-[#1A1A18] focus:outline-hidden"
          >
            <option value="month">Mois en cours ({now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })})</option>
            <option value="year">Année en cours ({now.getFullYear()})</option>
            <option value="all">Tout l'historique ({journal.length} écritures)</option>
          </select>

          {/* Export Excel / CSV */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#2D2D2A] hover:bg-[#1A1A18] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Document Preview */}
      <div
        id="accounting-printable-report"
        className="bg-white rounded-2xl border border-[#E5E5DF] shadow-xs p-8 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0"
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-[#E5E5DF]">
          <div>
            <h1 className="text-xl font-bold text-[#1A1A18] font-['Outfit']">
              {settings.companyName || 'Sirius Auto CRM'}
            </h1>
            <p className="text-xs text-[#7A7A72] mt-0.5">{settings.address || 'Agence de location et vente automobile'}</p>
            <p className="text-xs text-[#7A7A72]">
              {settings.phone} {settings.email ? `• ${settings.email}` : ''}
            </p>
            {settings.siretOrTaxId && (
              <p className="text-[11px] text-[#9A9A92] mt-1 font-mono">
                N° Fiscal / SIRET : {settings.siretOrTaxId}
              </p>
            )}
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 bg-[#FAFAF8] border border-[#E5E5DF] rounded-lg text-xs font-bold text-[#1A1A18] uppercase tracking-wider">
              RAPPORT FINANCIER & GRAND LIVRE
            </span>
            <p className="text-xs text-[#7A7A72] mt-2">
              Date d'édition :{' '}
              <span className="font-semibold text-[#1A1A18]">
                {now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </p>
            <p className="text-xs text-[#7A7A72]">
              Période :{' '}
              <span className="font-semibold text-[#1A1A18]">
                {exportPeriod === 'month'
                  ? now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                  : exportPeriod === 'year'
                  ? `Année ${now.getFullYear()}`
                  : 'Historique complet'}
              </span>
            </p>
          </div>
        </div>

        {/* Financial Summary Bento Box */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase block mb-0.5">
              Total Produits (Revenus)
            </span>
            <span className="text-lg font-black text-emerald-900">
              +{totalRevenues.toLocaleString('fr-FR')} {sym}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <span className="text-[11px] font-semibold text-red-800 uppercase block mb-0.5">
              Total Charges (Dépenses)
            </span>
            <span className="text-lg font-black text-red-900">
              -{totalExpenses.toLocaleString('fr-FR')} {sym}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5DF]">
            <span className="text-[11px] font-semibold text-[#7A7A72] uppercase block mb-0.5">
              Résultat Net Période
            </span>
            <span className={`text-lg font-black ${netResult >= 0 ? 'text-[#1A1A18]' : 'text-red-600'}`}>
              {netResult >= 0 ? '+' : ''}{netResult.toLocaleString('fr-FR')} {sym}
            </span>
          </div>
        </div>

        {/* Detailed Operations Ledger */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A18] pb-1 border-b border-[#E5E5DF]">
            Détail Chronologique des Écritures ({filteredJournal.length})
          </h3>

          {filteredJournal.length === 0 ? (
            <p className="text-xs text-[#7A7A72] py-4 italic">Aucune écriture comptable sur cette période.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E5DF] text-[#7A7A72] text-[11px] uppercase font-semibold">
                    <th className="py-2">Date</th>
                    <th className="py-2">Réf.</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Tiers</th>
                    <th className="py-2">Libellé</th>
                    <th className="py-2 text-right">Crédit (+)</th>
                    <th className="py-2 text-right">Débit (-)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0EC]">
                  {filteredJournal.map((e) => (
                    <tr key={e.id} className="py-2">
                      <td className="py-2 text-[#1A1A18] whitespace-nowrap">{e.date}</td>
                      <td className="py-2 font-mono font-semibold text-[#1A1A18] whitespace-nowrap">{e.reference}</td>
                      <td className="py-2 text-[#7A7A72] whitespace-nowrap">{e.type}</td>
                      <td className="py-2 font-medium text-[#1A1A18]">{e.thirdParty}</td>
                      <td className="py-2 text-[#7A7A72] truncate max-w-xs">{e.description}</td>
                      <td className="py-2 text-right font-semibold text-emerald-700 whitespace-nowrap">
                        {e.flowType === 'credit' ? `+${e.amount.toLocaleString('fr-FR')} ${sym}` : '—'}
                      </td>
                      <td className="py-2 text-right font-semibold text-red-600 whitespace-nowrap">
                        {e.flowType === 'debit' ? `-${e.amount.toLocaleString('fr-FR')} ${sym}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#1A1A18] font-bold text-xs">
                    <td colSpan={5} className="py-3 uppercase">Totaux de la période</td>
                    <td className="py-3 text-right text-emerald-800">+{totalRevenues.toLocaleString('fr-FR')} {sym}</td>
                    <td className="py-3 text-right text-red-700">-{totalExpenses.toLocaleString('fr-FR')} {sym}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Signature & Legal Footer */}
        <div className="pt-8 border-t border-[#E5E5DF] flex justify-between items-end text-xs text-[#7A7A72]">
          <div>
            <p>Document comptable généré par Sirius Auto CRM</p>
            <p className="text-[11px] text-[#9A9A92]">Certifié conforme aux opérations enregistrées dans le système.</p>
          </div>
          <div className="text-right border-t border-dashed border-[#7A7A72] pt-2 min-w-[180px]">
            <p className="font-semibold text-[#1A1A18]">Cachet & Signature Direction</p>
          </div>
        </div>
      </div>
    </div>
  );
};
