import { useId, type ReactNode } from 'react'
import { fieldNumber, fieldString, type SemanticRecord } from './semantic'

export function Metric({
  fact,
  formatValue,
}: {
  fact: SemanticRecord
  formatValue?: (value: number) => string
}) {
  const label = fieldString(fact, 'label') ?? 'Unlabeled metric'
  const kind = fieldString(fact, 'kind') ?? 'unverified'
  const unit = fieldString(fact, 'unit')
  const value = fieldNumber(fact, 'value')
  const text = fieldString(fact, 'text')
  const formatted = value === undefined ? text ?? '—' : (formatValue?.(value) ?? new Intl.NumberFormat().format(value))

  return (
    <div className="k-metric" data-kind={kind}>
      <span className="k-metric-meta">
        <span className="k-metric-label">{label}</span>
        <span className="k-metric-kind">{kind}</span>
      </span>
      <span className="k-metric-value">
        {value === undefined ? (
          formatted
        ) : (
          <data value={String(value)} data-raw-value={String(value)}>{formatted}</data>
        )}
        {unit ? <span className="k-metric-unit"> {unit}</span> : null}
      </span>
    </div>
  )
}

export function SourceLine({ source }: { source?: SemanticRecord | null }) {
  if (!source) return <p className="k-source-line">Source not provided</p>

  const name = fieldString(source, 'name') ?? 'Unnamed source'
  const url = fieldString(source, 'url')
  const reference = fieldString(source, 'reference')
  const timestamp = fieldString(source, 'timestamp')
  const limitation = fieldString(source, 'limitation')

  return (
    <p className="k-source-line">
      <span>Source: {url ? <a href={url}>{name}</a> : name}</span>
      {timestamp ? <time dateTime={timestamp}>{timestamp}</time> : null}
      {reference ? <span>{reference}</span> : null}
      {limitation ? <span>{limitation}</span> : null}
    </p>
  )
}

export function FilterToolbar({
  query,
  onQueryChange,
  onReset,
  resultCount,
  children,
}: {
  query: string
  onQueryChange: (value: string) => void
  onReset: () => void
  resultCount: number
  children?: ReactNode
}) {
  const searchId = useId()
  return (
    <div className="k-filter-toolbar" role="search">
      <label className="k-filter-search" htmlFor={searchId}>
        <span className="k-visually-hidden">Search results</span>
        <input
          id={searchId}
          className="k-input"
          type="search"
          value={query}
          placeholder="Search"
          onChange={(event) => onQueryChange(event.currentTarget.value)}
        />
      </label>
      {children ? <div className="k-filter-slot">{children}</div> : null}
      <span className="k-filter-count" aria-live="polite">{resultCount} results</span>
      <button className="k-button k-button-secondary" type="button" onClick={onReset}>Reset</button>
    </div>
  )
}

export type DataTableColumn<Row> = {
  key: string
  header: string
  align?: 'text' | 'numeric'
  render: (row: Row) => ReactNode
}

export function DataTable<Row>({
  id,
  columns,
  rows,
  state = 'ready',
  partialMessage,
}: {
  id?: string
  columns: readonly DataTableColumn<Row>[]
  rows: readonly Row[]
  state?: 'ready' | 'loading' | 'error'
  partialMessage?: string
}) {
  if (state === 'loading') return <div className="k-table-state" role="status">Loading data…</div>
  if (state === 'error') return <div className="k-table-state" role="alert">Unable to load data.</div>
  if (rows.length === 0) return <div className="k-table-state">No results.</div>

  return (
    <div className="k-table-region" id={id} tabIndex={0}>
      {partialMessage ? <p className="k-table-partial" role="status">{partialMessage}</p> : null}
      <table className="k-data-table">
        <thead>
          <tr>{columns.map((column) => <th key={column.key} scope="col" data-align={column.align ?? 'text'}>{column.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => <td key={column.key} data-align={column.align ?? 'text'}>{column.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
