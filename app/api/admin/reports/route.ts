import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Product } from "@/models/Product";
import { Booking } from "@/models/Booking";
import { Invoice } from "@/models/Invoice";
import { User } from "@/models/User";
import { ServiceOrder } from "@/models/ServiceOrder";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import {
  resolveDateRange,
  buildDateFilter,
  type DateRangePreset,
} from "@/lib/admin/date-ranges";
import { apiSuccess, apiError } from "@/lib/api/response";

const REVENUE_STATUSES = ["confirmed", "in_use", "returned"];

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

function paginate<T>(rows: T[], page: number, pageSize: number, all: boolean): { items: T[]; pagination: Pagination } {
  const total = rows.length;
  if (all) {
    return { items: rows, pagination: { page: 1, pageSize: total || 1, total, totalPages: 1 } };
  }
  const start = (page - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

async function buildProductsReport(
  dateFilter: Record<string, unknown>,
  status: string | null,
  page: number,
  pageSize: number,
  all: boolean
) {
  const filter: Record<string, unknown> = { ...dateFilter };
  if (!status || status === "active") {
    filter.deletedAt = null;
    filter.archivedAt = null;
  } else if (status === "archived") {
    filter.archivedAt = { $ne: null };
    filter.deletedAt = null;
  } else if (status === "trash") {
    filter.deletedAt = { $ne: null };
  }

  const products = await Product.find(filter)
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .lean();

  const totalStockUnits = products.reduce(
    (sum, p) => sum + p.variants.reduce((s, v) => s + v.quantityInStock, 0),
    0
  );
  const totalStockValue = products.reduce(
    (sum, p) => sum + p.retailValue * p.variants.reduce((s, v) => s + v.quantityInStock, 0),
    0
  );
  const activeCount = products.filter((p) => p.isActive).length;

  const mappedItems = products.map((p) => ({
    _id: String(p._id),
    name: p.name,
    sku: p.sku,
    category: (p.category as unknown as { name: string } | null)?.name ?? "—",
    rentalPricePerDay: p.rentalPricePerDay,
    retailValue: p.retailValue,
    totalStock: p.variants.reduce((s, v) => s + v.quantityInStock, 0),
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
  }));

  return {
    summary: {
      totalProducts: products.length,
      activeCount,
      totalStockUnits,
      totalStockValue,
    },
    ...paginate(mappedItems, page, pageSize, all),
  };
}

async function buildBookingsReport(
  dateFilter: Record<string, unknown>,
  status: string | null,
  page: number,
  pageSize: number,
  all: boolean
) {
  const filter: Record<string, unknown> = { ...dateFilter };
  if (status && status !== "all") filter.status = status;

  const bookings = await Booking.find(filter)
    .populate("customer", "name")
    .populate("product", "name")
    .sort({ createdAt: -1 })
    .lean();

  const revenueBookings = bookings.filter((b) => REVENUE_STATUSES.includes(b.status));
  const totalRevenue = revenueBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const mappedItems = bookings.map((b) => ({
    _id: String(b._id),
    bookingNumber: b.bookingNumber,
    customer: (b.customer as unknown as { name: string } | null)?.name ?? "—",
    product: (b.product as unknown as { name: string } | null)?.name ?? "—",
    status: b.status,
    totalAmount: b.totalAmount,
    rentalStartDate: b.rentalStartDate.toISOString(),
    rentalEndDate: b.rentalEndDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
  }));

  return {
    summary: {
      totalBookings: bookings.length,
      totalRevenue,
      avgBookingValue: revenueBookings.length ? totalRevenue / revenueBookings.length : 0,
      activeCount: bookings.filter((b) => b.status === "in_use").length,
    },
    ...paginate(mappedItems, page, pageSize, all),
  };
}

async function buildInvoicesReport(
  dateFilter: Record<string, unknown>,
  status: string | null,
  page: number,
  pageSize: number,
  all: boolean
) {
  const filter: Record<string, unknown> = { ...dateFilter, deletedAt: null };
  if (status && status !== "all") filter.status = status;

  const invoices = await Invoice.find(filter)
    .populate("customer", "name")
    .sort({ createdAt: -1 })
    .lean();

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalOutstanding = invoices
    .filter((i) => i.status !== "cancelled")
    .reduce((sum, i) => sum + i.amountDue, 0);

  const mappedItems = invoices.map((i) => ({
    _id: String(i._id),
    invoiceNumber: i.invoiceNumber,
    customer: (i.customer as unknown as { name: string } | null)?.name ?? "—",
    total: i.total,
    amountPaid: i.amountPaid,
    amountDue: i.amountDue,
    status: i.status,
    dueDate: i.dueDate.toISOString(),
    createdAt: i.createdAt.toISOString(),
  }));

  return {
    summary: {
      totalInvoices: invoices.length,
      totalInvoiced,
      totalCollected,
      totalOutstanding,
    },
    ...paginate(mappedItems, page, pageSize, all),
  };
}

async function buildCustomersReport(
  dateFilter: Record<string, unknown>,
  page: number,
  pageSize: number,
  all: boolean
) {
  const filter: Record<string, unknown> = { ...dateFilter, role: "customer" };

  const [customers, totalCustomersOverall] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).lean(),
    User.countDocuments({ role: "customer" }),
  ]);

  const mappedItems = customers.map((c) => ({
    _id: String(c._id),
    name: c.name,
    email: c.email,
    phone: c.phone ?? "—",
    fatherName: c.fatherName ?? "—",
    createdAt: c.createdAt.toISOString(),
  }));

  return {
    summary: {
      newCustomers: customers.length,
      totalCustomersOverall,
    },
    ...paginate(mappedItems, page, pageSize, all),
  };
}

