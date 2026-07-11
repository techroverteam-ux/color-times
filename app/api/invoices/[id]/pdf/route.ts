import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { Invoice } from "@/models/Invoice";
import "@/models/User";
import { generateInvoicePdfBuffer } from "@/lib/admin/invoice-pdf-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    return new Response("Not found", { status: 404 });
  }

  await connectToDatabase();

  const invoice = await Invoice.findById(id).populate("customer", "name email phone").lean();
  if (!invoice || invoice.deletedAt) {
    return new Response("Not found", { status: 404 });
  }

  const customer = invoice.customer as unknown as { name: string; email: string; phone?: string };

  const buffer = await generateInvoicePdfBuffer({
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    createdAt: invoice.createdAt,
    dueDate: invoice.dueDate,
    customer: { name: customer.name, email: customer.email, phone: customer.phone },
    lineItems: invoice.lineItems,
    subtotal: invoice.subtotal,
    discountAmount: invoice.discountAmount,
    taxRate: invoice.taxRate,
    taxAmount: invoice.taxAmount,
    securityDeposit: invoice.securityDeposit,
    total: invoice.total,
    amountPaid: invoice.amountPaid,
    amountDue: invoice.amountDue,
    payments: invoice.payments,
    notes: invoice.notes,
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}
