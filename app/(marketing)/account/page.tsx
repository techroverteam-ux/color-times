import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { Booking, type IBooking } from "@/models/Booking";
import { User } from "@/models/User";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/motion/reveal";
import { ResendVerificationBanner } from "@/components/forms/resend-verification-banner";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

async function getBookings(userId: string): Promise<IBooking[]> {
  try {
    await connectToDatabase();
    const bookings = await Booking.find({ customer: userId }).sort({ createdAt: -1 }).lean();
    return bookings as unknown as IBooking[];
  } catch {
    return [];
  }
}

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const [bookings, dbUser] = await Promise.all([
    getBookings(user.sub),
    connectToDatabase().then(() => User.findById(user.sub).select("isEmailVerified").lean()),
  ]);

  return (
    <div className="container-boutique py-20">
      <Reveal>
        <span className="kicker">My Account</span>
        <h1 className="mt-3 font-heading text-4xl">Hello, {user.name.split(" ")[0]}</h1>
        <p className="mt-2 text-muted-foreground">{user.email}</p>
      </Reveal>

      {dbUser && !dbUser.isEmailVerified && (
        <Reveal delay={0.05} className="mt-6">
          <ResendVerificationBanner />
        </Reveal>
      )}

      <Reveal delay={0.1} className="mt-12">
        <h2 className="font-heading text-2xl">My Bookings</h2>
        <div className="mt-6">
          {bookings.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No bookings yet"
              description="Once you book a rental, you'll be able to track its status, delivery date, and return window right here."
              action={<ButtonLink href="/collections">Browse Collections</ButtonLink>}
            />
          ) : (
            <ul className="space-y-4">
              {bookings.map((booking) => (
                <li
                  key={String(booking._id)}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <p className="font-medium">{booking.bookingNumber}</p>
                  <p className="text-sm text-muted-foreground capitalize">{booking.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </div>
  );
}
