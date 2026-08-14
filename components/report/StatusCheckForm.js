"use client";

import { useState } from "react";
import Image from "next/image";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ReportStatusBadge from "./ReportStatusBadge";

const WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/KHDKnL0wVRu9Th7MFZ6qjr?s=cl&p=i&mlu=0&ilr=0&amv=2";

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
        return "La segnalazione è stata ricevuta e inserita in coda per la prima verifica.";
      case "in_revisione":
        return "Il team sta analizzando la pratica. Potrebbero essere richiesti chiarimenti ai recapiti forniti.";
      case "confermata":
        return "La segnalazione è stata valutata come fondata in base ai criteri interni della piattaforma.";
      case "respinta":
        return "La segnalazione non è stata ritenuta sufficientemente fondata o verificabile.";
      case "chiusa":
        return "La pratica è chiusa. Non sono previsti ulteriori aggiornamenti, salvo nuovi elementi.";
      case "evento_programmato":
        return "È stato fissato un'evento collegato a questa pratica nella data e ora indicate. Grazie per la segnalazione.";
      default:
        return "La pratica è registrata nel sistema. Lo stato è in fase di aggiornamento.";
    }
  }

  function renderEventInfo(report) {
    if (!report.eventDate && !report.eventTime) return null;

    return (
      <div className="rounded-lg border border-blood/40 bg-black/30 p-4 mt-4">
        <p className="text-xs uppercase tracking-widest text-ash mb-2">
          Evento programmato
        </p>
        <p className="text-sm text-fog">
          Data:{" "}
          <span className="font-medium">{report.eventDate}</span>{" "}
          · Ora:{" "}
          <span className="font-medium">{report.eventTime}</span>
        </p>
        <p className="text-xs text-ash-light mt-2">
          L&apos;evento è gestito internamente dal team amministrativo. Eventuali
          dettagli operativi vengono comunicati direttamente ai recapiti coinvolti.
        </p>

        <div className="mt-4 rounded-lg border border-blood/30 bg-bordeaux/10 p-4">
          <p className="text-sm text-fog font-medium mb-1">
            Vuoi restare aggiornato sugli eventi della community?
          </p>
          <p className="text-xs text-ash-light mb-3">
            Entra nel gruppo WhatsApp ufficiale Mossad per ricevere aggiornamenti,
            promemoria e condividere l&apos;evento con chi potrebbe essere interessato.
          </p>
          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Unisciti al gruppo WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto overflow-hidden">
        {/* Banner animato */}
        <div className="relative w-full h-32 md:h-40">
          <Image
            src="/media/gifs/banner2.gif"
            alt="Verifica stato pratica"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/40 to-transparent" />
        </div>

        <div className="px-6 pt-6">
          <h1 className="font-display text-4xl text-fog mb-3">
            Verifica stato pratica
          </h1>
          <p className="text-ash-light mb-8 text-sm md:text-base">
            Inserisci l&apos;ID pratica ricevuto al momento dell&apos;invio. Questa
            pagina mostra solo lo stato e le eventuali date associate, senza esporre
            i contenuti sensibili della segnalazione.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="ID pratica"
              name="caseId"
              value={caseId}
              onChange={(event) => setCaseId(event.target.value)}
              placeholder="Es. R25"
              required
            />

            {feedback && (
              <p className="text-sm text-blood-light">{feedback}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? "Verifica in corso..." : "Controlla stato"}
            </Button>
          </form>
        </div>

        <div className="h-6" />
      </Card>

      {result && (
        <Card className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-ash mb-2">
                Pratica trovata
              </p>
              <h2 className="font-display text-3xl text-fog">
                {result.title}
              </h2>
              <p className="text-xs text-ash mt-1">
                ID pratica:{" "}
                <code className="text-ash-light">{result.caseId}</code>
              </p>
            </div>
            <ReportStatusBadge status={result.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="ritual-border rounded-lg p-4 bg-black/20">
              <p className="text-xs uppercase tracking-widest text-ash mb-2">
                Stato attuale
              </p>
              <p className="text-fog mb-1">{result.status}</p>
              <p className="text-xs text-ash-light">
                {renderStatusDescription(result.status)}
              </p>
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
              <p className="text-xs text-ash-light mt-2">
                Indica l&apos;ultimo momento in cui la pratica è stata aggiornata
                dal team: cambio di stato o registrazione di un evento.
              </p>
            </div>
          </div>

          {renderEventInfo(result)}

          <p className="text-ash-light text-sm mt-5">
            Nota: il passaggio tra stati non è istantaneo. A seconda della gravità
            e del carico di segnalazioni, l&apos;aggiornamento interno può richiedere
            diverse ore (in genere entro circa 8 ore). Non serve sollecitare: se
            qualcosa richiede attenzione, il team ti contatterà direttamente ai
            recapiti indicati.
          </p>
        </Card>
      )}
    </div>
  );
}