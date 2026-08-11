"use client";

import { useState } from "react";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function InternalNotes({
  reportId,
  initialNotes = [],
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback("");

    if (!text.trim()) {
      setFeedback("Inserisci una nota prima di salvare.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/admin/reports/${reportId}/note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Errore durante il salvataggio della nota.");
      }

      setNotes((prev) => [data.note, ...prev]);
      setText("");
      setFeedback("Nota interna salvata.");
    } catch (error) {
      setFeedback(error.message || "Errore imprevisto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <h3 className="font-display text-2xl text-fog mb-4">Note interne</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            label="Nuova nota"
            name="note"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Aggiungi osservazioni riservate per il team di revisione..."
            rows={5}
          />

          <div className="flex items-center justify-between gap-4">
            {feedback ? (
              <p className="text-sm text-ash-light">{feedback}</p>
            ) : (
              <span className="text-xs text-ash">
                Le note qui inserite non sono visibili agli utenti.
              </span>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Salvataggio..." : "Salva nota"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {notes.length ? (
          notes.map((note, index) => (
            <Card key={note._id || index}>
              <div className="flex items-center justify-between gap-4 mb-3">
                <p className="text-sm text-blood-light">
                  {note.authorName || "Admin"}
                </p>
                <p className="text-xs text-ash">
                  {new Date(note.createdAt).toLocaleString("it-IT")}
                </p>
              </div>
              <p className="text-sm text-ash-light leading-relaxed">
                {note.text}
              </p>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-ash-light text-sm">
              Nessuna nota interna registrata per questa pratica.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}