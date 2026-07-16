'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const schema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  propertyLocation: z.string().min(3, 'Please describe the property location'),
  propertyType: z.enum(['apartment', 'house', 'cottage', 'townhouse', 'other'], {
    error: 'Please select a property type',
  }),
  bedrooms: z.string().min(1, 'Please select number of bedrooms'),
  currentUse: z.enum(['personal', 'long-term-let', 'short-term-let', 'vacant', 'other'], {
    error: 'Please select current property use',
  }),
  currentlyListed: z.enum(['yes', 'no'], {
    error: 'Please indicate if the property is currently listed',
  }),
  desiredService: z.string().optional(),
  additionalDetails: z.string().optional(),
  consent: z.literal(true, {
    error: 'You must agree to continue',
  }),
})

type FormData = z.infer<typeof schema>

type Status = 'idle' | 'loading' | 'success' | 'error'

const inputBase =
  'w-full font-sans text-sm text-charcoal bg-transparent border-b border-stone px-0 py-3 placeholder:text-taupe/60 focus:outline-none focus:border-charcoal transition-colors duration-200'

const selectBase =
  'w-full font-sans text-sm text-charcoal bg-ivory border-b border-stone px-0 py-3 focus:outline-none focus:border-charcoal transition-colors duration-200 appearance-none cursor-pointer'

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-sans text-xs uppercase tracking-widest text-taupe">
        {label}
        {required && <span className="ml-1 text-gold" aria-label="required">*</span>}
      </label>
      {children}
      {error && (
        <p className="font-sans text-xs text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default function LandlordForm() {
  const [status, setStatus] = useState<Status>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setStatus('loading')
    try {
      // Netlify Forms submission
      const body = new URLSearchParams()
      body.set('form-name', 'landlord-enquiry')
      Object.entries(data).forEach(([k, v]) => body.set(k, String(v ?? '')))

      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })

      if (res.ok) {
        setStatus('success')
        reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="py-16 text-center">
        <span className="block w-10 h-px bg-gold mx-auto mb-8" aria-hidden />
        <h3 className="font-serif text-3xl text-charcoal mb-4">
          Thank you.
        </h3>
        <p className="font-sans text-base text-taupe max-w-md mx-auto leading-relaxed">
          We've received your enquiry and will be in touch shortly to arrange
          a conversation about your property.
        </p>
      </div>
    )
  }

  return (
    <form
      name="landlord-enquiry"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Property management enquiry form"
    >
      {/* Netlify hidden fields */}
      <input type="hidden" name="form-name" value="landlord-enquiry" />
      <div hidden aria-hidden="true">
        <label>
          Don't fill this out if you're human: <input name="bot-field" tabIndex={-1} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Field label="Full name" error={errors.fullName?.message} required>
          <input
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            className={cn(inputBase, errors.fullName && 'border-red-400')}
            {...register('fullName')}
          />
        </Field>

        <Field label="Email address" error={errors.email?.message} required>
          <input
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            className={cn(inputBase, errors.email && 'border-red-400')}
            {...register('email')}
          />
        </Field>

        <Field label="Phone number" error={errors.phone?.message} required>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="+353 ..."
            className={cn(inputBase, errors.phone && 'border-red-400')}
            {...register('phone')}
          />
        </Field>

        <Field label="Property location" error={errors.propertyLocation?.message} required>
          <input
            type="text"
            placeholder="e.g. Galway City, Salthill, Connemara"
            className={cn(inputBase, errors.propertyLocation && 'border-red-400')}
            {...register('propertyLocation')}
          />
        </Field>

        <Field label="Property type" error={errors.propertyType?.message} required>
          <select
            className={cn(selectBase, errors.propertyType && 'border-red-400')}
            defaultValue=""
            {...register('propertyType')}
          >
            <option value="" disabled>Select type</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="cottage">Cottage</option>
            <option value="townhouse">Townhouse</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label="Number of bedrooms" error={errors.bedrooms?.message} required>
          <select
            className={cn(selectBase, errors.bedrooms && 'border-red-400')}
            defaultValue=""
            {...register('bedrooms')}
          >
            <option value="" disabled>Select</option>
            {['1', '2', '3', '4', '5', '6+'].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </Field>

        <Field label="Current property use" error={errors.currentUse?.message} required>
          <select
            className={cn(selectBase, errors.currentUse && 'border-red-400')}
            defaultValue=""
            {...register('currentUse')}
          >
            <option value="" disabled>Select</option>
            <option value="personal">Personal use</option>
            <option value="long-term-let">Long-term let</option>
            <option value="short-term-let">Short-term let</option>
            <option value="vacant">Vacant</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label="Currently listed on a platform?" error={errors.currentlyListed?.message} required>
          <select
            className={cn(selectBase, errors.currentlyListed && 'border-red-400')}
            defaultValue=""
            {...register('currentlyListed')}
          >
            <option value="" disabled>Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </Field>
      </div>

      <div className="space-y-8 mb-10">
        <Field label="What are you looking for?" error={errors.desiredService?.message}>
          <input
            type="text"
            placeholder="e.g. Full management, listing setup, guest communication..."
            className={inputBase}
            {...register('desiredService')}
          />
        </Field>

        <Field label="Anything else you'd like us to know?" error={errors.additionalDetails?.message}>
          <textarea
            rows={4}
            placeholder="Any relevant details about your property or situation..."
            className={cn(inputBase, 'resize-none')}
            {...register('additionalDetails')}
          />
        </Field>
      </div>

      {/* Consent */}
      <div className="mb-10">
        <label className="flex items-start gap-4 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-1 flex-shrink-0 w-4 h-4 border border-stone accent-charcoal cursor-pointer"
            {...register('consent')}
          />
          <span className="font-sans text-xs text-taupe leading-relaxed">
            I agree to City Hosting using my information to respond to this enquiry and to
            keep me informed about property management services.{' '}
            <a href="/privacy" className="underline hover:text-charcoal transition-colors">
              Privacy policy
            </a>
            .
          </span>
        </label>
        {errors.consent && (
          <p className="font-sans text-xs text-red-600 mt-2 ml-8" role="alert">
            {errors.consent.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest px-8 py-4 bg-charcoal text-ivory hover:bg-graphite disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
        >
          <span>{status === 'loading' ? 'Sending…' : 'Send enquiry'}</span>
          {status !== 'loading' && (
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
          )}
        </button>

        {status === 'error' && (
          <p className="font-sans text-xs text-red-600" role="alert">
            Something went wrong. Please try again or email us directly at{' '}
            <a href="mailto:info@cityhostings.com" className="underline">
              info@cityhostings.com
            </a>
          </p>
        )}
      </div>
    </form>
  )
}
