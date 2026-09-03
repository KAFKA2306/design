# Repository operating rules

`README.md` explains the repository. This file contains only durable change-time invariants.

## Authority

- `main` is the only long-lived authority.
- Current explicit user direction overrides stale issue prose or old branches.
- `tokens/foundation.tokens.json` is the only hand-edited visual-token authority. Regenerate derived styles; never hand-edit generated token output.
- `artifacts/content.schema.json` is the only cross-format semantic/content authority. UI may render its fields but must not create a competing verification or provenance model.
- Registry component source lives once under `registry/ui/`; consumer copies are generated or installed artifacts.
- `registry/ui/product-ui.tsx` is the stable Product UI public entrypoint. Keep implementation responsibility-split under `registry/ui/product/`.
- Product charts are centrally configured in `registry/ui/product/chart.tsx`. Consumers must not redefine palette, grid, geometry, actual/forecast styling, tooltip, or chart spacing.
- User-journey action vocabulary, candidate patterns, and recommendation logic live in `registry/ui/product/journey.ts`. Do not create domain-specific competing journey authorities.

## User journey

- Compose primary product surfaces from canonical user actions: inspect, compare, decide, act, and investigate.
- Do not force one global reading order across every product. Use the canonical journey patterns as candidates and choose the pattern that fits the page purpose.
- Recommend candidates from explicit structural evidence and aggregate usage signals. Existing UI structure, data, available actions, transitions, declared priorities, consumer-provided priorities, and observed aggregate usage may contribute.
- Raw usage events remain consumer-owned. This repository defines the aggregate input semantics but does not collect or store consumer telemetry.
- Prefer meaningful completed components whose visual hierarchy, information order, interaction, responsive behavior, accessibility, and state representation are owned here. Consumers should provide data and business actions rather than reconstruct the same purpose component.
- Changelog, Recent Updates, implementation notes, debug information, roadmap, and long explanatory text do not belong in the primary task path. Move them below the primary task or into explicit disclosure when they remain useful.
- PLANNED or unavailable features must not visually compete with usable actions. Do not fill the first screen with unavailable navigation or specimen content.
- Apply the same brand grammar and interaction quality across products without forcing the same dashboard shape.
- Prefer changing order, visual hierarchy, and interaction over adding prose that explains a confusing interface.

## Evaluation loop

- Generation is replaceable; evaluation is durable. Repository value must accumulate in constraints, contracts, tests, reference data, and feedback loops rather than one-off generated screens.
- Every reusable product surface must make its important states testable: usable, loading, empty, error, unavailable, and unverified where applicable.
- Prefer machine-checkable acceptance criteria over prose. If a rule can be expressed as a schema, type, test, conformance check, or generated artifact check, encode it there instead of creating another document.
- A successful build is not evidence of a successful user journey. Evaluate whether the user can inspect, compare, decide, act, and investigate without relying on explanatory prose.
- Consumer adoption is part of validation. A design change is not complete merely because the specimen looks correct; downstream integration must preserve the canonical contract and journey semantics.
- Synthetic fixtures are test-only evidence. They must never be presented as production truth or used to conceal missing consumer data.
- Missing canonical input, provenance, or required state must fail visibly. Do not convert unknown or unverified data into plausible-looking values.

## Change discipline

- Prefer DELETE > MERGE > REPLACE > ADD. Remove or consolidate stale authority before adding a new layer.
- Do not create a second documentation authority. Use `README.md` for durable repository orientation, this file for invariants, and GitHub Issues/PRs for current status and acceptance criteria.
- Do not duplicate dependency versions, registry inventories, generated values, or issue progress in prose documentation when a structured or executable source already exists.
- When architecture changes, update the existing canonical document instead of adding another Markdown file unless it serves a distinct durable contract or audience.
- Fail loudly rather than silently falling back when canonical input is missing or malformed.
- Do not commit employer, customer, internal-project, or other confidential names, values, sources, masters, images, screenshots, summaries, or derived information. Repository fixtures must be synthetic/test-only.

## Branch lifecycle

- One active work item uses at most one branch.
- Start from the latest `main`; do not use stale branches as authority.
- Merge/closed PR branches are disposable and must not become long-lived documentation or implementation references.
