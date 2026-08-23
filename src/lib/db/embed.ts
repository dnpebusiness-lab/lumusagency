/**
 * PostgREST returns an embedded relation as an object for a to-one join and as
 * an array for a to-many join. Without generated types, supabase-js cannot tell
 * which it is and infers an array for both.
 *
 * `one()` normalises the two shapes so call sites stay correct either way —
 * including after `npm run db:types` starts producing precise types.
 */
export function one<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

export function many<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}
