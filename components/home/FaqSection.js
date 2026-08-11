"use client";

import { useState } from "react";
import Link from "next/link";
import { faqs } from "@/data/faq";

export default function FaqSection() {
  const [open, setOpen] = useState(null);
  const preview = faqs.slice(0, 4);

  return (
    <section id="faq" className="max-w-4xl mx-auto px-5 py-24">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl text-fog mb-3">
          Domande frequenti
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {preview.map((item, idx) => (
          <div key={idx} className="ritual-card">
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <span className="text-fog font-body">{item.question}</span>
              <span className="text-blood-light">
                {open === idx ? "−" : "+"}
              </span>
            </button>
            {open === idx && (
              <p className="px-6 pb-4 text-ash-light text-sm">
                {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/faq"
          className="text-sm text-blood-light hover:text-fog transition-colors underline"
        >
          Vedi tutte le FAQ →
        </Link>
      </div>
    </section>
  );
}