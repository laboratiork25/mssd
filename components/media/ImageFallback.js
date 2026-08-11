"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageFallback({
  src,
  alt,
  width = 120,
  height = 120,
  className = "",
  fallbackText = "MOSSAD",
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`ritual-border ritual-glow bg-carbone flex items-center justify-center text-blood-light font-display tracking-widest text-sm ${className}`}
        style={{ width, height }}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}