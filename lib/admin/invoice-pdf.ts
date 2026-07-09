import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { siteConfig } from "@/lib/config/site";
import type { InvoiceLineItem, InvoiceStatus, PaymentMethod } from "@/models/Invoice";

interface InvoicePdfPayment {
  amount: number;
  method: PaymentMethod;
  reference?: string;
  paidAt: string;
}

interface InvoicePdfData {
  invoiceNumber: string;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
  customer: { name: string; email: string; phone?: string };
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  securityDeposit: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  payments: InvoicePdfPayment[];
  notes?: string;
}

function formatCurrency(value: number): string {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export function downloadInvoicePdf(invoice: InvoicePdfData): void {
  const doc = new jsPDF({ orientation: "portrait" });

  doc.setFontSize(18);
  doc.text(siteConfig.name, 14, 18);
  doc.setFontSize(9);
  doc.text(siteConfig.contact.address, 14, 24);
  doc.text(`${siteConfig.contact.email} · ${siteConfig.contact.phone}`, 14, 29);

  doc.setFontSize(16);
  doc.text("INVOICE", 196, 18, { align: "right" });
  doc.setFontSize(10);
  doc.text(invoice.invoiceNumber, 196, 24, { align: "right" });
  doc.text(`Issued: ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}`, 196, 29, {
    align: "right",
  });
  doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString("en-IN")}`, 196, 34, {
    align: "right",
  });
  doc.text(`Status: ${invoice.status.replace("_", " ").toUpperCase()}`, 196, 39, { align: "right" });

  doc.setFontSize(10);
  doc.text("Bill To:", 14, 42);
  doc.setFontSize(9);
  doc.text(invoice.customer.name, 14, 47);
  doc.text(invoice.customer.email, 14, 52);
  if (invoice.customer.phone) doc.text(invoice.customer.phone, 14, 57);

  autoTable(doc, {
    head: [["Description", "Qty", "Unit Price", "Amount"]],
    body: invoice.lineItems.map((item) => [
      item.description,
      String(item.quantity),
      formatCurrency(item.unitPrice),
      formatCurrency(item.amount),
    ]),
    startY: 64,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [32, 26, 22] },
  });

  const afterLineItemsY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY;

  const summaryLines = [
    ["Subtotal", formatCurrency(invoice.subtotal)],
    ["Discount", `-${formatCurrency(invoice.discountAmount)}`],
    [`Tax (${invoice.taxRate}%)`, formatCurrency(invoice.taxAmount)],
    ["Security Deposit", formatCurrency(invoice.securityDeposit)],
    ["Total", formatCurrency(invoice.total)],
    ["Amount Paid", formatCurrency(invoice.amountPaid)],
    ["Amount Due", formatCurrency(invoice.amountDue)],
  ];

  autoTable(doc, {
    body: summaryLines,
    startY: afterLineItemsY + 6,
    theme: "plain",
    styles: { fontSize: 9 },
    columnStyles: { 0: { halign: "right", cellWidth: 130 }, 1: { halign: "right", cellWidth: 46 } },
    margin: { left: 20 },
  });

  let cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  if (invoice.payments.length > 0) {
    doc.setFontSize(11);
    doc.text("Payment History", 14, cursorY);
    autoTable(doc, {
      head: [["Date", "Method", "Amount", "Reference"]],
      body: invoice.payments.map((payment) => [
        new Date(payment.paidAt).toLocaleDateString("en-IN"),
        payment.method.replace("_", " "),
        formatCurrency(payment.amount),
        payment.reference ?? "—",
      ]),
      startY: cursorY + 4,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [32, 26, 22] },
    });
    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  if (invoice.notes) {
    doc.setFontSize(9);
    doc.text(`Notes: ${invoice.notes}`, 14, cursorY);
  }

  doc.save(`${invoice.invoiceNumber}.pdf`);
}
