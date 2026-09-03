import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
export const DESIGN_ROOT = path.resolve(scriptDir, '..')
export const CONFIG_NAME = 'design.config.json'
export const LOCK_NAME = 'design.lock.json'
export const MANAGED_START = '/* kafka-design:managed-start */'
export const MANAGED_END = '/* kafka-design:managed-end */'

export const MANAGED_SOURCES = Object.freeze([
  { source: 'styles/tokens.css', target: 'kafka-tokens.css' },
  { source: 'styles/globals.css', target: 'kafka-globals.css' },
  { source: 'styles/components.css', target: 'kafka-components.css' },
])

const CONFIG_KEYS = new Set(['$schema', 'schemaVersion', 'designSha', 'preset', 'cssEntry', 'managedDir', 'logo'])
const LOCK_KEYS = new Set(['schemaVersion', 'designSha', 'preset', 'configHash', 'manifestHash', 'logoHash', 'installedRegistryItems', 'managedFiles', 'integration'])
const SHA40 = /^[0-9a-f]{40}$/
const SHA64 = /^[0-9a-f]{64}$/

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function assertPlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object`)
  }
}

function assertExactKeys(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`${label} has unknown field: ${key}`)
  }
}

export function resolveWithin(root, relativePath, label) {
  if (typeof relativePath !== 'string' || relativePath.length === 0) throw new Error(`${label} must be a non-empty relative path`)
  if (path.isAbsolute(relativePath)) throw new Error(`${label} must be relative: ${relativePath}`)
  const resolvedRoot = path.resolve(root)
  const resolved = path.resolve(resolvedRoot, relativePath)
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`${label} escapes consumer root: ${relativePath}`)
  }
  return resolved
}

export function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/')
}

export function currentDesignSha() {
  const value = execFileSync('git', ['-C', DESIGN_ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  if (!SHA40.test(value)) throw new Error(`Unable to resolve full design SHA: ${value}`)
  return value
}

export function readJson(filePath, label) {
  let value
  try {
    value = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    throw new Error(`${label} is missing or invalid JSON: ${filePath}\n${error.message}`)
  }
  return value
}

export function validateConfig(config) {
  assertPlainObject(config, CONFIG_NAME)
  assertExactKeys(config, CONFIG_KEYS, CONFIG_NAME)
  if (config.schemaVersion !== 1) throw new Error(`${CONFIG_NAME}.schemaVersion must be 1`)
  if (!SHA40.test(config.designSha ?? '')) throw new Error(`${CONFIG_NAME}.designSha must be a full 40-character lowercase Git SHA`)
  if (!['base', 'financial-dashboard'].includes(config.preset)) throw new Error(`${CONFIG_NAME}.preset must be base or financial-dashboard`)
  for (const key of ['cssEntry', 'managedDir']) {
    if (typeof config[key] !== 'string' || config[key].length === 0) throw new Error(`${CONFIG_NAME}.${key} must be a non-empty string`)
  }
  if (config.logo !== undefined && (typeof config.logo !== 'string' || config.logo.length === 0)) {
    throw new Error(`${CONFIG_NAME}.logo must be a non-empty string when present`)
  }
  return config
}

export function validateLock(lock) {
  assertPlainObject(lock, LOCK_NAME)
  assertExactKeys(lock, LOCK_KEYS, LOCK_NAME)
  if (lock.schemaVersion !== 1) throw new Error(`${LOCK_NAME}.schemaVersion must be 1`)
  if (!SHA40.test(lock.designSha ?? '')) throw new Error(`${LOCK_NAME}.designSha must be a full Git SHA`)
  if (!['base', 'financial-dashboard'].includes(lock.preset)) throw new Error(`${LOCK_NAME}.preset is invalid`)
  for (const key of ['configHash', 'manifestHash']) {
    if (!SHA64.test(lock[key] ?? '')) throw new Error(`${LOCK_NAME}.${key} must be sha256`)
  }
  if (lock.logoHash !== null && !SHA64.test(lock.logoHash ?? '')) throw new Error(`${LOCK_NAME}.logoHash must be sha256 or null`)
  if (!Array.isArray(lock.installedRegistryItems) || lock.installedRegistryItems.some((item) => typeof item !== 'string')) {
    throw new Error(`${LOCK_NAME}.installedRegistryItems must be a string array`)
  }
  if (!Array.isArray(lock.managedFiles)) throw new Error(`${LOCK_NAME}.managedFiles must be an array`)
  for (const item of lock.managedFiles) {
    assertPlainObject(item, `${LOCK_NAME}.managedFiles[]`)
    assertExactKeys(item, new Set(['path', 'sha256']), `${LOCK_NAME}.managedFiles[]`)
    if (typeof item.path !== 'string' || item.path.length === 0 || !SHA64.test(item.sha256 ?? '')) {
      throw new Error(`${LOCK_NAME}.managedFiles[] has invalid path or sha256`)
    }
  }
  assertPlainObject(lock.integration, `${LOCK_NAME}.integration`)
  assertExactKeys(lock.integration, new Set(['cssEntry', 'blockHash']), `${LOCK_NAME}.integration`)
  if (typeof lock.integration.cssEntry !== 'string' || lock.integration.cssEntry.length === 0 || !SHA64.test(lock.integration.blockHash ?? '')) {
    throw new Error(`${LOCK_NAME}.integration is invalid`)
  }
  return lock
}

export function loadConsumerConfig(consumerRoot) {
  const configPath = path.join(consumerRoot, CONFIG_NAME)
  const config = validateConfig(readJson(configPath, CONFIG_NAME))
  resolveWithin(consumerRoot, config.cssEntry, `${CONFIG_NAME}.cssEntry`)
  resolveWithin(consumerRoot, config.managedDir, `${CONFIG_NAME}.managedDir`)
  if (config.logo !== undefined) resolveWithin(consumerRoot, config.logo, `${CONFIG_NAME}.logo`)
  return { config, configPath }
}

export function buildResolvedManifest(consumerRoot, config) {
  const managedFiles = MANAGED_SOURCES.map(({ source, target }) => {
    const sourcePath = path.join(DESIGN_ROOT, source)
    if (!fs.existsSync(sourcePath)) throw new Error(`Canonical managed source is missing: ${source}`)
    const targetPath = resolveWithin(consumerRoot, path.join(config.managedDir, target), `managed target ${target}`)
    return {
      source,
      sourcePath,
      target,
      targetPath,
      consumerPath: toPosix(path.relative(consumerRoot, targetPath)),
      content: fs.readFileSync(sourcePath, 'utf8'),
      sha256: sha256(fs.readFileSync(sourcePath)),
    }
  })

  const manifest = {
    schemaVersion: 1,
    preset: config.preset,
    assets: managedFiles.map(({ source, consumerPath, sha256: hash }) => ({ source, target: consumerPath, sha256: hash })),
  }

  return { managedFiles, manifest, manifestHash: sha256(stableStringify(manifest)) }
}

export function buildIntegrationBlock(consumerRoot, config, managedFiles) {
  const cssEntryPath = resolveWithin(consumerRoot, config.cssEntry, `${CONFIG_NAME}.cssEntry`)
  const cssDir = path.dirname(cssEntryPath)
  const imports = managedFiles.map(({ targetPath }) => {
    let relative = toPosix(path.relative(cssDir, targetPath))
    if (!relative.startsWith('.')) relative = `./${relative}`
    return `@import "${relative}";`
  })
  const block = `${MANAGED_START}\n${imports.join('\n')}\n${MANAGED_END}`
  return { cssEntryPath, block, blockHash: sha256(block) }
}

export function configHash(config) {
  return sha256(stableStringify(config))
}

export function logoHash(consumerRoot, config) {
  if (config.logo === undefined) return null
  const logoPath = resolveWithin(consumerRoot, config.logo, `${CONFIG_NAME}.logo`)
  if (!fs.existsSync(logoPath) || !fs.statSync(logoPath).isFile()) throw new Error(`Configured logo is missing: ${config.logo}`)
  return sha256(fs.readFileSync(logoPath))
}

export function expectedLock(consumerRoot, config, resolved, integration) {
  return {
    schemaVersion: 1,
    designSha: config.designSha,
    preset: config.preset,
    configHash: configHash(config),
    manifestHash: resolved.manifestHash,
    logoHash: logoHash(consumerRoot, config),
    installedRegistryItems: [],
    managedFiles: resolved.managedFiles.map((item) => ({ path: item.consumerPath, sha256: item.sha256 })),
    integration: {
      cssEntry: toPosix(config.cssEntry),
      blockHash: integration.blockHash,
    },
  }
}

export function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

export function assertPinnedToCurrentDesign(config) {
  const head = currentDesignSha()
  if (config.designSha !== head) {
    throw new Error(`${CONFIG_NAME}.designSha=${config.designSha} does not match checked-out design HEAD=${head}`)
  }
  return head
}
