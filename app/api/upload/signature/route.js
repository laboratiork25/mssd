import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadFolder =
      process.env.CLOUDINARY_UPLOAD_FOLDER || "mossad/reports";

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { message: "Cloudinary non configurato." },
        { status: 500 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const paramsToSign = `folder=${uploadFolder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    return NextResponse.json(
      {
        cloudName,
        apiKey,
        timestamp,
        folder: uploadFolder,
        signature,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Errore POST /api/upload/signature:", error);
    return NextResponse.json(
      { message: "Errore interno nella generazione della firma." },
      { status: 500 }
    );
  }
}