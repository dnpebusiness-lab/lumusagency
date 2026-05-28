/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coffee,
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  CheckCircle2,
  Clock,
  ArrowRight,
  Smartphone,
  Wifi,
  Ban,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Plus,
  Minus,
  X,
  Award
} from 'lucide-react';
import { ROOMS_DATA, FAQS_DATA, IMAGES, generateCloudbedsLink } from './data';
import BookingForm from './components/BookingForm';
import RoomCard from './components/RoomCard';
import CafeSection from './components/CafeSection';
import MapEmbed from './components/MapEmbed';
import ReviewsSection from './components/ReviewsSection';
import AmenitiesSection from './components/AmenitiesSection';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
    THREE: any;
  }
}

export default function App() {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all-rooms');
  const [activeFAQ, setActiveFAQ] = useState<string | null>(null);
  const [isMobileBookingOpen, setIsMobileBookingOpen] = useState<boolean>(false);
  const [showDirectModal, setShowDirectModal] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const heroThreeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP ScrollTrigger: hero entrance + section reveals
  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST) return;

    gsap.registerPlugin(ST);

    const heroTl = gsap.timeline({ delay: 0.35 });
    heroTl
      .from('.hero-tag',   { opacity: 0, y: 18, stagger: 0.1,  duration: 0.65, ease: 'power3.out' })
      .from('.hero-title', { opacity: 0, y: 28,                 duration: 0.85, ease: 'power3.out' }, '-=0.3')
      .from('.hero-sub',   { opacity: 0, y: 18,                 duration: 0.7,  ease: 'power2.out' }, '-=0.4')
      .from('.hero-ctas',  { opacity: 0, y: 16,                 duration: 0.6,  ease: 'power2.out' }, '-=0.3')
      .from('.hero-meta',  { opacity: 0,                        duration: 0.5              }, '-=0.1');

    const revealConfig = (xFrom: number, yFrom: number) => ({
      from: { opacity: 0, x: xFrom, y: yFrom },
      to:   { opacity: 1, x: 0,     y: 0, duration: 1, ease: 'power3.out' },
    });

    gsap.utils.toArray<HTMLElement>('.gsap-reveal').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 32 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      });
    });

    gsap.utils.toArray<HTMLElement>('.gsap-reveal-left').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, x: -32 }, {
        opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      });
    });

    gsap.utils.toArray<HTMLElement>('.gsap-reveal-right').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, x: 32 }, {
        opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      });
    });

    return () => ST.getAll().forEach((t: any) => t.kill());
  }, []);

  // Three.js: subtle particle field behind hero image
  useEffect(() => {
    const container = heroThreeRef.current;
    const THREE = window.THREE;
    if (!container || !THREE) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen';
    container.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 7;

    const count = 1500;
    const pos   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.022, transparent: true, opacity: 0.28, sizeAttenuation: true });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    let mx = 0, my = 0;
    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth)  - 0.5;
      my = -(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMouse);

    let fid: number;
    const clock = new THREE.Clock();
    const tick = () => {
      fid = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      pts.rotation.y = t * 0.012 + mx * 0.14;
      pts.rotation.x = my * 0.07;
      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(fid);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    scrollToSection('reservation-panel');
    if (window.innerWidth < 1024) setIsMobileBookingOpen(true);
  };

  const handleBookingCompleted = () => {
    setShowDirectModal(true);
    setIsMobileBookingOpen(false);
  };

  const features = [
    { icon: MapPin,    title: "Prestigious Newcastle Location",    desc: "Perfect positioning directly across from the University of Galway gates and a 2-minute walk to Galway University Hospital." },
    { icon: Coffee,    title: "Mocha Beans Café Downstairs",       desc: "Enjoy immediate, boutique access to craft award-winning espresso blends, premium brunch plates, and fresh lunches daily." },
    { icon: Award,     title: "10% Guest Discount Perk",           desc: "Show your digital booking reference at the till downstairs to save 10% on your café beverages and food during your stay." },
    { icon: KeyRound,  title: "Express Contactless Check-in",      desc: "Check in starts securely at 14:00 with digital key codes sent straight to your phone. Zero reception line delay." },
    { icon: Sparkles,  title: "Tailored Comfortable Rooms",        desc: "From solo researcher retreats to king stays and functional family layouts, every room is immaculately maintained." },
  ];

  return (
    <div className="min-h-screen bg-brand-beige font-sans flex flex-col antialiased text-brand-charcoal selection:bg-brand-stone selection:text-brand-espresso">

      {/* Header */}
      <header
        id="app-navigation-header"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-brand-beige/96 backdrop-blur-md py-4 shadow-sm border-brand-stone'
            : 'bg-transparent py-6 border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => scrollToSection('app-root-hero')}
            className="flex flex-col text-left group cursor-pointer focus:outline-none"
          >
            <span className="font-serif text-lg md:text-xl font-bold uppercase tracking-wider text-brand-espresso group-hover:text-brand-mocha transition-colors">
              1997 Stays
            </span>
            <span className="font-mono text-[9px] tracking-widest uppercase text-brand-mocha-light">
              Newcastle, Galway
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-mono">
            {([
              ['Why Us',    'why-stay-section'],
              ['The Rooms', 'curated-rooms-section'],
              ['The Café',  'mocha-beans-experience-section'],
              ['Location',  'location-and-surroundings-section'],
              ['FAQs',      'essential-faqs-section'],
            ] as [string, string][]).map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="hover:text-brand-mocha transition-colors cursor-pointer"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="mailto:cathal.keogh@mochabeans.com"
              className="hidden sm:inline-block font-mono text-[10px] tracking-wider uppercase text-brand-mocha hover:text-brand-espresso transition-colors font-medium"
            >
              cathal.keogh@mochabeans.com
            </a>
            <button
              onClick={() => scrollToSection('reservation-panel')}
              className="bg-brand-espresso text-brand-beige hover:bg-brand-mocha px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-sans font-bold transition-all duration-300 cursor-pointer"
            >
              Book Direct
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="app-root-hero"
        className="relative min-h-screen lg:min-h-[920px] flex items-center pt-24 pb-16 lg:py-0 overflow-hidden"
      >
        {/* Background image + overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.hero}
            alt="1997 Stays Galway Boutique Room"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-[0.60] scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-espresso/93 via-brand-espresso/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-beige via-transparent to-brand-espresso/20" />
        </div>

        {/* Three.js particle canvas mount — blends over background in screen mode */}
        <div ref={heroThreeRef} className="absolute inset-0 z-[1] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left content */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8 text-white mt-8 lg:mt-0">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2.5">
                {['10% Café Discount', 'Directly Across from Uni', 'Contactless Check-in'].map((tag) => (
                  <span
                    key={tag}
                    className="hero-tag bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 text-[10px] font-mono tracking-widest uppercase flex items-center gap-1.5"
                  >
                    <span className="h-1 w-1 rounded-full bg-white/60" />
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-serif text-white tracking-tight leading-[1.08] max-w-2xl font-bold">
                Stay in Galway.{' '}
                <span className="font-light italic text-white/65 block md:inline">
                  Above one of the city's favourite cafés.
                </span>
              </h1>
            </div>

            <p className="hero-sub text-sm sm:text-base text-white/70 leading-relaxed max-w-xl font-sans font-light">
              A cozy boutique guest house in Newcastle, Galway. Positioned above the legendary{' '}
              <strong className="text-white font-medium">Mocha Beans Café and Roastery</strong>.
              Walk to the University in 1 minute, the Cathedral in 5, and Shop Street in 10.
            </p>

            <div className="hero-ctas flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <button
                onClick={() => scrollToSection('reservation-panel')}
                className="bg-white hover:bg-brand-beige text-brand-espresso font-sans font-semibold text-xs tracking-wider uppercase px-8 py-4 shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Check Availability</span>
                <ArrowRight size={13} />
              </button>
              <button
                onClick={() => scrollToSection('curated-rooms-section')}
                className="bg-transparent hover:bg-white/10 text-white border border-white/25 font-sans font-medium text-xs tracking-wider uppercase px-8 py-4 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Curated Rooms</span>
                <ChevronDown size={14} className="mt-0.5" />
              </button>
            </div>

            <div className="hero-meta pt-4 border-t border-white/10 max-w-lg flex justify-between items-center text-[11px] font-mono text-white/45">
              {[
                { label: 'Check-in: 14:00' },
                { label: 'Check-out: 12:00' },
                { label: '100% Smoke-Free' },
              ].map((item, i) => (
                <React.Fragment key={item.label}>
                  {i > 0 && <div className="h-4 w-px bg-white/10" />}
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-white/60" />
                    <span>{item.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right: Booking widget */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 self-center">
            <BookingForm
              initialRoomId={selectedRoomId}
              onSuccess={handleBookingCompleted}
              className="scale-95 origin-right border border-white/10 shadow-2xl backdrop-blur-md"
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-beige to-transparent pointer-events-none" />
      </section>

      {/* Why Stay */}
      <section id="why-stay-section" className="py-20 lg:py-28 bg-brand-beige border-t border-brand-stone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28 gsap-reveal-left">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-widest font-mono text-brand-mocha-light">A Tasteful Stay Experience</span>
                <h2 className="text-4xl font-serif text-brand-espresso font-semibold leading-tight tracking-tight">
                  Designed for convenience,<br />
                  <span className="italic font-light text-brand-mocha">finished for pure comfort.</span>
                </h2>
              </div>
              <p className="text-sm font-sans text-brand-mocha leading-relaxed">
                Whether you are visiting the leading Galway campuses, arriving for healthcare consultations, or escaping to explore the wild West of Ireland shoreline, 1997 Stays merges cozy boutique warmth with practical self-managed flexibility.
              </p>
              <div className="p-5 bg-brand-stone/40 border border-brand-stone flex items-center gap-4">
                <div className="p-3 bg-white text-brand-mocha flex-shrink-0">
                  <Coffee size={24} />
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-xs uppercase tracking-wider text-brand-charcoal">The 10% Coffee Club</h4>
                  <p className="text-[11px] text-brand-mocha leading-relaxed">
                    Show your booking reference at the till to receive a daily 10% discount on coffee, brunches, and treats at Mocha Beans Newcastle.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ x: 4 }}
                    className="flex gap-4 p-6 bg-white border border-brand-stone/40 hover:border-brand-mocha/20 transition-all duration-200"
                  >
                    <div className="p-3 bg-brand-espresso text-white flex-shrink-0">
                      <Icon size={18} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif font-semibold text-sm sm:text-base text-brand-charcoal">{feat.title}</h3>
                      <p className="text-xs sm:text-sm text-brand-mocha leading-relaxed font-sans">{feat.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* Rooms */}
      <section id="curated-rooms-section" className="py-20 lg:py-28 bg-white border-t border-brand-stone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-4 gsap-reveal">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest font-mono text-brand-mocha-light flex items-center gap-1.5">
                <Sparkles size={13} />
                Select Accommodations
              </span>
              <h2 className="text-4xl font-serif text-brand-espresso font-semibold tracking-tight">
                Curated Spaces &amp; Cabin Comforts
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-mocha leading-relaxed max-w-md font-sans">
              Four distinct room categories — each with full features, walking highlights, and direct Cloudbeds booking access.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
            {ROOMS_DATA.map((room) => (
              <RoomCard key={room.id} room={room} onSelect={handleRoomSelect} />
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <AmenitiesSection />

      {/* Café */}
      <CafeSection />

      {/* Location / Map */}
      <MapEmbed />

      {/* Guest Reviews */}
      <ReviewsSection />

      {/* FAQs */}
      <section id="essential-faqs-section" className="py-20 lg:py-28 bg-white border-t border-brand-stone/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            <div className="lg:col-span-5 space-y-8 gsap-reveal-left">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-widest font-mono text-brand-mocha-light">Stay Check-list</span>
                <h2 className="text-3xl font-serif text-brand-charcoal font-semibold tracking-tight">Practical Information</h2>
                <p className="text-xs sm:text-sm text-brand-mocha leading-relaxed">
                  Everything you need for a flawless, stress-free arrival and departure at 1997 Stays, Newcastle Galway.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Check In',  time: '14:00 onwards', note: 'Express digital codes provided on arrival day.' },
                  { label: 'Check Out', time: 'Up to 12:00',   note: 'Simply secure your door. No queue required.' },
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-brand-beige border border-brand-stone/60 space-y-2">
                    <div className="bg-white p-2 w-max text-brand-mocha"><Clock size={16} /></div>
                    <h4 className="font-mono text-[10px] uppercase tracking-wider text-brand-mocha-light">{item.label}</h4>
                    <p className="font-serif text-lg text-brand-charcoal font-semibold">{item.time}</p>
                    <p className="text-[10px] text-brand-mocha leading-normal">{item.note}</p>
                  </div>
                ))}
              </div>

              <div className="bg-brand-beige border border-brand-stone/60 p-5 space-y-4">
                <h4 className="text-xs font-mono text-brand-charcoal font-medium tracking-wider uppercase border-b border-brand-stone pb-2">
                  Included Free of Charge
                </h4>
                <div className="space-y-3.5">
                  {[
                    { Icon: Wifi,       text: 'Commercial High-Speed Gigabit Wi-Fi' },
                    { Icon: Ban,        text: 'Pristine 100% Smoke-Free Guest Rooms' },
                    { Icon: Smartphone, text: 'Keyless Smartphone Custom Touchpad Entry' },
                  ].map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-xs text-brand-charcoal">
                      <Icon size={14} className="text-brand-mocha" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <h5 className="text-[11px] font-mono text-brand-mocha-light font-bold uppercase tracking-widest">Co-host Support</h5>
                <div className="space-y-2 text-xs">
                  <a href="tel:+353868593757" className="flex items-center gap-2 text-brand-charcoal hover:text-brand-mocha transition-colors">
                    <Phone size={14} className="text-brand-mocha-light" />
                    <span>+353 86 859 3757</span>
                  </a>
                  <a href="mailto:cathal.keogh@mochabeans.com" className="flex items-center gap-2 text-brand-charcoal hover:text-brand-mocha transition-colors">
                    <Mail size={14} className="text-brand-mocha-light" />
                    <span>cathal.keogh@mochabeans.com</span>
                  </a>
                  <a href="https://mochabeans.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-charcoal hover:text-brand-mocha transition-colors">
                    <Globe size={14} className="text-brand-mocha-light" />
                    <span>mochabeans.com</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4 mt-8 lg:mt-0 gsap-reveal-right">
              <h3 className="text-lg font-serif text-brand-charcoal font-semibold px-1 pb-2">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {FAQS_DATA.map((faq) => {
                  const isOpen = activeFAQ === faq.id;
                  return (
                    <div key={faq.id} className="border border-brand-stone/70 overflow-hidden transition-all duration-300">
                      <button
                        onClick={() => setActiveFAQ(isOpen ? null : faq.id)}
                        className="w-full text-left px-5 sm:px-6 py-4 bg-brand-beige/20 hover:bg-brand-beige/50 font-serif text-sm sm:text-base font-semibold text-brand-charcoal flex justify-between items-center gap-4 cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <div className="p-1 bg-brand-stone/30 text-brand-mocha flex-shrink-0">
                          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-white"
                          >
                            <p className="px-5 sm:px-6 pb-5 pt-2 text-xs sm:text-sm text-brand-mocha font-sans leading-relaxed">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reservation Panel */}
      <section id="reservation-panel" className="py-16 lg:py-24 bg-brand-stone/20 border-t border-brand-stone/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-4 gsap-reveal">
            <span className="text-xs uppercase tracking-widest font-mono text-brand-mocha-light">Set Stay Timeline</span>
            <h2 className="text-3xl font-serif text-brand-charcoal tracking-tight font-semibold">Verify Availability &amp; Base Rates</h2>
            <p className="text-xs sm:text-sm text-brand-mocha">
              Input check-in and check-out timelines below. Specify room properties in the dropdown.
            </p>
          </div>
          <BookingForm
            initialRoomId={selectedRoomId}
            onSuccess={handleBookingCompleted}
            className="border border-brand-stone/40 bg-[#080808]"
          />
        </div>
      </section>

      {/* Closing CTA */}
      <section id="closing-cta-banner" className="bg-brand-espresso text-white py-20 lg:py-24 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/4 blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 space-y-8 gsap-reveal">
          <span className="font-mono text-xs uppercase tracking-widest text-white/35">Direct Booking Portal</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight font-bold">
            Comfort upstairs.<br />
            <span className="text-white/45 italic font-light">Great coffee downstairs.</span>
          </h2>
          <p className="text-white/55 text-sm leading-relaxed max-w-lg mx-auto font-sans font-light">
            Book directly today for guaranteed best rates, seamless contactless key setups, and an exclusive daily 10% café voucher at Mocha Beans Galway Newcastle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center max-w-md mx-auto pt-4">
            <button
              onClick={() => scrollToSection('reservation-panel')}
              className="bg-white hover:bg-brand-beige text-brand-espresso font-semibold font-sans text-xs uppercase tracking-wider py-4 px-8 shadow-lg transition-all cursor-pointer"
            >
              Check Availability Direct
            </button>
            <a
              href={generateCloudbedsLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent hover:bg-white/10 text-white font-semibold font-sans text-xs uppercase tracking-wider py-4 px-8 border border-white/20 transition-all text-center"
            >
              Cloudbeds Checkout Portal
            </a>
          </div>
          <div className="pt-6 flex justify-center items-center gap-3 text-[10px] text-white/25 font-mono">
            <span>Direct Booker Perks Enabled</span>
            <span>•</span>
            <span>No Booking Fees</span>
            <span>•</span>
            <span>Free Gigabit Wifi</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="app-footer-brand" className="bg-[#050505] text-white/50 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-10 pb-8 border-b border-white/5">
            <div className="md:col-span-5 space-y-4">
              <h4 className="font-serif text-white text-lg font-bold tracking-wide uppercase">1997 Stays Galway</h4>
              <p className="text-xs text-white/40 leading-relaxed max-w-sm">
                A premium, self-check-in boutique hospitality experience. Hosted directly above Mocha Beans, Newcastle Galway.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-white/25">
                <ShieldCheck size={12} className="text-white/40" />
                <span>Authorized direct booking engine</span>
              </div>
            </div>
            <div className="md:col-span-3 space-y-3">
              <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Address</h5>
              <p className="text-xs leading-normal">
                25 Lower Newcastle Road,<br />
                Galway City, Co. Galway,<br />
                H91 X466, Ireland
              </p>
              <a
                href="https://maps.google.com/?q=25+Lower+Newcastle+Road+Galway+H91+X466"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] underline text-white/40 hover:text-white flex items-center gap-1 mt-1"
              >
                <span>Find Directions on Maps</span>
                <span>↗</span>
              </a>
            </div>
            <div className="md:col-span-4 space-y-3">
              <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Contact</h5>
              <div className="text-xs space-y-1.5">
                <p className="flex items-center gap-2">
                  <span className="font-medium text-white/70">Guest Help:</span>
                  <a href="tel:+353868593757" className="hover:text-white transition-colors">+353 86 859 3757</a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-white/70">Email:</span>
                  <a href="mailto:cathal.keogh@mochabeans.com" className="hover:text-white transition-colors">cathal.keogh@mochabeans.com</a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-white/70">Café:</span>
                  <a href="https://mochabeans.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">mochabeans.com</a>
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-white/25">
            <p>© 2026 1997 Stays Newcastle Galway. In partnership with Mocha Beans Café and Roastery.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Booking</a>
              <a href="https://www.cloudbeds.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Cloudbeds Engine</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile sticky booking ribbon */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-brand-espresso text-white border-t border-white/10 px-4 py-3.5 flex items-center justify-between lg:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.5)]"
          >
            <div>
              <p className="text-[10px] font-mono tracking-wider text-white/40 uppercase">Newcastle, Galway</p>
              <p className="text-sm font-serif font-bold text-white flex items-center gap-1.5">
                <span>1997 Stays</span>
                <span className="text-[10px] font-sans font-normal text-white/40 underline">10% Café Code</span>
              </p>
            </div>
            <button
              onClick={() => setIsMobileBookingOpen(true)}
              className="bg-white hover:bg-brand-beige text-brand-espresso px-5 py-2.5 font-sans text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
            >
              Book Direct
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile booking drawer */}
      <AnimatePresence>
        {isMobileBookingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end lg:hidden"
          >
            <div className="absolute inset-0" onClick={() => setIsMobileBookingOpen(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="bg-brand-espresso text-white w-full max-h-[90vh] rounded-t-2xl p-6 relative z-10 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-serif text-white">Select Dates</h3>
                  <p className="text-[10px] font-mono text-white/40 uppercase">Direct Booking Benefit Applied</p>
                </div>
                <button
                  onClick={() => setIsMobileBookingOpen(false)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <BookingForm
                initialRoomId={selectedRoomId}
                onSuccess={handleBookingCompleted}
                className="bg-transparent border-0 p-0 shadow-none"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cloudbeds redirect modal */}
      <AnimatePresence>
        {showDirectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white max-w-md w-full p-6 text-center border border-brand-stone text-brand-charcoal relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-brand-espresso" />
              <div className="my-4 inline-flex items-center justify-center p-3 bg-brand-stone/40 text-brand-mocha">
                <Coffee size={32} />
              </div>
              <h3 className="text-2xl font-serif text-brand-espresso font-bold mb-2">Redirecting to Direct Booking Engine</h3>
              <div className="text-xs sm:text-sm text-brand-mocha leading-relaxed space-y-3 mb-6">
                <p>Opening Cloudbeds in a secured external tab to complete your reservation for{' '}
                  <strong className="text-brand-charcoal font-semibold">1997 Stays Galway</strong>.
                </p>
                <div className="text-left bg-brand-beige p-3 border border-brand-stone/60 space-y-2">
                  {[
                    'Selected Dates &amp; Night Counts Prefilled',
                    'Selected Room Preloaded',
                    'Mocha Beans 10% Discount Tracking Enabled',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 size={12} className="text-brand-espresso flex-shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    const finalUrl = generateCloudbedsLink(
                      undefined, undefined, 2,
                      selectedRoomId === 'all-rooms' ? undefined : selectedRoomId
                    );
                    window.open(finalUrl, '_blank', 'noreferrer,noopener');
                  }}
                  className="w-full bg-brand-espresso hover:bg-brand-mocha text-white font-sans font-medium text-xs tracking-wider uppercase py-3.5 transition-colors cursor-pointer"
                >
                  Re-Launch Booking Window
                </button>
                <button
                  onClick={() => setShowDirectModal(false)}
                  className="w-full text-brand-mocha-light hover:text-brand-charcoal text-[11px] font-mono tracking-wider uppercase py-2"
                >
                  Back to Landing Page
                </button>
              </div>
              <div className="mt-5 pt-4 border-t border-brand-stone/40 flex items-center justify-center gap-1.5 text-[10px] text-brand-mocha-light font-mono">
                <ShieldCheck size={12} />
                <span>Cloudbeds Certified Direct Portal Link</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
