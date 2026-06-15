import Navbar from "./components/Navbar";
import HeroChamber from "./components/HeroChamber";
import WhyDifferent from "./components/WhyDifferent";
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
        <EnterChamber />    {/* 02 — how it works */}
        <Workouts />        {/* 03 — inside the chamber */}
        <Benefits />        {/* 04 — recovery & results */}
        <Location />        {/* find the chamber */}
        <AppControl />      {/* the control centre */}
        <FinalCTA />        {/* 05 — the door is open */}
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
