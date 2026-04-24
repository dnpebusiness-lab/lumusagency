import Link from "next/link";
import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "filled" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-3 font-sans font-medium uppercase tracking-cta-wide whitespace-nowrap transition-colors duration-500 ease-[cubic-bezier(0.215,0.61,0.355,1)] select-none";

const sizes: Record<Size, string> = {
  md: "h-11 px-6 text-[11px]",
  lg: "h-14 px-9 text-xs",
};

const variants: Record<Variant, string> = {
  filled:
    "bg-gold text-black border border-gold hover:bg-gold-bright hover:border-gold-bright",
  outline:
    "bg-transparent text-white border border-[var(--border-gold)] hover:text-gold hover:border-gold",
  ghost:
    "bg-transparent text-white border border-transparent hover:text-gold",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };

type AnchorProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href"> & {
    href: string;
    external?: boolean;
  };

export type ButtonComponentProps = ButtonProps | AnchorProps;

function isAnchor(props: ButtonComponentProps): props is AnchorProps {
  return typeof (props as AnchorProps).href === "string";
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonComponentProps>(
  function Button(props, ref) {
    const { variant = "filled", size = "md", className, children } = props;
    const classes = cn(base, sizes[size], variants[variant], className);

    if (isAnchor(props)) {
      const { href, external, ...rest } = props;
      if (external || href.startsWith("http")) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
            {...rest}
          >
            <span className="relative z-10">{children}</span>
          </a>
        );
      }
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...rest}
        >
          <span className="relative z-10">{children}</span>
        </Link>
      );
    }

    const { type = "button", ...rest } = props;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={classes}
        {...rest}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  },
);
