import 'server-only'

import { getVoiceProvider } from '@/lib/providers/registry'
import type { VoiceOption } from '@/lib/providers/voice/types'

export type VoiceListing =
  | { readonly ok: true; readonly voices: readonly VoiceOption[] }
  | { readonly ok: false; readonly reason: string }

/**
 * The voices this account may use, for the picker on the settings page.
 *
 * Deliberately not a server action: it is read by a server component only, and
 * anything exported from a 'use server' file becomes an endpoint the browser
 * can call. There is no reason to publish one for this.
 *
 * Returns the reason rather than throwing. Not being able to reach the vendor
 * is something to explain beside the picker, not a reason the whole settings
 * page should fail to render.
 */
export async function listAvailableVoices(): Promise<VoiceListing> {
  const provider = getVoiceProvider()
  if (!provider.ok) return { ok: false, reason: provider.error.message }

  const voices = await provider.data.listVoices()
  if (!voices.ok) return { ok: false, reason: voices.error.message }

  return { ok: true, voices: voices.data }
}
