export const TRIGGER_EVENTS = [
  "booking_confirmed",
  "booking_reminder",
  "booking_return_reminder",
  "booking_returned",
  "booking_cancelled",
  "invoice_sent",
  "payment_received",
  "payment_reminder",
  "customisation_bill_sent",
  "sale_bill_sent",
  "custom",
] as const;

export type WhatsAppTriggerEvent = (typeof TRIGGER_EVENTS)[number];

export const TRIGGER_EVENT_LABELS: Record<WhatsAppTriggerEvent, string> = {
  booking_confirmed: "Booking Confirmed",
  booking_reminder: "Booking Reminder",
  booking_return_reminder: "Return Reminder",
  booking_returned: "Booking Returned",
  booking_cancelled: "Booking Cancelled",
  invoice_sent: "Invoice Sent",
  payment_received: "Payment Received",
  payment_reminder: "Payment Reminder",
  customisation_bill_sent: "Customisation Bill Sent",
  sale_bill_sent: "Sale Bill Sent",
  custom: "Custom / Manual",
};

export const TRIGGER_EVENT_VARIABLES: Record<WhatsAppTriggerEvent, string[]> = {
  booking_confirmed: [
    "customerName",
    "bookingNumber",
    "productName",
    "eventDate",
    "rentalStartDate",
    "rentalEndDate",
    "totalAmount",
  ],
  booking_reminder: ["customerName", "bookingNumber", "productName", "eventDate", "rentalStartDate"],
  booking_return_reminder: ["customerName", "bookingNumber", "productName", "rentalEndDate"],
  booking_returned: ["customerName", "bookingNumber", "productName"],
  booking_cancelled: ["customerName", "bookingNumber", "productName"],
  invoice_sent: ["customerName", "invoiceNumber", "totalAmount", "amountDue", "dueDate"],
  payment_received: ["customerName", "invoiceNumber", "amountPaid", "amountDue"],
  payment_reminder: ["customerName", "invoiceNumber", "amountDue", "dueDate"],
  customisation_bill_sent: ["customerName", "billNumber", "totalAmount", "advancePayment", "dueAmount"],
  sale_bill_sent: ["customerName", "billNumber", "totalAmount"],
  custom: ["customerName"],
};
