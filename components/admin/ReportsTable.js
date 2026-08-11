import Link from "next/link";
import ReportStatusBadge from "../report/ReportStatusBadge";

export default function ReportsTable({ reports = [] }) {
  if (!reports.length) {
    return (
      <div className="ritual-card p-6 text-ash-light">
        Nessuna segnalazione corrisponde ai filtri selezionati.
      </div>
    );
  }

  return (
    <div className="ritual-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-ash-light">
          <thead className="bg-black/20 text-xs uppercase tracking-[0.2em] text-ash">
            <tr>
              <th className="px-4 py-3">Pratica</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Gravità</th>
              <th className="px-4 py-3">Identificativo</th>
              <th className="px-4 py-3">Stato</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id} className="border-t border-ash/10 hover:bg-carbone/30">
                <td className="px-4 py-4 align-top">
                  <Link
                    href={`/admin/segnalazioni/${report._id}`}
                    className="font-medium text-fog hover:text-blood-light transition-colors"
                  >
                    {report.title}
                  </Link>
                  <div className="mt-1 text-xs text-ash">{report.caseId}</div>
                </td>
                <td className="px-4 py-4 align-top">{report.category}</td>
                <td className="px-4 py-4 align-top">{report.severity}</td>
                <td className="px-4 py-4 align-top">{report.reportedIdentifier}</td>
                <td className="px-4 py-4 align-top">
                  <ReportStatusBadge status={report.status} />
                </td>
                <td className="px-4 py-4 align-top">
                  {new Date(report.createdAt).toLocaleDateString("it-IT")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
