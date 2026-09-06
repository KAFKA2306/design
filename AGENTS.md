# Design Agent Contract

`AGENTS.md` is the only repository-wide agent instruction source. Tool-specific instruction files must not duplicate it.

## Mission

Improve the user-facing Pages experience across KAFKA2306 repositories while centralizing only reusable Web UI authority here. Business data and runtime ownership stay in each consumer repository.

Canonical reusable sources:
- visual tokens: `tokens/foundation.tokens.json`
- semantics/provenance: `artifacts/content.schema.json`
- reusable UI: `registry/ui/`
- public Product UI entry: `registry/ui/product-ui.tsx`

Do not create competing UI authorities or copied consumer implementations.

## Product rules

Optimize the real path from discovery through understanding, comparison, decision, action, and investigation. Prefer fixing hierarchy, interaction, state, accessibility, and component reuse over adding explanatory prose or decorative sections.

Important surfaces must represent usable, loading, empty, error, unavailable, and relevant unverified states. Synthetic fixtures are test-only and must never become production truth.

Use `DELETE > MERGE > REPLACE > ADD`. Prefer types, schemas, tests, and conformance checks over prose rules when they can enforce the contract.

## Execution and verification

- Prefer current user instruction, current production surface, current code/config/tests, then docs/history.
- Proceed with read-only and reversible work without unnecessary confirmation.
- Run the smallest meaningful deterministic checks for the changed contract.
- After those pass, broaden or repeat testing only when new changes, failures, or unresolved concerns justify it.
- A build or deploy is not proof that the user journey works. Verify the actual deploy/runtime when the requested outcome includes it.

## Completion

Use one canonical branch/PR per outcome. Re-read before writes, read back after writes, and stop when the requested user-facing state is directly verified. Unchecked layers remain `UNVERIFIED`.
