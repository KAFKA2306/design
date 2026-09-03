import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button } from './components/ui/button'
import { Dialog } from './components/ui/dialog'
import { Input } from './components/ui/input'
import {
  ArtifactGallery,
  ArtifactMetadata,
  ArtifactViewer,
  ChartFrame,
  DataTable,
  FilterToolbar,
  Metric,
  SourceLine,
  type BarPoint,
  type DataTableColumn,
  type ScatterPoint,
  type TimeSeriesPoint,
} from './components/ui/product-ui'
import { Tabs } from './components/ui/tabs'
import './index.css'

const source = {
  name: 'Synthetic reference portfolio',
  timestamp: '2026-09-03T13:30:00+09:00',
  reference: 'Design and interaction fixture only',
  limitation: 'Not investment advice or production evidence.',
}

const metrics = [
  { id: 'assets', label: 'Total assets', kind: 'actual', value: 28.42, unit: 'M JPY' },
  { id: 'return', label: 'YTD return', kind: 'actual', value: 16.8, unit: '%' },
  { id: 'risk', label: 'Forecast risk', kind: 'forecast', value: 18.7, unit: '%' },
  { id: 'drawdown', label: 'Max drawdown', kind: 'actual', value: -12.4, unit: '%' },
  { id: 'cash', label: 'Cash', kind: 'actual', value: 6.8, unit: '%' },
] as const

const performance: readonly TimeSeriesPoint[] = [
  { label: 'Jan', actual: 100 },
  { label: 'Feb', actual: 103.2 },
  { label: 'Mar', actual: 101.8 },
  { label: 'Apr', actual: 106.7 },
  { label: 'May', actual: 109.4 },
  { label: 'Jun', actual: 112.1 },
  { label: 'Jul', actual: 115.8 },
  { label: 'Aug', actual: 117.4 },
  { label: 'Sep', actual: 116.8, forecast: 116.8 },
  { label: 'Oct', forecast: 119.2 },
  { label: 'Nov', forecast: 121.0 },
  { label: 'Dec', forecast: 123.4 },
]

const riskContribution: readonly BarPoint[] = [
  { label: 'US Tech', value: 38.4 },
  { label: 'Gold', value: 19.7 },
  { label: 'Treasury', value: 13.1 },
  { label: 'USDJPY', value: 10.2 },
  { label: 'Other', value: 18.6 },
]

const frontier: readonly ScatterPoint[] = [
  { label: 'Frontier 1', x: 7.2, y: 4.8, series: 'frontier' },
  { label: 'Frontier 2', x: 9.1, y: 6.4, series: 'frontier' },
  { label: 'Frontier 3', x: 11.5, y: 8.1, series: 'frontier' },
  { label: 'Frontier 4', x: 14.0, y: 9.7, series: 'frontier' },
  { label: 'Frontier 5', x: 17.0, y: 11.1, series: 'frontier' },
  { label: 'Frontier 6', x: 20.5, y: 12.2, series: 'frontier' },
  { label: 'Frontier 7', x: 24.0, y: 13.0, series: 'frontier' },
  { label: 'Current portfolio', x: 18.7, y: 11.6, series: 'portfolio' },
  { label: 'Target portfolio', x: 16.5, y: 11.4, series: 'target' },
]

const namedPositions = [
  ['US Tech basket', 42.0, 22.6, 25.4],
  ['Gold proxy', 18.0, 14.2, 15.1],
  ['US Treasury', 12.0, 5.1, 7.4],
  ['USDJPY carry', 8.0, 7.8, 11.2],
  ['Japan equity', 7.2, 11.4, 19.8],
  ['Cash JPY', 6.8, 0.4, 0.2],
] as const

const rows = Array.from({ length: 120 }, (_, index) => {
  const named = namedPositions[index]
  if (named) {
    return { id: index + 1, asset: named[0], weight: named[1], returnValue: named[2], risk: named[3] }
  }
  return {
    id: index + 1,
    asset: `Synthetic sleeve ${String(index + 1).padStart(3, '0')}`,
    weight: ((index * 17) % 80) / 10,
    returnValue: ((index * 29) % 320) / 10 - 8,
    risk: 4 + ((index * 13) % 210) / 10,
  }
})

type Row = (typeof rows)[number]

const columns: readonly DataTableColumn<Row>[] = [
  { key: 'asset', header: 'Position', render: (row) => row.asset },
  { key: 'weight', header: 'Weight %', align: 'numeric', render: (row) => row.weight.toFixed(1) },
  { key: 'return', header: 'Return %', align: 'numeric', render: (row) => row.returnValue.toFixed(1) },
  { key: 'risk', header: 'Risk %', align: 'numeric', render: (row) => row.risk.toFixed(1) },
]

const tabs = [
  { value: 'overview', label: 'Overview', content: <p>Portfolio overview is selected.</p> },
  { value: 'risk', label: 'Risk', content: <p>Risk assumptions are visible here.</p> },
] as const

const artifactA = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='white'/%3E%3Cpath d='M80 350 L210 260 L330 285 L470 165 L620 205 L720 110' fill='none' stroke='black' stroke-width='6'/%3E%3C/svg%3E"
const artifactB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='white'/%3E%3Ccircle cx='400' cy='225' r='140' fill='none' stroke='black' stroke-width='6'/%3E%3C/svg%3E"

