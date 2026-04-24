import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 16, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="8" y1="10" x2="8" y2="17" />
      <circle cx="8" cy="7" r="0.8" fill="currentColor" stroke="none" />
      <path d="M12 17v-4a2.5 2.5 0 0 1 5 0v4" />
      <line x1="12" y1="10" x2="12" y2="17" />
    </svg>
  );
}

export function BehanceIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 6h5a2.5 2.5 0 0 1 0 5H3z" />
      <path d="M3 11h6a2.5 2.5 0 0 1 0 5H3z" />
      <path d="M14.5 13.5a2.5 2.5 0 1 1 5 0h-5a2.5 2.5 0 0 0 5 1" />
      <line x1="15" y1="7" x2="19" y2="7" />
    </svg>
  );
}
