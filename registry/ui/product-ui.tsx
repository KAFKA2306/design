import React, { useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type SemanticRecord = Readonly<Record<string, unknown>>

function fieldString(record: SemanticRecord | null | undefined, key: string) {
  const value = record?.[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function fieldNumber(record: SemanticRecord | null | undefined, key: string) {
  const value = record?.[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

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

export type TimeSeriesPoint = {
  label: string
  actual?: number
  forecast?: number
}

export type BarPoint = {
  label: string
  value: number
}

export type ScatterPoint = {
  label: string
  x: number
  y: number
  series: 'frontier' | 'portfolio' | 'target'
}

type ChartFrameCommon = {
  title: string
  unit?: string
  source?: SemanticRecord | null
  dataTableId?: string
}

export type ChartFrameProps = ChartFrameCommon & (
  | { variant?: 'line'; data: readonly TimeSeriesPoint[] }
  | { variant: 'bar'; data: readonly BarPoint[] }
  | { variant: 'scatter'; data: readonly ScatterPoint[]; xLabel?: string; yLabel?: string }
)

function ChartTooltip({
  active,
  label,
  payload,
  unit,
}: {
  active?: boolean
  label?: string | number
  payload?: readonly { name?: string; value?: number | string }[]
  unit?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="k-chart-tooltip" role="status">
      <strong>{label}</strong>
      {payload.map((entry) => (
        <span key={entry.name}>{entry.name}: {entry.value}{unit ? ` ${unit}` : ''}</span>
      ))}
    </div>
  )
}

function ScatterTooltip({
  active,
  payload,
  xLabel = 'Risk',
  yLabel = 'Return',
}: {
  active?: boolean
  payload?: readonly { payload?: ScatterPoint }[]
  xLabel?: string
  yLabel?: string
}) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  return (
    <div className="k-chart-tooltip" role="status">
      <strong>{point.label}</strong>
      <span>{xLabel}: {point.x}</span>
      <span>{yLabel}: {point.y}</span>
    </div>
  )
}

function ChartLegend({ variant }: { variant: 'line' | 'bar' | 'scatter' }) {
  if (variant === 'bar') {
    return <div className="k-chart-legend" data-chart-variant="bar"><span data-series="contribution">Contribution</span></div>
  }
  if (variant === 'scatter') {
    return (
      <div className="k-chart-legend" data-chart-variant="scatter" aria-label="Series legend">
        <span data-series="frontier">Frontier</span>
        <span data-series="portfolio">Current</span>
        <span data-series="target">Target</span>
      </div>
    )
  }
  return (
    <div className="k-chart-legend" data-chart-variant="line" aria-label="Series legend">
      <span data-series="actual">Actual</span>
      <span data-series="forecast">Forecast</span>
    </div>
  )
}

export function ChartFrame(props: ChartFrameProps) {
  const variant = props.variant ?? 'line'
  let plot: ReactNode

  if (props.variant === 'bar') {
    plot = (
      <BarChart data={props.data} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 0 }} accessibilityLayer>
        <CartesianGrid stroke="var(--k-color-border)" strokeDasharray="2 2" horizontal={false} />
        <XAxis type="number" tick={{ fill: 'var(--k-color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--k-color-border)' }} />
        <YAxis type="category" dataKey="label" width={88} tick={{ fill: 'var(--k-color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: 'color-mix(in srgb, var(--k-color-accent) 12%, transparent)' }} content={<ChartTooltip unit={props.unit} />} isAnimationActive={false} />
        <Bar dataKey="value" name="Contribution" fill="var(--k-color-primary)" isAnimationActive={false} />
      </BarChart>
    )
  } else if (props.variant === 'scatter') {
    const frontier = props.data.filter((point) => point.series === 'frontier')
    const portfolio = props.data.filter((point) => point.series === 'portfolio')
    const target = props.data.filter((point) => point.series === 'target')
    plot = (
      <ScatterChart margin={{ top: 8, right: 12, bottom: 8, left: 0 }} accessibilityLayer>
        <CartesianGrid stroke="var(--k-color-border)" strokeDasharray="2 2" />
        <XAxis type="number" dataKey="x" name={props.xLabel ?? 'Risk'} tick={{ fill: 'var(--k-color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--k-color-border)' }} />
        <YAxis type="number" dataKey="y" name={props.yLabel ?? 'Return'} width={48} tick={{ fill: 'var(--k-color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ stroke: 'var(--k-color-muted-foreground)', strokeWidth: 1 }} content={<ScatterTooltip xLabel={props.xLabel} yLabel={props.yLabel} />} isAnimationActive={false} />
        <Scatter name="Frontier" data={frontier} fill="var(--k-color-muted-foreground)" line={{ stroke: 'var(--k-color-muted-foreground)', strokeWidth: 1 }} isAnimationActive={false} />
        <Scatter name="Current" data={portfolio} fill="var(--k-color-primary)" isAnimationActive={false} />
        <Scatter name="Target" data={target} fill="var(--k-color-accent)" isAnimationActive={false} />
      </ScatterChart>
    )
  } else {
    plot = (
      <LineChart data={props.data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} accessibilityLayer>
        <CartesianGrid stroke="var(--k-color-border)" strokeDasharray="2 2" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: 'var(--k-color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--k-color-border)' }} />
        <YAxis width={48} tick={{ fill: 'var(--k-color-muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ stroke: 'var(--k-color-muted-foreground)', strokeWidth: 1 }} content={<ChartTooltip unit={props.unit} />} isAnimationActive={false} />
        <Line type="linear" dataKey="actual" name="Actual" stroke="var(--k-color-primary)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} isAnimationActive={false} connectNulls={false} />
        <Line type="linear" dataKey="forecast" name="Forecast" stroke="var(--k-color-accent)" strokeWidth={2} strokeDasharray="5 3" dot={false} activeDot={{ r: 3 }} isAnimationActive={false} connectNulls={false} />
      </LineChart>
    )
  }

  return (
    <figure className="k-chart-frame" data-chart-variant={variant}>
      <figcaption className="k-chart-header">
        <strong>{props.title}</strong>
        {props.unit ? <span>{props.unit}</span> : null}
      </figcaption>
      <ChartLegend variant={variant} />
      <div className="k-chart-plot">
        <ResponsiveContainer width="100%" height="100%">{plot}</ResponsiveContainer>
      </div>
      <SourceLine source={props.source} />
      {props.dataTableId ? <a className="k-chart-data-link" href={`#${props.dataTableId}`}>View underlying data</a> : null}
    </figure>
  )
}

export function ChartGrid({ children }: { children: ReactNode }) {
  return <div className="k-chart-grid">{children}</div>
}

export type ArtifactStatus = 'ready' | 'loading' | 'missing' | 'error'

export function ArtifactViewer({
  src,
  alt,
  caption,
  fit = 'contain',
  status = 'ready',
}: {
  src?: string
  alt: string
  caption?: string
  fit?: 'contain' | 'cover'
  status?: ArtifactStatus
}) {
  const effectiveStatus = status === 'ready' && !src ? 'missing' : status
  return (
    <figure className="k-artifact-viewer" data-fit={fit}>
      <div className="k-artifact-stage">
        {effectiveStatus === 'loading' ? <span role="status">Loading artifact…</span> : null}
        {effectiveStatus === 'missing' ? <span>Artifact is missing.</span> : null}
        {effectiveStatus === 'error' ? <span role="alert">Artifact could not be loaded.</span> : null}
        {effectiveStatus === 'ready' && src ? <img src={src} alt={alt} /> : null}
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

export type ArtifactItem = {
  id: string
  src: string
  alt: string
  caption?: string
}

export function ArtifactGallery({ items }: { items: readonly ArtifactItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const boundedIndex = items.length === 0 ? 0 : Math.min(selectedIndex, items.length - 1)
  const selected = items[boundedIndex]

  function move(delta: number) {
    if (items.length < 2) return
    setSelectedIndex((current) => (current + delta + items.length) % items.length)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      move(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      move(1)
    }
  }

  if (items.length === 0) return <ArtifactViewer alt="Missing artifact" status="missing" />

  return (
    <div className="k-artifact-gallery" tabIndex={0} onKeyDown={onKeyDown} aria-label="Artifact gallery. Use left and right arrow keys to change selection.">
      <ArtifactViewer src={selected.src} alt={selected.alt} caption={selected.caption} />
      {items.length > 1 ? (
        <div className="k-artifact-thumbnails" aria-label="Artifacts">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="k-artifact-thumbnail"
              aria-pressed={index === boundedIndex}
              aria-label={`Show artifact ${index + 1}: ${item.alt}`}
              onClick={() => setSelectedIndex(index)}
            >
              <img src={item.src} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function ArtifactMetadata({
  filename,
  version,
  generatedAt,
  source,
  limitation,
}: {
  filename: string
  version: string
  generatedAt: string
  source?: SemanticRecord | null
  limitation?: string
}) {
  return (
    <dl className="k-artifact-metadata">
      <div><dt>Filename</dt><dd>{filename}</dd></div>
      <div><dt>Version</dt><dd>{version}</dd></div>
      <div><dt>Generated</dt><dd><time dateTime={generatedAt}>{generatedAt}</time></dd></div>
      <div className="k-artifact-source"><dt>Source</dt><dd><SourceLine source={source} /></dd></div>
      {limitation ? <div><dt>Limitation</dt><dd>{limitation}</dd></div> : null}
    </dl>
  )
}
