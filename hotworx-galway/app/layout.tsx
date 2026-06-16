import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

// Display: editorial grotesque with character — not the generic fitness condensed look.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

// Body: clean, neutral, high legibility.
const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HOTWORX Galway Tuam Road | 24/7 Infrared Fitness Studio",
  description:
    "Galway's only 24/7 infrared studio. Train hot, finish fast — 15 or 30-minute sauna workouts on Tuam Road. Your first session is free.",
  keywords:
    "HOTWORX Galway, infrared fitness studio, Hot Yoga Galway, Hot Pilates Galway, 24 hour gym Galway, infrared sauna workout, Tuam Road Galway",
  openGraph: {
    title: "HOTWORX Galway | 24/7 Infrared Fitness Studio",
    description:
      "Train hot. Finish fast. Galway's only 24/7 infrared studio on Tuam Road. First session free.",
    type: "website",
    locale: "en_IE",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IE" className={`${display.variable} ${body.variable} h-full`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-full bg-ink text-paper antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
