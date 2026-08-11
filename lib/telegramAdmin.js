import { saveReportStatus } from "./redis";

const TELEGRAM_API_BASE = "https://api.telegram.org";

export const REPORT_STATUSES = {
  nuova: "Nuova",
  in_revisione: "In revisione",
  confermata: "Confermata",
  respinta: "Respinta",
  chiusa: "Chiusa",
};

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeText(value = "", maxLength = 1000) {
  return String(value)
    .trim()
    .replace(/\r\n/g, "\n")
    .slice(0, maxLength);
}

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_REPORT_CHAT_ID;

  if (!token || !chatId) {
    throw new Error(
      "Configurazione Telegram mancante: TELEGRAM_BOT_TOKEN o TELEGRAM_REPORT_CHAT_ID."
    );
  }

  return { token, chatId: String(chatId) };
}

export function getTelegramAdminIds() {
  return String(process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isTelegramAdmin(userId) {
  return getTelegramAdminIds().includes(String(userId));
}

async function telegramRequest(token, method, body) {
  const response = await fetch(
    `${TELEGRAM_API_BASE}/bot${token}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    console.error(`Telegram ${method} error:`, data);
    throw new Error(
      data?.description || `Telegram ${method} non riuscito.`
    );
  }

  return data.result;
}

export function createStatusKeyboard(caseId) {
  return {
    inline_keyboard: [
      [
        {
          text: "Nuova",
          callback_data: `mossad|status|${caseId}|nuova`,
        },
        {
          text: "In revisione",
          callback_data: `mossad|status|${caseId}|in_revisione`,
        },
      ],
      [
        {
          text: "Confermata",
          callback_data: `mossad|status|${caseId}|confermata`,
        },
        {
          text: "Respinta",
          callback_data: `mossad|status|${caseId}|respinta`,
        },
      ],
      [
        {
          text: "Chiusa",
          callback_data: `mossad|status|${caseId}|chiusa`,
        },
      ],
    ],
  };
}

export async function sendTelegramStatusUpdate({
  caseId,
  status,
  performedBy,
}) {
  const { token, chatId } = getConfig();
  const statusLabel = REPORT_STATUSES[status];

  if (!statusLabel) {
    throw new Error("Stato pratica non valido.");
  }

  const adminLabel = performedBy?.username
    ? `@${escapeHtml(performedBy.username)}`
    : performedBy?.firstName
      ? escapeHtml(performedBy.firstName)
      : `ID ${escapeHtml(performedBy?.id || "sconosciuto")}`;

  const text = [
    "<b>AGGIORNAMENTO STATO PRATICA</b>",
    "",
    `<b>ID pratica:</b> <code>${escapeHtml(caseId)}</code>`,
    `<b>Nuovo stato:</b> ${escapeHtml(statusLabel)}`,
    `<b>Aggiornato da:</b> ${adminLabel}`,
    "",
    "<i>Aggiornamento interno registrato dal bot Mossad.</i>",
  ].join("\n");

  const result = await telegramRequest(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });

  // aggiorna stato in Redis
  await saveReportStatus({
    caseId,
    status,
  });

  return result;
}

export async function sendTelegramEventUpdate({
  caseId,
  eventDate,
  eventTime,
  eventTitle,
  performedBy,
}) {
  const { token, chatId } = getConfig();

  const adminLabel = performedBy?.username
    ? `@${escapeHtml(performedBy.username)}`
    : performedBy?.firstName
      ? escapeHtml(performedBy.firstName)
      : `ID ${escapeHtml(performedBy?.id || "sconosciuto")}`;

  const text = [
    "<b>EVENTO PROGRAMMATO PER PRATICA</b>",
    "",
    `<b>ID pratica:</b> <code>${escapeHtml(caseId)}</code>`,
    `<b>Data:</b> ${escapeHtml(eventDate)}`,
    `<b>Ora:</b> ${escapeHtml(eventTime)}`,
    `<b>Evento:</b> ${escapeHtml(
      normalizeText(eventTitle || "Aggiornamento programmato", 300)
    )}`,
    `<b>Registrato da:</b> ${adminLabel}`,
    "",
    "<i>Evento registrato internamente dal bot Mossad.</i>",
  ].join("\n");

  const result = await telegramRequest(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });

  // aggiorna evento in Redis (stato sintetico "evento_programmato")
  await saveReportStatus({
    caseId,
    status: "evento_programmato",
    eventDate,
    eventTime,
  });

  return result;
}

export async function sendStatusSelectionMessage({ caseId }) {
  const { token, chatId } = getConfig();

  return telegramRequest(token, "sendMessage", {
    chat_id: chatId,
    text: [
      "<b>SELEZIONE STATO PRATICA</b>",
      "",
      `<b>ID pratica:</b> <code>${escapeHtml(caseId)}</code>`,
      "",
      "Scegli il nuovo stato usando uno dei pulsanti.",
    ].join("\n"),
    parse_mode: "HTML",
    reply_markup: createStatusKeyboard(caseId),
  });
}

export async function answerCallbackQuery({
  callbackQueryId,
  text,
  showAlert = false,
}) {
  const { token } = getConfig();

  return telegramRequest(token, "answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });
}