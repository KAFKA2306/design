import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { currentDesignSha } from '../scripts/adoption-contract.mjs'
import { checkConsumer } from '../scripts/design-conformance.mjs'
import { syncConsumer } from '../scripts/design-sync.mjs'

function makeConsumer(overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kafka-design-consumer-'))
  fs.writeFileSync(path.join(root, 'styles.css'), 'body { color: var(--k-color-foreground); }\n')
  fs.writeFileSync(path.join(root, 'design.config.json'), `${JSON.stringify({
    schemaVersion: 1,
    designSha: currentDesignSha(),
    preset: 'base',
    cssEntry: 'styles.css',
    managedDir: '.kafka-design',
    ...overrides,
  }, null, 2)}\n`)
  return root
}

function cleanup(root) {
  fs.rmSync(root, { recursive: true, force: true })
}

function runPortable(root) {
  return spawnSync(process.execPath, [path.join(root, '.kafka-design', 'portable-conformance.mjs'), '--consumer', root], {
    cwd: root,
    encoding: 'utf8',
  })
}

test('sync is deterministic and the second run is a zero diff', () => {
  const root = makeConsumer()
  try {
    const first = syncConsumer(root)
    assert.deepEqual(first.deleted, [])
    for (const expected of [
      '.kafka-design/kafka-tokens.css',
      '.kafka-design/kafka-globals.css',
      '.kafka-design/kafka-components.css',
      '.kafka-design/portable-conformance.mjs',
      '.kafka-design/conformance-policy.mjs',
      'styles.css',
      'design.lock.json',
    ]) assert.ok(first.changed.includes(expected), `${expected} must be managed on first sync`)

    const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8')
    assert.doesNotMatch(styles, /\.mjs/)

    const before = new Map(first.changed.map((relativePath) => [relativePath, fs.readFileSync(path.join(root, relativePath), 'utf8')]))
    const second = syncConsumer(root)
    assert.deepEqual(second.changed, [])
    assert.deepEqual(second.deleted, [])
    for (const [relativePath, content] of before) assert.equal(fs.readFileSync(path.join(root, relativePath), 'utf8'), content)
    assert.deepEqual(checkConsumer(root), [])
  } finally {
    cleanup(root)
  }
})

test('portable conformance runs entirely from the synced managed bundle', () => {
  const root = makeConsumer()
  try {
    syncConsumer(root)
    const clean = runPortable(root)
    assert.equal(clean.status, 0, clean.stderr)
    assert.match(clean.stdout, /design conformance: ok/)

    fs.appendFileSync(path.join(root, 'styles.css'), '\n.bad { background: #123456; box-shadow: 0 1px 3px #000; }\n')
    const drift = runPortable(root)
    assert.equal(drift.status, 1)
    assert.match(drift.stderr, /\[duplicate-visual-authority\] styles\.css/)
    assert.match(drift.stderr, /\[forbidden-visual-effect\] styles\.css/)
  } finally {
    cleanup(root)
  }
})

test('sync removes obsolete files recorded by the prior lock', () => {
  const root = makeConsumer()
  try {
    syncConsumer(root)
    const obsoletePath = path.join(root, 'old-design', 'kafka-tokens.css')
    fs.mkdirSync(path.dirname(obsoletePath), { recursive: true })
    fs.writeFileSync(obsoletePath, 'obsolete')

    const lockPath = path.join(root, 'design.lock.json')
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'))
    lock.managedFiles.push({ path: 'old-design/kafka-tokens.css', sha256: '0'.repeat(64) })
    fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`)

    const result = syncConsumer(root)
    assert.deepEqual(result.deleted, ['old-design/kafka-tokens.css'])
    assert.equal(fs.existsSync(obsoletePath), false)
    assert.deepEqual(checkConsumer(root), [])
  } finally {
    cleanup(root)
  }
})

test('conformance fails managed-file drift', () => {
  const root = makeConsumer()
  try {
    syncConsumer(root)
    fs.appendFileSync(path.join(root, '.kafka-design', 'kafka-tokens.css'), '\n/* consumer edit */\n')
    const errors = checkConsumer(root)
    assert.ok(errors.some((error) => error.rule === 'managed-file-drift' && error.path.endsWith('kafka-tokens.css')))
  } finally {
    cleanup(root)
  }
})

test('conformance rejects consumer visual authority and forbidden effects', () => {
  const root = makeConsumer()
  try {
    syncConsumer(root)
    fs.appendFileSync(path.join(root, 'styles.css'), '\n.bad { --surface-color: #fff; background: #fff; box-shadow: 0 1px 3px #000; }\n')
    const errors = checkConsumer(root)
    assert.ok(errors.some((error) => error.rule === 'duplicate-visual-authority'))
    assert.ok(errors.some((error) => error.rule === 'forbidden-visual-effect'))
  } finally {
    cleanup(root)
  }
})

test('conformance rejects mutable design workflow references', () => {
  const root = makeConsumer()
  try {
    syncConsumer(root)
    const workflow = path.join(root, '.github', 'workflows', 'design.yml')
    fs.mkdirSync(path.dirname(workflow), { recursive: true })
    fs.writeFileSync(workflow, 'jobs:\n  design:\n    uses: KAFKA2306/design/.github/workflows/conformance.yml@main\n')
    const errors = checkConsumer(root)
    assert.ok(errors.some((error) => error.rule === 'mutable-design-ref' && error.path === '.github/workflows/design.yml'))
  } finally {
    cleanup(root)
  }
})

test('conformance rejects duplicate design-owned core components and direct chart engines', () => {
  const root = makeConsumer()
  try {
    syncConsumer(root)
    for (const relativePath of ['src/one/button.tsx', 'src/two/button.tsx']) {
      const filePath = path.join(root, relativePath)
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, 'export const Button = () => null\n')
    }
    fs.writeFileSync(path.join(root, 'src', 'chart.tsx'), "import { LineChart } from 'recharts'\nexport { LineChart }\n")
    const errors = checkConsumer(root)
    assert.ok(errors.some((error) => error.rule === 'design-owned-component-duplication'))
    assert.ok(errors.some((error) => error.rule === 'chart-override'))
  } finally {
    cleanup(root)
  }
})

test('sync fails loudly when consumer is not pinned to the checked-out full design SHA', () => {
  const root = makeConsumer({ designSha: '0'.repeat(40) })
  try {
    assert.throws(() => syncConsumer(root), /does not match checked-out design HEAD/)
  } finally {
    cleanup(root)
  }
})

test('config rejects unknown fields instead of silently ignoring them', () => {
  const root = makeConsumer({ surpriseFallback: true })
  try {
    assert.throws(() => syncConsumer(root), /unknown field: surpriseFallback/)
  } finally {
    cleanup(root)
  }
})
