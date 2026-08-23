import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge conditional class names, resolving conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Mask a phone number for display to users without the unmask permission.
 * Keeps the country prefix and the last 4 digits: +353871234567 -> +353****4567
 *
 * Security note: this is a *display* control. Authorisation to see the full
 * number is enforced server-side (see SECURITY_AND_PRIVACY.md §3).
 */
export function maskPhoneNumber(e164: string): string {
  const trimmed = e164.trim()
  if (trimmed.length < 7) return '****'
  const prefix = trimmed.startsWith('+') ? trimmed.slice(0, 4) : trimmed.slice(0, 3)
  const last4 = trimmed.slice(-4)
  return `${prefix}****${last4}`
}
