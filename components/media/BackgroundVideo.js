"use client";

import { useEffect, useState } from "react";

export default function BackgroundVideo({ src = "/media/videos/background.mp4" }) {
  const [isMobile, setIsMobile] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const showVideo = !isMobile && !videoFailed;

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