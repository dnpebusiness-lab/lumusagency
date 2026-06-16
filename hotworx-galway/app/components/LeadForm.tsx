"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

/*
  REPLACE: wire `onSubmit` to your provider before launch
  (Netlify Forms / Formspree / MailerLite / custom API route).
  Right now it simulates a successful submit on the client only.
*/

const goals = [
  "Get moving again",
  "Drop a bit of weight",
  "Recover better",
  "Try something new",
  "Something else",
];
const times = ["Morning", "Afternoon", "Evening", "Weekend"];

export default function LeadForm() {
  const [time, setTime] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // REPLACE with real request
    setLoading(false);
    setSent(true);
  };

  const field =
    "w-full bg-ink border border-line focus:border-ember text-paper placeholder-ash/40 px-4 py-3 text-[15px] outline-none transition-colors duration-200";
  const label = "block text-[11px] tracking-[0.16em] uppercase text-ash mb-2";

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div
          key="done"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-14 text-center"
        >
          <span className="inline-flex w-14 h-14 items-center justify-center rounded-full border border-ember/40 mb-5">
            <Check className="text-ember" size={26} />
          </span>
          <h3 className="font-display font-extrabold text-3xl tracking-tight text-paper mb-2">
            Got it.
          </h3>
          <p className="text-ash text-[15px] max-w-xs mx-auto">
            We&apos;ll text or ring to book you in. See you on Tuam Road.
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={submit}
          className="space-y-5"
        >
          <div>
            <label htmlFor="fn" className={label}>
              First name
            </label>
            <input id="fn" name="firstName" required placeholder="Sarah" className={field} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ph" className={label}>
                Phone
              </label>
              <input id="ph" name="phone" type="tel" required placeholder="087…" className={field} />
            </div>
            <div>
              <label htmlFor="em" className={label}>
                Email
              </label>
              <input id="em" name="email" type="email" required placeholder="you@…" className={field} />
            </div>
          </div>
          <div>
            <label htmlFor="goal" className={label}>
              What&apos;s the goal
            </label>
            <select id="goal" name="goal" className={`${field} cursor-pointer appearance-none`} defaultValue={goals[0]}>
              {goals.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <span className={label}>Best time for you</span>
            <div className="grid grid-cols-4 gap-2">
              {times.map((t) => (
                <label
                  key={t}
                  className={`flex items-center justify-center py-2.5 text-[13px] border cursor-pointer transition-colors duration-200 ${
                    time === t
                      ? "border-ember text-ember bg-ember/10"
                      : "border-line text-ash hover:text-paper hover:border-ember/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredTime"
                    value={t}
                    checked={time === t}
                    onChange={() => setTime(t)}
                    className="sr-only"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-heat w-full bg-ember text-[#1a0600] hover:bg-burnt disabled:opacity-60 font-medium tracking-wide py-4 transition-colors duration-300 cursor-pointer"
          >
            {loading ? "Sending…" : "Book my free workout"}
          </button>
          <p className="text-ash/50 text-[11.5px] leading-relaxed">
            Pop your details in and you agree we can contact you about HOTWORX
            Galway. First session is for first-time locals during staffed hours —
            terms apply.
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
