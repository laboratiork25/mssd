import Card from "../ui/Card";
import ReportStatusBadge from "../report/ReportStatusBadge";

export default function ReportDetailPanel({ report }) {
  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-ash mb-2">
              {report.caseId}
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-fog">
              {report.title}
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <ReportStatusBadge status={report.status} />
            <p className="text-xs text-ash">
              Creata il {new Date(report.createdAt).toLocaleString("it-IT")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="ritual-border rounded-lg p-4 bg-black/20">
            <p className="text-xs uppercase tracking-widest text-ash mb-2">
              Categoria
            </p>
            <p className="text-fog">{report.category}</p>
          </div>

          <div className="ritual-border rounded-lg p-4 bg-black/20">
            <p className="text-xs uppercase tracking-widest text-ash mb-2">
              Gravità
            </p>
            <p className="text-fog">{report.severity}</p>
          </div>

          <div className="ritual-border rounded-lg p-4 bg-black/20">
            <p className="text-xs uppercase tracking-widest text-ash mb-2">
              Identificativo segnalato
            </p>
            <p className="text-fog">{report.reportedIdentifier}</p>
          </div>

          <div className="ritual-border rounded-lg p-4 bg-black/20">
            <p className="text-xs uppercase tracking-widest text-ash mb-2">
              Contatto opzionale
            </p>
            <p className="text-fog">{report.optionalContact || "Non fornito"}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-2xl text-fog mb-4">Descrizione</h2>
        <p className="text-ash-light leading-relaxed whitespace-pre-line">
          {report.description}
        </p>
      </Card>

      <Card>
        <h2 className="font-display text-2xl text-fog mb-4">
          Prove, link e allegati
        </h2>

        {report.evidence?.length ? (
          <div className="space-y-3">
            {report.evidence.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="ritual-border rounded-lg px-4 py-3 bg-black/20"
              >
                <a
                  href={item}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 hover:text-sky-200 break-all transition-colors"
                >
                  {item}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ash-light text-sm">
            Nessun allegato o link associato a questa pratica.
          </p>
        )}
      </Card>
    </div>
  );
}