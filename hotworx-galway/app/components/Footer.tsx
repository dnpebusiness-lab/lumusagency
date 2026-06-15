"use client";
import { Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink-2">
      <div className="max-w-[1180px] mx-auto px-7 sm:px-14 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <div className="font-display font-extrabold text-[26px] tracking-tight mb-4">
              HOT<span className="text-ember">WORX</span>
              <span className="text-ash text-[14px] font-body font-normal ml-2 align-middle">
                Galway
              </span>
            </div>
            <p className="text-ash text-[15px] max-w-[34ch] leading-relaxed mb-6">
              The only 24-hour infrared studio in the city. Train hot, finish
              fast — Tuam Road, beside Wayfair.
            </p>
            <a
              href="#book"
              className="btn-heat inline-block bg-ember text-[#1a0600] hover:bg-burnt text-[14px] font-medium px-6 py-3 transition-colors duration-300 cursor-pointer"
            >
              Book free workout
            </a>
          </div>

          <div>
            <p className="chapter mb-5">Find us</p>
            <p className="text-ash text-[14px] leading-[1.9]">
              Tuam Road Retail Centre
              <br />
              Galway · H91 YH39
              <br />
              <a href="tel:0917600007" className="text-paper hover:text-ember inline-flex items-center gap-1.5 mt-1 cursor-pointer transition-colors">
                <Phone size={12} /> 091 760 007
              </a>
            </p>
          </div>

          <div>
            <p className="chapter mb-5">Front desk</p>
            <p className="text-ash text-[14px] leading-[1.9]">
              Mon–Thu 11am – 8pm
              <br />
              Fri 9am – 6pm
              <br />
              Sat 9am – 2pm
              <br />
              <span className="text-ember">Members in 24/7</span>
            </p>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-ash/50 text-[12px]">
            © {new Date().getFullYear()} HOTWORX Galway. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {/* REPLACE: link real policy pages before launch */}
            <a href="#" className="text-ash/50 hover:text-ash text-[12px] cursor-pointer transition-colors">
              Privacy
            </a>
            <a href="#" className="text-ash/50 hover:text-ash text-[12px] cursor-pointer transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
