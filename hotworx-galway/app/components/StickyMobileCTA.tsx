"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
          <div
            className="flex items-center gap-3 p-3 mx-3 mb-3 rounded-sm"
            style={{
              background: "rgba(8,8,8,0.97)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,107,0,0.2)",
            }}
          >
            <a
              href="#book"
              className="flex-1 bg-[#FF6B00] hover:bg-[#FF8C3A] text-white text-center font-bold py-3.5 uppercase tracking-wide transition-colors duration-200 cursor-pointer rounded-sm text-sm"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px" }}
            >
              Book Free Workout
            </a>
            <a
              href="tel:0917600007"
              aria-label="Call HOTWORX Galway"
              className="flex items-center justify-center w-12 h-12 border border-[rgba(255,107,0,0.25)] hover:border-[rgba(255,107,0,0.6)] hover:bg-[rgba(255,107,0,0.1)] transition-all duration-200 cursor-pointer rounded-sm flex-shrink-0"
            >
              <Phone size={17} className="text-[#FF6B00]" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
