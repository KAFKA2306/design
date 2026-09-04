export { DataTable, FilterToolbar, Metric, SourceLine } from './product/information'
export type { DataTableColumn } from './product/information'

export { ChartFrame, ChartGrid } from './product/chart'
export type { BarPoint, ChartFrameProps, ScatterPoint, TimeSeriesPoint } from './product/chart'

export { ArtifactGallery, ArtifactMetadata, ArtifactViewer } from './product/artifact'
export type { ArtifactItem, ArtifactStatus } from './product/artifact'

export { DecisionPanel } from './product/decision'
export type {
  DecisionPanelAction,
  DecisionPanelEvidence,
  DecisionPanelProps,
  DecisionPanelState,
} from './product/decision'

export { ComparisonSurface } from './product/comparison'
export type {
  ComparisonSurfaceEvidence,
  ComparisonSurfaceMetric,
  ComparisonSurfaceOption,
  ComparisonSurfaceProps,
  ComparisonSurfaceRole,
} from './product/comparison'

export { EvidenceSurface } from './product/evidence'
export type {
  EvidenceSurfaceProps,
  EvidenceSurfaceRecord,
} from './product/evidence'

export { StatusSurface } from './product/status'
export type {
  StatusSurfaceItem,
  StatusSurfaceProps,
  StatusSurfaceTone,
} from './product/status'

export { SURFACE_STATES } from './product/semantic'
export type { SurfaceState } from './product/semantic'

export {
  DEFAULT_JOURNEY_RECOMMENDATION_LIMIT,
  JOURNEY_ACTIONS,
  JOURNEY_PATTERNS,
  getJourneyPattern,
  recommendJourneyPatterns,
} from './product/journey'
export type {
  JourneyAction,
  JourneyPattern,
  JourneyPatternId,
  JourneyRecommendation,
  JourneyRecommendationInput,
  JourneyStructuralEvidence,
  JourneyStructuralSource,
  JourneyUsageAggregate,
  JourneyUsageSource,
} from './product/journey'
