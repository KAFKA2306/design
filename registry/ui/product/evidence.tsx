import { useId } from 'react'
import { SourceLine } from './information'
import type { SemanticRecord } from './semantic'

export type EvidenceSurfaceRecord = Readonly<{
  id: string
  label: string
  status?: string
  source?: SemanticRecord | null
  revision?: string
  hash?: string
  href?: string
  hrefLabel?: string
}>

export type EvidenceSurfaceProps = Readonly<{
  id?: string
  eyebrow?: string
  title: string
  records: readonly EvidenceSurfaceRecord[]
  emptyMessage?: string
}>

function displayValue(value: string | undefined) {
  if (value === undefined || value.trim() === '') return 'Not provided'
  return value
}

export function EvidenceSurface({
  id,
  eyebrow,
  title,
  records,
  emptyMessage = 'No evidence provided.',
}: EvidenceSurfaceProps) {
  const generatedId = useId()
  const headingId = id ? `${id}-heading` : generatedId

  return (
    <section id={id} className="k-dashboard-section" data-component="evidence-surface" aria-labelledby={headingId}>
      <header className="k-dashboard-section-header">
        <div>
          {eyebrow ? <p className="k-dashboard-eyebrow">{eyebrow}</p> : null}
          <h2 id={headingId}>{title}</h2>
        </div>
      </header>

      {records.length === 0 ? (
        <p className="k-table-state" role="status">{emptyMessage}</p>
      ) : (
        records.map((record) => (
          <article key={record.id} data-evidence-record={record.id} data-status={record.status ?? undefined}>
            <header className="k-dashboard-section-header" data-evidence-stage="identity">
              <h3>{record.label}</h3>
              <span>{record.status ?? 'Status not provided'}</span>
            </header>

            <div data-evidence-stage="source">
              <SourceLine source={record.source} />
            </div>

            <dl className="k-artifact-metadata" data-evidence-stage="provenance">
              <div>
                <dt>Revision</dt>
                <dd>{displayValue(record.revision)}</dd>
              </div>
              <div>
                <dt>Hash</dt>
                <dd><code>{displayValue(record.hash)}</code></dd>
              </div>
            </dl>

            <div className="k-dialog-actions" data-evidence-stage="link">
              {record.href ? (
                <a className="k-button k-button-secondary" href={record.href}>{record.hrefLabel ?? 'Open evidence'}</a>
              ) : (
                <span className="k-source-line">Evidence link not provided</span>
              )}
            </div>
          </article>
        ))
      )}
    </section>
  )
}
