import BackgroundVideo from "@/components/media/BackgroundVideo";
import GifDecoration from "@/components/media/GifDecoration";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center px-5 overflow-hidden">
      <BackgroundVideo />

      <div className="absolute top-16 left-8 hidden md:block opacity-60">
        <GifDecoration name="glitch" alt="" width={64} height={64} />
      </div>
      <div className="absolute bottom-20 right-10 hidden md:block opacity-50">
        <GifDecoration name="fire" alt="" width={72} height={72} />
      </div>

      <div className="relative z-10 max-w-3xl text-center flex flex-col items-center gap-6 animate-flicker">
        <span className="text-xs uppercase tracking-[0.3em] text-blood-light border border-blood/40 px-4 py-1 rounded-full">
          Segnalazione &amp; Revisione Manuale
        </span>

        <h1 className="font-display text-4xl md:text-6xl text-fog leading-tight">
          Ogni traccia resta.
                    <br />
          Ogni errore pesa.
        </h1>

        <p className="text-ash-light max-w-xl text-base md:text-lg">
Il luogo più silenzioso della community, dove nulla resta nascosto e ogni nome può emergere.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Button href="/segnalazione/nuova" variant="primary">
            Invia una segnalazione
          </Button>
          <Button href="/verifica-stato" variant="ghost">
            Verifica lo stato
          </Button>
        </div>
      </div>
    </section>
  );
}