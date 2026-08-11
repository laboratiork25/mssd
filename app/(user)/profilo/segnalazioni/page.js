import { redirect } from "next/navigation";

export const metadata = {
  title: "Storico Segnalazioni — Mossad",
};

export default function ProfileReportsPage() {
  redirect("/segnalazione/nuova");
}