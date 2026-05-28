/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Coffee, Zap, Wifi, Ban, KeyRound } from 'lucide-react';
import { AMENITIES_DATA } from '../data';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Smartphone, Coffee, Zap, Wifi, Ban, KeyRound,
};

export default function AmenitiesSection() {
  return (
    <section id="amenities-section" className="py-20 lg:py-28 bg-brand-beige border-t border-brand-stone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16 space-y-4 gsap-reveal">
          <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-brand-mocha-light">
            What&rsquo;s Included
          </span>
          <h2 className="text-4xl font-serif text-brand-espresso tracking-tight font-semibold">
            Property Amenities
          </h2>
          <p className="text-sm text-brand-mocha max-w-md mx-auto font-sans">
            Everything you need, nothing you don&rsquo;t. Every amenity included in the nightly rate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-stone">
          {AMENITIES_DATA.map((amenity, idx) => {
            const Icon = ICON_MAP[amenity.iconName] || Smartphone;
            return (
              <motion.div
                key={amenity.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.07 }}
                className="p-8 bg-white hover:bg-brand-beige transition-colors duration-300 flex flex-col gap-5 group"
              >
                <div className="p-3 bg-brand-espresso text-white w-max group-hover:bg-brand-mocha transition-colors duration-300">
                  <Icon size={20} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl text-brand-espresso font-semibold leading-snug">{amenity.name}</h3>
                  <p className="text-sm text-brand-mocha-light font-sans leading-relaxed">{amenity.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
