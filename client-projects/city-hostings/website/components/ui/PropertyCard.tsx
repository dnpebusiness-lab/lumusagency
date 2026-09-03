'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Property } from '@/data/properties'
import { formatPrice, pluralise } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
  index?: number
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      className="group flex flex-col"
    >
      {/* Image */}
      <Link href={`/properties/${property.slug}`} className="block overflow-hidden mb-5">
        <div
          className="img-placeholder w-full aspect-[4/3] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          role="img"
          aria-label={`${property.name} — ${property.location}`}
        >
          {/* TODO_CLIENT_INPUT: Replace with next/image when photography is ready */}
          <div className="absolute inset-0 flex items-end p-5">
            <span className="label-light text-[10px]">
              Photography coming soon
            </span>
          </div>
        </div>
      </Link>

      {/* Meta */}
      <div className="flex-1 flex flex-col">
        <p className="label mb-2">{property.location}</p>

        <Link href={`/properties/${property.slug}`}>
          <h3 className="font-serif text-xl text-charcoal leading-tight mb-3 group-hover:text-graphite transition-colors duration-200">
            {property.name}
          </h3>
        </Link>

        <div className="w-full h-px bg-stone mb-4" />

        <div className="flex items-center gap-4 mb-5">
          <span className="font-sans text-xs text-taupe">
            {pluralise(property.guests, 'guest', 'guests')}
          </span>
          <span className="text-stone" aria-hidden>·</span>
          <span className="font-sans text-xs text-taupe">
            {pluralise(property.bedrooms, 'bedroom', 'bedrooms')}
          </span>
          <span className="text-stone" aria-hidden>·</span>
          <span className="font-sans text-xs text-taupe">
            {pluralise(property.bathrooms, 'bathroom', 'bathrooms')}
          </span>
        </div>

        {property.priceFrom && (
          <p className="font-serif text-base text-charcoal mb-5">
            From {formatPrice(property.priceFrom)} / night
          </p>
        )}

        <div className="mt-auto flex items-center gap-4">
          <Link
            href={`/properties/${property.slug}`}
            className="font-sans text-xs uppercase tracking-widest text-charcoal underline underline-offset-4 decoration-stone hover:decoration-charcoal transition-colors duration-200"
          >
            View property
          </Link>
          <Link
            href={`/book-direct?property=${property.slug}`}
            className="font-sans text-xs uppercase tracking-widest text-gold hover:text-charcoal transition-colors duration-200"
          >
            Book direct →
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
