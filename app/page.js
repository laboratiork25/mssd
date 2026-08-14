import Hero from "../components/home/Hero";
import HowItWorks from "../components/home/HowItWorks";
import ArticlesPreview from "../components/home/ArticlesPreview";
import WhatsappWidget from "../components/home/WhatsappWidget";
import FaqSection from "../components/home/FaqSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhatsappWidget />
      <HowItWorks />
      <ArticlesPreview />
      <FaqSection />
    </>
  );
}