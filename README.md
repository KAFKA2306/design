https://kafka2306.github.io/design/

# KAFKA2306/design

Canonical Web UI authority for KAFKA2306 repositories.

This repository owns shared visual rules, reusable UI source, completed purpose components, interaction grammar, and canonical user-journey patterns. Consumer repositories own business logic, data logic, and raw usage telemetry; they consume this repository instead of creating a second UI authority.

## Scope

Owned here:

- visual tokens and generated foundation styles
- shared primitives and completed Product UI source
- chart, table, navigation, responsive, accessibility, and state grammar
- action-based user-journey patterns and recommendation contract
- cross-format semantic/content contract used by Web UI
- deterministic consumer sync and conformance checks
- synthetic reference fixtures and verification workflows

Not owned here:

- consumer-specific business or data logic
- consumer raw usage-event collection or storage
- consumer-specific copies of palette, radius, shadow, chart geometry, or design-owned purpose components
- PPTX / SVG / Mermaid authoring systems
- confidential employer, customer, or project content

## Authority map

| Concern | Canonical source | Derived / verification |
| --- | --- | --- |
| Visual values | `tokens/foundation.tokens.json` | `styles/tokens.css` |
| Shared component styles | `styles/components.css` | reference consumer + tests |
| Registry manifest | `registry.json` | registry CI |
| UI implementation | `registry/ui/` | installed consumer copies |
| Product UI public entrypoint | `registry/ui/product-ui.tsx` | implementation under `registry/ui/product/` |
| Completed decision UI | `registry/ui/product/decision.tsx` | reference consumer + Product UI tests |
| Product chart grammar | `registry/ui/product/chart.tsx` | Product UI fixture + contract tests |
| User journey | `registry/ui/product/journey.ts` | Product UI tests + consumer aggregate inputs |
| Agent workflow | `skills/frontend-design/SKILL.md` | skill contract tests |
| Semantic/content model | `artifacts/content.schema.json` | `scripts/content-contract.mjs` + synthetic fixture |
| Consumer adoption config | `schemas/design.config.schema.json` | consumer `design.config.json` |
| Applied design state | `schemas/design.lock.schema.json` | generated consumer `design.lock.json` |
| Managed adoption | `scripts/design-sync.mjs` | `scripts/design-conformance.mjs` + tests |
| Reference consumer | `fixtures/registry-consumer/` | clean install/type-check/build CI |
| Repository lifecycle | `.github/workflows/` | GitHub Actions |

Edit the canonical source, then regenerate, reinstall, or sync derived output. Do not hand-edit generated or consumer-installed copies.

`AGENTS.md` contains repository operating invariants for agents and contributors. It intentionally does not duplicate this overview.

## Development

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Runtime and dependency requirements are defined in `package.json` and `pnpm-lock.yaml`; they are not duplicated here.

When visual tokens change, regenerate their derived CSS first:

```bash
pnpm tokens:build
```

Validate before merge:

```bash
pnpm tokens:validate
pnpm tokens:check
pnpm content:validate
pnpm lint
pnpm test
pnpm build
```

The executable scripts in `package.json` and CI workflows are authoritative if command details change.

## Consumer adoption