async function buildServicesReport(
  dateFilter: Record<string, unknown>,
  status: string | null,
  serviceType: string | null,
  page: number,
  pageSize: number,
  all: boolean
) {
  const filter: Record<string, unknown> = { ...dateFilter, deletedAt: null };
  if (status && status !== "all") filter.status = status;
  if (serviceType && serviceType !== "all") filter.serviceType = serviceType;

  const orders = await ServiceOrder.find(filter)
    .populate("product", "name")
    .sort({ createdAt: -1 })
    .lean();

  const totalCost = orders.reduce((sum, o) => sum + o.cost, 0);

  const mappedItems = orders.map((o) => ({
    _id: String(o._id),
    product: (o.product as unknown as { name: string } | null)?.name ?? "—",
    serviceType: o.serviceType,
    description: o.description,
    cost: o.cost,
    status: o.status,
    assignedTo: o.assignedTo ?? "—",
    sentDate: o.sentDate.toISOString(),
    expectedReturnDate: o.expectedReturnDate.toISOString(),
    createdAt: o.createdAt.toISOString(),
  }));

  return {
    summary: {
      totalOrders: orders.length,
      totalCost,
      completedCount: orders.filter((o) => o.status === "completed").length,
      pendingCount: orders.filter((o) => o.status === "pending" || o.status === "in_progress")
        .length,
    },
    ...paginate(mappedItems, page, pageSize, all),
  };
}

export async function GET(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  await connectToDatabase();

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") ?? "products";
  const rangePreset = (searchParams.get("range") ?? "month") as DateRangePreset;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");
  const serviceType = searchParams.get("serviceType");
  const all = searchParams.get("all") === "true";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

  const range = resolveDateRange(rangePreset, from, to);
  const dateFilter = buildDateFilter("createdAt", range);

  let report: { summary: Record<string, unknown>; items: unknown[]; pagination: Pagination };

  switch (type) {
    case "products":
      report = await buildProductsReport(dateFilter, status, page, pageSize, all);
      break;
    case "bookings":
      report = await buildBookingsReport(dateFilter, status, page, pageSize, all);
      break;
    case "invoices":
      report = await buildInvoicesReport(dateFilter, status, page, pageSize, all);
      break;
    case "customers":
      report = await buildCustomersReport(dateFilter, page, pageSize, all);
      break;
    case "services":
      report = await buildServicesReport(dateFilter, status, serviceType, page, pageSize, all);
      break;
    default:
      return apiError("Invalid report type", 400);
  }

  return apiSuccess({
    ...report,
    range: {
      from: range.from ? range.from.toISOString() : null,
      to: range.to ? range.to.toISOString() : null,
      label: range.label,
    },
  });
}
