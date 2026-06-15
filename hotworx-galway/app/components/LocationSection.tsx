"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Phone, Clock, Car, Navigation } from "lucide-react";

const hours = [
  { day: "Monday – Thursday", time: "11am – 8pm" },
  { day: "Friday", time: "9am – 6pm" },
  { day: "Saturday", time: "9am – 2pm" },
  { day: "Sunday", time: "Unstaffed" },
];

export default function LocationSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setPulse(true), 600);
      return () => clearTimeout(t);
    }
  }, [inView]);

  return (
    <section
      id="location"
      ref={ref}
      className="relative py-28 sm:py-36 heat-border"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-16"
        >
          <p className="text-[#FF6B00] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Find Us
          </p>
          <h2
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
            className="text-[clamp(36px,6vw,72px)] leading-tight text-white uppercase"
          >
            Easy to reach.
            <br />
            <span className="text-[#444]">Easy to fit into your day.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location details */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            {/* Address card */}
            <div className="glass-card p-7 rounded-sm">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-sm bg-[rgba(255,107,0,0.1)] border border-[rgba(255,107,0,0.2)] flex items-center justify-center flex-shrink-0">
                  <MapPin size={17} className="text-[#FF6B00]" />
                </div>
                <div>
                  <p
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                    className="text-white text-xl uppercase mb-1"
                  >
                    HOTWORX Galway
                  </p>
                  <p className="text-[#7A7A7A] text-sm leading-relaxed">
                    Tuam Road Retail Centre
                    <br />
                    Galway City, County Galway
                    <br />
                    Ireland H91 YH39
                  </p>
                </div>
              </div>

              {/* Landmarks */}
              <div className="space-y-2 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                {[
                  "Ground floor of Tuam Road Shopping Centre",
                  "Across from Galway Travel Lodge",
                  "Beside Wayfair",
                  "Ample parking available",
                ].map((detail, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[#666]">
                    <div className="w-1 h-1 rounded-full bg-[#FF6B00] flex-shrink-0" />
                    {detail}
                  </div>
                ))}
              </div>
            </div>

            {/* Phone card */}
            <div className="glass-card p-5 rounded-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#FF6B00]" />
                <div>
                  <p className="text-[#666] text-xs uppercase tracking-wider mb-0.5">
                    Call the studio
                  </p>
                  <p
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                    className="text-white text-xl"
                  >
                    091 760 007
                  </p>
                </div>
              </div>
              <a
                href="tel:0917600007"
                className="bg-[#FF6B00] hover:bg-[#FF8C3A] text-white text-sm font-semibold px-5 py-2.5 transition-colors duration-200 cursor-pointer uppercase tracking-wide"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Call Now
              </a>
            </div>

            {/* Maps button */}
            <a
              href="https://maps.google.com/?q=Tuam+Road+Retail+Centre+Galway+Ireland"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-[rgba(255,107,0,0.2)] hover:border-[rgba(255,107,0,0.5)] text-[#9A9A9A] hover:text-[#FF6B00] py-4 transition-all duration-200 cursor-pointer text-sm font-medium uppercase tracking-wide"
            >
              <Navigation size={15} />
              Open in Google Maps
            </a>

            {/* Parking note */}
            <div className="flex items-center gap-3 p-4 bg-[rgba(255,107,0,0.04)] border border-[rgba(255,107,0,0.1)] rounded-sm">
              <Car size={15} className="text-[#FF6B00] flex-shrink-0" />
              <p className="text-[#666] text-sm">
                Free parking available at Tuam Road Retail Centre.
              </p>
            </div>
          </motion.div>

          {/* Hours + map placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Animated map placeholder */}
            {/*
              REPLACE: Embed a real map here.
              Options: Google Maps embed, Mapbox, Leaflet.
              Current: animated placeholder with pulsing marker.
            */}
            <div className="relative h-52 glass-card rounded-sm overflow-hidden flex items-center justify-center">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 50%, rgba(255,107,0,0.06) 0%, rgba(17,17,17,0) 70%)",
                }}
              />
              {/* Grid lines (map feel) */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,107,0,0.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,107,0,0.5) 1px, transparent 1px)
                  `,
                  backgroundSize: "30px 30px",
                }}
              />
              {/* Pulsing marker */}
              <div className="relative">
                {pulse && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full bg-[#FF6B00]"
                      style={{
                        animation: "pulseRing 2s ease-out infinite",
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-full bg-[#FF6B00] opacity-40"
                      style={{
                        animation: "pulseRing 2s ease-out infinite 0.5s",
                      }}
                    />
                  </>
                )}
                <div className="relative w-5 h-5 rounded-full bg-[#FF6B00] border-2 border-white shadow-lg z-10" />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[#444] text-xs text-center">
                  Tuam Road Retail Centre, Galway · H91 YH39
                  {/* REPLACE: Replace this placeholder with an embedded map iframe */}
                </p>
              </div>
            </div>

            {/* Staffed hours */}
            <div className="glass-card p-7 rounded-sm" id="hours">
              <div className="flex items-center gap-3 mb-6">
                <Clock size={16} className="text-[#FF6B00]" />
                <p
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                  className="text-white text-xl uppercase"
                >
                  Staffed Hours
                </p>
              </div>

              <div className="space-y-3">
                {hours.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 border-b border-[rgba(255,255,255,0.04)] last:border-0"
                  >
                    <span className="text-[#666] text-sm">{h.day}</span>
                    <span
                      className={`text-sm font-semibold ${
                        h.time === "Unstaffed" ? "text-[#444]" : "text-white"
                      }`}
                    >
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-[rgba(255,107,0,0.1)]">
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1.5 flex-shrink-0" />
                  <p className="text-[#7A7A7A] text-sm leading-relaxed">
                    Members have{" "}
                    <span className="text-white font-medium">
                      24-hour access, Monday to Sunday
                    </span>
                    . Staffed hours are for guidance, inductions and enquiries.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
