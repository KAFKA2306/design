import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CONFIG_NAME,
  LOCK_NAME,
  MANAGED_END,
  MANAGED_SOURCES,
  MANAGED_START,
  assertPinnedToCurrentDesign,
  buildIntegrationBlock,
  buildResolvedManifest,
  expectedLock,
  formatJson,
  loadConsumerConfig,
  readJson,
  resolveWithin,
  validateLock,
} from './adoption-contract.mjs'

function writeIfChanged(filePath, content, changed) {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') === content) return
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
  changed.push(filePath)
}

function count(source, value) {
  return source.split(value).length - 1
}

function integrateCss(source, block) {
  const starts = count(source, MANAGED_START)
  const ends = count(source, MANAGED_END)
  if (starts !== ends || starts > 1) {
    throw new Error(`Managed CSS markers are malformed: expected zero or one ${MANAGED_START}/${MANAGED_END} pair`)
  }

  if (starts === 1) {
    const start = source.indexOf(MANAGED_START)
    const end = source.indexOf(MANAGED_END, start) + MANAGED_END.length
    return `${source.slice(0, start)}${block}${source.slice(end)}`
  }

  const charset = source.match(/^@charset\s+[^;]+;\s*/)
  if (charset) return `${charset[0]}${block}\n${source.slice(charset[0].length)}`
  return `${block}\n${source}`
}

function removeObsoleteManagedFiles(consumerRoot, oldLock, currentPaths, deleted) {
  if (!oldLock) return
  const allowedBasenames = new Set(MANAGED_SOURCES.map((item) => item.target))
  for (const item of oldLock.managedFiles) {
    if (currentPaths.has(item.path)) continue
    if (!allowedBasenames.has(path.basename(item.path))) {
      throw new Error(`Refusing to delete unexpected former managed file: ${item.path}`)
    }
    const filePath = resolveWithin(consumerRoot, item.path, `former managed file ${item.path}`)
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath)
      deleted.push(filePath)
    }
  }
}

export function syncConsumer(consumerPath) {
  const consumerRoot = path.resolve(consumerPath)
  if (!fs.existsSync(consumerRoot) || !fs.statSync(consumerRoot).isDirectory()) {
    throw new Error(`Consumer directory does not exist: ${consumerRoot}`)
  }

  const { config } = loadConsumerConfig(consumerRoot)
  assertPinnedToCurrentDesign(config)
  const resolved = buildResolvedManifest(consumerRoot, config)
  const integration = buildIntegrationBlock(consumerRoot, config, resolved.managedFiles)
  if (!fs.existsSync(integration.cssEntryPath)) throw new Error(`Configured CSS entry is missing: ${config.cssEntry}`)

  const lockPath = path.join(consumerRoot, LOCK_NAME)
  const oldLock = fs.existsSync(lockPath) ? validateLock(readJson(lockPath, LOCK_NAME)) : null
  const changed = []
  const deleted = []

  const currentPaths = new Set(resolved.managedFiles.map((item) => item.consumerPath))
  removeObsoleteManagedFiles(consumerRoot, oldLock, currentPaths, deleted)

  for (const item of resolved.managedFiles) writeIfChanged(item.targetPath, item.content, changed)

  const cssSource = fs.readFileSync(integration.cssEntryPath, 'utf8')
  const integrated = integrateCss(cssSource, integration.block)
  writeIfChanged(integration.cssEntryPath, integrated, changed)

  const lock = expectedLock(consumerRoot, config, resolved, integration)
  writeIfChanged(lockPath, formatJson(lock), changed)

  return {
    consumerRoot,
    changed: changed.map((filePath) => path.relative(consumerRoot, filePath).split(path.sep).join('/')),
    deleted: deleted.map((filePath) => path.relative(consumerRoot, filePath).split(path.sep).join('/')),
    lock,
  }
}

function parseConsumerArg(argv) {
  const index = argv.indexOf('--consumer')
  if (index === -1 || !argv[index + 1] || argv[index + 1].startsWith('--')) {
    throw new Error(`Usage: pnpm sync --consumer <path containing ${CONFIG_NAME}>`)
  }
  if (argv.length !== index + 2) throw new Error('Unexpected sync arguments')
  return argv[index + 1]
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) {
  try {
    const result = syncConsumer(parseConsumerArg(process.argv.slice(2)))
    const operations = [...result.deleted.map((file) => `deleted ${file}`), ...result.changed.map((file) => `updated ${file}`)]
    console.log(operations.length === 0 ? 'design sync: no changes' : `design sync:\n${operations.join('\n')}`)
  } catch (error) {
    console.error(`design sync failed: ${error.message}`)
    process.exitCode = 1
  }
}
