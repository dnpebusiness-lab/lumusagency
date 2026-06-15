import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOTWORX Galway Tuam Road | 24/7 Infrared Fitness Studio",
  description:
    "Try HOTWORX Galway on Tuam Road. 24/7 infrared sauna workouts, HIIT, Hot Yoga, Hot Pilates, FX Zone and free first workout for local first-time guests.",
  keywords:
    "HOTWORX Galway, infrared fitness studio, Hot Yoga Galway, Hot Pilates Galway, 24 hour gym Galway, infrared sauna workout, Tuam Road Galway",
  openGraph: {
    title: "HOTWORX Galway | 24/7 Infrared Fitness Studio",
    description: "Infrared sauna workouts in Galway. Book your free session today.",
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
    <html lang="en-IE" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full bg-[#080808] text-[#F5F5F5] antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
