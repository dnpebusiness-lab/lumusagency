import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import OwnerGuestSplit from '@/components/home/OwnerGuestSplit'
import BrandStatement from '@/components/home/BrandStatement'
import ServiceIndex from '@/components/home/ServiceIndex'
import ProcessLine from '@/components/home/ProcessLine'
import FeaturedProperties from '@/components/home/FeaturedProperties'
import LocalExpertise from '@/components/home/LocalExpertise'
import WhyBookDirect from '@/components/home/WhyBookDirect'
import Testimonials from '@/components/home/Testimonials'
import OwnerCTA from '@/components/home/OwnerCTA'

export const metadata: Metadata = {
  title: 'Holiday Let Management Galway | City Hosting',
  description:
    'City Hosting provides professional holiday let and short-term rental management across Galway and the West of Ireland. Expert property management for landlords. Direct bookings for guests.',
  alternates: {
    canonical: 'https://cityhostings.com',
  },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <OwnerGuestSplit />
      <BrandStatement />
      <ServiceIndex />
      <ProcessLine />
      <FeaturedProperties />
      <LocalExpertise />
      <WhyBookDirect />
      <Testimonials />
      <OwnerCTA />
    </>
  )
}
