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

  function renderStatusDescription(status) {
    switch (status) {
      case "nuova":
        return "La pratica è stata ricevuta e messa in coda per una prima revisione formale.";
      case "in_revisione":
        return "La pratica è in analisi da parte del team interno. Potrebbero essere richiesti chiarimenti ai recapiti forniti.";
      case "confermata":
        return "La pratica è stata valutata come fondata rispetto ai criteri interni della piattaforma.";
      case "respinta":
        return "La pratica non è stata ritenuta fondata o sufficientemente verificabile sulla base delle informazioni disponibili.";
      case "chiusa":
        return "La pratica è stata chiusa dal team. Non sono previsti ulteriori passaggi su questo ID.";
      case "evento_programmato":
        return "È stato fissato un evento collegato a questa pratica (es. call o approfondimento interno) nella data e ora indicate.";
      default:
        return "La pratica è registrata nel sistema. Lo stato dettagliato è in aggiornamento interno.";
    }
  }

  function renderEventInfo(report) {
    if (!report.eventDate && !report.eventTime) return null;

    return (
      <div className="ritual-border rounded-lg p-4 bg-black/25 mt-4">
        <p className="text-xs uppercase tracking-widest text-ash mb-2">
          Evento programmato
        </p>
        <p className="text-sm text-fog">
          Data:{" "}
          <span className="font-medium">
            {report.eventDate}
          </span>{" "}
          · Ora:{" "}
          <span className="font-medium">
            {report.eventTime}
          </span>
        </p>
        <p className="text-xs text-ash-light mt-2">
          Questo evento è registrato internamente e non viene esposto in modo pubblico. 
          Eventuali dettagli operativi vengono gestiti direttamente dal team.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl text-fog mb-3">
          Verifica stato pratica
        </h1>
        <p className="text-ash-light mb-8">
          Inserisci l&apos;ID pratica ricevuto al momento dell&apos;invio. Questa pagina mostra 
          esclusivamente lo stato e le eventuali date associate (come ultimi aggiornamenti o eventi), 
          senza esporre contenuti sensibili della segnalazione.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="ID pratica"
            name="caseId"
            value={caseId}
            onChange={(event) => setCaseId(event.target.value)}
            placeholder="Es. MOSS-2026-ABC1234"
            required
          />

          {feedback && (
            <p className="text-sm text-blood-light">{feedback}</p>
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
                ID pratica:{" "}
                <code className="text-ash-light">
                  {result.caseId}
                </code>
              </p>
            </div>
            <ReportStatusBadge status={result.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="ritual-border rounded-lg p-4 bg-black/20">
              <p className="text-xs uppercase tracking-widest text-ash mb-2">
                Stato attuale
              </p>
              <p className="text-fog mb-1">
                {result.status}
              </p>
              <p className="text-xs text-ash-light">
                {renderStatusDescription(result.status)}
              </p>
            </div>

            <div className="ritual-border rounded-lg p-4 bg-black/20">
              <p className="text-xs uppercase tracking-widest text-ash mb-2">
                Ultimo aggiornamento interno
              </p>
              <p className="text-fog">
                {result.updatedAt
                  ? new Date(result.updatedAt).toLocaleString("it-IT")
                  : "Non disponibile"}
              </p>
              <p className="text-xs text-ash-light mt-2">
                Indica l&apos;ultimo momento in cui la pratica è stata toccata dal team 
                (cambio di stato o registrazione di un evento).
              </p>
            </div>
          </div>

          {renderEventInfo(result)}

          <p className="text-ash-light text-sm mt-5">
            Per tutela della riservatezza, questa vista mostra solo lo stato sintetico 
            e le informazioni temporali collegate. Qualsiasi decisione operativa o richiesta 
            di chiarimenti avviene esclusivamente tramite i recapiti forniti nella segnalazione 
            e non attraverso il sito pubblico.
          </p>
        </Card>
      )}
    </div>
  );
}