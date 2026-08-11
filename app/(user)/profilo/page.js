import { redirect } from "next/navigation";

export const metadata = {
  title: "Profilo — Mossad",
};

export default function ProfilePage() {
  redirect("/segnalazione/nuova");
}