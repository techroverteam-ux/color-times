import "server-only";
import { Sale } from "@/models/Sale";

export async function generateSaleBillNumber(): Promise<string> {
  const latest = await Sale.findOne().sort({ createdAt: -1 }).select("billNumber").lean();
  const lastSeq = latest ? Number(latest.billNumber.split("-").pop()) : 0;
  const nextSeq = (Number.isFinite(lastSeq) ? lastSeq : 0) + 1;
  return `SAL-${String(nextSeq).padStart(5, "0")}`;
}
