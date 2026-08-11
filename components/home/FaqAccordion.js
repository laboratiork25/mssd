"use client";

import { useState } from "react";
import { faqs } from "@/data/faq";

export default function FaqAccordion() {
  const [open, setOpen] = useState(null);

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((item, idx) => (
        <div key={idx} className="ritual-card">
          <button
            onClick={() => setOpen(open === idx ? null : idx)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="text-fog font-body">{item.question}</span>
            <span className="text-blood-light">{open === idx ? "−" : "+"}</span>
          </button>
          {open === idx && (
            <p className="px-6 pb-4 text-ash-light text-sm">{item.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
}