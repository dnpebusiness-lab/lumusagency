/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Footprints, Navigation, School, HeartPulse, Compass, Tent } from 'lucide-react';
import { LOCATION_HIGHLIGHTS } from '../data';

export default function MapEmbed() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all',      label: 'All Highlights', icon: Compass   },
    { id: 'academic', label: 'University',     icon: School    },
    { id: 'medical',  label: 'Hospital',       icon: HeartPulse },
    { id: 'culture',  label: 'City & Culture', icon: Navigation },
    { id: 'coast',    label: 'Coastal Days',   icon: Tent      },
  ];

  const filteredHighlights =
    activeCategory === 'all'
      ? LOCATION_HIGHLIGHTS
      : LOCATION_HIGHLIGHTS.filter(item => item.category === activeCategory);

  const encodedAddress = encodeURIComponent('25 Lower Newcastle Road, Galway, H91 X466, Ireland');
  const gmapsEmbedUrl  = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="location-and-surroundings-section" className="py-20 lg:py-28 bg-brand-beige border-t border-brand-stone relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 gsap-reveal">
          <span className="text-xs uppercase tracking-widest font-mono text-brand-mocha-light flex items-center justify-center gap-1.5">
            <MapPin size={13} className="text-brand-mocha" />
            Galway, Newcastle Area
          </span>
          <h2 className="text-4xl font-serif text-brand-charcoal tracking-tight">
            Newcastle Central.{' '}
            <span className="italic font-light">On the doorstep of everything.</span>
          </h2>
          <p className="text-sm font-sans text-brand-mocha/95 max-w-2xl mx-auto">
            Situated at <span className="text-brand-charcoal font-medium">25 Lower Newcastle, Galway</span>, our boutique guest house offers immediate proximity to both professional hubs and rich cultural seaside centres.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-stretch">

          {/* Left: Distance directory */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-serif text-brand-charcoal tracking-tight font-semibold">Explore Walking Times</h3>
              <div className="flex flex-wrap gap-2 pb-2">
                {categories.map(({ id, label, icon: Icon }) => {
                  const isActive = activeCategory === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveCategory(id)}
                      className={`text-xs px-3 py-2 cursor-pointer transition-all duration-200 flex items-center gap-1.5 font-sans border ${
                        isActive
                          ? 'bg-brand-espresso text-white border-brand-espresso'
                          : 'bg-white hover:bg-brand-stone/30 text-brand-charcoal border-brand-stone'
                      }`}
                    >
                      <Icon size={12} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[440px] pr-2">
              <AnimatePresence mode="popLayout">
                {filteredHighlights.map((highlight) => (
                  <motion.div
                    key={highlight.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-white border border-brand-stone/50 hover:border-brand-mocha/25 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h4 className="font-serif text-sm font-semibold text-brand-charcoal">{highlight.name}</h4>
                      <span className="flex-shrink-0 bg-brand-stone/40 text-brand-charcoal px-2.5 py-0.5 text-[10px] font-mono flex items-center gap-1">
                        <Footprints size={10} className="text-brand-mocha" />
                        {highlight.timeWalking}
                      </span>
                    </div>
                    <p className="text-xs text-brand-mocha leading-relaxed font-sans mb-2">{highlight.description}</p>
                    <div className="text-[10px] text-brand-mocha-light font-mono flex items-center gap-1">
                      <Navigation size={9} />
                      <span>Approx {highlight.distance} from guest rooms</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="bg-brand-espresso text-white p-4 space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-wider text-white/50 font-bold">Property Address</p>
              <p className="font-sans font-medium text-white text-sm">25 Lower Newcastle, Galway, Co. Galway, H91 X466, Ireland</p>
              <p className="font-mono text-[10px] text-white/40 italic mt-1">★ Directly above Mocha Beans Café & Roastery</p>
            </div>
          </div>

          {/* Right: Map embed */}
          <div className="lg:col-span-7 h-[400px] lg:h-auto min-h-[450px]">
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full overflow-hidden border border-brand-stone shadow-lg bg-white relative p-1.5"
            >
              <iframe
                title="1997 Stays Galway Map Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={gmapsEmbedUrl}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
