import { articles } from "@/data/articles";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  return {
    title: article ? `${article.title} — Mossad` : "Articolo non trovato",
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);

  if (!article) return notFound();

  return (
    <article className="max-w-2xl mx-auto px-5 py-20">
      <Link
        href="/#articoli"
        className="text-sm text-ash-light hover:text-blood-light transition-colors"
      >
        ← Torna agli articoli
      </Link>

      <span className="block mt-6 text-xs uppercase tracking-widest text-ash">
        {article.category}
      </span>

      <h1 className="font-display text-3xl md:text-4xl text-fog mt-3 mb-8">
        {article.title}
      </h1>

      <div className="text-ash-light leading-relaxed whitespace-pre-line text-base">
        {article.content}
      </div>
    </article>
  );
}