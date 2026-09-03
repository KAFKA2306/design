import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const registry = JSON.parse(fs.readFileSync('registry.json', 'utf8'))
const source = fs.readFileSync('registry/ui/product-ui.tsx', 'utf8')
const styles = fs.readFileSync('styles/components.css', 'utf8')
const product = registry.items.find((item) => item.name === 'kafka-product-ui')

test('Product UI is one registry item with pinned chart dependencies', () => {
  assert.ok(product)
  assert.equal(product.type, 'registry:ui')
  assert.deepEqual(product.dependencies, ['recharts@3.10.1', 'react-is@19.2.8'])
  assert.deepEqual(product.files, [
    { path: 'registry/ui/product-ui.tsx', type: 'registry:ui', target: '~/src/components/ui/product-ui.tsx' },
  ])
})

test('all Issue #5 public patterns have one canonical implementation', () => {
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

test('table density and overflow are centrally constrained', () => {
  assert.match(styles, /\.k-table-region[\s\S]*overflow:\s*auto;/)
  assert.match(styles, /\.k-data-table th,[\s\S]*height:\s*var\(--k-dimension-table-row\);/)
  assert.match(styles, /\.k-data-table th[\s\S]*position:\s*sticky;[\s\S]*top:\s*0;/)
  assert.match(styles, /\[data-align="numeric"\][\s\S]*text-align:\s*right;/)
})

test('chart authority distinguishes actual and forecast and exposes hover values plus source data', () => {
  assert.match(source, /from 'recharts'/)
  assert.match(source, /dataKey="actual"/)
  assert.match(source, /dataKey="forecast"/)
  assert.match(source, /stroke="var\(--k-color-primary\)"/)
  assert.match(source, /stroke="var\(--k-color-accent\)"/)
  assert.match(source, /strokeDasharray="5 3"/)
  assert.match(source, /<Tooltip[\s\S]*cursor=/)
  assert.match(source, /View underlying data/)
  assert.match(source, /isAnimationActive=\{false\}/)
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

test('Product UI source carries no raw visual color or forbidden decorative effect', () => {
  assert.doesNotMatch(source, /#[0-9a-fA-F]{3,8}\b/)
  assert.doesNotMatch(source, /(?:linear|radial|conic)-gradient\s*\(/i)
  assert.doesNotMatch(styles, /(?:linear|radial|conic)-gradient\s*\(/i)
  assert.doesNotMatch(styles, /box-shadow\s*:|text-shadow\s*:|backdrop-filter\s*:/i)
})
