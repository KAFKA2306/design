https://kafka2306.github.io/design/

# KAFKA2306/design

Canonical Web UI authority for KAFKA2306 repositories.

The public Pages surface shows the current canonical Product UI specimen. Source, contracts, and verification remain authoritative in this repository.

This repository owns reusable visual rules, UI components, interaction states, and action-based journeys. Consumer repositories own their business logic, data, deployment, and raw usage telemetry.

## Current design contract

- **Decision first:** make the next action, the reason for it, and supporting evidence easy to find. Preserve the distinction between actual, forecast, hypothesis, and unavailable or unverified information.
- **One visual authority:** change `tokens/foundation.tokens.json` and shared components here; regenerate derived CSS. Do not copy visual values or reinvent shared UI inside consumers.
- **Responsive interaction:** support keyboard and touch, visible focus, 320px reflow, and reduced motion. A coarse pointer uses the 44px touch-target token on shared controls at any viewport width; a dense desktop pointer may use the 32px control-height token.
- **State before decoration:** include usable, loading, empty, error, unavailable, and relevant unverified states. No gratuitous gradients, shadows, or information-hiding effects.
- **Verification over claims:** unit and conformance checks do not prove real-device usability or WCAG conformance. Test rendered UI, keyboard navigation, accessible names, screen-reader behavior, and device reflow before making those claims.

Current visual values are defined only in [foundation tokens](tokens/foundation.tokens.json); examples and historical concept images are not authoritative. Follow the source and verify actual rendering rather than reusing an older palette or sample.

Standards references: [Design Tokens Community Group 2025.10](https://www.designtokens.org/tr/2025.10/) (a community specification, not a W3C Recommendation); [WCAG 2.2 2.5.8 AA target-size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (24 CSS px with exceptions); [WCAG 2.2 2.5.5 AAA enhanced target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) (44 CSS px with exceptions). The 44px token is an intentional interaction guideline, not proof of AAA compliance.

## Scope

Owned here:

- visual tokens and generated foundation styles
- shared primitives and Product UI source
- chart, table, navigation, responsive, accessibility, and state grammar
- action-based user-journey patterns and recommendation contract
- cross-format semantic/content contract used by Web UI
- deterministic consumer sync and conformance checks
- synthetic reference fixtures and verification workflows

Not owned here:

- consumer-specific business or data logic
- consumer raw usage-event collection or storage
- consumer deployment/runtime authority
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
| Decision and action UI | `registry/ui/product/decision.tsx` | reference consumer + Product UI tests |
| Product chart grammar | `registry/ui/product/chart.tsx` | Product UI fixture + contract tests |
| User journey | `registry/ui/product/journey.ts` | Product UI tests + consumer aggregate inputs |
| Agent workflow | `skills/frontend-design/SKILL.md` | skill contract tests |
| Semantic/content model | `artifacts/content.schema.json` | `scripts/content-contract.mjs` + synthetic fixture |
| Consumer adoption config | `schemas/design.config.schema.json` | consumer `design.config.json` |
| Applied design state | `schemas/design.lock.schema.json` | generated consumer `design.lock.json` |
| Managed adoption | `scripts/design-sync.mjs` | `scripts/design-conformance.mjs` + reusable workflow |
| Public release boundary | `PUBLIC_RELEASE.md` | Public safety workflow |
| Reference consumer | `fixtures/registry-consumer/` | clean install/type-check/build CI |
| Repository lifecycle | `.github/workflows/` | GitHub Actions |

Edit the canonical source, then regenerate, reinstall, or sync derived output. Do not hand-edit generated or consumer-installed copies.

`AGENTS.md` contains repository operating invariants for agents and contributors.

## Development

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Runtime and dependency requirements are defined in `package.json` and `pnpm-lock.yaml`.

When visual tokens change, regenerate their derived CSS:

```bash
pnpm tokens:build
```

Validate before merge using the scripts currently defined in `package.json`. CI workflows are authoritative for required merge checks.

## Consumer adoption

A consumer owns one hand-edited `design.config.json`. Pin `designSha` to the exact 40-character commit of this repository, set the consumer CSS entry and managed directory, then run the checked-out design revision:

```bash
pnpm sync --consumer <consumer-path>
pnpm conformance --consumer <consumer-path>
```

`sync` copies canonical managed CSS, inserts one managed import block into the configured CSS entry, removes obsolete managed files recorded by the prior lock, and writes deterministic `design.lock.json` state. Running the same sync twice must produce no second diff.

`conformance` fails visibly when the immutable design pin, managed files/import block, visual authority, forbidden effects, core-component duplication, or chart ownership drifts.

For GitHub Actions, a public consumer can call the reusable conformance workflow at the same exact design SHA:

```yaml
jobs:
  design-conformance:
    uses: KAFKA2306/design/.github/workflows/conformance.yml@<full-40-character-design-sha>
```

The reusable workflow delegates to the consumer's synced portable verifier. It does not replace `design.config.json`, `design.lock.json`, or the managed sync step.

A consumer chooses from canonical action-based journey candidates rather than inheriting a domain-specific dashboard shape. It may pass structural evidence and normalized aggregate importance/frequency signals to the Product UI journey API. Raw telemetry remains in the consumer.

For recurring decision surfaces, use the canonical Product UI component instead of rebuilding its title/status/action/measure/evidence hierarchy in the consumer.

## Operational ontology

[Project ontology](ontology/project.yaml) connects canonical entities and relationships to source evidence, guarded actions and measurable outcomes under the [shared causal-evidence vocabulary](https://github.com/KAFKA2306/know/blob/main/ontology/causal-evidence-core.yaml). It documents the existing workflow's decision boundary without claiming a new execution engine or paid service.
