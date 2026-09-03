export const JOURNEY_ACTIONS = ['inspect', 'compare', 'decide', 'act', 'investigate'] as const

export type JourneyAction = (typeof JOURNEY_ACTIONS)[number]
export type JourneyStructuralSource = 'ui' | 'data' | 'action' | 'transition'
export type JourneyUsageSource = 'declared' | 'consumer' | 'observed'

export type JourneyStructuralEvidence = Readonly<{
  action: JourneyAction
  source: JourneyStructuralSource
  strength: number
}>

export type JourneyUsageAggregate = Readonly<{
  action: JourneyAction
  source: JourneyUsageSource
  importance: number
  frequency: number
}>

export type JourneyRecommendationInput = Readonly<{
  evidence: readonly JourneyStructuralEvidence[]
  usage: readonly JourneyUsageAggregate[]
  currentOrder?: readonly JourneyAction[]
}>

export type JourneyPatternId =
  | 'review-and-act'
  | 'compare-and-decide'
  | 'investigate-before-action'
  | 'execute-and-check'

export type JourneyPattern = Readonly<{
  id: JourneyPatternId
  label: string
  actions: readonly JourneyAction[]
}>

export type JourneyRecommendation = Readonly<{
  pattern: JourneyPattern
  score: number
  matchedActions: readonly JourneyAction[]
}>

export const JOURNEY_PATTERNS: readonly JourneyPattern[] = Object.freeze([
  Object.freeze({
    id: 'review-and-act',
    label: 'Review and act',
    actions: Object.freeze(['inspect', 'decide', 'act', 'investigate'] as const),
  }),
  Object.freeze({
    id: 'compare-and-decide',
    label: 'Compare and decide',
    actions: Object.freeze(['inspect', 'compare', 'decide', 'act', 'investigate'] as const),
  }),
  Object.freeze({
    id: 'investigate-before-action',
    label: 'Investigate before action',
    actions: Object.freeze(['inspect', 'investigate', 'compare', 'decide', 'act'] as const),
  }),
  Object.freeze({
    id: 'execute-and-check',
    label: 'Execute and check',
    actions: Object.freeze(['inspect', 'act', 'investigate'] as const),
  }),
])

export const DEFAULT_JOURNEY_RECOMMENDATION_LIMIT = 3

const ACTION_SET = new Set<string>(JOURNEY_ACTIONS)

function assertJourneyAction(value: string, label: string): asserts value is JourneyAction {
  if (!ACTION_SET.has(value)) throw new Error(`${label} has unknown journey action: ${value}`)
}

function assertUnitInterval(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} must be a finite number from 0 to 1`)
  }
}

function mean(values: readonly number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function orderedOverlap(current: readonly JourneyAction[], target: readonly JourneyAction[]) {
  if (current.length === 0 || target.length === 0) return 0
  let targetIndex = 0
  let matched = 0
  for (const action of current) {
    while (targetIndex < target.length && target[targetIndex] !== action) targetIndex += 1
    if (targetIndex >= target.length) break
    matched += 1
    targetIndex += 1
  }
  return matched / Math.max(current.length, target.length)
}

function actionScores(input: JourneyRecommendationInput) {
  if (!Array.isArray(input.evidence) || !Array.isArray(input.usage)) {
    throw new Error('journey recommendation input must provide evidence and usage arrays')
  }

  const structural = new Map<JourneyAction, number[]>()
  const usage = new Map<JourneyAction, number[]>()

  for (const item of input.evidence) {
    assertJourneyAction(item.action, 'journey structural evidence')
    assertUnitInterval(item.strength, 'journey structural evidence strength')
    const values = structural.get(item.action) ?? []
    values.push(item.strength)
    structural.set(item.action, values)
  }

  for (const item of input.usage) {
    assertJourneyAction(item.action, 'journey usage aggregate')
    assertUnitInterval(item.importance, 'journey usage importance')
    assertUnitInterval(item.frequency, 'journey usage frequency')
    const values = usage.get(item.action) ?? []
    values.push(mean([item.importance, item.frequency]))
    usage.set(item.action, values)
  }

  if (input.currentOrder !== undefined) {
    for (const action of input.currentOrder) assertJourneyAction(action, 'journey current order')
  }

  return new Map(
    JOURNEY_ACTIONS.map((action) => {
      const components: number[] = []
      const structuralValues = structural.get(action)
      const usageValues = usage.get(action)
      if (structuralValues?.length) components.push(mean(structuralValues))
      if (usageValues?.length) components.push(mean(usageValues))
      return [action, components.length ? mean(components) : 0] as const
    }),
  )
}

export function getJourneyPattern(id: JourneyPatternId) {
  const pattern = JOURNEY_PATTERNS.find((item) => item.id === id)
  if (!pattern) throw new Error(`Unknown journey pattern: ${id}`)
  return pattern
}

export function recommendJourneyPatterns(
  input: JourneyRecommendationInput,
  limit = DEFAULT_JOURNEY_RECOMMENDATION_LIMIT,
): readonly JourneyRecommendation[] {
  if (!Number.isInteger(limit) || limit < 1) throw new Error('journey recommendation limit must be a positive integer')

  const scores = actionScores(input)
  const total = JOURNEY_ACTIONS.reduce((sum, action) => sum + (scores.get(action) ?? 0), 0)
  if (total <= 0) throw new Error('journey recommendation requires at least one positive evidence or usage signal')

  return JOURNEY_PATTERNS.map((pattern) => {
    const matchedActions = pattern.actions.filter((action) => (scores.get(action) ?? 0) > 0)
    const patternSignal = pattern.actions.reduce((sum, action) => sum + (scores.get(action) ?? 0), 0)
    const precision = patternSignal / pattern.actions.length
    const coverage = patternSignal / total
    const components = [precision, coverage]
    if (input.currentOrder?.length) components.push(orderedOverlap(input.currentOrder, pattern.actions))
    return {
      pattern,
      score: mean(components),
      matchedActions,
    }
  })
    .sort((left, right) => right.score - left.score || left.pattern.id.localeCompare(right.pattern.id))
    .slice(0, Math.min(limit, JOURNEY_PATTERNS.length))
}
