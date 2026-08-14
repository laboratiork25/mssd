import { NextResponse } from "next/server";
import {
  REPORT_STATUSES,
  answerCallbackQuery,
  isTelegramAdmin,
  sendStatusSelectionMessage,
  sendTelegramEventUpdate,
  sendTelegramStatusUpdate,
} from "../../../../lib/telegramAdmin";

export const runtime = "nodejs";

function isValidCaseId(caseId = "") {
  return /^R\d+$/.test(String(caseId).trim().toUpperCase());
}

function isValidDate(date = "") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

function isValidTime(time = "") {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function getAdminIdentity(from) {
  return {
    id: from?.id ? String(from.id) : "",
    username: from?.username || "",
    firstName: from?.first_name || "",
  };
}

function getTextParts(text = "") {
  return text.trim().split(/\s+/).filter(Boolean);
}

async function handleCallbackQuery(callbackQuery) {
  const from = callbackQuery?.from;
  const callbackData = callbackQuery?.data || "";
  const callbackId = callbackQuery?.id;

  if (!callbackId) return;

  if (!isTelegramAdmin(from?.id)) {
    await answerCallbackQuery({
      callbackQueryId: callbackId,
      text: "Non sei autorizzato a gestire questa pratica.",
      showAlert: true,
    });
    return;
  }

  const [namespace, action, rawCaseId, status] = callbackData.split("|");
  const caseId = String(rawCaseId || "").toUpperCase();

  if (
    namespace !== "mossad" ||
    action !== "status" ||
    !isValidCaseId(caseId) ||
    !REPORT_STATUSES[status]
  ) {
    await answerCallbackQuery({
      callbackQueryId: callbackId,
      text: "Azione non valida.",
      showAlert: true,
    });
    return;
  }

  const performedBy = getAdminIdentity(from);

  await sendTelegramStatusUpdate({
    caseId,
    status,
    performedBy,
  });

  await answerCallbackQuery({
    callbackQueryId: callbackId,
    text: `Stato aggiornato: ${REPORT_STATUSES[status]}`,
    showAlert: false,
  });
}

async function handleCommand(message) {
  const text = String(message?.text || "").trim();

  if (!text.startsWith("/")) return;

  const from = message?.from;
  const chatId = String(message?.chat?.id || "");
  const allowedChatId = String(process.env.TELEGRAM_REPORT_CHAT_ID || "");

  if (chatId !== allowedChatId) {
    return;
  }

  if (!isTelegramAdmin(from?.id)) {
    return;
  }

  const parts = getTextParts(text);
  const command = String(parts[0] || "")
    .split("@")[0]
    .toLowerCase();

  const performedBy = getAdminIdentity(from);

  if (command === "/pratica") {
    const caseId = String(parts[1] || "").toUpperCase();

    if (!isValidCaseId(caseId)) {
      return;
    }

    await sendStatusSelectionMessage({ caseId });
    return;
  }

  if (command === "/evento") {
    const caseId = String(parts[1] || "").toUpperCase();
    const date = String(parts[2] || "");
    const time = String(parts[3] || "");
    const title = parts.slice(4).join(" ").trim();

    if (
      !isValidCaseId(caseId) ||
      !isValidDate(date) ||
      !isValidTime(time) ||
      !title
    ) {
      return;
    }

    await sendTelegramEventUpdate({
      caseId,
      eventDate: date,
      eventTime: time,
      eventTitle: title,
      performedBy,
    });
  }
}

export async function POST(request) {
  try {
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const receivedSecret = request.headers.get(
      "x-telegram-bot-api-secret-token"
    );

    if (!webhookSecret || receivedSecret !== webhookSecret) {
      return NextResponse.json(
        { message: "Webhook non autorizzato." },
        { status: 401 }
      );
    }

    const update = await request.json();

    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }

    if (update.message) {
      await handleCommand(update.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Errore webhook Telegram:", error);

    return NextResponse.json(
      { message: "Errore interno webhook." },
      { status: 500 }
    );
  }
}