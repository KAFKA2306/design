import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const registry = JSON.parse(fs.readFileSync('registry.json', 'utf8'))
const entry = fs.readFileSync('registry/ui/product-ui.tsx', 'utf8')
const decision = fs.readFileSync('registry/ui/product/decision.tsx', 'utf8')
const comparison = fs.readFileSync('registry/ui/product/comparison.tsx', 'utf8')
const evidence = fs.readFileSync('registry/ui/product/evidence.tsx', 'utf8')
const status = fs.readFileSync('registry/ui/product/status.tsx', 'utf8')
const implementationPaths = [
  'registry/ui/product/semantic.ts',
  'registry/ui/product/journey.ts',
  'registry/ui/product/decision.tsx',
  'registry/ui/product/comparison.tsx',
  'registry/ui/product/evidence.tsx',
  'registry/ui/product/status.tsx',
  'registry/ui/product/information.tsx',
  'registry/ui/product/chart.tsx',
  'registry/ui/product/artifact.tsx',
]
const source = implementationPaths.map((path) => fs.readFileSync(path, 'utf8')).join('\n')
const styles = fs.readFileSync('styles/components.css', 'utf8')
const fixture = fs.readFileSync('fixtures/registry-consumer/src/main.tsx', 'utf8')
const fixtureStyles = fs.readFileSync('fixtures/registry-consumer/src/index.css', 'utf8')
const consumerPackage = JSON.parse(fs.readFileSync('fixtures/registry-consumer/package.json', 'utf8'))
const consumerTsconfig = JSON.parse(fs.readFileSync('fixtures/registry-consumer/tsconfig.json', 'utf8'))
const product = registry.items.find((item) => item.name === 'kafka-product-ui')

test('Product UI stays one registry item while implementation is responsibility-split', () => {
  assert.ok(product)
  assert.equal(product.type, 'registry:ui')
  assert.deepEqual(product.dependencies, ['recharts@3.10.1', 'react-is@19.2.8'])
  assert.deepEqual(product.files, [
    { path: 'registry/ui/product-ui.tsx', type: 'registry:ui', target: '~/src/components/ui/product-ui.tsx' },
    { path: 'registry/ui/product/semantic.ts', type: 'registry:ui', target: '~/src/components/ui/product/semantic.ts' },
    { path: 'registry/ui/product/journey.ts', type: 'registry:ui', target: '~/src/components/ui/product/journey.ts' },
    { path: 'registry/ui/product/decision.tsx', type: 'registry:ui', target: '~/src/components/ui/product/decision.tsx' },
    { path: 'registry/ui/product/comparison.tsx', type: 'registry:ui', target: '~/src/components/ui/product/comparison.tsx' },
    { path: 'registry/ui/product/evidence.tsx', type: 'registry:ui', target: '~/src/components/ui/product/evidence.tsx' },
    { path: 'registry/ui/product/status.tsx', type: 'registry:ui', target: '~/src/components/ui/product/status.tsx' },
    { path: 'registry/ui/product/information.tsx', type: 'registry:ui', target: '~/src/components/ui/product/information.tsx' },
    { path: 'registry/ui/product/chart.tsx', type: 'registry:ui', target: '~/src/components/ui/product/chart.tsx' },
    { path: 'registry/ui/product/artifact.tsx', type: 'registry:ui', target: '~/src/components/ui/product/artifact.tsx' },
  ])
  assert.equal(registry.items.filter((item) => item.name === 'kafka-product-ui').length, 1)
  assert.equal((entry.match(/export function\s+/g) ?? []).length, 0)
  assert.match(entry, /from '\.\/product\/information'/)
  assert.match(entry, /from '\.\/product\/chart'/)
  assert.match(entry, /from '\.\/product\/artifact'/)
  assert.match(entry, /from '\.\/product\/decision'/)
  assert.match(entry, /from '\.\/product\/comparison'/)
  assert.match(entry, /from '\.\/product\/evidence'/)
  assert.match(entry, /from '\.\/product\/status'/)
  assert.match(entry, /from '\.\/product\/journey'/)
})