function ComponentQa() {
  return (
    <details className="consumer-qa">
      <summary>Component QA</summary>
      <div className="consumer-qa-grid">
        <section>
          <h2>Core UI</h2>
          <div className="consumer-row">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button loading loadingLabel="Saving">Save</Button>
          </div>
          <Input label="Portfolio name" placeholder="Growth portfolio" />
          <Input label="Risk limit" defaultValue="150" error="Enter a value from 0 to 100." />
          <Dialog trigger="Review assumptions" title="Review assumptions" description="Escape closes the dialog and focus returns to the trigger.">
            <p>Keyboard and focus management are delegated to Base UI Dialog.</p>
          </Dialog>
          <Tabs defaultValue="overview" items={tabs} />
        </section>
        <section>
          <h2>Artifact UI</h2>
          <div className="k-artifact-pair">
            <ArtifactGallery items={[
              { id: 'a', src: artifactA, alt: 'Synthetic line artifact', caption: 'Selected synthetic artifact' },
              { id: 'b', src: artifactB, alt: 'Synthetic circular artifact' },
            ]} />
            <ArtifactMetadata filename="synthetic-artifact.svg" version="v0" generatedAt="2026-01-01T00:00:00Z" source={source} limitation="Synthetic fixture only." />
          </div>
          <div className="consumer-row">
            <ArtifactViewer src={artifactA} alt="Single synthetic artifact" fit="contain" caption="Single" />
            <ArtifactViewer alt="Missing synthetic artifact" status="missing" />
            <ArtifactViewer alt="Errored synthetic artifact" status="error" />
          </div>
        </section>
      </div>
    </details>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [navOpen, setNavOpen] = useState(false)
  const filteredRows = useMemo(() => rows.filter((row) => row.asset.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <div className="k-dashboard">
      <aside className="k-dashboard-sidebar" aria-label="Primary navigation">
        <div className="k-dashboard-brand">
          <strong>KAFKA</strong>
          <span>FINANCE DESK</span>
        </div>
        <button className="k-dashboard-menu" type="button" aria-expanded={navOpen} aria-controls="dashboard-nav" onClick={() => setNavOpen((open) => !open)}>
          Menu
        </button>
        <nav id="dashboard-nav" className="k-dashboard-nav" data-open={navOpen || undefined}>
          <a href="#overview" aria-current="page" onClick={() => setNavOpen(false)}>Overview</a>
          <a href="#frontier" onClick={() => setNavOpen(false)}>Frontier</a>
          <a href="#positions" onClick={() => setNavOpen(false)}>Positions</a>
          <a href="#sources" onClick={() => setNavOpen(false)}>Sources</a>
        </nav>
      </aside>

      <main className="k-dashboard-main">
        <header className="k-dashboard-header">
          <div className="k-dashboard-heading">
            <p className="k-dashboard-eyebrow">PORTFOLIO INTELLIGENCE / SYNTHETIC REFERENCE</p>
            <h1 className="k-dashboard-title">Growth portfolio</h1>
            <SourceLine source={source} />
          </div>
          <div className="k-dashboard-decision" aria-label="Current decision">
            <span>Decision</span>
            <strong>No rebalance required</strong>
            <small>Forecast risk 18.7% is within the 20.0% budget.</small>
          </div>
        </header>

        <section className="k-dashboard-metrics" aria-label="Portfolio metrics">
          {metrics.map((fact) => <Metric key={fact.id} fact={fact} />)}
        </section>

        <section id="overview" className="k-dashboard-grid" aria-label="Performance and risk">
          <ChartFrame title="Portfolio performance" unit="index" data={performance} source={source} dataTableId="portfolio-data" />
          <ChartFrame variant="bar" title="Risk contribution" unit="%" data={riskContribution} source={source} dataTableId="portfolio-data" />
        </section>

        <section id="frontier" className="k-dashboard-grid" aria-label="Efficient frontier and decision context">
          <ChartFrame variant="scatter" title="Efficient frontier" data={frontier} xLabel="Risk %" yLabel="Return %" source={source} dataTableId="portfolio-data" />
          <div className="k-dashboard-brief">
            <h2>Decision context</h2>
            <p>Current portfolio remains above the minimum return constraint and below the risk budget.</p>
            <ul>
              <li><strong>Target:</strong> reduce risk by 2.2pt without materially reducing expected return.</li>
              <li><strong>Constraint:</strong> cash floor 5%; current 6.8%.</li>
              <li><strong>Watch:</strong> US Tech contributes 38.4% of modeled portfolio risk.</li>
            </ul>
          </div>
        </section>

        <section id="positions" className="k-dashboard-section" aria-labelledby="positions-heading">
          <header className="k-dashboard-section-header">
            <h2 id="positions-heading">Positions</h2>
            <span>120-row density fixture</span>
          </header>
          <FilterToolbar query={query} onQueryChange={setQuery} resultCount={filteredRows.length} onReset={() => setQuery('')} />
          <DataTable id="portfolio-data" columns={columns} rows={filteredRows} />
        </section>

        <section id="sources" className="k-dashboard-section" aria-labelledby="sources-heading">
          <header className="k-dashboard-section-header"><h2 id="sources-heading">Source boundary</h2></header>
          <SourceLine source={source} />
        </section>

        <ComponentQa />
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
