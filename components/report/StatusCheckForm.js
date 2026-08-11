"use client";

import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ReportStatusBadge from "./ReportStatusBadge";

export default function StatusCheckForm() {
  const [caseId, setCaseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");
    setResult(null);

    if (!caseId.trim()) {
      setFeedback("Inserisci l'ID pratica per continuare.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/reports/status-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Pratica non trovata.");
      }

      setResult(data.report);
    } catch (error) {
      setFeedback(error.message || "Errore durante la verifica.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl text-fog mb-3">
          Verifica stato pratica
        </h1>
        <p className="text-ash-light mb-8">
          Inserisci l&apos;ID pratica ricevuto al momento dell&apos;invio. Il
          sito mostra solo lo stato e le eventuali date associate, senza
          esporre dettagli sensibili della segnalazione.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="ID pratica"
            name="caseId"
            value={caseId}
            onChange={(event) => setCaseId(event.target.value)}
            placeholder="Es. MOSS-2026-AB12CD"
            required
          />

          {feedback && (
            <p className="text-sm text-ash-light">{feedback}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Verifica in corso..." : "Controlla stato"}
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-ash mb-2">
                Pratica verificata
              </p>
              <h2 className="font-display text-3xl text-fog">
                {result.title}
              </h2>
              <p className="text-xs text-ash mt-1">
                ID pratica: <code>{result.caseId}</code>
              </p>
            </div>
            <ReportStatusBadge status={result.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="ritual-border rounded-lg p-4 bg-black/20">
              <p className="text-xs uppercase tracking-widest text-ash mb-2">
                Categoria
              </p>
              <p className="text-fog">{result.category}</p>
            </div>

            <div className="ritual-border rounded-lg p-4 bg-black/20">
              <p className="text-xs uppercase tracking-widest text-ash mb-2">
                Ultimo aggiornamento
              </p>
              <p className="text-fog">
                {result.updatedAt
                  ? new Date(result.updatedAt).toLocaleString("it-IT")
                  : "Non disponibile"}
              </p>
            </div>
          </div>

          <p className="text-ash-light text-sm mt-5">
            Per tutela della riservatezza, questa vista mostra solo lo stato e
            le informazioni basilari associate alla pratica. Per dettagli
            ulteriori, il team contatterà direttamente i recapiti forniti.
          </p>
        </Card>
      )}
    </div>
  );
}