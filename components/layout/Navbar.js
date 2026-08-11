import Link from "next/link";
import ImageFallback from "@/components/media/ImageFallback";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-noir/90 backdrop-blur-md border-b border-ash/10">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <ImageFallback
            src="/media/images/logo.png"
            alt="Mossad"
            width={38}
            height={38}
            className="rounded-full ritual-border"
          />
          <span className="font-display text-xl tracking-widest text-fog">
            MOSSAD
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-ash-light font-body">
          <Link href="/#come-funziona" className="hover:text-blood-light transition-colors">
            Come funziona
          </Link>
          <Link href="/#articoli" className="hover:text-blood-light transition-colors">
            Articoli
          </Link>
          <Link href="/faq" className="hover:text-blood-light transition-colors">
            FAQ
          </Link>
          <Link href="/verifica-stato" className="hover:text-blood-light transition-colors">
            Verifica stato
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/segnalazione/nuova"
            className="text-sm bg-bordeaux hover:bg-blood-light text-fog px-4 py-2 rounded-md border border-blood/40 ritual-glow transition-all"
          >
            Invia segnalazione
          </Link>
        </div>
      </nav>
    </header>
  );
}