export type SemanticRecord = Readonly<Record<string, unknown>>

export const SURFACE_STATES = ['usable', 'loading', 'empty', 'error', 'unavailable', 'unverified'] as const
export type SurfaceState = (typeof SURFACE_STATES)[number]

export function fieldString(record: SemanticRecord | null | undefined, key: string) {
  const value = record?.[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function fieldNumber(record: SemanticRecord | null | undefined, key: string) {
  const value = record?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}
