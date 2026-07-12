import { connectToDatabase } from "@/lib/db/connect";
import { daysBetween } from "@/lib/utils";

interface LegacyBookingDoc {
  _id: unknown;
  product?: unknown;
  size?: string;
  rentalFee?: number;
  rentalStartDate: Date;
  rentalEndDate: Date;
  items?: unknown[];
}

async function main() {
  const mongoose = await connectToDatabase();
  const collection = mongoose.connection.db!.collection<LegacyBookingDoc>("bookings");

  const legacyBookings = await collection
    .find({ product: { $exists: true }, $or: [{ items: { $exists: false } }, { items: { $size: 0 } }] })
    .toArray();

  console.log(`Found ${legacyBookings.length} bookings to migrate.`);

  let migrated = 0;
  for (const booking of legacyBookings) {
    const days = daysBetween(booking.rentalStartDate, booking.rentalEndDate);
    const rentalFee = booking.rentalFee ?? 0;
    const pricePerDay = days > 0 ? rentalFee / days : rentalFee;

    await collection.updateOne(
      { _id: booking._id },
      {
        $set: {
          items: [
            {
              product: booking.product,
              size: booking.size ?? "",
              quantity: 1,
              pricePerDay,
              rentalFee,
            },
          ],
        },
        $unset: { product: "", size: "", rentalFee: "" },
      }
    );
    migrated += 1;
  }

  console.log(`Migrated ${migrated} bookings to the multi-item shape.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to migrate bookings:", error);
  process.exit(1);
});
