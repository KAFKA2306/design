import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const readme = fs.readFileSync('README.md', 'utf8')
const agents = fs.readFileSync('AGENTS.md', 'utf8')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

const canonicalPaths = [
  'tokens/foundation.tokens.json',
  'styles/tokens.css',
  'styles/components.css',
  'registry.json',
  'registry/ui',
  'registry/ui/product-ui.tsx',
  'registry/ui/product',
  'registry/ui/product/chart.tsx',
  'artifacts/content.schema.json',
  'scripts/content-contract.mjs',
  'fixtures/registry-consumer',
  '.github/workflows',
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

test('README canonical paths resolve in the repository', () => {
  for (const path of canonicalPaths) {
    assert.ok(readme.includes(`\`${path}\``), `${path} must remain documented`)
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
