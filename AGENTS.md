# Repository operating contract

`README.md` explains the product. `AGENTS.md` contains only durable rules for changing it. Prefer executable contracts over prose.

## Mission

Continuously improve the value delivered by the public Pages surfaces of KAFKA2306 repositories. Treat Pages as the user-facing conversion layer from repository capability to discoverable, understandable, trustworthy, actionable value, not as a documentation mirror or visual showcase.

Prioritize the repository/Page with the largest current user-value gap. Prefer changes that improve the real path from **discover → understand → inspect/compare → decide → act → return**, while removing duplicated UI authority, unnecessary interaction, maintenance cost, or production fragility.

Value innovation means increasing user value and reducing friction or delivery cost together. Do not count additional sections, components, prose, dashboards, or visual polish as progress unless they improve an observed user journey or remove a demonstrated constraint.

Before changing a consumer Page, inspect its current production surface and owner repository authority. Keep business/data/runtime ownership in that repository; centralize only reusable Web UI authority here. Completion requires production/runtime read-back when the Page is deployable. A green build or deploy alone is not proof of user value.

## Authority

1. Current explicit user direction.
2. This `AGENTS.md`.
3. Current executable code, config, tests, CI, and runtime evidence.
4. `README.md` and other durable docs.
5. Issues, PR prose, historical branches, and inference.

`main` is the only long-lived branch authority. Never promote stale prose, generated output, fixtures, or old branches above current executable evidence.

Canonical sources:
- Visual tokens: `tokens/foundation.tokens.json`.
- Cross-format semantics/provenance: `artifacts/content.schema.json`.
- Registry component source: `registry/ui/`.
- Product UI public entrypoint: `registry/ui/product-ui.tsx`; implementation stays split under `registry/ui/product/`.
- Product chart grammar: `registry/ui/product/chart.tsx`.
- User-journey vocabulary/patterns/recommendation logic: `registry/ui/product/journey.ts`.

Do not create competing authorities. Generated/installed consumer copies are not sources.

## Product contract

Optimize the user's path through **inspect → compare → decide → act → investigate**. Choose the journey pattern that fits the page; do not force one dashboard shape or reading order everywhere.

Prefer completed reusable components that own hierarchy, information order, interaction, responsive behavior, accessibility, and states. Consumers provide data and business actions rather than rebuilding the same component.

Keep changelogs, implementation/debug notes, roadmap text, and unavailable features out of the primary task path. Prefer fixing order, hierarchy, interaction, and state representation over adding prose that explains a confusing UI.

Raw telemetry remains consumer-owned. This repository may define aggregate usage semantics but must not collect or store consumer telemetry.

## Verification contract

Generation is replaceable; verified constraints are durable. Important surfaces must expose machine-testable usable, loading, empty, error, unavailable, and—where relevant—unverified states.

A build passing is not proof that the journey works. Verify the actual inspect/compare/decide/act/investigate path and downstream adoption.

When a rule can be a type, schema, test, conformance check, generated-artifact check, or deterministic verifier, implement it there instead of expanding documentation.

Synthetic fixtures are test-only. Missing canonical input, provenance, or required state must fail visibly; never manufacture plausible production truth or silently fall back.

## Change discipline

Use **DELETE > MERGE > REPLACE > ADD**. Before adding a file, abstraction, dependency, document, or rule, try to remove or consolidate an existing one.

Keep only distinct authorities:
- `README.md`: human orientation and current product surface.
- `AGENTS.md`: repository-wide change invariants.
- executable/schema/test/config sources: machine-enforced truth.
- Issues/PRs: temporary work state and acceptance criteria.

Do not duplicate versions, inventories, generated values, issue progress, or executable rules in prose. Update an existing authority instead of adding another Markdown document unless it serves a genuinely distinct durable audience or contract.

Do not commit employer, customer, internal-project, or other confidential names, values, sources, masters, images, screenshots, summaries, or derived information. Public fixtures must be synthetic/test-only.

## Completion

For a change to be complete, inspect the relevant implementation first, make the smallest coherent change, run the strongest available deterministic checks, and verify the resulting user-facing/runtime behavior when applicable. Do not report inferred or synthetic evidence as observed production behavior.

One active work item uses at most one branch. Start from current `main`; merged/closed PR branches are disposable and must not become authorities.
