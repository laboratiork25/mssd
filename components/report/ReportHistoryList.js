import Card from "../ui/Card";
import ReportStatusBadge from "./ReportStatusBadge";

export default function ReportHistoryList({ reports = [] }) {
  if (!reports.length) {
    return (
      <Card className="text-center py-10">
        <h3 className="font-display text-2xl text-fog mb-3">
          Nessuna segnalazione presente
        </h3>
        <p className="text-ash-light max-w-md mx-auto">
          Quando invierai la tua prima pratica, apparirà qui con stato,
          categoria e data di apertura.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      {reports.map((report) => (
        <Card key={report.caseId} className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-ash">
                Pratica
              </p>
              <h3 className="font-display text-2xl text-fog">
                {report.title}
              </h3>
              <div className="flex flex-wrap gap-3 text-sm text-ash-light">
                <span>Case ID: {report.caseId}</span>
                <span>Categoria: {report.category}</span>
                <span>Gravità: {report.severity}</span>
              </div>
              <p className="text-sm text-ash max-w-2xl leading-relaxed">
                {report.description}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3">
              <ReportStatusBadge status={report.status} />
              <p className="text-xs text-ash">
                Apertura:{" "}
                {new Date(report.createdAt).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}