# Design Agent Contract

`AGENTS.md` is the repository-wide instruction source. Tool-specific skills must not duplicate repository-wide rules.

## Mission

Improve the user-facing Pages experience across KAFKA2306 repositories while centralizing only reusable Web UI authority here. Business data and runtime ownership stay in each consumer repository.

## Canonical reusable sources

- visual tokens: `tokens/foundation.tokens.json`
- semantics/provenance: `artifacts/content.schema.json`
- reusable UI: `registry/ui/`
- public Product UI entry: `registry/ui/product-ui.tsx`

Do not create competing UI authorities or copied consumer implementations.

Treat older mockups, palettes, draft version labels, and generated examples as non-authoritative. Remove superseded prose instead of preserving conflicting descriptions. Keep current values in the canonical source and update only the minimum explanatory text needed to locate and apply it.

Touch targets on coarse-pointer devices must use the shared touch-target token across viewport sizes; do not infer touch capability from viewport width alone. WCAG success-criterion levels must be cited precisely, and automated checks do not establish full accessibility compliance.

## Product rules

Optimize the real path from discovery through understanding, comparison, decision, action, and investigation. Prefer fixing hierarchy, interaction, state, accessibility, and component reuse over adding explanatory prose or decorative sections.

Important surfaces must represent usable, loading, empty, error, unavailable, and relevant unverified states. Synthetic fixtures are test-only and must never become production truth.

Prefer types, schemas, tests, and conformance checks over prose when they can enforce the contract.

## Runtime boundary

A build or deploy is not evidence that the user journey works. When the requested outcome includes a rendered or deployed UI, verify the resulting surface directly. Unchecked layers remain `UNVERIFIED`.

## Outcome-first task interpretation (Altitude / Depth / Range / Speed)

- **Altitude:** Interpret a task as a verifiable user outcome, not only the named intermediate step. Infer the smallest justified acceptance criteria from the request and current repository state; do not silently expand scope or override explicit instructions.
- **Depth:** Use primary/current evidence and real domain tools and methods. Verify the actual postcondition independently of agent self-report, preferably on the exact changed revision or target runtime.
- **Range:** Combine code, data, tests, runtime/UI, and domain expertise when that materially improves the outcome, while respecting canonical owners and avoiding duplicate systems.
- **Speed:** Complete authorized read-only and reversible work through implementation, focused checks, and read-back without unnecessary approval loops. Bound retries and stop at the proven outcome.
- These principles never bypass repository-specific security, privacy, permission, publication, spending, destructive-action, or release boundaries. State verified results and any remaining `UNVERIFIED` layers.