test('all Product UI public patterns have one canonical implementation', () => {
  for (const name of [
    'Metric',
    'SourceLine',
    'FilterToolbar',
    'DataTable',
    'DecisionPanel',
    'ComparisonSurface',
    'EvidenceSurface',
    'StatusSurface',
    'ChartFrame',
    'ChartGrid',
    'ArtifactViewer',
    'ArtifactGallery',
    'ArtifactMetadata',
  ]) {
    assert.match(source, new RegExp(`export function ${name}\\b`), `${name} must be exported once`)
    assert.equal((source.match(new RegExp(`export function ${name}\\b`, 'g')) ?? []).length, 1)
  }
})

test('DecisionPanel fixes hierarchy, information order, interaction, state and evidence disclosure', () => {
  const orderedMarkers = [
    'className="k-dashboard-header"',
    'className="k-dashboard-decision"',
    'className="k-dialog-actions"',
    'className="k-dashboard-metrics"',
    'className="k-dashboard-brief"',
  ]
  let previous = -1
  for (const marker of orderedMarkers) {
    const current = decision.indexOf(marker)
    assert.ok(current > previous, `${marker} must stay after the previous completed-component stage`)
    previous = current
  }
  assert.match(decision, /data-component="decision-panel"/)
  assert.match(decision, /data-state=\{state\}/)
  assert.match(decision, /role="status" aria-live="polite"/)
  assert.match(decision, /primaryAction: DecisionPanelAction/)
  assert.match(decision, /disabled=\{primaryAction\.disabled\}/)
  assert.match(decision, /<Metric key=/)
  assert.match(decision, /<SourceLine source=\{source\}/)
  assert.match(decision, /<details className="k-dashboard-brief">/)
  assert.doesNotMatch(decision, /children\?:/)
})

test('ComparisonSurface fixes option -> same-scale measures -> evidence order without computing business semantics', () => {
  const orderedMarkers = [
    'data-comparison-stage="options"',
    'data-comparison-stage="metrics"',
    'data-comparison-stage="evidence"',
  ]
  let previous = -1
  for (const marker of orderedMarkers) {
    const current = comparison.indexOf(marker)
    assert.ok(current > previous, `${marker} must stay after the previous comparison stage`)
    previous = current
  }
  assert.match(comparison, /data-component="comparison-surface"/)
  assert.match(comparison, /'baseline' \| 'current' \| 'candidate'/)
  assert.match(comparison, /ComparisonSurface requires at least two comparison options/)
  assert.match(comparison, /<th scope="col">Difference<\/th>/)
  assert.match(comparison, /Not provided/)
  assert.match(comparison, /metric\.values\[option\.id\]/)
  assert.match(comparison, /difference\?: string \| null/)
  assert.match(comparison, /data-status=\{option\.status \?\? undefined\}/)
  assert.match(comparison, /<SourceLine source=\{option\.source\}/)
  assert.doesNotMatch(comparison, /VERIFIED|UNVERIFIED|PASS|FAIL|BLOCKED/)
  assert.doesNotMatch(comparison, /children\?:/)
})

test('EvidenceSurface fixes identity -> source/as-of -> provenance -> link order without redefining status semantics', () => {
  const orderedMarkers = [
    'data-evidence-stage="identity"',
    'data-evidence-stage="source"',
    'data-evidence-stage="provenance"',
    'data-evidence-stage="link"',
  ]
  let previous = -1
  for (const marker of orderedMarkers) {
    const current = evidence.indexOf(marker)
    assert.ok(current > previous, `${marker} must stay after the previous evidence stage`)
    previous = current
  }
  assert.match(evidence, /data-component="evidence-surface"/)
  assert.match(evidence, /status\?: string/)
  assert.match(evidence, /revision\?: string/)
  assert.match(evidence, /hash\?: string/)
  assert.match(evidence, /href\?: string/)
  assert.match(evidence, /<SourceLine source=\{record\.source\}/)
  assert.match(evidence, /Status not provided/)
  assert.match(evidence, /Not provided/)
  assert.match(evidence, /Evidence link not provided/)
  assert.match(evidence, /records\.length === 0/)
  assert.doesNotMatch(evidence, /VERIFIED|UNVERIFIED|TEST_ONLY|PASS|FAIL|BLOCKED/)
  assert.doesNotMatch(evidence, /children\?:/)
})

