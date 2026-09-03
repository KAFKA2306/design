import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const path = 'skills/frontend-design/SKILL.md'
const skill = fs.readFileSync(path, 'utf8')
const readme = fs.readFileSync('README.md', 'utf8')

test('frontend design skill is one documented procedural authority', () => {
  assert.ok(fs.existsSync(path))
  assert.match(readme, /`skills\/frontend-design\/SKILL\.md`/)
  assert.match(skill, /^# Frontend design/m)
  assert.match(skill, /Use this skill when a KAFKA2306 consumer repository needs a Web UI review, adoption, or structural improvement\./)
})

test('skill routes agents through canonical repository authorities', () => {
  for (const authority of [
    'README.md',
    'AGENTS.md',
    'registry.json',
    'registry/ui/product-ui.tsx',
    'registry/ui/product/journey.ts',
    'schemas/design.config.schema.json',
    'schemas/design.lock.schema.json',
    'package.json',
    '.github/workflows/',
  ]) {
    assert.match(skill, new RegExp(authority.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})

test('skill stays thin instead of copying design values, versions or component APIs', () => {
  assert.doesNotMatch(skill, /#[0-9a-fA-F]{3,8}\b/)
  assert.doesNotMatch(skill, /--k-[a-z0-9-]+/i)
  assert.doesNotMatch(skill, /\b\d+\.\d+\.\d+\b/)
  assert.doesNotMatch(skill, /```/)
  assert.doesNotMatch(skill, /DecisionPanel\s*\(/)
  assert.match(skill, /do not duplicate them here/i)
  assert.match(skill, /Do not copy token values, dependency versions, component signatures, registry inventories, or current issue status/)
})

test('skill preserves ownership and fail-loud boundaries', () => {
  assert.match(skill, /Keep raw telemetry in the consumer/)
  assert.match(skill, /Web UI only/)
  assert.match(skill, /Non-Web presentation authoring is outside this repository/)
  assert.match(skill, /failure in canonical input or managed state is an error, not a reason to silently fall back/i)
  assert.match(skill, /Do not add a domain taxonomy as a second journey authority/)
})
