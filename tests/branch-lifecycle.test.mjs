import assert from 'node:assert/strict'
import test from 'node:test'
import { branchesToDelete, isMissingReferenceResponse } from '../scripts/branch-lifecycle.mjs'

test('branch cleanup keeps only default branch and same-repo open PR heads', () => {
  const deleted = branchesToDelete({
    defaultBranch: 'main',
    branches: [
      { name: 'main' },
      { name: 'feat/12-cross-format' },
      { name: 'fix/old' },
      { name: 'feat/merged' },
    ],
    openPullRequests: [
      {
        head: { ref: 'feat/12-cross-format', repo: { full_name: 'KAFKA2306/design' } },
        base: { repo: { full_name: 'KAFKA2306/design' } },
      },
    ],
  })

  assert.deepEqual(deleted, ['feat/merged', 'fix/old'])
})

test('branch cleanup is deterministic regardless of API ordering', () => {
  const input = {
    defaultBranch: 'main',
    openPullRequests: [],
  }
  const first = branchesToDelete({ ...input, branches: [{ name: 'z' }, { name: 'main' }, { name: 'a' }] })
  const second = branchesToDelete({ ...input, branches: [{ name: 'a' }, { name: 'z' }, { name: 'main' }] })
  assert.deepEqual(first, ['a', 'z'])
  assert.deepEqual(second, first)
})

test('missing branch reference is the only idempotent delete race', () => {
  assert.equal(isMissingReferenceResponse(422, '{"message":"Reference does not exist"}'), true)
  assert.equal(isMissingReferenceResponse(422, '{"message":"Validation Failed"}'), false)
  assert.equal(isMissingReferenceResponse(404, '{"message":"Reference does not exist"}'), false)
  assert.equal(isMissingReferenceResponse(422, 'not json'), false)
})
