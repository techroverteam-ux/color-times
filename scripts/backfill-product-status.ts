import { connectToDatabase } from "@/lib/db/connect";
import { Product } from "@/models/Product";
import { Booking, type BookingStatus } from "@/models/Booking";
import { ServiceOrder } from "@/models/ServiceOrder";

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["pending_payment", "confirmed", "in_use"];

async function main() {
  await connectToDatabase();

  const result = await Product.updateMany(
    { status: { $exists: false } },
    { $set: { status: "available" } }
  );
  console.log(`Backfilled status="available" on ${result.modifiedCount} products.`);

  const activeBookings = await Booking.find({ status: { $in: ACTIVE_BOOKING_STATUSES } })
    .select("items.product")
    .lean();
  let bookedCount = 0;
  for (const booking of activeBookings) {
    for (const item of booking.items) {
      await Product.findByIdAndUpdate(item.product, { status: "booked" });
      bookedCount += 1;
    }
  }
  console.log(`Set status="booked" on ${bookedCount} products with active bookings.`);

  const openServiceOrders = await ServiceOrder.find({
    status: { $in: ["pending", "in_progress", "quality_check"] },
    deletedAt: null,
  })
    .select("product serviceType")
    .lean();
  let serviceCount = 0;
  for (const order of openServiceOrders) {
    await Product.findByIdAndUpdate(order.product, {
      status: order.serviceType === "dry_clean" ? "under_dry_cleaning" : "under_repair",
    });
    serviceCount += 1;
  }
  console.log(`Set status on ${serviceCount} products with open service orders.`);

  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to backfill product status:", error);
  process.exit(1);
});
