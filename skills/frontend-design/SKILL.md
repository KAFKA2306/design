# Frontend design

Use this skill when a KAFKA2306 consumer repository needs a Web UI review, adoption, or structural improvement.

## Canonical inputs

Read these authorities instead of copying their values or APIs into this skill:

- `README.md` — repository scope and authority map
- `AGENTS.md` — durable change-time and user-journey invariants
- `registry.json` — installable UI source
- `registry/ui/product-ui.tsx` — public Product UI entrypoint
- `registry/ui/product/journey.ts` — action vocabulary, candidate patterns, and ranking contract
- `schemas/design.config.schema.json` and `schemas/design.lock.schema.json` — adoption contract
- `package.json` and `.github/workflows/` — executable validation and lifecycle authority

## Workflow

1. Inspect the consumer's actual primary surfaces, navigation, data shown, available actions, transitions, and current design ownership. Do not infer unseen UI from README prose.
2. Express the user task with the canonical journey actions and supply explicit structural evidence. Add declared, consumer-provided, or observed aggregate importance/frequency when available. Keep raw telemetry in the consumer.
3. Use the canonical journey recommender to produce candidate patterns. Treat the result as a shortlist; the consumer selects the pattern that best fits its purpose.
4. Prefer Product UI completed components and shared primitives before adding consumer-local UI. If an existing purpose component fits, provide business data and actions to it instead of rebuilding its hierarchy.
5. Remove obsolete consumer-local visual authority before adding anything. Do not preserve duplicate palette, radius, shadow, chart geometry, or design-owned purpose components.
6. Adopt the exact design revision through the canonical config/sync path. Use the commands and arguments currently defined by `package.json` and `README.md`; do not duplicate them here.
7. Run the repository's canonical conformance, tests, build, and any available browser checks. A failure in canonical input or managed state is an error, not a reason to silently fall back.
8. Read the resulting consumer surface again. Verify that the main task is easier to identify and complete, that unavailable or implementation-only content does not dominate, and that no second UI authority was introduced.

## Boundaries

- This skill covers Web UI only. Non-Web presentation authoring is outside this repository.
- Consumer business logic, data logic, and raw usage-event storage remain consumer-owned.
- Do not add a domain taxonomy as a second journey authority.
- Do not copy token values, dependency versions, component signatures, registry inventories, or current issue status into this file.
- Keep this file procedural. Durable architecture belongs in `README.md`; contributor invariants belong in `AGENTS.md`; current work belongs in Issues and pull requests.
