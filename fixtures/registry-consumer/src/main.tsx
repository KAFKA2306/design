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
  ChartGrid,
  DataTable,
  FilterToolbar,
  Metric,
  SourceLine,
  type DataTableColumn,
} from './components/ui/product-ui'
import { Tabs } from './components/ui/tabs'
import './index.css'

const tabs = [
  { value: 'overview', label: 'Overview', content: <p>Portfolio overview is selected.</p> },
  { value: 'risk', label: 'Risk', content: <p>Risk assumptions are visible here.</p> },
  { value: 'disabled', label: 'Disabled', content: <p>Disabled tab.</p>, disabled: true },
] as const

const source = {
  name: 'Synthetic Product UI fixture',
  reference: 'UI behavior test only; not production evidence.',
}

const facts = [
  { id: 'return', label: 'Annualized return', kind: 'actual', value: 12.4, unit: '%' },
  { id: 'risk', label: 'Forecast risk', kind: 'forecast', value: 18.7, unit: '%' },
] as const

const rows = Array.from({ length: 120 }, (_, index) => ({
  id: index + 1,
  asset: `Synthetic asset ${String(index + 1).padStart(3, '0')}`,
  weight: ((index * 17) % 1000) / 10,
  returnValue: ((index * 29) % 450) / 10 - 10,
}))

type Row = (typeof rows)[number]

const columns: readonly DataTableColumn<Row>[] = [
  { key: 'id', header: '#', align: 'numeric', render: (row) => row.id },
  { key: 'asset', header: 'Asset', render: (row) => row.asset },
  { key: 'weight', header: 'Weight %', align: 'numeric', render: (row) => row.weight.toFixed(1) },
  { key: 'return', header: 'Return %', align: 'numeric', render: (row) => row.returnValue.toFixed(1) },
]

const chartData = Array.from({ length: 12 }, (_, index) => ({
  label: `M${index + 1}`,
  actual: index <= 7 ? 100 + index * 4 + (index % 3) * 2 : undefined,
  forecast: index >= 7 ? 132 + (index - 7) * 3 : undefined,
}))

const artifactA = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='white'/%3E%3Cpath d='M80 350 L210 260 L330 285 L470 165 L620 205 L720 110' fill='none' stroke='black' stroke-width='6'/%3E%3C/svg%3E"
const artifactB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='white'/%3E%3Ccircle cx='400' cy='225' r='140' fill='none' stroke='black' stroke-width='6'/%3E%3C/svg%3E"

function App() {
  const [query, setQuery] = useState('')
  const filteredRows = useMemo(() => rows.filter((row) => row.asset.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <main className="page-container consumer-specimen">
      <h1>Design consumer specimen</h1>

      <section aria-labelledby="core-heading">
        <h2 id="core-heading">Core UI</h2>
        <div className="consumer-row">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button loading loadingLabel="Saving">Save</Button>
        </div>
        <div className="consumer-stack">
          <Input label="Portfolio name" placeholder="Growth portfolio" />
          <Input label="Risk limit" defaultValue="150" error="Enter a value from 0 to 100." />
        </div>
        <Dialog trigger="Review assumptions" title="Review assumptions" description="Escape closes the dialog and focus returns to the trigger.">
          <p>Keyboard and focus management are delegated to Base UI Dialog.</p>
        </Dialog>
        <Tabs defaultValue="overview" items={tabs} />
      </section>

      <section aria-labelledby="information-heading">
        <h2 id="information-heading">Information patterns</h2>
        <div className="consumer-row">
          {facts.map((fact) => <Metric key={fact.id} fact={fact} />)}
        </div>
        <SourceLine source={source} />
        <FilterToolbar query={query} onQueryChange={setQuery} resultCount={filteredRows.length} onReset={() => setQuery('')} />
        <DataTable id="portfolio-data" columns={columns} rows={filteredRows} />
      </section>

      <section aria-labelledby="charts-heading">
        <h2 id="charts-heading">Chart grid</h2>
        <ChartGrid>
          <ChartFrame title="Portfolio performance" unit="index" data={chartData} source={source} dataTableId="portfolio-data" />
          <ChartFrame title="Efficient frontier" unit="return %" data={chartData} source={source} dataTableId="portfolio-data" />
          <ChartFrame title="Risk contribution" unit="%" data={chartData} source={source} dataTableId="portfolio-data" />
        </ChartGrid>
      </section>

      <section aria-labelledby="artifact-heading">
        <h2 id="artifact-heading">Artifact patterns</h2>
        <div className="k-artifact-pair">
          <ArtifactGallery items={[
            { id: 'a', src: artifactA, alt: 'Synthetic line artifact', caption: 'Selected synthetic artifact' },
            { id: 'b', src: artifactB, alt: 'Synthetic circular artifact' },
          ]} />
          <ArtifactMetadata
            filename="synthetic-artifact.svg"
            version="v0"
            generatedAt="2026-01-01T00:00:00Z"
            source={source}
            limitation="Synthetic fixture only."
          />
        </div>
        <div className="consumer-row">
          <ArtifactViewer src={artifactA} alt="Single synthetic artifact" fit="contain" caption="Single" />
          <ArtifactViewer alt="Missing synthetic artifact" status="missing" />
          <ArtifactViewer alt="Errored synthetic artifact" status="error" />
          <ArtifactViewer alt="Loading synthetic artifact" status="loading" />
        </div>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
