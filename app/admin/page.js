import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const stats = [
  { label: "Nuove pratiche", value: 12 },
  { label: "In revisione", value: 8 },
  { label: "Confermate", value: 21 },
  { label: "Chiuse", value: 34 },
];

export const metadata = {
  title: "Dashboard Admin — Mossad",
};

export default function AdminDashboardPage() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-20 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-ash mb-2">
            Area admin
          </p>
          <h1 className="font-display text-4xl text-fog mb-3">
            Dashboard di revisione
          </h1>
          <p className="text-ash-light max-w-2xl">
            Vista operativa riservata al team di moderazione per monitorare il
            flusso delle pratiche e intervenire manualmente sui casi aperti.
          </p>
        </div>

        <div className="flex gap-3">
          <Button href="/admin/segnalazioni">Apri lista pratiche</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((item) => (
          <Card key={item.label}>
            <p className="text-xs uppercase tracking-widest text-ash mb-2">
              {item.label}
            </p>
            <p className="font-display text-4xl text-fog">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-display text-3xl text-fog mb-4">
          Stato operativo
        </h2>
        <p className="text-ash-light leading-relaxed max-w-3xl">
          L’area admin è progettata per revisione controllata, aggiornamento
          stati e gestione note interne. Nessuna informazione viene destinata
          alla pubblicazione pubblica o alla generazione automatica di sanzioni.
        </p>
      </Card>
    </section>
  );
}