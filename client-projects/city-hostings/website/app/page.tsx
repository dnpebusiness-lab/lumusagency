import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import TwoJourneys from '@/components/home/TwoJourneys'
import BrandStatement from '@/components/home/BrandStatement'
import ServicesOverview from '@/components/home/ServicesOverview'
import ProcessSteps from '@/components/home/ProcessSteps'
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
      <TwoJourneys />
      <BrandStatement />
      <ServicesOverview />
      <ProcessSteps />
      <FeaturedProperties />
      <LocalExpertise />
      <WhyBookDirect />
      <Testimonials />
      <OwnerCTA />
    </>
  )
}
