import Navbar from "./components/Navbar";
import HeroChamber from "./components/HeroChamber";
import WhyDifferent from "./components/WhyDifferent";
import PhotoStrip from "./components/PhotoStrip";
import EnterChamber from "./components/EnterChamber";
import Workouts from "./components/Workouts";
import Benefits from "./components/Benefits";
import Location from "./components/Location";
import AppControl from "./components/AppControl";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import StickyMobileCTA from "./components/StickyMobileCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* The journey through the chamber */}
        <HeroChamber />     {/* Outside, looking in */}
        <WhyDifferent />    {/* 01 — why this room is different */}
        {/* photo strip — cinematic break between sections */}
        <PhotoStrip
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1920&q=80"
          alt="Infrared studio workout session"
          headline="Three people. One hour becomes fifteen minutes."
          sub="Inside the chamber"
        />
        <EnterChamber />
        <Workouts />
        <Benefits />
        {/* atmospheric photo break before location */}
        <PhotoStrip
          src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1920&q=80"
          alt="Infrared sauna warm light"
          headline="Open while the city sleeps."
          sub="Galway city"
          align="right"
          cta={{ label: "Book free workout →", href: "#book" }}
          height={360}
        />
        <Location />        {/* find the chamber */}
        <AppControl />      {/* the control centre */}
        <FinalCTA />        {/* 05 — the door is open */}
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
