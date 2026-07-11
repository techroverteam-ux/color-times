import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Invoice } from "@/models/Invoice";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { recordAuditLog } from "@/lib/audit/log";
import { notifyInvoiceSent } from "@/lib/notifications/whatsapp-events";
import { formatDate } from "@/lib/utils";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await connectToDatabase();

  const existing = await Invoice.findById(id).lean();
  if (!existing) {
    return apiError("Invoice not found", 404);
  }
  if (existing.status !== "draft") {
    return apiError("Only draft invoices can be sent", 409);
  }

  const invoice = await Invoice.findByIdAndUpdate(
    id,
    { status: "sent", issuedAt: new Date() },
    { returnDocument: "after" }
  ).populate("customer", "name phone");

  await recordAuditLog({
    entityType: "Invoice",
    entityId: id,
    action: "status_change",
    actor: auth.user,
    changes: [{ field: "status", from: "draft", to: "sent" }],
  });

  if (invoice) {
    const customer = invoice.customer as unknown as { name: string; phone?: string } | null;
    void notifyInvoiceSent({
      customerName: customer?.name ?? "Customer",
      customerPhone: customer?.phone,
      relatedEntityType: "Invoice",
      relatedEntityId: id,
      variables: {
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: String(invoice.total),
        amountDue: String(invoice.amountDue),
        dueDate: formatDate(invoice.dueDate),
      },
    });
  }

  return apiSuccess({ invoice });
}
