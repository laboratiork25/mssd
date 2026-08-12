"use client";

import { useEffect, useRef, useState } from "react";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function SpeakerIcon({ muted = false }) {
  if (muted) {
    return (
      <span className="relative block h-5 w-5" aria-hidden="true">
        <span className="absolute left-[1px] top-[7px] h-[6px] w-[5px] rounded-l-sm bg-fog" />

        <span
          className="absolute left-[5px] top-[5px] h-[10px] w-[8px] border-r-[8px] border-r-fog border-y-[5px] border-y-transparent"
          style={{ borderLeft: 0 }}
        />

        <span className="absolute left-[12px] top-[2px] h-[16px] w-[2px] rotate-45 rounded bg-fog" />
        <span className="absolute left-[12px] top-[2px] h-[16px] w-[2px] -rotate-45 rounded bg-fog" />
      </span>
    );
  }

  return (
    <span className="relative block h-5 w-5" aria-hidden="true">
      <span className="absolute left-[1px] top-[7px] h-[6px] w-[5px] rounded-l-sm bg-fog" />

      <span
        className="absolute left-[5px] top-[5px] h-[10px] w-[8px] border-r-[8px] border-r-fog border-y-[5px] border-y-transparent"
        style={{ borderLeft: 0 }}
      />

      <span className="absolute left-[14px] top-[5px] h-[10px] w-[6px] rounded-r-full border border-fog/80 border-l-transparent" />

      <span className="absolute left-[12px] top-[2px] h-[16px] w-[10px] rounded-r-full border border-fog/50 border-l-transparent" />
    </span>
  );
}

function CloseIcon() {
  return (
    <span
      className="relative block h-3.5 w-3.5 md:h-4 md:w-4"
      aria-hidden="true"
    >
      <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 rotate-45 rounded bg-fog" />
      <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 -rotate-45 rounded bg-fog" />
    </span>
  );
}

