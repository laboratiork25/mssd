"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function LoginForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback("");

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credenziali non valide.");
      }

      setFeedback("Accesso eseguito. Reindirizzamento...");
      setTimeout(() => router.push("/profilo"), 800);
    } catch (error) {
      setFeedback(error.message || "Errore durante il login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-xl mx-auto">
      <h1 className="font-display text-4xl text-fog mb-3">Accesso utente</h1>
      <p className="text-ash-light mb-8">
        Accedi alla tua area riservata per inviare nuove pratiche e monitorare
        quelle già aperte.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="nome@email.it"
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="Inserisci la tua password"
          required
        />

        {feedback && (
          <p className="text-sm text-ash-light">{feedback}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Accesso in corso..." : "Accedi"}
        </Button>
      </form>
    </Card>
  );
}