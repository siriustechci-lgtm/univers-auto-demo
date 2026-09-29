import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Vehicle, Sale, Client, Invoice, Payment, Reservation, AgencySettings } from '../types';

export const pdfGenerator = {
  // Format FCFA
  formatFcfa(amount: number): string {
    return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
  },

  // 1. CONTRAT DE VENTE OFFICIEL
  generateSaleContract(sale: Sale, vehicle?: Vehicle | null, client?: Client | null, settings?: AgencySettings | null) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const companyName = settings?.companyName || 'UNIVERS AUTO';
    const companySlogan = 'Achat & Vente de Véhicules Neufs et d’Occasion';
    const phone = settings?.phone || '+221 33 800 00 00';
    const email = settings?.email || 'contact@universauto.sn';
    const address = settings?.address || 'Dakar, Sénégal';

    // Header styling
    doc.setFillColor(5, 5, 5); // #050505
    doc.rect(0, 0, 210, 36, 'F');

    // Red racing stripe
    doc.setFillColor(229, 9, 20); // #E50914
    doc.rect(0, 36, 210, 3, 'F');

    // Brand title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('UNIVERS ', 14, 20);
    doc.setTextColor(229, 9, 20);
    doc.text('AUTO', 56, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text(companySlogan, 14, 28);

    doc.setFontSize(8);
    doc.text(`${address} · Tél : ${phone} · ${email}`, 110, 28, { align: 'left' });

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(5, 5, 5);
    doc.text('CONTRAT DE VENTE DE VÉHICULE AUTOMOBILE', 14, 52);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Réf Vente : ${sale.saleNumber}  ·  Date : ${sale.saleDate}`, 14, 58);

    // Two Columns: Vendeur & Acheteur
    autoTable(doc, {
      startY: 64,
      head: [['LE VENDEUR (UNIVERS AUTO)', 'L’ACHÉTEUR (LE CLIENT)']],
      body: [
        [
          `Raison Sociale : ${companyName}\nRCCM : ${settings?.rccm || 'SN.DKR.2024.B.1234'}\nNINEA : ${settings?.taxNumber || '0098765432Y'}\nAdresse : ${address}\nTéléphone : ${phone}\nReprésenté par : ${sale.sellerName || 'La Direction Commerciale'}`,
          `Nom complet : ${sale.clientName}\nTéléphone : ${sale.clientPhone || client?.phone || 'Non renseigné'}\nEmail : ${client?.email || 'Non renseigné'}\nAdresse : ${client?.address || 'Non renseignée'}\nPièce d'identité : ${(client as any)?.idType || (client as any)?.idCardType || 'CNI'} N° ${(client as any)?.idNumber || (client as any)?.idCardNumber || '—'}`,
        ],
      ],
      headStyles: {
        fillColor: [30, 32, 38],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: {
        cellPadding: 4,
        fontSize: 9,
        lineColor: [200, 200, 200],
        lineWidth: 0.2,
      },
    });

    const finalY1 = (doc as any).lastAutoTable.finalY + 8;

    // Vehicle Specifications Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(5, 5, 5);
    doc.text('DÉSIGNATION ET CARACTÉRISTIQUES DU VÉHICULE', 14, finalY1);

    autoTable(doc, {
      startY: finalY1 + 4,
      head: [['Désignation', 'Marque & Modèle', 'Année', 'Kilométrage', 'Châssis (VIN)', 'Immatriculation', 'Énergie']],
      body: [
        [
          sale.vehicleName,
          vehicle ? `${vehicle.make} ${vehicle.model}` : 'Véhicule',
          vehicle?.year ? String(vehicle.year) : '—',
          vehicle?.mileage ? `${vehicle.mileage.toLocaleString('fr-FR')} km` : '—',
          sale.vehicleVin || vehicle?.vin || '—',
          vehicle?.registration || sale.vehicleRegistration || 'En cours',
          vehicle?.fuelType || 'Essence',
        ],
      ],
      headStyles: {
        fillColor: [229, 9, 20],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        cellPadding: 3,
        fontSize: 8,
      },
    });

    const finalY2 = (doc as any).lastAutoTable.finalY + 8;

    // Financial breakdown Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(5, 5, 5);
    doc.text('CONDITIONS FINANCIÈRES & RÈGLEMENT (EN FCFA)', 14, finalY2);

    const priceAgreed = sale.agreedPrice || sale.finalPrice;
    const discount = sale.discount || 0;
    const finalPrice = sale.finalPrice;
    const deposit = sale.deposit || sale.amountPaid || 0;
    const balance = sale.balanceDue || Math.max(0, finalPrice - deposit);

    autoTable(doc, {
      startY: finalY2 + 4,
      head: [['Description financière', 'Montant en FCFA']],
      body: [
        ['Prix de vente convenu', this.formatFcfa(priceAgreed)],
        ['Remise commerciale accordée', discount > 0 ? `- ${this.formatFcfa(discount)}` : '0 FCFA'],
        ['PRIX NET DE VENTE', this.formatFcfa(finalPrice)],
        ['Acompte / Règlements perçus', this.formatFcfa(deposit)],
        ['SOLDE RESTANT DÛ', this.formatFcfa(balance)],
        ['Mode de paiement convenu', String(sale.paymentMethod || 'Espèces / Virement / Mobile Money')],
      ],
      headStyles: {
        fillColor: [30, 32, 38],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        cellPadding: 3,
        fontSize: 9,
      },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold' },
      },
    });

    const finalY3 = (doc as any).lastAutoTable.finalY + 12;

    // Clauses et mentions légales
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text(
      'Conditions de vente : Le véhicule est vendu avec certificat de non-gage et documents administratifs réguliers.\nLa propriété du véhicule n’est transférée à l’acquéreur qu’après complet encaissement du prix convenu.\nTout acompte versé vaut engagement ferme et définitif.',
      14,
      finalY3
    );

    // Signatures
    const finalY4 = finalY3 + 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(5, 5, 5);

    doc.text('Pour l’Acheteur (Le Client)', 25, finalY4);
    doc.text('Pour UNIVERS AUTO (La Direction)', 135, finalY4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('(Signature précédée de la mention "Lu et approuvé")', 25, finalY4 + 5);
    doc.text('(Signature et cachet officiel)', 135, finalY4 + 5);

    doc.rect(20, finalY4 + 8, 70, 24);
    doc.rect(130, finalY4 + 8, 70, 24);

    // Save PDF
    doc.save(`Contrat_Vente_${sale.saleNumber}_${sale.clientName.replace(/\s+/g, '_')}.pdf`);
  },

  // 2. BON DE RÉSERVATION
  generateReservationVoucher(reservation: Reservation, vehicle?: Vehicle | null, settings?: AgencySettings | null) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const companyName = settings?.companyName || 'UNIVERS AUTO';
    const phone = settings?.phone || '+221 33 800 00 00';
    const address = settings?.address || 'Dakar, Sénégal';

    // Header styling
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setFillColor(229, 9, 20);
    doc.rect(0, 36, 210, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('UNIVERS ', 14, 20);
    doc.setTextColor(229, 9, 20);
    doc.text('AUTO', 56, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Tél : ${phone} · ${address}`, 14, 28);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(5, 5, 5);
    doc.text('BON OFFICIEL DE RÉSERVATION DE VÉHICULE', 14, 52);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Réf Réservation : ${reservation.reservationNumber}  ·  Date : ${reservation.date || reservation.startDate}`, 14, 58);

    autoTable(doc, {
      startY: 64,
      head: [['DÉTAILS DU BÉNÉFICIAIRE', 'ENGAGEMENT DE RÉSERVATION']],
      body: [
        [
          `Nom du client : ${reservation.clientName}\nTéléphone : ${reservation.clientPhone || 'Non renseigné'}\nDate de réservation : ${reservation.date || reservation.startDate}\nDate limite de validité : ${reservation.endDate}`,
          `Véhicule réservé : ${reservation.vehicleName}\nAcompte de réservation : ${this.formatFcfa(reservation.depositAmount || 0)}\nMode de versement : ${reservation.depositPaymentMethod || 'Espèces'}\nStatut : ${reservation.status}`,
        ],
      ],
      headStyles: { fillColor: [30, 32, 38] },
      styles: { cellPadding: 4, fontSize: 9 },
    });

    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(5, 5, 5);
    doc.text('Conditions de la réservation :', 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      '1. Le présent véhicule est bloqué exclusivement au profit de l’acquéreur susnommé jusqu’à la date d’expiration.\n2. Passé ce délai sans règlement du solde convenu, la réservation sera réputée caduque et le véhicule remis en vente.\n3. L’acompte sera déduit du montant total de la vente définitive.',
      14,
      y + 6
    );

    // Signatures
    const sigY = y + 30;
    doc.rect(20, sigY, 70, 24);
    doc.rect(130, sigY, 70, 24);
    doc.text('Signature du Client', 35, sigY - 2);
    doc.text('Cachet UNIVERS AUTO', 145, sigY - 2);

    doc.save(`Bon_Reservation_${reservation.reservationNumber}.pdf`);
  },

  // 3. FACTURE OFFICIELLE (PROFORMA OU DÉFINITIVE)
  generateInvoicePdf(invoice: Invoice, settings?: AgencySettings | null) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const companyName = settings?.companyName || 'UNIVERS AUTO';
    const phone = settings?.phone || '+221 33 800 00 00';
    const email = settings?.email || 'contact@universauto.sn';
    const address = settings?.address || 'Dakar, Sénégal';

    // Header
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setFillColor(229, 9, 20);
    doc.rect(0, 36, 210, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('UNIVERS ', 14, 20);
    doc.setTextColor(229, 9, 20);
    doc.text('AUTO', 56, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`${address} · Tél : ${phone} · ${email}`, 14, 28);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(5, 5, 5);
    doc.text(invoice.type === 'Devis' ? 'DEVIS PROFORMA' : 'FACTURE OFFICIELLE', 14, 52);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`N° ${invoice.invoiceNumber}  ·  Date : ${invoice.date}${invoice.dueDate ? `  ·  Échéance : ${invoice.dueDate}` : ''}`, 14, 58);

    autoTable(doc, {
      startY: 64,
      head: [['ÉMETTEUR', 'FACTURÉ À']],
      body: [
        [
          `${companyName}\nRCCM : ${settings?.rccm || 'SN.DKR.2024.B.1234'}\nNINEA : ${settings?.taxNumber || '0098765432Y'}\n${address}\nTél : ${phone}`,
          `Client : ${invoice.clientName}\nTéléphone : ${invoice.clientPhone || '—'}\nEmail : ${invoice.clientEmail || '—'}\nAdresse : ${invoice.clientAddress || 'Dakar'}`,
        ],
      ],
      headStyles: { fillColor: [30, 32, 38] },
      styles: { cellPadding: 3.5, fontSize: 8.5 },
    });

    const nextY = (doc as any).lastAutoTable.finalY + 8;

    autoTable(doc, {
      startY: nextY,
      head: [['Désignation de la prestation / Véhicule', 'Quantité', 'Prix Unitaire (FCFA)', 'Total (FCFA)']],
      body: [
        [
          `Vente de véhicule automobile : ${invoice.vehicleName || 'Véhicule certifié'}\nImmatriculation / Réf : ${invoice.vehicleRegistration || '—'}`,
          '1',
          this.formatFcfa(invoice.subtotal),
          this.formatFcfa(invoice.subtotal),
        ],
      ],
      headStyles: { fillColor: [229, 9, 20] },
      styles: { cellPadding: 4, fontSize: 9 },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right', fontStyle: 'bold' },
      },
    });

    const totalsY = (doc as any).lastAutoTable.finalY + 6;

    autoTable(doc, {
      startY: totalsY,
      body: [
        ['Sous-total Hors Taxes', this.formatFcfa(invoice.subtotal)],
        ['TVA / Taxes', invoice.taxAmount > 0 ? this.formatFcfa(invoice.taxAmount) : 'Exonéré / 0 FCFA'],
        ['TOTAL GÉNÉRAL', this.formatFcfa(invoice.totalAmount)],
        ['Montant réglé / Acompte', this.formatFcfa(invoice.amountPaid)],
        ['NET À PAYER (SOLDE RESTANT)', this.formatFcfa(invoice.balanceDue)],
      ],
      styles: { cellPadding: 3, fontSize: 9 },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'right', fontStyle: 'bold' },
      },
    });

    const footerY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(settings?.invoiceFooter || 'UNIVERS AUTO — Votre partenaire de confiance pour l’automobile neuve et d’occasion certifiée.', 14, footerY);

    doc.save(`${invoice.type}_${invoice.invoiceNumber}.pdf`);
  },

  // 4. REÇU DE PAIEMENT / VERSEMENT
  generatePaymentReceipt(payment: Payment, settings?: AgencySettings | null) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5',
    });

    const companyName = settings?.companyName || 'UNIVERS AUTO';
    const phone = settings?.phone || '+221 33 800 00 00';

    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 148, 28, 'F');
    doc.setFillColor(229, 9, 20);
    doc.rect(0, 28, 148, 2.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('UNIVERS ', 10, 16);
    doc.setTextColor(229, 9, 20);
    doc.text('AUTO', 42, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 180, 180);
    doc.text(`REÇU OFFICIEL DE VERSEMENT · Tél : ${phone}`, 10, 23);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(5, 5, 5);
    doc.text('REÇU DE PAIEMENT', 10, 40);

    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`N° ${payment.paymentNumber}  ·  Date : ${payment.paymentDate}`, 10, 45);

    autoTable(doc, {
      startY: 50,
      body: [
        ['Reçu de :', payment.clientName],
        ['Téléphone :', payment.clientPhone || '—'],
        ['Motif / Référence :', payment.referenceTitle || 'Paiement véhicule'],
        ['Mode de règlement :', payment.paymentMethod],
        ['Statut :', payment.status],
        ['MONTANT ENCAISSÉ :', this.formatFcfa(payment.amount)],
      ],
      styles: { cellPadding: 2.5, fontSize: 8.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { fontStyle: 'normal' },
      },
    });

    const endY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(5, 5, 5);
    doc.text('Cachet et signature de la caisse :', 80, endY);
    doc.rect(80, endY + 2, 58, 20);

    doc.save(`Recu_${payment.paymentNumber}.pdf`);
  },
};
