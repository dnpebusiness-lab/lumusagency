/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';
import { REVIEWS_DATA } from '../data';

export default function ReviewsSection() {
  return (
    <section id="guest-reviews-section" className="py-20 lg:py-28 bg-brand-espresso relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16 space-y-4 gsap-reveal">
          <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-white/35">
            Guest Experiences
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight font-bold">
            What our guests say.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/8">
          {REVIEWS_DATA.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 lg:p-10 bg-brand-espresso hover:bg-white/5 transition-colors duration-500 flex flex-col"
            >
              <Quote size={22} className="text-white/12 mb-5 flex-shrink-0" />

              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    fill={i < Math.floor(review.rating) ? 'white' : 'none'}
                    className={i < Math.floor(review.rating) ? 'text-white' : 'text-white/15'}
                  />
                ))}
                <span className="text-[10px] font-mono text-white/30 ml-2">{review.rating}/5</span>
              </div>

              <p className="text-sm text-white/70 leading-relaxed font-sans flex-1 mb-6 italic font-light">
                &ldquo;{review.comment}&rdquo;
              </p>

              <div className="border-t border-white/8 pt-5 flex justify-between items-end">
                <div>
                  <p className="text-sm font-serif font-semibold text-white">{review.author}</p>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mt-0.5">{review.roomStayed}</p>
                </div>
                <p className="text-[10px] font-mono text-white/20 italic">{review.stayDate}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
