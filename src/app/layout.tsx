import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Astra Voice',
    template: '%s · Astra Voice',
  },
  description: 'AI voice receptionist for restaurants. Answers every call, in English and Italian.',
  robots: { index: false, follow: false }, // pilot: not indexed until launch
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f6f4' },
    { media: '(prefers-color-scheme: dark)', color: '#100f0d' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="bg-copper-600 sr-only rounded-md px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
