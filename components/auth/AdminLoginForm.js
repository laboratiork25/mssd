"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function AdminLoginForm() {
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

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credenziali admin non valide.");
      }

      setFeedback("Accesso admin eseguito. Reindirizzamento...");
      setTimeout(() => router.push("/admin"), 800);
    } catch (error) {
      setFeedback(error.message || "Errore durante il login admin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-xl mx-auto">
      <h1 className="font-display text-4xl text-fog mb-3">Accesso admin</h1>
      <p className="text-ash-light mb-8">
        Area di revisione interna dedicata esclusivamente al team di moderazione.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email admin"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="admin@email.it"
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="Inserisci la password admin"
          required
        />

        {feedback && (
          <p className="text-sm text-ash-light">{feedback}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifica in corso..." : "Accedi all'area admin"}
        </Button>
      </form>
    </Card>
  );
}