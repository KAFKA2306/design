import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const semantic = fs.readFileSync('registry/ui/product/semantic.ts', 'utf8')
const status = fs.readFileSync('registry/ui/product/status.tsx', 'utf8')
const entry = fs.readFileSync('registry/ui/product-ui.tsx', 'utf8')
const fixture = fs.readFileSync('fixtures/registry-consumer/src/main.tsx', 'utf8')

test('reusable surfaces expose one canonical six-state vocabulary', () => {
  assert.match(semantic, /SURFACE_STATES = \['usable', 'loading', 'empty', 'error', 'unavailable', 'unverified'\] as const/)
  assert.match(semantic, /export type SurfaceState = \(typeof SURFACE_STATES\)\[number\]/)
  assert.match(entry, /export \{ SURFACE_STATES \} from '\.\/product\/semantic'/)
  assert.match(entry, /export type \{ SurfaceState \} from '\.\/product\/semantic'/)
})

test('StatusSurface requires explicit state and rejects contradictory data', () => {
  assert.match(status, /state: 'usable'/)
  assert.match(status, /state: Exclude<SurfaceState, 'usable'>/)
  assert.match(status, /stateMessage: string/)
  assert.match(status, /state === 'usable' && items\.length === 0/)
  assert.match(status, /state !== 'usable' && items\.length > 0/)
  assert.match(status, /requires at least one item; use state="empty"/)
  assert.match(status, /cannot render status items; use state="usable"/)
  assert.doesNotMatch(status, /emptyMessage\s*=/)
})

test('non-usable states are machine-visible and accessibility-visible', () => {
  assert.match(status, /data-surface-state=\{state\}/)
  assert.match(status, /aria-busy=\{state === 'loading' \|\| undefined\}/)
  assert.match(status, /state === 'error' \? 'alert' : 'status'/)
  assert.match(status, /state === 'error' \? 'assertive' : 'polite'/)
  assert.match(status, /data-state-message=\{state\}/)
})

test('reference consumer declares usable state instead of relying on an implicit default', () => {
  assert.match(fixture, /<StatusSurface[\s\S]*state="usable"[\s\S]*items=\{/)
})
