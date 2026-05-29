"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/cn";

const SERVICES = [
  "Branding",
  "Web Design",
  "Social Media",
  "Motion Graphics",
  "All of the above",
  "Something else",
];

type Status = "idle" | "submitting" | "success" | "error";

function encode(data: Record<string, string>) {
  return Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
    .join("&");
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      "form-name": "contact",
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      service: String(data.get("service") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.service || !payload.message) {
      setStatus("error");
      setErrorMessage("Please complete every field before sending.");
      return;
    }

    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(payload),
      });
      if (!res.ok) {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again in a moment.");
    }
  }

  const submitting = status === "submitting";

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-12"
    >
      <input type="hidden" name="form-name" value="contact" />
      <p className="hidden">
        <label>
          Don&rsquo;t fill this out: <input name="bot-field" />
        </label>
      </p>

      <Field label="Your name" name="name" autoComplete="name" required />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />

      <SelectField label="Service" name="service" options={SERVICES} required />

      <TextareaField
        label="Tell us about the project"
        name="message"
        rows={5}
        required
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "group relative inline-flex items-center justify-center gap-3 h-14 px-9 font-sans font-medium uppercase tracking-cta-wide text-xs whitespace-nowrap transition-colors duration-500 ease-[cubic-bezier(0.215,0.61,0.355,1)] border",
            submitting
              ? "bg-gold/40 text-black border-gold/40 cursor-wait"
              : "bg-gold text-black border-gold hover:bg-gold-bright hover:border-gold-bright",
          )}
        >
          <span>{submitting ? "Sending…" : "Send message"}</span>
          <Send size={14} strokeWidth={1.5} />
        </button>

        <div aria-live="polite" className="text-[11px] uppercase tracking-cta">
          {status === "success" && (
            <p className="text-gold">Message received. We&rsquo;ll be in touch shortly.</p>
          )}
          {status === "error" && (
            <p className="text-white/80">{errorMessage}</p>
          )}
          {status === "idle" && (
            <p className="text-white/40">Replies within one working day</p>
          )}
        </div>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
};

function Field({ label, name, type = "text", autoComplete, required }: FieldProps) {
  return (
    <label className="group flex flex-col gap-3">
      <span className="text-[10px] uppercase tracking-cta-wide text-white/50 group-focus-within:text-gold transition-colors duration-500">
        {label}
      </span>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        required={required}
        className="bg-transparent border-b border-[var(--border-gold)] focus:border-gold transition-colors duration-500 outline-none py-3 font-sans font-light text-lg text-white placeholder:text-white/30"
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
};

function SelectField({ label, name, options, required }: SelectFieldProps) {
  return (
    <label className="group flex flex-col gap-3">
      <span className="text-[10px] uppercase tracking-cta-wide text-white/50 group-focus-within:text-gold transition-colors duration-500">
        {label}
      </span>
      <div className="relative">
        <select
          name={name}
          required={required}
          defaultValue=""
          className="appearance-none w-full bg-transparent border-b border-[var(--border-gold)] focus:border-gold transition-colors duration-500 outline-none py-3 pr-10 font-sans font-light text-lg text-white"
        >
          <option value="" disabled className="bg-black text-white/60">
            Choose a service…
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-black text-white">
              {opt}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gold text-xs"
        >
          ▾
        </span>
      </div>
    </label>
  );
}

type TextareaFieldProps = {
  label: string;
  name: string;
  rows?: number;
  required?: boolean;
};

function TextareaField({ label, name, rows = 4, required }: TextareaFieldProps) {
  return (
    <label className="group flex flex-col gap-3">
      <span className="text-[10px] uppercase tracking-cta-wide text-white/50 group-focus-within:text-gold transition-colors duration-500">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        className="bg-transparent border-b border-[var(--border-gold)] focus:border-gold transition-colors duration-500 outline-none py-3 font-sans font-light text-lg text-white placeholder:text-white/30 resize-none"
      />
    </label>
  );
}
