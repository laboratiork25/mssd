"use client";

import { useMemo, useState } from "react";
import ReportFilterBar from "../../../components/admin/ReportFilterBar";
import ReportsTable from "../../../components/admin/ReportsTable";

const mockReports = [
  {
    _id: "1",
    caseId: "MOSS-2026-A13DKL",
    title: "Segnalazione comportamento reiterato",
    category: "comportamento",
    severity: "media",
    reportedIdentifier: "@utente_a",
    description: "Pratica con riferimenti contestuali e materiale testuale allegato.",
    status: "in_revisione",
    createdAt: "2026-07-01T11:20:00.000Z",
    updatedAt: "2026-07-20T16:10:00.000Z",
  },
  {
    _id: "2",
    caseId: "MOSS-2026-F92QWE",
    title: "Possibile spam in community",
    category: "spam",
    severity: "bassa",
    reportedIdentifier: "+390000000001",
    description: "Messaggi ripetitivi e non pertinenti in più momenti della giornata.",
    status: "chiusa",
    createdAt: "2026-06-11T20:12:00.000Z",
    updatedAt: "2026-06-18T10:00:00.000Z",
  },
  {
    _id: "3",
    caseId: "MOSS-2026-L77XCA",
    title: "Revenge Porn di gruppo",
    category: "Revenge_Porn",
    severity: "alta",
    reportedIdentifier: "@utente_b",
    description: "Segnalazione corredata da screenshot e riferimenti temporali chiari.",
    status: "confermata",
    createdAt: "2026-05-19T09:42:00.000Z",
    updatedAt: "2026-05-25T14:30:00.000Z",
  },
];

export default function AdminReportsPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    severity: "",
  });

  const filteredReports = useMemo(() => {
    return mockReports.filter((report) => {
      const searchable = `${report.title} ${report.caseId} ${report.reportedIdentifier}`.toLowerCase();

      const matchSearch = filters.search
        ? searchable.includes(filters.search.toLowerCase())
        : true;

      const matchStatus = filters.status
        ? report.status === filters.status
        : true;

      const matchSeverity = filters.severity
        ? report.severity === filters.severity
        : true;

      return matchSearch && matchStatus && matchSeverity;
    });
  }, [filters]);

  return (
    <section className="max-w-6xl mx-auto px-5 py-20 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-ash mb-2">
          Area admin
        </p>
        <h1 className="font-display text-4xl text-fog mb-3">
          Lista segnalazioni
        </h1>
        <p className="text-ash-light max-w-2xl">
          Monitora, filtra e apri il dettaglio delle pratiche attualmente
          presenti nel sistema di revisione.
        </p>
      </div>

      <ReportFilterBar
        filters={filters}
        setFilters={setFilters}
        onReset={() =>
          setFilters({
            search: "",
            status: "",
            severity: "",
          })
        }
      />

      <ReportsTable reports={filteredReports} />
    </section>
  );
}