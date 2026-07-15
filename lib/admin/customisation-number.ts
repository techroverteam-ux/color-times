import "server-only";
import { CustomisationOrder } from "@/models/CustomisationOrder";

export async function generateCustomisationBillNumber(): Promise<string> {
  const latest = await CustomisationOrder.findOne()
    .sort({ createdAt: -1 })
    .select("billNumber")
    .lean();
  const lastSeq = latest ? Number(latest.billNumber.split("-").pop()) : 0;
  const nextSeq = (Number.isFinite(lastSeq) ? lastSeq : 0) + 1;
  return `CO-${String(nextSeq).padStart(5, "0")}`;
}
