import type { ReactNode } from 'react'
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
import { SourceLine } from './information'
import type { SemanticRecord } from './semantic'

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
