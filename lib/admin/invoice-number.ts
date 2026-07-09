import "server-only";
import { Invoice } from "@/models/Invoice";

export async function generateInvoiceNumber(): Promise<string> {
  const latest = await Invoice.findOne().sort({ createdAt: -1 }).select("invoiceNumber").lean();
  const lastSeq = latest ? Number(latest.invoiceNumber.split("-").pop()) : 0;
  const nextSeq = (Number.isFinite(lastSeq) ? lastSeq : 0) + 1;
  return `INV-${String(nextSeq).padStart(5, "0")}`;
}
