import { z } from "zod";

export const invoiceLineItemSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
});

export type InvoiceLineItemInput = z.infer<typeof invoiceLineItemSchema>;

export const invoiceSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  booking: z.string().optional().nullable(),
  lineItems: z.array(invoiceLineItemSchema).min(1, "Add at least one line item"),
  discountAmount: z.number().min(0),
  taxRate: z.number().min(0).max(100),
  securityDeposit: z.number().min(0),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().trim().optional(),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const invoicePaymentSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum(["cash", "card", "upi", "bank_transfer", "other"]),
  reference: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export type InvoicePaymentInput = z.infer<typeof invoicePaymentSchema>;

export function computeInvoiceTotals(input: {
  lineItems: InvoiceLineItemInput[];
  discountAmount: number;
  taxRate: number;
  securityDeposit: number;
}) {
  const subtotal = input.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = Math.min(input.discountAmount, subtotal);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * input.taxRate) / 100;
  const total = taxableAmount + taxAmount + input.securityDeposit;

  return { subtotal, discountAmount, taxAmount, total };
}
