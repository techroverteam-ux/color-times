import { connectToDatabase } from "@/lib/db/connect";
import { WhatsAppTemplate } from "@/models/WhatsAppTemplate";

const STARTER_TEMPLATES = [
  {
    name: "Booking Confirmed",
    triggerEvent: "booking_confirmed" as const,
    brevoTemplateId: 1,
    previewBody:
      "Hi {{customerName}}, your booking {{bookingNumber}} for {{productName}} is confirmed for {{eventDate}}. Rental dates: {{rentalStartDate}} to {{rentalEndDate}}. Total: ₹{{totalAmount}}. — Color Times Boutique",
  },
  {
    name: "Booking Returned",
    triggerEvent: "booking_returned" as const,
    brevoTemplateId: 2,
    previewBody:
      "Hi {{customerName}}, we've received your return for booking {{bookingNumber}} ({{productName}}). Thank you for renting with Color Times Boutique!",
  },
  {
    name: "Booking Cancelled",
    triggerEvent: "booking_cancelled" as const,
    brevoTemplateId: 3,
    previewBody:
      "Hi {{customerName}}, your booking {{bookingNumber}} for {{productName}} has been cancelled. Contact us if you have any questions.",
  },
  {
    name: "Invoice Sent",
    triggerEvent: "invoice_sent" as const,
    brevoTemplateId: 4,
    previewBody:
      "Hi {{customerName}}, invoice {{invoiceNumber}} for ₹{{totalAmount}} is ready. Amount due: ₹{{amountDue}} by {{dueDate}}. — Color Times Boutique",
  },
  {
    name: "Payment Received",
    triggerEvent: "payment_received" as const,
    brevoTemplateId: 5,
    previewBody:
      "Hi {{customerName}}, we've received your payment of ₹{{amountPaid}} for invoice {{invoiceNumber}}. Remaining balance: ₹{{amountDue}}. Thank you!",
  },
];

async function main() {
  await connectToDatabase();

  let count = 0;
  for (const template of STARTER_TEMPLATES) {
    await WhatsAppTemplate.findOneAndUpdate(
      { triggerEvent: template.triggerEvent, name: template.name },
      { $setOnInsert: { ...template, isActive: false } },
      { upsert: true }
    );
    count += 1;
  }

  console.log(
    `Seeded ${count} starter WhatsApp templates (inactive). Update each Brevo Template ID to a real approved template, then activate.`
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to seed WhatsApp templates:", error);
  process.exit(1);
});
