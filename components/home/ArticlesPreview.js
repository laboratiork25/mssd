import Link from "next/link";
import Card from "@/components/ui/Card";
import { articles } from "@/data/articles";

export default function ArticlesPreview() {
  return (
    <section id="articoli" className="max-w-6xl mx-auto px-5 py-24">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-4xl text-fog mb-3">
          Articoli
        </h2>
        <p className="text-ash-light max-w-xl mx-auto">
          Approfondimenti su come funziona la revisione e sulla community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link key={article.slug} href={`/articles/${article.slug}`}>
            <Card className="h-full hover:border-sky-400/40 transition-colors duration-300 cursor-pointer">
              <span className="text-xs uppercase tracking-widest text-ash">
                {article.category}
              </span>
              <h3 className="font-display text-xl text-sky-300 mt-2 mb-3">
                {article.title}
              </h3>
              <p className="text-sm text-ash-light line-clamp-3">
                {article.excerpt}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}