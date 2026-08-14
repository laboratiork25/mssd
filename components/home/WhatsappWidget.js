import ImageFallback from "@/components/media/ImageFallback";
import GifDecoration from "@/components/media/GifDecoration";
import Button from "@/components/ui/Button";

const WHATSAPP_RESERVE_URL =
  "https://chat.whatsapp.com/CIpbcTcJz7Y2W0Rxo0xCPq?s=cl&p=i&mlu=0&ilr=0&amv=2";

const TELEGRAM_GROUP_URL = "https://t.me/+qOoRDbs1YUo5ZmQ0";

export default function WhatsappWidget() {
  const primaryWhatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || "#";

  return (
    <section className="max-w-4xl mx-auto px-5 py-24">
      <div className="ritual-card relative overflow-hidden p-8 md:p-10">
        <div className="absolute -right-6 -bottom-6 opacity-20 hidden md:block">
          <GifDecoration name="ritual" alt="" width={140} height={140} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-6">
            <ImageFallback
              src="/media/images/logo.png"
              alt="Mossad Community"
              width={72}
              height={72}
              className="rounded-full ritual-border flex-shrink-0"
            />

            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.22em] text-blood-light mb-2">
                Community
              </p>
              <h3 className="font-display text-2xl text-fog mb-2">
                Entra nei gruppi ufficiali
              </h3>
              <p className="text-ash-light text-sm md:text-base">
                Scegli il canale più adatto per aggiornamenti, eventi e
                comunicazioni della community.
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-ash/20 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-blood-light mb-2">
                WhatsApp
              </p>
              <h4 className="font-display text-xl text-fog mb-2">
                Gruppo ufficiale
              </h4>
              <p className="min-h-[48px] text-sm leading-relaxed text-ash-light mb-4">
                Aggiornamenti principali, avvisi e comunicazioni della community.
              </p>
              <Button
                href={primaryWhatsappUrl}
                variant="primary"
                className="w-full justify-center"
              >
                Entra nel gruppo
              </Button>
            </div>

            <div className="rounded-xl border border-ash/20 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-ash mb-2">
                WhatsApp
              </p>
              <h4 className="font-display text-xl text-fog mb-2">
                Gruppo riserva
              </h4>
              <p className="min-h-[48px] text-sm leading-relaxed text-ash-light mb-4">
                Canale alternativo da usare in caso di chiusura, limiti o problemi nel gruppo principale.
              </p>
              <Button
                href={WHATSAPP_RESERVE_URL}
                variant="secondary"
                className="w-full justify-center"
              >
                Apri la riserva
              </Button>
            </div>

            <div className="rounded-xl border border-ash/20 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#53a8e8] mb-2">
                Telegram
              </p>
              <h4 className="font-display text-xl text-fog mb-2">
                Cellula Mossad
              </h4>
              <p className="min-h-[48px] text-sm leading-relaxed text-ash-light mb-4">
                Spazio Telegram per aggiornamenti rapidi, confronto e condivisione degli eventi.
              </p>
              <Button
                href={TELEGRAM_GROUP_URL}
                variant="secondary"
                className="w-full justify-center"
              >
                Apri Telegram
              </Button>
            </div>
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-ash">
            Usa esclusivamente i link ufficiali presenti in questa sezione.
            Non condividere dati personali o dettagli sensibili delle segnalazioni nei gruppi pubblici.
          </p>
        </div>
      </div>
    </section>
  );
}