test('StatusSurface fixes status -> reason -> next action -> source order while reusing central action/state grammar', () => {
  const orderedMarkers = [
    'data-status-stage="identity"',
    'data-status-stage="reason"',
    'data-status-stage="action"',
    'data-status-stage="source"',
  ]
  let previous = -1
  for (const marker of orderedMarkers) {
    const current = status.indexOf(marker)
    assert.ok(current > previous, `${marker} must stay after the previous status stage`)
    previous = current
  }
  assert.match(status, /data-component="status-surface"/)
  assert.match(status, /StatusSurfaceTone = DecisionPanelState/)
  assert.match(status, /action\?: DecisionPanelAction/)
  assert.match(status, /status: string/)
  assert.match(status, /Reason not provided/)
  assert.match(status, /No next action provided/)
  assert.match(status, /tone === 'blocked' \? 'alert' : 'status'/)
  assert.match(status, /disabled=\{item\.action\.disabled\}/)
  assert.match(status, /onClick=\{item\.action\.onClick\}/)
  assert.match(status, /<SourceLine source=\{item\.source\}/)
  assert.match(status, /items\.length === 0/)
  assert.doesNotMatch(status, /VERIFIED|UNVERIFIED|TEST_ONLY|PASS|FAIL|BLOCKED/)
  assert.doesNotMatch(status, /children\?:/)
})

test('semantic fact/source rendering does not create a competing schema or verification badge model', () => {
  assert.match(source, /type SemanticRecord = Readonly<Record<string, unknown>>/)
  assert.doesNotMatch(source, /interface\s+(?:Fact|Source|Evidence)|type\s+(?:Fact|Source|Evidence)\s*=/)
  assert.doesNotMatch(source, /VERIFIED|UNVERIFIED/)
  assert.match(source, /data-raw-value=/)
  assert.match(source, /Source not provided/)
})

test('metric hierarchy makes primary values readable without adding card chrome', () => {
  assert.match(source, /k-metric-meta/)
  assert.match(styles, /\.k-metric-value[\s\S]*font-size:\s*var\(--k-font-size-title\);[\s\S]*font-weight:\s*600;/)
  assert.doesNotMatch(styles, /\.k-metric[\s\S]{0,500}box-shadow\s*:/)
})

test('table density and overflow are centrally constrained', () => {
  assert.match(styles, /\.k-table-region[\s\S]*overflow:\s*auto;/)
  assert.match(styles, /\.k-data-table th,[\s\S]*height:\s*var\(--k-dimension-table-row\);/)
  assert.match(styles, /\.k-data-table th[\s\S]*position:\s*sticky;[\s\S]*top:\s*0;/)
  assert.match(styles, /\[data-align="numeric"\][\s\S]*text-align:\s*right;/)
})

test('one ChartFrame owns line, bar and scatter grammar', () => {
  assert.match(source, /BarChart/)
  assert.match(source, /ScatterChart/)
  assert.match(source, /variant:\s*'bar'/)
  assert.match(source, /variant:\s*'scatter'/)
  assert.match(source, /dataKey="actual"/)
  assert.match(source, /dataKey="forecast"/)
  assert.match(source, /stroke="var\(--k-color-primary\)"/)
  assert.match(source, /stroke="var\(--k-color-accent\)"/)
  assert.match(source, /strokeDasharray="5 3"/)
  assert.match(source, /<Tooltip[\s\S]*cursor=/)
  assert.match(source, /View underlying data/)
  assert.match(source, /isAnimationActive=\{false\}/)
  assert.doesNotMatch(fixture, /<(?:LineChart|BarChart|ScatterChart)\b/)
})

