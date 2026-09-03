/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Users, Bed, Sparkles, MoveRight, Layers, MapPin, CheckCircle } from 'lucide-react';
import { RoomType } from '../types';

interface RoomCardProps {
  room: RoomType;
  onSelect: (roomId: string) => void;
}

export default function RoomCard({ room, onSelect }: RoomCardProps) {
  const cardRef               = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // Subtle 3D tilt tracks mouse position relative to card centre
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const box = cardRef.current.getBoundingClientRect();
    const x   = e.clientX - box.left  - box.width  / 2;
    const y   = e.clientY - box.top   - box.height / 2;
    setRotateX(-(y / (box.height / 2)) * 3.5);
    setRotateY( (x / (box.width  / 2)) * 3.5);
  };

  const handleMouseLeave = () => { setRotateX(0); setRotateY(0); };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        id={`room-${room.id}`}
        animate={{
          rotateX: rotateX,
          rotateY: rotateY,
          scale:   rotateX !== 0 ? 1.015 : 1,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="h-full bg-white overflow-hidden border border-brand-stone flex flex-col group transition-shadow duration-300"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-stone/20">
          <img
            src={room.image}
            alt={room.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/40 to-transparent" />

          {/* Price badge */}
          <div className="absolute top-4 right-4 bg-brand-espresso text-white px-3.5 py-2 font-sans text-[10px] tracking-wider uppercase flex items-center gap-1 font-semibold">
            <span>from</span>
            <span className="font-serif text-sm font-bold">€{room.pricePerNight}</span>
            <span>/ night</span>
          </div>

          {/* Occupancy + size badges */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="bg-white text-brand-espresso px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase flex items-center gap-1">
              <Users size={10} className="text-brand-mocha" />
              {room.occupancy}
            </span>
            <span className="bg-white text-brand-espresso px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase flex items-center gap-1">
              <Layers size={10} className="text-brand-mocha" />
              {room.size}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-2xl font-serif text-brand-espresso font-semibold tracking-tight transition-colors group-hover:text-brand-mocha">
                {room.name}
              </h4>
              <Sparkles size={14} className="text-brand-mocha-light/50 mt-1 flex-shrink-0" />
            </div>

            <p className="text-[10px] font-mono text-brand-mocha tracking-widest uppercase mb-4 flex items-center gap-1.5">
              <Bed size={12} />
              {room.bedType}
            </p>

            <p className="text-sm text-brand-mocha-light leading-relaxed mb-6 font-sans">
              {room.description}
            </p>

            <div className="space-y-2 mb-6">
              <h5 className="text-[10px] font-sans text-brand-charcoal/35 font-bold tracking-[0.2em] uppercase border-b border-brand-cream-dark pb-1.5 mb-3">
                Location Highlights
              </h5>
              {room.features.slice(0, 3).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-brand-charcoal/85">
                  <MapPin size={12} className="text-brand-mocha mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {room.amenities.slice(0, 3).map((amen, idx) => (
                <span
                  key={idx}
                  className="bg-brand-beige text-brand-mocha text-[9px] font-mono uppercase tracking-wider px-2.5 py-1 border border-brand-cream-dark"
                >
                  {amen}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-5 border-t border-brand-cream-dark">
            <button
              id={`book-room-${room.id}`}
              onClick={() => onSelect(room.id)}
              className="w-full bg-brand-espresso text-white hover:bg-brand-mocha font-sans font-bold text-[10px] tracking-[0.15em] uppercase py-3.5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Instant Reserve</span>
              <MoveRight size={12} />
            </button>
            <a
              id={`cloudbeds-room-link-${room.id}`}
              href={room.cloudbedsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-brand-beige hover:bg-white text-brand-charcoal border border-brand-cream-dark text-[10px] font-sans font-bold text-center py-3 tracking-[0.15em] uppercase transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <span>Verify Direct Rates</span>
              <CheckCircle size={10} className="text-brand-mocha" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
