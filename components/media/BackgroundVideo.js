"use client";

import { useState } from "react";

export default function BackgroundVideo({ src = "/media/videos/background.mp4" }) {
  const [videoFailed, setVideoFailed] = useState(false);

  const showVideo = !videoFailed;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-noir">
      {showVideo ? (
        <video
          className="w-full h-full object-cover opacity-70"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoFailed(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-carbone via-noir to-black" />
      )}
      <div className="absolute inset-0 ritual-overlay-gradient" />
    </div>
  );
}