import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "My Wishlist",
  robots: { index: false, follow: false },
};

async function getWishlistCount(userId: string): Promise<number> {
  try {
    await connectToDatabase();
    const user = await User.findById(userId).select("wishlist").lean();
    return user?.wishlist.length ?? 0;
  } catch {
    return 0;
  }
}

export default async function WishlistPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/wishlist");
  }

  const wishlistCount = await getWishlistCount(user.sub);

  return (
    <div className="container-boutique py-20">
      <Reveal>
        <span className="kicker">Saved For Later</span>
        <h1 className="mt-3 font-heading text-4xl">My Wishlist</h1>
      </Reveal>

      <Reveal delay={0.1} className="mt-12">
        {wishlistCount === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Tap the heart icon on any dress to save it here for your next booking."
            action={<ButtonLink href="/collections">Browse Collections</ButtonLink>}
          />
        ) : null}
      </Reveal>
    </div>
  );
}
