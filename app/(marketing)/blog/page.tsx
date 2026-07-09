import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { blogPosts } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Styling guides, care tips, and trend reports from the Color Times Boutique team.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <div className="container-boutique py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="kicker">From the Styling Desk</span>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">Journal</h1>
        <p className="mt-4 text-muted-foreground">
          Styling guides, care tips, and trend reports to help you get the most out of every
          rental.
        </p>
      </Reveal>

      <RevealGroup className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <RevealItem key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
                {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                &middot; {post.readingTime}
              </p>
              <h2 className="mt-2 font-heading text-xl leading-snug group-hover:text-accent">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
