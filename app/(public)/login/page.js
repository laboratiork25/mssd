import { redirect } from "next/navigation";

export const metadata = {
  title: "Login — Mossad",
};

export default function LoginPage() {
  redirect("/segnalazione/nuova");
}