import { NextResponse } from "next/server";
import { getReportStatus } from "../../../../lib/redis";

function isValidCaseId(caseId = "") {
  return /^MOSS-\d{4}-[A-Z0-9]{6,12}$/.test(caseId.toUpperCase());
}

export async function POST(request) {
  try {
    const body = await request.json();
    const caseId = String(body.caseId || "").toUpperCase().trim();

    if (!caseId || !isValidCaseId(caseId)) {
      return NextResponse.json(
        { message: "ID pratica non valido." },
        { status: 400 }
      );
    }

    const statusData = await getReportStatus(caseId);

    if (!statusData) {
      return NextResponse.json(
        { message: "Nessuna pratica trovata con questo ID." },
        { status: 404 }
      );
    }

    const report = {
      caseId,
      title: "Pratica Mossad",
      category: "riservata",
      status: statusData.status || "nuova",
      updatedAt: statusData.updatedAt || null,
      eventDate: statusData.eventDate || null,
      eventTime: statusData.eventTime || null,
    };

    return NextResponse.json(
      { report },
      { status: 200 }
    );
  } catch (error) {
    console.error("Errore POST /api/reports/status-check:", error);

    return NextResponse.json(
      { message: "Errore interno durante la verifica." },
      { status: 500 }
    );
  }
}