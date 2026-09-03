import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const readme = fs.readFileSync('README.md', 'utf8')
const agents = fs.readFileSync('AGENTS.md', 'utf8')
const fixture = fs.readFileSync('fixtures/registry-consumer/src/main.tsx', 'utf8')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

const canonicalReferences = [
  ['tokens/foundation.tokens.json', 'tokens/foundation.tokens.json'],
  ['styles/tokens.css', 'styles/tokens.css'],
  ['styles/components.css', 'styles/components.css'],
  ['registry.json', 'registry.json'],
  ['registry/ui/', 'registry/ui'],
  ['registry/ui/product-ui.tsx', 'registry/ui/product-ui.tsx'],
  ['registry/ui/product/', 'registry/ui/product'],
  ['registry/ui/product/chart.tsx', 'registry/ui/product/chart.tsx'],
  ['artifacts/content.schema.json', 'artifacts/content.schema.json'],
  ['scripts/content-contract.mjs', 'scripts/content-contract.mjs'],
  ['fixtures/registry-consumer/', 'fixtures/registry-consumer'],
  ['.github/workflows/', '.github/workflows'],
]

const documentedScripts = [
  'dev',
  'tokens:build',
  'tokens:validate',
  'tokens:check',
  'content:validate',
  'lint',
  'test',
  'build',
]

test('README canonical references resolve in the repository', () => {
  for (const [documented, path] of canonicalReferences) {
    assert.ok(readme.includes(`\`${documented}\``), `${documented} must remain documented`)
    assert.ok(fs.existsSync(path), `${path} must exist`)
  }
})

test('README pnpm commands stay backed by package scripts', () => {
  for (const script of documentedScripts) {
    assert.ok(packageJson.scripts[script], `package.json must define ${script}`)
    assert.ok(readme.includes(`pnpm ${script}`), `README must document pnpm ${script}`)
  }
})

test('durable prose does not copy dependency version literals', () => {
  const prose = `${readme}\n${agents}`
  const versions = [
    ...Object.values(packageJson.dependencies ?? {}),
    ...Object.values(packageJson.devDependencies ?? {}),
  ]

  for (const version of versions) {
    assert.equal(prose.includes(version), false, `dependency version ${version} belongs in package.json, not prose`)
  }
})

test('AGENTS makes user decision order a durable design invariant', () => {
  assert.match(agents, /context\/identity -> current decision or status -> next action -> key measures or primary view -> supporting evidence\/drilldown -> source\/reference\/implementation details/)
  assert.match(agents, /Changelog, Recent Updates, implementation notes, debug information, roadmap/)
  assert.match(agents, /PLANNED or unavailable features must not visually compete with usable actions/)
  assert.match(agents, /same information hierarchy and brand grammar across domains, not the same dashboard shape/)
})

test('canonical reference surface follows the primary reading path before reference detail', () => {
  const orderedMarkers = [
    'className="k-dashboard-header"',
    'className="k-dashboard-decision"',
    'className="k-dashboard-metrics"',
    'id="overview"',
    'id="frontier"',
    'id="positions"',
    'id="sources"',
    '<ComponentQa />',
  ]

  let previous = -1
  for (const marker of orderedMarkers) {
    const current = fixture.indexOf(marker)
    assert.ok(current > previous, `${marker} must stay after the previous journey stage`)
    previous = current
  }

  assert.match(fixture, /<details className="consumer-qa">/)
  assert.equal(fixture.includes('PLANNED'), false)
})
