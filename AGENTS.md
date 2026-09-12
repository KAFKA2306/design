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

## Product rules

Optimize the real path from discovery through understanding, comparison, decision, action, and investigation. Prefer fixing hierarchy, interaction, state, accessibility, and component reuse over adding explanatory prose or decorative sections.

Important surfaces must represent usable, loading, empty, error, unavailable, and relevant unverified states. Synthetic fixtures are test-only and must never become production truth.

Prefer types, schemas, tests, and conformance checks over prose when they can enforce the contract.

## Runtime boundary

A build or deploy is not evidence that the user journey works. When the requested outcome includes a rendered or deployed UI, verify the resulting surface directly. Unchecked layers remain `UNVERIFIED`.
