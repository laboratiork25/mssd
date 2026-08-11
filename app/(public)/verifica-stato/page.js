import StatusCheckForm from "../../../components/report/StatusCheckForm";

export const metadata = {
  title: "Verifica Stato — Mossad",
};

export default function StatusCheckPage() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-20 min-h-[70vh]">
      <StatusCheckForm />
    </section>
  );
}