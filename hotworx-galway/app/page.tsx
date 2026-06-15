import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import InsightSection from "./components/InsightSection";
import HowItWorksSection from "./components/HowItWorksSection";
import WorkoutsSection from "./components/WorkoutsSection";
import BenefitsSection from "./components/BenefitsSection";
import LocationSection from "./components/LocationSection";
import AppSection from "./components/AppSection";
import SocialProofSection from "./components/SocialProofSection";
import FinalCTASection from "./components/FinalCTASection";
import Footer from "./components/Footer";
import StickyMobileCTA from "./components/StickyMobileCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <InsightSection />
        <HowItWorksSection />
        <WorkoutsSection />
        <BenefitsSection />
        <LocationSection />
        <AppSection />
        <SocialProofSection />
        <FinalCTASection />
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
