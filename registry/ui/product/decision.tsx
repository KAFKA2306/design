import { useId } from 'react'
import { Metric, SourceLine } from './information'
import type { SemanticRecord } from './semantic'

export type DecisionPanelState = 'neutral' | 'ready' | 'attention' | 'blocked'

export type DecisionPanelAction = Readonly<{
  label: string
  onClick: () => void
  disabled?: boolean
}>

export type DecisionPanelEvidence = Readonly<{
  label: string
  detail: string
}>

export type DecisionPanelProps = Readonly<{
  id?: string
  eyebrow?: string
  title: string
  source?: SemanticRecord | null
  decisionLabel?: string
  decision: string
  rationale: string
  state?: DecisionPanelState
  metrics?: readonly SemanticRecord[]
  primaryAction: DecisionPanelAction
  secondaryAction?: DecisionPanelAction
  evidenceLabel?: string
  evidence?: readonly DecisionPanelEvidence[]
}>

export function DecisionPanel({
  id,
  eyebrow,
  title,
  source,
  decisionLabel = 'Decision',
  decision,
  rationale,
  state = 'neutral',
  metrics = [],
  primaryAction,
  secondaryAction,
  evidenceLabel = 'Decision evidence',
  evidence = [],
}: DecisionPanelProps) {
  const generatedId = useId()
  const headingId = id ? `${id}-heading` : generatedId

  return (
    <section id={id} className="k-dashboard-section" data-component="decision-panel" data-state={state} aria-labelledby={headingId}>
      <header className="k-dashboard-header">
        <div className="k-dashboard-heading">
          {eyebrow ? <p className="k-dashboard-eyebrow">{eyebrow}</p> : null}
          <h2 id={headingId} className="k-dashboard-title">{title}</h2>
          <SourceLine source={source} />
        </div>
        <div className="k-dashboard-decision" role="status" aria-live="polite">
          <span>{decisionLabel}</span>
          <strong>{decision}</strong>
          <small>{rationale}</small>
        </div>
      </header>

      <div className="k-dialog-actions" aria-label="Decision actions">
        {secondaryAction ? (
          <button
            className="k-button k-button-secondary"
            type="button"
            disabled={secondaryAction.disabled}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </button>
        ) : null}
        <button
          className="k-button"
          type="button"
          disabled={primaryAction.disabled}
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
        </button>
      </div>

      {metrics.length > 0 ? (
        <div className="k-dashboard-metrics" aria-label="Decision measures">
          {metrics.map((fact, index) => <Metric key={String(fact.id ?? index)} fact={fact} />)}
        </div>
      ) : null}

      {evidence.length > 0 ? (
        <details className="k-dashboard-brief">
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
