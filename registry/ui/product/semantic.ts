export type SemanticRecord = Readonly<Record<string, unknown>>

export function fieldString(record: SemanticRecord | null | undefined, key: string) {
  const value = record?.[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function fieldNumber(record: SemanticRecord | null | undefined, key: string) {
  const value = record?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}
