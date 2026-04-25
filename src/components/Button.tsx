import Link from "next/link";
import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "filled" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-3 font-sans font-medium uppercase tracking-cta-wide whitespace-nowrap select-none overflow-hidden";

const sizes: Record<Size, string> = {
  md: "h-11 px-6 text-[11px]",
  lg: "h-14 px-9 text-xs",
};

const variants: Record<Variant, string> = {
  filled: "bg-gold text-black border border-gold",
  outline:
    "bg-transparent text-white border border-[var(--border-gold)] hover:border-gold",
  ghost: "bg-transparent text-white border border-transparent",
};

const sweepBg: Record<Variant, string> = {
  filled: "bg-gold-bright",
  outline: "bg-gold",
  ghost: "bg-gold",
};

const hoverText: Record<Variant, string> = {
  filled: "group-hover:text-black",
  outline: "group-hover:text-black",
  ghost: "group-hover:text-black",
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

function Inner({ variant, children }: { variant: Variant; children: ReactNode }) {
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 origin-bottom scale-y-0 transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] group-hover:scale-y-100",
          sweepBg[variant],
        )}
      />
      <span
        className={cn(
          "relative z-10 inline-flex items-center gap-3 transition-colors duration-700 ease-[cubic-bezier(0.215,0.61,0.355,1)]",
          hoverText[variant],
        )}
      >
        {children}
      </span>
    </>
  );
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
            <Inner variant={variant}>{children}</Inner>
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
          <Inner variant={variant}>{children}</Inner>
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
        <Inner variant={variant}>{children}</Inner>
      </button>
    );
  },
);
