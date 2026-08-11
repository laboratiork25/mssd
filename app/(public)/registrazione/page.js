import { redirect } from "next/navigation";

export const metadata = {
  title: "Registrazione — Mossad",
};

export default function RegisterPage() {
  redirect("/segnalazione/nuova");
}