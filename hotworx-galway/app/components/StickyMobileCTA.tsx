"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";

export default function StickyMobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const atBook =
        (document.getElementById("book")?.getBoundingClientRect().top ?? 9999) <
        window.innerHeight;
      setShow(window.scrollY > 500 && !atBook);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 90 }}
          animate={{ y: 0 }}
          exit={{ y: 90 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 inset-x-0 z-50 lg:hidden p-3"
        >
          {/* integrated bar, sits on a warm-lit base — not a plugin strip */}
          <div className="flex items-center gap-2.5 p-2.5 bg-ink/95 backdrop-blur-xl border border-line">
            <a
              href="#book"
              className="btn-heat flex-1 bg-ember text-[#1a0600] text-center font-medium py-3.5 cursor-pointer"
            >
              Book free workout
            </a>
            <a
              href="tel:0917600007"
              aria-label="Call HOTWORX Galway"
              className="flex items-center justify-center w-12 h-12 border border-line text-ember cursor-pointer"
            >
              <Phone size={18} />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
