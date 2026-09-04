import { useId } from 'react'
import type { DecisionPanelAction, DecisionPanelState } from './decision'
import { SourceLine } from './information'
import type { SemanticRecord, SurfaceState } from './semantic'

export type StatusSurfaceTone = DecisionPanelState

export type StatusSurfaceItem = Readonly<{
  id: string
  label: string
  status: string
  reason?: string
  tone?: StatusSurfaceTone
  action?: DecisionPanelAction
  source?: SemanticRecord | null
}>

type StatusSurfaceBaseProps = Readonly<{
  id?: string
  eyebrow?: string
  title: string
}>

export type StatusSurfaceProps = StatusSurfaceBaseProps & (
  | Readonly<{
      state: 'usable'
      items: readonly StatusSurfaceItem[]
      stateMessage?: never
    }>
  | Readonly<{
      state: Exclude<SurfaceState, 'usable'>
      items?: readonly []
      stateMessage: string
    }>
)

export function StatusSurface({
  id,
  eyebrow,
  title,
  state,
  items = [],
  stateMessage,
}: StatusSurfaceProps) {
  const generatedId = useId()
  const headingId = id ? `${id}-heading` : generatedId

  if (state === 'usable' && items.length === 0) {
    throw new Error('StatusSurface state="usable" requires at least one item; use state="empty" for an empty result.')
  }
  if (state !== 'usable' && items.length > 0) {
    throw new Error(`StatusSurface state="${state}" cannot render status items; use state="usable" for usable data.`)
  }

  const stateRole = state === 'error' ? 'alert' : 'status'
  const liveMode = state === 'error' ? 'assertive' : 'polite'

  return (
    <section
      id={id}
      className="k-dashboard-section"
      data-component="status-surface"
      data-surface-state={state}
      aria-busy={state === 'loading' || undefined}
      aria-labelledby={headingId}
    >
      <header className="k-dashboard-section-header">
        <div>
          {eyebrow ? <p className="k-dashboard-eyebrow">{eyebrow}</p> : null}
          <h2 id={headingId}>{title}</h2>
        </div>
      </header>

      {state !== 'usable' ? (
        <p className="k-table-state" role={stateRole} aria-live={liveMode} data-state-message={state}>
          {stateMessage}
        </p>
      ) : (
        items.map((item) => {
          const tone = item.tone ?? 'neutral'
          return (
            <article key={item.id} data-status-record={item.id} data-state={tone}>
              <div
                className="k-dashboard-decision"
                data-status-stage="identity"
                role={tone === 'blocked' ? 'alert' : 'status'}
                aria-live={tone === 'blocked' ? 'assertive' : 'polite'}
              >
                <span>{item.label}</span>
                <strong>{item.status}</strong>
              </div>

              <p className="k-dashboard-brief" data-status-stage="reason">
                {item.reason?.trim() ? item.reason : 'Reason not provided'}
              </p>

              <div className="k-dialog-actions" data-status-stage="action">
                {item.action ? (
                  <button
                    className="k-button"
                    type="button"
                    disabled={item.action.disabled}
                    onClick={item.action.onClick}
                  >
                    {item.action.label}
                  </button>
                ) : (
                  <span className="k-source-line">No next action provided</span>
                )}
              </div>

              <div data-status-stage="source">
                <SourceLine source={item.source} />
              </div>
            </article>
          )
        })
      )}
    </section>
  )
}
