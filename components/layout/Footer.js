import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-ash/10 bg-noir mt-16">
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row justify-between gap-6 text-sm text-ash">
        <div>
          <p className="font-display text-lg text-ash-light mb-2">MOSSAD</p>
          <p className="max-w-sm text-ash/80">
            Piattaforma di segnalazione e revisione manuale per la community.
            Nessuna esposizione pubblica, nessuna automazione: solo verifica
            interna e controllata.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/faq" className="hover:text-blood-light transition-colors">
            FAQ
          </Link>
          <Link href="/verifica-stato" className="hover:text-blood-light transition-colors">
            Verifica stato segnalazione
          </Link>
          <Link href="/segnalazione/nuova" className="hover:text-blood-light transition-colors">
            Invia segnalazione
          </Link>
        </div>
        <div className="text-ash/60 self-end md:self-auto">
          © {new Date().getFullYear()} Mossad Community.
        </div>
      </div>
    </footer>
  );
}