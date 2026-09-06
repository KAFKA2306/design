import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const skillPath = 'skills/frontend-design/SKILL.md'
const skill = fs.readFileSync(skillPath, 'utf8')
const readme = fs.readFileSync('README.md', 'utf8')

test('frontend design skill is discoverable', () => {
  assert.ok(fs.existsSync(skillPath))
  assert.match(readme, /skills\/frontend-design\/SKILL\.md/)
})

test('skill points to live canonical sources', () => {
  const requiredPaths = [
    'registry.json',
    'registry/ui/product-ui.tsx',
    'registry/ui/product/journey.ts',
    'schemas/design.config.schema.json',
    'schemas/design.lock.schema.json',
    'package.json',
  ]

  for (const path of requiredPaths) {
    assert.ok(fs.existsSync(path), `canonical source is missing: ${path}`)
    assert.ok(skill.includes(`\`${path}\``), `skill does not route to canonical source: ${path}`)
  }
})

test('skill does not become a second implementation authority', () => {
  assert.doesNotMatch(skill, /#[0-9a-fA-F]{3,8}\b/)
  assert.doesNotMatch(skill, /--k-[a-z0-9-]+/i)
  assert.doesNotMatch(skill, /\b\d+\.\d+\.\d+\b/)
  assert.doesNotMatch(skill, /```/)
  assert.doesNotMatch(skill, /DecisionPanel\s*\(/)
})
