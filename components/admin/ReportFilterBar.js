"use client";

import Select from "../ui/Select";
import Input from "../ui/Input";
import Button from "../ui/Button";

const statusOptions = [
  { value: "nuova", label: "Nuova" },
  { value: "in_revisione", label: "In revisione" },
  { value: "confermata", label: "Confermata" },
  { value: "respinta", label: "Respinta" },
  { value: "chiusa", label: "Chiusa" },
];

const severityOptions = [
  { value: "bassa", label: "Bassa" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
];

export default function ReportFilterBar({
  filters,
  setFilters,
  onReset,
}) {
  return (
    <div className="ritual-card p-5 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <Input
        label="Ricerca"
        name="search"
        value={filters.search}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, search: e.target.value }))
        }
        placeholder="Titolo, case ID, identificativo..."
      />

      <Select
        label="Stato"
        name="status"
        value={filters.status}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, status: e.target.value }))
        }
        options={statusOptions}
      />

      <Select
        label="Gravità"
        name="severity"
        value={filters.severity}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, severity: e.target.value }))
        }
        options={severityOptions}
      />

      <div className="flex items-end">
        <Button
          variant="ghost"
          className="w-full"
          onClick={onReset}
        >
          Reset filtri
        </Button>
      </div>
    </div>
  );
}