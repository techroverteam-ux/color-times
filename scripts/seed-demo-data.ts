import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import { Booking, type BookingStatus } from "@/models/Booking";
import { Invoice, type InvoiceStatus, type PaymentMethod } from "@/models/Invoice";
import { ServiceOrder, type ServiceType, type ServiceOrderStatus } from "@/models/ServiceOrder";
import { hashPassword } from "@/lib/auth/password";
import { Types } from "mongoose";

const DAY = 24 * 60 * 60 * 1000;
const DEMO_EMAIL_DOMAIN = "@demo.colortimesboutique.com";

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY);
}
function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * DAY);
}
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

const CUSTOMERS = [
  { name: "Ananya Sharma", phone: "9820011223", city: "Mumbai", state: "Maharashtra", fatherName: "Rajesh Sharma" },
  { name: "Rohan Mehta", phone: "9820011224", city: "Pune", state: "Maharashtra", fatherName: "Suresh Mehta" },
  { name: "Priya Nair", phone: "9820011225", city: "Bengaluru", state: "Karnataka", fatherName: "Gopal Nair" },
  { name: "Aditya Kapoor", phone: "9820011226", city: "Delhi", state: "Delhi", fatherName: "Vikram Kapoor" },
  { name: "Sneha Reddy", phone: "9820011227", city: "Hyderabad", state: "Telangana", fatherName: "Srinivas Reddy" },
  { name: "Karan Malhotra", phone: "9820011228", city: "Chandigarh", state: "Punjab", fatherName: "Harpreet Malhotra" },
  { name: "Ishita Bose", phone: "9820011229", city: "Kolkata", state: "West Bengal", fatherName: "Anup Bose" },
  { name: "Varun Iyer", phone: "9820011230", city: "Chennai", state: "Tamil Nadu", fatherName: "Ramesh Iyer" },
  { name: "Meera Joshi", phone: "9820011231", city: "Ahmedabad", state: "Gujarat", fatherName: "Nitin Joshi" },
  { name: "Arjun Verma", phone: "9820011232", city: "Jaipur", state: "Rajasthan", fatherName: "Deepak Verma" },
];