function Notification({ open, onKeep, onCloseAnyway }) {
  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-4 md:items-center md:pb-0"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-blood/30 bg-black/90 shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(107,18,32,0.16),transparent_45%)]" />

        <div className="relative p-4 md:p-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-blood-light/90">
            Consiglio immersivo
          </p>

          <h4 className="mt-2 font-display text-xl text-fog md:text-2xl">
            Vuoi attivare l’esperienza audio?
          </h4>

          <p className="mt-3 text-sm leading-relaxed text-ash-light">
            La riproduzione sonora è consigliata per un’esperienza più
            immersiva, ma puoi chiudere comunque il widget.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onCloseAnyway}
              className="inline-flex items-center justify-center rounded-md border border-blood/40 bg-bordeaux px-4 py-3 text-sm text-fog transition-all hover:bg-blood-light"
            >
              Chiudi lo stesso
            </button>

            <button
              type="button"
              onClick={onKeep}
              className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-fog transition-all hover:bg-white/10"
            >
              Tieni
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Soundbar() {
  const audioRef = useRef(null);
  const seekRef = useRef(null);
  const rafRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.22);
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState("Ambience pronta");
  const [isSeeking, setIsSeeking] = useState(false);
  const [visible, setVisible] = useState(true);
  const [showCloseNotice, setShowCloseNotice] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const syncProgress = () => {
      if (isSeeking) return;

      const nextDuration = Number.isFinite(audio.duration)
        ? audio.duration
        : 0;

      const nextTime = Number.isFinite(audio.currentTime)
        ? audio.currentTime
        : 0;

      setDuration(nextDuration);
      setCurrentTime(nextTime);

      if (seekRef.current) {
        seekRef.current.value = String(nextTime);
        seekRef.current.max = String(nextDuration || 0);
      }
    };

    const handleLoaded = () => {
      const nextDuration = Number.isFinite(audio.duration)
        ? audio.duration
        : 0;

      const nextTime = Number.isFinite(audio.currentTime)
        ? audio.currentTime
        : 0;

      setDuration(nextDuration);
      setCurrentTime(nextTime);
      setFeedback("Traccia disponibile");

      if (seekRef.current) {
        seekRef.current.max = String(nextDuration || 0);
        seekRef.current.value = String(nextTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setFeedback("Riproduzione terminata");

      if (seekRef.current) {
        seekRef.current.value = "0";
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      syncProgress();
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("loadeddata", handleLoaded);
    audio.addEventListener("canplay", handleLoaded);
    audio.addEventListener("durationchange", handleLoaded);
    audio.addEventListener("timeupdate", syncProgress);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    handleLoaded();

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("loadeddata", handleLoaded);
      audio.removeEventListener("canplay", handleLoaded);
      audio.removeEventListener("durationchange", handleLoaded);
      audio.removeEventListener("timeupdate", syncProgress);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, [isSeeking]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    function updateFrame() {
      if (!audio.paused && !audio.ended && !isSeeking) {
        const nextTime = Number.isFinite(audio.currentTime)
          ? audio.currentTime
          : 0;

        const nextDuration = Number.isFinite(audio.duration)
          ? audio.duration
          : 0;

        setCurrentTime(nextTime);
        setDuration(nextDuration);

        if (seekRef.current) {
          seekRef.current.max = String(nextDuration || 0);
          seekRef.current.value = String(nextTime);
        }

        rafRef.current = requestAnimationFrame(updateFrame);
      }
    }

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(updateFrame);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, isSeeking]);

  async function handlePlay() {
    try {
      const audio = audioRef.current;

      if (!audio) return;

      await audio.play();

      const nextTime = Number.isFinite(audio.currentTime)
        ? audio.currentTime
        : 0;

      const nextDuration = Number.isFinite(audio.duration)
        ? audio.duration
        : 0;

      setCurrentTime(nextTime);
      setDuration(nextDuration);
      setIsPlaying(true);
      setFeedback("Riproduzione attiva");

      if (seekRef.current) {
        seekRef.current.max = String(nextDuration || 0);
        seekRef.current.value = String(nextTime);
      }
    } catch {
      setFeedback("Il browser richiede un'interazione utente per l'audio.");
    }
  }

  function handlePause() {
    const audio = audioRef.current;

    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
    setFeedback("Riproduzione in pausa");
  }

  function handleStop() {
    const audio = audioRef.current;

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    setCurrentTime(0);
    setIsPlaying(false);
    setFeedback("Riproduzione arrestata");

    if (seekRef.current) {
      seekRef.current.value = "0";
    }
  }

  function handleSeekStart() {
    setIsSeeking(true);
  }

  function handleSeekChange(event) {
    setCurrentTime(Number(event.target.value));
  }

  function handleSeekCommit(nextTime) {
    const audio = audioRef.current;

    if (!audio) return;

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
    setIsSeeking(false);

    if (seekRef.current) {
      seekRef.current.value = String(nextTime);
    }
  }

  function handleMouseSeekEnd(event) {
    handleSeekCommit(Number(event.currentTarget.value));
  }

  function handleTouchSeekEnd() {
    if (!seekRef.current) return;

    handleSeekCommit(Number(seekRef.current.value));
  }

  function handleKeySeek(event) {
    handleSeekCommit(Number(event.currentTarget.value));
  }

  function handleVolume(event) {
    const nextVolume = Number(event.target.value);

    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
  }

  function toggleMute() {
    setIsMuted((previous) => {
      const nextMuted = !previous;

      setFeedback(nextMuted ? "Audio silenziato" : "Audio attivato");

      return nextMuted;
    });
  }

  function requestClose() {
    if (isPlaying) {
      setShowCloseNotice(true);
      return;
    }

    setVisible(false);
  }

  function keepWidget() {
    setShowCloseNotice(false);
  }

  function closeAnyway() {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setShowCloseNotice(false);
    setVisible(false);
    setFeedback("Widget chiuso");
  }

  if (!mounted) return null;

  const progress = duration
    ? Math.min((currentTime / duration) * 100, 100)
    : 0;

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        loop
        aria-label="Traccia ambientale di sottofondo"
      >
        <source src="/media/audio/ambient.mp3" type="audio/mpeg" />
      </audio>

      <Notification
        open={showCloseNotice}
        onKeep={keepWidget}
        onCloseAnyway={closeAnyway}
      />

      {visible && (
        <div className="fixed bottom-2 left-1/2 z-50 w-[calc(100%-1rem)] max-w-4xl -translate-x-1/2 px-0.5 sm:bottom-4 sm:w-[calc(100%-1.5rem)] sm:px-1">
          <div className="relative overflow-hidden rounded-2xl border border-blood/25 bg-black/70 shadow-[0_10px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(107,18,32,0.18),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_100%)]" />

            <div className="relative p-2.5 sm:p-3 md:p-4">
              <button
                type="button"
                onClick={requestClose}
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/8 bg-white/5 text-fog transition-all hover:bg-white/10 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
                aria-label="Chiudi soundbar"
              >
                <CloseIcon />
              </button>

              <h3 className="mb-3 pr-8 text-center font-display text-base text-fog sm:text-lg md:mb-4 md:pr-10 md:text-xl">
                For the last time
              </h3>

              <div className="flex flex-col gap-3 md:grid md:grid-cols-[auto_auto_auto_1fr_auto] md:items-center md:gap-3">
                <div className="flex items-center justify-center gap-2 md:contents">
                  <button
                    type="button"
                    onClick={isPlaying ? handlePause : handlePlay}
                    className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 md:h-12 md:w-12 ${
                      isPlaying
                        ? "border-blood/50 bg-bordeaux text-fog shadow-[0_0_18px_rgba(107,18,32,0.35)]"
                        : "border-blood/30 bg-carbone/90 text-fog hover:border-blood-light hover:bg-bordeaux/90"
                    }`}
                    aria-label={isPlaying ? "Metti in pausa" : "Riproduci"}
                  >
                    <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(138,28,43,0.22),transparent_65%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {isPlaying ? (
                      <span className="relative flex gap-1">
                        <span className="h-3.5 w-1 rounded bg-fog md:h-4" />
                        <span className="h-3.5 w-1 rounded bg-fog md:h-4" />
                      </span>
                    ) : (
                      <span className="relative ml-0.5 h-0 w-0 border-y-[7px] border-y-transparent border-l-[11px] border-l-fog md:border-y-[8px] md:border-l-[13px]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleStop}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/5 text-fog transition-all hover:bg-white/10 md:h-11 md:w-11"
                    aria-label="Ferma riproduzione"
                  >
                    <span className="h-3 w-3 rounded-sm bg-fog md:h-3.5 md:w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/5 text-fog transition-all hover:bg-white/10 md:h-11 md:w-11"
                    aria-label={isMuted ? "Riattiva audio" : "Silenzia audio"}
                  >
                    <SpeakerIcon muted={isMuted} />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px] text-ash-light sm:gap-3 sm:text-[11px] md:text-xs">
                    <span className="shrink-0">
                      {formatTime(currentTime)}
                    </span>

                    <span className="truncate text-center">
                      {feedback}
                    </span>

                    <span className="shrink-0">
                      {formatTime(duration)}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/8" />

                    <div
                      className="pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-bordeaux via-blood-light to-blood-light"
                      style={{ width: `${progress}%` }}
                    />

                    <input
                      ref={seekRef}
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeekChange}
                      onMouseDown={handleSeekStart}
                      onTouchStart={handleSeekStart}
                      onMouseUp={handleMouseSeekEnd}
                      onTouchEnd={handleTouchSeekEnd}
                      onKeyUp={handleKeySeek}
                      className="soundbar-range relative z-10 h-6 w-full appearance-none bg-transparent"
                      aria-label="Avanzamento traccia"
                    />
                  </div>
                </div>

                <div className="hidden w-32 items-center gap-2 md:flex">
                  <span className="text-xs text-ash">Vol</span>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolume}
                    className="soundbar-range w-full appearance-none bg-transparent"
                    aria-label="Volume audio"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}