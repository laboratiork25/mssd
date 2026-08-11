"use client";

import { useState } from "react";
import Image from "next/image";
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
        return "La pratica è stata evocata e ha varcato la soglia del sistema. È in attesa della prima lettura rituale.";
      case "in_revisione":
        return "La pratica è sul tavolo del circolo interno: i dettagli sono in analisi e potrebbero richiedere chiarimenti ai recapiti forniti.";
      case "confermata":
        return "La pratica è stata considerata fondata rispetto ai criteri interni della piattaforma. Nessuna esposizione pubblica, solo interventi mirati.";
      case "respinta":
        return "La pratica non è stata ritenuta sufficiente o verificabile per procedere oltre. Rimane archiviata, ma non genera azioni.";
      case "chiusa":
        return "Il rituale su questo ID è concluso: la pratica è chiusa e non sono previsti ulteriori passaggi, salvo riaperture straordinarie.";
      case "evento_programmato":
        return "È stato fissato un evento collegato a questa pratica (call, revisione approfondita o incontro interno) nella data e ora indicate.";
      default:
        return "La pratica è registrata nel sistema. Lo stato dettagliato è in aggiornamento interno, lontano da occhi indiscreti.";
    }
  }

  function renderEventInfo(report) {
    if (!report.eventDate && !report.eventTime) return null;

    return (
      <div className="ritual-border rounded-lg p-4 bg-black/30 mt-4">
        <p className="text-xs uppercase tracking-widest text-ash mb-2">
          Evento programmato
        </p>
        <p className="text-sm text-fog">
          Data rituale:{" "}
          <span className="font-medium">
            {report.eventDate}
          </span>{" "}
          · Ora:{" "}
          <span className="font-medium">
            {report.eventTime}
          </span>
        </p>
        <p className="text-xs text-ash-light mt-2">
          L&apos;evento è registrato solo all&apos;interno del circolo amministrativo. 
          Nessuna agenda pubblica, nessuna esposizione: gli eventuali dettagli vengono comunicati 
          direttamente ai recapiti coinvolti.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto overflow-hidden">
        {/* Banner animato satanico */}
        <div className="mb-6 -mx-6 -mt-6">
          <div className="relative h-32 md:h-40 w-full">
            <Image
              src="/media/gifs/banner2.gif"
              alt="Rituale di verifica stato"
              fill
              className="object-cover object-center opacity-80"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/40 to-transparent" />
          </div>
        </div>

        <h1 className="font-display text-4xl text-fog mb-3">
          Verifica stato pratica
        </h1>
        <p className="text-ash-light mb-8 text-sm md:text-base">
          Inserisci l&apos;ID pratica ricevuto al momento dell&apos;invio. Questa vista 
          non è una gogna pubblica, ma un semplice specchio dello stato interno: mostra solo 
          progressi, date e tracce temporali, senza mai esporre contenuti sensibili.
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
            {loading ? "Consulto in corso..." : "Interroga lo stato"}
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-ash mb-2">
                Pratica evocata
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
                Ultimo movimento interno
              </p>
              <p className="text-fog">
                {result.updatedAt
                  ? new Date(result.updatedAt).toLocaleString("it-IT")
                  : "Non disponibile"}
              </p>
              <p className="text-xs text-ash-light mt-2">
                Indica l&apos;ultima volta in cui la pratica è stata toccata: 
                cambio di stato, registrazione di evento o altra azione riservata.
              </p>
            </div>
          </div>

          {renderEventInfo(result)}

          <p className="text-ash-light text-sm mt-5">
            Nota rituale: il passaggio tra stati non è istantaneo. A seconda della gravità e del 
            carico di segnalazioni, l&apos;aggiornamento interno può richiedere diverse ore. 
            Non serve sollecitare pubblicamente: se qualcosa richiede attenzione, il circolo ti 
            contatterà direttamente ai recapiti indicati.
          </p>
        </Card>
      )}
    </div>
  );
}