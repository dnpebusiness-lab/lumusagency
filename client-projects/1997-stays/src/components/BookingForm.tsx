/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, Percent, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { ROOMS_DATA, generateCloudbedsLink } from '../data';
import { BookingDetails } from '../types';

interface BookingFormProps {
  initialRoomId?: string;
  className?: string;
  onSuccess?: () => void;
}

export default function BookingForm({ initialRoomId = 'all-rooms', className = '', onSuccess }: BookingFormProps) {
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const [booking, setBooking] = useState<BookingDetails>({
    checkIn:   getTodayString(1),
    checkOut:  getTodayString(2),
    guests:    2,
    roomType:  initialRoomId,
    promoCode: '',
  });

  const [nights, setNights]               = useState<number>(1);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading]         = useState(false);

  useEffect(() => {
    if (initialRoomId) setBooking(prev => ({ ...prev, roomType: initialRoomId }));
  }, [initialRoomId]);

  useEffect(() => {
    if (booking.checkIn && booking.checkOut) {
      const start = new Date(booking.checkIn);
      const end   = new Date(booking.checkOut);
      const diff  = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      const safeNights = diff > 0 ? diff : 1;
      setNights(safeNights);
      if (booking.roomType !== 'all-rooms') {
        const room = ROOMS_DATA.find(r => r.id === booking.roomType);
        setEstimatedPrice(room ? room.pricePerNight * safeNights : null);
      } else {
        setEstimatedPrice(null);
      }
    }
  }, [booking.checkIn, booking.checkOut, booking.roomType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBooking(prev => ({ ...prev, [name]: value }));
  };

  const executeReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const finalUrl = generateCloudbedsLink(
        booking.checkIn,
        booking.checkOut,
        booking.guests,
        booking.roomType === 'all-rooms' ? undefined : booking.roomType,
        booking.promoCode || undefined
      );
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      if (onSuccess) onSuccess();
    }, 900);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-white text-brand-charcoal p-8 lg:p-10 relative overflow-hidden ${ className}`}
    >
      {/* Subtle Est. 1997 stamp */}
      <div className="absolute top-4 right-4 pointer-events-none opacity-8 hidden sm:flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border border-dashed border-brand-mocha/40 flex items-center justify-center">
          <span className="font-serif text-[8px] text-brand-mocha/40 italic">Est.{' '}1997</span>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-1 w-1 rounded-full bg-brand-mocha" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-brand-mocha">Direct Booking Benefit Applied</span>
        </div>

        <h3 className="text-3xl font-serif text-brand-espresso tracking-tight mb-8">Check Availability</h3>

        <form onSubmit={executeReservation} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {([
              { id: 'check-in-date',  name: 'checkIn',  label: 'Arrival',    min: getTodayString() },
              { id: 'check-out-date', name: 'checkOut', label: 'Departure',  min: booking.checkIn || getTodayString(1) },
            ] as const).map((field) => (
              <div key={field.id} className="flex flex-col border-b border-brand-cream-dark pb-2">
                <label htmlFor={field.id} className="flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-brand-charcoal/50 mb-1">
                  <Calendar size={11} className="text-brand-mocha-light" />
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type="date"
                  name={field.name}
                  value={booking[field.name as keyof Pick<BookingDetails, 'checkIn' | 'checkOut'>]}
                  min={field.min}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-none text-brand-charcoal text-sm focus:outline-none font-sans cursor-pointer mt-1"
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col border-b border-brand-cream-dark pb-2">
            <label htmlFor="room-selection" className="flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-brand-charcoal/50 mb-1">
              <Sparkles size={11} className="text-brand-mocha-light" />
              Room / Suite
            </label>
            <select
              id="room-selection"
              name="roomType"
              value={booking.roomType}
              onChange={handleInputChange}
              className="w-full bg-transparent border-none text-brand-charcoal text-sm focus:outline-none font-serif cursor-pointer mt-1"
            >
              <option value="all-rooms">Browse All Guest Suites</option>
              {ROOMS_DATA.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} — from €{room.pricePerNight}/night
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col border-b border-brand-cream-dark pb-2">
              <label htmlFor="guest-occupants" className="flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-brand-charcoal/50 mb-1">
                <Users size={11} className="text-brand-mocha-light" />
                Guests
              </label>
              <select
                id="guest-occupants"
                name="guests"
                value={booking.guests}
                onChange={handleInputChange}
                className="w-full bg-transparent border-none text-brand-charcoal text-sm focus:outline-none font-sans cursor-pointer mt-1"
              >
                {[1,2,3,4].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
              </select>
            </div>
            <div className="flex flex-col border-b border-brand-cream-dark pb-2">
              <label htmlFor="promo-code" className="flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-brand-charcoal/50 mb-1">
                <Percent size={11} className="text-brand-mocha-light" />
                Promo Code
              </label>
              <input
                id="promo-code"
                type="text"
                name="promoCode"
                placeholder="Optional"
                value={booking.promoCode}
                onChange={handleInputChange}
                className="w-full bg-transparent border-none text-brand-charcoal text-sm uppercase placeholder:text-brand-charcoal/20 focus:outline-none font-sans mt-1"
              />
            </div>
          </div>

          {booking.roomType !== 'all-rooms' && estimatedPrice !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-brand-beige p-4 border border-brand-cream-dark space-y-2 mt-4 text-sm"
            >
              <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-brand-espresso/50">
                <span>Rate breakdown:</span>
                <span>{nights} {nights === 1 ? 'night' : 'nights'}</span>
              </div>
              <div className="flex justify-between font-serif">
                <span className="text-brand-espresso italic">Estimated Room Cost</span>
                <span className="text-brand-charcoal font-semibold font-sans">€{estimatedPrice}</span>
              </div>
              <div className="h-px bg-brand-espresso/8 my-2" />
              <div className="text-[11px] text-brand-espresso/70 leading-relaxed font-sans space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-brand-mocha mt-1.5" />
                  <span>10% off coffee &amp; food at Mocha Beans downstairs</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-brand-mocha mt-1.5" />
                  <span>Free gigabit Wi-Fi &amp; instant contactless check-in</span>
                </div>
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-espresso text-white hover:bg-brand-mocha font-sans font-bold tracking-[0.2em] text-xs uppercase py-5 transition-all duration-300 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Checking Availability...
              </span>
            ) : (
              <>
                <span>Search for Availability</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-brand-charcoal/40 font-mono tracking-wider uppercase">
          <ShieldCheck size={12} className="text-brand-mocha" />
          <span>Direct Booking Benefit Applied</span>
        </div>
      </div>
    </motion.div>
  );
}
