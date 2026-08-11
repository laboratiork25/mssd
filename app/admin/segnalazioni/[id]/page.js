import ReportDetailPanel from "../../../../components/admin/ReportDetailPanel";
import StatusChanger from "../../../../components/admin/StatusChanger";
import InternalNotes from "../../../../components/admin/InternalNotes";

const mockReport = {
  _id: "1",
  caseId: "MOSS-2026-A13DKL",
  title: "Segnalazione comportamento reiterato",
  category: "comportamento",
  severity: "media",
  reportedIdentifier: "@utente_a",
  optionalContact: "utente.segnalante@email.it",
  description:
    "La pratica riguarda una serie di interazioni ritenute problematiche all'interno della community. Sono stati allegati riferimenti temporali, screenshot e descrizioni contestuali utili alla revisione interna. Il contenuto è in fase di valutazione da parte dello staff e non è oggetto di pubblicazione esterna.",
  evidence: [
    "https://example.com/screenshot-1.png",
    "https://example.com/raccolta-prove.pdf",
  ],
  status: "in_revisione",
  createdAt: "2026-07-01T11:20:00.000Z",
};

const mockNotes = [
  {
    _id: "n1",
    authorName: "Admin Prime",
    text: "Prima verifica completata. Il materiale allegato appare coerente e leggibile.",
    createdAt: "2026-07-02T10:15:00.000Z",
  },
  {
    _id: "n2",
    authorName: "Admin Review",
    text: "Richiesto approfondimento interno su alcuni riferimenti temporali presenti nella descrizione.",
    createdAt: "2026-07-03T18:42:00.000Z",
  },
];

export async function generateMetadata({ params }) {
  const { id } = await params;

  return {
    title: `Pratica ${id} — Admin Mossad`,
  };
}

export default async function AdminReportDetailPage() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-20 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-ash mb-2">
          Revisione pratica
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-6">
        <ReportDetailPanel report={mockReport} />

        <div className="space-y-6">
          <StatusChanger
            reportId={mockReport._id}
            currentStatus={mockReport.status}
          />
          <InternalNotes
            reportId={mockReport._id}
            initialNotes={mockNotes}
          />
        </div>
      </div>
    </section>
  );
}