async function main() {
  await connectToDatabase();

  const admin = await User.findOne({ role: "super_admin" }).select("_id").lean();
  if (!admin) throw new Error("No super admin found — run `npm run seed:super-admin` first.");

  const products = await Product.find({ isActive: true })
    .select("_id name rentalPricePerDay securityDeposit variants")
    .lean();
  if (products.length === 0) throw new Error("No products found — run `npm run seed:catalog` first.");

  // --- Clean up any previous run (idempotent) ---
  const existingDemoCustomers = await User.find({ email: { $regex: DEMO_EMAIL_DOMAIN + "$" } })
    .select("_id")
    .lean();
  const existingIds = existingDemoCustomers.map((c) => c._id);
  if (existingIds.length > 0) {
    await Booking.collection.deleteMany({ customer: { $in: existingIds } });
    await Invoice.collection.deleteMany({ customer: { $in: existingIds } });
    await User.collection.deleteMany({ _id: { $in: existingIds } });
  }
  await ServiceOrder.collection.deleteMany({ notes: "[DEMO]" });

  // --- 1. Customers, joined at varying points over the last 3 months ---
  const passwordHash = await hashPassword("Demo@12345");
  const customerDocs = CUSTOMERS.map((c) => {
    const slug = c.name.toLowerCase().replace(/[^a-z]+/g, ".");
    return {
      _id: new Types.ObjectId(),
      name: c.name,
      email: `${slug}${DEMO_EMAIL_DOMAIN}`,
      phone: c.phone,
      fatherName: c.fatherName,
      passwordHash,
      role: "customer" as const,
      isEmailVerified: true,
      isActive: true,
      wishlist: [],
      addresses: [
        {
          label: "Home",
          line1: `${randomInt(1, 200)}, ${c.city} Main Road`,
          city: c.city,
          state: c.state,
          postalCode: String(randomInt(100000, 999999)),
          isDefault: true,
        },
      ],
      createdAt: daysAgo(randomInt(5, 88)),
      updatedAt: new Date(),
    };
  });
  await User.collection.insertMany(customerDocs);
  console.log(`Created ${customerDocs.length} demo customers.`);

  // --- 2. Bookings: every status, spread across the last 3 months ---
  const bookingCases: { status: BookingStatus; createdAgo: number; startsInDays: number; endsInDays: number }[] = [
    { status: "inquiry", createdAgo: 3, startsInDays: 20, endsInDays: 23 },
    { status: "inquiry", createdAgo: 45, startsInDays: 15, endsInDays: 18 },
    { status: "inquiry", createdAgo: 80, startsInDays: 10, endsInDays: 13 },
    { status: "pending_payment", createdAgo: 5, startsInDays: 12, endsInDays: 15 },
    { status: "pending_payment", createdAgo: 40, startsInDays: 8, endsInDays: 11 },
    { status: "pending_payment", createdAgo: 70, startsInDays: 5, endsInDays: 8 },
    { status: "confirmed", createdAgo: 10, startsInDays: 6, endsInDays: 9 },
    { status: "confirmed", createdAgo: 35, startsInDays: 4, endsInDays: 7 },
    { status: "confirmed", createdAgo: 60, startsInDays: 18, endsInDays: 21 },
    { status: "confirmed", createdAgo: 85, startsInDays: 25, endsInDays: 28 },
    { status: "in_use", createdAgo: 6, startsInDays: -3, endsInDays: 2 },
    { status: "in_use", createdAgo: 20, startsInDays: -2, endsInDays: 4 },
    { status: "in_use", createdAgo: 50, startsInDays: -8, endsInDays: -1 },
    { status: "returned", createdAgo: 15, startsInDays: -12, endsInDays: -8 },
    { status: "returned", createdAgo: 32, startsInDays: -28, endsInDays: -24 },
    { status: "returned", createdAgo: 55, startsInDays: -48, endsInDays: -44 },
    { status: "returned", createdAgo: 78, startsInDays: -70, endsInDays: -66 },
    { status: "cancelled", createdAgo: 12, startsInDays: 10, endsInDays: 13 },
    { status: "cancelled", createdAgo: 42, startsInDays: -20, endsInDays: -17 },
    { status: "cancelled", createdAgo: 75, startsInDays: 5, endsInDays: 8 },
  ];

  const bookingDocs = bookingCases.map((c, index) => {
    const customer = pick(customerDocs);
    const product = pick(products);
    const size = pick(product.variants).size;
    const rentalStartDate = daysFromNow(c.startsInDays);
    const rentalEndDate = daysFromNow(c.endsInDays);
    const eventDate = new Date(rentalStartDate.getTime() + DAY);
    const rentalFee = product.rentalPricePerDay * 3;
    const securityDeposit = product.securityDeposit;
    return {
      _id: new Types.ObjectId(),
      bookingNumber: `CTB-2026-${String(index + 1001).padStart(5, "0")}`,
      customer: customer._id,
      product: product._id,
      size,
      rentalStartDate,
      rentalEndDate,
      eventDate,
      status: c.status,
      rentalFee,
      securityDeposit,
      totalAmount: rentalFee + securityDeposit,
      deliveryAddress: customer.addresses[0].line1 + ", " + customer.addresses[0].city,
      createdAt: daysAgo(c.createdAgo),
      updatedAt: daysAgo(Math.max(c.createdAgo - 1, 0)),
    };
  });
  await Booking.collection.insertMany(bookingDocs);
  console.log(`Created ${bookingDocs.length} demo bookings (all 6 statuses).`);

  // --- 3. Invoices: every status, spread across the last 3 months ---
  const linkableBookings = bookingDocs.filter((b) =>
    ["confirmed", "in_use", "returned"].includes(b.status)
  );

  const invoiceCases: {
    status: InvoiceStatus;
    createdAgo: number;
    dueInDays: number;
    paidFraction: number;
  }[] = [
    { status: "draft", createdAgo: 4, dueInDays: 14, paidFraction: 0 },
    { status: "draft", createdAgo: 38, dueInDays: 14, paidFraction: 0 },
    { status: "draft", createdAgo: 72, dueInDays: 14, paidFraction: 0 },
    { status: "sent", createdAgo: 8, dueInDays: 10, paidFraction: 0 },
    { status: "sent", createdAgo: 33, dueInDays: 10, paidFraction: 0 },
    { status: "sent", createdAgo: 65, dueInDays: 10, paidFraction: 0 },
    { status: "partially_paid", createdAgo: 14, dueInDays: 7, paidFraction: 0.5 },
    { status: "partially_paid", createdAgo: 27, dueInDays: 7, paidFraction: 0.4 },
    { status: "partially_paid", createdAgo: 58, dueInDays: 7, paidFraction: 0.6 },
    { status: "paid", createdAgo: 18, dueInDays: -3, paidFraction: 1 },
    { status: "paid", createdAgo: 30, dueInDays: -10, paidFraction: 1 },
    { status: "paid", createdAgo: 48, dueInDays: -20, paidFraction: 1 },
    { status: "paid", createdAgo: 82, dueInDays: -50, paidFraction: 1 },
    { status: "overdue", createdAgo: 22, dueInDays: -8, paidFraction: 0 },
    { status: "overdue", createdAgo: 44, dueInDays: -15, paidFraction: 0.3 },
    { status: "overdue", createdAgo: 66, dueInDays: -30, paidFraction: 0 },
    { status: "cancelled", createdAgo: 20, dueInDays: 10, paidFraction: 0 },
    { status: "cancelled", createdAgo: 60, dueInDays: 10, paidFraction: 0 },
  ];

  const invoiceDocs = invoiceCases.map((c, index) => {
    const linkedBooking = linkableBookings.length > 0 && index < linkableBookings.length ? linkableBookings[index] : null;
    const customerId = linkedBooking ? linkedBooking.customer : pick(customerDocs)._id;
    const product = pick(products);
    const quantity = 1;
    const unitPrice = linkedBooking ? linkedBooking.rentalFee : product.rentalPricePerDay * 3;
    const subtotal = unitPrice * quantity;
    const taxRate = 5;
    const taxAmount = Math.round(subtotal * (taxRate / 100));
    const securityDeposit = linkedBooking ? linkedBooking.securityDeposit : product.securityDeposit;
    const total = subtotal + taxAmount;
    const amountPaid = Math.round(total * c.paidFraction);
    const amountDue = total - amountPaid;
    const createdAt = daysAgo(c.createdAgo);
    const dueDate = daysFromNow(c.dueInDays);

    const payments =
      amountPaid > 0
        ? [
            {
              _id: new Types.ObjectId(),
              amount: amountPaid,
              method: pick<PaymentMethod>(["upi", "card", "cash", "bank_transfer"]),
              paidAt: new Date(createdAt.getTime() + 2 * DAY),
              recordedBy: admin._id,
            },
          ]
        : [];

    return {
      _id: new Types.ObjectId(),
      invoiceNumber: `INV-${String(index + 1001).padStart(5, "0")}`,
      customer: customerId,
      booking: linkedBooking ? linkedBooking._id : null,
      lineItems: [
        {
          description: linkedBooking
            ? `Rental — ${product.name} (${linkedBooking.bookingNumber})`
            : `Rental — ${product.name}`,
          quantity,
          unitPrice,
          amount: subtotal,
        },
      ],
      subtotal,
      discountAmount: 0,
      taxRate,
      taxAmount,
      securityDeposit,
      depositRefunded: c.status === "paid" && c.dueInDays < -15,
      total,
      amountPaid,
      amountDue,
      status: c.status,
      payments,
      dueDate,
      issuedAt: c.status === "draft" ? null : createdAt,
      archivedAt: null,
      deletedAt: null,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + DAY),
    };
  });
  await Invoice.collection.insertMany(invoiceDocs);
  console.log(`Created ${invoiceDocs.length} demo invoices (all 6 statuses).`);

  // --- 4. Service orders: every serviceType x status combination ---
  const serviceTypes: ServiceType[] = ["dry_clean", "tailor"];
  const serviceStatuses: ServiceOrderStatus[] = [
    "pending",
    "in_progress",
    "quality_check",
    "completed",
    "cancelled",
  ];

  const serviceCases: { type: ServiceType; status: ServiceOrderStatus; createdAgo: number }[] = [];
  let cursor = 0;
  for (const type of serviceTypes) {
    for (const status of serviceStatuses) {
      serviceCases.push({ type, status, createdAgo: 5 + cursor * 8 });
      cursor += 1;
    }
  }

  const serviceDocs = serviceCases.map((c) => {
    const product = pick(products);
    const sentDate = daysAgo(c.createdAgo);
    const expectedReturnDate = new Date(sentDate.getTime() + 5 * DAY);
    const completedDate = c.status === "completed" ? new Date(sentDate.getTime() + 4 * DAY) : null;
    return {
      _id: new Types.ObjectId(),
      serviceType: c.type,
      product: product._id,
      booking: null,
      description:
        c.type === "dry_clean"
          ? `${product.name} — standard dry clean before restock`
          : `${product.name} — alteration for upcoming rental`,
      status: c.status,
      cost: c.type === "dry_clean" ? 350 : 600,
      assignedTo: c.type === "dry_clean" ? "In-house Laundry" : "Tailoring Partner",
      sentDate,
      expectedReturnDate,
      completedDate,
      notes: "[DEMO]",
      deletedAt: null,
      createdAt: sentDate,
      updatedAt: completedDate ?? sentDate,
    };
  });
  await ServiceOrder.collection.insertMany(serviceDocs);
  console.log(`Created ${serviceDocs.length} demo service orders (all type x status combinations).`);

  console.log("\nDemo data seeded successfully across the last 3 months.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to seed demo data:", error);
  process.exit(1);
});
