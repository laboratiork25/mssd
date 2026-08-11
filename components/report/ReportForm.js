"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Card from "../ui/Card";
import EvidenceUploader from "./EvidenceUploader";

const categoryOptions = [
  { value: "comportamento", label: "Comportamento" },
  { value: "spam", label: "Spam" },
  { value: "molestie", label: "Molestie" },
  { value: "truffa", label: "Truffa" },
  {
    value: "immagini_intime_non_consensuali",
    label: "Immagini intime condivise senza consenso",
  },
  { value: "altro", label: "Altro" },
];

const severityOptions = [
  { value: "bassa", label: "Bassa" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
];

const reporterRoleOptions = [
  { value: "vittima", label: "Sono la vittima diretta" },
  { value: "terzo", label: "Segnalo per conto di un'altra persona" },
];

// ---------------------------------------------------------------------------
// Validazione rigorosa: email RFC-like + numeri di telefono normalizzati.
// Blocca placeholder ovvi, sequenze ripetute, TLD inesistenti/troppo corti,
// numeri troppo corti/lunghi o composti da cifre ripetute (es. 0000000000).
// ---------------------------------------------------------------------------

const EMAIL_REGEX =
  /^(?!.*\.\.)[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]{0,63})@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?){1,}$/;

const DISPOSABLE_OR_FAKE_DOMAINS = new Set([
  "test.com",
  "example.com",
  "mailinator.com",
  "yopmail.com",
  "temp-mail.org",
  "fake.com",
  "asd.com",
  "aaa.com",
  "prova.it",
  "example.it",
]);

function isValidEmail(value) {
  const trimmed = value.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmed)) return false;

  const [local, domain] = trimmed.split("@");
  if (!local || !domain) return false;

  // Blocca TLD finale troppo corto o non alfabetico
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) return false;

  // Blocca domini fake/disposable noti
  if (DISPOSABLE_OR_FAKE_DOMAINS.has(domain)) return false;

  // Blocca parti locali "ovvie" tipo test, asd, aaaa, 1234
  if (/^(test|asd|aaa+|123+|xxx+|prova|fake|admin)$/i.test(local)) {
    return false;
  }

  // Blocca caratteri ripetuti eccessivamente (es. "aaaaaaa@dominio.com")
  if (/^(.)\1{4,}$/.test(local)) return false;

  return true;
}

function isValidPhone(value) {
  const normalized = value.replace(/[()\s.-]/g, "");

  // Deve essere solo cifre con eventuale + iniziale, 8-15 cifre (E.164-ish)
  if (!/^\+?[1-9][0-9]{7,14}$/.test(normalized)) return false;

  const digitsOnly = normalized.replace(/^\+/, "");

  // Blocca sequenze evidentemente finte: tutte cifre uguali o progressione lineare
  if (/^(\d)\1+$/.test(digitsOnly)) return false;
  if (/^0123456789|^1234567890|^9876543210$/.test(digitsOnly)) return false;

  return true;
}

function isValidContact(value) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return isValidEmail(trimmed) || isValidPhone(trimmed);
}

function getContactHint(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.includes("@")) {
    return isValidEmail(trimmed)
      ? "Email valida."
      : "Formato email non valido o dominio non attendibile.";
  }
  return isValidPhone(trimmed)
    ? "Numero valido."
    : "Formato numero non valido (usa +prefisso e 8-15 cifre reali).";
}

