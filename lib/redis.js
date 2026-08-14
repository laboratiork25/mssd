import { Redis } from "@upstash/redis";

const redisUrl =
  process.env.storage_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken =
  process.env.storage_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  console.warn(
    "Redis non configurato: storage_KV_REST_API_URL / storage_KV_REST_API_TOKEN mancanti."
  );
}

export const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

const COUNTER_KEY = "report:counter";
const STEP = 5;

/**
 * Genera il prossimo ID pratica: R0, R5, R10, R15, ...
 */
export async function getNextCaseId() {
  if (!redis) {
    throw new Error("Redis non disponibile: impossibile generare l'ID pratica.");
  }

  const current = await redis.get(COUNTER_KEY);

  let nextNumber;

  if (current === null || current === undefined) {
    // Prima segnalazione in assoluto: parte da 0
    nextNumber = 0;
    await redis.set(COUNTER_KEY, nextNumber);
  } else {
    // Incrementa di 5 ogni volta, in modo atomico
    nextNumber = await redis.incrby(COUNTER_KEY, STEP);
  }

  return `R${nextNumber}`;
}

/**
 * Salva o aggiorna una pratica.
 * key: "report:<caseId>"
 */
export async function saveReportStatus({
  caseId,
  status,
  eventDate = null,
  eventTime = null,
}) {
  if (!redis) {
    console.warn("Redis non disponibile, skip saveReportStatus.");
    return;
  }

  const key = `report:${caseId}`;
  const now = new Date().toISOString();

  const value = {
    caseId,
    status,
    eventDate,
    eventTime,
    updatedAt: now,
  };

  await redis.set(key, value);
}

/**
 * Recupera stato pratica.
 */
export async function getReportStatus(caseId) {
  if (!redis) {
    console.warn("Redis non disponibile, skip getReportStatus.");
    return null;
  }

  const key = `report:${caseId}`;
  const value = await redis.get(key);

  if (!value) return null;

  return value;
}