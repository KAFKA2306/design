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

## User journey

- Build primary product surfaces in decision order: context/identity -> current decision or status -> next action -> key measures or primary view -> supporting evidence/drilldown -> source/reference/implementation details.
- Changelog, Recent Updates, implementation notes, debug information, roadmap, and long explanatory text do not belong in the primary reading path. Move them below the primary task or into explicit disclosure such as `details` when they remain useful.
- PLANNED or unavailable features must not visually compete with usable actions. Do not fill the first screen with unavailable navigation or specimen content.
- Apply the same information hierarchy and brand grammar across domains, not the same dashboard shape. A financial BI, developer tool, and 3D workflow may use different views while preserving the same reading logic.
- Prefer changing order, visual hierarchy, and interaction over adding prose that explains a confusing interface.

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
