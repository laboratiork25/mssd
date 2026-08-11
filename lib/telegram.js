import { createStatusKeyboard } from "./telegramAdmin";

const TELEGRAM_API_BASE = "https://api.telegram.org";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeText(value = "", maxLength = 3500) {
  return String(value)
    .trim()
    .replace(/\r\n/g, "\n")
    .slice(0, maxLength);
}

function buildReportText(caseId, payload) {
  const {
    title,
    category,
    description,
    severity,
    reportedIdentifier,
    reporterRole,
    reporterContact,
    victimContact,
  } = payload;

  const roleLabel =
    reporterRole === "terzo"
      ? "Terzo segnalante"
      : "Vittima diretta";

  const lines = [
    "<b>NUOVA SEGNALAZIONE ANONIMA</b>",
    "",
    `<b>ID pratica:</b> <code>${escapeHtml(caseId)}</code>`,
    `<b>Titolo:</b> ${escapeHtml(normalizeText(title, 150))}`,
    `<b>Categoria:</b> ${escapeHtml(normalizeText(category, 80))}`,
    `<b>Gravità:</b> ${escapeHtml(normalizeText(severity, 40))}`,
    `<b>Identificativo segnalato:</b> ${escapeHtml(
      normalizeText(reportedIdentifier, 160)
    )}`,
    "",
    `<b>Ruolo segnalante:</b> ${escapeHtml(roleLabel)}`,
    `<b>Recapito segnalante:</b> ${escapeHtml(
      normalizeText(reporterContact, 180)
    )}`,
    `<b>Recapito vittima:</b> ${
      victimContact
        ? escapeHtml(normalizeText(victimContact, 180))
        : "Non richiesto / non fornito"
    }`,
    "",
    "<b>Descrizione dei fatti</b>",
    escapeHtml(normalizeText(description, 3000)),
    "",
    "<i>Inoltrato automaticamente da Mossad Web App · Segnalazione senza registrazione, inviata in forma riservata.</i>",
  ];

  return lines.join("\n");
}

function splitMedia(evidence = []) {
  const imageUrls = [];
  const videoUrls = [];
  const otherUrls = [];

  for (const url of evidence) {
    if (typeof url !== "string") continue;

    const trimmed = url.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();

    if (
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".webp")
    ) {
      imageUrls.push(trimmed);
    } else if (
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.includes("/video/")
    ) {
      videoUrls.push(trimmed);
    } else {
      otherUrls.push(trimmed);
    }
  }

  return {
    imageUrls: imageUrls.slice(0, 10),
    videoUrls: videoUrls.slice(0, 5),
    otherUrls,
  };
}

async function sendTextMessage({
  token,
  chatId,
  text,
  replyMarkup,
}) {
  const url = `${TELEGRAM_API_BASE}/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
      reply_markup: replyMarkup,
    }),
  });

  const data = await res.json();
  console.log("DEBUG Telegram sendMessage:", res.status, data);

  if (!res.ok || !data.ok) {
    throw new Error(
      data?.description || "Telegram sendMessage non riuscito."
    );
  }

  return data.result;
}

async function sendMediaGroup({ token, chatId, urls, type }) {
  if (!urls.length) return null;

  const url = `${TELEGRAM_API_BASE}/bot${token}/sendMediaGroup`;

  const media = urls.map((u, index) => {
    if (type === "photo") {
      return {
        type: "photo",
        media: u,
        caption: index === 0 ? "Allegati immagine" : undefined,
        parse_mode: "HTML",
      };
    }

    return {
      type: "video",
      media: u,
      caption: index === 0 ? "Allegati video (max 60s)" : undefined,
      parse_mode: "HTML",
      supports_streaming: true,
    };
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      media,
    }),
  });

  const data = await res.json();
  console.log("DEBUG Telegram sendMediaGroup:", res.status, data);

  if (!res.ok || !data.ok) {
    throw new Error(
      data?.description || "Telegram sendMediaGroup non riuscito."
    );
  }

  return data.result;
}

export async function sendTelegramReportMessage({ caseId, payload }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_REPORT_CHAT_ID;

  console.log("DEBUG Telegram token:", token ? "SET" : "MISSING");
  console.log("DEBUG Telegram chatId:", chatId || "MISSING");

  if (!token || !chatId) {
    throw new Error(
      "Configurazione Telegram mancante: TELEGRAM_BOT_TOKEN o TELEGRAM_REPORT_CHAT_ID."
    );
  }

  const text = buildReportText(caseId, payload);
  const { imageUrls, videoUrls } = splitMedia(payload.evidence || []);

  // 1) messaggio testuale principale con tastiera di stato
  await sendTextMessage({
    token,
    chatId,
    text,
    replyMarkup: createStatusKeyboard(caseId),
  });

  // 2) immagini
  if (imageUrls.length === 1) {
    const url = `${TELEGRAM_API_BASE}/bot${token}/sendPhoto`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageUrls[0],
        caption: "Allegato immagine",
        parse_mode: "HTML",
      }),
    });
    const data = await res.json();
    console.log("DEBUG Telegram sendPhoto:", res.status, data);
  } else if (imageUrls.length > 1) {
    await sendMediaGroup({ token, chatId, urls: imageUrls, type: "photo" });
  }

  // 3) video
  if (videoUrls.length === 1) {
    const url = `${TELEGRAM_API_BASE}/bot${token}/sendVideo`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        video: videoUrls[0],
        caption: "Allegato video (max 60s)",
        parse_mode: "HTML",
        supports_streaming: true,
      }),
    });
    const data = await res.json();
    console.log("DEBUG Telegram sendVideo:", res.status, data);
  } else if (videoUrls.length > 1) {
    await sendMediaGroup({ token, chatId, urls: videoUrls, type: "video" });
  }

  return { ok: true };
}