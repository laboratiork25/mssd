"use client";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="ritual-card w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ash-light hover:text-blood-light transition-colors"
          aria-label="Chiudi"
        >
          ✕
        </button>
        {title && (
          <h3 className="font-display text-xl text-fog mb-4">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}