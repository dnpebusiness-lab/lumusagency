type CaseGlyphProps = {
  variant: number;
  className?: string;
};

export function CaseGlyph({ variant, className }: CaseGlyphProps) {
  if (variant === 0) {
    return (
      <svg
        viewBox="0 0 400 500"
        className={className}
        fill="none"
        stroke="currentColor"
        aria-hidden
      >
        <circle
          cx="200"
          cy="250"
          r="170"
          className="text-[var(--border-gold)]"
          strokeWidth="1"
        />
        <circle
          cx="200"
          cy="250"
          r="120"
          className="text-[var(--border-gold)]"
          strokeWidth="1"
        />
        <circle
          cx="200"
          cy="250"
          r="70"
          className="text-gold/70"
          strokeWidth="1"
        />
      </svg>
    );
  }

  if (variant === 1) {
    return (
      <svg
        viewBox="0 0 400 500"
        className={className}
        fill="none"
        stroke="currentColor"
        aria-hidden
      >
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={i}
            x1="40"
            x2="360"
            y1={100 + i * 30}
            y2={100 + i * 30}
            className="text-[var(--border-gold)]"
            strokeWidth="1"
          />
        ))}
        <line
          x1="200"
          y1="60"
          x2="200"
          y2="440"
          className="text-gold"
          strokeWidth="1"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <rect
        x="80"
        y="80"
        width="240"
        height="340"
        className="text-[var(--border-gold)]"
        strokeWidth="1"
      />
      <rect
        x="130"
        y="130"
        width="140"
        height="240"
        className="text-[var(--border-gold)]"
        strokeWidth="1"
      />
      <line
        x1="80"
        y1="250"
        x2="320"
        y2="250"
        className="text-gold"
        strokeWidth="1"
      />
    </svg>
  );
}
