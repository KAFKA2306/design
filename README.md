# KAFKA2306/design

Canonical frontend visual authority for KAFKA2306 repositories.

This repository owns shared visual rules and reusable UI source. Consumer repositories own business and data logic; they consume this repository instead of creating a second visual authority.

## Scope

Owned here:

- visual tokens and generated foundation styles
- shared component and Product UI source
- chart grammar and interaction patterns
- cross-format semantic/content contract
- synthetic reference fixtures and verification workflows

Not owned here:

- consumer-specific business or data logic
- consumer-specific copies of palette, radius, shadow, or chart geometry
- confidential employer, customer, or project content

## Authority map

| Concern | Canonical source | Derived / verification |
| --- | --- | --- |
| Visual values | `tokens/foundation.tokens.json` | `styles/tokens.css` |
| Shared component styles | `styles/components.css` | reference consumer + tests |
| Registry manifest | `registry.json` | registry CI |
| UI implementation | `registry/ui/` | installed consumer copies |
| Product UI public entrypoint | `registry/ui/product-ui.tsx` | implementation under `registry/ui/product/` |
| Product chart grammar | `registry/ui/product/chart.tsx` | Product UI fixture + contract tests |
| Semantic/content model | `artifacts/content.schema.json` | `scripts/content-contract.mjs` + synthetic fixture |
| Reference consumer | `fixtures/registry-consumer/` | clean install/type-check/build CI |
| Repository lifecycle | `.github/workflows/` | GitHub Actions |

Edit the canonical source, then regenerate or reinstall derived output. Do not hand-edit generated or consumer-installed copies.

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

## Documentation rule

Keep durable architecture and authority here. Keep contributor invariants in `AGENTS.md`. Keep current work status and acceptance criteria in GitHub Issues and pull requests.

Do not copy dependency versions, registry inventories, or issue progress into prose documentation; link to the executable or structured authority instead.
