"use client";

interface PhotoStripProps {
  src: string;
  alt: string;
  headline: string;
  sub?: string;
  align?: "left" | "right";
  cta?: { label: string; href: string };
  height?: number;
}

export default function PhotoStrip({
  src,
  alt,
  headline,
  sub,
  align = "left",
  cta,
  height = 480,
}: PhotoStripProps) {
  const isRight = align === "right";

  return (
    // REPLACE: swap src prop (passed from page.tsx) with a real HOTWORX Galway photo before launch
    <div
      className="relative overflow-hidden border-t border-line"
      style={{ height }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.38) saturate(0.6)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: isRight
            ? "linear-gradient(to left, rgba(10,8,7,0.85) 0%, rgba(10,8,7,0.2) 55%)"
            : "linear-gradient(to right, rgba(10,8,7,0.85) 0%, rgba(10,8,7,0.2) 55%)",
        }}
      />
      <div className="relative z-10 h-full max-w-[1180px] mx-auto px-7 sm:px-14 flex items-center">
        <div
          className={`max-w-[22ch] ${isRight ? "ml-auto text-right" : ""}`}
        >
          {sub && (
            <p
              className={`chapter mb-5 ${isRight ? "justify-end" : ""}`}
            >
              <span
                className="inline-block w-8 h-px"
                style={{ background: "var(--ember)" }}
              />
              {sub}
            </p>
          )}
          <p
            className="font-display font-extrabold leading-[0.93] tracking-tight"
            style={{ fontSize: "clamp(32px,5vw,72px)" }}
          >
            {headline}
          </p>
          {cta && (
            <a
              href={cta.href}
              className="btn-heat inline-flex mt-6 bg-ember text-[#1a0600] font-medium px-6 py-3.5 text-[15px]"
            >
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
