import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const read = (path) => fs.readFileSync(path, 'utf8')
const readme = read('README.md')
const agents = read('AGENTS.md')
const packageJson = JSON.parse(read('package.json'))
const journey = read('registry/ui/product/journey.ts')
const productUi = read('registry/ui/product-ui.tsx')
const showcase = read('src/main.tsx')

const canonicalAuthorityPaths = [...readme.matchAll(/^\| [^|]+ \| `([^`]+)` \|/gm)].map((match) => match[1])

test('README canonical authority paths resolve in the repository', () => {
  assert.ok(canonicalAuthorityPaths.length > 0, 'README authority map must expose canonical paths')
  for (const reference of canonicalAuthorityPaths) {
    assert.equal(fs.existsSync(reference), true, `README canonical authority does not resolve: ${reference}`)
  }
})

test('README pnpm commands stay backed by package scripts', () => {
  const commands = [...readme.matchAll(/pnpm ([a-z][a-z0-9:-]+)/g)].map((match) => match[1])
  for (const command of commands) {
    if (command === 'install') continue
    assert.ok(packageJson.scripts?.[command], `README command pnpm ${command} has no package script`)
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

test('journey policy is executable rather than phrase-pinned prose', () => {
  for (const action of ['inspect', 'compare', 'decide', 'act', 'investigate']) {
    assert.match(journey, new RegExp(`'${action}'`))
  }
  assert.match(journey, /export function recommendJourneyPatterns/)
  assert.doesNotMatch(journey, /financial|developer|3d/i)
  assert.match(agents, /User-journey vocabulary\/patterns\/recommendation logic: `registry\/ui\/product\/journey\.ts`/)
  assert.match(agents, /Raw telemetry remains consumer-owned/)
})

test('canonical showcase consumes the canonical DecisionPanel source before supporting detail', () => {
  assert.match(productUi, /export \{ DecisionPanel \} from '\.\/product\/decision'/)
  assert.match(showcase, /import \{ DecisionPanel \} from '\.\.\/registry\/ui\/product\/decision'/)
  assert.match(showcase, /<DecisionPanel/)
  assert.ok(showcase.indexOf('<DecisionPanel') < showcase.indexOf('One system, reusable layers'))
})
