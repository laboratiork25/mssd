import ImageFallback from "@/components/media/ImageFallback";
import GifDecoration from "@/components/media/GifDecoration";
import Button from "@/components/ui/Button";

export default function WhatsappWidget() {
  const groupUrl = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || "#";

  return (
    <section className="max-w-4xl mx-auto px-5 py-24">
      <div className="ritual-card relative overflow-hidden p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
        <div className="absolute -right-6 -bottom-6 opacity-20 hidden md:block">
          <GifDecoration name="ritual" alt="" width={140} height={140} />
        </div>

        <ImageFallback
          src="/media/images/logo.png"
          alt="Mossad Community"
          width={72}
          height={72}
          className="rounded-full ritual-border flex-shrink-0"
        />

        <div className="flex-1 relative z-10">
          <h3 className="font-display text-2xl text-fog mb-2">
            Community WhatsApp ufficiale
          </h3>
          <p className="text-ash-light text-sm md:text-base">
            Unisciti al gruppo ufficiale per aggiornamenti, supporto e
            confronto moderato con lo staff. Uno spazio civile, controllato e
            rispettoso.
          </p>
        </div>

        <Button href={groupUrl} variant="primary" className="flex-shrink-0">
          Entra nel gruppo
        </Button>
      </div>
    </section>
  );
}