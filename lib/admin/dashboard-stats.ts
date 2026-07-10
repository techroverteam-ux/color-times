import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { Booking } from "@/models/Booking";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { Invoice } from "@/models/Invoice";

const REVENUE_STATUSES = ["confirmed", "in_use", "returned"];

export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  activeRentals: number;
  totalCustomers: number;
  totalProducts: number;
  outstandingBalance: number;
  returnsDue: number;
  recentBookings: {
    _id: string;
    bookingNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    customer: { name: string } | null;
    product: { name: string } | null;
  }[];
  monthlyRevenue: { label: string; revenue: number; bookings: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectToDatabase();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalRevenueResult,
    totalBookings,
    activeRentals,
    totalCustomers,
    totalProducts,
    returnsDue,
    outstandingBalanceResult,
    recentBookings,
    monthlyRevenue,
  ] = await Promise.all([
    Booking.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Booking.countDocuments(),
    Booking.countDocuments({ status: "in_use" }),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments({ isActive: true, deletedAt: null }),
    Booking.countDocuments({
      status: { $in: ["confirmed", "in_use"] },
      rentalEndDate: { $lt: new Date() },
    }),
    Invoice.aggregate([
      {
        $match: {
          deletedAt: null,
          status: { $in: ["sent", "partially_paid", "overdue"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$amountDue" } } },
    ]),
    Booking.find()
      .populate("customer", "name")
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Booking.aggregate([
      {
        $match: {
          status: { $in: REVENUE_STATUSES },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  return {
    totalRevenue: totalRevenueResult[0]?.total ?? 0,
    totalBookings,
    activeRentals,
    totalCustomers,
    totalProducts,
    returnsDue,
    outstandingBalance: outstandingBalanceResult[0]?.total ?? 0,
    recentBookings: recentBookings.map((booking) => ({
      _id: String(booking._id),
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      totalAmount: booking.totalAmount,
      createdAt: booking.createdAt.toISOString(),
      customer: booking.customer
        ? { name: (booking.customer as unknown as { name: string }).name }
        : null,
      product: booking.product
        ? { name: (booking.product as unknown as { name: string }).name }
        : null,
    })),
    monthlyRevenue: monthlyRevenue.map((entry) => ({
      label: new Date(entry._id.year, entry._id.month - 1).toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      }),
      revenue: entry.revenue,
      bookings: entry.bookings,
    })),
  };
}
