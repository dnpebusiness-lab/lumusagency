"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";

type FormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  contactMethod: string;
  goal: string;
  preferredTime: string;
};

const initialForm: FormData = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  contactMethod: "phone",
  goal: "",
  preferredTime: "",
};

/*
  REPLACE: Update the form action endpoint with your form provider.
  Options: Netlify Forms, Formspree, custom API route.
  Current: form is unconnected — add onSubmit handler for production.
*/

export default function LeadForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // REPLACE: Send form data to your backend/CRM here.
    // Example: await fetch('/api/lead', { method: 'POST', body: JSON.stringify(form) })
    await new Promise((r) => setTimeout(r, 1200)); // Simulated delay
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[rgba(255,107,0,0.1)] border border-[rgba(255,107,0,0.3)] flex items-center justify-center mb-6">
            <CheckCircle size={28} className="text-[#FF6B00]" />
          </div>
          <h3
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
            className="text-3xl text-white uppercase mb-3"
          >
            Request received.
          </h3>
          <p className="text-[#666] text-sm max-w-xs leading-relaxed">
            We&apos;ll be in touch soon to arrange your free session. See you at
            HOTWORX Galway.
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-[#666] text-xs uppercase tracking-[0.12em] mb-2"
              >
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={form.firstName}
                onChange={handleChange}
                placeholder="e.g. Sarah"
                className="w-full bg-[#111] border border-[rgba(255,255,255,0.08)] focus:border-[rgba(255,107,0,0.5)] text-white placeholder-[#333] px-4 py-3 text-sm outline-none transition-colors duration-200 rounded-sm"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-[#666] text-xs uppercase tracking-[0.12em] mb-2"
              >
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={form.lastName}
                onChange={handleChange}
                placeholder="e.g. Murphy"
                className="w-full bg-[#111] border border-[rgba(255,255,255,0.08)] focus:border-[rgba(255,107,0,0.5)] text-white placeholder-[#333] px-4 py-3 text-sm outline-none transition-colors duration-200 rounded-sm"
              />
            </div>
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-[#666] text-xs uppercase tracking-[0.12em] mb-2"
              >
                Phone *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="087 000 0000"
                className="w-full bg-[#111] border border-[rgba(255,255,255,0.08)] focus:border-[rgba(255,107,0,0.5)] text-white placeholder-[#333] px-4 py-3 text-sm outline-none transition-colors duration-200 rounded-sm"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-[#666] text-xs uppercase tracking-[0.12em] mb-2"
              >
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@email.com"
                className="w-full bg-[#111] border border-[rgba(255,255,255,0.08)] focus:border-[rgba(255,107,0,0.5)] text-white placeholder-[#333] px-4 py-3 text-sm outline-none transition-colors duration-200 rounded-sm"
              />
            </div>
          </div>

          {/* Preferred contact */}
          <div>
            <label
              htmlFor="contactMethod"
              className="block text-[#666] text-xs uppercase tracking-[0.12em] mb-2"
            >
              Preferred Contact Method
            </label>
            <select
              id="contactMethod"
              name="contactMethod"
              value={form.contactMethod}
              onChange={handleChange}
              className="w-full bg-[#111] border border-[rgba(255,255,255,0.08)] focus:border-[rgba(255,107,0,0.5)] text-white px-4 py-3 text-sm outline-none transition-colors duration-200 rounded-sm cursor-pointer appearance-none"
            >
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          {/* Goal */}
          <div>
            <label
              htmlFor="goal"
              className="block text-[#666] text-xs uppercase tracking-[0.12em] mb-2"
            >
              Your Main Goal
            </label>
            <select
              id="goal"
              name="goal"
              value={form.goal}
              onChange={handleChange}
              className="w-full bg-[#111] border border-[rgba(255,255,255,0.08)] focus:border-[rgba(255,107,0,0.5)] text-white px-4 py-3 text-sm outline-none transition-colors duration-200 rounded-sm cursor-pointer appearance-none"
            >
              <option value="" disabled>
                Select your goal
              </option>
              <option value="lose-weight">Lose weight</option>
              <option value="build-consistency">Build consistency</option>
              <option value="improve-recovery">Improve recovery</option>
              <option value="try-something-new">Try something new</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Preferred time */}
          <div>
            <label className="block text-[#666] text-xs uppercase tracking-[0.12em] mb-3">
              Preferred Training Time
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["Morning", "Afternoon", "Evening", "Weekend"].map((t) => (
                <label
                  key={t}
                  className={`flex items-center justify-center py-2.5 border text-sm font-medium cursor-pointer transition-all duration-200 rounded-sm ${
                    form.preferredTime === t.toLowerCase()
                      ? "border-[#FF6B00] bg-[rgba(255,107,0,0.1)] text-[#FF6B00]"
                      : "border-[rgba(255,255,255,0.08)] text-[#555] hover:border-[rgba(255,107,0,0.3)] hover:text-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredTime"
                    value={t.toLowerCase()}
                    checked={form.preferredTime === t.toLowerCase()}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#FF6B00] hover:bg-[#FF8C3A] disabled:bg-[#AA4400] text-white font-bold py-4 transition-colors duration-200 cursor-pointer uppercase tracking-[0.12em] text-base"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Book Free Workout
              </>
            )}
          </button>

          {/* Consent */}
          <p className="text-[#333] text-xs leading-relaxed text-center">
            By submitting, you agree to be contacted about HOTWORX Galway.
            Consent is not required for purchase.
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