export default function ReportForm() {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    severity: "",
    reportedIdentifier: "",
    reporterRole: "",
    reporterContact: "",
    victimContact: "",
    evidenceText: "",
    privacyConsent: false,
    accuracyConsent: false,
  });

  const [mediaUrls, setMediaUrls] = useState([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState(null);
  const [touched, setTouched] = useState({});
  const videoRef = useRef(null);

  useEffect(() => {
    // Forza il play su alcuni browser mobile che bloccano l'autoplay iniziale
    if (videoRef.current) {
      const p = videoRef.current.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  }, []);

  const evidenceList = useMemo(() => {
    return form.evidenceText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [form.evidenceText]);

  const isThirdPartyReport = form.reporterRole === "terzo";
  const isSensitiveCategory =
    form.category === "immagini_intime_non_consensuali";

  const reporterContactValid =
    !touched.reporterContact ||
    !form.reporterContact ||
    isValidContact(form.reporterContact);

  const victimContactValid =
    !touched.victimContact ||
    !form.victimContact ||
    isValidContact(form.victimContact);

  function updateField(name, value) {
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function markTouched(name) {
    setTouched((previous) => ({ ...previous, [name]: true }));
  }

  function validate() {
    if (!form.title.trim() || form.title.trim().length < 4) {
      return "Inserisci un titolo chiaro di almeno 4 caratteri.";
    }

    if (!form.category) {
      return "Seleziona una categoria per la segnalazione.";
    }

    if (!form.description.trim() || form.description.trim().length < 30) {
      return "La descrizione deve essere chiara e lunga almeno 30 caratteri.";
    }

    if (!form.severity) {
      return "Seleziona il livello di gravità.";
    }

    if (!form.reportedIdentifier.trim()) {
      return "Inserisci nickname, username o numero della persona segnalata.";
    }

    if (!form.reporterRole) {
      return "Indica se sei la vittima diretta o un terzo segnalante.";
    }

    if (!form.reporterContact.trim()) {
      return "Inserisci un recapito email o numero di telefono valido.";
    }

    if (!isValidContact(form.reporterContact)) {
      return "Il recapito del segnalante non è valido. Inserisci un'email reale o un numero di telefono corretto (niente placeholder o numeri finti).";
    }

    if (isThirdPartyReport && !form.victimContact.trim()) {
      return "Se segnali per conto di terzi, il recapito della vittima è obbligatorio.";
    }

    if (isThirdPartyReport && !isValidContact(form.victimContact)) {
      return "Il recapito della vittima non è valido. Inserisci un'email reale o un numero di telefono corretto.";
    }

    if (!form.privacyConsent) {
      return "Devi accettare l'informativa sulla riservatezza per procedere.";
    }

    if (!form.accuracyConsent) {
      return "Devi confermare che le informazioni inviate sono veritiere e pertinenti.";
    }

    if (isUploadingMedia) {
      return "Attendi il completamento dell'upload dei media prima di inviare la segnalazione.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");
    setResult(null);

    setTouched((previous) => ({
      ...previous,
      reporterContact: true,
      victimContact: true,
    }));

    const validationError = validate();

    if (validationError) {
      setFeedback(validationError);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim(),
          severity: form.severity,
          reportedIdentifier: form.reportedIdentifier.trim(),
          reporterRole: form.reporterRole,
          reporterContact: form.reporterContact.trim(),
          victimContact: isThirdPartyReport ? form.victimContact.trim() : "",
          evidence: [...evidenceList, ...mediaUrls],
          privacyConsent: form.privacyConsent,
          accuracyConsent: form.accuracyConsent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invio della segnalazione non riuscito.");
      }

      setResult(data);
      setFeedback("Segnalazione inviata correttamente al team di revisione.");

      setForm({
        title: "",
        category: "",
        description: "",
        severity: "",
        reportedIdentifier: "",
        reporterRole: "",
        reporterContact: "",
        victimContact: "",
        evidenceText: "",
        privacyConsent: false,
        accuracyConsent: false,
      });

      setTouched({});
      setMediaUrls([]);
    } catch (error) {
      setFeedback(
        error.message || "Errore imprevisto durante l'invio della segnalazione."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* ------------------------------------------------------------------ */}
      {/* BANNER ANIMATO SATANICO - video mp4 importato da /public          */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-xl border-2 border-blood/60 shadow-[0_0_35px_rgba(139,0,0,0.55)] satanic-banner">
        <img
  src="/media/gifs/banner.gif"
  alt="Banner animato"
  className="w-full h-56 md:h-72 object-cover opacity-80 mix-blend-screen"
/>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 pointer-events-none satanic-flicker-overlay" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="uppercase tracking-[0.4em] text-xs text-blood-light satanic-flicker-text mb-2">
            Ingresso riservato
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-fog satanic-glitch">
            Camera delle Segnalazioni
          </h2>
        </div>

        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-blood shadow-[0_0_15px_3px_rgba(139,0,0,0.8)] satanic-pulse-bar" />
      </div>

      <Card className="max-w-3xl mx-auto satanic-card-glow">
        <div className="mb-8 relative">
          <p className="text-xs uppercase tracking-[0.25em] text-blood-light mb-3 satanic-flicker-text">
            Invio riservato
          </p>

          <h1 className="font-display text-4xl text-fog mb-3 satanic-glitch">
            Nuova segnalazione
          </h1>

          <p className="text-ash-light leading-relaxed">
            Compila ogni sezione con informazioni precise, oggettive e
            verificabili. La segnalazione viene inoltrata in forma riservata al
            team di revisione: non è una pubblicazione pubblica e non produce
            conseguenze automatiche.
          </p>
        </div>

        <div className="mb-8 rounded-lg border border-blood/30 bg-bordeaux/10 p-4 satanic-border-pulse">
          <p className="text-xs uppercase tracking-[0.22em] text-blood-light mb-2">
            Avviso importante
          </p>

          <p className="text-sm leading-relaxed text-ash-light">
            Le segnalazioni con recapiti falsi, incompleti, non verificabili,
            informazioni intenzionalmente fuorvianti o materiale non pertinente
            potrebbero non essere prese in considerazione. Invia solo elementi
            necessari alla revisione e non condividere dati sensibili superflui.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Titolo della segnalazione"
            name="title"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Breve titolo identificativo della pratica"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              label="Categoria"
              name="category"
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              options={categoryOptions}
              required
            />

            <Select
              label="Livello di gravità"
              name="severity"
              value={form.severity}
              onChange={(event) => updateField("severity", event.target.value)}
              options={severityOptions}
              required
            />
          </div>

          {isSensitiveCategory && (
            <div className="rounded-lg border border-blood/40 bg-black/30 p-4 satanic-border-pulse">
              <p className="text-sm font-medium text-fog mb-2">
                Tutela dei contenuti sensibili
              </p>

              <p className="text-sm leading-relaxed text-ash-light">
                Non caricare immagini o video intimi, sessuali o espliciti.
                Inserisci soltanto contesto, riferimenti, screenshot non
                espliciti, URL di segnalazione o informazioni utili al team per
                avviare una revisione riservata.
              </p>
            </div>
          )}

          <Textarea
            label="Descrizione dei fatti"
            name="description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Descrivi i fatti in modo ordinato: cosa è successo, quando, dove e quali elementi possono aiutare una revisione."
            rows={8}
            required
          />

          <Input
            label="Nickname, username o numero segnalato"
            name="reportedIdentifier"
            value={form.reportedIdentifier}
            onChange={(event) =>
              updateField("reportedIdentifier", event.target.value)
            }
            placeholder="Esempio: @nickname oppure +39..."
            required
          />

          <fieldset className="rounded-lg border border-ash/20 bg-black/20 p-4">
            <legend className="px-2 text-sm text-ash-light">
              Ruolo del segnalante
            </legend>

            <p className="mb-4 text-sm text-ash">
              Indica il tuo rapporto con il caso, così il team può valutare
              correttamente i contatti necessari.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reporterRoleOptions.map((option) => {
                const selected = form.reporterRole === option.value;

                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-lg border p-4 transition-all duration-300 ${
                      selected
                        ? "border-blood/60 bg-bordeaux/15 satanic-selected-pulse"
                        : "border-ash/20 bg-carbone/30 hover:border-blood/50 hover:shadow-[0_0_12px_rgba(139,0,0,0.4)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reporterRole"
                      value={option.value}
                      checked={selected}
                      onChange={(event) =>
                        updateField("reporterRole", event.target.value)
                      }
                      className="sr-only"
                    />

                    <span className="block text-sm text-fog">
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <Input
              label="Tuo recapito obbligatorio"
              name="reporterContact"
              value={form.reporterContact}
              onChange={(event) =>
                updateField("reporterContact", event.target.value)
              }
              onBlur={() => markTouched("reporterContact")}
              placeholder="Email valida oppure numero di telefono (es. +390612345678)"
              required
              className={
                !reporterContactValid ? "border-blood ring-1 ring-blood" : ""
              }
            />

            {touched.reporterContact && form.reporterContact && (
              <p
                className={`mt-1 text-xs ${
                  reporterContactValid ? "text-emerald-400/80" : "text-blood-light"
                }`}
              >
                {getContactHint(form.reporterContact)}
              </p>
            )}
          </div>

          <p className="-mt-3 text-xs text-ash">
            Il recapito serve esclusivamente se il team deve chiedere
            chiarimenti sulla segnalazione. Numeri o email fittizie vengono
            respinti automaticamente.
          </p>

          {isThirdPartyReport && (
            <div className="rounded-lg border border-blood/30 bg-bordeaux/5 p-4 space-y-4 satanic-border-pulse">
              <div>
                <p className="text-sm text-fog mb-1">Recapito della vittima</p>
                <p className="text-xs text-ash-light">
                  Essendo una segnalazione per conto terzi, fornisci un contatto
                  email o telefonico della persona coinvolta, se autorizzato e
                  necessario alla revisione.
                </p>
              </div>

              <div>
                <Input
                  label="Contatto della vittima"
                  name="victimContact"
                  value={form.victimContact}
                  onChange={(event) =>
                    updateField("victimContact", event.target.value)
                  }
                  onBlur={() => markTouched("victimContact")}
                  placeholder="Email valida oppure numero di telefono"
                  required
                  className={
                    !victimContactValid ? "border-blood ring-1 ring-blood" : ""
                  }
                />

                {touched.victimContact && form.victimContact && (
                  <p
                    className={`mt-1 text-xs ${
                      victimContactValid
                        ? "text-emerald-400/80"
                        : "text-blood-light"
                    }`}
                  >
                    {getContactHint(form.victimContact)}
                  </p>
                )}
              </div>
            </div>
          )}

          <Textarea
            label="Link o riferimenti esterni"
            name="evidenceText"
            value={form.evidenceText}
            onChange={(event) => updateField("evidenceText", event.target.value)}
            placeholder="Inserisci un URL o riferimento per riga. Aggiungi solo elementi pertinenti."
            rows={5}
          />

          <EvidenceUploader
            value={mediaUrls}
            onChange={setMediaUrls}
            onUploadingChange={setIsUploadingMedia}
          />

          <div className="space-y-4 rounded-lg border border-ash/20 bg-black/20 p-4">
            <label className="flex items-start gap-3 text-sm text-ash-light cursor-pointer">
              <input
                type="checkbox"
                checked={form.privacyConsent}
                onChange={(event) =>
                  updateField("privacyConsent", event.target.checked)
                }
                className="mt-1 accent-[#6b1220]"
              />

              <span>
                Confermo di aver letto l&apos;informativa interna e autorizzo
                il trattamento riservato dei dati strettamente necessari alla
                revisione della pratica.
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-ash-light cursor-pointer">
              <input
                type="checkbox"
                checked={form.accuracyConsent}
                onChange={(event) =>
                  updateField("accuracyConsent", event.target.checked)
                }
                className="mt-1 accent-[#6b1220]"
              />

              <span>
                Dichiaro che le informazioni inserite sono fornite in buona
                fede, sono pertinenti alla segnalazione e che i recapiti
                forniti sono validi. Comprendo che dati falsi, incompleti o non
                verificabili possono comportare la non presa in carico della
                pratica.
              </span>
            </label>
          </div>

          {feedback && (
            <div
              className="rounded-lg border border-blood/40 bg-black/20 px-4 py-3 satanic-border-pulse"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm text-ash-light">{feedback}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full md:w-auto satanic-button-glow"
            disabled={loading || isUploadingMedia}
          >
            {isUploadingMedia
              ? "Caricamento media in corso..."
              : loading
                ? "Invio in corso..."
                : "Invia segnalazione"}
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="max-w-3xl mx-auto border border-blood/40 satanic-card-glow">
          <h2 className="font-display text-3xl text-fog mb-4 satanic-glitch">
            Segnalazione inoltrata
          </h2>

          <p className="text-ash-light mb-5">
            La pratica è stata inoltrata al team di revisione interno.
            Conserva il codice pratica se devi fare riferimento alla
            segnalazione in futuro.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="ritual-border rounded-lg p-4 bg-black/20">
              <p className="text-xs uppercase tracking-widest text-ash mb-2">
                ID pratica
              </p>
              <p className="text-fog break-all">{result.caseId}</p>
            </div>

            {result.accessCode && (
              <div className="ritual-border rounded-lg p-4 bg-black/20">
                <p className="text-xs uppercase tracking-widest text-ash mb-2">
                  Codice di riferimento
                </p>
                <p className="text-fog break-all">{result.accessCode}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STILI ANIMATI SATANICI                                            */}
      {/* ------------------------------------------------------------------ */}
      <style jsx global>{`
        @keyframes satanic-flicker {
          0%, 100% { opacity: 1; }
          8% { opacity: 0.4; }
          10% { opacity: 1; }
          20% { opacity: 0.7; }
          22% { opacity: 1; }
          55% { opacity: 0.85; }
          58% { opacity: 1; }
        }

        @keyframes satanic-glitch-anim {
          0%, 100% {
            text-shadow: 0 0 8px rgba(139, 0, 0, 0.9), 0 0 18px rgba(139, 0, 0, 0.6);
            transform: translate(0, 0);
          }
          20% {
            text-shadow: -2px 0 rgba(255, 0, 0, 0.8), 2px 0 rgba(0, 0, 0, 0.8);
            transform: translate(-1px, 0);
          }
          40% {
            text-shadow: 2px 0 rgba(139, 0, 0, 0.9), -2px 0 rgba(0,0,0,0.6);
            transform: translate(1px, 0);
          }
          60% {
            text-shadow: 0 0 12px rgba(139, 0, 0, 1);
            transform: translate(0, 0);
          }
        }

        @keyframes satanic-pulse-border {
          0%, 100% {
            box-shadow: 0 0 4px rgba(139, 0, 0, 0.3);
            border-color: rgba(139, 0, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 22px rgba(139, 0, 0, 0.75);
            border-color: rgba(139, 0, 0, 0.8);
          }
        }

        @keyframes satanic-pulse-bar-anim {
          0%, 100% { opacity: 0.5; transform: scaleX(0.96); }
          50% { opacity: 1; transform: scaleX(1); }
        }

        @keyframes satanic-card-glow-anim {
          0%, 100% { box-shadow: 0 0 12px rgba(139, 0, 0, 0.15); }
          50% { box-shadow: 0 0 32px rgba(139, 0, 0, 0.4); }
        }

        @keyframes satanic-button-glow-anim {
          0%, 100% {
            box-shadow: 0 0 8px rgba(139, 0, 0, 0.5);
            filter: brightness(1);
          }
          50% {
            box-shadow: 0 0 24px rgba(255, 0, 0, 0.85);
            filter: brightness(1.15);
          }
        }

        @keyframes satanic-flicker-overlay-anim {
          0%, 92%, 100% { opacity: 0; }
          93% { opacity: 0.35; }
          95% { opacity: 0; }
          96% { opacity: 0.2; }
          98% { opacity: 0; }
        }

        @keyframes satanic-selected-pulse-anim {
          0%, 100% { box-shadow: 0 0 6px rgba(139, 0, 0, 0.4); }
          50% { box-shadow: 0 0 18px rgba(139, 0, 0, 0.85); }
        }

        .satanic-flicker-text {
          animation: satanic-flicker 4.5s infinite;
        }

        .satanic-glitch {
          animation: satanic-glitch-anim 3.2s infinite;
        }

        .satanic-border-pulse {
          animation: satanic-pulse-border 3.5s infinite;
        }

        .satanic-pulse-bar {
          animation: satanic-pulse-bar-anim 2.2s infinite ease-in-out;
        }

        .satanic-card-glow {
          animation: satanic-card-glow-anim 5s infinite;
        }

        .satanic-button-glow {
          animation: satanic-button-glow-anim 2.4s infinite;
        }

        .satanic-selected-pulse {
          animation: satanic-selected-pulse-anim 2s infinite;
        }

        .satanic-flicker-overlay {
          background: radial-gradient(circle, rgba(139,0,0,0.5), transparent 70%);
          animation: satanic-flicker-overlay-anim 6s infinite;
        }

        .satanic-banner {
          transition: transform 0.4s ease;
        }

        .satanic-banner:hover {
          transform: scale(1.01);
        }
      `}</style>
    </div>
  );
}