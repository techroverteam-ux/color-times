export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  readingTime: string;
  content: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-choose-the-right-rental-size",
    title: "How to Choose the Right Rental Size (Without Trying It On)",
    excerpt:
      "Sizing is the #1 question we get before every booking. Here's how to measure at home and pick with confidence.",
    coverImage: "/images/placeholder/dresses/dress-5.png",
    author: "Color Times Styling Team",
    publishedAt: "2026-01-12",
    readingTime: "5 min read",
    content: [
      "Renting a designer outfit online means you can't step into a fitting room before your event — but with the right measurements, you can get remarkably close to a perfect fit on the first try.",
      "Start with three numbers: bust, waist, and hip, measured with a soft tape at the fullest point of each. Compare these against the size chart listed on every product page rather than your usual retail size, since designer sizing varies significantly between labels.",
      "For structured pieces like lehengas and gowns, also note the blouse length and desired sleeve style — many of our designers offer minor alterations on request, which we coordinate before dispatch.",
      "If you're between two sizes, we generally recommend sizing up for comfort in structured waistlines and sizing down for flowy silhouettes like anarkalis and draped gowns, which are more forgiving.",
      "Still unsure? Our styling team offers a free 15-minute video consultation before you book — just mention it when you reach out via the contact page.",
    ],
  },
  {
    slug: "caring-for-your-rental-between-delivery-and-return",
    title: "Caring for Your Rental: A Simple Guide Between Delivery and Return",
    excerpt:
      "A few small habits go a long way in keeping your rental in pristine condition — and your full deposit in your pocket.",
    coverImage: "/images/placeholder/dresses/dress-8.png",
    author: "Color Times Styling Team",
    publishedAt: "2025-12-02",
    readingTime: "4 min read",
    content: [
      "Every piece in our collection arrives freshly steamed and inspected, ready for its moment. A little care on your end helps keep it that way for the next person who rents it too.",
      "Store the garment on the padded hanger provided rather than folded in its bag, especially for beaded or embellished pieces, to avoid creasing.",
      "Apply perfume, deodorant, and makeup before getting dressed, not after — this is the single biggest cause of avoidable staining we see.",
      "If a spill happens, resist the urge to scrub it yourself. Blot gently with a dry cloth and let our care team handle the rest during professional cleaning; harsh home stain removers can sometimes set a stain permanently on delicate fabrics.",
      "When it's time to return, simply repack the item in the original packaging — no washing or ironing needed on your end. We handle all cleaning in-house after every rental.",
    ],
  },
  {
    slug: "wedding-season-2026-color-trends",
    title: "Wedding Season 2026: The Colour Palettes We're Seeing Everywhere",
    excerpt:
      "From deep jewel tones to soft pastel drapes, here's what's trending across our most-booked collections this season.",
    coverImage: "/images/placeholder/dresses/dress-3.png",
    author: "Color Times Editorial",
    publishedAt: "2025-11-18",
    readingTime: "6 min read",
    content: [
      "Every wedding season brings its own colour story, and 2026 is shaping up to be a beautiful mix of bold jewel tones and quiet, elegant neutrals.",
      "Emerald and deep teal continue to dominate sangeet and reception bookings this year, offering a rich alternative to the reds and maroons that have traditionally led bridal palettes.",
      "For daytime mehendi functions, we're seeing a strong shift toward marigold, terracotta, and warm mustard — colours that photograph beautifully against outdoor and garden venues.",
      "On the bridal side, ivory and champagne draped gowns remain a favourite for reception looks, often paired with statement gold jewellery to keep the overall look from feeling too minimal.",
      "Whatever your palette, our stylists can help you cross-reference your venue, time of day, and photography style to narrow down the perfect shade — just ask when you book your appointment.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
