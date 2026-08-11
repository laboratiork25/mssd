"use client";

import { useMemo, useState } from "react";
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
  {
    value: "vittima",
    label: "Sono la vittima diretta",
  },
  {
    value: "terzo",
    label: "Segnalo per conto di un'altra persona",
  },
];

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

function isValidPhone(value) {
  const normalized = value.replace(/[()\s.-]/g, "");
  return /^\+?[0-9]{7,15}$/.test(normalized);
}

function isValidContact(value) {
  const trimmed = value.trim();
  return isValidEmail(trimmed) || isValidPhone(trimmed);
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
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState(null);

  const evidenceList = useMemo(() => {
    return form.evidenceText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [form.evidenceText]);

  const isThirdPartyReport = form.reporterRole === "terzo";
  const isSensitiveCategory =
    form.category === "immagini_intime_non_consensuali";

  function updateField(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
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
      return "Il recapito del segnalante non è valido. Inserisci un'email o un numero di telefono corretto.";
    }

    if (isThirdPartyReport && !form.victimContact.trim()) {
      return "Se segnali per conto di terzi, il recapito della vittima è obbligatorio.";
    }

    if (
      isThirdPartyReport &&
      !isValidContact(form.victimContact)
    ) {
      return "Il recapito della vittima non è valido. Inserisci un'email o un numero di telefono corretto.";
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

    if (!captchaToken) {
      return "Completa il controllo CAPTCHA prima di inviare la segnalazione.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");
    setCaptchaError("");
    setResult(null);

    const validationError = validate();

    if (validationError) {
      if (validationError.toLowerCase().includes("captcha")) {
        setCaptchaError(validationError);
      } else {
        setFeedback(validationError);
      }
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim(),
          severity: form.severity,
          reportedIdentifier: form.reportedIdentifier.trim(),
          reporterRole: form.reporterRole,
          reporterContact: form.reporterContact.trim(),
          victimContact: isThirdPartyReport
            ? form.victimContact.trim()
            : "",
          evidence: [...evidenceList, ...mediaUrls],
          privacyConsent: form.privacyConsent,
          accuracyConsent: form.accuracyConsent,
          captchaToken,
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

      setMediaUrls([]);
      setCaptchaToken("");
      setCaptchaError("");
    } catch (error) {
      setFeedback(
        error.message || "Errore imprevisto durante l'invio della segnalazione."
      );
    } finally {
      setLoading(false);
    }
  }

  // Site key per il frontend (deve essere NEXT_PUBLIC_*)
  const turnstileSiteKey =
    typeof process.env !== "undefined"
      ? (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "")
      : "";

  const isCaptchaEnabled = Boolean(turnstileSiteKey);
console.log("DEBUG Turnstile site key:", turnstileSiteKey);
console.log("DEBUG isCaptchaEnabled:", isCaptchaEnabled);
  return (
    <div className="space-y-6">
      <Card className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-blood-light mb-3">
            Invio riservato
          </p>

          <h1 className="font-display text-4xl text-fog mb-3">
            Nuova segnalazione
          </h1>

          <p className="text-ash-light leading-relaxed">
            Compila ogni sezione con informazioni precise, oggettive e
            verificabili. La segnalazione viene inoltrata in forma riservata al
            team di revisione: non è una pubblicazione pubblica e non produce
            conseguenze automatiche.
          </p>
        </div>

        <div className="mb-8 rounded-lg border border-blood/30 bg-bordeaux/10 p-4">
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
              onChange={(event) =>
                updateField("category", event.target.value)
              }
              options={categoryOptions}
              required
            />

            <Select
              label="Livello di gravità"
              name="severity"
              value={form.severity}
              onChange={(event) =>
                updateField("severity", event.target.value)
              }
              options={severityOptions}
              required
            />
          </div>

          {isSensitiveCategory && (
            <div className="rounded-lg border border-blood/40 bg-black/30 p-4">
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
            onChange={(event) =>
              updateField("description", event.target.value)
            }
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
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      selected
                        ? "border-blood/60 bg-bordeaux/15"
                        : "border-ash/20 bg-carbone/30 hover:border-ash/40"
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

          <Input
            label="Tuo recapito obbligatorio"
            name="reporterContact"
            value={form.reporterContact}
            onChange={(event) =>
              updateField("reporterContact", event.target.value)
            }
            placeholder="Email valida oppure numero di telefono"
            required
          />

          <p className="-mt-3 text-xs text-ash">
            Il recapito serve esclusivamente se il team deve chiedere
            chiarimenti sulla segnalazione.
          </p>

          {isThirdPartyReport && (
            <div className="rounded-lg border border-blood/30 bg-bordeaux/5 p-4 space-y-4">
              <div>
                <p className="text-sm text-fog mb-1">
                  Recapito della vittima
                </p>
                <p className="text-xs text-ash-light">
                  Essendo una segnalazione per conto terzi, fornisci un contatto
                  email o telefonico della persona coinvolta, se autorizzato e
                  necessario alla revisione.
                </p>
              </div>

              <Input
                label="Contatto della vittima"
                name="victimContact"
                value={form.victimContact}
                onChange={(event) =>
                  updateField("victimContact", event.target.value)
                }
                placeholder="Email valida oppure numero di telefono"
                required
              />
            </div>
          )}

          <Textarea
            label="Link o riferimenti esterni"
            name="evidenceText"
            value={form.evidenceText}
            onChange={(event) =>
              updateField("evidenceText", event.target.value)
            }
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

          {/* TURNSTILE CAPTCHA */}
          <div className="space-y-2 rounded-lg border border-ash/20 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-ash mb-1">
              Controllo CAPTCHA
            </p>

            {isCaptchaEnabled ? (
              <div
                className="cf-turnstile"
                data-sitekey={turnstileSiteKey}
                data-callback={(token) => {
                  setCaptchaToken(token);
                  setCaptchaError("");
                }}
                data-theme="dark"
              />
            ) : (
              <p className="text-xs text-blood-light">
                CAPTCHA non inizializzato: manca la NEXT_PUBLIC_TURNSTILE_SITE_KEY.
              </p>
            )}

            {captchaError && (
              <p className="text-xs text-blood-light">{captchaError}</p>
            )}
          </div>

          {feedback && (
            <div
              className="rounded-lg border border-ash/20 bg-black/20 px-4 py-3"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm text-ash-light">{feedback}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full md:w-auto"
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
        <Card className="max-w-3xl mx-auto border border-blood/40">
          <h2 className="font-display text-3xl text-fog mb-4">
            Segnalazione inoltrata
          </h2>

          <p className="text-ash-light mb-5">
            La pratica è stata inoltrata al team di revisione interno.
            Conserva l&apos;ID pratica se devi fare riferimento alla
            segnalazione in futuro.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-sm">
            <div className="ritual-border rounded-lg p-4 bg-black/20">
              <p className="text-xs uppercase tracking-widest text-ash mb-2">
                ID pratica
              </p>
              <p className="text-fog break-all">{result.caseId}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}