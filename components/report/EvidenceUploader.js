"use client";

import { useEffect, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";

const MAX_IMAGES = 10;
const MAX_VIDEOS = 5;
const MAX_IMAGE_SIZE_MB = 8;
const MAX_VIDEO_SIZE_MB = 30;
const MAX_VIDEO_DURATION_SEC = 60;

function bytesToMb(bytes) {
  return bytes / (1024 * 1024);
}

export default function EvidenceUploader({ value, onChange }) {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cloudConfig, setCloudConfig] = useState(null);

  useEffect(() => {
    async function fetchSignature() {
      try {
        const res = await fetch("/api/upload/signature", {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Errore generando firma Cloudinary.");
        }

        setCloudConfig(data);
      } catch (error) {
        console.error("Errore recuperando firma:", error);
        setStatus(
          "Impossibile inizializzare upload media. Riprovare più tardi."
        );
      }
    }

    fetchSignature();
  }, []);

  useEffect(() => {
    const allUrls = [...images, ...videos].map((m) => m.secureUrl);
    onChange(allUrls);
  }, [images, videos, onChange]);

  async function handleFilesSelected(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length || !cloudConfig) return;

    const newImages = [];
    const newVideos = [];
    let localStatus = "";

    for (const file of files) {
      const sizeMb = bytesToMb(file.size);

      if (file.type.startsWith("image/")) {
        if (images.length + newImages.length >= MAX_IMAGES) {
          localStatus = `Limite massimo di ${MAX_IMAGES} immagini raggiunto.`;
          continue;
        }

        if (sizeMb > MAX_IMAGE_SIZE_MB) {
          localStatus = `Immagine troppo grande (${sizeMb.toFixed(
            1
          )} MB). Max ${MAX_IMAGE_SIZE_MB} MB.`;
          continue;
        }

        newImages.push(file);
      } else if (file.type.startsWith("video/")) {
        if (videos.length + newVideos.length >= MAX_VIDEOS) {
          localStatus = `Limite massimo di ${MAX_VIDEOS} video raggiunto.`;
          continue;
        }

        if (sizeMb > MAX_VIDEO_SIZE_MB) {
          localStatus = `Video troppo grande (${sizeMb.toFixed(
            1
          )} MB). Max ${MAX_VIDEO_SIZE_MB} MB.`;
          continue;
        }

        const isValidDuration = await checkVideoDuration(file);
        if (!isValidDuration) {
          localStatus = `Video troppo lungo. Durata massima ${MAX_VIDEO_DURATION_SEC} secondi.`;
          continue;
        }

        newVideos.push(file);
      } else {
        localStatus = "Formato non supportato. Usa solo immagini o video.";
      }
    }

    if (localStatus) {
      setStatus(localStatus);
    }

    if (!newImages.length && !newVideos.length) return;

    try {
      setUploading(true);
      const uploadedImages = await uploadFilesToCloudinary(
        newImages,
        cloudConfig,
        "image"
      );
      const uploadedVideos = await uploadFilesToCloudinary(
        newVideos,
        cloudConfig,
        "video"
      );

      setImages((prev) => [...prev, ...uploadedImages]);
      setVideos((prev) => [...prev, ...uploadedVideos]);
      setStatus("Media caricati correttamente.");
    } catch (error) {
      console.error("Errore upload Cloudinary:", error);
      setStatus(error.message || "Errore durante l'upload dei media.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeMedia(type, index) {
    if (type === "image") {
      setImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setVideos((prev) => prev.filter((_, i) => i !== index));
    }
  }

  const totalImages = images.length;
  const totalVideos = videos.length;

  return (
    <Card className="mt-6">
      <div className="flex flex-col gap-3 mb-4">
        <p className="text-xs uppercase tracking-[0.25em] text-ash">
          Allegati opzionali
        </p>
        <h3 className="font-display text-2xl text-fog">
          Prove, immagini e video
        </h3>
        <p className="text-sm text-ash-light max-w-2xl">
          Carica fino a {MAX_IMAGES} immagini e {MAX_VIDEOS} brevi video (max{" "}
          {MAX_VIDEO_DURATION_SEC} secondi). Non inserire documenti
          d&apos;identità o materiale non necessario alla revisione.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="text-xs text-ash-light">
          <p>
            Immagini:{" "}
            <span className="text-blood-light">
              {totalImages}/{MAX_IMAGES}
            </span>{" "}
            · Video:{" "}
            <span className="text-blood-light">
              {totalVideos}/{MAX_VIDEOS}
            </span>
          </p>
        </div>
        <div>
          <label className="inline-flex items-center gap-2 rounded-md border border-ash/30 bg-carbone/80 px-4 py-2 text-sm text-ash-light hover:border-blood-light hover:bg-carbone transition-all cursor-pointer">
            <span>Seleziona file</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
              disabled={uploading || !cloudConfig}
            />
          </label>
        </div>
      </div>

      {status && (
        <p className="text-xs text-ash-light mb-4">{status}</p>
      )}

      {uploading && (
        <p className="text-xs text-blood-light mb-4">
          Upload in corso... attendi fino al completamento.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div
            key={img.secureUrl}
            className="relative group rounded-lg overflow-hidden border border-ash/30 bg-black/40"
          >
            <img
              src={img.secureUrl}
              alt={`Immagine ${index + 1}`}
              className="w-full h-32 object-cover"
              loading="lazy"
            />
            <button
              type="button"
              onClick={() => removeMedia("image", index)}
              className="absolute top-1 right-1 rounded-full bg-black/70 text-ash-light text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Rimuovi immagine"
            >
              ✕
            </button>
          </div>
        ))}

        {videos.map((vid, index) => (
          <div
            key={vid.secureUrl}
            className="relative group rounded-lg overflow-hidden border border-ash/30 bg-black/40"
          >
            <video
              src={vid.secureUrl}
              className="w-full h-32 object-cover"
              muted
              preload="metadata"
            />
            <span className="absolute bottom-1 left-1 text-[10px] px-2 py-1 rounded-full bg-black/70 text-ash-light">
              Video {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeMedia("video", index)}
              className="absolute top-1 right-1 rounded-full bg-black/70 text-ash-light text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Rimuovi video"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function checkVideoDuration(file) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        const duration = video.duration;
        URL.revokeObjectURL(video.src);
        if (!Number.isFinite(duration)) {
          resolve(true);
        } else {
          resolve(duration <= MAX_VIDEO_DURATION_SEC);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve(true);
      };

      video.src = URL.createObjectURL(file);
    } catch {
      resolve(true);
    }
  });
}

async function uploadFilesToCloudinary(files, config, resourceType) {
  const results = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", config.timestamp);
    formData.append("folder", config.folder);
    formData.append("signature", config.signature);
    formData.append("api_key", config.apiKey);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Cloudinary upload error:", data);
      throw new Error(
        data?.error?.message ||
          `Upload ${resourceType} non riuscito su Cloudinary.`
      );
    }

    results.push({
      secureUrl: data.secure_url,
      type: resourceType,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes,
      duration: data.duration,
    });
  }

  return results;
}