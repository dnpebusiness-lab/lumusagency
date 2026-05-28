/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Coffee, Award, Sparkles, Percent, Plus } from 'lucide-react';
import { IMAGES } from '../data';

export default function CafeSection() {
  const menuHighlights = [
    { name: "Award-winning House Espresso",     desc: "Craft roasted in Galway, triple origin beans.",                             price: "Incl. in 10% discount" },
    { name: "The Newcastle Sourdough Brunch",   desc: "Fresh organic eggs, local Irish bacon, avocado & sourdough.",              price: "Average ~€11.5" },
    { name: "Smote Mocha Hot Choc Trio",        desc: "Roasted with pure cocoa, served with homemade marshmallows.",              price: "Average ~€4.5" },
    { name: "Seasonal Roasted Squash Salad",    desc: "Fresh leaves, local goats cheese & house mustard vinaigrette.",           price: "Average ~€9.5" },
  ];

  return (
    <section id="mocha-beans-experience-section" className="py-20 lg:py-28 bg-brand-charcoal text-white relative overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left: Image */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="absolute -inset-4 border border-white/8 pointer-events-none" />
              <div className="relative aspect-[4/3] w-full overflow-hidden shadow-2xl border border-white/8">
                <img
                  src={IMAGES.cafe}
                  alt="Mocha Beans Cafe Galway"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                />

                {/* Floating 10% badge */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-5 -right-5 md:bottom-8 md:right-8 bg-white text-brand-espresso border border-brand-stone p-5 shadow-xl flex flex-col items-center justify-center text-center w-32 h-32 z-10"
                >
                  <div className="bg-brand-espresso text-white px-2 py-0.5 text-[7px] font-mono tracking-wider uppercase mb-1">
                    Stay Benefit
                  </div>
                  <span className="text-[10px] font-sans font-bold tracking-[0.1em] uppercase text-brand-mocha mt-1">Direct Perk</span>
                  <span className="text-3xl font-serif text-brand-espresso font-semibold my-1">10% Off</span>
                  <span className="text-[8px] font-sans text-brand-mocha-light leading-tight">Newcastle Café Menu</span>
                </motion.div>
              </div>

              <div className="hidden md:flex gap-3 mt-6 justify-center">
                {[
                  { Icon: Coffee, label: 'Newcastle Favourite' },
                  { Icon: Award,  label: 'Award-Winning Coffee' },
                ].map(({ Icon, label }) => (
                  <span key={label} className="bg-white/5 border border-white/8 text-white/60 text-[10px] font-mono tracking-wider uppercase px-3 py-1.5 flex items-center gap-1.5">
                    <Icon size={11} className="text-white/40" />
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-8">
            <div className="space-y-4 gsap-reveal">
              <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-white/40 flex items-center gap-2">
                <Sparkles size={12} className="text-white/40" />
                The Downstairs Experience
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight leading-[1.15]">
                More than a stay.<br />
                <span className="text-white/50 font-light italic">Artisan coffee &amp; brunch, everyday.</span>
              </h2>
            </div>

            <p className="text-white/65 text-base md:text-lg leading-relaxed font-sans max-w-2xl">
              1997 Stays rests directly above <strong className="text-white font-semibold">Mocha Beans Café</strong>, Galway’s beloved artisan local coffee hub. Every morning, the rich aroma of premium, freshly roasted coffee rises to greet you.
            </p>

            <div className="p-6 bg-white/5 border border-white/10 relative">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 text-white flex-shrink-0">
                  <Coffee size={22} />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-white mb-1.5">Your Golden Key Reference</h4>
                  <p className="text-sm text-white/60 leading-relaxed font-sans">
                    No complex voucher codes. Simply present your direct booking reference confirmation on your smartphone to the baristas at the till for a warm 10% off any coffee, breakfast, or pastry during your Galway retreat.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-sans text-white/35 font-bold tracking-[0.2em] uppercase border-b border-white/8 pb-2 flex items-center justify-between">
                <span>Mocha Beans Menu Specialties</span>
                <span className="text-[10px] text-white/25 lowercase italic normal-case font-serif">10% off for all stay guests</span>
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                {menuHighlights.map((dish, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2 border-b border-white/5 pb-2">
                    <div>
                      <h6 className="text-xs font-semibold text-white flex items-center gap-1">
                        <Plus size={10} className="text-white/30" />
                        {dish.name}
                      </h6>
                      <p className="text-[10px] text-white/40 leading-normal mt-0.5">{dish.desc}</p>
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-white/30 flex-shrink-0 pt-0.5 whitespace-nowrap">
                      {dish.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
