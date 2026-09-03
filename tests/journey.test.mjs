import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const source = fs.readFileSync('registry/ui/product/journey.ts', 'utf8')
const entry = fs.readFileSync('registry/ui/product-ui.tsx', 'utf8')
const agents = fs.readFileSync('AGENTS.md', 'utf8')
const registry = JSON.parse(fs.readFileSync('registry.json', 'utf8'))
const product = registry.items.find((item) => item.name === 'kafka-product-ui')

test('journey authority is action-based rather than domain-classified', () => {
  for (const action of ['inspect', 'compare', 'decide', 'act', 'investigate']) {
    assert.match(source, new RegExp(`'${action}'`))
  }
  assert.doesNotMatch(source, /financial|developer|3d/i)
  assert.match(agents, /Do not force one global reading order/)
  assert.match(agents, /inspect, compare, decide, act, and investigate/)
})

test('journey candidates are canonical and consumer-selected', () => {
  for (const pattern of ['review-and-act', 'compare-and-decide', 'investigate-before-action', 'execute-and-check']) {
    assert.match(source, new RegExp(`'${pattern}'`))
  }
  assert.match(source, /export function recommendJourneyPatterns/)
  assert.match(source, /export function getJourneyPattern/)
  assert.match(source, /\.sort\(\(left, right\) => right\.score - left\.score/)
  assert.match(source, /\.slice\(0, Math\.min\(limit, JOURNEY_PATTERNS\.length\)\)/)
})

test('recommendation inputs cover structure, declared priorities and observed aggregates without owning raw logs', () => {
  for (const structural of ['ui', 'data', 'action', 'transition']) {
    assert.match(source, new RegExp(`'${structural}'`))
  }
  for (const usage of ['declared', 'consumer', 'observed']) {
    assert.match(source, new RegExp(`'${usage}'`))
  }
  assert.match(source, /importance: number/)
  assert.match(source, /frequency: number/)
  assert.match(source, /currentOrder\?: readonly JourneyAction\[\]/)
  assert.doesNotMatch(source, /raw(?:Event|Log)|telemetryStore|localStorage|fetch\(/i)
  assert.match(agents, /Raw usage events remain consumer-owned/)
})

test('journey ranking fails loudly on malformed or empty signals', () => {
  assert.match(source, /must be a finite number from 0 to 1/)
  assert.match(source, /must provide evidence and usage arrays/)
  assert.match(source, /requires at least one positive evidence or usage signal/)
  assert.match(source, /limit must be a positive integer/)
})

test('Product UI exposes and installs the journey source from one canonical location', () => {
  assert.ok(product)
  assert.match(entry, /from '\.\/product\/journey'/)
  assert.equal(
    product.files.filter((item) => item.path === 'registry/ui/product/journey.ts').length,
    1,
  )
  assert.equal(
    product.files.find((item) => item.path === 'registry/ui/product/journey.ts')?.target,
    '~/src/components/ui/product/journey.ts',
  )
})
