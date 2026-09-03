import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const registry = JSON.parse(fs.readFileSync('registry.json', 'utf8'))
const expected = ['kafka-button', 'kafka-input', 'kafka-dialog', 'kafka-tabs']
const uiItems = registry.items.filter((item) => expected.includes(item.name))
const read = (name) => fs.readFileSync(`registry/ui/${name}.tsx`, 'utf8')

test('Core UI v0 exposes exactly four canonical Core UI components', () => {
  assert.deepEqual(uiItems.map((item) => item.name), expected)
  for (const item of uiItems) {
    assert.deepEqual(item.dependencies, ['@base-ui/react@1.7.0'])
    assert.equal('registryDependencies' in item, false)
  }
})

test('Dialog ships its shared Button source without creating a second implementation', () => {
  const dialog = uiItems.find((item) => item.name === 'kafka-dialog')
  assert.deepEqual(
    dialog.files.map((file) => file.path),
    ['registry/ui/dialog.tsx', 'registry/ui/button.tsx'],
  )
})

test('Button delegates interaction to Base UI and exposes disabled/loading states', () => {
  const source = read('button')
  assert.match(source, /@base-ui\/react\/button/)
  assert.match(source, /disabled=\{disabled \|\| loading\}/)
  assert.match(source, /aria-busy=\{loading \|\| undefined\}/)
  assert.match(source, /data-loading/)
})

test('Input uses Base UI Field semantics for label and errors', () => {
  const source = read('input')
  assert.match(source, /@base-ui\/react\/field/)
  assert.match(source, /FieldPrimitive\.Label/)
  assert.match(source, /FieldPrimitive\.Error/)
  assert.match(source, /invalid=\{invalid\}/)
  assert.match(source, /aria-invalid=\{invalid \|\| undefined\}/)
})

test('Dialog delegates modal focus and keyboard behavior to Base UI', () => {
  const source = read('dialog')
  assert.match(source, /@base-ui\/react\/dialog/)
  for (const part of ['Root', 'Trigger', 'Portal', 'Backdrop', 'Popup', 'Title', 'Description', 'Close']) {
    assert.match(source, new RegExp(`DialogPrimitive\\.${part}`))
  }
  assert.match(source, /render=\{<Button/)
})

test('Tabs delegates selection and keyboard semantics to Base UI', () => {
  const source = read('tabs')
  assert.match(source, /@base-ui\/react\/tabs/)
  for (const part of ['Root', 'List', 'Tab', 'Panel']) {
    assert.match(source, new RegExp(`TabsPrimitive\\.${part}`))
  }
  assert.match(source, /disabled=\{item\.disabled\}/)
})

test('component CSS uses canonical visual tokens and no separate color authority', () => {
  const css = fs.readFileSync('styles/components.css', 'utf8')
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b|(?:rgb|hsl|oklch)\(/)
  assert.doesNotMatch(css, /box-shadow|text-shadow|gradient\s*\(/i)
  assert.match(css, /var\(--k-color-primary\)/)
  assert.match(css, /var\(--k-dimension-radius\)/)
  assert.match(css, /var\(--k-dimension-space3\)/)
})

test('consumer specimen covers required visible states', () => {
  const specimen = fs.readFileSync('fixtures/registry-consumer/src/main.tsx', 'utf8')
  for (const marker of ['loading', 'disabled', 'error=', '<Dialog', '<Tabs']) {
    assert.match(specimen, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})
