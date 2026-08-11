"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.username.trim() || form.username.trim().length < 3) {
      nextErrors.username = "Lo username deve avere almeno 3 caratteri.";
    }

    if (!form.email.trim() || !form.email.includes("@")) {
      nextErrors.email = "Inserisci un indirizzo email valido.";
    }

    if (!form.password || form.password.length < 8) {
      nextErrors.password = "La password deve avere almeno 8 caratteri.";
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Le password non coincidono.";
    }

    return nextErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registrazione non riuscita.");
      }

      setFeedback("Account creato con successo. Reindirizzamento al login...");
      setTimeout(() => router.push("/login"), 1200);
    } catch (error) {
      setFeedback(error.message || "Errore imprevisto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-xl mx-auto">
      <h1 className="font-display text-4xl text-fog mb-3">Registrazione</h1>
      <p className="text-ash-light mb-8">
        Crea un account riservato per accedere al profilo e tracciare le tue
        segnalazioni nel tempo.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Username"
          name="username"
          value={form.username}
          onChange={(e) => updateField("username", e.target.value)}
          placeholder="Scegli un nome utente"
          required
          error={errors.username}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="nome@email.it"
          required
          error={errors.email}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="Minimo 8 caratteri"
          required
          error={errors.password}
        />

        <Input
          label="Conferma password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          placeholder="Ripeti la password"
          required
          error={errors.confirmPassword}
        />

        {feedback && (
          <p className="text-sm text-ash-light">{feedback}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creazione account..." : "Crea account"}
        </Button>
      </form>
    </Card>
  );
}