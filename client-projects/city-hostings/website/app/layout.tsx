import type { Metadata } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://cityhostings.com'),
  title: {
    default: 'City Hosting | Holiday Let Management Galway',
    template: '%s | City Hosting',
  },
  description:
    'City Hosting provides professional holiday let and short-term rental management across Galway and the West of Ireland. Expert property management for landlords. Direct bookings for guests.',
  keywords: [
    'holiday let management Galway',
    'Airbnb management Galway',
    'short-term rental management Galway',
    'holiday home management Galway',
    'property hosting Galway',
    'property management West of Ireland',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://cityhostings.com',
    siteName: 'City Hosting',
    title: 'City Hosting | Holiday Let Management Galway',
    description:
      'Professional holiday let and short-term rental management across Galway and the West of Ireland.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'City Hosting | Holiday Let Management Galway',
    description:
      'Professional holiday let and short-term rental management across Galway and the West of Ireland.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en-IE"
      className={`${cormorant.variable} ${manrope.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
