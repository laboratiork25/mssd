import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { sendTelegramReportMessage } from "../../../lib/telegram";
import { saveReportStatus } from "../../../lib/redis";

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
    errors.push(
      "Conferma di correttezza delle informazioni obbligatoria."
    );
  }

  if (!body.captchaToken) {
    errors.push("Captcha mancante.");
  }

  return errors;
}

async function verifyTurnstileToken(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY mancante nelle env.");
    return false;
  }

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret,
          response: token,
          remoteip: remoteIp || "",
        }).toString(),
      }
    );

    const data = await res.json();
    console.log("DEBUG Turnstile verify:", res.status, data);

    return !!data.success;
  } catch (error) {
    console.error("Errore verifica Turnstile:", error);
    return false;
  }
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

    const captchaOk = await verifyTurnstileToken(
      body.captchaToken,
      request.headers.get("x-forwarded-for")
    );

    if (!captchaOk) {
      return NextResponse.json(
        {
          message:
            "Verifica CAPTCHA non riuscita. Riprova, assicurandoti di completare il controllo.",
        },
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

    // stato iniziale "nuova" salvato in Redis
    await saveReportStatus({
      caseId,
      status: "nuova",
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