import { useId } from 'react'
import { SourceLine } from './information'
import type { SemanticRecord } from './semantic'

export type ComparisonSurfaceRole = 'baseline' | 'current' | 'candidate'

export type ComparisonSurfaceOption = Readonly<{
  id: string
  role: ComparisonSurfaceRole
  label: string
  summary?: string
  status?: string
  source?: SemanticRecord | null
}>

export type ComparisonSurfaceMetric = Readonly<{
  id: string
  label: string
  unit?: string
  values: Readonly<Record<string, string | number | null | undefined>>
  difference?: string | null
}>

export type ComparisonSurfaceEvidence = Readonly<{
  label: string
  detail: string
}>

export type ComparisonSurfaceProps = Readonly<{
  id?: string
  eyebrow?: string
  title: string
  options: readonly ComparisonSurfaceOption[]
  metrics: readonly ComparisonSurfaceMetric[]
  evidenceLabel?: string
  evidence?: readonly ComparisonSurfaceEvidence[]
}>

function displayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return 'Not provided'
  return String(value)
}

export function ComparisonSurface({
  id,
  eyebrow,
  title,
  options,
  metrics,
  evidenceLabel = 'Comparison evidence',
  evidence = [],
}: ComparisonSurfaceProps) {
  const generatedId = useId()
  const headingId = id ? `${id}-heading` : generatedId

  if (options.length < 2) {
    throw new Error('ComparisonSurface requires at least two comparison options')
  }

  return (
    <section id={id} className="k-dashboard-section" data-component="comparison-surface" aria-labelledby={headingId}>
      <header className="k-dashboard-section-header">
        <div>
          {eyebrow ? <p className="k-dashboard-eyebrow">{eyebrow}</p> : null}
          <h2 id={headingId}>{title}</h2>
        </div>
      </header>

      <div className="k-dashboard-metrics" data-comparison-stage="options" aria-label="Comparison options">
        {options.map((option) => (
          <article key={option.id} className="k-metric" data-role={option.role} data-status={option.status ?? undefined}>
            <div className="k-metric-meta">
              <span className="k-metric-kind">{option.role}</span>
              <strong>{option.label}</strong>
              {option.status ? <span>{option.status}</span> : null}
            </div>
            {option.summary ? <span>{option.summary}</span> : null}
            {option.source ? <SourceLine source={option.source} /> : null}
          </article>
        ))}
      </div>

      <div className="k-table-region" data-comparison-stage="metrics">
        <table className="k-data-table">
          <thead>
            <tr>
              <th scope="col">Measure</th>
              {options.map((option) => <th scope="col" key={option.id}>{option.label}</th>)}
              <th scope="col">Difference</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.id}>
                <th scope="row">
                  {metric.label}{metric.unit ? ` (${metric.unit})` : ''}
                </th>
                {options.map((option) => {
                  const value = metric.values[option.id]
                  return (
                    <td key={option.id} data-align="numeric" data-raw-value={value ?? undefined}>
                      {displayValue(value)}
                    </td>
                  )
                })}
                <td data-align="numeric">{displayValue(metric.difference)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {evidence.length > 0 ? (
        <details className="k-dashboard-brief" data-comparison-stage="evidence">
          <summary>{evidenceLabel}</summary>
          <ul>
            {evidence.map((item) => (
              <li key={`${item.label}:${item.detail}`}><strong>{item.label}:</strong> {item.detail}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  )
}
