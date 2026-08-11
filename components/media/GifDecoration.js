"use client";

import { useState } from "react";

export default function GifDecoration({
  name,
  alt = "",
  className = "",
  width = 96,
  height = 96,
}) {
  const [failed, setFailed] = useState(false);
  const src = `/media/gifs/${name}.gif`;

  if (failed) {
    return (
      <div
        className={`rounded-full ritual-border bg-carbone/60 flex items-center justify-center text-ash text-xs ${className}`}
        style={{ width, height }}
        aria-hidden="true"
      >
        <span className="opacity-40">⚚</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`select-none pointer-events-none opacity-80 ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}