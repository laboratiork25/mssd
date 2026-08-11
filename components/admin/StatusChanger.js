"use client";

import { useState } from "react";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Card from "../ui/Card";

const options = [
  { value: "nuova", label: "Nuova" },
  { value: "in_revisione", label: "In revisione" },
  { value: "confermata", label: "Confermata" },
  { value: "respinta", label: "Respinta" },
  { value: "chiusa", label: "Chiusa" },
];

export default function StatusChanger({ reportId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus || "nuova");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback("");

    try {
      setLoading(true);

      const res = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossibile aggiornare lo stato.");
      }

      setFeedback("Stato aggiornato con successo.");
    } catch (error) {
      setFeedback(error.message || "Errore imprevisto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h3 className="font-display text-2xl text-fog mb-4">
        Aggiorna stato pratica
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Stato attuale"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={options}
          required
        />

        <div className="flex items-center justify-between gap-4">
          {feedback ? (
            <p className="text-sm text-ash-light">{feedback}</p>
          ) : (
            <span className="text-xs text-ash">
              Ogni aggiornamento viene riflesso nella vista utente della pratica.
            </span>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Aggiornamento..." : "Salva stato"}
          </Button>
        </div>
      </form>
    </Card>
  );
}