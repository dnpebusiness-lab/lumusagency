import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Liveness probe. Deliberately exposes nothing about configuration:
 * no versions of dependencies, no environment values, no vendor status.
 */
export function GET() {
  return NextResponse.json(
    { status: 'ok', service: 'astra-voice', timestamp: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
