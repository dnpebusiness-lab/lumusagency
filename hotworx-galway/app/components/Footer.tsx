"use client";
import { MapPin, Phone, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-[rgba(255,255,255,0.04)] bg-[#060606]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-1 mb-4">
              <span
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "24px" }}
                className="text-white uppercase"
              >
                HOT
              </span>
              <span
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "24px" }}
                className="text-[#FF6B00] uppercase"
              >
                WORX
              </span>
              <span
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 400, fontSize: "24px" }}
                className="text-[#333] uppercase ml-2"
              >
                Galway
              </span>
            </div>
            <p className="text-[#444] text-sm leading-relaxed max-w-xs mb-6">
              Galway&apos;s only 24/7 infrared fitness studio. Infrared sauna
              workouts, HIIT, isometric training and functional fitness — all in
              one place on Tuam Road.
            </p>
            <a
              href="#book"
              className="inline-block bg-[#FF6B00] hover:bg-[#FF8C3A] text-white text-sm font-bold px-6 py-2.5 uppercase tracking-wide transition-colors duration-200 cursor-pointer"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Book Free Workout
            </a>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[#FF6B00] text-xs uppercase tracking-[0.2em] font-semibold mb-5">
              Contact
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={13} className="text-[#FF6B00] mt-0.5 flex-shrink-0" />
                <p className="text-[#444] text-sm leading-relaxed">
                  Tuam Road Retail Centre
                  <br />
                  Galway City, H91 YH39
                  <br />
                  Ireland
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={13} className="text-[#FF6B00] flex-shrink-0" />
                <a
                  href="tel:0917600007"
                  className="text-[#444] hover:text-white text-sm transition-colors duration-200 cursor-pointer"
                >
                  091 760 007
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <p className="text-[#FF6B00] text-xs uppercase tracking-[0.2em] font-semibold mb-5">
              Staffed Hours
            </p>
            <div className="space-y-2">
              {[
                { d: "Mon – Thu", t: "11am – 8pm" },
                { d: "Friday", t: "9am – 6pm" },
                { d: "Saturday", t: "9am – 2pm" },
                { d: "Members", t: "24/7 Access" },
              ].map((h) => (
                <div key={h.d} className="flex items-center justify-between gap-4">
                  <span className="text-[#333] text-xs">{h.d}</span>
                  <span className={`text-xs ${h.d === "Members" ? "text-[#FF6B00] font-semibold" : "text-[#444]"}`}>
                    {h.t}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-[rgba(255,255,255,0.04)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#2A2A2A] text-xs">
            © {new Date().getFullYear()} HOTWORX Galway. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {/* REPLACE: Add real policy page links */}
            <a href="#" className="text-[#2A2A2A] hover:text-[#555] text-xs transition-colors duration-200 cursor-pointer">
              Privacy Policy
            </a>
            <a href="#" className="text-[#2A2A2A] hover:text-[#555] text-xs transition-colors duration-200 cursor-pointer">
              Terms
            </a>
            <a
              href="https://www.hotworx.net/studio/ireland-galway-tuamroad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2A2A2A] hover:text-[#555] text-xs transition-colors duration-200 cursor-pointer"
            >
              Official HOTWORX Site
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
