import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const registry = JSON.parse(fs.readFileSync('registry.json', 'utf8'))
const source = fs.readFileSync('registry/ui/product-ui.tsx', 'utf8')
const styles = fs.readFileSync('styles/components.css', 'utf8')
const fixture = fs.readFileSync('fixtures/registry-consumer/src/main.tsx', 'utf8')
const fixtureStyles = fs.readFileSync('fixtures/registry-consumer/src/index.css', 'utf8')
const consumerPackage = JSON.parse(fs.readFileSync('fixtures/registry-consumer/package.json', 'utf8'))
const consumerTsconfig = JSON.parse(fs.readFileSync('fixtures/registry-consumer/tsconfig.json', 'utf8'))
const product = registry.items.find((item) => item.name === 'kafka-product-ui')

test('Product UI is one registry item with pinned chart dependencies', () => {
  assert.ok(product)
  assert.equal(product.type, 'registry:ui')
  assert.deepEqual(product.dependencies, ['recharts@3.10.1', 'react-is@19.2.8'])
  assert.deepEqual(product.files, [
    { path: 'registry/ui/product-ui.tsx', type: 'registry:ui', target: '~/src/components/ui/product-ui.tsx' },
  ])
})

test('all Product UI public patterns have one canonical implementation', () => {
  for (const name of [
    'Metric',
    'SourceLine',
    'FilterToolbar',
    'DataTable',
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

test('canonical dashboard composes existing Product UI instead of creating duplicate components', () => {
  assert.match(fixture, /className="k-dashboard"/)
  assert.match(fixture, /className="k-dashboard-metrics"/)
  assert.match(fixture, /variant="bar"/)
  assert.match(fixture, /variant="scatter"/)
  assert.match(fixture, /No rebalance required/)
  assert.match(fixture, /120-row density fixture/)
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

test('clean consumer build type-checks before rendering with TypeScript 7-compatible alias resolution', () => {
  assert.equal(consumerPackage.scripts.build, 'tsc --noEmit && vite build')
  assert.equal(Object.hasOwn(consumerTsconfig.compilerOptions, 'baseUrl'), false)
  assert.deepEqual(consumerTsconfig.compilerOptions.paths, { '@/*': ['./src/*'] })
})

test('Product UI source carries no raw visual color or forbidden decorative effect', () => {
  assert.doesNotMatch(source, /#[0-9a-fA-F]{3,8}\b/)
  assert.doesNotMatch(source, /(?:linear|radial|conic)-gradient\s*\(/i)
  assert.doesNotMatch(styles, /(?:linear|radial|conic)-gradient\s*\(/i)
  assert.doesNotMatch(styles, /box-shadow\s*:|text-shadow\s*:|backdrop-filter\s*:/i)
})
