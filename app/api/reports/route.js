import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { sendTelegramReportMessage } from "../../../lib/telegram";

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim());
}

function isValidPhone(value = "") {
  const normalized = value.replace(/[()\s.-]/g, "");
  return /^\+?[0-9]{7,15}$/.test(normalized);
}

function isValidContact(value = "") {
  return isValidEmail(value) || isValidPhone(value);
}

function normalizeEvidence(evidence) {
  if (!Array.isArray(evidence)) return [];

  return evidence
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 25);
}

function validatePayload(body) {
  const errors = [];

  if (!body.title || body.title.trim().length < 4) {
    errors.push("Titolo non valido.");
  }

  if (!body.category) {
    errors.push("Categoria mancante.");
  }

  if (!body.description || body.description.trim().length < 30) {
    errors.push("Descrizione troppo breve.");
  }

  if (!body.severity) {
    errors.push("Livello di gravità mancante.");
  }

  if (!body.reportedIdentifier || body.reportedIdentifier.trim().length < 3) {
    errors.push("Identificativo segnalato non valido.");
  }

  if (!["vittima", "terzo"].includes(body.reporterRole)) {
    errors.push("Ruolo del segnalante non valido.");
  }

  if (!body.reporterContact || !isValidContact(body.reporterContact)) {
    errors.push("Recapito del segnalante non valido.");
  }

  if (
    body.reporterRole === "terzo" &&
    (!body.victimContact || !isValidContact(body.victimContact))
  ) {
    errors.push("Recapito della vittima obbligatorio e non valido.");
  }

  if (body.privacyConsent !== true) {
    errors.push("Consenso privacy obbligatorio.");
  }

  if (body.accuracyConsent !== true) {
    errors.push("Conferma di correttezza delle informazioni obbligatoria.");
  }

  return errors;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const errors = validatePayload(body);

    if (errors.length > 0) {
      return NextResponse.json(
        { message: errors.join(" ") },
        { status: 400 }
      );
    }

    const caseId = `MOSS-${new Date().getFullYear()}-${nanoid(7).toUpperCase()}`;

    const payload = {
      title: body.title.trim(),
      category: body.category.trim(),
      description: body.description.trim(),
      severity: body.severity.trim(),
      reportedIdentifier: body.reportedIdentifier.trim(),
      reporterRole: body.reporterRole,
      reporterContact: body.reporterContact.trim(),
      victimContact:
        body.reporterRole === "terzo"
          ? body.victimContact.trim()
          : "",
      evidence: normalizeEvidence(body.evidence),
      privacyConsent: true,
      accuracyConsent: true,
    };

    await sendTelegramReportMessage({
      caseId,
      payload,
    });

    return NextResponse.json(
      {
        caseId,
        message: "Segnalazione inviata correttamente.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Errore POST /api/reports:", error);

    return NextResponse.json(
      {
        message:
          "Errore interno durante la registrazione della segnalazione.",
      },
      { status: 500 }
    );
  }
}