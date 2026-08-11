import Card from "@/components/ui/Card";

const steps = [
  {
    n: "I",
    title: "Invia la segnalazione",
    text: "Compila il modulo con i dettagli, allega eventuali prove e ricevi un ID pratica univoco con codice di accesso.",
  },
  {
    n: "II",
    title: "Revisione interna",
    text: "Il team amministrativo esamina la segnalazione con cura, senza esporre dati pubblicamente.",
  },
  {
    n: "III",
    title: "Verifica lo stato",
    text: "Usa ID pratica e codice di accesso per controllare l'avanzamento in qualsiasi momento.",
  },
  {
    n: "IV",
    title: "Chiusura controllata",
    text: "La pratica viene aggiornata a confermata, respinta o chiusa in base agli elementi raccolti.",
  },
];

export default function HowItWorks() {
  return (
    <section id="come-funziona" className="max-w-6xl mx-auto px-5 py-24">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-4xl text-fog mb-3">
          Come funziona
        </h2>
        <p className="text-ash-light max-w-xl mx-auto">
          Un processo lineare, tracciabile e privo di esposizione pubblica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step) => (
          <Card key={step.n} className="text-center">
            <div className="font-display text-3xl text-blood-light mb-3">
              {step.n}
            </div>
            <h3 className="font-display text-lg text-fog mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-ash-light">{step.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}