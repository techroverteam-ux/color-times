import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { blogPosts, getBlogPost } from "@/lib/data/blog";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container-boutique max-w-3xl py-20">
      <Reveal>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Journal
        </Link>

        <p className="mt-8 text-xs uppercase tracking-wide text-muted-foreground">
          {new Date(post.publishedAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          &middot; {post.readingTime} &middot; {post.author}
        </p>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">{post.title}</h1>

        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-lg bg-secondary">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover object-top"
            priority
          />
        </div>

        <div className="mt-10 space-y-6 text-base leading-relaxed text-foreground/90">
          {post.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Reveal>
    </article>
  );
}
