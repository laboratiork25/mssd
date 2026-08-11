import ReportForm from "../../../../components/report/ReportForm";

export const metadata = {
  title: "Nuova Segnalazione — Mossad",
};

export default function NewReportPage() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-20 min-h-[70vh]">
      <ReportForm />
    </section>
  );
}