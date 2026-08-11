import "./globals.css";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Soundbar from "../components/media/Soundbar";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "Mossad — Community Watch",
  description:
    "Piattaforma di segnalazione e revisione manuale per la community. Serietà, controllo e riservatezza al centro del processo.",
  icons: {
    icon: "/media/icons/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`dark ${cormorant.variable} ${inter.variable}`}>
      <body className="bg-noir text-fog font-body min-h-screen flex flex-col antialiased scrollbar-ritual">
        <Navbar />
        <main className="flex-1 pb-28 md:pb-32">{children}</main>
        <Footer />
        <Soundbar />
      </body>
    </html>
  );
}