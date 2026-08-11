import FaqAccordion from "@/components/home/FaqAccordion";

export const metadata = {
  title: "FAQ — Mossad",
};

export default function FaqPage() {
  return (
    <section className="max-w-4xl mx-auto px-5 py-20 min-h-[70vh]">
      <div className="text-center mb-14">
        <h1 className="font-display text-4xl text-fog mb-3">
          Domande frequenti
        </h1>
        <p className="text-ash-light max-w-xl mx-auto">
          Tutto quello che serve sapere sul funzionamento della piattaforma.
        </p>
      </div>
      <FaqAccordion />
    </section>
  );
}