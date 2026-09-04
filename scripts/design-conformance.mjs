import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CONFIG_NAME,
  LOCK_NAME,
  MANAGED_END,
  MANAGED_START,
  assertPinnedToCurrentDesign,
  buildIntegrationBlock,
  buildResolvedManifest,
  expectedLock,
  loadConsumerConfig,
  readJson,
  sha256,
  stableStringify,
  toPosix,
  validateLock,
} from './adoption-contract.mjs'
import { scanConformancePolicy } from './conformance-policy.mjs'
import { structuredViolationBundleFromConformanceErrors } from './violation-contract.mjs'

function push(errors, rule, filePath, message) {
  errors.push({ rule, path: toPosix(filePath), message })
}

export function checkConsumer(consumerPath) {
  const consumerRoot = path.resolve(consumerPath)
  if (!fs.existsSync(consumerRoot) || !fs.statSync(consumerRoot).isDirectory()) throw new Error(`Consumer directory does not exist: ${consumerRoot}`)

  const { config } = loadConsumerConfig(consumerRoot)
  assertPinnedToCurrentDesign(config)
  const resolved = buildResolvedManifest(consumerRoot, config)
  const integration = buildIntegrationBlock(consumerRoot, config, resolved.managedFiles)
  const expected = expectedLock(consumerRoot, config, resolved, integration)
  const errors = []

  const lockPath = path.join(consumerRoot, LOCK_NAME)
  if (!fs.existsSync(lockPath)) {
    push(errors, 'managed-file-drift', LOCK_NAME, `missing ${LOCK_NAME}; run pnpm sync --consumer <path>`)
  } else {
    try {
      const lock = validateLock(readJson(lockPath, LOCK_NAME))
      if (stableStringify(lock) !== stableStringify(expected)) {
        push(errors, 'managed-file-drift', LOCK_NAME, 'lock does not match current config, design SHA, manifest, logo, or integration')
      }
    } catch (error) {
      push(errors, 'managed-file-drift', LOCK_NAME, error.message)
    }
  }

  for (const item of resolved.managedFiles) {
    if (!fs.existsSync(item.targetPath)) {
      push(errors, 'managed-file-drift', item.consumerPath, 'managed file is missing')
      continue
    }
    const actualHash = sha256(fs.readFileSync(item.targetPath))
    if (actualHash !== item.sha256) push(errors, 'managed-file-drift', item.consumerPath, 'managed file was edited or is stale')
  }

  if (!fs.existsSync(integration.cssEntryPath)) {
    push(errors, 'managed-file-drift', config.cssEntry, 'configured CSS entry is missing')
  } else {
    const cssEntry = fs.readFileSync(integration.cssEntryPath, 'utf8')
    const starts = cssEntry.split(MANAGED_START).length - 1
    const ends = cssEntry.split(MANAGED_END).length - 1
    if (starts !== 1 || ends !== 1 || !cssEntry.includes(integration.block)) {
      push(errors, 'managed-file-drift', config.cssEntry, 'canonical managed import block is missing, duplicated, or edited')
    }
  }

  return [...errors, ...scanConformancePolicy(consumerRoot, config)]
}

function parseArgs(argv) {
  const args = [...argv]
  let format = 'text'
  const formatIndex = args.indexOf('--format')
  if (formatIndex !== -1) {
    const value = args[formatIndex + 1]
    if (!['text', 'json'].includes(value)) throw new Error('Usage: pnpm conformance --consumer <path> [--format json]')
    args.splice(formatIndex, 2)
    format = value
  }
  const index = args.indexOf('--consumer')
  if (index === -1 || !args[index + 1] || args[index + 1].startsWith('--')) {
    throw new Error(`Usage: pnpm conformance --consumer <path containing ${CONFIG_NAME}> [--format json]`)
  }
  if (args.length !== index + 2) throw new Error('Unexpected conformance arguments')
  return { consumerPath: args[index + 1], format }
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) {
  try {
    const { consumerPath, format } = parseArgs(process.argv.slice(2))
    const errors = checkConsumer(consumerPath)
    if (format === 'json') {
      const bundle = structuredViolationBundleFromConformanceErrors(errors)
      console.log(JSON.stringify({ status: errors.length === 0 ? 'VERIFIED' : 'INVALID', ...bundle }, null, 2))
    } else if (errors.length === 0) {
      console.log('design conformance: ok')
    } else {
      for (const error of errors) console.error(`[${error.rule}] ${error.path}: ${error.message}`)
    }
    if (errors.length !== 0) process.exitCode = 1
  } catch (error) {
    console.error(`design conformance failed: ${error.message}`)
    process.exitCode = 1
  }
}
