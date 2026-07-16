// TODO_CLIENT_INPUT: Booking provider details required before launch
// Configuration — set via environment variables, never hardcoded

export const bookingConfig = {
  // TODO_CLIENT_INPUT: Booking provider URL (e.g. Lodgify, Hostfully, Guesty, direct API)
  providerUrl: process.env.NEXT_PUBLIC_BOOKING_PROVIDER_URL ?? '',

  // TODO_CLIENT_INPUT: Booking widget embed script URL
  widgetScript: process.env.NEXT_PUBLIC_BOOKING_WIDGET_SCRIPT ?? '',

  // TODO_CLIENT_INPUT: Booking API endpoint (if using custom integration)
  apiEndpoint: process.env.BOOKING_API_ENDPOINT ?? '',

  // TODO_CLIENT_INPUT: Public key for booking widget
  publicKey: process.env.NEXT_PUBLIC_BOOKING_PUBLIC_KEY ?? '',

  // Is the booking integration live?
  isLive: Boolean(process.env.NEXT_PUBLIC_BOOKING_PROVIDER_URL),
} as const

export type SearchParams = {
  destination: string
  checkIn: string
  checkOut: string
  guests: number
}
