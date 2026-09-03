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
  resolveWithin,
  sha256,
  stableStringify,
  toPosix,
  validateLock,
} from './adoption-contract.mjs'

const SKIP_DIRS = new Set(['.git', '.docusaurus', 'node_modules', 'dist', 'build', 'site', 'coverage'])
const SOURCE_EXTENSIONS = new Set(['.css', '.scss', '.sass', '.less', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.yml', '.yaml'])
const CORE_COMPONENTS = new Set(['button.tsx', 'input.tsx', 'dialog.tsx', 'tabs.tsx', 'product-ui.tsx'])

function walk(root, relativeDir = '') {
  const dir = path.join(root, relativeDir)
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) return []
      return walk(root, relativePath)
    }
    if (!entry.isFile() || !SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) return []
    return [relativePath]
  })
}

function stripCssComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '')
}

function push(errors, rule, filePath, message) {
  errors.push({ rule, path: toPosix(filePath), message })
}

function scanCss(errors, consumerRoot, relativePath) {
  const source = stripCssComments(fs.readFileSync(path.join(consumerRoot, relativePath), 'utf8'))

  const rawColor = /#[0-9a-f]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\(/i
  if (rawColor.test(source)) push(errors, 'duplicate-visual-authority', relativePath, 'raw color literal found; use canonical --k-color-* tokens')

  const visualVariable = /(--[\w-]*(?:color|background|surface|foreground|muted|accent|primary|border|radius|shadow)[\w-]*)\s*:\s*([^;]+);/gi
  for (const match of source.matchAll(visualVariable)) {
    const value = match[2].trim()
    if (/^var\(--k-[\w-]+\)$/.test(value) || /^(?:inherit|initial|unset|none|transparent|currentColor)$/.test(value)) continue
    push(errors, 'duplicate-visual-authority', relativePath, `${match[1]} defines visual authority outside canonical --k-* tokens`)
  }

  const forbidden = [
    ['gradient', /\b(?:linear|radial|conic)-gradient\s*\(/i],
    ['glass', /\bbackdrop-filter\s*:/i],
    ['glow/shadow', /\bbox-shadow\s*:\s*(?!none\b)(?!var\(--k-)/i],
    ['blur', /\bfilter\s*:\s*[^;]*\bblur\s*\(/i],
  ]
  for (const [name, pattern] of forbidden) {
    if (pattern.test(source)) push(errors, 'forbidden-visual-effect', relativePath, `${name} effect is consumer-owned; use canonical design styles instead`)
  }

  const chartOverride = /(?:^|[;{])\s*(?:stroke|fill)\s*:\s*(?!var\(--k-)|none\b|currentColor\b)[^;}]+/gim
  if (chartOverride.test(source)) push(errors, 'chart-override', relativePath, 'chart stroke/fill styling is outside canonical chart grammar')
}

function scanCode(errors, consumerRoot, relativePath) {
  const source = fs.readFileSync(path.join(consumerRoot, relativePath), 'utf8')
  if (/\bfrom\s+['"]recharts['"]|\brequire\(\s*['"]recharts['"]\s*\)/.test(source)) {
    const normalized = toPosix(relativePath)
    if (!normalized.endsWith('/components/ui/product/chart.tsx')) {
      push(errors, 'chart-override', relativePath, 'Recharts may only be used by the canonical Product UI chart adapter')
    }
  }
}

function scanWorkflow(errors, consumerRoot, relativePath) {
  const source = fs.readFileSync(path.join(consumerRoot, relativePath), 'utf8')
  if (/KAFKA2306\/design\/.+@(main|master|beta|develop|dev|latest)\b/i.test(source)) {
    push(errors, 'mutable-design-ref', relativePath, 'design workflow/action reference must use a full immutable SHA')
  }
}

function scanComponentDuplicates(errors, files) {
  const byName = new Map()
  for (const relativePath of files) {
    const base = path.basename(relativePath).toLowerCase()
    if (!CORE_COMPONENTS.has(base)) continue
    if (!byName.has(base)) byName.set(base, [])
    byName.get(base).push(relativePath)
  }
  for (const [name, matches] of byName) {
    if (matches.length <= 1) continue
    for (const relativePath of matches) push(errors, 'design-owned-component-duplication', relativePath, `${name} exists in multiple source locations: ${matches.map(toPosix).join(', ')}`)
  }
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

  const managedPrefix = `${toPosix(config.managedDir).replace(/\/$/, '')}/`
  const files = walk(consumerRoot).filter((relativePath) => {
    const normalized = toPosix(relativePath)
    return normalized !== CONFIG_NAME && normalized !== LOCK_NAME && !normalized.startsWith(managedPrefix)
  })

  scanComponentDuplicates(errors, files)

  for (const relativePath of files) {
    const extension = path.extname(relativePath).toLowerCase()
    if (['.css', '.scss', '.sass', '.less'].includes(extension)) scanCss(errors, consumerRoot, relativePath)
    if (['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'].includes(extension)) scanCode(errors, consumerRoot, relativePath)
    if (['.yml', '.yaml'].includes(extension)) scanWorkflow(errors, consumerRoot, relativePath)
  }

  return errors
}

function parseConsumerArg(argv) {
  const index = argv.indexOf('--consumer')
  if (index === -1 || !argv[index + 1] || argv[index + 1].startsWith('--')) {
    throw new Error(`Usage: pnpm conformance --consumer <path containing ${CONFIG_NAME}>`)
  }
  if (argv.length !== index + 2) throw new Error('Unexpected conformance arguments')
  return argv[index + 1]
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) {
  try {
    const errors = checkConsumer(parseConsumerArg(process.argv.slice(2)))
    if (errors.length === 0) {
      console.log('design conformance: ok')
    } else {
      for (const error of errors) console.error(`[${error.rule}] ${error.path}: ${error.message}`)
      process.exitCode = 1
    }
  } catch (error) {
    console.error(`design conformance failed: ${error.message}`)
    process.exitCode = 1
  }
}