test('canonical dashboard consumes completed Product UI instead of rebuilding decision/status/evidence hierarchy', () => {
  assert.match(fixture, /className="k-dashboard"/)
  assert.match(fixture, /<DecisionPanel\b/)
  assert.match(fixture, /<StatusSurface\b/)
  assert.match(fixture, /<EvidenceSurface\b/)
  assert.match(fixture, /variant="bar"/)
  assert.match(fixture, /variant="scatter"/)
  assert.match(fixture, /No rebalance required/)
  assert.match(fixture, /Review decision/)
  assert.match(fixture, /Portfolio checks/)
  assert.match(fixture, /Source boundary/)
  assert.match(fixture, /120-row density fixture/)
  assert.doesNotMatch(fixture, /className="k-dashboard-decision"/)
  assert.doesNotMatch(fixture, /<Metric\b/)
  assert.doesNotMatch(fixture, /<SourceLine\b/)
  assert.doesNotMatch(fixtureStyles, /max-width:\s*56rem/)
})

test('dashboard shell authority is centralized and responsive', () => {
  assert.match(styles, /\.k-dashboard[\s\S]*grid-template-columns:\s*var\(--k-dimension-sidebar\) minmax\(0, 1fr\);/)
  assert.match(styles, /\.k-dashboard-sidebar[\s\S]*height:\s*100vh;/)
  assert.match(styles, /\.k-dashboard-metrics[\s\S]*repeat\(5, minmax\(0, 1fr\)\)/)
  assert.match(styles, /@media \(max-width: 48rem\)[\s\S]*\.k-dashboard[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\);/)
  assert.match(styles, /\.k-dashboard-nav\[data-open="true"\][\s\S]*display:\s*grid;/)
})

test('responsive chart and artifact layout has no page-level horizontal overflow authority', () => {
  assert.match(styles, /\.k-chart-grid[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/)
  assert.match(styles, /@media \(max-width: 60rem\)[\s\S]*\.k-chart-grid,[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\);/)
  assert.match(styles, /\.k-artifact-pair[\s\S]*grid-template-columns:\s*minmax\(0, 2fr\) minmax\(16rem, 1fr\);/)
})

test('artifact viewer and gallery expose explicit fit, failure states and keyboard selection semantics', () => {
  assert.match(source, /fit\?: 'contain' \| 'cover'/)
  assert.match(source, /'ready' \| 'loading' \| 'missing' \| 'error'/)
  assert.match(source, /event\.key === 'ArrowLeft'/)
  assert.match(source, /event\.key === 'ArrowRight'/)
  assert.match(source, /aria-pressed=/)
  assert.match(source, /Filename/)
  assert.match(source, /Generated/)
})

test('clean consumer build type-checks before rendering with TypeScript 7 and Vite import types', () => {
  assert.equal(consumerPackage.scripts.build, 'tsc --noEmit && vite build')
  assert.equal(Object.hasOwn(consumerTsconfig.compilerOptions, 'baseUrl'), false)
  assert.deepEqual(consumerTsconfig.compilerOptions.paths, { '@/*': ['./src/*'] })
  assert.deepEqual(consumerTsconfig.compilerOptions.types, ['vite/client'])
})

test('Product UI source carries no raw visual color or forbidden decorative effect', () => {
  assert.doesNotMatch(source, /#[0-9a-fA-F]{3,8}\b/)
  assert.doesNotMatch(source, /(?:linear|radial|conic)-gradient\s*\(/i)
  assert.doesNotMatch(styles, /(?:linear|radial|conic)-gradient\s*\(/i)
  assert.doesNotMatch(styles, /box-shadow\s*:|text-shadow\s*:|backdrop-filter\s*:/i)
})
