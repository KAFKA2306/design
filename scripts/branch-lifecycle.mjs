import fs from 'node:fs'

const API = 'https://api.github.com'

export function branchesToDelete({ branches, defaultBranch, openPullRequests }) {
  const protectedHeads = new Set(
    openPullRequests
      .filter((pull) => pull.head?.repo?.full_name && pull.head.repo.full_name === pull.base?.repo?.full_name)
      .map((pull) => pull.head.ref),
  )

  return branches
    .map((branch) => branch.name)
    .filter((name) => name !== defaultBranch && !protectedHeads.has(name))
    .sort()
}

async function request(path, options = {}) {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN is required')

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  })

  if (response.status === 204) return null
  const body = await response.text()
  if (!response.ok) throw new Error(`${options.method ?? 'GET'} ${path} failed: ${response.status} ${body}`)
  return body ? JSON.parse(body) : null
}

async function listAll(path) {
  const items = []
  for (let page = 1; ; page += 1) {
    const separator = path.includes('?') ? '&' : '?'
    const batch = await request(`${path}${separator}per_page=100&page=${page}`)
    if (!Array.isArray(batch)) throw new Error(`Expected array from ${path}`)
    items.push(...batch)
    if (batch.length < 100) return items
  }
}

async function deleteBranch(repository, branch) {
  if (!branch || branch === 'main') throw new Error(`Refusing to delete unsafe branch: ${branch}`)
  const encoded = branch.split('/').map(encodeURIComponent).join('/')
  await request(`/repos/${repository}/git/refs/heads/${encoded}`, { method: 'DELETE' })
  console.log(`deleted ${branch}`)
}

async function run() {
  const repository = process.env.GITHUB_REPOSITORY
  const eventName = process.env.GITHUB_EVENT_NAME
  const eventPath = process.env.GITHUB_EVENT_PATH
  if (!repository || !eventName || !eventPath) throw new Error('GitHub Actions context is required')

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'))
  const defaultBranch = event.repository?.default_branch
  if (!defaultBranch) throw new Error('repository.default_branch is required')

  if (eventName === 'pull_request') {
    const pull = event.pull_request
    if (!pull) throw new Error('pull_request payload is required')
    if (pull.head?.repo?.full_name !== repository) {
      console.log('skip fork branch')
      return
    }
    if (pull.head.ref === defaultBranch) throw new Error('Refusing to delete default branch')
    await deleteBranch(repository, pull.head.ref)
    return
  }

  if (eventName !== 'push' || event.ref !== `refs/heads/${defaultBranch}`) {
    throw new Error(`Unsupported lifecycle event: ${eventName} ${event.ref ?? ''}`)
  }

  const [branches, openPullRequests] = await Promise.all([
    listAll(`/repos/${repository}/branches`),
    listAll(`/repos/${repository}/pulls?state=open`),
  ])

  const stale = branchesToDelete({ branches, defaultBranch, openPullRequests })
  if (stale.length === 0) {
    console.log('no stale branches')
    return
  }

  for (const branch of stale) await deleteBranch(repository, branch)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.stack : error)
    process.exitCode = 1
  })
}
